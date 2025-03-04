//import
import express, { Express, Request, Response } from "express";
import http, { Server as HTTPServer } from "http";
import { Server, Socket } from "socket.io";
import config from "../config.json";
import path from "node:path";
import { data } from "./telemetry";

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

io.on("connection", (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("get-speed", () => {
        socket.emit("get-speed", {
            unit: config.unit,
            speed: (config.unit === "km/h") ? data.truck.speed.kph : data.truck.speed.mph,
            limit: (config.unit === "km/h") ? data.navigation.speedLimit.kph : data.navigation.speedLimit.mph
        });
    });

    socket.on("get-fuel", () => {
        socket.emit("get-fuel", {
            capacity: data.truck.fuel.capacity,
            value: data.truck.fuel.value,
        });
    })
});