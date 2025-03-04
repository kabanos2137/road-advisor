//import
import express, { Express } from "express";
import http, { Server as HTTPServer } from "http";
import { Server } from "socket.io";
import config from "../config.json";

const app: Express = express(); //Init app
const server: HTTPServer = http.createServer(app); //init server
const io = new Server(server, { //Init socket.io
    cors: {
        origin: "*",
    }
});

app.get("/", (req, res) => { //Index.html
    res.status(200).send("Hello World");
});

server.listen(config.port, () => { //Listen on given port
    console.log("Started server: http://localhost:" + config.port);
});
