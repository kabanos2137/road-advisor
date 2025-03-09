interface App {
    name: string;
    logo: string;
    view: View
}

interface Config {
    port: number;
    unit: "km/h" | "mph"
}

type View = "DASHBOARD" | "APPS" | "SETTINGS" | "SPOTIFY"