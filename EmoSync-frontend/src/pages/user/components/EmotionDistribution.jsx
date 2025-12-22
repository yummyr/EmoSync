import React, { useEffect, useMemo, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartPie } from "@fortawesome/free-solid-svg-icons";
import getEmotionColor from "@/utils/getEmotionColor";

/* ========= Main Component ========= */
export default function EmotionDistribution({ data }) {
  const canvasRef = useRef(null);

  /* ---------- Normalize & Prepare Data ---------- */
  const { chartData, total } = useMemo(() => {
    if (!data || typeof data !== "object") {
      return { chartData: [], total: 0 };
    }

    const entries = Object.entries(data)
      .map(([emotion, count]) => ({
        emotion,
        count: Number(count),
      }))
      .filter((e) => e.count > 0);

    const total = entries.reduce((sum, e) => sum + e.count, 0);

    const chartData = entries.map((e) => ({
      ...e,
      percentage: Math.round((e.count / total) * 100),
      color: getEmotionColor(e.emotion) || "#A9EA68",
    }));

    return { chartData, total };
  }, [data]);

  /* ---------- Draw Pie Chart ---------- */
  useEffect(() => {
    if (!canvasRef.current || chartData.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const size = 220;
    canvas.width = size;
    canvas.height = size;

    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 20;

    ctx.clearRect(0, 0, size, size);

    let startAngle = -Math.PI / 2;

    chartData.forEach((item) => {
      const sliceAngle = (item.count / total) * Math.PI * 2;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();

      ctx.fillStyle = item.color;
      ctx.fill();

      startAngle += sliceAngle;
    });
  }, [chartData, total]);

  /* ---------- Render Component ---------- */
   return (
    <div className="w-full p-6">

      {/* Empty State */}
      {chartData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-gray-400">
          <FontAwesomeIcon icon={faChartPie} className="text-5xl mb-3" />
          <p>No emotion data available</p>
        </div>
      ) : (
        /* Chart Content */
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
          
          {/* Pie Chart - half of the left  */}
          <div className="lg:w-1/2 flex justify-center">
            <div className="relative">
              <canvas 
                ref={canvasRef} 
                className="rounded-full shadow-lg"
              />
              {/* center text */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="text-2xl font-bold text-gray-800">{total}</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
            </div>
          </div>

          {/* Legend + Progress - half of the right */}
          <div className="lg:w-1/2 space-y-4">
            <div className="space-y-3">
              {chartData.map((item) => (
                <div key={item.emotion} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getEmotionColor(item.emotion) }}
                      />
                      <span className="text-base font-medium text-gray-700">
                        {item.emotion}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">{item.count}</span>
                      <span className="text-base font-bold text-gray-800 min-w-[40px] text-right">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: getEmotionColor(item.emotion),
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Total Records */}
            <div className="pt-4 mt-2 border-t border-gray-300">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Total Records</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">{total}</div>
                  <div className="text-xs text-gray-500">entries</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
