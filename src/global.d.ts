declare module "config.json" {
    interface Config {
        port: number;
    }
    const value: Config;
    export default value;
}