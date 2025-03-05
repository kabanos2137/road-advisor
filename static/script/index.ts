// @ts-ignore
const socket = io();

setInterval(() => {
    socket.emit("get-speed");
    socket.emit("get-fuel");
    socket.emit("get-adblue");
    socket.emit("get-gear");
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