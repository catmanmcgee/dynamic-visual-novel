import { Application, Request, Response } from "express";

let isGenerating = false;

export function initTxt2ImgRoutes(app: Application): void {
  app.post("/txt2img", async (req: Request, res: Response) => {
    const { subject, environment, width, height } = req.body;

    if (isGenerating) {
      res.status(400).json({ error: "Already generating an image" });
      return;
    }
    isGenerating = true;
    try {
      const response = await fetch("http://127.0.0.1:7860/sdapi/v1/txt2img", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: `perfect quality, best quality, absolutely eye-catching,
            <lora:illustriousXL_stabilizer_v1.72:0.8> <lora:Rem:1> rem (re:zero), roswaal mansion maid uniform,
            ${subject},
            ${environment},
            ${subject}`,
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
          override_settings: {
            sd_model_checkpoint: "illustriousXL_v01.safetensors",
          },
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
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      res.status(200).json({ images: data.images });
    } catch (error) {
      console.error("Error in txt2img route:", error);
      res.status(500).json({ error: "Internal server error" });
    }
    isGenerating = false;
  });
}
