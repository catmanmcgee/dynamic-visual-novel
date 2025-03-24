import express, { Application } from "express";
import { initChatRoutes } from "./routes/chat";
import { initSpeakRoutes } from "./routes/speak";
import { initTxt2ImgRoutes } from "./routes/txt2img";

export function initServer(app: Application): void {
  initChatRoutes(app);
  initSpeakRoutes(app);
  initTxt2ImgRoutes(app);
}
