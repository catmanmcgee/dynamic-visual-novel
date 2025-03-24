import { Application, Request, Response } from "express";
import { Client, handle_file } from "../../@gradio/client";
import { readFileSync } from "fs";

const remSample = readFileSync("./rem_sample.mp3");
const remSampleText = `It's embarrassing to say, but we could have a baby. The child would be half demon and half human, so I'm sure it would be feisty. But I know that they would be completely adorable, whether we ended up with a`;

export function initSpeakRoutes(app: Application): void {
  app.post("/speak", async (req: Request, res: Response) => {
    const message: string = req.body.message;

    const app = await Client.connect("http://127.0.0.1:7861/");
    const audio = await app.predict("/basic_tts", {
      ref_audio_input: handle_file(Buffer.from(remSample)),
      ref_text_input: remSampleText,
      gen_text_input: message,
      remove_silence: false,
      cross_fade_duration_slider: 0.15,
      nfe_slider: 32,
      speed_slider: 0.7,
    });
    const audioFile =
      Array.isArray(audio.data) && audio.data.length > 0
        ? (audio.data[0] as any)?.path
        : undefined;
    if (!audioFile) {
      res.status(500).send("Error generating audio");
      return;
    }

    res.header("cors");
    res.sendFile(audioFile);
  });
}
