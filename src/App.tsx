import React, { useState, useEffect } from "react";
import { AppStep, HairstyleResult } from "./types";
import { INITIAL_HAIRSTYLES } from "./data/hairstyles";
import { Navbar } from "./components/Navbar";
import { HomeScreen } from "./components/HomeScreen";
import { UploadPreviewScreen } from "./components/UploadPreviewScreen";
import { ProcessingScreen } from "./components/ProcessingScreen";
import { ResultsGrid } from "./components/ResultsGrid";
import { HairstyleDetailModal } from "./components/HairstyleDetailModal";
import { OriginalPhotoModal } from "./components/OriginalPhotoModal";
import { CameraCapture } from "./components/CameraCapture";

export default function App() {
  const [step, setStep] = useState<AppStep>("home");
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [isAiConfigured, setIsAiConfigured] = useState<boolean>(true);
  const [activeStyleName, setActiveStyleName] = useState<string | undefined>();
  const [selectedHairstyle, setSelectedHairstyle] = useState<HairstyleResult | null>(null);
  const [showOriginalModal, setShowOriginalModal] = useState<boolean>(false);
  const [showCameraCapture, setShowCameraCapture] = useState<boolean>(false);

  // Initialize the 6 required hairstyles results state
  const [results, setResults] = useState<HairstyleResult[]>(() =>
    INITIAL_HAIRSTYLES.map((h) => ({
      id: h.id,
      name: h.name,
      shortName: h.shortName,
      status: "idle",
    }))
  );

  // Check backend AI configuration status on mount
  useEffect(() => {
    async function checkConfig() {
      try {
        const res = await fetch("/api/config-status");
        if (res.ok) {
          const data = await res.json();
          setIsAiConfigured(Boolean(data.configured));
        }
      } catch (err) {
        console.warn("Could not check AI config status:", err);
      }
    }
    checkConfig();
  }, []);

  // Handler: When user selects or takes a photo
  const handlePhotoSelected = (base64Image: string) => {
    setUploadedPhoto(base64Image);
    setShowCameraCapture(false);
    // Reset any previous hairstyle results for new photo
    setResults(
      INITIAL_HAIRSTYLES.map((h) => ({
        id: h.id,
        name: h.name,
        shortName: h.shortName,
        status: "idle",
      }))
    );
    setStep("upload_preview");
  };

  // Handler: When user confirms "Use This Photo"
  const handleConfirmPhoto = async () => {
    if (!uploadedPhoto) return;

    setStep("processing");

    // Re-verify AI configuration status dynamically
    let configured = isAiConfigured;
    try {
      const checkRes = await fetch("/api/config-status");
      if (checkRes.ok) {
        const checkData = await checkRes.json();
        configured = Boolean(checkData.configured);
        setIsAiConfigured(configured);
      }
    } catch {
      // keep current status
    }

    // Check if AI is configured first
    if (!configured) {
      // Transition to results screen so the mandated message is clearly visible
      setResults(
        INITIAL_HAIRSTYLES.map((h) => ({
          id: h.id,
          name: h.name,
          shortName: h.shortName,
          status: "failed",
          error:
            "LightX API is not configured. Please add LIGHTX_API_KEY to the server environment.",
        }))
      );
      setStep("results");
      return;
    }

    // Sequentially / progressively generate the 6 styles
    for (let i = 0; i < INITIAL_HAIRSTYLES.length; i++) {
      const def = INITIAL_HAIRSTYLES[i];
      setActiveStyleName(def.name);

      // Mark current style as generating
      setResults((prev) =>
        prev.map((r) => (r.id === def.id ? { ...r, status: "generating" } : r))
      );

      try {
        const res = await fetch("/api/generate-hairstyle", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image: uploadedPhoto,
            hairstyle: def.name,
          }),
        });

        const data = await res.json();

        if (res.ok && data.imageUrl) {
          setResults((prev) =>
            prev.map((r) =>
              r.id === def.id
                ? {
                    ...r,
                    status: "completed",
                    imageUrl: data.imageUrl,
                  }
                : r
            )
          );
        } else {
          const isConfigIssue = Boolean(
            data.notConfigured ||
              res.status === 503 ||
              data.error?.includes("not configured") ||
              data.error?.includes("LIGHTX_API_KEY")
          );

          if (isConfigIssue) {
            setIsAiConfigured(false);
            const msg =
              "LightX API is not configured. Please add LIGHTX_API_KEY to the server environment.";
            setResults((prev) =>
              prev.map((r) =>
                r.status === "completed"
                  ? r
                  : { ...r, status: "failed", error: msg }
              )
            );
            // Stop further failed requests immediately
            break;
          }

          setResults((prev) =>
            prev.map((r) =>
              r.id === def.id
                ? {
                    ...r,
                    status: "failed",
                    error:
                      "Unable to generate hairstyle preview right now. Please try again.",
                  }
                : r
            )
          );
        }
      } catch (err: any) {
        console.error(`Error generating ${def.name}`);
        setResults((prev) =>
          prev.map((r) =>
            r.id === def.id
              ? {
                  ...r,
                  status: "failed",
                  error:
                    "Unable to generate hairstyle preview right now. Please try again.",
                }
              : r
          )
        );
      }
    }

    setActiveStyleName(undefined);
    setStep("results");
  };

  // Handler: Retry a single hairstyle
  const handleRetryHairstyle = async (hairstyleId: string) => {
    if (!uploadedPhoto) return;
    const def = INITIAL_HAIRSTYLES.find((h) => h.id === hairstyleId);
    if (!def) return;

    setResults((prev) =>
      prev.map((r) =>
        r.id === hairstyleId ? { ...r, status: "generating", error: undefined } : r
      )
    );

    try {
      const res = await fetch("/api/generate-hairstyle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: uploadedPhoto,
          hairstyle: def.name,
        }),
      });

      const data = await res.json();
      if (res.ok && data.imageUrl) {
        setResults((prev) =>
          prev.map((r) =>
            r.id === hairstyleId
              ? { ...r, status: "completed", imageUrl: data.imageUrl }
              : r
          )
        );
      } else {
        const isConfigIssue = Boolean(
          data.notConfigured ||
            res.status === 503 ||
            data.error?.includes("not configured") ||
            data.error?.includes("LIGHTX_API_KEY")
        );
        if (isConfigIssue) setIsAiConfigured(false);
        setResults((prev) =>
          prev.map((r) =>
            r.id === hairstyleId
              ? {
                  ...r,
                  status: "failed",
                  error: isConfigIssue
                    ? "LightX API is not configured. Please add LIGHTX_API_KEY to the server environment."
                    : "Unable to generate hairstyle preview right now. Please try again.",
                }
              : r
          )
        );
      }
    } catch (err: any) {
      setResults((prev) =>
        prev.map((r) =>
          r.id === hairstyleId
            ? {
                ...r,
                status: "failed",
                error:
                  "Unable to generate hairstyle preview right now. Please try again.",
              }
            : r
        )
      );
    }
  };

  // Handler: New photo reset
  const handleNewPhoto = () => {
    setUploadedPhoto(null);
    setSelectedHairstyle(null);
    setStep("home");
  };

  // Get active definition for modal
  const selectedDef = selectedHairstyle
    ? INITIAL_HAIRSTYLES.find((h) => h.id === selectedHairstyle.id) ||
      INITIAL_HAIRSTYLES[0]
    : INITIAL_HAIRSTYLES[0];

  return (
    <div className="min-h-screen bg-[#0a0910] text-neutral-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      {/* Sticky Top Navigation */}
      <Navbar
        hasPhoto={Boolean(uploadedPhoto)}
        onNewPhoto={handleNewPhoto}
        isAiConfigured={isAiConfigured}
      />

      {/* Main Content Areas */}
      <main className="flex-1 flex flex-col">
        {step === "home" && (
          <HomeScreen
            onPhotoSelected={handlePhotoSelected}
            onOpenLiveCamera={() => setShowCameraCapture(true)}
            isAiConfigured={isAiConfigured}
          />
        )}

        {step === "upload_preview" && uploadedPhoto && (
          <UploadPreviewScreen
            image={uploadedPhoto}
            onConfirm={handleConfirmPhoto}
            onRetake={() => setStep("home")}
          />
        )}

        {step === "processing" && uploadedPhoto && (
          <ProcessingScreen
            originalImage={uploadedPhoto}
            results={results}
            activeStyleName={activeStyleName}
            onCancel={() => setStep("home")}
          />
        )}

        {step === "results" && uploadedPhoto && (
          <ResultsGrid
            originalImage={uploadedPhoto}
            results={results}
            definitions={INITIAL_HAIRSTYLES}
            onSelectHairstyle={(r) => setSelectedHairstyle(r)}
            onSelectOriginal={() => setShowOriginalModal(true)}
            onRetryHairstyle={handleRetryHairstyle}
            onNewPhoto={handleNewPhoto}
            isAiConfigured={isAiConfigured}
          />
        )}
      </main>

      {/* Live Camera Viewfinder Overlay */}
      {showCameraCapture && (
        <CameraCapture
          onCapture={handlePhotoSelected}
          onCancel={() => setShowCameraCapture(false)}
        />
      )}

      {/* Original Photo Enlarged Modal */}
      {showOriginalModal && uploadedPhoto && (
        <OriginalPhotoModal
          image={uploadedPhoto}
          onClose={() => setShowOriginalModal(false)}
        />
      )}

      {/* Hairstyle Detail & Before/After Modal (Flow Steps 7, 8, 9) */}
      {selectedHairstyle && uploadedPhoto && (
        <HairstyleDetailModal
          originalImage={uploadedPhoto}
          selectedResult={selectedHairstyle}
          definition={selectedDef}
          allResults={results.filter((r) => r.status === "completed")}
          onSelectHairstyle={(res) => setSelectedHairstyle(res)}
          onClose={() => setSelectedHairstyle(null)}
          onTryAnotherStyle={() => setSelectedHairstyle(null)}
        />
      )}
    </div>
  );
}
