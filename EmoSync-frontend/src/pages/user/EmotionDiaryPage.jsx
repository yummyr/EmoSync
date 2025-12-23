import React, { useState, useEffect, useRef } from "react";
import MoodSelector from "./components/MoodSelector";
import EmotionGrid from "./components/EmotionGrid";
import TrendChart from "./components/TrendChart";
import HistoryModal from "./components/HistoryModal";

import api from "@/api";
import {
  faPalette,
  faLightbulb,
  faComments,
  faCalendar,
  faHeart,
  faEdit,
  faRedo,
  faSave,
  faChartPie,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import EmotionDistribution from "./components/EmotionDistribution";

export default function EmotionDiaryPage() {
  const [todayDiaryId, setTodayDiaryId] = useState(null);
  const [selectedDiaryId, setSelectedDiaryId] = useState(null);
  const [mode, setMode] = useState("create"); // "create" or "edit"
  const pollingTimerRef = useRef(null);

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

  const [emotionDistribution, setEmotionDistribution] = useState({});
  const [moodTrend, setMoodTrend] = useState([]);
  const [ai, setAi] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);

  // Load Today's Entry
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/emotion-diary/today");
        console.log("Fetched today's entry:", res);
         if (!res.data.data) {
          setTodayDiaryId(null);
          setMode("create");
          return;
        }


        const data = res.data.data;
        setTodayDiaryId(data.id); 
        setMode("edit");
        setForm((prev) => ({
          ...prev,
          ...data,
          diaryDate: data.diaryDate || prev.diaryDate,
        }));
        loadAiAnalysis(data.id);
      } catch (err) {
        console.error("No entry for today:", err);
          setTodayDiaryId(null);
        setMode("create");
      }
    })();
       return () => {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
      }
    };
  }, []);

  // Load Stats
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await api.get("/emotion-diary/statistics");
      console.log("Fetched stats:", res);
      const data = await res.data.data;
      setMoodTrend(data.moodTrend || []);
      setEmotionDistribution(data.emotionDistribution || {});
      console.log("emotionDistribution:", data.emotionDistribution);
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  };

  // AI Analysis
  const loadAiAnalysis = async (todayDiaryId) => {
    if (!todayDiaryId) return;
    setLoadingAi(true);
    try {
      const res = await api.get(`/emotion-diary/${todayDiaryId}/ai-analysis`);

      const data = await res.data.data;
      setAi(data);
    } catch (err) {
      console.error("Failed to load AI analysis:", err);
      setAi(null);
    }
    setLoadingAi(false);
  };

  const handleTriggerAnalysis = async (diaryId) => {
       if (!diaryId) {
      alert("Please save the diary first");
      return;
    }
    console.log("Manually trigger AI emotion analysis for diary ID:", todayDiaryId);
      
    try {
      await api.post(`/emotion-diary/${diaryId}/ai-analysis`);

      setAi(null);
      setLoadingAi(true);
  
      startAiAnalysisPolling(diaryId);
    } catch (err) {
      console.error("Failed to trigger AI analysis:", err);
      alert("Failed to start AI analysis");
      setLoadingAi(false);
    }
  };

  // AI Analysis Polling
  const startAiAnalysisPolling = (diaryId) => {
    // Clear previous timer
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
    }

    const maxPollingAttempts = 20; // Maximum 20 polling attempts (10 minutes)
    let pollingAttempts = 0;

    pollingTimerRef.current = setInterval(async () => {
      pollingAttempts++;

      try {
        await loadAiAnalysis(diaryId);

        // If analysis result is obtained, stop polling
        if (ai) {
          clearInterval(pollingTimerRef.current);
          pollingTimerRef.current = null;
          alert("AI emotion analysis completed!");
          return;
        }

        // Exceeded maximum attempts, stop polling
        if (pollingAttempts >= maxPollingAttempts) {
          clearInterval(pollingTimerRef.current);
          pollingTimerRef.current = null;
          setLoadingAi(false);
          alert("AI analysis is taking longer than expected, please refresh manually later");
          return;
        }
      } catch (error) {
        console.error('Polling AI analysis result failed:', error);

        // If failed multiple times, stop polling
        if (pollingAttempts >= maxPollingAttempts) {
          clearInterval(pollingTimerRef.current);
          pollingTimerRef.current = null;
          setLoadingAi(false);
        }
      }
    }, 30000); // Poll every 30 seconds
  };


  // Save Diary
  const handleSave = async () => {
   try {
      const payload = { ...form };
      console.log("Payload:", payload);

      let res;
      if (mode === "edit" && todayDiaryId) {
        // Edit mode: use update endpoint
        console.log("Update existing diary with ID:", todayDiaryId);
        res = await api.put(`/emotion-diary/${todayDiaryId}`, payload);
      } else {
        // Create mode: use create or update endpoint with edit mode parameter
        const isEditMode = mode === "edit";
        console.log(`Create or update diary, edit mode: ${isEditMode}`);
        res = await api.post("/emotion-diary", payload, {
          params: { isEditMode }
        });
      }

      console.log("Response after save:", res);

      if (res.data.code === "200") {
        const savedData = res.data.data;

        // Update today's diary ID
        if (savedData && savedData.id) {
          setTodayDiaryId(savedData.id);
          setMode("edit"); // Enter edit mode after saving
        }

        alert("Diary saved successfully");

        // Reload statistics and AI analysis
        loadStats();
        if (savedData && savedData.id) {
          loadAiAnalysis(savedData.id);
        }
      } else {
        alert(`Save failed: ${res.data.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Failed to save diary:", err);
      alert("Failed to save diary. Please try again.");
    }
  };
  const handleReset = () => {
     if (todayDiaryId) {
      // Reload today's data
      (async () => {
        try {
          const res = await api.get("/emotion-diary/today");
          if (res.data.data) {
            const data = res.data.data;
            setForm((prev) => ({
              ...prev,
              ...data,
              diaryDate: data.diaryDate || prev.diaryDate,
            }));
          }
        } catch (err) {
          console.error("Failed to reload today's data:", err);
        }
      })();
    } else {
      // No records, reset to initial state
      setForm(INIT_FORM_DATA);
    }
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
                {mode === "edit" && (
                <span className="ml-2 text-sm bg-white text-amber-600 px-2 py-1 rounded">
                  Edit Mode
                </span>
              )}
            </h2>
          </div>
          <p className="text-white">
            Record your mood and track emotional trends.
             {todayDiaryId && (
              <span className="ml-2 text-amber-100">
                You have a diary for today. You can edit it.
              </span>
            )}
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

       {/* Mode Indicator */}
      {mode === "edit" && todayDiaryId && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-700 text-sm">
            📝 You are editing today's diary. Only one diary entry is allowed per day.
          </p>
        </div>
      )}

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
                  {mode === "edit" ? "Update Diary" : "Save Diary"}
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
            <TrendChart data={moodTrend} />
          </div>
          {/*This week Statistics */}
          <div className="bg-white rounded-xl p-2 shadow">
            <div className="flex items-start ">
              <FontAwesomeIcon
                icon={faChartPie}
                className="text-xl text-[#a9ea68] p-2"
              />
              <h4 className="text- font-semibold text-gray-700 ml-2">
                This Week's Emotion Distribution
              </h4>
            </div>
            <EmotionDistribution data={emotionDistribution} />
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
                  {loadingAi && (
                <div className="mt-4 p-4 border rounded-lg bg-blue-50">
                  <p className="text-gray-500">AI is analyzing your diary content...</p>
                  <div className="mt-2 text-xs text-gray-400">
                    This may take a few moments. Please wait...
                  </div>
                </div>
              )}

              {ai &&!loadingAi && (
                <div className="mt-4 p-4 border rounded-lg bg-blue-50">
                  <p className="font-semibold">{ai.label}</p>
                  <p className="text-sm text-gray-600">{ai.suggestion}</p>
                </div>
              )} 

              {!ai && !loadingAi && (
                <div className="flex flex-col items-center justify-center py-4 space-y-1">
                  <p className="text-gray-500">No analysis data available</p>
                  <p className="text-gray-400 text-sm">
                    {todayDiaryId 
                      ? "Click 'Start Analysis' to generate AI insights"
                      : "Please save your diary first to enable AI analysis"}
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
                  onClick={() => todayDiaryId && loadAiAnalysis(todayDiaryId)}
                disabled={loadingAi || !todayDiaryId}
              >
                Refresh
              </button>
            </div>

            <div className="flex justify-between">
              {todayDiaryId && !loadingAi && (
                <div
                  className="flex items-center justify-center bg-gray-200 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors duration-200 "
                  onClick={() => {
                    setSelectedAction("analysis");
                    handleTriggerAnalysis(todayDiaryId);
                  }}
                     disabled={loadingAi}
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
                    {ai ? "Re-analyze" : "Start Analysis"}
                  </button>
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
