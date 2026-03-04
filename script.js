// =============================================
//  5秒选择 v2
//  新增：每日限制 / 历史记录 / 更好看的分享图
// =============================================

// ----- 俏皮话库 -----
const comments = [
  "你其实早就知道答案了。",
  "你的直觉比你想得更靠谱。",
  "别后悔，这就是命运。",
  "5秒的判断，往往比5小时的纠结更准。",
  "你的潜意识一直都知道的。",
  "去吧，宇宙支持你。",
  "这是科学算出来的。（不是）",
  "如果你不满意，说明你其实想要另一个。",
  "相信我，我算过了。",
  "纠结的人生不值得过，选这个！",
  "命运的齿轮开始转动。",
  "选了就别回头，很好看的。",
];

// ----- 每日限制设置 -----
const DAILY_LIMIT = 3;

// ----- 全局状态 -----
let countdownTimer = null;
let finalChoice = "";
let optionA = "";
let optionB = "";
let currentComment = "";


// =============================================
//  每日限制系统
//  用 localStorage 存今天日期 + 已用次数
// =============================================

// 获取今天的日期字符串，格式：2024-01-15
function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

// 获取今天还剩几次
function getRemainingCount() {
  const today = getTodayKey();
  const saved = JSON.parse(localStorage.getItem("usage") || "{}");

  // 如果不是今天的数据，重置
  if (saved.date !== today) {
    return DAILY_LIMIT;
  }
  return Math.max(0, DAILY_LIMIT - (saved.count || 0));
}

// 消耗一次次数
function consumeOneUse() {
  const today = getTodayKey();
  const saved = JSON.parse(localStorage.getItem("usage") || "{}");

  let count = (saved.date === today) ? (saved.count || 0) : 0;
  count++;
  localStorage.setItem("usage", JSON.stringify({ date: today, count }));
}

// 更新页面上的次数显示
function updateUsageDisplay() {
  const remaining = getRemainingCount();
  const badge = document.getElementById("usage-badge");
  const countEl = document.getElementById("usage-count");
  const btn = document.getElementById("btn-start");
  const limitMsg = document.getElementById("limit-message");

  countEl.textContent = remaining;

  if (remaining === 0) {
    badge.classList.add("empty");
    btn.disabled = true;
    limitMsg.style.display = "block";
  } else {
    badge.classList.remove("empty");
    btn.disabled = false;
    limitMsg.style.display = "none";
  }
}


// =============================================
//  历史记录系统
//  每次出结果，保存到 localStorage
// =============================================

// 保存一条记录
function saveHistory(chosen, a, b, comment) {
  const records = JSON.parse(localStorage.getItem("history") || "[]");

  // 格式化时间
  const now = new Date();
  const dateStr = `${now.getMonth() + 1}月${now.getDate()}日 ${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}`;

  records.unshift({ chosen, a, b, comment, date: dateStr }); // 最新的放最前

  // 最多保留 30 条
  if (records.length > 30) records.pop();

  localStorage.setItem("history", JSON.stringify(records));
}

// 渲染历史记录页面
function renderHistory() {
  const records = JSON.parse(localStorage.getItem("history") || "[]");
  const list = document.getElementById("history-list");

  if (records.length === 0) {
    list.innerHTML = `
      <div class="history-empty">
        还没有记录<br/>
        <span style="font-size:2rem">🌀</span><br/>
        去做几个选择吧
      </div>`;
    return;
  }

  list.innerHTML = records.map((r, i) => `
    <div class="history-item" style="animation-delay: ${i * 0.05}s">
      <div class="history-item-left">
        <div class="history-chosen">✓ ${r.chosen}</div>
        <div class="history-versus">${r.a} vs ${r.b}</div>
      </div>
      <div class="history-date">${r.date}</div>
    </div>
  `).join("");
}

// 清空历史
function clearHistory() {
  if (confirm("确定要清空所有历史记录吗？")) {
    localStorage.removeItem("history");
    renderHistory();
  }
}

// 跳转历史页并渲染
function goHistory() {
  renderHistory();
  showScreen("screen-history");
}


// =============================================
//  页面切换
// =============================================
function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(screenId).classList.add("active");
}


// =============================================
//  开始：用户点「让我选！」
// =============================================
function startCountdown() {
  if (getRemainingCount() <= 0) return;

  optionA = document.getElementById("input-a").value.trim();
  optionB = document.getElementById("input-b").value.trim();

  if (!optionA || !optionB) {
    if (!optionA) shakeCard("card-a");
    if (!optionB) shakeCard("card-b");
    return;
  }

  // 消耗一次次数
  consumeOneUse();

  document.getElementById("remind-a").textContent = optionA;
  document.getElementById("remind-b").textContent = optionB;

  showScreen("screen-countdown");
  runCountdown(5);
}


// =============================================
//  抖动卡片
// =============================================
function shakeCard(cardId) {
  const card = document.getElementById(cardId);
  let count = 0;
  const interval = setInterval(() => {
    card.style.transform = count % 2 === 0 ? "translateX(8px)" : "translateX(-8px)";
    count++;
    if (count > 5) { clearInterval(interval); card.style.transform = ""; }
  }, 55);
}


// =============================================
//  倒计时
// =============================================
function runCountdown(startNumber) {
  let current = startNumber;
  const numberEl = document.getElementById("countdown-number");
  const barEl = document.getElementById("countdown-bar");

  numberEl.textContent = current;
  numberEl.classList.remove("urgent");
  barEl.classList.remove("urgent");
  barEl.style.width = "100%";

  countdownTimer = setInterval(() => {
    current--;

    if (current <= 0) {
      clearInterval(countdownTimer);
      showResult();
      return;
    }

    numberEl.textContent = current;
    numberEl.classList.remove("pulse");
    void numberEl.offsetWidth; // 强制重绘，让动画重新触发
    numberEl.classList.add("pulse");

    barEl.style.width = (current / startNumber * 100) + "%";

    if (current <= 2) {
      numberEl.classList.add("urgent");
      barEl.classList.add("urgent");
    }
  }, 1000);
}


// =============================================
//  显示结果
// =============================================
function showResult() {
  // 随机选一个
  const choices = [optionA, optionB];
  finalChoice = choices[Math.floor(Math.random() * 2)];
  const loser = finalChoice === optionA ? optionB : optionA;

  // 随机俏皮话
  currentComment = comments[Math.floor(Math.random() * comments.length)];

  // 填入结果
  document.getElementById("result-choice").textContent = finalChoice;
  document.getElementById("result-comment").textContent = currentComment;
  document.getElementById("result-winner").textContent = finalChoice;
  document.getElementById("result-loser").textContent = loser;

  // 剩余次数提示
  const remaining = getRemainingCount();
  const hintEl = document.getElementById("remaining-hint");
  if (remaining === 0) {
    hintEl.textContent = "今天的次数用完了，明天再来";
    hintEl.style.color = "#554444";
  } else {
    hintEl.textContent = `今天还剩 ${remaining} 次`;
    hintEl.style.color = "";
  }

  // 保存到历史
  saveHistory(finalChoice, optionA, optionB, currentComment);

  showScreen("screen-result");
}


// =============================================
//  重置
// =============================================
function resetApp() {
  document.getElementById("input-a").value = "";
  document.getElementById("input-b").value = "";
  finalChoice = ""; optionA = ""; optionB = ""; currentComment = "";
  updateUsageDisplay();
  showScreen("screen-input");
}


// =============================================
//  生成分享图片（v2，更精致）
// =============================================
function shareResult() {
  const canvas = document.getElementById("share-canvas");
  const ctx = canvas.getContext("2d");
  const W = 900, H = 900;

  // ----- 背景 -----
  ctx.fillStyle = "#0d0d0d";
  ctx.fillRect(0, 0, W, H);

  // ----- 背景装饰：大号虚化文字 -----
  ctx.save();
  ctx.globalAlpha = 0.03;
  ctx.fillStyle = "#f5c518";
  ctx.font = `bold 320px 'Arial'`;
  ctx.textAlign = "center";
  ctx.fillText("5", W / 2, H / 2 + 120);
  ctx.restore();

  // ----- 外框 -----
  ctx.strokeStyle = "#252525";
  ctx.lineWidth = 1;
  ctx.strokeRect(30, 30, W - 60, H - 60);

  // ----- 顶部黄色细线 -----
  ctx.fillStyle = "#f5c518";
  ctx.fillRect(30, 30, W - 60, 3);

  // ----- Logo -----
  ctx.fillStyle = "#f5c518";
  ctx.font = "bold 26px 'Arial'";
  ctx.textAlign = "left";
  ctx.fillText("⚡ 5秒选择", 60, 90);

  // ----- 右上角日期 -----
  const now = new Date();
  const dateStr = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,"0")}.${String(now.getDate()).padStart(2,"0")}`;
  ctx.fillStyle = "#333";
  ctx.font = "20px 'Arial'";
  ctx.textAlign = "right";
  ctx.fillText(dateStr, W - 60, 90);

  // ----- 分割线 -----
  ctx.strokeStyle = "#1e1e1e";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, 115); ctx.lineTo(W - 60, 115);
  ctx.stroke();

  // ----- "命运之选" 标签 -----
  ctx.fillStyle = "#444";
  ctx.font = "22px 'Arial'";
  ctx.textAlign = "center";
  ctx.fillText("· 命运之选 ·", W / 2, 185);

  // ----- 主结果文字（自动缩小处理长文字）-----
  let fontSize = 130;
  ctx.font = `bold ${fontSize}px 'Arial'`;
  while (ctx.measureText(finalChoice).width > W - 120 && fontSize > 50) {
    fontSize -= 5;
    ctx.font = `bold ${fontSize}px 'Arial'`;
  }
  ctx.fillStyle = "#f5c518";
  ctx.textAlign = "center";
  // 轻微发光效果
  ctx.shadowColor = "rgba(245, 197, 24, 0.4)";
  ctx.shadowBlur = 40;
  ctx.fillText(finalChoice, W / 2, 350);
  ctx.shadowBlur = 0;

  // ----- 对阵区域 -----
  const loser = finalChoice === optionA ? optionB : optionA;

  // 输家（划线）
  ctx.fillStyle = "#2a2a2a";
  roundRect(ctx, 60, 400, 340, 70, 12);
  ctx.fill();
  ctx.fillStyle = "#444";
  ctx.font = "26px 'Arial'";
  ctx.textAlign = "center";
  ctx.fillText(truncate(loser, 10), 60 + 170, 442);
  // 划线效果
  ctx.strokeStyle = "#444";
  ctx.lineWidth = 2;
  const loserTextW = Math.min(ctx.measureText(truncate(loser, 10)).width, 280);
  ctx.beginPath();
  ctx.moveTo(60 + 170 - loserTextW/2, 442);
  ctx.lineTo(60 + 170 + loserTextW/2, 442);
  ctx.stroke();

  // VS
  ctx.fillStyle = "#333";
  ctx.font = "bold 20px 'Arial'";
  ctx.textAlign = "center";
  ctx.fillText("VS", W / 2, 445);

  // 赢家（高亮框）
  ctx.strokeStyle = "#f5c518";
  ctx.lineWidth = 1.5;
  roundRect(ctx, W - 60 - 340, 400, 340, 70, 12);
  ctx.stroke();
  // 赢家框背景微亮
  ctx.fillStyle = "rgba(245, 197, 24, 0.06)";
  roundRect(ctx, W - 60 - 340, 400, 340, 70, 12);
  ctx.fill();

  ctx.fillStyle = "#f5c518";
  ctx.font = "bold 26px 'Arial'";
  ctx.textAlign = "center";
  ctx.fillText(truncate(finalChoice, 10), W - 60 - 170, 442);

  // ----- 分割线 -----
  ctx.strokeStyle = "#1e1e1e";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, 510); ctx.lineTo(W - 60, 510);
  ctx.stroke();

  // ----- 俏皮话 -----
  ctx.fillStyle = "#555";
  ctx.font = `italic 26px 'Arial'`;
  ctx.textAlign = "center";
  // 长俏皮话换行处理
  wrapText(ctx, `"${currentComment}"`, W / 2, 575, W - 160, 38);

  // ----- 底部品牌 -----
  ctx.fillStyle = "#222";
  ctx.font = "20px 'Arial'";
  ctx.textAlign = "center";
  ctx.fillText("别想了，让我来  ·  5sec-choice.vercel.app", W / 2, H - 55);

  // ----- 底部黄线 -----
  ctx.fillStyle = "#f5c518";
  ctx.fillRect(30, H - 33, W - 60, 3);

  // ----- 下载 -----
  const link = document.createElement("a");
  link.download = `5秒选择_${finalChoice}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

// 画圆角矩形的辅助函数
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// 文字超出时自动换行
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split("");
  let line = "";
  let currentY = y;
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i];
    if (ctx.measureText(testLine).width > maxWidth && i > 0) {
      ctx.fillText(line, x, currentY);
      line = words[i];
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
}

// 截断过长文字
function truncate(str, maxLen) {
  return str.length > maxLen ? str.slice(0, maxLen) + "…" : str;
}


// =============================================
//  回车键快捷支持
// =============================================
document.getElementById("input-a").addEventListener("keydown", e => {
  if (e.key === "Enter") document.getElementById("input-b").focus();
});
document.getElementById("input-b").addEventListener("keydown", e => {
  if (e.key === "Enter") startCountdown();
});


// =============================================
//  初始化：页面加载时更新次数显示
// =============================================
updateUsageDisplay();
