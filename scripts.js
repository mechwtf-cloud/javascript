window.addEventListener('DOMContentLoaded', () => {
  let balance = 1000;
  let currentBet = 0;
  let playerChoice;
  let gameActive = false;

  const balanceDiv = document.getElementById('balance');
  const currentBetDiv = document.getElementById('currentBet');
  const betStatusDiv = document.getElementById('betStatus');
  const betInputDiv = document.querySelector('.betting-box');
  const betInput = document.getElementById('betInput');
  const placeBetBtn = document.getElementById('placeBetBtn');
  const gameBox = document.getElementById('gameBox');
  const headsBtn = document.getElementById('headsBtn');
  const tailsBtn = document.getElementById('tailsBtn');
  const resetBtn = document.getElementById('resetBtn');
  const cashOutBtn = document.getElementById('cashOutBtn');
  const feedbackDiv = document.getElementById('feedback');
  const attemptsDiv = document.getElementById('attempts');

  // Update balance display
  function updateBalance() {
    balanceDiv.textContent = '$' + balance.toLocaleString();
    currentBetDiv.textContent = '$' + currentBet.toLocaleString();
  }

  // Place a bet
  function placeBet() {
    const betAmount = parseInt(betInput.value);

    // Validation
    if (isNaN(betAmount) || betAmount < 10) {
      betStatusDiv.textContent = '⚠️ Minimum bet is $10';
      betStatusDiv.className = '';
      return;
    }

    if (betAmount > balance) {
      betStatusDiv.textContent = '⚠️ You don\'t have enough money!';
      betStatusDiv.className = '';
      return;
    }

    // Deduct bet from balance
    currentBet = betAmount;
    updateBalance();
    betStatusDiv.textContent = `💰 Bet placed: $${betAmount}. Choose Heads or Tails!`;
    betStatusDiv.className = 'active';

    // Start the game
    gameActive = true;
    gameBox.style.display = 'block';
    betInputDiv.style.display = 'none';
    feedbackDiv.textContent = '';
    attemptsDiv.textContent = '';
  }

  // Choose heads
  function chooseHeads() {
    if (!gameActive) return;
    playerChoice = 'heads';
    flipCoin();
  }

  // Choose tails
  function chooseTails() {
    if (!gameActive) return;
    playerChoice = 'tails';
    flipCoin();
  }

  // Flip the coin
  function flipCoin() {
    const coinResult = Math.random() < 0.5 ? 'heads' : 'tails';
    const coinEmoji = coinResult === 'heads' ? '🪙' : '🪙';

    if (playerChoice === coinResult) {
      // WIN!
      const winnings = currentBet * 2;
      balance += winnings;
      feedbackDiv.textContent = `${coinEmoji} WINNER! It was ${coinResult}!\n\nYou won $${winnings}!`;
      feedbackDiv.className = 'win';
      attemptsDiv.textContent = `Balance: $${balance.toLocaleString()}`;
    } else {
      // LOSE
      balance -= currentBet;
      feedbackDiv.textContent = `${coinEmoji} Sorry! It was ${coinResult}.\n\nYou lost $${currentBet}.`;
      feedbackDiv.className = 'error';
      attemptsDiv.textContent = `Balance: $${balance.toLocaleString()}`;
    }

    gameActive = false;
    headsBtn.disabled = true;
    tailsBtn.disabled = true;
    resetBtn.style.display = 'inline-block';
    currentBetDiv.textContent = '$0';
    updateBalance();
  }

  // Play again
  function playAgain() {
    gameBox.style.display = 'none';
    betInputDiv.style.display = 'block';
    feedbackDiv.textContent = '';
    attemptsDiv.textContent = '';
    betStatusDiv.textContent = '';
    betInput.value = '';
    headsBtn.disabled = false;
    tailsBtn.disabled = false;
    resetBtn.style.display = 'none';
    betInput.focus();

    // Check if player is out of money
    if (balance <= 0) {
      betStatusDiv.textContent = '💰 GAME OVER! You\'re out of money!';
      betStatusDiv.className = '';
      betInputDiv.style.display = 'none';
      cashOutBtn.style.display = 'inline-block';
    } else {
      cashOutBtn.style.display = 'inline-block';
    }
  }

  // Cash out
  function cashOut() {
    betStatusDiv.textContent = `📦 You cashed out with $${balance.toLocaleString()}!`;
    betStatusDiv.className = '';
    betInputDiv.style.display = 'none';
    resetBtn.style.display = 'none';
    cashOutBtn.style.display = 'none';
    balanceDiv.textContent = '$' + balance.toLocaleString();
  }

  // Event listeners
  placeBetBtn.addEventListener('click', placeBet);
  betInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') placeBet();
  });
  headsBtn.addEventListener('click', chooseHeads);
  tailsBtn.addEventListener('click', chooseTails);
  resetBtn.addEventListener('click', playAgain);
  cashOutBtn.addEventListener('click', cashOut);

  // Initialize
  updateBalance();
});
