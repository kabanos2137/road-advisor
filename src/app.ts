//import
import express, { Express, Request, Response } from "express";
import http, { Server as HTTPServer } from "http";
import { Server } from "socket.io";
import config from "../config.json";
import { data } from "./telemetry";
import path from "node:path";

const app: Express = express(); //Init app
const staticPath = path.join(__dirname, '..', 'static')
app.use(express.static(staticPath));

const server: HTTPServer = http.createServer(app); //init server
const io = new Server(server, { //Init socket.io
    cors: {
        origin: "*",
    }
});

app.get("/", (_: Request, res: Response) => { //Index.html
    res.status(200).sendFile(path.join(staticPath, "html", "index.html"));
});

server.listen(config.port, () => { //Listen on given port
    console.log("Started server: http://localhost:" + config.port);
});
