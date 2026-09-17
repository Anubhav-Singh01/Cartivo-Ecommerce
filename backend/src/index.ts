import "dotenv/config";
import express from "express";
import cors from "cors";

import fs from "node:fs";
import path from "node:path";

import { clerkMiddleware } from "@clerk/express";
import { clerkWebhookHandler } from "./webhooks/clerk";
import { getEnv } from "./lib/env";

import keepAliveCron from "./lib/cron";
import meRouter from "./routes/meRouter";
import productRouter from "./routes/productRouter";
import streamRouter from "./routes/streamRouter";
import checkoutRouter from "./routes/checkoutRouter"


const env = getEnv();
const app = express();

const rawJson = express.raw({type: "application/json", limit: "1mb"});

// it's important you don't parse the webhook event data, it should be in raw format

app.post("/webhooks/clerk", rawJson, (req,res) => {
    void clerkWebhookHandler(req,res);
})

app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());

app.get("/health", (_req,res) => {
    res.json({ok: true});
});

app.use("/api/me", meRouter);
app.use("/api/product", productRouter);
app.use("/api/stream", streamRouter);
app.use("/api/checkout", checkoutRouter);

const publicDir = path.join(process.cwd(), "public");
if(fs.existsSync(publicDir)){
    app.use(express.static(publicDir));

    app.get("/{*splat}", (req,res,next) => {
        if(req.method !== "GET" && req.method !== "HEAD"){
            next();
            return;
        }

        if(req.path.startsWith("/api") || req.path.startsWith("/webhooks")){
            next();
            return;
        }

        res.sendFile(path.join(publicDir, "index.html"), (err) => {
            if (err) next(err);
        });
    })
}

//todo: add error handler middleware

app.listen(env.PORT, () => {
    console.log("Listening on", env.PORT);
    if(env.NODE_ENV === "production"){
        keepAliveCron.start();
    }
});