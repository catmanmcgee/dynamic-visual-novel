import express from "express";
import ViteExpress from "vite-express";
import { initServer } from "./server/api";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

initServer(app);

ViteExpress.listen(app, 3000, () => console.log("Server is listening..."));
