let authTokenSpotify: string | null = null;

let main = document.querySelector("main") as HTMLElement;
let nav = document.querySelector("nav") as HTMLElement;
let footer = document.querySelector("footer") as HTMLElement;
let currentlySelected: HTMLElement | null = null;

const switchToSpotify = () => {
    main.classList.add("mid-stage-2");
    footer.classList.add("spotify");
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
    main.innerHTML = `
        <div id="spotify-sidebar">
            <section id="spotify-sidebar-top">
                <div class="spotify-sidebar-button spotify-selected" id="spotify-sidebar-button-home">
                    <span class="material-symbols-outlined">home</span>
                </div>  
                <div class="spotify-sidebar-button" id="spotify-sidebar-button-search">
                    <span class="material-symbols-outlined">search</span>
                </div>  
                <div class="spotify-sidebar-button" id="spotify-sidebar-button-favorite">
                    <span class="material-symbols-outlined">favorite</span>
                </div>  
            </section>         
            <div class="spotify-sidebar-button spotify-sidebar-button-bottom" id="spotify-sidebar-button-user">
                <span class="material-symbols-outlined">person</span>
            </div>   
        </div>
        <section id="spotify-center">
        </section>
    `;
    footer.innerHTML = ``;

    currentlySelected = document.querySelector(".spotify-selected");

    Array.from(document.querySelectorAll(".spotify-sidebar-button")).forEach((el) => {
        let element = el as HTMLElement;
        element.addEventListener("click", () => {
            if(currentlySelected) {
                currentlySelected.classList.remove("spotify-selected");
            }
            element.classList.add("spotify-selected");
            currentlySelected = element;
        });
    });

    setTimeout(() => {
        main.classList.remove("mid-stage-1");
    }, 300);
}