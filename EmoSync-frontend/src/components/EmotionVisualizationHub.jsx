import React, { useState, useEffect, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faWater,
  faPalette,
  faChartLine,
  faStar,
  faEye,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

/**
 * EmotionVisualizationHub React Version
 *
 * Includes:
 * 1. Visualization mode switching (Emotion calendar/Stream Chart)
 * 2. Emotion calendar (display daily mood scores and main emotions)
 * 3. Stream Chart overview statistics
 */
const EmotionVisualizationHub = ({ emotionTrend = [] }) => {
  const [activeVisualization, setActiveVisualization] = useState("calendar");
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
// --- Stream Chart States ---
const [streamGranularity, setStreamGranularity] = useState("hour");
const [streamSmoothing, setStreamSmoothing] = useState(0.5);

  // Month control
  const previousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Get calendar date data
  const calendarDates = useMemo(() => {
    const year = currentYear;
    const month = currentMonth;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const dates = [];
    const currentDate = new Date(startDate);
    const today = new Date();

    for (let i = 0; i < 42; i++) {
      // 6 weeks
      const date = new Date(currentDate);
      const isOtherMonth = date.getMonth() !== month;
      const isToday = date.toDateString() === today.toDateString();

      // Format date string for matching
      const dateString = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
      const emotionData = emotionTrend.find((item) => item.date === dateString);

      dates.push({
        key: dateString,
        day: date.getDate(),
        date: date,
        isOtherMonth,
        isToday,
        emotionData,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }, [currentMonth, currentYear, emotionTrend]);

  // Monthly statistics
  const monthlyStats = useMemo(() => {
    const currentMonthDates = calendarDates.filter(
      (date) => !date.isOtherMonth && date.emotionData
    );

    if (currentMonthDates.length === 0) {
      return {
        emotionCount: 0,
        avgMood: "0.0",
        bestDay: "No data",
        mostFrequentEmotion: "No data",
        moodTrend: "Stable",
      };
    }

    // Average mood score
    const totalMood = currentMonthDates.reduce(
      (sum, date) => sum + (date.emotionData.avgMoodScore || 0),
      0
    );
    const avgMood = (totalMood / currentMonthDates.length).toFixed(1);

    // Best day
    const bestDay = currentMonthDates.reduce((best, date) =>
      (date.emotionData.avgMoodScore || 0) >
      (best.emotionData?.avgMoodScore || 0)
        ? date
        : best
    );

    // Most frequent emotion
    const emotionCount = {};
    currentMonthDates.forEach((date) => {
      const emotion = date.emotionData.dominantEmotion;
      if (emotion && emotion !== "Unknown" && emotion !== "No data") {
        emotionCount[emotion] = (emotionCount[emotion] || 0) + 1;
      }
    });

    let mostFrequentEmotion = "No data";
    if (Object.keys(emotionCount).length > 0) {
      const mostFrequent = Object.entries(emotionCount).reduce((a, b) =>
        emotionCount[a[0]] > emotionCount[b[0]] ? a : b
      );
      mostFrequentEmotion = mostFrequent ? mostFrequent[0] : "No data";
    }

    return {
      emotionCount: currentMonthDates.length,
      avgMood,
      bestDay: `${bestDay.day}th`,
      mostFrequentEmotion,
      moodTrend: "Stable",
    };
  }, [calendarDates]);

  // Emotion score color mapping
  const getMoodColor = (moodScore) => {
    if (!moodScore && moodScore !== 0) return "#d9d9d9"; // No data
    if (moodScore >= 8) return "#00b894"; // Excellent 8-10
    if (moodScore >= 7) return "#fdcb6e"; // Good 7-8
    if (moodScore >= 5) return "#74b9ff"; // Average 5-6
    if (moodScore >= 3) return "#fab1a0"; // Low 3-4
    return "#fd79a8"; // Poor 1-2
  };

  // Emotion emoji mapping
  const getEmotionEmoji = (moodScore) => {
    if (moodScore === undefined || moodScore === null) return "😐";
    const score = Number(moodScore);
    if (score >= 9) return "🤩";
    if (score >= 8) return "😄";
    if (score >= 7) return "😊";
    if (score >= 6) return "🙂";
    if (score >= 5) return "😐";
    if (score >= 4) return "😔";
    if (score >= 3) return "😞";
    if (score >= 2) return "😢";
    return "😰";
  };

  // Weekday labels
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Current month display
  const currentMonthYear = new Date(
    currentYear,
    currentMonth
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  // Detail modal
  const handleDateClick = (dateData) => {
    if (dateData.emotionData) {
      setSelectedEmotion({
        ...dateData.emotionData,
        day: dateData.day,
        date: dateData.date,
      });
      setShowDetail(true);
    }
  };

  // Classic heatmap options
  const heatmapOption = useMemo(() => {
    if (!emotionTrend.length) return {};

    const calendarData = emotionTrend.map((d) => [d.date, d.avgMoodScore || 0]);

    return {
      title: {
        text: "Emotion Heatmap",
        left: "center",
        textStyle: {
          fontSize: 16,
          fontWeight: "bold",
          color: "#2d3436",
        },
      },
      tooltip: {
        trigger: "item",
        formatter: function (params) {
          const date = params.data[0];
          const score = params.data[1];
          const trend = emotionTrend.find((d) => d.date === date);
          return `
            <div style="font-weight: bold; margin-bottom: 8px;">${date}</div>
            <div>Mood Score: ${score}/10</div>
            ${trend ? `<div>Main Emotion: ${trend.dominantEmotion}</div>` : ""}
          `;
        },
      },
      visualMap: {
        min: 0,
        max: 10,
        calculable: true,
        orient: "horizontal",
        left: "center",
        bottom: 20,
        inRange: {
          color: ["#00b894", "#fdcb6e", "#fab1a0", "#fd79a8"],
        },
        textStyle: {
          color: "#2d3436",
        },
      },
      calendar: {
        range: emotionTrend[0]?.date.substring(0, 7) || "2024-01",
        cellSize: ["auto", 15],
        top: 60,
        left: 30,
        right: 30,
        itemStyle: {
          borderWidth: 0.5,
          borderColor: "#e8e8e8",
          color: "#fafafa",
        },
        dayLabel: {
          color: "#666",
        },
        monthLabel: {
          color: "#333",
        },
        yearLabel: {
          color: "#333",
        },
      },
      series: [
        {
          type: "heatmap",
          coordinateSystem: "calendar",
          data: calendarData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        },
      ],
    };
  }, [emotionTrend]);
  // Generate stream chart option based on emotionTrend
const streamChartOption = useMemo(() => {
  if (!emotionTrend || emotionTrend.length === 0) return {};

  // Group data by granularity
  const groupData = () => {
    const grouped = {};

    emotionTrend.forEach((item) => {
      const date = new Date(item.date);
      let key = "";

      if (streamGranularity === "hour") {
        key = `${date.getHours().toString().padStart(2, "0")}:00`;
      } else if (streamGranularity === "day") {
        key = date.toLocaleDateString("en-US", { weekday: "short" });
      } else if (streamGranularity === "week") {
        key = `Week ${Math.ceil(date.getDate() / 7)}`;
      }

      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item.avgMoodScore || 0);
    });

    return grouped;
  };

  const grouped = groupData();
  const xAxis = Object.keys(grouped);
  const yData = Object.values(grouped).map(
    (list) => list.reduce((a, b) => a + b, 0) / list.length
  );

  return {
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: xAxis,
      axisLabel: { rotate: 45 },
    },
    yAxis: { type: "value", min: 0, max: 10 },
    series: [
      {
        name: "Mood Flow",
        type: "line",
        smooth: streamSmoothing > 0 ? true : false,
        areaStyle: { opacity: 0.6 },
        data: yData,
      },
    ],
    color: ["#fab1a0"],
  };
}, [emotionTrend, streamGranularity, streamSmoothing]);


  return (
    <div className="w-full bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FontAwesomeIcon icon={faEye} className="text-pink-500" />
            Emotion Visualization Center
          </h2>
          <p className="text-gray-600 mt-1">
            Choose the most suitable data display method
          </p>
        </div>

        <div className="flex flex-col lg:flex-row justify-center items-center gap-4 lg:gap-8">
          <button
            onClick={() => setActiveVisualization("calendar")}
            className={`relative px-6 py-4 rounded-xl border border-pink-300 font-semibold text-base transition-all duration-300 flex flex-col items-center gap-3 w-80 h-28 justify-center ${
              activeVisualization === "calendar"
                ? "bg-gradient-to-r from-orange-200 via-pink-200 to-pink-300 text-gray-800 shadow-md"
                : "text-gray-600 hover:text-gray-800 hover:bg-white/80"
            }`}
          >
            <div className="flex items-center gap-3">
              <FontAwesomeIcon
                icon={faCalendarAlt}
                className={`text-2xl flex-shrink-0 ${
                  activeVisualization === "calendar"
                    ? "text-gray-600"
                    : "text-pink-600"
                }`}
              />
              <h3 className="text-lg font-medium text-center">Emotion Calendar</h3>
            </div>
            <span className="text-sm text-center leading-tight">Beautiful calendar showing daily emotional journey</span>
          </button>

          <div className="hidden lg:block h-8 w-px bg-gradient-to-b from-transparent via-gray-400/50 to-transparent flex-shrink-0"></div>

          <button
            onClick={() => setActiveVisualization("stream")}
            className={`relative px-6 py-4 rounded-xl border border-pink-300 font-semibold text-base transition-all duration-300 flex flex-col items-center gap-3 w-80 h-28 justify-center ${
              activeVisualization === "stream"
                ? "bg-gradient-to-r from-orange-200 via-pink-200 to-pink-300 text-gray-800 shadow-md"
                : "text-gray-600 hover:text-gray-800 hover:bg-white/80"
            }`}
          >
            <div className="flex items-center gap-3">
              <FontAwesomeIcon
                icon={faWater}
                className={`text-2xl flex-shrink-0 ${
                  activeVisualization === "stream"
                    ? "text-gray-600"
                    : "text-pink-600"
                }`}
              />
              <h3 className="text-lg font-medium text-center">Stream Chart</h3>
            </div>
            <span className="text-sm text-center leading-tight">Emotional flow changes over time</span>
          </button>
        </div>
      </div>
      {/* Content area */}
      <div className="p-6">
        {activeVisualization === "calendar" ?(
          // Multi-visualization mode - Emotion calendar
          <div className="calendar-container">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FontAwesomeIcon
                  icon={faCalendarAlt}
                  className="text-orange-500"
                />
                Emotion Calendar
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                Track your emotional journey and discover beautiful moments in
                life
              </p>
            </div>

            {/* Month navigation */}
            <div className="flex items-center justify-between mb-6 bg-gradient-to-r from-orange-50 to-pink-50 p-4 rounded-xl">
              <button
                onClick={previousMonth}
                className="w-8 h-8 flex items-center justify-center bg-white rounded-lg hover:bg-gray-50 transition-colors"
              >
                &lt;
              </button>

              <div className="text-center">
                <h4 className="text-xl font-bold text-gray-800">
                  {currentMonthYear}
                </h4>
                <div className="text-sm text-gray-600 mt-1">
                  Recorded this month: {monthlyStats.emotionCount} days · Avg
                  mood: {monthlyStats.avgMood}/10
                </div>
              </div>

              <button
                onClick={nextMonth}
                className="w-8 h-8 flex items-center justify-center bg-white rounded-lg hover:bg-gray-50 transition-colors"
              >
                &gt;
              </button>
            </div>

            {/* Mood color legend */}
            <div className="mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <FontAwesomeIcon icon={faPalette} className="text-pink-500" />
                <span className="font-medium text-gray-800">Mood Colors</span>
              </div>
              <div className="flex flex-wrap gap-4">
                {[
                  { label: "Excellent (8~10)", color: "#00b894" },
                  { label: "Good (7~8)", color: "#fdcb6e" },
                  { label: "Average (5~6)", color: "#74b9ff" },
                  { label: "Low (3~4)", color: "#fab1a0" },
                  { label: "Poor (1~2)", color: "#fd79a8" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-700">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Calendar grid */}
            <div className="bg-gradient-to-br from-white to-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm">
              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-2 mb-3">
                {weekdays.map((day, index) => (
                  <div
                    key={index}
                    className="text-center text-sm font-medium text-gray-600 py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Date cells */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDates.map((date) => {
                  const moodScore = date.emotionData?.avgMoodScore;
                  const backgroundColor = getMoodColor(moodScore);
                  const isWeekend =
                    date.date.getDay() === 0 || date.date.getDay() === 6;

                  return (
                    <div
                      key={date.key}
                      className={`aspect-square rounded-lg p-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 ${
                        date.isOtherMonth ? "opacity-30" : ""
                      } ${isWeekend ? "bg-gray-50" : ""}`}
                      style={{
                        backgroundColor:
                          moodScore !== undefined
                            ? backgroundColor
                            : "transparent",
                        border: date.isToday
                          ? "2px solid #e84393"
                          : "1px solid #e8e8e8",
                      }}
                      onClick={() => handleDateClick(date)}
                    >
                      <div className="text-sm font-medium text-gray-800">
                        {date.day}
                      </div>
                      {date.emotionData ? (
                        <div className="mt-1 text-xs">
                          <div className="font-medium">
                            {date.emotionData.avgMoodScore?.toFixed(1)}
                          </div>
                          <div className="text-2xl mt-1">
                            {getEmotionEmoji(date.emotionData.avgMoodScore)}
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-400 text-2xl mt-1">·</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Monthly emotion overview */}
            <div className="mt-6 bg-gradient-to-r from-orange-50 to-pink-50 p-5 rounded-xl border border-orange-100">
              <div className="flex items-center gap-2 mb-4">
                <FontAwesomeIcon
                  icon={faChartLine}
                  className="text-orange-500"
                />
                <h5 className="text-lg font-semibold text-gray-800">
                  Monthly Emotion Overview
                </h5>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    title: "Best Day",
                    value: monthlyStats.bestDay,
                    icon: "🌟",
                    color: "from-yellow-100 to-yellow-200",
                  },
                  {
                    title: "Main Emotion",
                    value: monthlyStats.mostFrequentEmotion,
                    icon: getEmotionEmoji(parseFloat(monthlyStats.avgMood)),
                    color: "from-blue-100 to-blue-200",
                  },
                  {
                    title: "Recorded Days",
                    value: `${monthlyStats.emotionCount} days`,
                    icon: "📝",
                    color: "from-green-100 to-green-200",
                  },
                  {
                    title: "Mood Trend",
                    value: monthlyStats.moodTrend,
                    icon:
                      monthlyStats.moodTrend === "Rising"
                        ? "📈"
                        : monthlyStats.moodTrend === "Falling"
                        ? "📉"
                        : "➡️",
                    color: "from-purple-100 to-purple-200",
                  },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-2xl`}
                      >
                        {stat.icon}
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">
                          {stat.title}
                        </div>
                        <div className="text-lg font-bold text-gray-800 mt-1">
                          {stat.value}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ): (
         <div className="stream-container">
  <div className="mb-4">
    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
      <FontAwesomeIcon icon={faWater} className="text-orange-500" />
      Stream Chart
    </h3>
    <p className="text-gray-600 text-sm mt-1">
      Emotional flow changes over time
    </p>
  </div>

  {/* --- Stream Chart Area --- */}
  <div className="w-full h-[400px] bg-white border border-gray-100 rounded-xl shadow-sm p-4">
    <ReactECharts option={streamChartOption} style={{ height: "100%" }} />
  </div>

  {/* --- Stream Controls --- */}
  <div className="mt-6 flex flex-col md:flex-row items-center justify-center gap-6 p-4 bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl">
    {/* Time granularity */}
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-gray-700">Time scale:</label>
      <select
        value={streamGranularity}
        onChange={(e) => setStreamGranularity(e.target.value)}
        className="px-3 py-2 rounded-lg border border-gray-300 bg-white shadow-sm"
      >
        <option value="hour">Hour</option>
        <option value="day">Day</option>
        <option value="week">Week</option>
      </select>
    </div>

    {/* Smoothing */}
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-gray-700">Smoothing:</label>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={streamSmoothing}
        onChange={(e) => setStreamSmoothing(parseFloat(e.target.value))}
        className="w-32"
      />
      <span className="text-gray-700 text-sm">{streamSmoothing}</span>
    </div>
  </div>
</div>

        )  }
      </div>

      {/* Detail modal */}
      {showDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">
                Emotion Details
              </h3>
              <button
                onClick={() => setShowDetail(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} className="text-xl" />
              </button>
            </div>

            {/* Modal content */}
            {selectedEmotion && (
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="text-2xl font-bold text-gray-800 mb-2">
                    {new Date(selectedEmotion.date).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        weekday: "long",
                      }
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-lg">
                    <span className="text-3xl">
                      {getEmotionEmoji(selectedEmotion.avgMoodScore)}
                    </span>
                    <span className="font-semibold text-gray-700">
                      {selectedEmotion.dominantEmotion || "Unknown"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-orange-50 to-pink-50 p-4 rounded-xl">
                    <div className="text-sm text-gray-600 mb-1">Mood Score</div>
                    <div className="text-2xl font-bold text-gray-800">
                      {selectedEmotion.avgMoodScore?.toFixed(1) || "0.0"}/10
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl">
                    <div className="text-sm text-gray-600 mb-1">
                      Record Count
                    </div>
                    <div className="text-2xl font-bold text-gray-800">
                      {selectedEmotion.recordCount || 0} records
                    </div>
                  </div>

                  {selectedEmotion.positiveRatio !== undefined && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl">
                      <div className="text-sm text-gray-600 mb-1">
                        Positive Emotion Ratio
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {selectedEmotion.positiveRatio.toFixed(1)}%
                      </div>
                    </div>
                  )}

                  {selectedEmotion.negativeRatio !== undefined && (
                    <div className="bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-xl">
                      <div className="text-sm text-gray-600 mb-1">
                        Negative Emotion Ratio
                      </div>
                      <div className="text-2xl font-bold text-red-600">
                        {selectedEmotion.negativeRatio.toFixed(1)}%
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmotionVisualizationHub;
