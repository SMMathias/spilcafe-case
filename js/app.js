// #0: Listen for page load
window.addEventListener("load", initApp);

let allGames = []; // Global array to hold all games

// #1: Initialize the app
function initApp() {
  console.log("initApp: app.js is running 🎉");
  getGames();
  document
    .querySelector("#search-input")
    .addEventListener("input", filteredGames);
  document
    .querySelector("#genre-select")
    .addEventListener("change", filteredGames);
  document
    .querySelector("#sort-select")
    .addEventListener("change", filteredGames);

  document.querySelector("#close-dialog").addEventListener("click", () => {
    document.querySelector("#game-dialog").close();
  });

  // Clear filters knap - TILFØJ TIL SIDST
  document
    .querySelector("#clear-filters")
    .addEventListener("click", clearAllFilters);
}

// #2: Fetch games from JSON and display them
async function getGames() {
  const response = await fetch(
    "https://raw.githubusercontent.com/cederdorff/race/refs/heads/master/data/games.json"
  );
  allGames = await response.json();
  populateGenreDropdown(); // Udfyld dropdown med genres
  displayGames(allGames);
}

// #3: Render all games in the grid
function displayGames(games) {
  console.log(`🎬 Viser ${games.length} games`);
  // Nulstil #game-list HTML'en
  document.querySelector("#game-list").innerHTML = "";
  // Gennemløb alle games og kør displayGame-funktionen for hver game
  for (const game of games) {
    displayGame(game);
  }
}

// #4: Render a single game card and add event listeners
function displayGame(game) {
  const gameList = document.querySelector("#game-list");

  const gameHTML = `
    <article class="game-card" tabindex="0">
            <button class="pin-btn" aria-label="Pin" data-id="${game.id}">
              <span class="pin">${
                game.pinned ? "&#128274;" : "&#128204;"
              }</span>
            </button>

    <img src="${game.image}" 
           alt="Poster of ${game.title}" 
           class="game-poster" />

      <div class="game-info">
        <h3 id="game-title-card">${game.title} </h3>
        <p class="game-rating"> ${game.rating}</p>
        <p class="game-playtime">${game.playtime} min.</p>
        <p class="game-players">${game.players.min}-${
    game.players.max
  } personer</p>
        <p class="game-genre">${game.genre}</p>
      
      </div>
      <button class="card-btn">Se mere</button>
    </article>
  `;

  gameList.insertAdjacentHTML("beforeend", gameHTML);

  // Only declare newCard ONCE
  const newCard = gameList.lastElementChild;

  // Pin button toggle logic
  const pinBtn = newCard.querySelector(".pin-btn");
  pinBtn.addEventListener("click", function (event) {
    event.stopPropagation(); // Prevent triggering card click
    // Find the game by id
    const gameId = game.id;
    const gameObj = allGames.find((g) => g.id === gameId);
    if (gameObj) {
      gameObj.pinned = !gameObj.pinned;
      filteredGames(); // Re-render the list to update the icon
    }
  });

  // Tilføj click event til den nye card
  newCard.addEventListener("click", function () {
    console.log(`🎬 Klik på: "${game.title}"`);
    showGameModal(game);
  });

  // Tilføj keyboard support
  newCard.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      showGameModal(game);
    }
  });
}

// #5: Kombineret søgning og genre filtrering
function filteredGames() {
  const searchValue = document
    .querySelector("#search-input")
    .value.toLowerCase();
  const genreValue = document.querySelector("#genre-select").value;
  const sortValue = document.querySelector("#sort-select").value;

  // NYE rating variable - TILFØJ EFTER år variablerne
  const ratingFrom = Number(document.querySelector("#rating-from").value) || 0;
  const ratingTo = Number(document.querySelector("#rating-to").value) || 10;

  console.log("Rating filter:", ratingFrom, "til", ratingTo);

  // Start med alle games
  let filteredGames = allGames;

  // TRIN 1: Filtrer på søgetekst
  if (searchValue) {
    filteredGames = filteredGames.filter((game) => {
      return game.title.toLowerCase().includes(searchValue);
    });
  }

  // TRIN 2: Filtrer på genre
  if (genreValue !== "all") {
    filteredGames = filteredGames.filter((game) => {
      return game.genre.includes(genreValue);
    });
  }

  // Rating range filter - TILFØJ EFTER år filter
  if (ratingFrom > 0 || ratingTo < 10) {
    console.log("Anvender rating filter:", ratingFrom, "-", ratingTo);
    const before = filteredGames.length;

    filteredGames = filteredGames.filter((game) => {
      return game.rating >= ratingFrom && game.rating <= ratingTo;
    });

    console.log("Rating filter:", before, "→", filteredGames.length, "Spil");
  } else {
    console.log("Ingen rating filter (alle ratings)");
  }

  // TRIN 3: Sorter resultater
  if (sortValue === "title") {
    filteredGames.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortValue === "rating") {
    filteredGames.sort((a, b) => b.rating - a.rating); // Højeste først
  }

  displayGames(filteredGames);
}

// Ny funktion: Ryd alle filtre - TILFØJ DENNE
function clearAllFilters() {
  console.log("🗑️ Rydder alle filtre");

  // Ryd søgning og dropdown felter
  document.querySelector("#search-input").value = "";
  document.querySelector("#genre-select").value = "all";
  document.querySelector("#sort-select").value = "none";

  // Ryd de nye range felter
  document.querySelector("#rating-from").value = "";
  document.querySelector("#rating-to").value = "";

  // Kør filtrering igen (viser alle film)
  filteredGames();
}

// #6: Udfyld genre-dropdown med alle unikke genrer
function populateGenreDropdown() {
  const genreSelect = document.querySelector("#genre-select");
  const genres = new Set();

  for (const game of allGames) {
    for (const genre of game.genre) {
      genres.add(genre);
    }
  }

  // Fjern gamle options undtagen 'Alle genrer'
  genreSelect.innerHTML = '<option value="all">Alle genrer</option>';

  const sortedGenres = Array.from(genres).sort();
  for (const genre of sortedGenres) {
    genreSelect.insertAdjacentHTML(
      "beforeend",
      `<option value="${genre}">${genre}</option>`
    );
  }
}

// #8: Vis game i modal dialog
function showGameModal(game) {
  console.log("🎭 Åbner modal for:", game.title);

  // Byg HTML struktur dynamisk
  const dialogContent = document.querySelector("#dialog-content");
  dialogContent.innerHTML = `
    <div class="dialog-details">
      <h2 id="game-title-dialog">${game.title}</h2>
      <div class="game-information">
        <p class="game-rating"> ${game.rating}</p>
        <p class="game-playtime">${game.playtime} min.</p>
        <p class="game-players">${game.players.min}-${game.players.max} personer</p>
        <p class="game-genre">${game.genre}</p>
        <p class="game-difficulty"> ${game.difficulty}</p>
        <p class="game-age"> ${game.age} år</p>
        <p class="game-language"> ${game.language}</p>
        <p class= "game-location"> ${game.location}</p>
      </div>
    </div>  
    <div class="overlay"><img src="${game.image}" alt="Poster af ${game.title}" class="game-poster">
     <div class="game-shelf">HYLDE:${game.shelf} </div>
     <h3 id="game-desc">BESKRIVELSE</h3>
     <p class="game-description">${game.description}</p>
     </div>
   
  `;

  // Åbn modalen
  document.querySelector("#game-dialog").showModal();
}

// FILTER OVERLAY LOGIK
const filterOverlay = document.querySelector("#filter-overlay");
const openFilterBtn = document.querySelector("#open-filter");
const closeFilterBtn = document.querySelector("#close-filter");
const resetFilterBtn = document.querySelector("#reset-filter");

openFilterBtn.addEventListener("click", () => {
  filterOverlay.classList.remove("hidden");
});

closeFilterBtn.addEventListener("click", () => {
  filterOverlay.classList.add("hidden");
});

resetFilterBtn.addEventListener("click", () => {
  document
    .querySelectorAll(
      "#filter-overlay input[type=checkbox], #filter-overlay input[type=radio]"
    )
    .forEach((input) => (input.checked = false));
});
