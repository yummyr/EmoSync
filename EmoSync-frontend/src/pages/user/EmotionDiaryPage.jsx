import React, { useState, useEffect, useRef } from "react";
import MoodSelector from "./components/MoodSelector";
import EmotionGrid from "./components/EmotionGrid";
import TrendChart from "./components/TrendChart";
import HistoryModal from "./components/HistoryModal";

import api from "@/api";
import {
  faPalette,
  faChartLine,
  faChartPie,
  faLightbulb,
  faComments,
  faCalendar,
  faHeart,
  faEdit,
  faRedo,
  faSave,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";

export default function EmotionDiaryPage() {
  const diaryIdRef = useRef(null);
  const INIT_FORM_DATA = {
    diaryDate: new Date().toISOString().slice(0, 10),
    moodScore: null,
    dominantEmotion: "",
    emotionTriggers: "",
    diaryContent: "",
    sleepQuality: "",
    stressLevel: "",
  };
  const LIFE_INDICATOR_OPTIONS = [
    { label: "Very Poor", value: 1 },
    { label: "Poor", value: 2 },
    { label: "Average", value: 3 },
    { label: "Good", value: 4 },
    { label: "Excellent", value: 5 },
  ];

  const [form, setForm] = useState(INIT_FORM_DATA);

  const [statistics, setStatistics] = useState([]);
  const [trend, setTrend] = useState([]);
  const [ai, setAi] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);

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
          diaryDate: data.diaryDate || prev.diaryDate,
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
      ...payload,
    });
    const data = res.data.data;
    console.log(data);

    setForm((prev) => ({
      ...prev,
      ...data,
      diaryDate: data.diaryDate || prev.diaryDate,
    }));
    loadStats();
    loadAiAnalysis();
  };
  const handleReset = () => {
    setForm(INIT_FORM_DATA);
  };

  return (
    <div>
      <div className="mb-6 p-4 bg-gradient-to-r from-lime-500 to-amber-500 flex justify-between items-center rounded-md">
        <div className="mb-2 p-2 ">
          <div className="flex justify-start gap-2 items-center">
            <FontAwesomeIcon
              icon={faHeart}
              className="text-white text-6xl animate-pulse "
            />

            <h2 className="text-3xl font-bold text-white mb-2">
              Emotion Diary
            </h2>
          </div>
          <p className="text-white">
            Record your mood and track emotional trends.
          </p>
        </div>

        <div
          className="flex items-center h-10 justify-start bg-blue-900 rounded-lg cursor-pointer transition-colors duration-200 
                hover:bg-gray-100"
          onClick={() => {
            setSelectedAction("history");
            setShowHistory(true);
          }}
        >
          <FontAwesomeIcon
            icon={faCalendar}
            className="text-xl ml-2 text-white"
          />
          <button className=" text-center px-3 rounded-lg text-white">
            View History
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT — Diary Form */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Mood Score */}
          <div className="bg-white rounded-xl p-6 shadow">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              Today's Mood
            </h3>
            <MoodSelector
              value={form.moodScore}
              onChange={(v) => setForm({ ...form, moodScore: v })}
            />
          </div>

          {/* Dominant Emotion*/}
          <div className="bg-white rounded-xl p-6 shadow ">
            <div className="flex items-center justify-start mb-4">
              <FontAwesomeIcon
                icon={faPalette}
                className="text-2xl text-[#4ADE80] mr-4"
              />
              <h3 className="text-xl font-bold text-gray-700">
                Dominant Emotion
              </h3>
            </div>
            <EmotionGrid
              value={form.dominantEmotion}
              onChange={(v) => setForm({ ...form, dominantEmotion: v })}
            />
          </div>

          {/* Details */}
          <div className="bg-white rounded-xl p-6 shadow ">
            {/* Title: Details Recording */}
            <div className="flex justify-start mb-4 items-center">
              <FontAwesomeIcon
                icon={faEdit}
                className="text-2xl text-[#4ADE80] mr-4 "
              />
              <h2 className="text-black font-bold ">Details Recording</h2>
            </div>

            {/* Two input fields */}
            <div>
              <div className="space-y-2 ">
                <h4>Emotion triggers:</h4>
                <div className="relative">
                  <textarea
                    value={form.emotionTriggers}
                    onChange={(e) =>
                      setForm({ ...form, emotionTriggers: e.target.value })
                    }
                    label="Emotion Triggers"
                    placeholder="What events or situations affected your emotions today?"
                    maxLength={2000}
                    className="
            w-full px-4 py-3 
            border border-gray-300 rounded-lg 
            focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
            focus:outline-none transition-all duration-200
            hover:border-gray-400 resize-none
            text-sm text-gray-700
          "
                  />
                  <div className="text-right mt-1">
                    <span className="text-xs text-gray-500">
                      {form.emotionTriggers.length}/2000
                    </span>
                  </div>
                </div>
              </div>

              {/* Diary Content */}
              <div className="space-y-2">
                <h4>Diary Content:</h4>
                <div className="relative">
                  <textarea
                    value={form.diaryContent}
                    onChange={(e) =>
                      setForm({ ...form, diaryContent: e.target.value })
                    }
                    placeholder="Write down your thoughts, feelings, or interesting things that happened..."
                    rows={5}
                    maxLength={2000}
                    className="
            w-full px-4 py-3 
            border border-gray-300 rounded-lg 
            focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
            focus:outline-none transition-all duration-200
            hover:border-gray-400 resize-none
            text-sm text-gray-700
          "
                  />
                  <div className="text-right mt-1">
                    <span className="text-xs text-gray-500">
                      {form.diaryContent.length}/2000
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Life Indicators */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1">
                  Sleep Quality
                </label>
                <select
                  className="border rounded-lg p-2 w-full"
                  value={form.sleepQuality}
                  onChange={(e) =>
                    setForm({ ...form, sleepQuality: e.target.value })
                  }
                >
                  <option value="">Select</option>
                  {LIFE_INDICATOR_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">
                  Stress Level
                </label>
                <select
                  className="border rounded-lg p-2 w-full"
                  value={form.stressLevel}
                  onChange={(e) =>
                    setForm({ ...form, stressLevel: e.target.value })
                  }
                >
                  <option value="">Select</option>
                  {LIFE_INDICATOR_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end mt-4 gap-4">
              <button
                onClick={handleReset}
                className="flex justify-start items-center bg-white border border-gray-200  rounded-lg"
              >
                <FontAwesomeIcon
                  icon={faRedo}
                  className="text-2xl text-black pl-2"
                />
                <p className=" text-black font-semibold py-2 px-2">Reset</p>
              </button>
              <button
                onClick={handleSave}
                className="flex justify-start items-center bg-blue-900  rounded-lg"
              >
                <FontAwesomeIcon
                  icon={faSave}
                  className="text-2xl text-white pl-2"
                />
                <p className=" text-white font-semibold py-2 px-2">
                  Save Diary
                </p>
              </button>
            </div>
            <div></div>
          </div>
        </div>

        {/* RIGHT PANEL — Stats + AI */}
        <div className="flex flex-col gap-6">
          {/* Trend Chart */}
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="flex items-center justify-start mb-4">
              <FontAwesomeIcon
                icon={faChartLine}
                className="text-2xl text-[#4ADE80] mr-4"
              />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                7-Day Mood Trend
              </h3>
            </div>
            <TrendChart data={trend} />
          </div>
          {/*This week Statistics */}
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="flex items-center justify-start mb-4 ">
              <FontAwesomeIcon
                icon={faChartPie}
                className="text-xl text-[#a9ea68] p-2"
              />
              <h4 className="text-lg font-semibold text-gray-700">
                This Week's Emotion Distribution
              </h4>
            </div>
            <div>
              {statistics && statistics.length > 0 ? (
                <div>
                  <span>{statistics.emotion}</span>
                  <span>{statistics.percentage}%</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 space-y-1">
                  <p>
                    <FontAwesomeIcon
                      icon={faChartPie}
                      className="text-4xl text-gray-300"
                    />
                  </p>
                  <p className="text-gray-500">No emotion data available</p>
                  <p className="text-gray-400 text-sm">
                    Please record emotion diaries to view statistics
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* AI Analysis */}
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200 rounded-xl p-6 shadow">
            <div className="flex items-center justify-start mb-4">
              <FontAwesomeIcon
                icon={faLightbulb}
                className="text-xl text-[#4ADE80] mr-2"
              />
              <h3 className="text-lg font-semibold text-gray-700 ">
                AI Analysis Suggestions
              </h3>
            </div>
            <div>
              {statistics.suggestions && statistics.suggestions.length > 0 ? (
                <div>
                  <span>{statistics.ai}</span>
                  <span>{statistics.percentage}%</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 space-y-1">
                  <p className="text-gray-500">No analysis data available</p>
                  <p className="text-gray-400 text-sm">
                    Please record emotion diaries
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">
                Quick Actions
              </h3>
              <button
                className="text-sm text-blue-600"
                onClick={loadAiAnalysis}
                disabled={loadingAi}
              >
                Refresh
              </button>
            </div>

            <div className="flex justify-between">
              {!ai && !loadingAi && (
                <div
                  className="flex items-center justify-center bg-gray-200 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors duration-200 "
                  onClick={() => {
                    setSelectedAction("analysis");
                    handleTriggerAnalysis(diaryIdRef.current);
                  }}
                >
                  <FontAwesomeIcon
                    icon={faComments}
                    className={`text-xl ml-2 ${
                      selectedAction === "analysis"
                        ? "text-[#7df163]"
                        : "text-gray-400"
                    }`}
                  />
                  <button className=" text-center p-3 rounded-lg text-gray-500">
                    Start Analysis
                  </button>
                </div>
              )}

              {loadingAi && <p className="text-gray-500 ">Analyzing…</p>}

              {ai && (
                <div className="mt-4 p-4 border rounded-lg bg-blue-50">
                  <p className="font-semibold">{ai.label}</p>
                  <p className="text-sm text-gray-600">{ai.suggestion}</p>
                </div>
              )}

              {/* History */}

              <div
                className="flex items-center justify-start bg-gray-200 rounded-lg cursor-pointer transition-colors duration-200 
                hover:bg-gray-100"
                onClick={() => {
                  setSelectedAction("history");
                  setShowHistory(true);
                }}
              >
                <FontAwesomeIcon
                  icon={faCalendar}
                  className={`text-2xl ml-2 ${
                    selectedAction === "history"
                      ? "text-[#7df163]"
                      : "text-gray-400"
                  }`}
                />
                <button className=" text-center px-3 rounded-lg text-gray-500">
                  View History
                </button>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-6 shadow">
            <h4 className="text-lg font-semibold text-gray-700">
              💡 Daily Tip
            </h4>
            <p className="text-sm text-gray-500 py-3">
              {" "}
              Consistently keeping an emotion diary helps improve emotional
              awareness. It's recommended to spend 5-10 minutes daily recording.{" "}
            </p>
          </div>

          {/* Modal */}
          <HistoryModal
            open={showHistory}
            onClose={() => setShowHistory(false)}
          />
        </div>
      </div>
    </div>
  );
}
