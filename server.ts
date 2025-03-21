import express from "express";
import ViteExpress from "vite-express";
import { initServer } from "./server/api";

const app = express();

initServer(app);

ViteExpress.listen(app, 3000, () => console.log("Server is listening..."));
