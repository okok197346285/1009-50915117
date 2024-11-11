const images = [
    '1.png', '2.png', '3.png', '4.png',
    '5.png', '6.png', '7.png', '8.png'
];

let timerInterval; // 计时器变量
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchedCards = 0;
let startTime;

let timerElement = document.getElementById('timer');
let gameBoard = document.getElementById('game-board');
let startButton = document.getElementById('start-button');
let flipAllCardsButton = document.getElementById('flip-all-cards-button');
let flipBackCardsButton = document.getElementById('flip-back-cards-button');
let levelSelector = document.getElementById('level-selector');

// Levels with dynamic configurations
const levels = {
    small: {
        size: 2,
        images: ['1.png', '2.png'] // 2 pairs of images for 2x2 grid
    },
    medium: {
        size: 4,
        images: [
            '10.png', '11.png', '12.png', '13.png',
            '14.png', '15.png', '16.png', '17.png'
        ]
    },
    large: {
        size: 6,
        images: ['1.png', '2.png', '3.png', '4.png','5.png', '6.png', '7.png', '8.png'   ,'18.png', '19.png', '20.png', '21.png', '22.png', '23.png', '24.png', '25.png', '26.png', '27.png'] // 18 pairs for 6x6 grid
    }
};

// Shuffle function
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Initialize the game based on level configuration
function initGame(size, imageSet) {
    const cardsArray = generateCards(size * size / 2, imageSet); // 確保生成正確數量的卡片
    const shuffledCards = shuffle(cardsArray);
    gameBoard.className = 'game-board'; // Reset classes
    gameBoard.classList.add(size === 2 ? 'small' : size === 4 ? 'medium' : 'large'); // Apply the appropriate size class
    gameBoard.innerHTML = ''; 
    shuffledCards.forEach((image) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.image = image;

        const img = document.createElement('img');
        img.src = image;
        card.appendChild(img);

        card.addEventListener('click', flipCard); 
        gameBoard.appendChild(card);
    });

    flipAllCards(); // 在初始化後翻開所有卡片
}



function startCountdown() {
    let timeLeft = 10; // 設定倒數時間
    const countdownDisplay = document.getElementById('countdown-seconds'); // 獲取顯示秒數的元素
    countdownDisplay.textContent = timeLeft; // 初始化顯示

    timerElement.style.display = 'block'; // 確保顯示計時器

    const countdown = setInterval(() => {
        timeLeft--;
        countdownDisplay.textContent = timeLeft; // 更新顯示的秒數

        if (timeLeft === 0) {
            clearInterval(countdown);
            timerElement.style.display = 'none'; 
            unflipAllCards(); // 倒數結束後翻回所有卡片
            lockBoard = false; 
        }
    }, 1000);
}


// Generate pairs of cards based on image set
function generateCards(totalPairs, imageSet) {
    const selectedImages = imageSet.slice(0, totalPairs);
    return [...selectedImages, ...selectedImages];
}

// Flip all cards with animation
function flipAllCards() {
    const cards = document.querySelectorAll('.card');
    let delay = 0;
    
    cards.forEach((card) => {
        setTimeout(() => {
            card.classList.add('flipped');
        }, delay);
        delay += 50; // 控制每張卡片翻轉的時間間隔
    });
}

// Unflip all cards with animation
function unflipAllCards() {
    const cards = document.querySelectorAll('.card');
    let delay = 0;

    cards.forEach((card) => {
        setTimeout(() => {
            card.classList.remove('flipped');
        }, delay);
        delay += 50; // 控制每張卡片翻轉回去的時間間隔
    });
}

// Flip a single card
function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;

    this.classList.add('flipped');

    if (!firstCard) {
        firstCard = this;
        return;
    }

    secondCard = this;
    checkForMatch();
}

function checkForMatch() {
    if (firstCard.dataset.image === secondCard.dataset.image) {
        disableCards();
        matchedCards += 2; // 每次配對成功兩張卡片

        const totalCards = levels[levelSelector.value].size ** 2; // 當前模式的總卡片數

        // 當所有卡片都配對成功時顯示遊戲結束畫面
        if (matchedCards === totalCards) {
            setTimeout(showEndGameMessage, 500); // 延遲500ms後顯示結束畫面
        }
    } else {
        unflipCards();
    }
}

// Disable the matched cards
function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    resetBoard();
}

// Unflip unmatched cards
function unflipCards() {
    lockBoard = true;

    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        resetBoard();
    }, 1000);
}

// Reset the board state
function resetBoard() {
    [firstCard, secondCard, lockBoard] = [null, null, false];
}

function startGame() {
    const selectedLevel = levelSelector.value; // 獲取選擇的關卡
    startButton.style.display = 'none';
    document.getElementById('control-buttons').style.display = 'flex';
    gameBoard.style.visibility = 'visible';
    lockBoard = true; // 鎖定翻牌狀態
    matchedCards = 0;
    startTime = Date.now(); // 记录游戏开始时间

    // 初始化遊戲
    initGame(levels[selectedLevel].size, levels[selectedLevel].images);
    
    // 让所有卡片翻开，并且开始倒计时
    flipAllCards();
    startCountdown(); // 开始倒计时

    // 启动计时器，每秒更新遊玩时间
    timerInterval = setInterval(updatePlayTime, 1000); // 每秒调用 updatePlayTime 函数

    setTimeout(() => {
        unflipAllCards(); // 10秒后翻回所有卡片
        lockBoard = false; // 解锁翻牌
    }, 5000);
}

function updatePlayTime() {
    const currentTime = Math.floor((Date.now() - startTime) / 1000); // 计算当前遊玩时间
    document.getElementById('play-time').textContent = `遊玩時間: ${currentTime} 秒`; // 更新显示的遊玩时间
}

// 顯示遊戲結束畫面的函數
function showEndGameMessage() {
    clearInterval(timerInterval); // 停止計時
    const endTime = Date.now();
    const playTime = Math.round((endTime - startTime) / 1000); // 計算遊玩時間

    // 創建遊戲結束提示
    const endMessage = document.createElement('div');
    endMessage.classList.add('end-message');
    endMessage.innerHTML = `
        <h2>遊戲結束！</h2>
        <p>遊玩時間: ${playTime} 秒</p>
        <button id="play-again-button">再玩一次</button>
    `;

    gameBoard.appendChild(endMessage);

    // 使用淡入效果顯示結束提示
    setTimeout(() => {
        endMessage.classList.add('fade-in');
    }, 10);

    // 為"再玩一次"按鈕添加點擊事件
    document.getElementById('play-again-button').addEventListener('click', () => {
        endMessage.remove();
        resetGame();
    });
}
const level_Selector = document.getElementById('level-selector');

// Event listener for level changes
level_Selector.addEventListener('change', () => {
    if (startButton.style.display === 'none') {
        resetGame(); // 如果游戏正在进行，则重置游戏
    }
});

function resetGameBoard() {
    gameBoard.innerHTML = ''; // 清空游戏板
    firstCard = null;
    secondCard = null;
    lockBoard = false;
}
function resetGame() {
    matchedCards = 0;
    resetGameBoard();
    const selectedLevel = levelSelector.value;
    initGame(levels[selectedLevel].size, levels[selectedLevel].images);
    startTime = Date.now(); // 重新設置開始時間
    clearInterval(timerInterval); // 清除之前的計時器，防止重複
    timerInterval = setInterval(updatePlayTime, 1000); // 重新啟動計時器，每秒更新一次遊玩時間

    // 重新開始倒數計時
    startCountdown();
}


function setBackImage(level) {
    let cards = document.querySelectorAll('.card');
    let backImage = level === 'easy' ? 'back.png' : 'okok.png'; // 設置不同關卡的反面圖片

    cards.forEach(card => {
        card.style.backgroundImage = `url(${backImage})`;
    });
}

// Event listeners for buttons
startButton.addEventListener('click', () => {
    const selectedLevel = levelSelector.value; // 获取选择的关卡
    startButton.style.display = 'none'; // 隐藏开始游戏按钮
    document.getElementById('control-buttons').style.display = 'flex'; // 显示控制按钮
    gameBoard.style.visibility = 'visible'; // 显示游戏板
    lockBoard = true; // 锁定翻牌状态
    matchedCards = 0; // 重置配对计数
    startTime = Date.now(); // 记录游戏开始时间

    // 初始化游戏
    initGame(levels[selectedLevel].size, levels[selectedLevel].images);
    
    // 设置反面图片
    setBackImage(selectedLevel);

    // 先翻开所有卡片，然后开始倒数计时
    flipAllCards();
    startCountdown();

    // 10秒后翻回所有卡片
    setTimeout(() => {
        unflipAllCards(); // 10秒后翻回所有卡片
        lockBoard = false; // 解锁翻牌
    }, 5000);
});



function startCountdown() {
    let timeLeft = 5; // 設定倒數時間
    const countdownDisplay = document.getElementById('countdown-seconds'); // 獲取顯示秒數的元素
    countdownDisplay.textContent = timeLeft; // 初始化顯示

    timerElement.style.display = 'block'; // 確保顯示計時器

    const countdown = setInterval(() => {
        timeLeft--;
        countdownDisplay.textContent = timeLeft; // 更新顯示的秒數

        if (timeLeft === 0) {
            clearInterval(countdown);
            timerElement.style.display = 'none'; 
            unflipAllCards(); // 倒數結束後翻回所有卡片
            lockBoard = false; 
        }
    }, 1000);
}
let showMatchedImages = true; // 初始化顯示狀態

// 獲取切換按鈕
const toggleMatchedImagesButton = document.getElementById('toggle-matched-images-button');

// 設置按鈕的事件處理器
toggleMatchedImagesButton.addEventListener('click', () => {
    showMatchedImages = !showMatchedImages; // 切換狀態

    const matchedCards = document.querySelectorAll('.card.matched'); // 獲取所有匹配的卡片

    matchedCards.forEach(card => {
        card.style.visibility = showMatchedImages ? 'hidden' : 'visible'; // 根據狀態隱藏或顯示
    });

    // 更新按鈕文本
    toggleMatchedImagesButton.textContent = showMatchedImages ? '隱藏配對成功的圖片' : '顯示配對成功的圖片';
});


// Get the audio elements
const successSound = document.getElementById('success-sound');
const failSound = document.getElementById('fail-sound');

function checkForMatch() {
    if (firstCard.dataset.image === secondCard.dataset.image) {
        disableCards();
        matchedCards += 2; // 每次配对成功两张卡片
        successSound.currentTime = 0; // 重置音频播放时间
        successSound.play(); // 播放成功音效

        const totalCards = levels[levelSelector.value].size ** 2; // 当前模式的总卡片数
        if (matchedCards === totalCards) {
            setTimeout(showEndGameMessage, 500); // 所有卡片配对成功，显示结束画面
        }
    } else {
        failSound.currentTime = 0; // 重置音频播放时间
        failSound.play(); // 播放失败音效
        unflipCards();
    }
}




// Flip all and unflip all buttons
flipAllCardsButton.addEventListener('click', flipAllCards);
flipBackCardsButton.addEventListener('click', unflipAllCards);
