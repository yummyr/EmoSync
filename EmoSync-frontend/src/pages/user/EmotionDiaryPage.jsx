import React, { useState, useEffect, useRef } from "react";
import MoodSelector from "@/components/MoodSelector";
import EmotionGrid from "@/components/EmotionGrid";
import TrendChart from "@/components/TrendChart";
import HistoryModal from "@/components/HistoryModal";
import api from "@/api";


export default function EmotionDiaryPage() {

  const diaryIdRef = useRef(null);
  const [form, setForm] = useState({
    diaryDate: new Date().toISOString().slice(0, 10),
    moodScore: null,
    dominantEmotion: "",
    emotionTriggers: "",
    diaryContent: "",
    sleepQuality: "",
    stressLevel: ""
  });

  const [statistics, setStatistics] = useState([]);
  const [trend, setTrend] = useState([]);
  const [ai, setAi] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [showHistory, setShowHistory] = useState(false);


  // ---------------------------
  // Load Today's Entry
  // ---------------------------
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/emotion-diary/today");
       console.log("Fetched today's entry:", res);
        const data = res.data.data;
        diaryIdRef.current = data.id;
        setForm((prev) => ({
          ...prev,
          ...data,
          diaryDate: data.diaryDate || prev.diaryDate
        }));
        loadAiAnalysis();
      } catch (err) {
        console.error("No entry for today:", err);
        
      }
    })();
  }, []);

  // ---------------------------
  // Load Stats
  // ---------------------------
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await api.get("/emotion-diary/statistics?days=7");
      const data = await res.data.data;
      setTrend(data.moodTrend || []);
      setStatistics(data.emotionDistribution || []);
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  };

  // ---------------------------
  // AI Analysis
  // ---------------------------
  const loadAiAnalysis = async (diaryId) => {
    if (!diaryId) return;
    setLoadingAi(true);
    try {
      const res = await api.get(`/emotion-diary/${diaryId}/ai-analysis`);
     
      const data = await res.data.data;
      setAi(data);
    } catch (err) {
      console.error("Failed to load AI analysis:", err);
      setAi(null);
    }
    setLoadingAi(false);
  };

  const handleTriggerAnalysis = async (diaryId) => {
    if (!diaryId) return;
    console.log("Manually trigger AI emotion analysis for diary ID:", diaryId);
    await api.post("/emotion-diary/${diaryId}/ai-analysis");
    loadAiAnalysis();
  };

  // ---------------------------
  // Save Diary
  // ---------------------------
  const handleSave = async () => {
    const payload = { ...form };
    console.log("Payload:", payload);
    console.log("Create or update emotion diary with payload:", payload);
    const res = await api.post("/emotion-diary", {
        ...payload
    });
    const data = res.data.data;
    console.log(data);
 
    setForm((prev) => ({
      ...prev,
      ...data,
      diaryDate: data.diaryDate || prev.diaryDate
    }));
    loadStats();
    loadAiAnalysis();
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Emotion Diary</h2>
        <p className="text-gray-500">Record your mood and track emotional trends.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT — Diary Form */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Mood Score */}
          <div className="bg-white rounded-xl p-6 shadow">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Today's Mood</h3>
            <MoodSelector
              value={form.moodScore}
              onChange={(v) => setForm({ ...form, moodScore: v })}
            />
          </div>

          {/* Emotion Selection */}
          <div className="bg-white rounded-xl p-6 shadow">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Dominant Emotion</h3>
            <EmotionGrid
              value={form.dominantEmotion}
              onChange={(v) => setForm({ ...form, dominantEmotion: v })}
            />
          </div>

          {/* Details */}
          <div className="bg-white rounded-xl p-6 shadow flex flex-col gap-4">
            <textarea
              className="w-full border rounded-lg p-3 text-sm"
              rows={4}
              placeholder="What influenced your emotions today?"
              value={form.emotionTriggers}
              onChange={(e) => setForm({ ...form, emotionTriggers: e.target.value })}
            />

            <textarea
              className="w-full border rounded-lg p-3 text-sm"
              rows={6}
              placeholder="Write down your thoughts or reflections..."
              value={form.diaryContent}
              onChange={(e) => setForm({ ...form, diaryContent: e.target.value })}
            />

            <button
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            >
              Save Diary
            </button>
          </div>
        </div>

        {/* RIGHT PANEL — Stats + AI */}
        <div className="flex flex-col gap-6">
          {/* Trend Chart */}
          <div className="bg-white rounded-xl p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">7-Day Mood Trend</h3>
            <TrendChart data={trend} />
          </div>

          {/* AI Analysis */}
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-700">AI Emotion Analysis</h3>
              <button
                className="text-sm text-blue-600"
                onClick={loadAiAnalysis}
                disabled={loadingAi}
              >
                Refresh
              </button>
            </div>

            {!ai && !loadingAi && (
              <button
                onClick={() => handleTriggerAnalysis(diaryIdRef.current)}
                className="mt-3 bg-blue-600 text-white py-2 px-3 rounded-lg"
              >
                Start Analysis
              </button>
            )}

            {loadingAi && <p className="text-gray-500 mt-3">Analyzing…</p>}

            {ai && (
              <div className="mt-4 p-4 border rounded-lg bg-blue-50">
                <p className="font-semibold">{ai.label}</p>
                <p className="text-sm text-gray-600">{ai.suggestion}</p>
              </div>
            )}
          </div>

          {/* History */}
          <button
            onClick={() => setShowHistory(true)}
            className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg shadow"
          >
            View History
          </button>
        </div>
      </div>

      {/* Modal */}
      <HistoryModal open={showHistory} onClose={() => setShowHistory(false)} />
    </div>
  );
}
