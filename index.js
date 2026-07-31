const API_URL = "https://api.dictionaryapi.dev/api/v2/entries/en/";
let favorites = JSON.parse(localStorage.getItem('wordlyFavorites')) || [];

// Search form event
document.getElementById('searchForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const word = document.getElementById('searchInput').value.trim();
    if (!word) return showError("Please enter a word");
    fetchWord(word);
});

// Fetch data from Free Dictionary API
async function fetchWord(word) {
    showLoading(true);
    hideError();
    try {
        const res = await fetch(API_URL + word);
        if (!res.ok) throw new Error("Word not found. Please check spelling.");
        const data = await res.json();
        displayResults(data);
    } catch (err) {
        showError(err.message);
    } finally {
        showLoading(false);
    }
}

// Update DOM with API data
function displayResults(data) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.classList.remove('hidden');

    const wordData = data[0]; // Extract the primary object from the response array
    const isSaved = favorites.includes(wordData.word);
    const audio = wordData.phonetics?.find(p => p.audio)?.audio;

    let html = `
        <div class="word-header" style="display: flex; justify-content: space-between; align-items: center;">
            <h2>${wordData.word}</h2>
            <button class="save-btn ${isSaved ? 'saved' : ''}" onclick="toggleFavorite('${wordData.word}')">
                ${isSaved ? '★ Saved' : '☆ Save'}
            </button>
        </div>
    `;

    if (wordData.phonetic) {
        html += `<p class="pronunciation" style="color: var(--accent); font-style: italic;">${wordData.phonetic}</p>`;
    }
    if (audio) {
        html += `<button class="play-audio" onclick="playAudio('${audio}')">Play Pronunciation</button>`;
    }

    wordData.meanings.forEach(meaning => {
        html += `<div class="meaning" style="margin-top: 15px;">`;
        html += `<p class="part-of-speech" style="font-weight: bold; color: var(--accent); margin-bottom: 5px;">${meaning.partOfSpeech}</p>`;
        meaning.definitions.forEach(def => {
            html += `<p class="definition" style="margin: 5px 0;">• ${def.definition}</p>`;
            if (def.example) html += `<p class="example" style="font-style: italic; margin-left: 15px; color: #666;">Example: "${def.example}"</p>`;
            if (meaning.synonyms && meaning.synonyms.length) {
                html += `<div class="synonyms" style="margin-left: 15px; margin-top: 5px; margin-bottom: 10px;"><strong>Synonyms: </strong>`;
                meaning.synonyms.slice(0, 5).forEach(s => {
                    html += `<span class="tag">${s}</span>`;
                });
                html += `</div>`;
            }
        });
        html += `</div>`;
    });

    resultsDiv.innerHTML = html;
}

function playAudio(src) { 
    new Audio(src).play(); 
}

// Save words to localstorage
function toggleFavorite(word) {
    if (favorites.includes(word)) {
        favorites = favorites.filter(w => w !== word);
    } else {
        favorites.push(word);
    }
    localStorage.setItem('wordlyFavorites', JSON.stringify(favorites));
    renderFavorites();
    fetchWord(word);
}

function renderFavorites() {
    const list = document.getElementById('Favourites');
    if (favorites.length === 0) {
        list.innerHTML = "No saved words yet";
        return;
    }
    list.innerHTML = favorites.map(word => 
        `<div class="favorite-item" style="cursor: pointer; padding: 8px; background: var(--card); border: 1px solid #ccc; margin: 5px 0; border-radius: 4px;" onclick="fetchWord('${word}')">${word}</div>`
    ).join('');
}

function showLoading(show) { 
    document.getElementById('loading').classList.toggle('hidden', !show); 
}

function showError(msg) {
    const err = document.getElementById('error');
    err.textContent = msg;
    err.classList.remove('hidden');
    document.getElementById('results').classList.add('hidden');
}

function hideError() { 
    document.getElementById('error').classList.add('hidden'); 
}

renderFavorites(); // load on start
