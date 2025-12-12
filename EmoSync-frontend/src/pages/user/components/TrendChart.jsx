import React, { useRef, useEffect } from 'react';

export default function TrendChart({ data }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || !data || data.length === 0) {
      return;
    }

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext('2d');

    // 设置 canvas 尺寸
    canvas.width = container.clientWidth;
    canvas.height = 200;

    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制趋势线
    if (data.length > 1) {
      const padding = 40;
      const width = canvas.width - padding * 2;
      const height = canvas.height - padding * 2;

      // 绘制趋势线
      ctx.strokeStyle = '#7ED321';
      ctx.lineWidth = 3;
      ctx.beginPath();

      data.forEach((point, index) => {
        const x = padding + (index / (data.length - 1)) * width;
        const y = padding + height - (point.moodScore / 10) * height;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // 绘制数据点
      data.forEach((point, index) => {
        const x = padding + (index / (data.length - 1)) * width;
        const y = padding + height - (point.moodScore / 10) * height;

        ctx.fillStyle = '#7ED321';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }, [data]); 

  return (
    <div ref={containerRef} className="w-full h-[200px] relative">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
    </div>
  );
}