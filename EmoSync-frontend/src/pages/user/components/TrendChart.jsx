import React, { useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine } from "@fortawesome/free-solid-svg-icons";

export default function TrendChart({ data = [] }) {
  console.log("TrendChart data get moodTrend:", data);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || data.length === 0) {
      return;
    }

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext("2d");

    // Set canvas dimensions
    const width = container.clientWidth;
    const height = 200;
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // ---------- Y axis range (0~10) ----------
    const maxScore = 10;

    const getX = (index) => {
      if (data.length === 1) {
        return padding + chartWidth / 2;
      }
      return padding + (index / (data.length - 1)) * chartWidth;
    };

    const getY = (score) => {
      return padding + chartHeight - (score / maxScore) * chartHeight;
    };

    // ---------- Draw trend line ----------
    if (data.length > 1) {
      ctx.strokeStyle = "#7ED321";
      ctx.lineWidth = 3;
      ctx.beginPath();

      data.forEach((point, index) => {
        const x = getX(index);
        const y = getY(point.moodScore);

        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      ctx.stroke();
    }

    // ---------- Draw data points ----------
    data.forEach((point, index) => {
      const x = getX(index);
      const y = getY(point.moodScore);

      ctx.fillStyle = "#7ED321";
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    // ---------- X axis dates ----------
    ctx.fillStyle = "#64748b"; // slate-500
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";

    data.forEach((point, index) => {
      const x = getX(index);
      ctx.fillText(point.dateLabel, x, height - 10);
    });
  }, [data]);

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm items-center">
        <div className="flex items-center justify-start mb-4">
                    <FontAwesomeIcon
                      icon={faChartLine}
                      className="text-2xl text-[#4ADE80] mr-4"
                    />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      7-Day Mood Trend
                    </h3>
                  </div>

      <div ref={containerRef} className="relative w-full h-[200px]">
        <canvas
          ref={canvasRef}
          className="block w-full h-full"
        />
      </div>

      {data.length === 1 && (
        <p className="mt-2 text-xs text-slate-400 text-center">
          Currently only one day of data, trends will form over time
        </p>
      )}
    </div>
  );
}
