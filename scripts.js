window.addEventListener('DOMContentLoaded', () => {
  let balance = 1000;
  let currentBet = 0;
  let treasureChest = null;
  let gameActive = false;

  const balanceDiv = document.getElementById('balance');
  const currentBetDiv = document.getElementById('currentBet');
  const betStatusDiv = document.getElementById('betStatus');
  const betInputDiv = document.querySelector('.betting-box');
  const betInput = document.getElementById('betInput');
  const placeBetBtn = document.getElementById('placeBetBtn');
  const gameBox = document.getElementById('gameBox');
  const chestButtons = Array.from(document.querySelectorAll('.chest-btn'));
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

  function enableChests(enabled) {
    chestButtons.forEach((button) => {
      button.disabled = !enabled;
    });
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

    treasureChest = Math.floor(Math.random() * 4) + 1;
    gameActive = true;
    betStatusDiv.textContent = `🗺️ Bet placed: $${betAmount}. Choose a chest!`;
    betStatusDiv.className = 'bet-status active';
    gameBox.style.display = 'block';
    betInputDiv.style.display = 'none';
    setFeedback('', 'info');
    enableChests(true);
    resetBtn.style.display = 'none';
    cashOutBtn.style.display = 'none';
  }

  function chooseChest(selected) {
    if (!gameActive) return;

    enableChests(false);
    gameActive = false;

    if (selected === treasureChest) {
      const winnings = currentBet * 3;
      balance += winnings;
      setFeedback(`🎉 Treasure found! Chest ${selected} held the treasure. You win $${winnings}!`, 'win');
      betStatusDiv.textContent = `🏆 Victory! You found the treasure.`;
      betStatusDiv.className = 'bet-status active';
    } else {
      setFeedback(`💔 Chest ${selected} was empty. The treasure was in chest ${treasureChest}.`, 'lose');
      betStatusDiv.textContent = `❌ You lost the bet.`;
      betStatusDiv.className = 'bet-status';
    }

    currentBet = 0;
    updateBalance();
    resetBtn.style.display = 'inline-block';

    if (balance <= 0) {
      resetBtn.textContent = 'Game Over';
      cashOutBtn.style.display = 'inline-block';
    } else {
      resetBtn.textContent = 'Try Again';
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

  chestButtons.forEach((button) => {
    button.addEventListener('click', () => {
      chooseChest(parseInt(button.dataset.chest, 10));
    });
  });

  resetBtn.addEventListener('click', playAgain);
  cashOutBtn.addEventListener('click', cashOut);

  updateBalance();
});
