declare module "config.json" {
    interface Config {
        port: number;
        unit: "km/h" | "mph"
    }
    const value: Config;
    export default value;
}