import { useState } from "react";

export function useVoiceTranscription() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const voiceTranscribe = async (message: string): Promise<unknown> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/speak", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.arrayBuffer(); // Fetch the .wav file as an ArrayBuffer

      // Play the .wav file using AudioContext
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(data);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
    } finally {
      setIsLoading(false);
    }
    return {};
  };

  return {
    isLoading,
    error,
    voiceTranscribe,
  };
}
