import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useState } from "react";

async function makeTxt2ImgRequest({
  subject,
  environment,
  width,
  height,
}: {
  subject: string;
  environment: string;
  width?: number;
  height?: number;
}) {
  width = Math.min(width ?? 896, 1024);
  height = Math.min(height ?? 1197, 1280);
  try {
    const response = await fetch("/txt2img", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subject,
        environment,
        width,
        height,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.images;
  } catch (error) {
    console.error("Error making txt2img request:", error);
    throw error;
  }
}

function makePrompt(subject: string, environment: string): string {
  return `perfect quality, best quality, absolutely eye-catching,
  <lora:illustriousXL_stabilizer_v1.72:0.8> <lora:Rem:1> rem (re:zero), roswaal mansion maid uniform,
    ${subject},
    ${environment},
    ${subject}`;
}

const generateImagesAtom = atomWithStorage<string[]>(
  "txt2img_images",
  [],
  undefined,
  { getOnInit: true }
);

let isGenerating = false;

export function useTxt2Img({
  subject,
  environment,
  screen,
}: {
  subject: string;
  environment: string;
  screen: Screen;
}) {
  const [images, setImages] = useAtom(generateImagesAtom);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateImages = async () => {
    setLoading(true);
    setError(null);

    if (isGenerating) {
      return;
    }
    isGenerating = true;
    try {
      const result = await makeTxt2ImgRequest({
        subject,
        environment,
        width: screen.width,
        height: screen.height,
      });
      setImages(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
      isGenerating = false;
    }
  };

  const refresh = () => {
    setImages([]);
    setError(null);
    setLoading(true);

    generateImages();
  };

  return { images, loading, error, refresh, generateImages };
}
