const quizContainer = document.getElementById("quiz-container");
const submitBtn = document.getElementById("submit-btn");
const scoreArea = document.getElementById("score-area");
const retryBtn = document.getElementById("retry-btn");

let quizData = [];
let answers = {};

async function loadQuestions() {
  quizContainer.innerHTML = `<div class="text-muted">Loading questions...</div>`;
  try {
    const res = await fetch("/api/quiz/questions");
    const data = await res.json();
    quizData = data.questions || [];
    answers = {};
    renderQuestions();
  } catch (err) {
    quizContainer.innerHTML = `<div class="alert alert-danger">Could not load questions. Please try again later.</div>`;
    console.error(err);
  }
}

function renderQuestions() {
  if (!quizData.length) {
    quizContainer.innerHTML = `<div class="alert alert-warning">No questions available right now.</div>`;
    return;
  }

  quizContainer.innerHTML = "";
  quizData.forEach((q) => {
    const card = document.createElement("div");
    card.className = "quiz-question";
    card.dataset.questionId = q.id;

    const title = document.createElement("h6");
    title.className = "fw-semibold";
    title.textContent = q.question;
    card.appendChild(title);

    const optionsList = document.createElement("div");
    optionsList.className = "vstack gap-1";

    Object.entries(q.options).forEach(([key, value]) => {
      const optionId = `q${q.id}-${key}`;
      const wrapper = document.createElement("label");
      wrapper.className = "quiz-option form-check form-check-inline align-items-start";
      wrapper.htmlFor = optionId;
      wrapper.innerHTML = `
        <input class="form-check-input" type="radio" name="question-${q.id}" id="${optionId}" value="${key}">
        <span class="form-check-label">${key}. ${value}</span>
      `;
      wrapper.querySelector("input").addEventListener("change", () => {
        answers[q.id] = key;
        showFeedback(q.id);
      });
      optionsList.appendChild(wrapper);
    });

    const feedback = document.createElement("div");
    feedback.className = "feedback small mt-2";
    feedback.id = `feedback-${q.id}`;

    const expl = document.createElement("div");
    expl.className = "text-muted small d-none";
    expl.id = `explanation-${q.id}`;
    expl.textContent = q.explanation || "";

    card.appendChild(optionsList);
    card.appendChild(feedback);
    card.appendChild(expl);
    quizContainer.appendChild(card);
  });
  scoreArea.textContent = "";
  retryBtn.classList.add("d-none");
}

function showFeedback(questionId) {
  const question = quizData.find((q) => q.id === questionId);
  if (!question) return;
  const feedbackEl = document.getElementById(`feedback-${questionId}`);
  const explEl = document.getElementById(`explanation-${questionId}`);
  const userAnswer = answers[questionId];
  if (!userAnswer) {
    feedbackEl.textContent = "";
    return;
  }
  const correct = question.correct_option === userAnswer;
  feedbackEl.textContent = correct ? "Correct!" : `Not quite. Correct answer: ${question.correct_option}`;
  feedbackEl.className = `feedback small mt-2 ${correct ? "correct" : "incorrect"}`;
  explEl.classList.remove("d-none");
}

async function submitQuiz() {
  if (!quizData.length) return;
  submitBtn.disabled = true;
  scoreArea.textContent = "Scoring...";
  try {
    const res = await fetch("/api/quiz/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });
    const data = await res.json();
    scoreArea.textContent = `Score: ${data.score} / ${data.total}`;
    retryBtn.classList.remove("d-none");

    (data.results || []).forEach((result) => {
      const qid = result.question_id;
      if (result.is_correct) return;
      const feedbackEl = document.getElementById(`feedback-${qid}`);
      const explEl = document.getElementById(`explanation-${qid}`);
      if (feedbackEl) {
        feedbackEl.textContent = `Correct answer: ${result.correct_answer}`;
        feedbackEl.className = "feedback small mt-2 incorrect";
      }
      if (explEl && result.explanation) {
        explEl.textContent = result.explanation;
        explEl.classList.remove("d-none");
      }
    });
  } catch (err) {
    console.error(err);
    scoreArea.textContent = "Could not submit quiz. Try again.";
  } finally {
    submitBtn.disabled = false;
  }
}

submitBtn?.addEventListener("click", submitQuiz);
retryBtn?.addEventListener("click", loadQuestions);

loadQuestions();

