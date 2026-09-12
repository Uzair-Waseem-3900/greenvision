// All data below is static demo content for prototype/demo purposes only.

export const dashboardStats = {
  treesMonitored: 214,
  imagesAnalyzed: 587,
  healthy: 132,
  mildStress: 61,
  highStress: 21,
  parksCovered: 6,
};

export const healthTrend = [
  { month: "Apr", healthy: 96, mild: 40, high: 18 },
  { month: "May", healthy: 104, mild: 46, high: 20 },
  { month: "Jun", healthy: 118, mild: 50, high: 24 },
  { month: "Jul", healthy: 121, mild: 58, high: 27 },
  { month: "Aug", healthy: 127, mild: 55, high: 23 },
  { month: "Sep", healthy: 132, mild: 61, high: 21 },
];

export const parks = [
  { id: "p1", name: "Riverside Commons", trees: 58, lat: 24.2, lng: 55.1, status: "mild" },
  { id: "p2", name: "Old Mill Grove", trees: 41, lat: 24.4, lng: 55.3, status: "healthy" },
  { id: "p3", name: "Cedar Ridge Park", trees: 37, lat: 24.6, lng: 55.0, status: "high" },
  { id: "p4", name: "Willow Creek Trail", trees: 29, lat: 24.3, lng: 54.9, status: "healthy" },
  { id: "p5", name: "Founders Square Green", trees: 22, lat: 24.5, lng: 55.2, status: "mild" },
  { id: "p6", name: "Maple Hollow Reserve", trees: 27, lat: 24.7, lng: 55.4, status: "healthy" },
];

export const recentScans = [
  { id: "s1", tree: "White Oak #114", park: "Riverside Commons", status: "healthy", confidence: 94, time: "2h ago" },
  { id: "s2", tree: "Red Maple #087", park: "Cedar Ridge Park", status: "high", confidence: 88, time: "5h ago" },
  { id: "s3", tree: "Silver Birch #203", park: "Founders Square Green", status: "mild", confidence: 82, time: "1d ago" },
  { id: "s4", tree: "Sugar Maple #041", park: "Old Mill Grove", status: "healthy", confidence: 96, time: "1d ago" },
  { id: "s5", tree: "Weeping Willow #019", park: "Willow Creek Trail", status: "mild", confidence: 79, time: "2d ago" },
];

// Preset AI outcomes — the demo randomly serves one of these regardless of
// the uploaded photo, so reviewers can see the full range of the product.
export const analysisOutcomes = [
  {
    id: "healthy-01",
    status: "Healthy",
    level: "healthy",
    issue: "No significant stress detected",
    detail:
      "Leaf color, canopy density, and vein structure fall within normal range for this species and season.",
    action: "Continue standard watering and seasonal pruning schedule.",
    confidence: 96,
    metrics: { canopyDensity: 91, leafColorIndex: 88, symmetry: 94 },
  },
  {
    id: "mild-01",
    status: "Moderate Stress",
    level: "mild",
    issue: "Leaf discoloration",
    detail:
      "Yellowing detected along leaf margins, consistent with early nutrient deficiency or inconsistent watering.",
    action: "Check watering schedule and inspect leaves for nutrient or pest symptoms.",
    confidence: 82,
    metrics: { canopyDensity: 74, leafColorIndex: 61, symmetry: 80 },
  },
  {
    id: "mild-02",
    status: "Moderate Stress",
    level: "mild",
    issue: "Early sign of leaf curl",
    detail:
      "Slight curling at leaf edges detected, often linked to heat stress or minor water deficit.",
    action: "Increase watering frequency during peak heat and monitor over the next 7 days.",
    confidence: 77,
    metrics: { canopyDensity: 70, leafColorIndex: 68, symmetry: 75 },
  },
  {
    id: "high-01",
    status: "High Stress",
    level: "high",
    issue: "Possible pest infestation",
    detail:
      "Irregular leaf perforation and clustered spotting patterns suggest active pest activity on the canopy.",
    action: "Schedule an in-person inspection within 48 hours and isolate from nearby healthy trees.",
    confidence: 89,
    metrics: { canopyDensity: 52, leafColorIndex: 45, symmetry: 58 },
  },
  {
    id: "high-02",
    status: "High Stress",
    level: "high",
    issue: "Severe canopy thinning",
    detail:
      "Significant reduction in leaf density compared to species baseline, indicating advanced stress or root damage.",
    action: "Flag for arborist review and check surrounding soil compaction and drainage.",
    confidence: 91,
    metrics: { canopyDensity: 38, leafColorIndex: 50, symmetry: 49 },
  },
];

export const statusMeta = {
  healthy: { label: "Healthy", color: "var(--moss)", bg: "rgba(143,203,110,0.12)" },
  mild: { label: "Mild Stress", color: "var(--amber)", bg: "rgba(227,168,87,0.12)" },
  high: { label: "High Stress", color: "var(--clay)", bg: "rgba(209,106,74,0.12)" },
};
