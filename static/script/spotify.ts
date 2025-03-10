let authTokenSpotify: string | null = null;

let g_index = 0;

let main = document.querySelector("main") as HTMLElement;
let nav = document.querySelector("nav") as HTMLElement;
let footer = document.querySelector("footer") as HTMLElement;
let currentlySelected: HTMLElement | null = null;
let clicked = false;

function moveLastToFirst(arr: any[]): any[] {
    const lastElement = arr.splice(arr.length - 1, 1)[0];
    arr.unshift(lastElement);
    return arr;
}

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
    openPageHome();

    currentlySelected = document.querySelector(".spotify-selected");

    Array.from(document.querySelectorAll(".spotify-sidebar-button")).forEach((el) => {
        let element = el as HTMLElement;
        element.addEventListener("click", () => {
            if(currentlySelected) {
                currentlySelected.classList.remove("spotify-selected");
            }
            element.classList.add("spotify-selected");

            switch(element.id){
                case "spotify-sidebar-button-home":
                    openPageHome();
                    break;
                case "spotify-sidebar-button-search":
                    openPageSearch();
                    break;
                case "spotify-sidebar-button-favorite":
                    openPageFavorite();
                    break;
            }

            currentlySelected = element;
        });
    });

    setTimeout(() => {
        main.classList.remove("mid-stage-1");
    }, 300);
}

const openPageHome = () => {
    let spotifyCenter = document.querySelector("#spotify-center") as HTMLElement;

    fetch("https://api.spotify.com/v1/me", {
        headers: {
            Authorization: `Bearer ${authTokenSpotify}`
        }
    })
        .then(res => res.json())
        .then(data => {
            spotifyCenter.innerHTML = `
                <div class="spotify-recommendation" id="spotify-recommendation-tracks">
                    <h1>Hello, ${data.display_name}!</h1>
                    <h5>Top Tracks</h5>
                    <div class="spotify-recommendation-list">
                        <span class="material-symbols-outlined">chevron_left</span>
                        <div class="spotify-recommendation-item"></div>
                        <div class="spotify-recommendation-item"></div>
                        <div class="spotify-recommendation-item"></div>
                        <span class="material-symbols-outlined">chevron_right</span>
                    </div>
                </div>
                <div class="spotify-recommendation" id="spotify-recommendation-artists" style="margin-bottom: 30px;">
                    <h5>Top Artists</h5>
                    <div class="spotify-recommendation-list">
                        <span class="material-symbols-outlined">chevron_left</span>
                        <div class="spotify-recommendation-item"></div>
                        <div class="spotify-recommendation-item"></div>
                        <div class="spotify-recommendation-item"></div>
                        <span class="material-symbols-outlined">chevron_right</span>
                    </div>
                </div>
            `;
            spotifyRecommendationPopulate();
        });
}

const spotifyRecommendationPopulate = () => {
    fetch("https://api.spotify.com/v1/me/top/tracks", {
        headers: {
            Authorization: `Bearer ${authTokenSpotify}`
        }
    })
        .then(res => res.json())
        .then(data => {
            let topTracks: HTMLElement[] = [];

            data.items.forEach((item: any, index: number) => {
                let div = document.createElement("div");
                div.classList.add("spotify-recommendation-item");

                div.style.position = "relative";
                div.style.overflow = "hidden";

                let backgroundDiv = document.createElement("div");

                backgroundDiv.classList.add("spotify-background-div");

                if(item.album.images.length > 0 && item.album.images[0]){
                    backgroundDiv.style.backgroundImage = `url(${item.album.images[0].url})`;
                    backgroundDiv.style.backgroundSize = "cover";
                    backgroundDiv.style.backgroundPosition = "center";
                }else{
                    backgroundDiv.classList.add("spotify-background-div-no-image");
                    backgroundDiv.style.backgroundColor = "var(--color-9)"
                }

                backgroundDiv = replaceBackgroundDiv(backgroundDiv);

                div.appendChild(backgroundDiv);

                let contentContainer = getContentContainer()

                contentContainer.innerHTML = `
                    <h1>${index + 1}.</h1>
                    <h2>${item.name}</h2>
                    <h3>${item.artists[0].name}</h3>    
                `

                div.appendChild(contentContainer);

                div.classList.add(`spotify-recommendation-item-${index + 1}`);

                topTracks.push(div);
            });

            topTracks = moveLastToFirst(topTracks);

            let list = document.querySelector("#spotify-recommendation-tracks > .spotify-recommendation-list") as HTMLElement;

            if(data.items && data.items.length > 0){
                list.innerHTML = "<span id='spotify-recommendation-tracks-left' class=\"material-symbols-outlined\">chevron_left</span>";

                topTracks.forEach((track: HTMLElement, index: number) => {
                    if(index == 0 || index > 3){
                        track.classList.add("spotify-recommendation-item-hidden");
                    }
                    list.appendChild(track);
                });

                list.innerHTML += "<span id='spotify-recommendation-tracks-right' class=\"material-symbols-outlined\">chevron_right</span>";

                let left = document.querySelector("#spotify-recommendation-tracks-left") as HTMLElement;
                let right = document.querySelector("#spotify-recommendation-tracks-right") as HTMLElement;

                right.addEventListener("click", () => {
                    if(!clicked) {
                        clicked = true;
                        list.children[2].classList.add("spotify-recommendation-item-hidden");
                        list.children[5].classList.remove("spotify-recommendation-item-hidden");
                        list.insertBefore(list.children[1], list.children[list.children.length - 1]);
                        setTimeout(() => {
                            clicked = false;
                        }, 300)
                    }
                });

                left.addEventListener("click", () => {
                    if(!clicked){
                        clicked = true;
                        list.children[4].classList.add("spotify-recommendation-item-hidden");
                        list.children[1].classList.remove("spotify-recommendation-item-hidden");
                        list.insertBefore(list.children[list.children.length - 2], list.children[1]);
                        setTimeout(() => {
                            clicked = false;
                        }, 300)
                    }
                });
            } else {
               list.innerHTML = "";
            }
        });
    fetch("https://api.spotify.com/v1/me/top/artists", {
        headers: {
            Authorization: `Bearer ${authTokenSpotify}`
        }
    })
        .then(res => res.json())
        .then(data => {
            let topArtists: HTMLElement[] = [];
            data.items.forEach((item: any, index: number) => {
                let div = document.createElement("div");
                div.classList.add("spotify-recommendation-item");

                div.style.position = "relative";
                div.style.overflow = "hidden";

                let backgroundDiv = document.createElement("div");

                backgroundDiv.classList.add("spotify-background-div");

                if(item.images.length > 0 && item.images[0].url){
                    backgroundDiv.style.backgroundImage = `url(${item.images[0].url})`;
                    backgroundDiv.style.backgroundSize = "cover";
                    backgroundDiv.style.backgroundPosition = "center";
                }else{
                    backgroundDiv.classList.add("spotify-background-div-no-image");
                    backgroundDiv.style.backgroundColor = "var(--color-9)"
                }

                backgroundDiv = replaceBackgroundDiv(backgroundDiv);

                div.appendChild(backgroundDiv);

                let contentContainer = getContentContainer()

                contentContainer.innerHTML = `
                    <h1>${index + 1}.</h1>
                    <h2>${item.name}</h2> 
                `

                div.appendChild(contentContainer);

                div.classList.add(`spotify-recommendation-item-${index + 1}`);

                topArtists.push(div);
            });

            topArtists = moveLastToFirst(topArtists);

            let list = document.querySelector("#spotify-recommendation-artists > .spotify-recommendation-list") as HTMLElement;

            if(data.items && data.items.length > 0){
                list.innerHTML = "<span id='spotify-recommendation-artists-left' class=\"material-symbols-outlined\">chevron_left</span>";

                topArtists.forEach((track: HTMLElement, index: number) => {
                    if(index == 0 || index > 3){
                        track.classList.add("spotify-recommendation-item-hidden");
                    }
                    list.appendChild(track);
                });

                list.innerHTML += "<span id='spotify-recommendation-artists-right' class=\"material-symbols-outlined\">chevron_right</span>";

                let left = document.querySelector("#spotify-recommendation-artists-left") as HTMLElement;
                let right = document.querySelector("#spotify-recommendation-artists-right") as HTMLElement;

                right.addEventListener("click", () => {
                    if(!clicked) {
                        clicked = true;
                        list.children[2].classList.add("spotify-recommendation-item-hidden");
                        list.children[5].classList.remove("spotify-recommendation-item-hidden");
                        list.insertBefore(list.children[1], list.children[list.children.length - 1]);
                        setTimeout(() => {
                            clicked = false;
                        }, 300)
                    }
                });

                left.addEventListener("click", () => {
                    if(!clicked){
                        clicked = true;
                        list.children[4].classList.add("spotify-recommendation-item-hidden");
                        list.children[1].classList.remove("spotify-recommendation-item-hidden");
                        list.insertBefore(list.children[list.children.length - 2], list.children[1]);
                        setTimeout(() => {
                            clicked = false;
                        }, 300)
                    }
                });
            } else {
                list.innerHTML = '';
            }
        })
}

const openPageSearch = () => {
    let spotifyCenter = document.querySelector("#spotify-center") as HTMLElement;

    spotifyCenter.innerHTML = `
        <input type="text" id="spotify-search-bar" placeholder="Search..." autocomplete="off">
        <div class="spotify-search-results" id="spotify-search-results-tracks">
        
        </div>
        <div class="spotify-search-results" id="spotify-search-results-albums">
        
        </div>
        <div class="spotify-search-results" id="spotify-search-results-artists">
        
        </div>
        <div class="spotify-search-results" id="spotify-search-results-playlists">
        
        </div>
        <div class="spotify-search-results" id="spotify-search-results-shows">
        
        </div>
        <div class="spotify-search-results" id="spotify-search-results-episodes">
        
        </div>
    `;

    let searchBar = document.querySelector("#spotify-search-bar") as HTMLInputElement;

    searchBar.addEventListener("input", displaySearchResults);
}

const displaySearchResults = () => {
    let searchBar = document.querySelector("#spotify-search-bar") as HTMLInputElement;
    let tracks = document.querySelector("#spotify-search-results-tracks") as HTMLElement;
    let albums = document.querySelector("#spotify-search-results-albums") as HTMLElement;
    let artists = document.querySelector("#spotify-search-results-artists") as HTMLElement;
    let playlists = document.querySelector("#spotify-search-results-playlists") as HTMLElement;
    let shows = document.querySelector("#spotify-search-results-shows") as HTMLElement;
    let episodes = document.querySelector("#spotify-search-results-episodes") as HTMLElement;

    let value = searchBar.value;
    if(value === ""){
        tracks.innerHTML = "";
        albums.innerHTML = "";
        artists.innerHTML = "";
        playlists.innerHTML = "";
        shows.innerHTML = "";
        episodes.innerHTML = "";
    }else{
        fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(value)}&type=album%2Cartist%2Cplaylist%2Ctrack%2Cepisode%2Cshow`, {
            headers: {
                "Authorization": `Bearer ${authTokenSpotify}`,
            }
        })
            .then(response => response.json())
            .then(data => {
                populateSearch("track", data.tracks);
                populateSearch("artist", data.artists);
                populateSearch("album", data.albums);
                populateSearch("playlist", data.playlists);
                populateSearch("episode", data.episodes);
                populateSearch("show", data.shows);
            });
    }
}

const populateSearch = (type: string, data: any) => {
    let container = document.querySelector(`#spotify-search-results-${type}s`) as HTMLElement;

    let divs: HTMLElement[] = [];

    data.items.filter((element: any) => element !== null).forEach((item: any) => {
        let div = document.createElement("div");
        div.classList.add("spotify-search-item");

        div.style.position = "relative";
        div.style.overflow = "hidden";

        let backgroundDiv = document.createElement("div");

        backgroundDiv.classList.add("spotify-background-div");

        if(type === "track"){
            if(item.album.images.length > 0 && item.album.images[0].url){
               backgroundDiv.style.backgroundImage = `url(${item.album.images[0].url})`;
               backgroundDiv.style.backgroundSize = "cover";
               backgroundDiv.style.backgroundPosition = "center";
            }else{
               backgroundDiv.classList.add("spotify-background-div-no-image");
               backgroundDiv.style.backgroundColor = "var(--color-9)"
            }
        }else if(type === "artist" || type === "album" || type === "playlist" || type === "episode" || type === "show"){
            if(item.images.length > 0 && item.images[0].url){
                backgroundDiv.style.backgroundImage = `url(${item.images[0].url})`;
                backgroundDiv.style.backgroundSize = "cover";
                backgroundDiv.style.backgroundPosition = "center";
            }else{
                backgroundDiv.classList.add("spotify-background-div-no-image");
                backgroundDiv.style.backgroundColor = "var(--color-9)"
            }
        }

        backgroundDiv = replaceBackgroundDiv(backgroundDiv);

        div.appendChild(backgroundDiv);

        let contentContainer = getContentContainer()

        if(type === "track" || type === "album"){
            contentContainer.innerHTML = `
                <h1>${item.name}</h1>
                <h2>${item.artists[0].name}</h2>    
            `;
        }else if(type === "artist" || type === "episode"){
            contentContainer.innerHTML = `
                <h1>${item.name}</h1>
            `;
        }else if(type === "playlist"){
            contentContainer.innerHTML = `
                <h1>${item.name}</h1>
                <h2>${item.owner.display_name}</h2>    
            `;
        }else if(type === "show"){
            contentContainer.innerHTML = `
                <h1>${item.name}</h1>
                <h2>${item.publisher}</h2>    
            `;
        }

        div.appendChild(contentContainer);

        divs.push(div);
    });

    divs = moveLastToFirst(divs);

    if(type === "track"){
        container.innerHTML = container.innerHTML = `
            <h5>Tracks (results: ${divs.length})</h5>
        `;
    }else if(type === "artist"){
        container.innerHTML = `
            <h5>Artists (results: ${divs.length})</h5>
        `;
    }else if(type === "album"){
        container.innerHTML = `
            <h5>Albums (results: ${divs.length})</h5>
        `;
    }else if(type === "playlist"){
        container.innerHTML = `
            <h5>Playlists (results: ${divs.length})</h5>
        `;
    }else if (type === "episode"){
        container.innerHTML = `
            <h5>Episodes (results: ${divs.length})</h5>
        `;
    }else if (type === "show"){
        container.innerHTML = `
            <h5>Podcasts (results: ${divs.length})</h5>
        `;
    }

    container.innerHTML += `<div class="spotify-search-result-list"${(type === "episode") ? ' style="margin-bottom: 30px;"' : ""}></div>`;

    let list = document.querySelector(`#spotify-search-results-${type}s > .spotify-search-result-list`) as HTMLElement;

    if(divs.length > 3){
        list.innerHTML = `<span id='spotify-search-${type}s-left' class=\"material-symbols-outlined\">chevron_left</span>`;
    }

    divs.forEach((element: HTMLElement, index: number) => {
        if(divs.length > 3){
            if(index > 0 && index < 4){
                element.classList.add(`spotify-search-${type}s-item-${index}`);
            }else{
                element.classList.add("spotify-search-item-hidden", `spotify-search-${type}s-item-${index}`);
            }
        }else{
            element.classList.add(`spotify-search-${type}s-item-${index}`);
        }

        list.appendChild(element);
    });

    if(divs.length > 3){
        list.innerHTML += `<span id='spotify-search-${type}s-right' class=\"material-symbols-outlined\">chevron_right</span>`;

        let left = document.querySelector(`#spotify-search-${type}s-left`) as HTMLElement;
        let right = document.querySelector(`#spotify-search-${type}s-right`) as HTMLElement;

        right.addEventListener("click", () => {
            if(!clicked) {
                clicked = true;
                list.children[2].classList.add("spotify-search-item-hidden");
                list.children[5].classList.remove("spotify-search-item-hidden");
                list.insertBefore(list.children[1], list.children[list.children.length - 1]);
                setTimeout(() => {
                    clicked = false;
                }, 300)
            }
        });

        left.addEventListener("click", () => {
            if(!clicked){
                clicked = true;
                list.children[4].classList.add("spotify-search-item-hidden");
                list.children[1].classList.remove("spotify-search-item-hidden");
                list.insertBefore(list.children[list.children.length - 2], list.children[1]);
                setTimeout(() => {
                    clicked = false;
                }, 300)
            }
        });
    }
}

const openPageFavorite = () => {
    let spotifyCenter = document.querySelector("#spotify-center") as HTMLElement;

    spotifyCenter.innerHTML = `
        <div class="spotify-favorites" id="spotify-favorite-playlists">
            <h1>Your favorite</h1>
            <h5>Your playlists</h5>
            <div class="spotify-favorites-list">
                <span class="material-symbols-outlined">chevron_left</span>
                <div class="spotify-favorites-item"></div>
                <div class="spotify-favorites-item"></div>
                <div class="spotify-favorites-item"></div>
                <span class="material-symbols-outlined">chevron_right</span>
            </div>
        </div>
        <div class="spotify-favorites" id="spotify-favorite-saved" style="margin-bottom: 30px;">
            <h5>Saved</h5>
            <div class="spotify-favorites-list">
                <div class="spotify-favorites-item"></div>
                <div class="spotify-favorites-item"></div>
            </div>
        </div>
    `;
    populateSaved();
    populatePlaylists();
}

const populateSaved = () => {
    let list = document.querySelector(`#spotify-favorite-saved > .spotify-favorites-list`) as HTMLElement;
    (Array.from(list.children) as HTMLElement[]).forEach((div: HTMLElement, index: number) => {
        div.style.position = "relative";
        div.style.overflow = "hidden";

        let backgroundDiv = document.createElement("div");

        backgroundDiv.classList.add("spotify-background-div");

        if(index === 0){
            backgroundDiv.style.backgroundImage = `url(../images/saved-songs.png)`;
        }else{
            backgroundDiv.style.backgroundImage = `url(../images/saved-episodes.png)`;
        }

        backgroundDiv.style.backgroundSize = "cover";
        backgroundDiv.style.backgroundPosition = "center";

        backgroundDiv = replaceBackgroundDiv(backgroundDiv);

        div.appendChild(backgroundDiv);

        let contentContainer = getContentContainer()

        if(index === 0){
            contentContainer.innerHTML = `
                <h1>Saved Songs</h1>
            `;
        } else {
            contentContainer.innerHTML = `
                <h1>Saved Episodes</h1>
            `;
        }

        div.appendChild(contentContainer);
    });
}

const populatePlaylists = () => {
    fetch("https://api.spotify.com/v1/me/playlists?limit=50&offset=0", {
        headers: {
            "Authorization": `Bearer ${authTokenSpotify}`,
        }
    })
        .then(res => res.json())
        .then(data => {
            data.total = data.total - 1; //Fixes obvious spotify API bug 🙄. IT'S SO FUCKING ANNOYING!!!!!!!

            let list = document.querySelector(`#spotify-favorite-playlists > .spotify-favorites-list`) as HTMLElement;
            let divs: HTMLElement[] = [];
            let nullStart = 0;//index of first null element
            let nullEnd = data.total; //index of last null element

            for(let i = 0; i < data.total; i++) {
                divs.push(document.createElement("div"));
            }

            divs.forEach((element: HTMLElement, index: number) => {
                let item = data.items[index];
                element.classList.add("spotify-favorites-item");

                element.style.position = "relative";
                element.style.overflow = "hidden";

                if(!item){
                    element.classList.add("spotify-empty")
                }else{
                    nullStart++;
                }

                let backgroundDiv = document.createElement("div");

                backgroundDiv.classList.add("spotify-background-div");

                if(item && item.images && item.images.length > 0 && item.images[0].url){
                    backgroundDiv.style.backgroundImage = `url(${item.images[0].url})`;
                    backgroundDiv.style.backgroundSize = "cover";
                    backgroundDiv.style.backgroundPosition = "center";
                }else{
                    backgroundDiv.classList.add("spotify-background-div-no-image");
                    backgroundDiv.style.backgroundColor = "var(--color-9)"
                }

                backgroundDiv = replaceBackgroundDiv(backgroundDiv);

                element.appendChild(backgroundDiv);

                let contentContainer = getContentContainer()

                if(item){
                    g_index++;
                    contentContainer.innerHTML = `
                        <h1>${item.name}</h1>
                        <h2>${item.owner.display_name}</h2>    
                    `;
                }else{
                    contentContainer.innerHTML = `
                        <h1></h1>
                        <h2></h2>    
                    `;
                }

                element.appendChild(contentContainer);

                divs[index] = element;
            });

            getEndPlaylists(divs, nullStart, nullEnd, data).then((data: any) => {
                let newDivs = data.divs
                nullEnd = data.nullEnd;
                divs = moveLastToFirst(newDivs);
                list.innerHTML = "";
                if(divs.length > 3){
                    list.innerHTML = `<span id='spotify-favorites-left' class=\"material-symbols-outlined\">chevron_left</span>`;
                }

                divs.forEach((element: HTMLElement, index: number) => {
                    if(divs.length > 3){
                        if(index < 1 || index > 3){
                            element.classList.add("spotify-favorites-item-hidden");
                        }
                    }

                    element.id = `spotify-favorites-item-${index}`;

                    list.appendChild(element);
                });

                if(divs.length > 3){
                    list.innerHTML += `<span id='spotify-favorites-right' class=\"material-symbols-outlined\">chevron_right</span>`;

                    let left = document.querySelector(`#spotify-favorites-left`) as HTMLElement;
                    let right = document.querySelector(`#spotify-favorites-right`) as HTMLElement;

                    right.addEventListener("click", () => {
                        if(!clicked) {
                            clicked = true;
                            list.children[2].classList.add("spotify-favorites-item-hidden");
                            list.children[5].classList.remove("spotify-favorites-item-hidden");
                            list.insertBefore(list.children[1], list.children[list.children.length - 1]);

                            if(list.children[6] && list.children[6].classList.contains("spotify-empty") && data.total > 100){
                                let limit = Math.min(document.querySelectorAll("#spotify-favorite-playlists > .spotify-favorites-list > .spotify-empty").length, 50);
                                let offset = parseInt(list.children[6].id.split("-")[list.children[6].id.split("-").length - 1]);

                                fetch(`https://api.spotify.com/v1/me/playlists?limit=${limit}&offset=${offset}`, {
                                    headers: {
                                        "Authorization": `Bearer ${authTokenSpotify}`,
                                    }
                                })
                                    .then(res => res.json())
                                    .then(data => {
                                        data.items.forEach((item: any, index: number) => {
                                            let currentIndex = offset + index;
                                            let element = divs[currentIndex];

                                            element.classList.add("spotify-favorites-item");

                                            element.style.position = "relative";
                                            element.style.overflow = "hidden";

                                            if (!item) {
                                                element.classList.add("spotify-empty")
                                            } else {
                                                element.classList.remove("spotify-empty")
                                                nullStart++;
                                            }

                                            element.innerHTML = ""

                                            let backgroundDiv = document.createElement("div");

                                            backgroundDiv.classList.add("spotify-background-div");

                                            if (item && item.images && item.images.length > 0 && item.images[0].url) {
                                                backgroundDiv.style.backgroundImage = `url(${item.images[0].url})`;
                                                backgroundDiv.style.backgroundSize = "cover";
                                                backgroundDiv.style.backgroundPosition = "center";
                                            } else {
                                                backgroundDiv.classList.add("spotify-background-div-no-image");
                                                backgroundDiv.style.backgroundColor = "var(--color-9)"
                                            }

                                            backgroundDiv = replaceBackgroundDiv(backgroundDiv);

                                            element.appendChild(backgroundDiv);

                                            let contentContainer = getContentContainer()

                                            if (item) {
                                                g_index++;
                                                contentContainer.innerHTML = `
                                                    <h1>${item.name}</h1>
                                                    <h2>${item.owner.display_name}</h2>    
                                                `;
                                            } else {
                                                contentContainer.innerHTML = `
                                                    <h1></h1>
                                                    <h2></h2>    
                                                `;
                                            }

                                            element.appendChild(contentContainer);

                                            divs[currentIndex] = element;
                                        });
                                    });
                            }

                            setTimeout(() => {
                                clicked = false;
                            }, 300)
                        }
                    });

                    left.addEventListener("click", () => {
                        if(!clicked){
                            clicked = true;
                            list.children[4].classList.add("spotify-favorites-item-hidden");
                            list.children[1].classList.remove("spotify-favorites-item-hidden");
                            list.insertBefore(list.children[list.children.length - 2], list.children[1]);

                            if(list.children[list.children.length - 3] && list.children[list.children.length - 3].classList.contains("spotify-empty") && data.total > 100){
                                let limit = Math.min(document.querySelectorAll("#spotify-favorite-playlists > .spotify-favorites-list > .spotify-empty").length, 50);
                                let offset = parseInt(list.children[list.children.length - 3].id.split("-")[list.children[list.children.length - 3].id.split("-").length - 1]) - limit;

                                fetch(`https://api.spotify.com/v1/me/playlists?limit=${limit}&offset=${offset}`, {
                                    headers: {
                                        "Authorization": `Bearer ${authTokenSpotify}`,
                                    }
                                })
                                    .then(res => res.json())
                                    .then(data => {
                                        data.items.forEach((item: any, index: number) => {
                                            let currentIndex = offset + index;
                                            let element = divs[currentIndex];

                                            element.classList.add("spotify-favorites-item");

                                            element.style.position = "relative";
                                            element.style.overflow = "hidden";

                                            if (!item) {
                                                element.classList.add("spotify-empty")
                                            } else {
                                                element.classList.remove("spotify-empty")
                                                nullStart++;
                                            }

                                            element.innerHTML = ""

                                            let backgroundDiv = document.createElement("div");

                                            backgroundDiv.classList.add("spotify-background-div");

                                            if (item && item.images && item.images.length > 0 && item.images[0].url) {
                                                backgroundDiv.style.backgroundImage = `url(${item.images[0].url})`;
                                                backgroundDiv.style.backgroundSize = "cover";
                                                backgroundDiv.style.backgroundPosition = "center";
                                            } else {
                                                backgroundDiv.classList.add("spotify-background-div-no-image");
                                                backgroundDiv.style.backgroundColor = "var(--color-9)"
                                            }

                                            backgroundDiv = replaceBackgroundDiv(backgroundDiv);

                                            element.appendChild(backgroundDiv);

                                            let contentContainer = getContentContainer()

                                            if (item) {
                                                g_index++;
                                                contentContainer.innerHTML = `
                                                    <h1>${item.name}</h1>
                                                    <h2>${item.owner.display_name}</h2>    
                                                `;
                                            } else {
                                                contentContainer.innerHTML = `
                                                    <h1></h1>
                                                    <h2></h2>    
                                                `;
                                            }

                                            element.appendChild(contentContainer);

                                            divs[currentIndex] = element;
                                        });
                                    });
                            }

                            setTimeout(() => {
                                clicked = false;
                            }, 300);
                        }
                    });
                }
            });
        });
}

const getEndPlaylists = async (divs: HTMLElement[], nullStart: number, nullEnd: number, oldData: any) => {
    if (oldData.total > 50) {
        let yetToFind = nullEnd - nullStart + 1;
        let limit = Math.min(yetToFind, 50);
        let offset = nullEnd - limit + 1;

        const response = await fetch(`https://api.spotify.com/v1/me/playlists?limit=${limit}&offset=${offset}`, {
            headers: {
                "Authorization": `Bearer ${authTokenSpotify}`,
            }
        });
        const data = await response.json();
        data.items.forEach((item: any, index: number) => {
            let currentIndex = offset + index - 1;
            let element = divs[currentIndex];

            element.classList.add("spotify-favorites-item");

            element.style.position = "relative";
            element.style.overflow = "hidden";

            if (!item) {
                element.classList.add("spotify-empty")
            } else {
                element.classList.remove("spotify-empty")
                nullEnd--;
            }

            element.innerHTML = ""

            let backgroundDiv = document.createElement("div");

            backgroundDiv.classList.add("spotify-background-div");

            if (item && item.images && item.images.length > 0 && item.images[0].url) {
                backgroundDiv.style.backgroundImage = `url(${item.images[0].url})`;
                backgroundDiv.style.backgroundSize = "cover";
                backgroundDiv.style.backgroundPosition = "center";
            } else {
                backgroundDiv.classList.add("spotify-background-div-no-image");
                backgroundDiv.style.backgroundColor = "var(--color-9)"
            }

            backgroundDiv = replaceBackgroundDiv(backgroundDiv);

            element.appendChild(backgroundDiv);

            let contentContainer = getContentContainer()

            if (item) {
                g_index++;
                contentContainer.innerHTML = `
                            <h1>${item.name}</h1>
                            <h2>${item.owner.display_name}</h2>    
                        `;
            } else {
                contentContainer.innerHTML = `
                    <h1></h1>
                    <h2></h2>    
                `;
            }

            element.appendChild(contentContainer);

            divs[currentIndex] = element;
        });
    }

    return {
        nullEnd,
        divs
    }
}

const getContentContainer = () => {
    let div = document.createElement("div");
    div.classList.add("spotify-content-container");
    div.style.position = "relative";
    div.style.zIndex = "1";
    div.style.padding = "10px";
    div.style.display = "flex";
    div.style.flexDirection = "column";
    div.style.alignItems = "center";
    div.style.justifyContent = "center";
    return div;
}

const replaceBackgroundDiv = (backgroundDiv) => {
    backgroundDiv.style.filter = "blur(8px)";

    backgroundDiv.style.position = "absolute";
    backgroundDiv.style.top = "-10px";
    backgroundDiv.style.left = "-10px";
    backgroundDiv.style.right = "-10px";
    backgroundDiv.style.bottom = "-10px";
    backgroundDiv.style.zIndex = "0";

    backgroundDiv.style.opacity = "0.7";
    return backgroundDiv
}