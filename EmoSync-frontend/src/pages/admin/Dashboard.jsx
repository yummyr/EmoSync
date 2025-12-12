import React, { useEffect, useState } from "react";
import EmotionHeatmap from "@/pages/admin/components/EmotionHeatmap";
import EmotionVisualizationHub from "@/pages/admin/components/EmotionVisualizationHub";
import api from "@/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faHeart,
  faComments,
  faSmile,
  faCubes,
  faMagic,
} from "@fortawesome/free-solid-svg-icons";

const Dashboard = () => {
  const baseButtonStyles =
    "btn btn-primary transition-all duration-300 hover:from-orange-300 hover:via-pink-300 hover:to-pink-400";
  const activeButtonStyles =
    "bg-gradient-to-r from-orange-200 via-pink-200 to-pink-300 text-gray-800";
  const inactiveButtonStyles =
    "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50";
  const [analytics, setAnalytics] = useState(null);
  const [heatmapData, setHeatmapData] = useState(null);
  const [emotionTrend, setEmotionTrend] = useState([]);
  const [heatmapToggle, setHeatmapToggle] = useState(true);
  const [activeVisualization, setActiveVisualization] = useState("heatmap");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const overviewRes = await api.get("/data-analytics/overview?days=30");
      const heatmapRes = await api.get(
        "/data-analytics/emotion-heatmap?days=30"
      );
      const emotionTrendRes = await api.get(
        "/data-analytics/emotion-trend?days=30"
      );

      const overview = overviewRes.data;
      const heatmap = heatmapRes.data;
      const emotionTrend = emotionTrendRes.data;
      console.log("Dashboard Data:", {
        overview: overview,
        heatmap: heatmap,
        emotionTrend: emotionTrend,
      });
      console.log(
        "overview.code:",
        overview.code,
        "type:",
        typeof overview.code
      );
      console.log("overview.data:", overview.data);

      // 修复：比较字符串和字符串，并添加安全检查
      if (
        overview.code === "200" &&
        overview.data &&
        overview.data.systemOverview
      ) {
        const analyticsData = overview.data.systemOverview;
        console.log("analyticsData:", analyticsData);
        console.log("Analytics Data set:", analyticsData);
        setAnalytics(analyticsData);
      } else {
        console.warn("Overview data structure issue:", {
          code: overview.code,
          hasData: !!overview.data,
          hasSystemOverview: !!(overview.data && overview.data.systemOverview),
        });
      }

      console.log("heatmap.data:", heatmap.data);
      if (heatmap.code === "200" && heatmap.data) {
        setHeatmapData(heatmap.data);
        console.log("Heatmap Data set:", heatmap.data);
      }

      if (emotionTrend.code === "200" && emotionTrend.data) {
        console.log("emotionTrend.data:", emotionTrend.data);
        setEmotionTrend(emotionTrend.data);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    }
  };
  const summaryCards = [
    {
      title: "Total Users:",
      value: analytics?.totalUsers ?? 0,
      sub: `Active Users: ${analytics?.activeUsers ?? 0}`,
      icon: <FontAwesomeIcon icon={faUsers} />,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Emotion Diaries:",
      value: analytics?.totalDiaries ?? 0,
      sub: `New Today: ${analytics?.todayNewDiaries ?? 0}`,
      icon: <FontAwesomeIcon icon={faHeart} />,
      color: "bg-pink-100 text-pink-600",
    },
    {
      title: "Consultation Sessions:",
      value: analytics?.totalSessions ?? 0,
      sub: `New Today: ${analytics?.todayNewSessions ?? 0}`,
      icon: <FontAwesomeIcon icon={faComments} />,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Average Mood:",
      value: analytics?.avgMoodScore ?? "0.0",
      sub: "Emotional Wellness Index",
      icon: <FontAwesomeIcon icon={faSmile} />,
      color: "bg-green-100 text-green-600",
    },
  ];
  return (
    <div className="pb-16">
      {/* ---------- PAGE HEADER ---------- */}
      <div className="p-4 mb-4">
        <p className="text-gray-600 mt-1">
          View platform usage trends and emotional insights
        </p>
      </div>

      {/* ---------- SUMMARY CARDS ---------- */}
      <div className="grid grid-cols-1  lg:grid-cols-2 gap-4 px-2 mb-10">
        {summaryCards.map((card, idx) => (
          <div key={idx} className="card shadow-sm rounded-xl p-4 bg-white">
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}
              >
                {card.icon}
              </div>
              <div className="ml-4">
                <div className="flex items-baseline gap-2">
                  <p className="text-sm font-medium text-gray-600">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {card.value}
                  </p>
                </div>
                <p className="text-gray-500 text-sm mt-1">{card.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ---------- HEATMAP & MULTI-VISUALIZATION PANEL ---------- */}
      
      <div className="flex flex-wrap gap-4 mb-8 px-4 justify-center">
        <div className="flex items-center  bg-white rounded-xl  shadow-sm">
          <button
            onClick={() => {
              setHeatmapToggle(true);
              setActiveVisualization("heatmap");
            }}
            className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-300 flex items-center gap-2 ${
              activeVisualization === "heatmap"
                ? "bg-gradient-to-r from-orange-200 via-pink-200 to-pink-300 text-gray-800 shadow-md"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <FontAwesomeIcon icon={faCubes} />
            <span>EMOTION TIME HEATMAP</span>
          </button>

          <button
            onClick={() => {
              setHeatmapToggle(false);
              setActiveVisualization("multi");
            }}
            className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-300 flex items-center gap-2 ${
              activeVisualization === "multi"
                ? "bg-gradient-to-r from-orange-200 via-pink-200 to-pink-300 text-gray-800 shadow-md"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <FontAwesomeIcon icon={faMagic} />
            <span>MULTI-VISUALIZATION PANEL</span>
          </button>
        </div>
      </div>

      {/* ------- LEFT: EMOTION TIME HEATMAP -------- */}
      {heatmapToggle && (
        <div className="p-4 rounded-2xl shadow bg-white overflow-hidden">
          {/* Header */}
          <div >
            <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-200 via-pink-200 to-pink-300">
              <h2 className="text-xl  font-bold flex items-center gap-2 text-gray-800">
                <span className="text-pink-600 text-2xl">❤️</span>
                Emotion Time Heatmap
              </h2>
              <p className="text-gray-700 mt-1">
                Explore your emotional rhythm and discover your inner bright
                moments.
              </p>

              <div className="flex flex-wrap items-center gap-6 mt-4">
                <div className="flex  items-center gap-2 text-gray-800">
                  <span>📅</span>
                  <span>{heatmapData?.dateRange || "No data available"}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-800">
                  <span>⭐</span>
                  <span>
                    Peak Activity Time:{" "}
                    {heatmapData?.peakEmotionTime || "00:00"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3D Heatmap */}
          <div className="bg-black rounded-2xl mt-0">
            {heatmapData ? (
              <EmotionHeatmap heatmapData={heatmapData} />
            ) : (
              <div className="h-64  flex items-center justify-center text-gray-400">
                Loading heatmap...
              </div>
            )}
          </div>
        </div>
      )
      
      }
      {/* ------- RIGHT: MULTI-VISUALIZATION PANEL -------- */}
      {!heatmapToggle && (
        <div className="rounded-2xl shadow bg-white p-6">
          <EmotionVisualizationHub emotionTrend={emotionTrend} />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
