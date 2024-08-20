/**
 * Variable to hold all Pokémon data for the current region.
 * @type {Object[]}
 */
let regionAllPokemon;

/**
 * Array to store all Pokémon data for the current region.
 * @type {Object[]}
 */
let allRegionPokemonData = [];

/**
 * Starting index for loading Pokémon data.
 * @type {number}
 */
let startIndex = 0;

/**
 * Ending index for loading Pokémon data.
 * @type {number}
 */
let endIndex = 20;

/**
 * Number of Pokémon to load at a time.
 * @type {number}
 */
let loadMorePokemon = 20;

/**
 * Index of the next Pokémon to load.
 * @type {number}
 */
let nextPokemon = 0;

/**
 * Reference to the progress bar element.
 * @type {HTMLElement}
 */
let progressBarNone = document.getElementById('progress-bar');

/**
 * Initializes the application by loading Pokémon data for the specified region
 * and rendering it.
 * @async
 * @function
 * @param {number} currentRegion - The ID of the region to load Pokémon data for.
 */
async function initAllRegionPokemon(currentRegion) {
    await loadRegion(currentRegion);
    renderRegionPokemon();
    startLoadCompleteRegionPokemon();
    startLoadCompletePokemon();
    load();
    renderAllDraggedPokemon();
}

/**
 * Loads all Pokémon data for the specified region.
 * @async
 * @function
 * @param {number} currentRegion - The ID of the region to load Pokémon data for.
 */
async function loadRegion(currentRegion) {
    let regionsUrl = `https://pokeapi.co/api/v2/pokedex/${currentRegion}`;
    let response = await fetch(regionsUrl);
    let regionLoaded = await response.json();
    regionAllPokemon = regionLoaded['pokemon_entries'];

    await loadRegionPokemon();
}

/**
 * Loads Pokémon data for the current region.
 * @async
 * @function
 */
async function loadRegionPokemon() {
    allRegionPokemonData = [];
    const promises = [];

    for (let h = startIndex; h < endIndex; h++) { 
        let pokemonUrl = regionAllPokemon[h]['pokemon_species']['url'];
        let response = await fetch(pokemonUrl);
        let currentRegionPokemon = await response.json();

        let regionPokemonId = currentRegionPokemon['id'];
        promises.push(loadAllPokemonApi(regionPokemonId));
    }
    await Promise.all(promises);
}

/**
 * Loads all remaining Pokémon data for the current region after the first 20 Pokémon have been rendered.
 * @function
 */
function startLoadCompleteRegionPokemon() {
    endIndex = regionAllPokemon.length;
    loadRegionPokemon();
}

/**
 * Loads detailed data for a specific Pokémon from the Pokémon API.
 * @async
 * @function
 * @param {number} regionPokemonId - The ID of the Pokémon to load data for.
 */
async function loadAllPokemonApi(regionPokemonId) {
    let allPokemonUrl = 'https://pokeapi.co/api/v2/pokemon/' + regionPokemonId;
    let response2 = await fetch(allPokemonUrl);
    let currenRegionPokemon = await response2.json();
    allRegionPokemonData.push({ name: currenRegionPokemon['name'], data: currenRegionPokemon });
}

/**
 * Renders all Pokémon for the current region on the page.
 * @function
 */
function renderRegionPokemon() {
    for (let i = nextPokemon; i < loadMorePokemon; i++) {
        let number = allRegionPokemonData[i]['data']['id'];
        let name = allRegionPokemonData[i]['name'];
        let typesStyle = allRegionPokemonData[i]['data']['types'][0]['type']['name'] + '-border';

        document.getElementById('pokedex').innerHTML += singlePokemonTemplateKanto(i, number, name, typesStyle);
    }
    stopScroll = false;
    disableLoadingScreen();
}

/**
 * Creates HTML for a single Pokémon card in the region.
 * @param {number} i - The index of the Pokémon.
 * @param {number} number - The ID of the Pokémon.
 * @param {string} name - The name of the Pokémon.
 * @param {string} typesStyle - The class name for Pokémon type style.
 * @returns {string} - The HTML string for the Pokémon card.
 */
function singlePokemonTemplateKanto(i, number, name, typesStyle) {
    return `
    <div draggable="true" ondragstart="startDragging(${number-1})" onclick="pokemonPopup(${number-1})" class="pokemon-card ${typesStyle}">
    <div class="type-card">
        <div class="types-content">
            ${typeTemplate(allRegionPokemonData[i])}
        </div>
        <div class="pokemonId">#${i+1}</div>
    </div>
        <img src="img/pokemon/${number}.png" alt="">
        <div>${name}</div>      
    </div>
    `;
}

/**
 * Loads more Pokémon data when scrolling down.
 * @function
 */
function loadMoreRegion() {
    let remainingPokemon = allRegionPokemonData.length - loadMorePokemon;

    if (remainingPokemon <= 0) {
        console.log('Maximale Länge erreicht!');
        return; 
    }
    if (remainingPokemon > 20) {
        loadMorePokemon += 20;
        nextPokemon += 20;
        renderRegionPokemon(); 
    } else {
        loadMorePokemon = allRegionPokemonData.length;
        renderRegionPokemon(); 
    }
}

/**
 * Listens for scroll events to load more Pokémon data when scrolling down.
 * @function
 */
window.addEventListener('scroll', () => {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 200) { 
        loadMoreRegion();
    }
});
