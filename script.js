import { CLASSIC_WORDS, GEOGRAPHY_WORDS, CINEMA_WORDS } from "./words.js";
let activeWordList = CLASSIC_WORDS;
let livesRemaining = 3;
const NUMBER_OF_GUESSES = 6;
let guessesRemaining = NUMBER_OF_GUESSES;
let currentGuess = [];
let nextLetter = 0;
let rightGuessString = activeWordList[Math.floor(Math.random() * activeWordList.length)]
let scoredPositions = [];
console.log(rightGuessString)

function initBoard() {
    let board = document.getElementById("game-board");
    for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
        let row = document.createElement("div")
        row.className = "letter-row"
        for (let j = 0; j < 5; j++) {
            let box = document.createElement("div")
            box.className = "letter-box"
            row.appendChild(box)
        }
        board.appendChild(row)
    }
}
initBoard()


function resetLevel (){
    rightGuessString = activeWordList[Math.floor(Math.random() * activeWordList.length)];
    console.log("New word: ", rightGuessString);

    guessesRemaining = NUMBER_OF_GUESSES;
    currentGuess = []
    nextLetter = 0;
    scoredPositions = [];

    document.getElementById("game-board").innerHTML = "";
    initBoard();

    for (const elem of document.getElementsByClassName("keyboard-button")) {
        elem.style.backgroundColor = "";
    }
}
function changeTheme(themeName) {

    document.body.className = "";

    if (themeName === "geography") {
        activeWordList = GEOGRAPHY_WORDS;
        document.body.classList.add("theme-geography");
    } else if (themeName === "cinema") {
        activeWordList = CINEMA_WORDS;
        document.body.classList.add("theme-cinema");
    } else {
        activeWordList = CLASSIC_WORDS;
        document.body.classList.add("theme-classic");
    }

    pointsCounter.points = 0;
    livesRemaining = 3;
    updateHeartsUI();
    resetLevel();

}

function updateHeartsUI() {
    const container = document.getElementById("hearts-container");
    if (container) {
        container.textContent = "❤️ ".repeat(livesRemaining) || "💀";
    }
}
document.getElementById("theme-select").addEventListener("change", (e) => {
    changeTheme(e.target.value);
});

const pointsCounter = {
    internalValue: 0,

    get points() {
        return this.internalValue;
    },

    set points(newValue) {
        this.internalValue = newValue;
        document.getElementById("points-counter").textContent = newValue;
    }
};

pointsCounter.points = 0;
document.addEventListener("keyup", (e) => {
    if (guessesRemaining === 0) {
        return
    }
    let pressedKey = String(e.key)
    if (pressedKey === "Backspace" && nextLetter !== 0) {
        deleteLetter()
        return
    }
    if (pressedKey === "Enter") {
        checkGuess()
        return
    }
    let found = pressedKey.match(/[a-z]/gi)
    if (!found || found.length > 1) {
        return
    } else {
        insertLetter(pressedKey)
    }
})

function insertLetter (pressedKey) {
    if (nextLetter === 5) {
        return
    }
    pressedKey = pressedKey.toLowerCase()
    let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining]
    let box = row.children[nextLetter]
    animateCSS(box, "pulse")
    box.textContent = pressedKey
    box.classList.add("filled-box")
    currentGuess.push(pressedKey)
    nextLetter += 1
}

function deleteLetter () {
    let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining]
    let box = row.children[nextLetter - 1]
    box.textContent = ""
    box.classList.remove("filled-box")
    currentGuess.pop()
    nextLetter -= 1
}

function checkGuess () {
    let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining]
    let guessString = ''
    let rightGuess = Array.from(rightGuessString)
    for (const val of currentGuess) {
        guessString += val
    }
    if (guessString.length != 5) {
        toastr.error("Not enough letters!")
        return
    }
    if (!activeWordList.includes(guessString)) {
        toastr.error("Word not in list!")
        return
    }
    for (let i = 0; i < 5; i++) {
        let letterColor = ''
        let box = row.children[i]
        let letter = currentGuess[i]
        let letterPosition = rightGuess.indexOf(currentGuess[i])
// is letter in the correct guess
        if (letterPosition === -1) {
            letterColor = 'grey'
        } else {
// now, letter is definitely in word
// if letter index and right guess index are the same
// letter is in the right position
            if (currentGuess[i] === rightGuess[i]) {
// shade green
                letterColor = 'green'

                if (!scoredPositions.includes(i)) {
                    pointsCounter.points += 5;
                    scoredPositions.push(i);
                }
            } else {
// shade box yellow
                letterColor = 'yellow'
            }
            rightGuess[letterPosition] = "#"
        }
        let delay = 250 * i
        setTimeout(()=> {
            //flip box
            animateCSS(box, 'flipInX')
            //shade box
            box.style.backgroundColor = letterColor
            shadeKeyBoard(letter, letterColor)
        }, delay)
    }
    if (guessString === rightGuessString) {
        toastr.success("Good job!");

        setTimeout(() => {
            resetLevel();
        }, 1500);

        return;

    } else {
        guessesRemaining -= 1;
        currentGuess = [];
        nextLetter = 0;
        if (guessesRemaining === 0) {
            livesRemaining -= 1;
            updateHeartsUI();

            if (livesRemaining <= 0) {
                toastr.error(`The right word was: "${rightGuessString}"`);
                toastr.error(`Game Over!`);

                guessesRemaining = 0;
            } else {
                toastr.warning(`The right word was "${rightGuessString}".`);
                toastr.info(`Next word...`);

                setTimeout(() => {
                    resetLevel();
                }, 1500);

            }
        }
    }
}

function shadeKeyBoard(letter, color) {
    for (const elem of document.getElementsByClassName("keyboard-button")) {
        if (elem.textContent === letter) {
            let oldColor = elem.style.backgroundColor
            if (oldColor === 'green') {
                return
            }
            if (oldColor === 'yellow' && color !== 'green') {
                return
            }
            elem.style.backgroundColor = color
            break
        }
    }
}

document.getElementById("keyboard-cont").addEventListener("click", (e) => {
    const target = e.target
    if (!target.classList.contains("keyboard-button")) {
        return
    }
    let key = target.textContent
    if (key === "Del") {
        key = "Backspace"
    }
    document.dispatchEvent(new KeyboardEvent("keyup", {'key': key}))
})

const animateCSS = (element, animation, prefix = 'animate__') =>
// We create a Promise and return it
    new Promise((resolve, reject) => {
        const animationName = `${prefix}${animation}`;
// const node = document.querySelector(element);
        const node = element
        node.style.setProperty('--animate-duration', '0.3s');
        node.classList.add(`${prefix}animated`, animationName);
// When the animation ends, we clean the classes and resolve the Promise
        function handleAnimationEnd(event) {
            event.stopPropagation();
            node.classList.remove(`${prefix}animated`, animationName);
            resolve('Animation ended');
        }
        node.addEventListener('animationend', handleAnimationEnd, {once: true});
    });

