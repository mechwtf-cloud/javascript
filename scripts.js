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
    gameActive = false;
    reel1.classList.add('spinning');
    reel2.classList.add('spinning');
    reel3.classList.add('spinning');

    const spinInterval = 80;
    const stopTimes = [1800, 2200, 2600];
    const intervals = [null, null, null];
    const results = [
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)]
    ];

    function stopReel(index) {
      clearInterval(intervals[index]);
      const finalSymbol = results[index];
      if (index === 0) {
        reel1.textContent = finalSymbol;
        reel1.classList.remove('spinning');
      }
      if (index === 1) {
        reel2.textContent = finalSymbol;
        reel2.classList.remove('spinning');
      }
      if (index === 2) {
        reel3.textContent = finalSymbol;
        reel3.classList.remove('spinning');
      }
      if (results[0] && results[1] && results[2]) {
        checkWin(results[0], results[1], results[2]);
      }
    }

    [reel1, reel2, reel3].forEach((reel, index) => {
      intervals[index] = setInterval(() => {
        reel.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      }, spinInterval);
      setTimeout(() => stopReel(index), stopTimes[index]);
    });
  }

  function checkWin(r1, r2, r3) {
    let winnings = 0;
    let message = '';

    const triple = r1 === r2 && r2 === r3;
    const pair = r1 === r2 || r2 === r3 || r1 === r3;

    if (triple) {
      winnings = currentBet * payouts[r1];
      message = `🎉 JACKPOT! Three ${r1} win $${winnings}!`;
      betStatusDiv.textContent = `🏆 You won big!`;
      setFeedback(message, 'win');
    } else if (pair) {
      winnings = currentBet * 2;
      message = `👍 Two matches! You win $${winnings}!`;
      betStatusDiv.textContent = `🎊 Nice win!`;
      setFeedback(message, 'win');
    } else {
      message = `😞 No matches. Better luck next time!`;
      betStatusDiv.textContent = `❌ You lost the bet.`;
      setFeedback(message, 'lose');
    }

    if (winnings > 0) {
      balance += winnings;
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
  }

  function cashOut() {
    setFeedback(`📦 You cashed out with $${balance.toLocaleString()} gold. Well played!`, 'info');
    betStatusDiv.textContent = '';
    betStatusDiv.className = 'bet-status';
    betInputDiv.style.display = 'none';
    gameBox.style.display = 'none';
    resetBtn.style.display = 'none';
    cashOutBtn.style.display = 'none';
  }

  placeBetBtn.addEventListener('click', placeBet);
  betInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') placeBet();
  });

  spinBtn.addEventListener('click', () => {
    gameActive = true;
    spinReels();
  });

  resetBtn.addEventListener('click', playAgain);
  cashOutBtn.addEventListener('click', cashOut);

  updateBalance();
});

