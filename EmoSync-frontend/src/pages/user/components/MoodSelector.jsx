export default function MoodSelector({ value, onChange }) {
  const moodDescriptions = {
    1: "Very Bad",
    2: "Bad",
    3: "Poor",
    4: "Below Average",
    5: "Neutral",
    6: "Okay",
    7: "Good",
    8: "Very Good",
    9: "Great",
    10: "Excellent",
  };

  // Gradient style colors matching Vue version
  const colors = {
    1: "bg-[#F87171]", // red
    2: "bg-[#FB923C]",
    3: "bg-[#FBBF24]",
    4: "bg-[#FACC15]",
    5: "bg-[#EAB308]",
    6: "bg-[#A3E635]",
    7: "bg-[#84CC16]",
    8: "bg-[#4ADE80]",
    9: "bg-[#22C55E]",
    10: "bg-[#16A34A]",
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-3">
        <span className="text-gray-400 text-sm w-16 text-right">Very Bad</span>

        {[1,2,3,4,5,6,7,8,9,10].map((score) => {
          const isSelected = value === score;

          return (
            <button
              key={score}
              onClick={() => onChange(score)}
              className={`
                w-12 h-12 rounded-full flex items-center justify-center font-bold text-white
                transition-all duration-300 cursor-pointer shadow-sm
                ${colors[score]}

                ${isSelected 
                  ? "scale-125 shadow-xl ring-4 ring-green-300"
                  : "hover:scale-110 hover:shadow-md"
                }
              `}
            >
              {score}
            </button>
          );
        })}

        <span className="text-gray-400 text-sm w-16">Excellent</span>
      </div>

      {/* Display selected score */}
      {value && (
        <div className="mt-3 text-green-600 font-semibold text-center">
          Selected: {value} - {moodDescriptions[value]}
        </div>
      )}
    </div>
  );
}
