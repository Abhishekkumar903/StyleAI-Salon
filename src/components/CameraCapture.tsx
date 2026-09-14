import React, { useEffect, useRef, useState } from "react";
import { Camera, RefreshCw, X, AlertCircle } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (base64Data: string) => void;
  onCancel: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onCapture,
  onCancel,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let currentStream: MediaStream | null = null;
    setIsInitializing(true);
    setError(null);

    async function startCamera() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: facingMode,
              width: { ideal: 1080 },
              height: { ideal: 1080 },
            },
            audio: false,
          });

          currentStream = mediaStream;
          setStream(mediaStream);

          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
            await videoRef.current.play();
          }
        } else {
          throw new Error("Camera API not supported in this browser.");
        }
      } catch (err: any) {
        console.error("Camera access error:", err);
        setError(
          err?.name === "NotAllowedError"
            ? "Camera permission denied. Please enable camera access in browser settings or upload a photo."
            : "Could not start camera. Please upload an image file instead."
        );
      } finally {
        setIsInitializing(false);
      }
    }

    startCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  const handleTakeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 640;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Flip horizontally if front camera for natural mirror feel
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64Data = canvas.toDataURL("image/jpeg", 0.92);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    onCapture(base64Data);
  };

  const toggleFacingMode = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  return (
    <div
      id="camera-capture-overlay"
      className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-md"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 text-white">
        <span className="text-sm font-medium tracking-wide text-neutral-300">
          Position face in center
        </span>
        <button
          id="btn-close-camera"
          onClick={() => {
            if (stream) stream.getTracks().forEach((track) => track.stop());
            onCancel();
          }}
          className="p-2 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 transition-colors"
          aria-label="Close camera"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Viewfinder */}
      <div className="relative flex-1 flex items-center justify-center p-4">
        {error ? (
          <div className="max-w-sm p-6 rounded-2xl bg-neutral-900 border border-red-500/30 text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-neutral-200 text-sm mb-4">{error}</p>
            <button
              onClick={onCancel}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors"
            >
              Choose from Gallery Instead
            </button>
          </div>
        ) : (
          <div className="relative w-full max-w-sm aspect-square rounded-3xl overflow-hidden bg-neutral-950 border border-purple-500/30 shadow-2xl">
            {isInitializing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-neutral-900">
                <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
                <span className="text-xs text-neutral-400">Opening camera...</span>
              </div>
            )}
            <video
              ref={videoRef}
              playsInline
              muted
              className={`w-full h-full object-cover ${
                facingMode === "user" ? "scale-x-[-1]" : ""
              }`}
            />

            {/* Oval Face Guide Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-56 h-72 rounded-[48%] border-2 border-dashed border-purple-400/50 shadow-[0_0_20px_rgba(168,85,247,0.2)]" />
            </div>

            <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none">
              <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] text-purple-200">
                Face the camera with good lighting
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      {!error && (
        <div className="p-6 flex items-center justify-around max-w-sm mx-auto w-full">
          <button
            id="btn-switch-camera"
            onClick={toggleFacingMode}
            className="p-3.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-transform active:scale-95"
            title="Switch front/back camera"
          >
            <RefreshCw className="w-6 h-6" />
          </button>

          <button
            id="btn-shutter-snapshot"
            onClick={handleTakeSnapshot}
            disabled={isInitializing}
            className="w-20 h-20 rounded-full border-4 border-white/80 bg-purple-600 hover:bg-purple-500 active:scale-95 flex items-center justify-center shadow-[0_0_25px_rgba(168,85,247,0.6)] transition-all disabled:opacity-50"
            aria-label="Take Photo"
          >
            <Camera className="w-8 h-8 text-white" />
          </button>

          <div className="w-12" />
        </div>
      )}
    </div>
  );
};
