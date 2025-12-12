
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLaugh,
  faSmile,
  faFrown,
  faSadTear,
  faGrinBeam,
  faTired,
  faSurprise,
  faMeh,
 
 } from "@fortawesome/free-solid-svg-icons";
const emotions = [
  { name: "Happy", color: "#FBBF24", icon: faLaugh },
  { name: "Calm", color: "#60A5FA", icon: faSmile },
  { name: "Anxious", color: "#EF4444", icon: faFrown },
  { name: "Sad", color: "#6B7280", icon: faSadTear },
  { name: "Excited", color: "#10B981", icon: faGrinBeam },
  { name: "Tired", color: "#8B5CF6", icon: faTired },
  { name: "Surprised", color: "#F59E0B" ,icon: faSurprise},
  { name: "Confused", color: "#64748B" ,icon: faMeh},
];

export default function EmotionGrid({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {emotions.map((e) => (
        <div
          key={e.name}
          onClick={() => onChange(e.name)}
          className={`rounded-lg cursor-pointer border flex flex-col items-center justify-center transition-all duration-300 ease-out hover:scale-110 hover:-translate-y-2 hover:translate-x-2 hover:shadow-lg hover:z-10 relative
            ${value === e.name ? "border-green-500 bg-green-50" : "border-gray-200 bg-gray-50 hover:bg-white"}
          `}
        >
          <div className="flex flex-col items-center justify-center py-4 space-y-1">
            <FontAwesomeIcon
              icon={e.icon}
              className="text-3xl"
              style={{ color: e.color }}
            />
            <span
              className="text-xs font-medium text-center leading-tight"
              style={{ color: e.color }}
            >
              {e.name}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
