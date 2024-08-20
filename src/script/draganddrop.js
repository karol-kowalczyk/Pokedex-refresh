/**
 * Loads the captured Pokemon from the local storage
 */
load();

/**
 * Start drag and drop function
 * 
 * @param {number} i - Pokemon Index
 */
function startDragging(i) {
    currentDraggedPokemon = i;
}

/**
 * Allows dropping by preventing the default behavior
 * 
 * @param {DragEvent} ev - The drag event
 */
function allowDrop(ev) {
    ev.preventDefault();
}

/**
 * Capitalizes the first letter of a string and makes the rest lowercase
 * 
 * @param {string} str - The string to capitalize
 * @return {string} - The capitalized string
 */
function capitalizeFirstLetter(str) {
    if (str.length === 0) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Moves the Pokemon into an array and renders it 
 */
function moveTo() {
    const pokemon = allPokemonData[currentDraggedPokemon];
    const pokemonName = capitalizeFirstLetter(pokemon['name']);  // Format the name
    const pokemonData = pokemon['data'];
    const isAlreadyCaught = allCatchedPokemon.some(p => p.name === pokemonName);

    if (!isAlreadyCaught) {
        allCatchedPokemon.push({ name: pokemonName, data: pokemonData });
        renderAllDraggedPokemon();
        save();
    } else {
        alert(`Pokémon ${pokemonName} wurde bereits gefangen.`);
    }
}

/**
 * Renders all captured Pokemon
 */
function renderAllDraggedPokemon() {
    document.getElementById('catch-me').innerHTML = '';

    for (let f = 0; f < allCatchedPokemon.length; f++) {
        let number = allCatchedPokemon[f]['data']['id'];
        let name = allCatchedPokemon[f]['name'];
        let typesStyle = allCatchedPokemon[f]['data']['types'][0]['type']['name'] + '-border';
        document.getElementById('catch-me').innerHTML += singlePokemonTemplateDragged(f, number, name, typesStyle);
    }

    const catchedInfo = document.getElementById('catch-me-info');
    if (allCatchedPokemon.length > 0) {
        catchedInfo.innerHTML = /* html */ `
            <span class="catched"><img src="/src/img/pokeball.svg" alt="">Caught Pokemon: ${allCatchedPokemon.length}</span>
            <div class="clear-catched-btn" onclick="clearCatchedPokemon()">Clear all</div>
        `;
    } else {
        catchedInfo.innerHTML = /* html */ `
        <div class="catch-me-empty">
            <span>Catch your favorite pokemon <br>with drag and drop!</span>
            <img src="/src/img/pfeil.svg" alt="">
        </div>
        `;
    }
}

/**
 * Generates HTML for a single captured Pokemon card
 * 
 * @param {number} i - Pokemon Index
 * @param {number} number - Pokemon ID
 * @param {string} name - Pokemon Name
 * @param {string} typesStyle - Add new Class for Type style
 * @return {string} - HTML string for the Pokemon card
 */
function singlePokemonTemplateDragged(i, number, name, typesStyle) {
    return /* html */ `
    <div draggable="true" ondragstart="startDragging(${i})" class="pokemon-card-drag ${typesStyle}">
        <div class="type-card">
            <div class="types-content">
                ${typeTemplate(allCatchedPokemon[i])}
            </div>
            <div class="numbers-div">
                <div class="pokemonId">#${number}</div>
                <div onclick="removePokemon(${i}); event.stopPropagation();" class="close-div">X</div>
            </div>
        </div>
        <img src="${allCatchedPokemon[i]['data']['sprites']['other']['dream_world']['front_default']}" alt="${name}">
        <div>${name}</div>      
    </div>
    `;
}

/**
 * Clears all captured Pokemon from the local storage and the current list
 */
function clearCatchedPokemon() {
    localStorage.clear();
    allCatchedPokemon = [];
    renderAllDraggedPokemon();
}

/**
 * Removes a Pokémon from the caught Pokémon list
 * 
 * @param {number} index - The index of the Pokémon to be removed
 */
function removePokemon(index) {
    if (index >= 0 && index < allCatchedPokemon.length) {
        allCatchedPokemon.splice(index, 1);  // Entfernt das Pokémon aus der Liste
        renderAllDraggedPokemon();          // Aktualisiert die Anzeige
        save();                             // Speichert die aktualisierte Liste
    }
}

/**
 * Saves the captured Pokemon in the local storage
 */
function save() {
    let catchedPokemon = JSON.stringify(allCatchedPokemon);
    localStorage.setItem('Catched Pokemon', catchedPokemon);
}

/**
 * Loads the captured Pokemon from the local storage
 */
function load() {
    let catchedPokemon = localStorage.getItem('Catched Pokemon');
    if (catchedPokemon) {
        allCatchedPokemon = JSON.parse(catchedPokemon);
    }
}
