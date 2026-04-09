window.addEventListener('DOMContentLoaded', () => {
  let balance = 1000;
  let currentBet = 0;
  let gameActive = false;
  let spinCount = 0;

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

  function clearMatchedReels() {
    [reel1, reel2, reel3].forEach((reel) => reel.classList.remove('matched'));
  }

  function highlightMatchedReels(r1, r2, r3) {
    clearMatchedReels();
    if (r1 === r2 && r2 === r3) {
      [reel1, reel2, reel3].forEach((reel) => reel.classList.add('matched'));
      return;
    }
    if (r1 === r2) {
      reel1.classList.add('matched');
      reel2.classList.add('matched');
    }
    if (r2 === r3) {
      reel2.classList.add('matched');
      reel3.classList.add('matched');
    }
    if (r1 === r3) {
      reel1.classList.add('matched');
      reel3.classList.add('matched');
    }
  }

  function getMatchCount(r1, r2, r3) {
    if (r1 === r2 && r2 === r3) return 3;
    if (r1 === r2 || r2 === r3 || r1 === r3) return 2;
    return 0;
  }

  function getWinChance() {
    return spinCount < 3 ? 0.8 : 0.35;
  }

  function getRandomSymbol(exclude) {
    const options = exclude ? symbols.filter((symbol) => symbol !== exclude) : symbols;
    return options[Math.floor(Math.random() * options.length)];
  }

  function generateSpinResults() {
    const winRoll = Math.random() < getWinChance();
    if (!winRoll) {
      const first = getRandomSymbol();
      const second = getRandomSymbol(first);
      const third = getRandomSymbol(first === second ? null : first === third ? null : first);
      if (second === third || first === third || first === second) {
        return generateSpinResults();
      }
      return [first, second, third];
    }

    const triple = Math.random() < 0.15;
    const pairSymbol = getRandomSymbol();
    if (triple) {
      return [pairSymbol, pairSymbol, pairSymbol];
    }

    const oddSymbol = getRandomSymbol(pairSymbol);
    const pairPositions = [[0, 1, 2], [0, 2, 1], [1, 2, 0]][Math.floor(Math.random() * 3)];
    const results = [];
    results[pairPositions[0]] = pairSymbol;
    results[pairPositions[1]] = pairSymbol;
    results[pairPositions[2]] = oddSymbol;
    return results;
  }

  function showMatchPreview(r1, r2, r3) {
    const matches = getMatchCount(r1, r2, r3);
    if (matches === 3) {
      setFeedback('💥 You got 3 matches! Jackpot incoming...', 'info');
    } else if (matches === 2) {
      setFeedback('✨ You got 2 matches! Nice!', 'info');
    } else {
      setFeedback('😬 No matches this time. Let’s see how it lands...', 'info');
    }
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
    clearMatchedReels();

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

    clearMatchedReels();
    spinBtn.disabled = true;
    gameActive = false;
    setFeedback('⚓️ Spinning the reels...','info');
    reel1.classList.add('spinning');
    reel2.classList.add('spinning');
    reel3.classList.add('spinning');

    const spinInterval = 80;
    const stopTimes = [1800, 2200, 2600];
    const intervals = [null, null, null];
    const results = generateSpinResults();
    let reelsStopped = 0;

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
      reelsStopped += 1;
      if (reelsStopped === 3) {
        spinCount += 1;
        showMatchPreview(results[0], results[1], results[2]);
        setTimeout(() => checkWin(results[0], results[1], results[2]), 700);
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
