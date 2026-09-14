import React from "react";
import {
  Sparkles,
  Camera,
  RefreshCw,
  AlertCircle,
  Eye,
  SlidersHorizontal,
} from "lucide-react";
import { HairstyleResult, HairstyleDefinition } from "../types";

interface ResultsGridProps {
  originalImage: string;
  results: HairstyleResult[];
  definitions: HairstyleDefinition[];
  onSelectHairstyle: (result: HairstyleResult) => void;
  onSelectOriginal: () => void;
  onRetryHairstyle: (id: string) => void;
  onNewPhoto: () => void;
  isAiConfigured?: boolean;
}

export const ResultsGrid: React.FC<ResultsGridProps> = ({
  originalImage,
  results,
  definitions,
  onSelectHairstyle,
  onSelectOriginal,
  onRetryHairstyle,
  onNewPhoto,
  isAiConfigured = true,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 pb-24">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/30 text-xs font-semibold text-purple-300 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Same Person • 6 Hairstyles</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Try Different Hairstyles
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Tap any hairstyle to preview larger, compare before/after, or show your barber.
        </p>
      </div>

      {/* Warning if API not configured */}
      {!isAiConfigured && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-1">
              LightX API is not configured. Please add LIGHTX_API_KEY to the server environment.
            </p>
            <p className="text-xs text-amber-300/80">
              Add your LIGHTX_API_KEY in the server environment to generate realistic hairstyle previews.
            </p>
          </div>
        </div>
      )}

      {/* Main Grid: Original Photo + 6 Hairstyles as requested */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. ORIGINAL PHOTO CARD */}
        <div
          id="card-original-photo"
          onClick={onSelectOriginal}
          className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-900 border-2 border-neutral-700 hover:border-purple-400 cursor-pointer shadow-lg transition-all hover:scale-[1.02] flex flex-col"
        >
          <img
            src={originalImage}
            alt="Original"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

          {/* Badge */}
          <div className="absolute top-2.5 left-2.5">
            <span className="px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[10px] font-bold text-neutral-200 border border-white/20">
              Original
            </span>
          </div>

          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white">
            <div>
              <p className="text-xs font-bold text-neutral-200">Original Photo</p>
              <p className="text-[10px] text-neutral-400">Baseline reference</p>
            </div>
            <Eye className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
          </div>
        </div>

        {/* 2-7. THE 6 HAIRSTYLES CARDS */}
        {results.map((item) => {
          const isCompleted = item.status === "completed" && Boolean(item.imageUrl);
          const isGenerating = item.status === "generating";
          const isFailed = item.status === "failed";

          return (
            <div
              key={item.id}
              id={`card-hairstyle-${item.id}`}
              onClick={() => {
                if (isCompleted) {
                  onSelectHairstyle(item);
                } else if (isFailed) {
                  onRetryHairstyle(item.id);
                }
              }}
              className={`group relative aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-900 border transition-all duration-200 shadow-lg flex flex-col ${
                isCompleted
                  ? "border-purple-500/30 hover:border-purple-400 cursor-pointer hover:scale-[1.02] hover:shadow-purple-900/20"
                  : isFailed
                  ? "border-red-500/30 cursor-pointer"
                  : "border-white/5"
              }`}
            >
              {isCompleted ? (
                <>
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent pointer-events-none" />

                  {/* Top Badge */}
                  <div className="absolute top-2.5 right-2.5">
                    <span className="p-1 rounded-full bg-purple-950/80 backdrop-blur-md border border-purple-500/30 text-purple-300 flex items-center justify-center">
                      <SlidersHorizontal className="w-3 h-3" />
                    </span>
                  </div>

                  {/* Title & action */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white">
                    <div className="truncate pr-1">
                      <p className="text-xs font-bold text-white truncate">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-purple-300">Tap to inspect</p>
                    </div>
                    <Sparkles className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform flex-shrink-0" />
                  </div>
                </>
              ) : isGenerating ? (
                <div className="flex-1 flex flex-col items-center justify-center p-3 text-center">
                  <div className="w-9 h-9 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin mb-2" />
                  <p className="text-xs font-semibold text-white mb-0.5">{item.name}</p>
                  <p className="text-[10px] text-neutral-400">Styling...</p>
                </div>
              ) : isFailed ? (
                <div className="flex-1 flex flex-col items-center justify-center p-3 text-center">
                  <AlertCircle className="w-7 h-7 text-red-400 mb-1.5" />
                  <p className="text-xs font-semibold text-white mb-0.5">{item.name}</p>
                  <p className="text-[10px] text-red-300 mb-2">Generation failed</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRetryHairstyle(item.id);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-[10px] text-white flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Retry
                  </button>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-3 text-center">
                  <p className="text-xs font-semibold text-neutral-300 mb-0.5">{item.name}</p>
                  <p className="text-[10px] text-neutral-500">Queued</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Sticky Action Bar (Change photo / try another) */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          id="btn-results-new-photo"
          onClick={onNewPhoto}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-white/10 text-neutral-300 font-medium text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Camera className="w-4 h-4 text-purple-400" />
          <span>Upload Different Photo</span>
        </button>
      </div>
    </div>
  );
};
