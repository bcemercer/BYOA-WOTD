console.log('Script is loading');

const words = [
    {
        word: "Serendipity",
        definition: "The occurrence and development of events by chance in a happy or beneficial way",
        pronunciation: "ˌserənˈdipədē"
    },
    {
        word: "Ephemeral",
        definition: "Lasting for a very short time",
        pronunciation: "əˈfem(ə)rəl"
    },
    {
        word: "Mellifluous",
        definition: "Sweet or musical; pleasant to hear",
        pronunciation: "məˈliflo͞oəs"
    },
    {
        word: "Ubiquitous",
        definition: "Present, appearing, or found everywhere",
        pronunciation: "yo͞oˈbikwədəs"
    },
    {
        word: "Eloquent",
        definition: "Fluent or persuasive in speaking or writing",
        pronunciation: "ˈeləkwənt"
    }
];

// Initialize history without relying on localStorage
let wordHistory = [];

// Keep some fallback words in case the API fails
const fallbackWords = [
    // ... keep existing words array as fallback ...
];

// List of common English words to get random words from
const commonWords = [
    "time", "way", "year", "work", "life", "day", "part", "world", 
    "house", "course", "case", "point", "company", "number", "group", 
    "problem", "fact", "idea", "water", "thing", "right", "study", 
    "book", "eye", "job", "word", "business", "issue", "side", "kind",
    "head", "question", "information", "story", "example", "family",
    "history", "moment", "mind", "team", "art", "body", "friend",
    "force", "science", "music", "game", "reason", "law", "nature"
];

// Function to fetch a random word from the API
async function fetchRandomWord() {
    try {
        // Get a random word from our common words list
        const randomWord = commonWords[Math.floor(Math.random() * commonWords.length)];
        
        // Fetch word data from Free Dictionary API
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${randomWord}`);
        const data = await response.json();
        
        if (data && data[0]) {
            const wordData = data[0];
            return {
                word: wordData.word,
                definition: wordData.meanings[0].definitions[0].definition,
                pronunciation: wordData.phonetic || "Pronunciation not available",
                date: new Date().toLocaleDateString()
            };
        } else {
            throw new Error('No definition found');
        }
    } catch (error) {
        console.error('Error fetching word:', error);
        // Fallback to our local words if API fails
        return getRandomWordFromFallback();
    }
}

// Modified getRandomWord function to use API
async function getRandomWord() {
    const wordData = await fetchRandomWord();
    return wordData;
}

// Fallback function using local words
function getRandomWordFromFallback() {
    const index = Math.floor(Math.random() * fallbackWords.length);
    return {
        ...fallbackWords[index],
        date: new Date().toLocaleDateString()
    };
}

function getWordOfTheDay() {
    const today = new Date();
    const dateString = today.toLocaleDateString();
    const index = Math.floor(Math.abs(Math.sin(today.getDate())) * words.length);
    return {
        ...words[index],
        date: dateString
    };
}

// Modified updateWord function to handle async
async function updateWord(wordDataPromise) {
    try {
        // Show loading state
        document.getElementById('word').textContent = "Loading...";
        document.getElementById('definition').textContent = "Finding a new word...";
        
        const wordData = await wordDataPromise;
        const wordElement = document.getElementById('word');
        const definitionElement = document.getElementById('definition');
        const pronunciationElement = document.getElementById('pronunciation');
        const dateElement = document.getElementById('date');

        wordElement.textContent = wordData.word;
        pronunciationElement.textContent = wordData.pronunciation;
        definitionElement.textContent = wordData.definition;
        dateElement.textContent = wordData.date;

        if (!wordHistory.some(item => item.word === wordData.word)) {
            wordHistory.unshift(wordData);
            if (wordHistory.length > 5) wordHistory.pop();
            updateHistoryDisplay();
        }
    } catch (error) {
        console.error('Error updating word:', error);
        // Show error state
        document.getElementById('word').textContent = "Oops!";
        document.getElementById('definition').textContent = "Something went wrong. Please try again.";
    }
}

function updateHistoryDisplay() {
    const historyList = document.getElementById('wordHistory');
    historyList.innerHTML = '';
    wordHistory.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.word} - ${item.date}`;
        historyList.appendChild(li);
    });
}

function copyToClipboard() {
    const word = document.getElementById('word').textContent;
    const definition = document.getElementById('definition').textContent;
    const textToCopy = `Word: ${word}\nDefinition: ${definition}`;
    
    // Create a temporary textarea element
    const textarea = document.createElement('textarea');
    textarea.value = textToCopy;
    document.body.appendChild(textarea);
    
    // Select and copy the text
    textarea.select();
    try {
        document.execCommand('copy');
        const copyBtn = document.getElementById('copyBtn');
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
            copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
        }, 2000);
    } catch (err) {
        console.error('Failed to copy text:', err);
    }
    
    // Remove the temporary textarea
    document.body.removeChild(textarea);
}

// Set up event listeners
function setupEventListeners() {
    const newWordBtn = document.getElementById('newWordBtn');
    const copyBtn = document.getElementById('copyBtn');

    newWordBtn.onclick = function() {
        updateWord(getRandomWord());
    };

    copyBtn.onclick = function() {
        copyToClipboard();
    };

    // Initial load
    updateWord(getWordOfTheDay());
}

// Run setup when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupEventListeners);
} else {
    setupEventListeners();
} 