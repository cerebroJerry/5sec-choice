// =============================================
//  5秒选择 — 逻辑文件
//  流程：输入 → 倒计时 → 出结果 → 可分享
// =============================================

// ----- 结果俏皮话库 -----
// 每次出结果，随机抽一条配在下面
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
];

// ----- 当前倒计时的计时器（方便取消） -----
let countdownTimer = null;

// ----- 记录最终选择（给分享功能用） -----
let finalChoice = "";
let optionA = "";
let optionB = "";


// =============================================
//  工具函数：切换页面
//  传入要显示的页面ID，其他的自动隐藏
// =============================================
function showScreen(screenId) {
  // 先把所有页面隐藏
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  // 再显示目标页面
  document.getElementById(screenId).classList.add("active");
}


// =============================================
//  第一步：用户点「让我选！」按钮触发这个函数
// =============================================
function startCountdown() {
  // 读取用户输入，去掉首尾空格
  optionA = document.getElementById("input-a").value.trim();
  optionB = document.getElementById("input-b").value.trim();

  // 检查：两个选项都要填
  if (!optionA || !optionB) {
    // 抖动提示（简单的视觉反馈）
    if (!optionA) shakeCard("card-a");
    if (!optionB) shakeCard("card-b");
    return; // 不继续
  }

  // 把两个选项显示在倒计时页面
  document.getElementById("remind-a").textContent = optionA;
  document.getElementById("remind-b").textContent = optionB;

  // 切换到倒计时页面
  showScreen("screen-countdown");

  // 开始倒数
  runCountdown(5);
}


// =============================================
//  抖动卡片（输入为空时的提示）
// =============================================
function shakeCard(cardId) {
  const card = document.getElementById(cardId);
  card.style.animation = "none";
  // 加一个临时的CSS动画
  card.style.transition = "transform 0.1s";
  let count = 0;
  const shakeInterval = setInterval(() => {
    card.style.transform = count % 2 === 0 ? "translateX(8px)" : "translateX(-8px)";
    count++;
    if (count > 5) {
      clearInterval(shakeInterval);
      card.style.transform = "translateX(0)";
    }
  }, 60);
}


// =============================================
//  倒计时核心逻辑
//  从 startNumber 开始往下数
// =============================================
function runCountdown(startNumber) {
  let current = startNumber;

  // 先把数字设为初始值
  const numberEl = document.getElementById("countdown-number");
  const barEl = document.getElementById("countdown-bar");

  numberEl.textContent = current;
  numberEl.classList.remove("urgent");
  barEl.classList.remove("urgent");
  barEl.style.width = "100%";

  // 每隔1秒执行一次
  countdownTimer = setInterval(() => {
    current--;

    if (current <= 0) {
      // 倒计时结束，停止计时器
      clearInterval(countdownTimer);
      // 显示结果
      showResult();
      return;
    }

    // 更新数字
    numberEl.textContent = current;

    // 数字变化时的动画：先移除class再加回来（触发重新播放）
    numberEl.classList.remove("pulse");
    void numberEl.offsetWidth; // 强制浏览器重新渲染（这行很重要）
    numberEl.classList.add("pulse");

    // 进度条缩小（按比例）
    const percentage = (current / startNumber) * 100;
    barEl.style.width = percentage + "%";

    // 最后2秒变红，增加紧张感
    if (current <= 2) {
      numberEl.classList.add("urgent");
      barEl.classList.add("urgent");
    }

  }, 1000);
}


// =============================================
//  展示结果
// =============================================
function showResult() {
  // 随机选A或B（50/50）
  const choices = [optionA, optionB];
  finalChoice = choices[Math.floor(Math.random() * 2)];

  // 随机抽一条俏皮话
  const comment = comments[Math.floor(Math.random() * comments.length)];

  // 填入结果页面
  document.getElementById("result-choice").textContent = finalChoice;
  document.getElementById("result-comment").textContent = comment;

  // 切换到结果页面
  showScreen("screen-result");
}


// =============================================
//  重置：点「再来一次」
// =============================================
function resetApp() {
  // 清空输入框
  document.getElementById("input-a").value = "";
  document.getElementById("input-b").value = "";

  // 重置变量
  finalChoice = "";
  optionA = "";
  optionB = "";

  // 回到输入页面
  showScreen("screen-input");
}


// =============================================
//  生成分享图片
//  用HTML5 Canvas画一张图，然后下载
// =============================================
function shareResult() {
  const canvas = document.getElementById("share-canvas");
  const ctx = canvas.getContext("2d");

  const W = 800;
  const H = 800;

  // --- 背景 ---
  ctx.fillStyle = "#0d0d0d";
  ctx.fillRect(0, 0, W, H);

  // --- 装饰边框 ---
  ctx.strokeStyle = "#f5c518";
  ctx.lineWidth = 3;
  ctx.strokeRect(20, 20, W - 40, H - 40);

  // --- 顶部小标签 ---
  ctx.fillStyle = "#f5c518";
  ctx.font = "bold 22px 'Noto Sans SC', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("5秒选择", W / 2, 90);

  // --- 分割线 ---
  ctx.strokeStyle = "#2a2a2a";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, 110);
  ctx.lineTo(W - 60, 110);
  ctx.stroke();

  // --- "你应该选" ---
  ctx.fillStyle = "#888888";
  ctx.font = "20px 'Noto Sans SC', sans-serif";
  ctx.fillText("你应该选", W / 2, 200);

  // --- 大号结果文字 ---
  ctx.fillStyle = "#f5c518";
  ctx.font = "bold 96px 'Noto Sans SC', sans-serif";

  // 处理长文字自动缩小
  let fontSize = 96;
  ctx.font = `bold ${fontSize}px 'Noto Sans SC', sans-serif`;
  while (ctx.measureText(finalChoice).width > W - 100 && fontSize > 40) {
    fontSize -= 4;
    ctx.font = `bold ${fontSize}px 'Noto Sans SC', sans-serif`;
  }
  ctx.fillText(finalChoice, W / 2, 340);

  // --- 对阵显示 ---
  ctx.fillStyle = "#333333";
  ctx.font = "22px 'Noto Sans SC', sans-serif";
  ctx.fillText(`${optionA}   vs   ${optionB}`, W / 2, 430);

  // --- 分割线 ---
  ctx.strokeStyle = "#2a2a2a";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, 470);
  ctx.lineTo(W - 60, 470);
  ctx.stroke();

  // --- 底部俏皮话 ---
  const comment = document.getElementById("result-comment").textContent;
  ctx.fillStyle = "#666666";
  ctx.font = "italic 24px 'Noto Sans SC', sans-serif";
  ctx.fillText(comment, W / 2, 560);

  // --- 品牌小字 ---
  ctx.fillStyle = "#3a3a3a";
  ctx.font = "18px 'Noto Sans SC', sans-serif";
  ctx.fillText("5秒选择 · 别想了，让我来", W / 2, H - 50);

  // --- 触发下载 ---
  const link = document.createElement("a");
  link.download = "我的5秒选择.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}


// =============================================
//  回车键快捷支持
//  在输入框按回车，自动跳到下一个输入框或开始
// =============================================
document.getElementById("input-a").addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    document.getElementById("input-b").focus();
  }
});

document.getElementById("input-b").addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    startCountdown();
  }
});
