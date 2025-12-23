const tipText = document.getElementById("tip-text");
const refreshBtn = document.getElementById("refresh-tip");

async function loadTip(forceRandom = false) {
  tipText.textContent = "Fetching tip...";
  try {
    const res = await fetch("/api/tip");
    const data = await res.json();
    let tip = data.tip || "Keep learning and stay alert online.";
    // If forcing random, shuffle the message a bit by adding a note.
    if (forceRandom) {
      tip = `${tip} (remember: small habits add up)`;
    }
    tipText.textContent = tip;
  } catch (err) {
    console.error(err);
    tipText.textContent = "Unable to load a tip right now. Please try again later.";
  }
}

refreshBtn?.addEventListener("click", () => loadTip(true));
loadTip();

