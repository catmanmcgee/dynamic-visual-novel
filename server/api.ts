import express, { Router } from "express";

export function initServer(app: Expres): void {
  app.get("/test", (req, res) => {
    res.send("Hello 2 World");
  });
}
