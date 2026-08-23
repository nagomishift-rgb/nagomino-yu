const state = {
  questions: [],
  index: 0,
  answers: [],
  idToken: null,
  correctCount: 0
};

const $ = id => document.getElementById(id);

async function init() {
  try {
    if (
      !window.APP_CONFIG?.LIFF_ID ||
      window.APP_CONFIG.LIFF_ID === "YOUR_LIFF_ID"
    ) {
      throw Error("LIFF_ID未設定");
    }

    await liff.init({
      liffId: window.APP_CONFIG.LIFF_ID
    });

    if (!liff.isLoggedIn()) {
      liff.login();
      return;
    }

    state.idToken = liff.getIDToken();

    if (!state.idToken) {
      throw Error("IDトークン取得失敗");
    }

    try {
      const profile = await liff.getProfile();

      $("loginStatus").textContent =
        `${profile.displayName} さん、準備OKです。`;

    } catch {
      $("loginStatus").textContent =
        "LINEログイン済みです。準備OKです。";
    }

    const res = await fetch("/api/quiz");

    if (!res.ok) {
      throw Error("問題取得失敗");
    }

    state.questions = await res.json();

    $("startBtn").disabled = false;

  } catch (error) {
    console.error(error);

    $("loginStatus").textContent =
      "初期化に失敗しました。LIFF設定を確認してください。";
  }
}

function startQuiz() {
  state.index = 0;
  state.answers = [];
  state.correctCount = 0;

  $("startScreen").classList.add("hidden");
  $("resultScreen").classList.add("hidden");
  $("quizScreen").classList.remove("hidden");

  render();
}

function render() {
  const q = state.questions[state.index];

  $("progress").textContent =
    `第${state.index + 1}問 / ${state.questions.length}`;

  $("score").textContent =
    `正解 ${state.correctCount}`;

  $("questionNo").textContent =
    `Q${state.index + 1}`;

  $("questionText").textContent =
    q.question;

  $("nextBtn").classList.add("hidden");

  const options = $("options");
  options.innerHTML = "";

  // 前の問題のヒントが残らないようにする
  const oldHint = document.getElementById("hintBox");
  if (oldHint) oldHint.remove();

  q.options.forEach((label, index) => {

    const button = document.createElement("button");

    button.className = "option";

    button.innerHTML =
      `<span class="optionLabel">${String.fromCharCode(65 + index)}</span>${escapeHtml(label)}`;

    button.onclick = () =>
      checkAnswer(index, button);

    options.appendChild(button);
  });
}

async function checkAnswer(selectedIndex, clickedButton) {

  const q = state.questions[state.index];

  // 判定中の連打を防止
  const buttons =
    [...document.querySelectorAll(".option")];

  buttons.forEach(button => button.disabled = true);

  try {

    const res = await fetch("/api/answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        questionId: q.id,
        selectedIndex
      })
    });

    if (!res.ok) {
      throw Error("回答判定エラー");
    }

    const data = await res.json();

    // 以前のヒントを削除
    const oldHint =
      document.getElementById("hintBox");

    if (oldHint) oldHint.remove();

    if (data.correct) {

      // 正解
      clickedButton.classList.remove("wrong");
      clickedButton.classList.add("correct");

      state.correctCount++;

      $("score").textContent =
        `正解 ${state.correctCount}`;

      state.answers.push({
        questionId: q.id,
        selectedIndex
      });

      showMessage(
        "正解！",
        "correct"
      );

      // 正解したのでボタンは押せないまま
      buttons.forEach(
        button => button.disabled = true
      );

      $("nextBtn").textContent =
        state.index === state.questions.length - 1
          ? "結果を見る"
          : "次の問題へ";

      $("nextBtn").classList.remove("hidden");

    } else {

      // 不正解
      clickedButton.classList.add("wrong");

      showMessage(
        `残念！もう一度挑戦してください。\nヒント：${data.hint}`,
        "hint"
      );

      // 不正解だった選択肢だけ押せない
      buttons.forEach(button => {

        if (button !== clickedButton) {
          button.disabled = false;
        }

      });
    }

  } catch (error) {

    console.error(error);

    buttons.forEach(
      button => button.disabled = false
    );

    showMessage(
      "回答判定に失敗しました。もう一度お試しください。",
      "hint"
    );
  }
}

function showMessage(message, type) {

  const old =
    document.getElementById("hintBox");

  if (old) old.remove();

  const box =
    document.createElement("div");

  box.id = "hintBox";
  box.className =
    type === "correct"
      ? "answerMessage correctMessage"
      : "answerMessage hintMessage";

  box.textContent = message;

  $("options").after(box);
}

async function finish() {

  $("quizScreen").classList.add("hidden");
  $("resultScreen").classList.remove("hidden");

  // 今回は正解するまで進めないため
  // 完走すれば基本的に10問正解
  showResult(state.correctCount);

  try {

    const res = await fetch("/api/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        idToken: state.idToken,
        answers: state.answers
      })
    });

    const data = await res.json();

    if (
      res.ok &&
      typeof data.score === "number"
    ) {
      showResult(data.score);
    }

  } catch (error) {
    console.warn(error);
  }
}

function showResult(score) {

  $("finalScore").textContent = score;

  $("resultMessage").textContent =
    score === 10
      ? "全問正解！なごみの湯マスターです！"
      : "クイズ終了！";
}

function escapeHtml(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

$("startBtn").onclick =
  startQuiz;

$("retryBtn").onclick =
  startQuiz;

$("nextBtn").onclick = () => {

  if (
    state.index ===
    state.questions.length - 1
  ) {

    finish();

  } else {

    state.index++;

    render();
  }
};

$("closeBtn").onclick = () => {

  if (
    window.liff?.isInClient?.()
  ) {
    liff.closeWindow();
  }
};

init();
