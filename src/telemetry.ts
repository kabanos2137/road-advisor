import Telemetry, { TelemetryData } from "trucksim-telemetry";

let data: TelemetryData; //Initialize variable

setInterval(() => { //Loop this
    data = Telemetry.getData(); //Update 'data' variable
}, 200);

