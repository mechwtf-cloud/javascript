window.addEventListener('DOMContentLoaded', () => {
  let balance = 1000;
  let currentBet = 0;
  let gameActive = false;

  const symbols = ['🍒', '🍋', '🍊', '⭐', '💎', '🏴‍☠️'];
  const payouts = {
    '🍒': 2,
    '🍋': 3,
    '🍊': 4,
    '⭐': 5,
    '💎': 10,
    '🏴‍☠️': 20
  };

  const balanceDiv = document.getElementById('balance');
  const currentBetDiv = document.getElementById('currentBet');
  const betStatusDiv = document.getElementById('betStatus');
  const betInputDiv = document.querySelector('.betting-box');
  const betInput = document.getElementById('betInput');
  const placeBetBtn = document.getElementById('placeBetBtn');
  const gameBox = document.getElementById('gameBox');
  const spinBtn = document.getElementById('spinBtn');
  const reel1 = document.getElementById('reel1');
  const reel2 = document.getElementById('reel2');
  const reel3 = document.getElementById('reel3');
  const resetBtn = document.getElementById('resetBtn');
  const cashOutBtn = document.getElementById('cashOutBtn');
  const feedbackDiv = document.getElementById('feedback');

  function updateBalance() {
    balanceDiv.textContent = '$' + balance.toLocaleString();
    currentBetDiv.textContent = '$' + currentBet.toLocaleString();
  }

  function setFeedback(text, status) {
    feedbackDiv.textContent = text;
    feedbackDiv.className = 'feedback ' + status;
  }

  function placeBet() {
    const betAmount = parseInt(betInput.value, 10);

    if (isNaN(betAmount) || betAmount < 10) {
      betStatusDiv.textContent = '⚠️ Minimum bet is $10';
      betStatusDiv.className = 'bet-status';
      return;
    }

    if (betAmount > balance) {
      betStatusDiv.textContent = '⚠️ You do not have enough gold!';
      betStatusDiv.className = 'bet-status';
      return;
    }

    currentBet = betAmount;
    balance -= betAmount;
    updateBalance();

    betStatusDiv.textContent = `🤑 Bet placed: $${betAmount}. Spin to win!`;
    betStatusDiv.className = 'bet-status active';
    gameBox.style.display = 'block';
    betInputDiv.style.display = 'none';
    setFeedback('', 'info');
    spinBtn.disabled = false;
    resetBtn.style.display = 'none';
    cashOutBtn.style.display = 'none';
  }

  function spinReels() {
    if (!gameActive) return;

    spinBtn.disabled = true;
    reel1.classList.add('spinning');
    reel2.classList.add('spinning');
    reel3.classList.add('spinning');

    setTimeout(() => {
      const result1 = symbols[Math.floor(Math.random() * symbols.length)];
      const result2 = symbols[Math.floor(Math.random() * symbols.length)];
      const result3 = symbols[Math.floor(Math.random() * symbols.length)];

      reel1.textContent = result1;
      reel2.textContent = result2;
      reel3.textContent = result3;

      reel1.classList.remove('spinning');
      reel2.classList.remove('spinning');
      reel3.classList.remove('spinning');

      checkWin(result1, result2, result3);
    }, 1000);
  }

  function checkWin(r1, r2, r3) {
    let winnings = 0;

    if (r1 === r2 && r2 === r3) {
      winnings = currentBet * payouts[r1];
      balance += winnings;
      setFeedback(`🎉 JACKPOT! Three ${r1} win $${winnings}!`, 'win');
      betStatusDiv.textContent = `🏆 You won big!`;
    } else if (r1 === r2 || r2 === r3 || r1 === r3) {
      winnings = currentBet * 1.5;
      balance += winnings;
      setFeedback(`👍 Two matches! You win $${winnings}!`, 'win');
      betStatusDiv.textContent = `🎊 Nice win!`;
    } else {
      setFeedback(`😞 No matches. Better luck next time!`, 'lose');
      betStatusDiv.textContent = `❌ You lost the bet.`;
    }

    currentBet = 0;
    updateBalance();
    resetBtn.style.display = 'inline-block';

    if (balance <= 0) {
      resetBtn.textContent = 'Game Over';
      cashOutBtn.style.display = 'inline-block';
    } else {
      resetBtn.textContent = 'Play Again';
      cashOutBtn.style.display = 'inline-block';
    }
  }

  function playAgain() {
    if (balance <= 0) {
      setFeedback('💀 You are out of gold. Cash out to end the adventure.', 'error');
      betInputDiv.style.display = 'none';
      resetBtn.style.display = 'none';
      return;
    }

    gameBox.style.display = 'none';
    betInputDiv.style.display = 'block';
    betStatusDiv.textContent = '';
    betStatusDiv.className = 'bet-status';
    setFeedback('', 'info');
    betInput.value = '';
    resetBtn.style.display = 'none';
    cashOutBtn.style.display = 'inline-block';
    currentBet = 0;
    updateBalance();
window.addEventListener('DOMContentLoaded', () => {
  let balance = 1000;
  let currentBet = 0;
  let gameActive = false;

  const symbols = ['🍒', '🍋', '🍊', '⭐', '💎', '🏴‍☠️'];
  const payouts = {
    '🍒': 2,
    '🍋': 3,
    '🍊': 4,
    '⭐': 5,
    '💎': 10,
    '🏴‍☠️': 20
  };

  const balanceDiv = document.getElementById('balance');
  const currentBetDiv = document.getElementById('currentBet');
  const betStatusDiv = document.getElementById('betStatus');
  const betInputDiv = document.querySelector('.betting-box');
  const betInput = document.getElementById('betInput');
  const placeBetBtn = document.getElementById('placeBetBtn');
  const gameBox = document.getElementById('gameBox');
  const spinBtn = document.getElementById('spinBtn');
  const reel1 = document.getElementById('reel1');
  const reel2 = document.getElementById('reel2');
  const reel3 = document.getElementById('reel3');
  const resetBtn = document.getElementById('resetBtn');
  const cashOutBtn = document.getElementById('cashOutBtn');
  const feedbackDiv = document.getElementById('feedback');

  function updateBalance() {
    balanceDiv.textContent = '$' + balance.toLocaleString();
    currentBetDiv.textContent = '$' + currentBet.toLocaleString();
  }

  function setFeedback(text, status) {
    feedbackDiv.textContent = text;
    feedbackDiv.className = 'feedback ' + status;
  }

  function placeBet() {
    const betAmount = parseInt(betInput.value, 10);

    if (isNaN(betAmount) || betAmount < 10) {
      betStatusDiv.textContent = '⚠️ Minimum bet is $10';
      betStatusDiv.className = 'bet-status';
      return;
    }

    if (betAmount > balance) {
      betStatusDiv.textContent = '⚠️ You do not have enough gold!';
      betStatusDiv.className = 'bet-status';
      return;
    }

    currentBet = betAmount;
    balance -= betAmount;
    updateBalance();

    betStatusDiv.textContent = `🤑 Bet placed: $${betAmount}. Spin to win!`;
    betStatusDiv.className = 'bet-status active';
    gameBox.style.display = 'block';
    betInputDiv.style.display = 'none';
    setFeedback('', 'info');
    spinBtn.disabled = false;
    resetBtn.style.display = 'none';
    cashOutBtn.style.display = 'none';
  }

  function spinReels() {
    if (!gameActive) return;

    spinBtn.disabled = true;
    reel1.classList.add('spinning');
    reel2.classList.add('spinning');
    reel3.classList.add('spinning');

    setTimeout(() => {
      const result1 = symbols[Math.floor(Math.random() * symbols.length)];
      const result2 = symbols[Math.floor(Math.random() * symbols.length)];
      const result3 = symbols[Math.floor(Math.random() * symbols.length)];

      reel1.textContent = result1;
      reel2.textContent = result2;
      reel3.textContent = result3;

      reel1.classList.remove('spinning');
      reel2.classList.remove('spinning');
      reel3.classList.remove('spinning');

      checkWin(result1, result2, result3);
    }, 1000);
  }

  function checkWin(r1, r2, r3) {
    let winnings = 0;

    if (r1 === r2 && r2 === r3) {
      winnings = currentBet * payouts[r1];
      balance += winnings;
      setFeedback(`🎉 JACKPOT! Three ${r1} win $${winnings}!`, 'win');
      betStatusDiv.textContent = `🏆 You won big!`;
    } else if (r1 === r2 || r2 === r3 || r1 === r3) {
      winnings = currentBet * 1.5;
      balance += winnings;
      setFeedback(`👍 Two matches! You win $${winnings}!`, 'win');
      betStatusDiv.textContent = `🎊 Nice win!`;
    } else {
      setFeedback(`😞 No matches. Better luck next time!`, 'lose');
      betStatusDiv.textContent = `❌ You lost the bet.`;
    }

    currentBet = 0;
    updateBalance();
    resetBtn.style.display = 'inline-block';

    if (balance <= 0) {
      resetBtn.textContent = 'Game Over';
      cashOutBtn.style.display = 'inline-block';
    } else {
      resetBtn.textContent = 'Play Again';
      cashOutBtn.style.display = 'inline-block';
    }
  }

  function playAgain() {
    if (balance <= 0) {
      setFeedback('💀 You are out of gold. Cash out to end the adventure.', 'error');
      betInputDiv.style.display = 'none';
      resetBtn.style.display = 'none';
      return;
    }

    gameBox.style.display = 'none';
    betInputDiv.style.display = 'block';
    betStatusDiv.textContent = '';
    betStatusDiv.className = 'bet-status';
    setFeedback('', 'info');
    betInput.value = '';
    resetBtn.style.display = 'none';
    cashOutBtn.style.display = 'inline-block';
    currentBet = 0;
    updateBalance();
