export default function AiRiskLevel({ level }) {
  const levels = {
    0: { text: "Normal", color: "bg-green-100 text-green-700" },
    1: { text: "Attention", color: "bg-yellow-100 text-yellow-700" },
    2: { text: "Warning", color: "bg-orange-100 text-orange-700" },
    3: { text: "Crisis", color: "bg-red-100 text-red-700" }
  };

  const info = levels[level] || levels[0];

  return (
    <span className={`px-3 py-1 rounded text-sm font-semibold ${info.color}`}>
      {info.text}
    </span>
  );
}
