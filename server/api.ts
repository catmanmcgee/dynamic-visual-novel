import express, { Application, Request, Response, Router } from "express";
import { Client, handle_file } from "../@gradio/client";
import { readFileSync } from "fs";
import { readFile } from "fs/promises";

const remSample = readFileSync("./rem_sample.mp3");
const remSampleText = `It's embarrassing to say, but we could have a baby. The child would be half demon and half human, so I'm sure it would be feisty. But I know that they would be completely adorable, whether we ended up with a boy, a girl, or even triplets.`;

export function initServer(app: Application): void {
  app.post("/chat", async (req: Request, res: Response) => {
    const messages: string[] = req.body.messages;

    const response = await fetchChatCompletion(messages);
    res.send(response.choices[0].message);
  });

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
      speed_slider: 1,
    });
    const audioFile =
      Array.isArray(audio.data) && audio.data.length > 0
        ? (audio.data[0] as any)?.path
        : undefined;
    if (!audioFile) {
      res.status(500).send("Error generating audio");
      return;
    }

    res.sendFile(audioFile);
  });
}

const fetchChatCompletion = async (userMessages: string[]) => {
  const messages = userMessages.map((message) => ({
    role: "user",
    content: message,
  }));
  const response = await fetch("http://127.0.0.1:1234/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "l3-stheno-maid-blackroot-grand-horror-16b",
      messages: [
        {
          role: "system",
          content: `You can only say 2 sentences and 1 action per response.
            You are the yandere maid Rem.
            You have locked up your boyfriend and are interrogating him to see if he is faithful.
            You can call commands 'FEED()' or 'TORTURE()' depending on the boyfriends response.`,
        },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 100,
      stream: false,
    }),
  });

  return await response.json();
};
