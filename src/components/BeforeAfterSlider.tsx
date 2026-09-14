import React, { useState, useRef, useCallback, useEffect } from "react";
import { Sparkles, Image as ImageIcon } from "lucide-react";

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
  fitMode?: "contain" | "cover";
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = "Original",
  afterLabel = "New Hairstyle",
  className = "",
  fitMode = "contain",
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  // Dynamically update container width on mount and resize for exact pixel alignment
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percentage);
    },
    []
  );

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleMove(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    handleMove(e.touches[0].clientX);
  };

  const imageFitClass =
    fitMode === "contain"
      ? "object-contain"
      : "object-cover object-top";

  return (
    <div
      ref={containerRef}
      id="before-after-container"
      className={`relative select-none overflow-hidden rounded-2xl bg-neutral-950 shadow-2xl touch-none ${className}`}
      onMouseDown={handleMouseDown}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchEnd={() => setIsDragging(false)}
      onTouchMove={handleTouchMove}
    >
      {/* After image (Underneath / full width) */}
      <img
        src={afterImage}
        alt={afterLabel}
        referrerPolicy="no-referrer"
        className={`w-full h-full ${imageFitClass} pointer-events-none`}
      />

      {/* Before image (Clipped on the left) */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ width: `${sliderPosition}%` }}
      >
        <img
          src={beforeImage}
          alt={beforeLabel}
          referrerPolicy="no-referrer"
          className={`absolute inset-0 max-w-none ${imageFitClass} pointer-events-none`}
          style={{
            // Match container width precisely to guarantee zero distortion
            width: containerWidth > 0 ? `${containerWidth}px` : "100%",
            height: "100%",
          }}
        />
      </div>

      {/* Divider line & handle */}
      <div
        className="absolute top-0 bottom-0 pointer-events-none"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-0 bottom-0 -left-[1.5px] w-[3px] bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.8)]" />

        <div className="absolute top-1/2 -left-4 -translate-y-1/2 w-8 h-8 rounded-full bg-purple-600 border-2 border-white shadow-lg flex items-center justify-center pointer-events-auto cursor-ew-resize transition-transform hover:scale-110 active:scale-95">
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M8 9l-3 3m0 0l3 3m-3-3h12m-3-3l3 3m0 0l-3 3"
            />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-3 pointer-events-none">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-xs font-semibold text-neutral-200 border border-white/10">
          <ImageIcon className="w-3 h-3 text-neutral-400" />
          {beforeLabel}
        </span>
      </div>

      <div className="absolute top-3 right-3 pointer-events-none">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-900/80 backdrop-blur-md text-xs font-semibold text-purple-200 border border-purple-500/30 shadow-sm">
          <Sparkles className="w-3 h-3 text-purple-300" />
          {afterLabel}
        </span>
      </div>

      {/* Helper text on bottom */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none">
        <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[10px] text-neutral-300 tracking-wide uppercase font-medium">
          Drag to compare
        </span>
      </div>
    </div>
  );
};
