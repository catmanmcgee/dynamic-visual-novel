import { useState } from "react";

export function useChat() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (
    message: string
  ): Promise<{ content: string; role: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [message],
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
    return { content: "error sorry", role: "system" };
  };

  return {
    isLoading,
    error,
    sendMessage,
  };
}
