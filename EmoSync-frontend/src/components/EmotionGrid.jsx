const emotions = [
  { name: "Happy", color: "#FBBF24" },
  { name: "Calm", color: "#60A5FA" },
  { name: "Anxious", color: "#EF4444" },
  { name: "Sad", color: "#6B7280" },
  { name: "Excited", color: "#10B981" },
  { name: "Tired", color: "#8B5CF6" },
  { name: "Surprised", color: "#F59E0B" },
  { name: "Confused", color: "#64748B" }
];

export default function EmotionGrid({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {emotions.map((e) => (
        <div
          key={e.name}
          onClick={() => onChange(e.name)}
          className={`p-4 rounded-lg cursor-pointer border text-center
            ${value === e.name ? "border-green-500 bg-green-50" : "border-gray-200 bg-gray-50"}
          `}
        >
          <div className="font-semibold" style={{ color: e.color }}>
            {e.name}
          </div>
        </div>
      ))}
    </div>
  );
}
