"use strict";
const sentences = document.querySelectorAll(".sentence");
const keyboardButtons = document.querySelectorAll(".kbd-btn");
const allLetters = document.querySelectorAll(".letter");
const header = document.querySelector("#header");
const spinner = document.createElement("img");
spinner.src = "./assets/img/spinner.gif";
spinner.alt = "Spinner Loader";
spinner.classList.add("spinner");

let puzzle = null;
// puzzle = getWord();
puzzle = { word: "levee" };

let currentChance = 0;
let currentSentenceDisplay = Array.from(sentences[currentChance].children);
let currentIndex = 0;
const invalidLetters = [];
keyboardButtons.forEach((btn) =>
  btn.addEventListener("click", (e) => {
    const letter = btn.textContent.toUpperCase();
    switchInput(letter);
  })
);

window.document.addEventListener("keyup", async (e) => {
  const letter = e.key.toUpperCase();
  if (!invalidLetters.includes(letter)) {
    switchInput(letter);
  }
});

function appendLetter(letter) {
  if (isLetter(letter) && currentIndex < 5) {
    if (currentSentenceDisplay !== null) {
      currentSentenceDisplay[currentIndex].textContent = letter;
      currentIndex++;
    }
  }
}

function clearLetter() {
  if (currentIndex > 0) {
    currentIndex--;
    if (currentSentenceDisplay !== null) {
      currentSentenceDisplay[currentIndex].textContent = "";
    }
  }
}

function switchInput(input) {
  switch (input) {
    case "ENTER":
      run();
      break;
    case "⌫":
    case "BACKSPACE":
      clearLetter();
      break;
    default:
      appendLetter(input);
  }
}

function isLetter(str) {
  return str.length === 1 && str.match(/[a-z]/i);
}

function updateCurrentSentenceDisplay() {
  if (currentChance < 5) {
    currentSentenceDisplay = Array.from(sentences[currentChance].children);
  } else {
    currentSentenceDisplay = null;
  }
}

async function run() {
  if (currentChance < 5 && currentIndex === 5) {
    // checar se a palavra é valida, caso contrario retornar;
    const word = makeWord();
    const valid = await validateWord(word);
    if (valid) {
      const win = checkWord(word);
      if (win) {
        success();
        return;
      } else {
        resetRound();
      }
    } else {
      toggleDisplayError();
    }
  }

  if (currentChance === 5) {
    failed();
  }
}

function success() {
  currentChance = 5;
  currentIndex = 0;
  updateCurrentSentenceDisplay();
}

function failed() {
  alert(`End game, word: ${puzzle.word}!`);
}
function makeWord() {
  if (currentIndex === 5) {
    let wordArray = [];
    for (const letter of currentSentenceDisplay) {
      wordArray.push(letter.textContent);
    }
    return wordArray.join("");
  }

  return "";
}
function resetRound() {
  currentIndex = 0;
  if (currentChance <= 4) {
    currentChance++;
    updateCurrentSentenceDisplay();
  }
}

async function validateWord(word) {
  const url = `https://words.dev-apis.com/validate-word`;
  try {
    toggleSpinner();
    const response = await fetch(url, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ word }),
    }).then((data) => data.json());
    toggleSpinner();
    return response.validWord;
  } catch (e) {
    alert(`${e.message}`);
  }
}

function checkWord(word) {
  const wordTarget = [...word.toLowerCase()];
  const puzzleTarget = [...puzzle.word];
  const almostLetters = [];
  for (let i = 0; i < wordTarget.length; i++) {
    addLetterClass(i, "away");
    if (wordTarget[i] === puzzleTarget[i]) {
      addLetterClass(i, "success");
      continue;
    }
    for (let j = 0; j < puzzleTarget.length; j++) {
      if (wordTarget[i] === puzzleTarget[j]) {
        if (wordTarget[i] === wordTarget[j]) {
          continue;
        } else if (!almostLetters.includes(wordTarget[i])) {
          addLetterClass(i, "almost");
          almostLetters.push(wordTarget[i]);
          break;
        }
      }
    }
  }
  return word.toLowerCase() === puzzle.word;
}

function getIndexes(letter, word) {
  const indexes = new Map();
  for (let i = 0; i < word.length; i++) {
    indexes.set(word[i], 0);
  }

  for (let i = 0; i < word.length; i++) {
    let count = indexes.get(word[i]);
    count++;
    indexes.set(word[i], count);
  }

  return indexes.get(letter);
}
async function getWord() {
  try {
    puzzle = await axios(
      `https://words.dev-apis.com/word-of-the-day?random=1`
    ).then((res) => res.data);
  } catch (e) {
    alert(e.message);
  }
}

function toggleDisplayError() {
  currentSentenceDisplay.forEach((letter) => {
    letter.classList.add("shake-error");
  });
}

function addLetterClass(index, className) {
  const letter = currentSentenceDisplay[index];
  letter.classList.remove("away");
  letter.classList.add(className);
  for (let i = 0; i < keyboardButtons.length; i++) {
    const btn = keyboardButtons[i];
    if (btn.textContent === letter.textContent) {
      btn.classList.remove("away");
      btn.classList.add(className);
      if (btn.classList.contains("almost")) {
        btn.classList.remove("away");
      }
      if (btn.classList.contains("away")) {
        btn.setAttribute("disabled", "");
        invalidLetters.push(btn.textContent);
      } else {
        btn.removeAttribute("disabled");
        invalidLetters.splice(invalidLetters.indexOf(btn.textContent), 1);
      }
    }
  }
}

function toggleSpinner() {
  if (header.lastElementChild === spinner) {
    header.lastElementChild.remove();
  } else {
    header.appendChild(spinner);
  }
}

allLetters.forEach((letter) =>
  letter.addEventListener("animationend", (e) => {
    letter.classList.remove("shake-error");
  })
);
