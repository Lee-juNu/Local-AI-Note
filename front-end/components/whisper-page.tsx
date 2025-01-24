import { Upload, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function WhisperPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8">Whisper</h1>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex flex-col items-center">
          <Link href="/whisper/upload-to-text">
            <Button
              variant="outline"
              size="icon"
              className="w-24 h-24 rounded-full"
              aria-label="アップロードして文字起こし"
            >
              <Upload className="h-12 w-12" />
            </Button>
          </Link>
          <p className="mt-4 text-center">
            アップロードして
            <br />
            文字起こし
          </p>
        </div>

        <div className="flex flex-col items-center">
          <Link href="/whisper/realtime-to-text">
            <Button
              variant="outline"
              size="icon"
              className="w-24 h-24 rounded-full"
              aria-label="リアルタイムで文字起こし"
            >
              <Mic className="h-12 w-12" />
            </Button>
          </Link>
          <p className="mt-4 text-center">
            リアルタイムで
            <br />
            文字起こし
          </p>
        </div>
      </div>
    </div>
  );
}
