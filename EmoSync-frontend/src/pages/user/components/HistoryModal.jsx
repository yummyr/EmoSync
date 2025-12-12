import React, { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import api from "@/api";

const EMOTIONS = [
  "Happy", "Calm", "Anxious", "Sad",
  "Excited", "Tired", "Surprised", "Confused"
];

export default function HistoryModal({ open, onClose }) {
  const [records, setRecords] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [emotionFilter, setEmotionFilter] = useState("");
  const [page, setPage] = useState({ current: 1, size: 10, total: 0 });

  useEffect(() => {
    if (open) loadData();
  }, [open, page.current, page.size, emotionFilter, dateRange]);

  const loadData = async () => {
    const params = {
      current: page.current,
      size: page.size,
      dominantEmotion: emotionFilter || null,
      startDate: dateRange[0],
      endDate: dateRange[1]
    };

    const res = await api.get("/emotion-diary/page", { params });
    const data = res.data.data;

    setRecords(data.records);
    setPage((prev) => ({ ...prev, total: data.total }));
  };

  return (
    <Dialog open={open} onClose={onClose} className="fixed inset-0 z-40">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true"></div>

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-xl w-full max-w-5xl p-6 shadow-2xl">

          <Dialog.Title className="text-2xl font-bold mb-4">
            Emotion Diary History
          </Dialog.Title>

          {/* Filters */}
          <div className="flex gap-4 mb-4">
            {/* Date Range */}
            <input
              type="date"
              className="border p-2 rounded"
              value={dateRange[0] || ""}
              onChange={(e) => setDateRange([e.target.value, dateRange[1]])}
            />
            <input
              type="date"
              className="border p-2 rounded"
              value={dateRange[1] || ""}
              onChange={(e) => setDateRange([dateRange[0], e.target.value])}
            />

            {/* Emotion Filter */}
            <select
              className="border p-2 rounded"
              value={emotionFilter}
              onChange={(e) => setEmotionFilter(e.target.value)}
            >
              <option value="">All Emotions</option>
              {EMOTIONS.map((em) => (
                <option key={em}>{em}</option>
              ))}
            </select>
          </div>

          {/* History List */}
          <div className="max-h-[60vh] overflow-y-auto space-y-3">
            {records.map((item) => (
              <div
                key={item.id}
                className="border rounded-lg p-4 grid grid-cols-5 gap-3 hover:border-green-400 transition"
              >
                <div className="font-bold text-gray-800">{item.diaryDate}</div>

                <div className="flex flex-col items-center">
                  <span className="text-green-600 text-lg font-bold">{item.moodScore}</span>
                  <span className="text-xs text-gray-500">{item.dominantEmotion}</span>
                </div>

                <div className="truncate text-gray-600 text-sm">
                  {item.diaryContentPreview || "No content"}
                </div>

                {/* AI Analysis Status */}
                <div className="flex items-center justify-center">
                  {item.aiAnalysisStatus === "PENDING" && (
                    <span className="text-yellow-600 text-sm bg-yellow-100 px-2 py-1 rounded">
                      ⏳ Pending
                    </span>
                  )}
                  {item.aiAnalysisStatus === "COMPLETED" && (
                    <span className="text-green-600 text-sm bg-green-100 px-2 py-1 rounded">
                      ✔ Completed
                    </span>
                  )}
                  {item.aiAnalysisStatus === "FAILED" && (
                    <span className="text-red-600 text-sm bg-red-100 px-2 py-1 rounded">
                      ❌ Failed
                    </span>
                  )}
                  {!item.aiAnalysisStatus && (
                    <span className="text-gray-500 text-sm bg-gray-100 px-2 py-1 rounded">
                      — No Analysis —
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button className="text-blue-600 hover:underline">View</button>
                  <button className="text-yellow-600 hover:underline">Edit</button>
                  <button className="text-red-600 hover:underline">Delete</button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <div>{page.total} records</div>

            <div className="flex items-center gap-2">
              <button
                disabled={page.current === 1}
                onClick={() => setPage({ ...page, current: page.current - 1 })}
              >
                Prev
              </button>

              <span className="px-2 font-bold">{page.current}</span>

              <button
                disabled={page.current * page.size >= page.total}
                onClick={() => setPage({ ...page, current: page.current + 1 })}
              >
                Next
              </button>
            </div>
          </div>

        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
