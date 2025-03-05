import Telemetry, { TelemetryData } from "trucksim-telemetry";

let data: TelemetryData; //Initialize variable

setInterval(() => { //Loop this
    if(Telemetry.getData()){ //Don't let it read Telemetry.getData() if sdk is not active
        data = Telemetry.getData(); //Update 'data' variable
    }
}, 150);

export { data };

