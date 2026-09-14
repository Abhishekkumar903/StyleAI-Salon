import React from "react";
import { Sparkles, Camera, AlertTriangle } from "lucide-react";

interface NavbarProps {
  hasPhoto: boolean;
  onNewPhoto: () => void;
  isAiConfigured?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  hasPhoto,
  onNewPhoto,
  isAiConfigured = true,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-purple-950/40 bg-neutral-950/80 backdrop-blur-md">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-sm shadow-purple-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white">
                StyleAI <span className="text-purple-400 font-medium">Salon</span>
              </h1>
            </div>
            <p className="text-[10px] text-neutral-400 -mt-0.5">
              Virtual Hairstyle Preview
            </p>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {!isAiConfigured && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">API Required</span>
            </div>
          )}

          {hasPhoto && (
            <button
              id="btn-nav-new-photo"
              onClick={onNewPhoto}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-purple-500/30 text-neutral-200 text-xs font-medium transition-all active:scale-95"
            >
              <Camera className="w-3.5 h-3.5 text-purple-400" />
              <span>Change Photo</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
