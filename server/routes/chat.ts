import { Application, Request, Response } from "express";

export function initChatRoutes(app: Application): void {
  app.post("/chat", async (req: Request, res: Response) => {
    const messages: string[] = req.body.messages;

    const response = await fetchChatCompletion(messages);
    res.send(response.choices[0].message);
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
          content: `You are playing a game where you speak to the player using quotes " ".
            You are the yandere maid Rem.
            You have locked up your boyfriend and are interrogating him to see if he is faithful.
            `,
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
