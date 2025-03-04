// @ts-ignore
const socket = io("http://192.168.1.31/");

setInterval(() => {
    socket.emit("get-speed");
    socket.emit("get-fuel");
}, 150);

socket.on("get-speed", (data: {
    unit: "km/h" | "mph",
    speed: number,
    limit: number,
}) => {
    (document.querySelector("#speed") as HTMLElement).innerText = data.speed.toString();
    (document.querySelector("#unit") as HTMLElement).innerText = data.unit;
    let speedLimit = (document.querySelector("#speed-limit") as HTMLElement);
    speedLimit.innerText = data.limit.toString();
    speedLimit.classList.remove((data.limit.toString().length > 2) ? "two-digit-limit" : "three-digit-limit");
    speedLimit.classList.add((data.limit.toString().length > 2) ? "three-digit-limit" : "two-digit-limit")
})

socket.on("get-fuel", (data: {
    capacity: number,
    value: number,
}) => {
    let percent = data.value / data.capacity * 100;
    (document.querySelector("#fuel-indicator") as HTMLElement).style.background = `linear-gradient(to right, var(--color-5) ${percent}%, var(--color-2) ${percent}%)`;
})