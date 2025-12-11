import React, { useEffect, useState } from "react";
import api from "@/api";

export default function HistoryModal({ open, onClose }) {
  const [list, setList] = useState([]);

  useEffect(() => {
    if (open) load();
  }, [open]);

  const load = async () => {
    const res = await api.get({ page: 1, size: 20 });
    setList(res.data.data.records || []);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-[90%] max-w-2xl">
        <h3 className="text-xl font-semibold mb-4">Emotion Diary History</h3>

        <div className="space-y-3 max-h-[60vh] overflow-auto">
          {list.map((item) => (
            <div key={item.id} className="border p-3 rounded-lg">
              <p className="font-semibold">{item.diaryDate}</p>
              <p className="text-gray-600 text-sm">{item.dominantEmotion}</p>
            </div>
          ))}
        </div>

        <button
          className="mt-4 bg-gray-700 text-white px-4 py-2 rounded-lg"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}
