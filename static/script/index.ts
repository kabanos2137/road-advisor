// @ts-ignore
const socket = io();

let view: View = "DASHBOARD";
let authTokenSpotify: string | null = null;

const apps: App[] = [
    {
        name: "Dashboard",
        logo: "../icons/home.ico",
        view: "DASHBOARD"
    },
    {
        name: "Spotify",
        logo: "../icons/spotify.ico",
        view: "SPOTIFY"
    },
    {
        name: "Settings",
        logo: "../icons/settings.ico",
        view: "SETTINGS"
    },
]

setInterval(() => {
    socket.emit("get-token-spotify");
    if(view == "DASHBOARD"){
        socket.emit("get-speed");
        socket.emit("get-fuel");
        socket.emit("get-adblue");
        socket.emit("get-gear");
        socket.emit("get-c-control");
    }
}, 150);

window.addEventListener("load", () => {
    console.log(authTokenSpotify);
    let info = (document.querySelector("#info") as HTMLElement)
    if(window.location.href.split("?")[1] == "s=true"){
        info.innerHTML = "Successfully logged into Spotify!";
        info.classList.add("displayed");
        const newUrl = window.location.pathname + window.location.search.replace(/[?&]s=true/, "");
        window.history.replaceState(null, "", newUrl);
        setTimeout(()=>{
            if(info){
                info.classList.remove("displayed");
                setTimeout(()=>{
                    if(info){
                        info.innerHTML = "";
                    }
                }, 300);
            }
        }, 9700);
    }
});

socket.on("get-speed", (data: {
    unit: "km/h" | "mph",
    speed: number,
    limit: number,
}) => {
    (document.querySelector("#speed") as HTMLElement).innerText = data.speed.toString();
    (document.querySelector("#unit") as HTMLElement).innerText = data.unit;
    let speedLimit = (document.querySelector("#speed-limit") as HTMLElement);
    (speedLimit.children[0] as HTMLElement).innerText = data.limit.toString();
    speedLimit.classList.remove((data.limit.toString().length > 2) ? "two-digit-limit" : "three-digit-limit");
    speedLimit.classList.add((data.limit.toString().length > 2) ? "three-digit-limit" : "two-digit-limit")
})

socket.on("get-fuel", (data: {
    capacity: number,
    value: number,
}) => {
    let percent = data.value / data.capacity * 100;
    if (percent <= 15){
        (document.querySelector("#fuel > p") as HTMLElement).style.color = 'var(--color-7)';
        (document.querySelector("#fuel-indicator") as HTMLElement).style.background = `linear-gradient(to right, var(--color-5) ${percent}%, var(--color-7) ${percent}%)`;
    }else{
        (document.querySelector("#fuel > p") as HTMLElement).style.color = 'var(--color-5)';
        (document.querySelector("#fuel-indicator") as HTMLElement).style.background = `linear-gradient(to right, var(--color-5) ${percent}%, var(--color-2) ${percent}%)`;
    }
})

socket.on("get-adblue", (data: {
    capacity: number,
    value: number,
}) => {
    let percent = data.value / data.capacity * 100;
    if (percent <= 15){
        (document.querySelector("#adblue > p") as HTMLElement).style.color = 'var(--color-7)';
        (document.querySelector("#adblue-indicator") as HTMLElement).style.background = `linear-gradient(to right, var(--color-6) ${percent}%, var(--color-7) ${percent}%)`;
    }else{
        (document.querySelector("#adblue > p") as HTMLElement).style.color = 'var(--color-5)';
        (document.querySelector("#adblue-indicator") as HTMLElement).style.background = `linear-gradient(to right, var(--color-6) ${percent}%, var(--color-2) ${percent}%)`;
    }
});

socket.on("get-gear", (data: {
    gear: number
}) => {
    (document.querySelector("#gear > p") as HTMLElement).innerHTML = `${data.gear > 0 ? "A" : "R"}${Math.abs(data.gear)}`;
});

socket.on("get-c-control", (data: {
    enabled: boolean,
    value: number,
    unit: "km/h" | "mph",
})=> {
    (document.querySelector("#c-control > p") as HTMLElement).innerHTML = `${(data.enabled) ? data.value : "-"} ${data.unit}`;
});

socket.on("get-port-taken", (taken: boolean) => {
    if(view == "SETTINGS"){
        (document.querySelector("#port > input") as HTMLElement).style.borderColor = taken ? "var(--color-8)" : "var(--color-7)";
    }
});

socket.on("set-port", (port: number) => {
    window.location.href = `${window.location.protocol}//${window.location.hostname}:${port}`;
});

socket.on("get-token-spotify", (data: string | null) => {
    authTokenSpotify = data;
});

(document.querySelector("#apps") as HTMLElement).addEventListener("click", () => {
    view = "APPS";
    (document.querySelector("nav") as  HTMLElement).classList.toggle("not-displayed");
    (document.querySelector("footer") as  HTMLElement).classList.toggle("not-displayed");
    let main = document.querySelector("main") as HTMLElement;
    main.classList.add("mid-stage-1");
    setTimeout(() => {
        (document.querySelector("footer") as  HTMLElement).innerHTML = "";

        main.classList.remove("dashboard");
        main.classList.remove("settings");
        main.classList.remove("spotify");
        main.classList.remove("spotify-info");
        main.classList.remove("mid-stage-1");
        main.classList.add("mid-stage-2");
        main.classList.add("apps");
        main.innerHTML = `
            <div class="title">Apps</div>
        `

        apps.forEach((app, index) => {
            main.innerHTML += `
                <div class="app app-${index}">
                    <img src="${app.logo}" alt="${app.name}">
                    <p>${app.name}</p>
                </div>
            `;
        });

        for(let i = 0; i < apps.length; i++){
            (document.querySelector(`.app-${i}`) as HTMLElement).addEventListener("click", () => {
                setApp(apps[i].view);
            })
        }

        setTimeout(() => {
            main.classList.remove("mid-stage-2");
        }, 300)
    }, 300);
});

const setApp = (setView: View) => {
    let main = document.querySelector("main") as HTMLElement;
    switch (setView) {
        case "DASHBOARD":
            main.classList.add("mid-stage-2");
            setTimeout(() => {
                main.classList.remove("apps");
                main.classList.remove("mid-stage-2");
                main.classList.add("mid-stage-1");
                main.classList.add("dashboard");

                (document.querySelector("nav") as HTMLElement).classList.toggle("not-displayed");
                (document.querySelector("footer") as HTMLElement).classList.toggle("not-displayed");

                main.innerHTML = `
                    <h1 id="speed">0</h1>
                    <h6 id="unit">km/h</h6>
                    <div id="speed-limit" class="three-digit-limit"><p>140</p></div>
                    <div id="fuel">
                        <p>Fuel</p>
                        <div id="fuel-indicator"></div>
                    </div>
                    <div id="adblue">
                        <p>AdBlue</p>
                        <div id="adblue-indicator"></div>
                    </div>
                    <div id="gear">
                        <span class="material-symbols-outlined">auto_transmission</span>
                        <p>A0</p>
                    </div>
                    <div id="c-control">
                        <span class="material-symbols-outlined">swap_driving_apps_wheel</span>
                        <p>- km/h</p>
                    </div>
                `;

                view = "DASHBOARD";

                setTimeout(() => {
                    main.classList.remove("mid-stage-1");
                }, 300);
            }, 300);
            break;
        case "SETTINGS":
            main.classList.add("mid-stage-2");
            setTimeout(() => {
                main.classList.remove("apps");
                main.classList.remove("mid-stage-2");
                main.classList.add("mid-stage-1");
                main.classList.add("settings");

                (document.querySelector("nav") as HTMLElement).classList.toggle("not-displayed");
                (document.querySelector("footer") as HTMLElement).classList.toggle("not-displayed");

                fetch("/api/config")
                    .then(res => res.json())
                    .then((data: Config) => {
                        main.innerHTML = `
                            <div id="port" class="input-section">
                                <p>Port (0 - 65535):</p>
                                <input type="text" value="${data.port}">
                            </div>
                            <div id="units" class="input-section">
                                <p>Units:</p>
                                <select>
                                    <option ${data.unit === "km/h" ? "selected" : ""} value="km/h">Metric</option>
                                    <option ${data.unit === "mph" ? "selected" : ""} value="mph">Imperial</option>
                                </select>
                            </div>
                            <button id="login-spotify">Log into spotify</button>
                            <button id="save-button">Save</button>
                        `;

                        (document.querySelector("#login-spotify") as HTMLElement).addEventListener("click", () => {
                            window.location.href = "/login";
                        });

                        (document.querySelector("#save-button") as HTMLElement).addEventListener("click", () => {
                            let port = parseInt((document.querySelector("#port > input") as HTMLInputElement).value);
                            if (port === null){
                                port = 0;
                            }
                            socket.emit("set-config", {
                                port: port,
                                unit: (document.querySelector("#units > select") as HTMLInputElement).value,
                            });
                            if(window.location.port !== port.toString()){
                                window.location.href = `${window.location.protocol}//${window.location.hostname}:${port}`;
                            }else{
                                (document.querySelector("#apps") as HTMLElement).click();
                            }
                        });

                        (document.querySelector("#port > input") as HTMLElement).addEventListener("keydown", (e) => {
                            let data = (e as KeyboardEvent).key;
                            if(data !== "Backspace"){
                                if(Number.isNaN(parseInt(data)) || (document.querySelector("#port > input") as HTMLInputElement).value.length >= 5 || parseInt((document.querySelector("#port > input") as HTMLInputElement).value + data) > 65535){
                                    e.preventDefault();
                                    return;
                                }else{
                                    socket.emit("get-port-taken", parseInt((document.querySelector("#port > input") as HTMLInputElement).value + data));
                                }
                            }else{
                                let port = (document.querySelector("#port > input") as HTMLInputElement).value
                                if(port.length <= 1){
                                    socket.emit("get-port-taken", 0);
                                }else{
                                    socket.emit("get-port-taken", parseInt((document.querySelector("#port > input") as HTMLInputElement).value.slice(0, -1)));
                                }
                            }
                        })

                        view = "SETTINGS";

                        setTimeout(() => {
                            main.classList.remove("mid-stage-1");
                        }, 300);
                    });
            }, 300);
            break;
        case "SPOTIFY":
            main.classList.add("mid-stage-2");
            setTimeout(() => {
                main.classList.remove("apps");
                main.classList.remove("mid-stage-2");
                main.classList.add("mid-stage-1");
                main.classList.add("spotify");

                (document.querySelector("nav") as HTMLElement).classList.toggle("not-displayed");
                (document.querySelector("footer") as HTMLElement).classList.toggle("not-displayed");

                console.log(authTokenSpotify);
                if(authTokenSpotify === null) {
                    (document.querySelector("main") as HTMLElement).classList.add("spotify-info");
                    (document.querySelector("main") as HTMLElement).innerHTML = `
                        <h1>You are not logged in to Spotify!</h1>
                        <p>Go to settings to log in.</p>
                    `;
                }else{
                    (document.querySelector("main") as HTMLElement).classList.add("spotify-normal");
                    (document.querySelector("main") as HTMLElement).innerHTML = `
                        <section id="spotify-side-bar">
                            <div class="spotify-side-bar-icon selected">
                                <span class="material-symbols-outlined">home</span>
                            </div>
                            <div class="spotify-side-bar-icon">
                                <span class="material-symbols-outlined">search</span>
                            </div>
                            <div class="spotify-side-bar-icon">
                                <span class="material-symbols-outlined">favorite</span>
                            </div>
                        </section>
                        <main id="spotify-main">
                            <h1></h1>
                        </main>
                    `;

                    spotifyDisplayMainPage().catch((error: Error) => {
                        console.log(error);
                    });

                    Array.from(document.querySelectorAll(".spotify-side-bar-icon")).forEach((el) => {
                        let element = el as HTMLElement;
                        element.addEventListener("click", () => {
                            if(!element.classList.contains("selected")){
                                Array.from(document.querySelectorAll(".spotify-side-bar-icon")).forEach((el2) => {
                                    let element2 = el2 as HTMLElement;
                                    if(element2.classList.contains("selected")){
                                        element2.classList.remove("selected");
                                    }
                                });
                                element.classList.add("selected");
                                (document.querySelector("#spotify-main") as HTMLElement).className = "";
                                (document.querySelector("#spotify-main") as HTMLElement).classList.add('spotify-' + element.children[0].innerHTML);
                                switch (element.children[0].innerHTML){
                                    case "home":
                                        spotifyDisplayMainPage().catch((error: Error) => {
                                            console.log(error);
                                        });
                                        break;
                                    case "search":
                                        spotifyDisplaySearch().catch((error: Error) => {
                                            console.log(error);
                                        });
                                        break;
                                    case "favorite":
                                        spotifyDisplayFavorites().catch((error: Error) => {
                                            console.log(error);
                                        });
                                        break;
                                }
                            }
                        });
                    });
                }

                view = "SPOTIFY";

                setTimeout(() => {
                    main.classList.remove("mid-stage-1");
                }, 300);
            }, 300);
            break;
    }
}

const spotifyDisplayMainPage = async () => {
    let spotifyMain = document.querySelector("#spotify-main") as HTMLElement;
    spotifyMain.classList.add("spotify-info");
    spotifyMain.innerHTML = `<h1>Loading...<h1>`
    const response = await fetch("https://api.spotify.com/v1/me", {
        headers: {
            "Authorization": `Bearer ${authTokenSpotify}`,
            "Content-Type": "application/json"
        }
    });

    if(!response.ok){
        throw new Error("Failed to fetch spotify user data.");
    }

    let data = await response.json();

    spotifyMain.classList.remove("spotify-info");
    spotifyMain.innerHTML = `
        <h1>Hello, ${data.display_name}!</h1>
    `;
}

const spotifyDisplaySearch = async () => {
    let spotifyMain = document.querySelector("#spotify-main") as HTMLElement;
    spotifyMain.classList.add("spotify-info");
    spotifyMain.innerHTML = `<h1>Loading...<h1>`
}

const spotifyDisplayFavorites = async () => {
    let spotifyMain = document.querySelector("#spotify-main") as HTMLElement;
    spotifyMain.classList.add("spotify-info");
    spotifyMain.innerHTML = `<h1>Loading...<h1>`
}