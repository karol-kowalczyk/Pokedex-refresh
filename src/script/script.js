/**
 * Variable to hold all Pokemon data.
 * @type {Object[]}
 */
let completePokemon;

/**
 * Array to store all Pokemon data.
 * @type {Object[]}
 */
let allPokemonData = [];

/**
 * Array to store all caught Pokemon.
 * @type {Object[]}
 */
let allCatchedPokemon = [];

/**
 * Number of Pokemon to load at a time.
 * @type {number}
 */
let loadMorePokemon = 20;

/**
 * Index of the next Pokemon to load.
 * @type {number}
 */
let nextPokemon = 0;

/**
 * Flag to determine whether to stop scrolling or not.
 * @type {boolean}
 */
let stopScroll = false;

/**
 * Limit on how many Pokemon can be loaded.
 * @type {number}
 */
let limit = 20;

/**
 * Variable to store the currently dragged Pokemon.
 * @type {?Object}
 */
let currentDraggedPokemon;

/**
 * Reference to the progress bar element.
 * @type {HTMLElement}
 */
let progressBarNone = document.getElementById('progress-bar');

/**
 * Initializes the application by loading Pokemon data and rendering it.
 * @async
 * @function
 */
async function initAllPokemon() {
    await loadCompletePokemon();
    renderAllPokemon();
    startLoadCompletePokemon();
    load();
    renderAllDraggedPokemon();
}

/**
 * Loads all existing Pokemon up to a maximum of 1000.
 * @async
 * @function
 */
async function loadCompletePokemon() {
    let url = `https://pokeapi.co/api/v2/pokemon?offset=0&limit=${limit}`;
    let response = await fetch(url);
    completePokemon = await response.json();
    completePokemon = completePokemon['results'];
    allPokemonData = [];

    const progressBar = document.querySelector('.progress-bar');

    for (let i = 0; i < completePokemon.length; i++) {
        let pokemonUrl = completePokemon[i]['url'];
        let response = await fetch(pokemonUrl);
        let currentAllPokemon = await response.json();

        allPokemonData.push({ name: currentAllPokemon['name'], data: currentAllPokemon });

        const progressPercentage = Math.round((i + 1) / completePokemon.length * 100);
        progressBar.style.width = `${progressPercentage}%`;
        progressBar.innerText = `${progressPercentage}%`;
    }
    progressBarNone.classList.add('d-none');
    // console.log('Alle Pokemon daten', allPokemonData);
}

/**
 * Changes the limit on how many Pokemon can be loaded to 1000 and starts loading them.
 * @function
 */
function startLoadCompletePokemon() {
    limit = 1000;
    progressBarNone.classList.remove('d-none');
    loadCompletePokemon(progressBarNone);
}

/**
 * Renders all Pokemon on the page.
 * @function
 */
function renderAllPokemon() {
    let endIndex = nextPokemon + loadMorePokemon;
    for (let k = nextPokemon; k < endIndex && k < allPokemonData.length; k++) {
        let number = allPokemonData[k]['data']['id'];
        let name = allPokemonData[k]['name'];
        let typesStyle = allPokemonData[k]['data']['types'][0]['type']['name'] + '-border';

        document.getElementById('pokedex').innerHTML += singlePokemonTemplate(k, number, name, typesStyle);
    }
    nextPokemon = endIndex; 
    stopScroll = false;
    disableLoadingScreen();
}


/**
 * Creates HTML for a single Pokemon card.
 * @param {number} i - The index of the Pokemon.
 * @param {number} number - The ID of the Pokemon.
 * @param {string} name - The name of the Pokemon.
 * @param {string} typesStyle - The class name for Pokemon type style.
 * @returns {string} - The HTML string for the Pokemon card.
 */
function singlePokemonTemplate(i, number, name, typesStyle) {
    return `
    <div draggable="true" ondragstart="startDragging(${i})" onclick="pokemonPopup(${i})" class="pokemon-card ${typesStyle}">
    <div class="type-card">
        <div class="types-content">
            ${typeTemplate(allPokemonData[i])}
        </div>
        <div class="pokemonId">#${number}</div>
    </div>
    <img src="${allPokemonData[i]['data']['sprites']['other']['official-artwork']['front_default']}" alt="${name}">
        <div>${name}</div>      
    </div>
    `;
}

/**
 * Renders all types of a Pokemon.
 * @param {Object} allPokemonData - The data of the Pokemon.
 * @returns {string} - The HTML string for the Pokemon types.
 */
function typeTemplate(allPokemonData) {
    const types = allPokemonData['data']['types'];
    let htmlText = "";
    for (let j = 0; j < types.length; j++) {
        htmlText += `
        <div class="${types[j]['type']['name']}">
            <div>${types[j]['type']['name']}</div>
        </div>
        `;
    }
    return htmlText;
}

/**
 * Opens a popup with detailed information about the Pokemon.
 * @param {number} i - The index of the Pokemon.
 * @function
 */
function pokemonPopup(i) {
    if (i == -1) {
        return;
    }

    let number = allPokemonData[i]['data']['id'];
    let name = allPokemonData[i]['name'];

    document.getElementById('pokemon-stats').innerHTML = `
    <div class="pokemon-popup" onclick="closePopup()">
        <div class="closeMobile" onclick="closePopup()">Close</div>
        <div id="pokemon-popup-card${i}" class="pokemon-popup-card" onclick="notClose(event)">  
        <div class="type-card">
                <div class="types-content">
                    ${typeTemplate(allPokemonData[i])}
                </div>
                <div class="pokemonId">#${number}</div>   
            </div>
            <div>${name}</div>     
            <img src="${allPokemonData[i]['data']['sprites']['other']['official-artwork']['front_default']}" alt="${name}">
            <div class="pokemon-info-card">
                <menu>
                    <div class="pokemon-left" onclick="pokemonPopup(${i - 1})"><img id="arrowLeft" src="./src/img/navigate-left.svg"></div>
                    <div class="menu">
                        <div class="menu-start" href="" onclick="loadBaseStats(${i})">Base Stats</div>
                        <div class="menu-end" href="" id="test" onclick="loadAbout(${i})">About</div>
                    </div>
                    <div class="pokemon-right" onclick="pokemonPopup(${i + 1})"><img src="./src/img/navigate.svg"></div>
                </menu>
                <div id="about"></div>
            </div>
        </div>
    </div>
    `;

    openPopup();
    changeArrowLeft(number);
    loadBaseStats(i);
}

/**
 * Loads detailed information about the Pokemon, including species, height, and weight.
 * @param {number} i - The index of the Pokemon.
 * @function
 */
function loadAbout(i) {
    let species = allPokemonData[i]['data']['species']['name'];
    let height = allPokemonData[i]['data']['height'];
    let weight = allPokemonData[i]['data']['weight'];

    document.getElementById('about').innerHTML = /* html */`

    <div id="about-info">
        <div class="about-row">
            <div class="about-left">Species</div><div class="about-right">${species}</div>
        </div>
        <div class="about-row">
            <div class="about-left">Height</div><div class="about-right">${height}</div>
        </div>
        <div class="about-row">
            <div class="about-left">Weight</div><div class="about-right">${weight}</div>
        </div>  
    </div>
    `;
}

/**
 * Loads and displays the base stats of the Pokemon.
 * @param {number} i - The index of the Pokemon.
 * @function
 */
function loadBaseStats(i) {
    let baseStats = allPokemonData[i]['data']['stats'];
    document.getElementById('about').innerHTML = '';

    for (let s = 0; s < baseStats.length; s++) {
        const baseStatName = baseStats[s]['stat']['name'];
        const baseStatValue = baseStats[s]['base_stat'];

        document.getElementById('about').innerHTML += /* html */`
        <div class="base-stats-row">
            <div class="base-stats-left">${baseStatName}</div>
            <div>${baseStatValue}</div>
            <div class="progress base-stats-right" role="progressbar" aria-label="Basic example" aria-valuenow="${baseStatValue}" aria-valuemin="0" aria-valuemax="100">
                <div class="progress-bar" style="width: ${baseStatValue}%"></div>
            </div>
        </div>
        `;
    }
}

/**
 * Hides the left arrow button when viewing the first Pokemon.
 * @param {number} i - The index of the Pokemon.
 * @function
 */
function changeArrowLeft(i) {
    let pokemonArrowSrc = document.getElementById('arrowLeft');
    if (i == 1) {
        pokemonArrowSrc.src = './src/img/navigate-left-end.svg';
    }
}

/**
 * Initiates a search for Pokemon and displays results.
 * @function
 */
function searchPokemon() {
    let search = document.getElementById('inputSearch').value.toLowerCase();
    let renderPokemonList = document.getElementById('search-results');
    renderPokemonList.innerHTML = '';

    if (search === '') {
        renderPokemonList.innerHTML = '';
        renderPokemonList.classList.add('d-none');
        return;
    }
    renderPokemonList.classList.remove('d-none');
    renderSearchPokemon(search, renderPokemonList);
}

/**
 * Renders the search results for Pokemon based on input value.
 * @param {string} search - The search input value.
 * @param {HTMLElement} renderPokemonList - The element to render search results into.
 * @function
 */
function renderSearchPokemon(search, renderPokemonList) {
    for (let i = 0; i < allPokemonData.length; i++) {

        const number = allPokemonData[i]['data']['id'];
        const name = allPokemonData[i]['name'];

        if (name.toLowerCase().includes(search) && search.length >= 2) {

            renderPokemonList.innerHTML += /* html */ `
            <div draggable="true" ondragstart="startDragging(${i})" onclick="pokemonPopup(${i})" class="pokemon-card">
            <div class="type-card">
                <div class="types-content">
                    ${typeTemplate(allPokemonData[i])}
                </div>
                <div class="pokemonId">#${number}</div>
            </div>
            <img src="${allPokemonData[i]['data']['sprites']['other']['official-artwork']['front_default']}" alt="${name}">
                <div>${name}</div>      
            </div>
            `;
        }
    }
}

/**
 * Deactivates the loading screen and allows scrolling.
 * @function
 */
function disableLoadingScreen() {
    document.getElementById('loadingScreen').classList.add('d-none');
    document.getElementById('body').classList.remove('hide-scrollbar');
}

/**
 * Opens the Pokemon popup window.
 * @function
 */
function openPopup() {
    document.getElementById('pokemon-stats').classList.remove('d-none');
    document.getElementById('body').classList.add('hide-scrollbar');
}

/**
 * Closes the Pokemon popup window.
 * @function
 */
function closePopup() {
    document.getElementById('pokemon-stats').classList.add('d-none');
    document.getElementById('body').classList.remove('hide-scrollbar');
}

/**
 * Prevents the Pokemon popup from closing when clicking on its content.
 * @param {Event} event - The click event.
 * @function
 */
function notClose(event) {
    event.stopPropagation();
}

/**
 * Loads more Pokemon data when scrolling down.
 * @function
 */
function loadMore() {
    let remainingPokemon = allPokemonData.length - nextPokemon;

    if (remainingPokemon <= 0) {
        // console.log('Maximale Länge erreicht!');
        return;
    }
    if (remainingPokemon > 20) {
        loadMorePokemon = 20;
    } else {
        loadMorePokemon = remainingPokemon;
    }

    renderAllPokemon();
}


/**
 * Listens for scroll events to load more Pokemon when scrolling down.
 * @function
 */
window.addEventListener('scroll', () => {
    if (document.getElementById('load-more-function')) {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 200) {
            loadMore();
            // console.log('geht nicht');
        }
    }
});
