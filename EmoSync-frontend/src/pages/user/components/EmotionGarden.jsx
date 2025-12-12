import React from "react";

const emotions = [
  { name: "Happy", icon: "😄", color: "#FBBF24" },
  { name: "Calm", icon: "😌", color: "#60A5FA" },
  { name: "Anxious", icon: "😰", color: "#EF4444" },
  { name: "Sad", icon: "😢", color: "#6B7280" },
  { name: "Excited", icon: "🤩", color: "#10B981" },
  { name: "Tired", icon: "😪", color: "#8B5CF6" },
  { name: "Surprised", icon: "😲", color: "#F59E0B" },
  { name: "Confused", icon: "😕", color: "#64748B" }
];

export default function EmotionGrid({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {emotions.map((e) => {
        const selected = value === e.name;
        return (
          <div
            key={e.name}
            onClick={() => onChange(e.name)}
            className={`
              cursor-pointer rounded-xl border p-4 text-center transition-all duration-300
              bg-gray-50 hover:-translate-y-1 hover:shadow-lg
              ${selected ? "border-green-500 bg-green-50 shadow-green-200 shadow-md" : "border-gray-200"}
            `}
          >
            <div className="text-3xl mb-1" style={{ color: e.color }}>
              {e.icon}
            </div>
            <div className="font-semibold text-gray-700">{e.name}</div>
          </div>
        );
      })}
    </div>
  );
}
