let authTokenSpotify: string | null = null;

let main = document.querySelector("main") as HTMLElement;
let nav = document.querySelector("nav") as HTMLElement;
let footer = document.querySelector("footer") as HTMLElement;

const switchToSpotify = () => {
    main.classList.add("mid-stage-2");
    setTimeout(() => {
        main.classList.remove("apps", "mid-stage-2");
        nav.classList.remove("not-displayed");
        footer.classList.remove("not-displayed");

        fetch("/api/spotify")
            .then(res => res.json())
            .then(data => {
                if(data.token === undefined) {
                    main.classList.add("mid-stage-1", "spotify-log-in");
                    displaySpotifyLogIn();
                }else{
                    main.classList.add("mid-stage-1", "spotify");
                    displaySpotify(data);
                }
            });
    }, 300);
}

const displaySpotifyLogIn = () => {
    authTokenSpotify = null;

    main.innerHTML = `
        <h1>You're not logged in :/</h1>
        <a href="/login">Click here to log in</a>
    `;

    setTimeout(() => {
        main.classList.remove("mid-stage-1");
    }, 300);
}

const displaySpotify = (data: {token: string}) => {
    authTokenSpotify = data.token;
    main.innerHTML = authTokenSpotify as string;

    setTimeout(() => {
        main.classList.remove("mid-stage-1");
    }, 300);
}