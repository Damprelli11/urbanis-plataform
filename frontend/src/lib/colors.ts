/**
 * Perceptually uniform Viridis color scale interpolation.
 * Optimized for the UrbanScore range (roughly 10 to 75) to match the Python print.
 */
export function getUrbanScoreColor(score: number): string {
  // We map the range [10, 75] to the full [0, 1] Viridis spectrum
  // to ensure maximum color variation and match the Python legend intensity.
  const minScore = 10;
  const maxScore = 75;
  const t = Math.max(0, Math.min(1, (score - minScore) / (maxScore - minScore)));

  // Red-Yellow-Green semantic color map points
  const colors = [
    { r: 220, g: 38, b: 38 },    // 0% - Red (Crítico)
    { r: 239, g: 68, b: 68 },    // 10%
    { r: 249, g: 115, b: 22 },   // 20% - Orange (Atenção Baixa)
    { r: 245, g: 158, b: 11 },   // 30% - Amber
    { r: 234, g: 179, b: 8 },    // 40% - Yellow (Moderado/Regular)
    { r: 163, g: 230, b: 53 },   // 50% - Lime
    { r: 74, g: 222, b: 128 },   // 60% - Light Green (Bom)
    { r: 34, g: 197, b: 94 },    // 70% - Green
    { r: 22, g: 163, b: 74 },    // 80% - Emerald (Muito Bom)
    { r: 21, g: 128, b: 61 }     // 100% - Dark Green (Ideal)
  ];

  const count = colors.length - 1;
  const index = Math.min(Math.floor(t * count), count - 1);
  const localT = (t * count) - index;

  const c1 = colors[index];
  const c2 = colors[index + 1];

  const r = Math.round(c1.r + localT * (c2.r - c1.r));
  const g = Math.round(c1.g + localT * (c2.g - c1.g));
  const b = Math.round(c1.b + localT * (c2.b - c1.b));

  return `rgb(${r}, ${g}, ${b})`;
}
