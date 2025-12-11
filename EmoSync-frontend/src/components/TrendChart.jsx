import React, { useEffect, useRef } from "react";

export default function TrendChart({ data }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!data?.length) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = 200;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const padding = 30;
    const w = canvas.width - padding * 2;
    const h = canvas.height - padding * 2;

    ctx.beginPath();
    ctx.strokeStyle = "#22C55E";
    ctx.lineWidth = 3;

    data.forEach((p, i) => {
      const x = padding + (i / (data.length - 1)) * w;
      const y = padding + h - (p.moodScore / 10) * h;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });

    ctx.stroke();
  }, [data]);

  return <canvas ref={canvasRef} />;
}
