import React, { useEffect, useMemo, useState } from "react";
import { Dialog } from "@headlessui/react";
import api from "@/api";

const EMOTIONS = [
  "Happy",
  "Calm",
  "Anxious",
  "Sad",
  "Excited",
  "Tired",
  "Surprised",
  "Confused",
];

const INIT_DETAILS = {
  id: null,
  userId: null,
  userNickname: null,
  username: null,
  nickname: null,

  diaryDate: null,
  moodScore: null,
  moodScoreDesc: null,
  dominantEmotion: null,
  emotionTriggers: null,
  diaryContent: null,
  diaryContentPreview: null,

  sleepQuality: null,
  sleepQualityDesc: null,
  stressLevel: null,
  stressLevelDesc: null,

  createdAt: null,
  updatedAt: null,

  isPositiveMood: null,
  isNegativeMood: null,

  aiEmotionAnalysis: null,
  aiAnalysisUpdatedAt: null,
  hasAiEmotionAnalysis: null,
  aiAnalysisStatus: null,
};

export default function HistoryModal({ open, onClose }) {
  const [records, setRecords] = useState([]);
  const [dateRange, setDateRange] = useState(["", ""]);
  const [emotionFilter, setEmotionFilter] = useState("");
  const [page, setPage] = useState({ current: 1, size: 10, total: 0 });

  // Details modal state
  const [showDiaryModal, setShowDiaryModal] = useState(false);
  const [mode, setMode] = useState("view"); // "view" | "edit"
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [saving, setSaving] = useState(false);

  const [details, setDetails] = useState(INIT_DETAILS);

  const formatDateTime = (v) => {
    if (!v) return "-";
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return String(v);
    return d.toLocaleString();
  };

  const isEditable = mode === "edit";

  const updatePayload = useMemo(() => {
    return {
      id: details.id,
      moodScore:
        details.moodScore === "" || details.moodScore === null
          ? null
          : Number(details.moodScore),
      dominantEmotion: details.dominantEmotion || null,
      emotionTriggers: details.emotionTriggers || null,
      diaryContent: details.diaryContent || null,
      sleepQuality:
        details.sleepQuality === "" || details.sleepQuality === null
          ? null
          : Number(details.sleepQuality),
      stressLevel:
        details.stressLevel === "" || details.stressLevel === null
          ? null
          : Number(details.stressLevel),
    };
  }, [details]);

  const validateUpdatePayload = (p) => {
    if (!p.id) return "Invalid diary id";
    if (p.moodScore != null && (p.moodScore < 1 || p.moodScore > 10))
      return "Mood score must be 1-10";
    if (p.sleepQuality != null && (p.sleepQuality < 1 || p.sleepQuality > 5))
      return "Sleep quality must be 1-5";
    if (p.stressLevel != null && (p.stressLevel < 1 || p.stressLevel > 5))
      return "Stress level must be 1-5";
    if (p.dominantEmotion && p.dominantEmotion.length > 50)
      return "Dominant emotion length cannot exceed 50";
    if (p.emotionTriggers && p.emotionTriggers.length > 1000)
      return "Emotion triggers length cannot exceed 1000";
    if (p.diaryContent && p.diaryContent.length > 2000)
      return "Diary content length cannot exceed 2000";
    return null;
  };

  useEffect(() => {
    if (!open) return;
    loadData();
  }, [
    open,
    page.current,
    page.size,
    emotionFilter,
    dateRange[0],
    dateRange[1],
  ]);

  const loadData = async () => {
    try {
      const params = {
        current: page.current,
        size: page.size,
        dominantEmotion: emotionFilter || null,
        startDate: dateRange[0] || null,
        endDate: dateRange[1] || null,
      };
      const res = await api.get("/emotion-diary/page", { params });
      const data = res?.data?.data;

      setRecords(data?.records || []);
      setPage((prev) => ({ ...prev, total: data?.total || 0 }));
    } catch (e) {
      console.error("Failed to load diary page:", e);
      setRecords([]);
      setPage((prev) => ({ ...prev, total: 0 }));
    }
  };

  const openDetails = async (id, nextMode) => {
    setMode(nextMode);
    setShowDiaryModal(true);
    setLoadingDetails(true);
    setSaving(false);
    setDetails(INIT_DETAILS);

    try {
      const res = await api.get(`/emotion-diary/${id}`);
      const dto = res?.data?.data;
      setDetails(dto || INIT_DETAILS);
    } catch (e) {
      console.error("Failed to load diary details:", e);
      setDetails(INIT_DETAILS);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this diary record?");
    if (!ok) return;

    try {
      await api.delete(`/emotion-diary/${id}`);
      await loadData();

      if (showDiaryModal && details?.id === id) {
        setShowDiaryModal(false);
        setDetails(INIT_DETAILS);
      }
    } catch (e) {
      console.error("Failed to delete diary:", e);
      alert(e?.response?.data?.message || "Failed to delete diary");
    }
  };

  const handleValueChange = (e) => {
    const { name, value } = e.target;

    setDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveEdit = async () => {
    const payload = updatePayload;
    const errMsg = validateUpdatePayload(payload);
    if (errMsg) {
      alert(errMsg);
      return;
    }

    setSaving(true);
    try {
      await api.put(`/emotion-diary/${payload.id}`, payload);

      await loadData();

      const res = await api.get(`/emotion-diary/${payload.id}`);
      setDetails(res?.data?.data || INIT_DETAILS);

      setMode("view");
      alert("Updated successfully");
    } catch (e) {
      console.error("Failed to update diary:", e);
      alert(e?.response?.data?.message || "Failed to update diary");
    } finally {
      setSaving(false);
    }
  };

  const closeDetailsModal = () => {
    setShowDiaryModal(false);
    setMode("view");
    setLoadingDetails(false);
    setSaving(false);
    setDetails(INIT_DETAILS);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} className="fixed inset-0 z-40">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="min-h-full flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white rounded-xl w-full max-w-5xl p-6 shadow-2xl">
              <Dialog.Title className="text-2xl font-bold mb-4">
                Emotion Diary History
              </Dialog.Title>

              {/* Filters */}
              <div className="flex flex-wrap gap-3 mb-4 items-center">
                <input
                  type="date"
                  className="border p-2 rounded"
                  value={dateRange[0]}
                  onChange={(e) => {
                    setPage((p) => ({ ...p, current: 1 }));
                    setDateRange([e.target.value, dateRange[1]]);
                  }}
                />
                <input
                  type="date"
                  className="border p-2 rounded"
                  value={dateRange[1]}
                  onChange={(e) => {
                    setPage((p) => ({ ...p, current: 1 }));
                    setDateRange([dateRange[0], e.target.value]);
                  }}
                />

                <select
                  className="border p-2 rounded"
                  value={emotionFilter}
                  onChange={(e) => {
                    setPage((p) => ({ ...p, current: 1 }));
                    setEmotionFilter(e.target.value);
                  }}
                >
                  <option value="">All Emotions</option>
                  {EMOTIONS.map((em) => (
                    <option key={em} value={em}>
                      {em}
                    </option>
                  ))}
                </select>

                <div className="ml-auto flex items-center gap-2">
                  <button
                    className="px-3 py-2 rounded border hover:bg-gray-50"
                    onClick={() => {
                      setDateRange(["", ""]);
                      setEmotionFilter("");
                      setPage((p) => ({ ...p, current: 1 }));
                    }}
                  >
                    Reset filters
                  </button>
                </div>
              </div>

              {/* History List */}
              <div className="max-h-[60vh] overflow-y-auto space-y-3">
                {records.length === 0 && (
                  <div className="text-sm text-gray-500 py-8 text-center">
                    No records
                  </div>
                )}

                {records.map((item) => (
                  <div
                    key={item.id}
                    className="border rounded-lg p-4 grid grid-cols-5 gap-3 hover:border-green-400 transition"
                  >
                    <div className="font-bold text-gray-800">
                      {item.diaryDate}
                    </div>

                    <div className="flex flex-col items-center">
                      <span className="text-green-600 text-lg font-bold">
                        {item.moodScore}
                      </span>
                      <span className="text-xs text-gray-500">
                        {item.dominantEmotion}
                      </span>
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
                    <div className="flex gap-3 justify-end">
                      <button
                        className="text-blue-600 hover:underline"
                        onClick={() => openDetails(item.id, "view")}
                      >
                        View
                      </button>
                      <button
                        className="text-yellow-600 hover:underline"
                        onClick={() => openDetails(item.id, "edit")}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600 hover:underline"
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-600">
                  {page.total} records
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-1 rounded border disabled:opacity-50"
                    disabled={page.current === 1}
                    onClick={() =>
                      setPage({ ...page, current: page.current - 1 })
                    }
                  >
                    Prev
                  </button>

                  <span className="px-2 font-bold">{page.current}</span>

                  <button
                    className="px-3 py-1 rounded border disabled:opacity-50"
                    disabled={page.current * page.size >= page.total}
                    onClick={() =>
                      setPage({ ...page, current: page.current + 1 })
                    }
                  >
                    Next
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 flex justify-end">
                <button
                  className="px-4 py-2 rounded bg-gray-900 text-white hover:bg-black"
                  onClick={onClose}
                >
                  Close
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>

      {/* ===== Details Modal (View/Edit) ===== */}
      <Dialog
        open={showDiaryModal}
        onClose={closeDetailsModal}
        className="fixed inset-0 z-50"
      >
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-2xl w-full max-w-3xl p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Dialog.Title className="text-xl font-bold">
                  Diary Details
                </Dialog.Title>
                <div className="text-xs text-gray-500 mt-1">
                  Mode:{" "}
                  <span className="font-semibold">
                    {mode === "edit" ? "Edit" : "View"}
                  </span>
                </div>
              </div>

              <button
                className="px-3 py-2 rounded border hover:bg-gray-50"
                onClick={closeDetailsModal}
              >
                Close
              </button>
            </div>

            {/* Loading */}
            {loadingDetails ? (
              <div className="py-10 text-center text-gray-500 text-sm">
                Loading...
              </div>
            ) : (
              <div className="mt-5 space-y-5">
                {/* Meta */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="rounded-lg bg-gray-50 p-3">
                    <div className="text-xs text-gray-500">Diary Date</div>
                    <div className="text-sm font-semibold">
                      {details.diaryDate || "-"}
                    </div>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <div className="text-xs text-gray-500">Created</div>
                    <div className="text-sm font-semibold">
                      {formatDateTime(details.createdAt)}
                    </div>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <div className="text-xs text-gray-500">Updated</div>
                    <div className="text-sm font-semibold">
                      {formatDateTime(details.updatedAt)}
                    </div>
                  </div>
                </div>

                {/* Editable fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* moodScore */}
                  <div>
                    <label className="text-sm font-medium block mb-1">
                      Mood Score (1-10)
                    </label>
                    <input
                      type="number"
                      name="moodScore"
                      min={1}
                      max={10}
                      className={`w-full border rounded-lg p-2 ${
                        !isEditable ? "bg-gray-50 text-gray-600" : ""
                      }`}
                      value={details.moodScore ?? ""}
                      onChange={handleValueChange}
                      disabled={!isEditable}
                    />
                    {details.moodScoreDesc && (
                      <div className="text-xs text-gray-500 mt-1">
                        {details.moodScoreDesc}
                      </div>
                    )}
                  </div>

                  {/* dominantEmotion */}
                  <div>
                    <label className="text-sm font-medium block mb-1">
                      Dominant Emotion
                    </label>
                    <select
                      name="dominantEmotion"
                      className={`w-full border rounded-lg p-2 ${
                        !isEditable ? "bg-gray-50 text-gray-600" : ""
                      }`}
                      value={details.dominantEmotion ?? ""}
                      onChange={handleValueChange}
                      disabled={!isEditable}
                    >
                      <option value="">Select</option>
                      {EMOTIONS.map((em) => (
                        <option key={em} value={em}>
                          {em}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* sleepQuality */}
                  <div>
                    <label className="text-sm font-medium block mb-1">
                      Sleep Quality (1-5)
                    </label>
                    <input
                      type="number"
                      name="sleepQuality"
                      min={1}
                      max={5}
                      className={`w-full border rounded-lg p-2 ${
                        !isEditable ? "bg-gray-50 text-gray-600" : ""
                      }`}
                      value={details.sleepQuality ?? ""}
                      onChange={handleValueChange}
                      disabled={!isEditable}
                    />
                    {details.sleepQualityDesc && (
                      <div className="text-xs text-gray-500 mt-1">
                        {details.sleepQualityDesc}
                      </div>
                    )}
                  </div>

                  {/* stressLevel */}
                  <div>
                    <label className="text-sm font-medium block mb-1">
                      Stress Level (1-5)
                    </label>
                    <input
                      type="number"
                      name="stressLevel"
                      min={1}
                      max={5}
                      className={`w-full border rounded-lg p-2 ${
                        !isEditable ? "bg-gray-50 text-gray-600" : ""
                      }`}
                      value={details.stressLevel ?? ""}
                      onChange={handleValueChange}
                      disabled={!isEditable}
                    />
                    {details.stressLevelDesc && (
                      <div className="text-xs text-gray-500 mt-1">
                        {details.stressLevelDesc}
                      </div>
                    )}
                  </div>
                </div>

                {/* emotionTriggers */}
                <div>
                  <label className="text-sm font-medium block mb-1">
                    Emotion Triggers
                  </label>
                  <textarea
                    name="emotionTriggers"
                    rows={3}
                    className={`w-full border rounded-lg p-2 resize-none ${
                      !isEditable ? "bg-gray-50 text-gray-600" : ""
                    }`}
                    value={details.emotionTriggers ?? ""}
                    onChange={handleValueChange}
                    disabled={!isEditable}
                    maxLength={1000}
                  />
                  {isEditable && (
                    <div className="text-xs text-gray-400 mt-1 text-right">
                      {(details.emotionTriggers || "").length}/1000
                    </div>
                  )}
                </div>

                {/* diaryContent */}
                <div>
                  <label className="text-sm font-medium block mb-1">
                    Diary Content
                  </label>
                  <textarea
                    name="diaryContent"
                    rows={6}
                    className={`w-full border rounded-lg p-2 resize-none ${
                      !isEditable ? "bg-gray-50 text-gray-600" : ""
                    }`}
                    value={details.diaryContent ?? ""}
                    onChange={handleValueChange}
                    disabled={!isEditable}
                    maxLength={2000}
                  />
                  {isEditable && (
                    <div className="text-xs text-gray-400 mt-1 text-right">
                      {(details.diaryContent || "").length}/2000
                    </div>
                  )}
                </div>

                {/* AI section (view-only) */}
                <div className="rounded-xl border bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-sm text-gray-800">
                      AI Analysis
                    </div>
                    <div className="text-xs text-gray-500">
                      Status: {details.aiAnalysisStatus || "-"}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Updated: {formatDateTime(details.aiAnalysisUpdatedAt)}
                  </div>
                  <div className="mt-3 text-sm text-gray-700 whitespace-pre-wrap">
                    {details.aiEmotionAnalysis || "No AI analysis"}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                  {mode === "view" ? (
                    <button
                      className="px-4 py-2 rounded bg-yellow-600 text-white hover:bg-yellow-700"
                      onClick={() => setMode("edit")}
                    >
                      Edit
                    </button>
                  ) : (
                    <>
                      <button
                        className="px-4 py-2 rounded border hover:bg-gray-50 disabled:opacity-50"
                        onClick={() => setMode("view")}
                        disabled={saving}
                      >
                        Cancel
                      </button>
                      <button
                        className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                        onClick={handleSaveEdit}
                        disabled={saving}
                      >
                        {saving ? "Saving..." : "Save"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}
