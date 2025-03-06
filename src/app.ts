//import
import express, { Express, Request, Response } from "express";
import http, { Server as HTTPServer } from "http";
import { Server, Socket } from "socket.io";
import path from "node:path";
import { data } from "./telemetry";
import * as fs from "node:fs";
import { spawn } from "node:child_process";
import net from "net";
import SpotifyWebApi from 'spotify-web-api-node';
import * as dotenv from "dotenv";

dotenv.config();

const app: Express = express(); //Init app
const staticPath = path.join(__dirname, '..', 'static')
app.use(express.static(staticPath));

const server: HTTPServer = http.createServer(app); //init server
const io = new Server(server, { //Init socket.io
    cors: {
        origin: "*",
    }
});

const config = () => {
    return JSON.parse(fs.readFileSync(path.join(__dirname, "..", "config.json")).toString()) as Config;
}

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: "http://localhost/callback"
});

const isPortInUse = (port: number): Promise<boolean> => {
    return new Promise((resolve) => {
        const server = net.createServer();

        server.once("error", (err: any) => {
            resolve(err.code === "EADDRINUSE"); // Port zajęty
        });

        server.once("listening", () => {
            server.close();
            resolve(false); // Port wolny
        });

        server.listen(port);
    });
};

app.get("/", (_: Request, res: Response) => { //Index.html
    res.status(200).sendFile(path.join(staticPath, "html", "index.html"));
});

app.get("/api/config", (_: Request, res: Response) => {
    res.status(200).send(config());
});

app.get("/login", (_: Request, res: Response) => {
    if(spotifyApi.getAccessToken() === undefined) {
        const scopes = ['user-read-private', 'user-read-email', 'user-top-read', 'user-read-recently-played'];
        const authURL = spotifyApi.createAuthorizeURL(scopes, '');
        res.redirect(authURL);
    }else{
        res.redirect("/?s=true");
    }
});

app.get('/callback', async (req: Request, res: Response) => {
    const code = req.query.code as string;
    try {
        const data = await spotifyApi.authorizationCodeGrant(code);
        spotifyApi.setAccessToken(data.body['access_token']);
        spotifyApi.setRefreshToken(data.body['refresh_token']);

        res.redirect("/?s=true");
    } catch (error) {
        console.error("Error: ", error);
        res.send("Login error!");
    }
})

server.listen(config().port, () => { //Listen on given port
    console.log("Started server: http://localhost:" + config().port);
});

io.on("connection", (socket: Socket) => {
    // @ts-ignore
    console.log(`Client connected: ${socket.id}`);

    socket.on("get-speed", () => {
        if(data !== undefined){ //Emit only if data is not empty
            socket.emit("get-speed", {
                unit: config().unit,
                speed: (config().unit === "km/h") ? data.truck.speed.kph : data.truck.speed.mph,
                limit: (config().unit === "km/h") ? data.navigation.speedLimit.kph : data.navigation.speedLimit.mph
            });
        }
    });

    socket.on("get-fuel", () => {
        if(data !== undefined){ //Emit only if data is not empty
            socket.emit("get-fuel", {
                capacity: data.truck.fuel.capacity,
                value: data.truck.fuel.value,
            });
        }
    });

    socket.on("get-adblue", () => {
        if(data !== undefined){ //Emit only if data is not empty
            socket.emit("get-adblue", {
                capacity: data.truck.adBlue.capacity,
                value: data.truck.adBlue.value,
            });
        }
    });

    socket.on("get-gear", () => {
        if(data !== undefined){
            socket.emit("get-gear", {
                gear: data.truck.transmission.gear.displayed,
            });
        }
    });

    socket.on("get-c-control", () => {
        if(data !== undefined){
            socket.emit("get-c-control", {
                enabled: data.truck.cruiseControl.enabled,
                value: config().unit === "km/h" ? data.truck.cruiseControl.kph : data.truck.cruiseControl.mph,
                unit: config().unit,
            })
        }
    });

    socket.on("get-port-taken", (port: number) => {
        if(port !== config().port){
            isPortInUse(port).then((reachable) => {
                if(reachable){
                    socket.emit("get-port-taken", {
                        port: port,
                        target: true
                    })
                }else{
                    socket.emit("get-port-taken", {
                        port: port,
                        target: false
                    })
                }
            });
        }else{
            socket.emit("get-port-taken", {
                port: port,
                target: false
            })
        }
    })

    socket.on("set-config", (data: Config) => {
        if(data.port !== config().port){
            fs.writeFileSync(path.join(__dirname, "..", "config.json"), JSON.stringify(data, null, 2));
            socket.broadcast.emit("set-port", data.port);
            spawn(process.argv[0], process.argv.slice(1), {
                detached: true,
                stdio: "inherit"
            });
            process.exit(0);
        }else{
            fs.writeFileSync(path.join(__dirname, "..", "config.json"), JSON.stringify(data, null, 2));
        }
    });

    socket.on("get-token-spotify", () => {
       socket.emit("get-token-spotify", spotifyApi.getAccessToken());
    });
});