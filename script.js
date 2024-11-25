// Select Elements
const testAreas = document.querySelectorAll("textarea");
const originTexts = [
    document.querySelector("#origin-text-1 p").innerText,
    document.querySelector("#origin-text-2 p").innerText,
];
const resetButtons = document.querySelectorAll(".reset-button");
const timerDisplays = document.querySelectorAll(".timer");
const wpmDisplays = document.querySelectorAll(".wpm");
const highScoreLists = document.querySelectorAll(".high-score-list");

// Variables for Each Test
const testStates = [
    {
        timer: [0, 0, 0, 0],
        interval: null,
        timerRunning: false,
        completed: false,
        highScores: []
    },
    {
        timer: [0, 0, 0, 0],
        interval: null,
        timerRunning: false,
        completed: false,
        highScores: []
    }
];

// Add Leading Zero to Numbers 9 or Below
function leadingZero(time) {
    return time <= 9 ? "0" + time : time;
}

// Run Timer for Specific Test
function runTimer(testIndex) {
    const state = testStates[testIndex];
    const timer = state.timer;
    
    const currentTime = `${leadingZero(timer[0])}:${leadingZero(timer[1])}:${leadingZero(timer[2])}`;
    timerDisplays[testIndex].innerText = currentTime;
    timer[3]++;

    timer[0] = Math.floor((timer[3] / 100) / 60); // Minutes
    timer[1] = Math.floor((timer[3] / 100) % 60); // Seconds
    timer[2] = Math.floor(timer[3] % 100); // Hundredths
}

// Save High Score for Specific Test
function saveHighScore(testIndex, completionTime) {
    const totalCharacters = originTexts[testIndex].length;
    const minutes = completionTime / 6000;
    const wpm = Math.floor((totalCharacters / 5) / minutes);

    testStates[testIndex].highScores.push({ time: completionTime, wpm });
    testStates[testIndex].highScores.sort((a, b) => a.time - b.time);

    if (testStates[testIndex].highScores.length > 3) {
        testStates[testIndex].highScores.pop();
    }
    
    displayHighScores(testIndex);
}

// Display High Scores for Specific Test
function displayHighScores(testIndex) {
    const scores = testStates[testIndex].highScores;
    highScoreLists[testIndex].innerHTML = scores
        .map((score, rank) => {
            const minutes = Math.floor((score.time / 100) / 60);
            const seconds = Math.floor((score.time / 100) % 60);
            const hundredths = Math.floor(score.time % 100);
            
            return `
                <li>
                    Rank #${rank + 1}: ${leadingZero(minutes)}:${leadingZero(seconds)}:${leadingZero(hundredths)} 
                    (WPM: ${score.wpm})
                </li>`;
        })
        .join("");
}

// Start Timer for Specific Test
function startTimer(testIndex) {
    const state = testStates[testIndex];
    if (!state.timerRunning) {
        state.timerRunning = true;
        state.interval = setInterval(() => runTimer(testIndex), 10);
    }
}

// Update WPM for Specific Test
function updateWPM(testIndex) {
    const totalCharacters = testAreas[testIndex].value.length;
    const minutes = testStates[testIndex].timer[3] / 6000;
    const wpm = minutes > 0 ? Math.floor((totalCharacters / 5) / minutes) : 0;
    wpmDisplays[testIndex].innerText = `WPM: ${wpm}`;
}

// Check Text for Specific Test
function checkText(testIndex) {
    const state = testStates[testIndex];
    const textEntered = testAreas[testIndex].value;
    const originTextMatch = originTexts[testIndex].substring(0, textEntered.length);
    const wrapper = testAreas[testIndex].parentElement;

    if (textEntered === originTexts[testIndex] && !state.completed) {
        state.completed = true;
        wrapper.classList.remove("blue", "red");
        wrapper.classList.add("green");
        clearInterval(state.interval);
        saveHighScore(testIndex, state.timer[3]);
        updateWPM(testIndex);
    } else if (textEntered === originTextMatch) {
        wrapper.classList.remove("red");
        wrapper.classList.add("blue");
    } else {
        wrapper.classList.remove("blue");
        wrapper.classList.add("red");
    }

    updateWPM(testIndex);
}

// Reset Everything for Specific Test
function resetTest(testIndex) {
    const state = testStates[testIndex];
    
    clearInterval(state.interval);
    state.interval = null;
    state.timer = [0, 0, 0, 0];
    state.timerRunning = false;
    state.completed = false;

    testAreas[testIndex].value = "";
    const wrapper = testAreas[testIndex].parentElement;
    wrapper.classList.remove("blue", "red", "green");

    timerDisplays[testIndex].innerText = "00:00:00";
    wpmDisplays[testIndex].innerText = "WPM: 0";
}

// Event Listeners
testAreas.forEach((testArea, index) => {
    testArea.addEventListener("keypress", () => startTimer(index));
    testArea.addEventListener("keyup", () => checkText(index));
});

resetButtons.forEach((button, index) => {
    button.addEventListener("click", () => resetTest(index));
});
