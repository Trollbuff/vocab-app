// =======================================
// CONFIG
// =======================================
const SPREADSHEET_ID = "1dJuGpb8KrMKXtubfvb0fOD4swIIHzqBMW37KwdP12ug";

let allWords = [];
let currentWords = [];
let shuffledWords = [];
let currentWord = null;
let currentIndex = 0;

let mode = "EN-VI";
let correct = 0;
let total = 0;

// =======================================
// DOM
// =======================================
const wordListDiv = document.getElementById("wordList");
const gradeSelect = document.getElementById("gradeSelect");
const sectionSelect = document.getElementById("sectionSelect");

const wordDiv = document.getElementById("word");
const meaningDiv = document.getElementById("meaning");
const wordImage = document.getElementById("wordImage");

const nextBtn = document.getElementById("nextBtn");
const checkBtn = document.getElementById("checkBtn");
const answerInput = document.getElementById("answerInput");
const resultIcon = document.getElementById("resultIcon");

const correctCount = document.getElementById("correctCount");
const totalCount = document.getElementById("totalCount");
const accuracyText = document.getElementById("accuracy");

const correctSound = document.getElementById("correctSound");
const wrongSound = document.getElementById("wrongSound");

const card = document.getElementById("card");
const clockText = document.getElementById("clockText");
const wordListPanel = document.querySelector(".word-list-panel");

const toggleWordList = document.getElementById("toggleWordList");

// =======================================
// LOAD SHEET
// =======================================
async function loadGradeSheet(gradeName) {
  if (!gradeName) return;

  const url = `https://opensheet.elk.sh/${SPREADSHEET_ID}/${gradeName}`;

  try {
    const res = await fetch(url);
    allWords = await res.json();
    setupSections();
  } catch (err) {
    console.error("Error loading sheet:", err);
  }
}

// =======================================
// SETUP SECTION
// =======================================
function setupSections() {
  const sections = [...new Set(allWords.map((w) => w.section))];

  sectionSelect.innerHTML = "";

  sections.forEach((section) => {
    const option = document.createElement("option");
    option.value = section;
    option.textContent = section;
    sectionSelect.appendChild(option);
  });

  if (sections.length > 0) {
    loadSection(sections[0]);
  }
}

// =======================================
// RENDER WORD LIST
// =======================================
function renderWordList() {
  wordListDiv.innerHTML = "";

  if (!currentWords.length) {
    wordListDiv.innerHTML = "<p>No words found</p>";
    return;
  }

  currentWords.forEach((w) => {
    const div = document.createElement("div");
    div.className = "word-item";
    div.innerHTML = `
      <strong>${w.word || ""}</strong><br>
      ${w.meaning || ""}
    `;
    wordListDiv.appendChild(div);
  });
}

// =======================================
// LOAD SECTION
// =======================================
function loadSection(sectionName) {
  currentWords = allWords.filter((w) => w.section === sectionName);
  renderWordList();
  shuffleWords();
}

// =======================================
// SHUFFLE
// =======================================
function shuffleWords() {
  shuffledWords = [...currentWords].sort(() => Math.random() - 0.5);

  currentIndex = 0;
  showSectionTitle();
}

// =======================================
// SHOW TITLE
// =======================================
function showSectionTitle() {
  wordDiv.textContent = sectionSelect.value || "Select Section";
  meaningDiv.textContent = "Click NEXT to start learning";
  meaningDiv.classList.remove("hidden");
  wordImage.src = "";
  currentWord = null;
}

// =======================================
// NEXT WORD
// =======================================
function nextWord() {
  // Khi bắt đầu học → Ẩn word list
  if (currentIndex === 0) {
    wordListPanel.style.display = "none";
  }

  if (currentIndex >= shuffledWords.length) {
    wordDiv.textContent = "🎉 Completed!";
    meaningDiv.textContent = "You finished this section.";
    meaningDiv.classList.remove("hidden");
    wordImage.src = "";

    // Khi hoàn thành → Hiện lại word list
    wordListPanel.style.display = "block";

    return;
  }

  currentWord = shuffledWords[currentIndex++];
  answerInput.value = "";
  resultIcon.textContent = "";
  meaningDiv.classList.add("hidden");

  wordImage.src = currentWord.image || "";

  if (mode === "EN-VI") {
    wordDiv.textContent = currentWord.word;
    meaningDiv.textContent = currentWord.meaning;
  }

  if (mode === "VI-EN") {
    wordDiv.textContent = currentWord.meaning;
    meaningDiv.textContent = currentWord.word;
  }

  if (mode === "IMAGE-EN") {
    wordDiv.textContent = "What is this word?";
    meaningDiv.textContent = currentWord.word;
  }
}

// =======================================
// MODE
// =======================================
function setMode(newMode) {
  mode = newMode;
  showSectionTitle();
}

// =======================================
// CHECK ANSWER
// =======================================
function checkAnswer() {
  if (!currentWord) return;

  const userAnswer = answerInput.value.trim().toLowerCase();
  const correctAnswer =
    mode === "EN-VI"
      ? currentWord.meaning.toLowerCase()
      : currentWord.word.toLowerCase();

  total++;
  totalCount.textContent = total;

  if (userAnswer === correctAnswer) {
    correct++;
    correctSound.play();
    resultIcon.textContent = "✔";
    resultIcon.className = "correct";
    setTimeout(nextWord, 700);
  } else {
    wrongSound.play();
    resultIcon.textContent = "✖";
    resultIcon.className = "wrong";
    meaningDiv.textContent = "Correct answer: " + correctAnswer;
    meaningDiv.classList.remove("hidden");
  }

  correctCount.textContent = correct;
  updateAccuracy();
}

// =======================================
function updateAccuracy() {
  const percent = total === 0 ? 0 : Math.round((correct / total) * 100);
  accuracyText.textContent = percent + "%";
}

// EVENTS
gradeSelect.addEventListener("change", () => {
  loadGradeSheet(gradeSelect.value);
});

sectionSelect.addEventListener("change", () => {
  loadSection(sectionSelect.value);
});

nextBtn.addEventListener("click", nextWord);
checkBtn.addEventListener("click", checkAnswer);

answerInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") checkAnswer();
});

card.addEventListener("click", () => {
  if (!currentWord) return;
  meaningDiv.classList.remove("hidden");
});

// WORDLIST CHECKBOX
toggleWordList.addEventListener("change", () => {
  if (toggleWordList.checked) {
    wordListPanel.style.display = "block";
  } else {
    wordListPanel.style.display = "none";
  }
});

// CLOCK
function updateClock() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  hours = String(hours).padStart(2, "0");

  clockText.textContent = `${hours}:${minutes}:${seconds} ${ampm}`;
}

setInterval(updateClock, 1000);
updateClock();

// INIT
const grades = [
  "Grade6",
  "Grade7",
  "Grade8",
  "Grade9",
  "Grade10",
  "Grade11",
  "Grade12",
  "IELTS",
];

grades.forEach((g) => {
  const option = document.createElement("option");
  option.value = g;
  option.textContent = g;
  gradeSelect.appendChild(option);
});

loadGradeSheet(grades[0]);
