"use client";

import AudioTranscription from "@/components/AudioTranscription";
import "@/components/whisper-page";

export default function StudentMainPage() {
  return (
    <div className="w-1/2">
      <AudioTranscription />
    </div>
  );
}
