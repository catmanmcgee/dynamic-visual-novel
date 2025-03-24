import { useState } from "react";

function makeRequest({
  subject,
  environment,
  width,
  height,
}: {
  subject: string;
  environment: string;
  width: number;
  height: number;
}) {
  return {
    prompt: makePrompt(subject, environment),
    negative_prompt:
      "worst quality, comic, multiple views, bad quality, low quality, lowres, displeasing, very displeasing, bad anatomy, bad hands, scan artifacts, monochrome, greyscale, twitter username, jpeg artifacts, 2koma, 4koma, guro, extra digits, fewer digits, jaggy lines, unclear , loli, nsfw",
    seed: -1,
    sampler_name: "DPM++ 2M SDE Heun",
    scheduler: "Karras",
    batch_size: 1,
    n_iter: 1,
    steps: 20,
    cfg_scale: 5.5,
    width,
    height,
    restore_faces: false,
    do_not_save_samples: false,
    do_not_save_grid: false,
    denoising_strength: 0.8,
    override_settings: { sd_model_checkpoint: "illustriousXL_v01.safetensors" },
    override_settings_restore_afterwards: false,
    disable_extra_networks: false,
    comments: {},
    enable_hr: false,
    hr_scale: 2,
    hr_upscaler: "Latent",
    hr_second_pass_steps: 0,
    hr_resize_x: width * 2,
    hr_resize_y: height * 2,
    sampler_index: "Euler",
    script_args: [],
    send_images: true,
    save_images: true,
  };
}

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
export function useTxt2Img({
  subject,
  environment,
  screen,
}: {
  subject: string;
  environment: string;
  screen: Screen;
}) {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const storageKey = `txt2img_${subject}_${environment}`;

  const generateImages = async () => {
    setLoading(true);
    setError(null);

    const cachedImages = localStorage.getItem(storageKey);

    if (cachedImages) {
      try {
        setImages(JSON.parse(cachedImages) as string[]);
        setLoading(false);
        return;
      } catch (err) {
        console.error("Error parsing cached images:", err);
        localStorage.removeItem(storageKey); // Clear corrupted cache
      }
    }

    try {
      const result = await makeTxt2ImgRequest({
        subject,
        environment,
        width: screen.width,
        height: screen.height,
      });
      setImages(result);
      localStorage.setItem(storageKey, JSON.stringify(result));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    setImages([]);
    setError(null);
    setLoading(true);
    localStorage.removeItem(storageKey);

    generateImages();
  };

  return { images, loading, error, refresh, generateImages };
}
