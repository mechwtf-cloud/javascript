window.addEventListener('DOMContentLoaded', () => {
  let balance = 1000;
  let currentBet = 0;
  let secretNumber;
  let gameActive = false;

  const balanceDiv = document.getElementById('balance');
  const currentBetDiv = document.getElementById('currentBet');
  const betStatusDiv = document.getElementById('betStatus');
  const betInputDiv = document.querySelector('.betting-box');
  const betInput = document.getElementById('betInput');
  const placeBetBtn = document.getElementById('placeBetBtn');
  const gameBox = document.getElementById('gameBox');
  const guessInput = document.getElementById('guessInput');
  const guessBtn = document.getElementById('guessBtn');
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
    betStatusDiv.textContent = `💰 Bet placed: $${betAmount}. Make your guess!`;
    betStatusDiv.className = 'active';

    // Start the game
    secretNumber = Math.floor(Math.random() * 10) + 1;
    gameActive = true;
    gameBox.style.display = 'block';
    betInputDiv.style.display = 'none';
    guessInput.value = '';
    guessInput.focus();
    feedbackDiv.textContent = '';
    attemptsDiv.textContent = '';
  }

  // Make a guess
  function makeGuess() {
    if (!gameActive) return;

    const guess = parseInt(guessInput.value);

    // Validation
    if (isNaN(guess) || guess < 1 || guess > 10) {
      feedbackDiv.textContent = '⚠️ Please enter a number between 1 and 10';
      feedbackDiv.className = 'error';
      return;
    }

    // Check the guess
    if (guess === secretNumber) {
      // WIN!
      const winnings = currentBet * 2;
      balance += winnings;
      feedbackDiv.textContent = `🎉 WINNER! The number was ${secretNumber}!\n\nYou won $${winnings}!`;
      feedbackDiv.className = 'win';
      attemptsDiv.textContent = `Balance: $${balance.toLocaleString()}`;
      gameActive = false;
      guessBtn.disabled = true;
      resetBtn.style.display = 'inline-block';
      currentBetDiv.textContent = '$0';
      updateBalance();
    } else if (guess > secretNumber) {
      feedbackDiv.textContent = `📉 Too high! The number is lower.`;
      feedbackDiv.className = 'high';
    } else {
      feedbackDiv.textContent = `📈 Too low! The number is higher.`;
      feedbackDiv.className = 'low';
    }

    guessInput.value = '';
  }

  // Play again
  function playAgain() {
    gameBox.style.display = 'none';
    betInputDiv.style.display = 'block';
    feedbackDiv.textContent = '';
    attemptsDiv.textContent = '';
    betStatusDiv.textContent = '';
    betInput.value = '';
    guessBtn.disabled = false;
    resetBtn.style.display = 'none';
    guessInput.focus();

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
  guessBtn.addEventListener('click', makeGuess);
  guessInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') makeGuess();
  });
  resetBtn.addEventListener('click', playAgain);
  cashOutBtn.addEventListener('click', cashOut);

  // Initialize
  updateBalance();
});
