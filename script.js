const messageInput = document.getElementById("messageInput");
const charCount = document.getElementById("charCount");
const resultPanel = document.getElementById("resultPanel");

messageInput.addEventListener("input", () => {
  charCount.textContent = `${messageInput.value.length} characters`;
});

document.getElementById("clearBtn").addEventListener("click", () => {
  messageInput.value = "";
  charCount.textContent = "0 characters";
  resultPanel.innerHTML = `<div class="result-placeholder"><div class="scan-icon">⌕</div><h3>Your review will appear here</h3><p>Paste a message and select “Analyze message” to see possible warning signs and safer next steps.</p></div>`;
  messageInput.focus();
});

document.getElementById("sampleBtn").addEventListener("click", () => {
  messageInput.value = "URGENT! Your bank account will be blocked today. Verify your account immediately at http://example-login-security.test and share the OTP to claim your reward.";
  charCount.textContent = `${messageInput.value.length} characters`;
});

document.getElementById("analyzeBtn").addEventListener("click", analyzeMessage);

function analyzeMessage() {
  const text = messageInput.value.trim();
  if (!text) {
    resultPanel.innerHTML = `<div class="result-placeholder"><div class="scan-icon">!</div><h3>Enter a message first</h3><p>Paste the message you want to review. Do not include passwords, OTPs, or private documents.</p></div>`;
    return;
  }

  const checks = [
    { label: "Urgency or threat", regex: /\b(urgent|immediately|act now|final warning|blocked|suspended|expire today|within \d+ hours?)\b/i, detail: "The message creates pressure to act quickly or threatens an account restriction." },
    { label: "Sensitive information request", regex: /\b(otp|one[- ]time password|pin|password|cvv|recovery code|share the code)\b/i, detail: "It mentions credentials or verification codes. Never share these with another person." },
    { label: "Link or website included", regex: /(https?:\/\/|www\.|bit\.ly|tinyurl|t\.co\/)/i, detail: "A link is present. Check the exact domain independently before opening it." },
    { label: "Prize or unexpected reward", regex: /\b(winner|won|reward|prize|claim your|free gift|lottery|cashback)\b/i, detail: "Unexpected prizes or rewards are often used as bait in scams." },
    { label: "Money or payment pressure", regex: /\b(pay now|transfer money|payment required|send money|bank account|refund fee|gift card)\b/i, detail: "It asks about money or refers to financial account activity." },
    { label: "Impersonation language", regex: /\b(bank|government|police|courier|delivery|support team|account verification|kyc)\b/i, detail: "It refers to an organization or account process. Verify using its official channel." }
  ];

  const findings = checks.filter(item => item.regex.test(text));
  let level = "LOWER";
  let title = "Few common red flags found";
  let css = "low";
  let summary = "This basic scan found few of the warning patterns it checks for. That does not prove the message is safe.";

  const highSignals = findings.some(f => f.label === "Sensitive information request") &&
    (findings.some(f => f.label === "Link or website included") || findings.some(f => f.label === "Urgency or threat"));
  if (highSignals || findings.length >= 4) {
    level = "HIGHER";
    title = "Several warning signs found";
    css = "high";
    summary = "This message contains multiple patterns commonly associated with scams. Do not click links, share codes, or send money before independent verification.";
  } else if (findings.length >= 2) {
    level = "CAUTION";
    title = "Review carefully";
    css = "medium";
    summary = "The message contains some warning signs. Treat it cautiously and verify the sender through a separate, official channel.";
  } else if (findings.length === 1) {
    level = "CAUTION";
    title = "One warning sign found";
    css = "medium";
    summary = "One common warning pattern was found. This alone does not establish that the message is fraudulent.";
  }

  const findingHtml = findings.length
    ? findings.map(f => `<div class="finding"><span class="finding-icon">!</span><div><strong>${escapeHtml(f.label)}</strong><br>${escapeHtml(f.detail)}</div></div>`).join("")
    : `<div class="finding"><span class="finding-icon">i</span><div><strong>No listed patterns matched</strong><br>The checker may miss new or carefully written scams. Verify important requests independently.</div></div>`;

  resultPanel.innerHTML = `<div class="result-content"><span class="result-label">RULE-BASED REVIEW · ${findings.length} INDICATOR(S)</span><h3 class="risk-title ${css}">${title}</h3><p class="risk-summary">${summary}</p><div class="findings">${findingHtml}</div><div class="safe-next"><strong>Safer next step</strong><br>Don't reply, click, pay, or share sensitive information yet. Contact the organization through its official app, website, or known phone number.</div></div>`;
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}
