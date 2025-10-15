// #0: Listen for page load
window.addEventListener("load", initApp);

let allGames = []; // Global array to hold all games

// #1: Initialize the app
function initApp() {
  console.log("initApp: app.js is running 🎉");
  getGames();

  // listners to filtre and search
  document
    .querySelectorAll(".genre-options input")
    .forEach((el) => el.addEventListener("change", filteredGames));
  document
    .querySelectorAll(".difficulty-options input")
    .forEach((el) => el.addEventListener("change", filteredGames));
  document
    .querySelectorAll(".language-options input")
    .forEach((el) => el.addEventListener("change", filteredGames));

  document
    .querySelector("#search-input")
    .addEventListener("input", filteredGames);
  document.querySelector("#close-dialog").addEventListener("click", () => {
    document.querySelector("#game-dialog").close();

    document
      .querySelector("#players-range")
      .addEventListener("input", filteredGames);
  });
}

// #2: Fetch games from JSON and display them
async function getGames() {
  const response = await fetch(
    "https://raw.githubusercontent.com/cederdorff/race/refs/heads/master/data/games.json"
  );
  allGames = await response.json();
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

  // --- Genre (checkboxes) ---
  const checkedGenres = Array.from(
    document.querySelectorAll(".genre-options input:checked")
  ).map((input) => input.parentElement.textContent.trim());

  // --- Difficulty (radio) ---
  const selectedDifficulty = document
    .querySelector(".difficulty-options input:checked")
    ?.parentElement.textContent.trim();

  // --- Language (radio) ---
  const selectedLanguage = document
    .querySelector(".language-options input:checked")
    ?.parentElement.textContent.trim();

  // Start med alle spil
  let filtered = allGames;

  // 1 Søgning
  if (searchValue) {
    filtered = filtered.filter((game) =>
      game.title.toLowerCase().includes(searchValue)
    );
  }

  // 2 Genre
  if (checkedGenres.length > 0) {
    filtered = filtered.filter((game) =>
      checkedGenres.some((genre) => game.genre.includes(genre))
    );
  }

  // 3 Sværhedsgrad
  if (selectedDifficulty) {
    filtered = filtered.filter(
      (game) => game.difficulty === selectedDifficulty
    );
  }

  // 4 Sprog
  if (selectedLanguage) {
    filtered = filtered.filter((game) => game.language === selectedLanguage);
  }

  // 5 Antal personer
  const playerCount = Number(document.querySelector("#players-range").value);
  if (playerCount) {
    filtered = filtered.filter((game) => {
      return playerCount >= game.players.min && playerCount <= game.players.max;
    });
  }

  displayGames(filtered);
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

// FILTER OVERLAY
const filterOverlay = document.querySelector("#filter-overlay");
const openFilterBtn = document.querySelector("#filtre-btn");
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

  if (resetFilterBtn) {
    resetFilterBtn.addEventListener("click", () => {
      // Uncheck all checkboxes and radios
      document
        .querySelectorAll(
          "#filter-overlay input[type=checkbox], #filter-overlay input[type=radio]"
        )
        .forEach((input) => (input.checked = false));

      // Reset all range inputs to their default values
      document
        .querySelectorAll("#filter-overlay input[type=range]")
        .forEach((input) => (input.value = input.defaultValue));

      // Reset search input if you have one
      const searchInput = document.querySelector("#search-input");
      if (searchInput) searchInput.value = "";

      // Reset genre and sort selects if you have them
      const genreSelect = document.querySelector("#genre-select");
      if (genreSelect) genreSelect.value = "all";
      const sortSelect = document.querySelector("#sort-select");
      if (sortSelect) sortSelect.value = "none";

      // Now re-render all games (show all)
      filteredGames();
    });
  }
});

//MENU OVERLAY
const menuOverlay = document.querySelector("#menu-overlay");
const openMenuBtn = document.querySelector("#menu-btn");
const closeMenuBtn = document.querySelector("#close-menu");

openMenuBtn.addEventListener("click", () => {
  menuOverlay.classList.remove("hidden");
});

closeMenuBtn.addEventListener("click", () => {
  menuOverlay.classList.add("hidden");
});
