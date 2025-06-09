"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export default function AudioTranscription() {
  const [file, setFile] = useState<File | null>(null)
  const [transcription, setTranscription] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile && selectedFile.type.startsWith("audio/")) {
      setFile(selectedFile)
    } else {
      alert("Please select a valid audio file.")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleTranscribe = async () => {
    if (!file) {
      alert("Please upload an audio file first.")
      return
    }

    // Here you would typically send the file to a server for transcription
    // For this example, we'll just simulate a transcription after a delay
    setTranscription("Transcribing...")
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setTranscription(`Transcription of ${file.name}:\n\nThis is a simulated transcription of the uploaded audio file.`)
  }

  return (
    <div className="flex gap-4 p-4">
      <div className="flex-1 space-y-4">
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="block w-full text-sm text-slate-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-violet-50 file:text-violet-700
            hover:file:bg-violet-100"
        />
        {file && <Button onClick={handleTranscribe}>文字起こしを行う</Button>}
      </div>
      <div className="flex-1">
        <Textarea
          value={transcription}
          readOnly
          className="w-full h-full min-h-[200px]"
          placeholder="Transcription will appear here..."
        />
      </div>
    </div>
  )
}

