window.addEventListener('DOMContentLoaded', () => {
  let secretNumber;
  let attempts = 0;
  let gameOver = false;

  const guessInput = document.getElementById('guessInput');
  const guessBtn = document.getElementById('guessBtn');
  const resetBtn = document.getElementById('resetBtn');
  const feedbackDiv = document.getElementById('feedback');
  const attemptsDiv = document.getElementById('attempts');

  // Initialize the game
  function startNewGame() {
    secretNumber = Math.floor(Math.random() * 100) + 1;
    attempts = 0;
    gameOver = false;
    feedbackDiv.textContent = '';
    feedbackDiv.className = 'feedback';
    attemptsDiv.textContent = 'Attempts: 0';
    guessInput.value = '';
    guessInput.focus();
    guessBtn.disabled = false;
  }

  // Handle a guess
  function makeGuess() {
    if (gameOver) return;

    const guess = parseInt(guessInput.value);

    // Validation
    if (isNaN(guess) || guess < 1 || guess > 100) {
      feedbackDiv.textContent = '⚠️ Please enter a number between 1 and 100';
      feedbackDiv.className = 'feedback';
      return;
    }

    attempts++;
    attemptsDiv.textContent = `Attempts: ${attempts}`;

    // Check the guess
    if (guess === secretNumber) {
      feedbackDiv.textContent = `🎉 Correct! You guessed it in ${attempts} attempt${attempts > 1 ? 's' : ''}!`;
      feedbackDiv.className = 'feedback correct';
      gameOver = true;
      guessBtn.disabled = true;
    } else if (guess > secretNumber) {
      feedbackDiv.textContent = '📉 Too high! Try a smaller number.';
      feedbackDiv.className = 'feedback high';
    } else {
      feedbackDiv.textContent = '📈 Too low! Try a larger number.';
      feedbackDiv.className = 'feedback low';
    }

    guessInput.value = '';
    guessInput.focus();
  }

  // Event listeners
  guessBtn.addEventListener('click', makeGuess);
  guessInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') makeGuess();
  });
  resetBtn.addEventListener('click', startNewGame);

  // Start the first game
  startNewGame();
});
