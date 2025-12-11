export default function MoodSelector({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      {[1,2,3,4,5,6,7,8,9,10].map((score) => (
        <button
          key={score}
          onClick={() => onChange(score)}
          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold
            ${value === score ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700"}
          `}
        >
          {score}
        </button>
      ))}
    </div>
  );
}
