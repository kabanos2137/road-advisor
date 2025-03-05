// @ts-ignore
const socket = io();

let view: View = "DASHBOARD";

const apps: App[] = [
    {
        name: "Dashboard",
        logo: "../icons/favicon.ico",
        view: "DASHBOARD"
    }
]

setInterval(() => {
    if(view == "DASHBOARD"){
        socket.emit("get-speed");
        socket.emit("get-fuel");
        socket.emit("get-adblue");
        socket.emit("get-gear");
    }
}, 150);

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

(document.querySelector("#apps") as HTMLElement).addEventListener("click", () => {
    view = "APPS";
    (document.querySelector("nav") as  HTMLElement).classList.toggle("not-displayed");
    (document.querySelector("footer") as  HTMLElement).classList.toggle("not-displayed");
    let main = document.querySelector("main") as HTMLElement;
    main.classList.add("mid-stage-1");
    setTimeout(() => {
        main.classList.remove("dashboard");
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

            (document.querySelector(`.app-${index}`) as HTMLElement).addEventListener("click", () => {
                setApp(app.view);
            })
        })

        setTimeout(() => {
            main.classList.remove("mid-stage-2");
        }, 300)
    }, 300);
});

const setApp = (setView: View) => {
    switch (setView) {
        case "DASHBOARD":
            view = "DASHBOARD";
            let main = document.querySelector("main") as HTMLElement;
            main.classList.add("mid-stage-2");
            setTimeout(() => {
                main.classList.remove("apps");
                main.classList.remove("mid-stage-2");
                main.classList.add("mid-stage-1");
                main.classList.add("dashboard");

                (document.querySelector("nav") as  HTMLElement).classList.toggle("not-displayed");
                (document.querySelector("footer") as  HTMLElement).classList.toggle("not-displayed");

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
                `;

                setTimeout(() => {
                    main.classList.remove("mid-stage-1");
                })
            }, 300);
            break;
    }
}