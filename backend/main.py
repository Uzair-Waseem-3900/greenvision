"""
Entry point. Run with:

    uvicorn main:app --reload

or simply:

    python main.py
"""
import uvicorn

from app.factory import create_app

app = create_app()

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
