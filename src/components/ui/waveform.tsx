// Rounded so server and client render identical strings (unrounded trig output can differ in the last digits and break hydration).
const waveBars = Array.from({ length: 53 }, (_, i) => ({
  height: `${(12 + Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.37)) * 67 + (i > 18 && i < 35 ? 20 : 0)).toFixed(2)}%`,
  animationDelay: `${(i * 0.047).toFixed(3)}s`,
}));

export function Waveform({
  active = false,
  light = false,
}: {
  active?: boolean;
  light?: boolean;
}) {
  return (
    <div
      className={`waveform ${active ? "wave-active" : ""} ${light ? "wave-light" : ""}`}
      aria-hidden="true"
    >
      {waveBars.map((style, i) => (
        <i key={i} style={style} />
      ))}
    </div>
  );
}
