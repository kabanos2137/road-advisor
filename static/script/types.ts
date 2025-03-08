interface App {
    name: string;
    logo: string;
    view: View
}

interface Config {
    port: number;
    unit: "km/h" | "mph"
}

interface SpotifyTrack {
    id: string;
    name: string;
    artists: { name: string }[];
    album: { images: { url: string }[] };
    duration_ms: number;
}

interface SpotifyPlayerState {
    device: {
        id: string;
        name: string;
        volume_percent: number;
    };
    item: SpotifyTrack;
    is_playing: boolean;
    progress_ms: number;
}

type View = "DASHBOARD" | "APPS" | "SETTINGS" | "SPOTIFY"