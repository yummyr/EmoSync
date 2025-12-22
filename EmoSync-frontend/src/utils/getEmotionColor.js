/**
 * Generate deterministic color from string
 * Same input => same color forever
 */
 const getEmotionColor = (emotion) => {
  if (!emotion) return "#A9A9A9";

  let hash = 0;
  for (let i = 0; i < emotion.length; i++) {
    hash = emotion.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Hue: 0 - 360
  const hue = Math.abs(hash) % 360;

  // Fixed saturation & lightness for UI friendliness
  const saturation = 80;
  const lightness = 40 + (Math.abs(hash) % 33);

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
export default getEmotionColor;