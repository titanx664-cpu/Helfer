import { useEffect, useRef } from "react";

interface WaveformVisualizerProps {
  audioData: Uint8Array | null;
  isActive: boolean;
}

export function WaveformVisualizer({ audioData, isActive }: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const barsRef = useRef<number[]>(new Array(40).fill(0));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      const barCount = 40;
      const barWidth = (width / barCount) * 0.6;
      const gap = (width / barCount) * 0.4;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < barCount; i++) {
        let targetHeight: number;

        if (isActive && audioData && audioData.length > 0) {
          const dataIndex = Math.floor((i / barCount) * audioData.length);
          targetHeight = (audioData[dataIndex] / 255) * height * 0.9;
        } else if (isActive) {
          targetHeight = Math.random() * height * 0.5 + height * 0.1;
        } else {
          targetHeight = height * 0.05;
        }

        barsRef.current[i] += (targetHeight - barsRef.current[i]) * 0.15;
        const barHeight = Math.max(4, barsRef.current[i]);

        const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
        
        if (isActive) {
          gradient.addColorStop(0, "hsl(187, 100%, 50%)");
          gradient.addColorStop(0.5, "hsl(280, 100%, 65%)");
          gradient.addColorStop(1, "hsl(300, 100%, 55%)");
        } else {
          gradient.addColorStop(0, "hsl(225, 20%, 20%)");
          gradient.addColorStop(1, "hsl(225, 20%, 15%)");
        }

        const x = i * (barWidth + gap) + gap / 2;
        const radius = barWidth / 2;

        ctx.beginPath();
        ctx.roundRect(x, height - barHeight, barWidth, barHeight, radius);
        ctx.fillStyle = gradient;
        ctx.fill();

        if (isActive) {
          ctx.shadowColor = "hsl(187, 100%, 50%)";
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioData, isActive]);

  return (
    <div 
      className="w-full max-w-xs"
      data-testid="waveform-visualizer"
      aria-label="Audio waveform visualization"
      role="img"
    >
      <canvas
        ref={canvasRef}
        width={320}
        height={80}
        className="w-full h-20"
      />
    </div>
  );
}
