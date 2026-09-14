import React from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { HairstyleResult } from "../types";

interface ProcessingScreenProps {
  originalImage: string;
  results: HairstyleResult[];
  activeStyleName?: string;
  onCancel?: () => void;
}

export const ProcessingScreen: React.FC<ProcessingScreenProps> = ({
  originalImage,
  results,
  activeStyleName,
  onCancel,
}) => {
  const completedCount = results.filter((r) => r.status === "completed").length;
  const totalCount = results.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8 max-w-md mx-auto text-center">
      <div className="w-full bg-neutral-950/80 border border-purple-900/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Thumbnail of original photo */}
        <div className="relative w-24 h-24 mx-auto mb-6 rounded-2xl overflow-hidden border-2 border-purple-500/50 shadow-lg">
          <img
            src={originalImage}
            alt="Original"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-purple-950/30 backdrop-blur-[1px] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-purple-300 animate-spin" />
          </div>
        </div>

        {/* Required main text */}
        <h2 className="text-2xl font-extrabold text-white tracking-tight mb-2">
          Creating your hairstyle preview...
        </h2>

        {/* Subtext */}
        <p className="text-xs text-neutral-400 max-w-xs mx-auto mb-6">
          Preserving your identity, facial structure, and lighting while generating 6 realistic styles.
        </p>

        {/* Active style ticker */}
        {activeStyleName && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-900/40 border border-purple-500/30 text-xs text-purple-300 mb-6 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Styling: {activeStyleName}</span>
          </div>
        )}

        {/* Progress Bar */}
        <div className="w-full bg-neutral-900 rounded-full h-2.5 mb-2 overflow-hidden border border-white/5">
          <div
            className="bg-gradient-to-r from-purple-600 to-fuchsia-500 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.max(10, progressPercent)}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-xs text-neutral-400 mb-6">
          <span>{completedCount} of {totalCount} styles ready</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>

        {/* List of 6 styles progress checklist */}
        <div className="space-y-2 text-left text-xs mb-6 max-h-48 overflow-y-auto">
          {results.map((r) => {
            const isDone = r.status === "completed";
            const isCurrent = r.status === "generating";
            const isFailed = r.status === "failed";

            return (
              <div
                key={r.id}
                className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                  isDone
                    ? "bg-purple-950/30 border-purple-500/30 text-white"
                    : isCurrent
                    ? "bg-neutral-900 border-purple-500/50 text-purple-200"
                    : isFailed
                    ? "bg-neutral-900/60 border-red-500/30 text-red-300"
                    : "bg-neutral-900/40 border-white/5 text-neutral-500"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{r.name}</span>
                </div>
                {isDone ? (
                  <span className="text-purple-400 font-semibold">Ready ✓</span>
                ) : isCurrent ? (
                  <Loader2 className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                ) : isFailed ? (
                  <span className="text-red-400">Failed</span>
                ) : (
                  <span className="text-neutral-500">Waiting...</span>
                )}
              </div>
            );
          })}
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            Cancel & Pick another photo
          </button>
        )}
      </div>
    </div>
  );
};
