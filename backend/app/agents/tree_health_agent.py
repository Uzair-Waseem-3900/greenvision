"""
LangGraph agent: observe -> diagnose -> recommend -> assemble.

Each step calls Gemini with a schema-bound structured output
(`with_structured_output`), so the model literally cannot return a field
outside the allowed values — invalid output raises inside the LLM call.

Resilience against Gemini's two common transient failures:
  - 429 RESOURCE_EXHAUSTED (quota/rate limit)
  - 503 UNAVAILABLE (model overloaded)
When either happens on the primary model (gemini-2.5-flash), the SAME node
immediately retries once against the lighter fallback model
(gemini-2.5-flash-lite) before giving up. Only if the fallback model also
fails does the error propagate up to the API layer and, from there, to the
frontend. Any other kind of failure (validation errors, network hiccups,
etc.) is instead handled by `run_tree_health_agent`'s outer whole-pipeline
retry loop.
"""
import logging

from google.api_core import exceptions as google_exceptions
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import END, StateGraph
from pydantic import BaseModel

from app.agents.prompts import (
    DIAGNOSE_SYSTEM_PROMPT,
    OBSERVE_SYSTEM_PROMPT,
    RECOMMEND_SYSTEM_PROMPT,
)
from app.agents.state import AgentState, DiagnosisResult, ObservationResult, RecommendationResult
from app.core.config import settings
from app.core.exceptions import UpstreamServiceError
from app.schemas.ai_analysis import AIAnalysisResult

logger = logging.getLogger(__name__)

# HTTP status codes Gemini uses for "try again" conditions.
_RETRYABLE_STATUS_CODES = {429, 503}


def _is_retryable_llm_error(exc: Exception) -> bool:
    """True for Gemini quota (429) / overload (503) errors specifically."""
    code = getattr(exc, "code", None)
    if isinstance(code, int) and code in _RETRYABLE_STATUS_CODES:
        return True
    if isinstance(exc, (google_exceptions.ResourceExhausted, google_exceptions.ServiceUnavailable)):
        return True
    # Fallback: some transports surface the status only in the message.
    message = str(exc)
    return any(marker in message for marker in ("429", "503", "RESOURCE_EXHAUSTED", "UNAVAILABLE"))


def _build_llm(model_name: str):
    return ChatGoogleGenerativeAI(
        model=model_name,
        google_api_key=settings.GEMINI_API_KEY,
        temperature=0.2,
        timeout=settings.AGENT_REQUEST_TIMEOUT_SECONDS,
    )


async def _invoke_structured(
    schema: type[BaseModel],
    messages: list,
    *,
    model_name: str | None = None,
    _is_fallback_attempt: bool = False,
):
    """
    Calls Gemini with structured output. On a 429/503 from the primary
    model, immediately retries once against GEMINI_FALLBACK_MODEL. If that
    also fails with a retryable error, raises UpstreamServiceError with a
    clear, user-facing message — this is the point at which the frontend
    is meant to see an error.
    """
    model_name = model_name or settings.GEMINI_MODEL
    llm = _build_llm(model_name).with_structured_output(schema)

    try:
        return await llm.ainvoke(messages)
    except Exception as exc:  # noqa: BLE001 - broad on purpose, classified below
        if _is_retryable_llm_error(exc):
            if not _is_fallback_attempt:
                logger.warning(
                    "Gemini model '%s' returned a retryable error (%s). "
                    "Retrying immediately with fallback model '%s'.",
                    model_name,
                    exc,
                    settings.GEMINI_FALLBACK_MODEL,
                )
                return await _invoke_structured(
                    schema,
                    messages,
                    model_name=settings.GEMINI_FALLBACK_MODEL,
                    _is_fallback_attempt=True,
                )

            logger.error(
                "Fallback model '%s' also returned a retryable error: %s",
                settings.GEMINI_FALLBACK_MODEL,
                exc,
            )
            raise UpstreamServiceError(
                "The AI service is currently overloaded or rate-limited "
                "(Gemini returned a 429/503). Please try again in a moment."
            ) from exc

        # Not a quota/overload error — let the outer pipeline retry handle it.
        raise


async def _observe_node(state: AgentState) -> AgentState:
    message = HumanMessage(
        content=[
            {"type": "text", "text": "Observe this tree/plant photo."},
            {
                "type": "image_url",
                "image_url": f"data:{state['mime_type']};base64,{state['image_base64']}",
            },
        ]
    )
    observation: ObservationResult = await _invoke_structured(
        ObservationResult, [SystemMessage(content=OBSERVE_SYSTEM_PROMPT), message]
    )
    return {"observation": observation}


async def _diagnose_node(state: AgentState) -> AgentState:
    observation = state["observation"]

    if not observation.image_shows_plant:
        # Deterministic, still schema-valid fallback — no LLM call needed.
        diagnosis = DiagnosisResult(
            level="mild",
            status="Moderate Stress",
            issue="Could not clearly identify a tree or plant",
            detail=(
                "The uploaded photo does not clearly show a tree or plant, "
                "so a reliable assessment could not be made."
            ),
            confidence=20,
            metrics={"canopy_density": 0, "leaf_color_index": 0, "symmetry": 0},
        )
        return {"diagnosis": diagnosis}

    prompt = (
        f"Species guess: {observation.species_guess}\n"
        f"Canopy description: {observation.canopy_description}\n"
        f"Visible symptoms: {', '.join(observation.visible_symptoms) or 'none noted'}\n\n"
        "Produce a health diagnosis based on this observation."
    )
    diagnosis: DiagnosisResult = await _invoke_structured(
        DiagnosisResult, [SystemMessage(content=DIAGNOSE_SYSTEM_PROMPT), HumanMessage(content=prompt)]
    )
    return {"diagnosis": diagnosis}


async def _recommend_node(state: AgentState) -> AgentState:
    diagnosis = state["diagnosis"]

    prompt = (
        f"Status: {diagnosis.status}\nIssue: {diagnosis.issue}\nDetail: {diagnosis.detail}\n\n"
        "Recommend one concrete action."
    )
    rec: RecommendationResult = await _invoke_structured(
        RecommendationResult, [SystemMessage(content=RECOMMEND_SYSTEM_PROMPT), HumanMessage(content=prompt)]
    )
    return {"action": rec.action}


async def _assemble_node(state: AgentState) -> AgentState:
    diagnosis = state["diagnosis"]
    result = AIAnalysisResult(
        status=diagnosis.status,
        level=diagnosis.level,
        issue=diagnosis.issue,
        detail=diagnosis.detail,
        action=state["action"],
        confidence=diagnosis.confidence,
        metrics=diagnosis.metrics,
    )
    return {"result": result}


def _build_graph():
    graph = StateGraph(AgentState)
    graph.add_node("observe", _observe_node)
    graph.add_node("diagnose", _diagnose_node)
    graph.add_node("recommend", _recommend_node)
    graph.add_node("assemble", _assemble_node)

    graph.set_entry_point("observe")
    graph.add_edge("observe", "diagnose")
    graph.add_edge("diagnose", "recommend")
    graph.add_edge("recommend", "assemble")
    graph.add_edge("assemble", END)

    return graph.compile()


_compiled_graph = None


def _get_graph():
    global _compiled_graph
    if _compiled_graph is None:
        _compiled_graph = _build_graph()
    return _compiled_graph


async def run_tree_health_agent(image_base64: str, mime_type: str) -> AIAnalysisResult:
    """
    Runs the full observe -> diagnose -> recommend pipeline and returns a
    validated AIAnalysisResult.

    - A 429/503 from Gemini is handled inline per-call (see
      `_invoke_structured`): primary model -> fallback model -> error.
      Once that error surfaces here as an UpstreamServiceError, it is
      raised immediately with no further whole-pipeline retries, since
      both models have already been tried.
    - Any other exception (validation failure, transient network error,
      etc.) retries the whole pipeline up to settings.AGENT_MAX_RETRIES
      additional times before giving up.
    """
    graph = _get_graph()
    last_error: Exception | None = None

    for attempt in range(1, settings.AGENT_MAX_RETRIES + 2):
        try:
            final_state = await graph.ainvoke(
                {"image_base64": image_base64, "mime_type": mime_type}
            )
            return final_state["result"]
        except UpstreamServiceError:
            # Both the primary and fallback Gemini models already failed
            # for this call — no point retrying the whole pipeline again.
            raise
        except Exception as exc:  # noqa: BLE001 - broad on purpose, includes validation errors
            last_error = exc
            logger.warning("Tree health agent attempt %s failed: %s", attempt, exc)

    raise UpstreamServiceError(
        f"AI analysis failed after {settings.AGENT_MAX_RETRIES + 1} attempts: {last_error}"
    )
