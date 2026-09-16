import "dotenv/config";
import express from "express";
import cors from "cors";

import fs from "node:fs";
import path from "node:path";

import { clerkMiddleware } from "@clerk/express";
import { clerkWebhookHandler } from "./webhooks/clerk";
import { getEnv } from "./lib/env";


const env = getEnv();
const app = express();

const rawJson = express.raw({type: "application/json", limit: "1mb"});

// it's important you don't parse the webhook event data, it should be in raw format

app.post("/webhooks/clerk", rawJson, (req,res) => {
    void clerkWebhookHandler(req,res);
})

app.use(express.json());
app.use(cors());
app.use(clerkMiddleware())

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

app.listen(env.PORT, () => {
    console.log("Listening on", env.PORT);
});