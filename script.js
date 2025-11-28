
// Element style da responsividade do site
const styleElement = document.createElement('style');
styleElement.textContent = `
/* Layout para telas pequenas (mobile) */
@media (max-width: 768px) {
  .player-top, .bot-left, .bot-right {
    min-height: 180px;
  }

   .bot-left, .bot-right {
    min-height: 200px;
    max-height: 280px;
    height: 250px;
    margin: -2% 0;
  }

  .bot-left .bot-hand, .bot-right .bot-hand {
    max-height: 150px;
    height: 140px;
    min-height: 120px;
    grid-template-columns: repeat(3, 1fr);
  }

  .mesa {
    grid-template-areas:
      "top top"
      "left right"
      "center center"
      "bottom bottom";
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto auto auto;
    gap: 1px;
    padding: 1px;
  }

    .player-bottom {
    margin-top: -30px;
  }
    .bot-top .bot-hand {
    min-height: 150px; 
  }
  
  .bot-container {
    min-height: 40px;
  }
  
  .bot-top {
    margin-top: 0;
  }

    .player-top {
    min-width: 95%;
    width: 95%;
    max-width: 95%;
  }
  
 
  .player-order-item {
    flex: 1 0 calc(50% - 10px);
    margin: 2px;
  }

  .player-order-name {
    max-width: 60px;
  }

  .centro-superior {
    flex-direction: column;
    gap: 15px;
    margin-bottom: 5px;
  }
  
  .centro {
    margin-top: -20px;
    padding: 5px;
    gap: 8px;
  }
  
  .discard-area, .deck-container {
    margin: 0;
  }

  .draw-button {
    order: 2;
  }

    .player-bottom .hand {
        max-width: calc(7 * (60px + 10px)); 
        gap: 10px;
        padding: 15px;
        padding-bottom: 40px;
    }

   .discard-pile .card,
  .deck {
    width: 60px;
    height: 90px;
  }
  
  .card-back {
    width: 100%;
    height: 100%;
  }
  
  .status {
    margin-top: 10px;
    font-size: 0.6rem;
    padding: 6px 10px;
  }
  
  button {
    font-size: 0.5rem;
    padding: 8px 12px;
    margin-top: 10px;
  }
}

/* Layout para telas muito pequenas (celulares pequenos) */
@media (max-width: 490px) {
  :root {
    --card-width: clamp(35px, 12vw, 60px);
  }

  .player-name {
    font-size: 0.6rem;
    padding: 3px 4px;
    text-shadow: none !important;
  }
  
   .player-top {
    min-width: 98%; 
    width: 98%;
    max-width: 98%;
  }

  .bot-hand {
    max-height: 45%;
  }

  .bot-top {
    padding: 5px;
    margin-bottom: 35px;

  }

   .bot-left, .bot-right {
    min-height: 180px;
    max-height: 250px;
    height: 110%;
  }
  
  .bot-left .bot-hand, .bot-right .bot-hand {
    max-height: 120px;
    height: 110px;
    min-height: 100px;
    grid-template-columns: repeat(2, 1fr); 
  }
  

  .speech-bubble {
    max-width: 120px;
    font-size: 0.6rem;
    padding: 4px 6px;
  }
  .status{
    width: 70%;
    font-size: 8px;
  }
  .card{
    width: 50px;
    height: 80px;
  }

  .deck{
    display: none !important;
  }

  .centro-superior {
    gap: 10px;
  }
  
  .discard-pile .card,
  .deck {
    width: 55px;
    height: 85px;
  }
  
  .centro {
    margin-top: 08%;
    margin-bottom: 10%;
    gap: 5px;
  }
  
  button {
    font-size: 0.5rem;
    padding: 10px 15px;
    margin-top: 10px;
  }
  
  .card .value {
    font-size: 1.2rem;
  }

  .bottom-left-decoration{
    width: 60px;
    height: 60px;
    margin-bottom: 15px;
  }

  .player-order {
    backdrop-filter: none !important;
  }

   .player-bottom .hand {
        max-width: calc(7 * (50px + 8px)); 
        gap: 8px;
        padding: 10px;
        padding-bottom: 35px;
    }

}

/* Layout para tablets em modo retrato */
@media (min-width: 581px) and (max-width: 768px) and (orientation: portrait) {
  :root {
    --card-width: clamp(45px, 10vw, 70px);
  }

  .mesa {
    grid-template-rows: auto auto 1fr auto;
  }

  .player-bottom {
    margin-bottom: 30px;
  }
  :root {
    --card-width: clamp(35px, 12vw, 60px);
  }

  .player-name {
    font-size: 0.6rem;
    padding: 3px 4px;
  }
    .player-top, .bot-left, .bot-right {
    min-height: 150px;
  }

  .bot-hand {
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: 12px;
  }

  .speech-bubble {
    max-width: 120px;
    font-size: 0.6rem;
    padding: 4px 6px;
  }
  .status{
    width: 50%;
    margin-top: 30px;
  }
  button{
    margin: 5px;
  }
  .card{
    width: 50px;
    height: 80px;
  }

  .card .value{
    font-size: 20px;

  }
  .bottom-left-decoration{
    width: 60px;
    height: 60px;
    margin-bottom: 15px;
  }

  .deck{
     width: 50px;
    height: 80px;
  }

 .player-order-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: white;
  font-family: 'Press Start 2P', cursive;
  font-size: clamp(0.5rem, 2vw, 0.7rem);
  opacity: 0.7;
  transition: all 0.3s ease;
  padding: 1px 4px;
  border-radius: 15px;
}

.player-order-item {
  display: flex;
  align-items: center;
  gap: 5px;
  
  font-size: clamp(0.4rem, 1.7vw, 0.5rem);

  padding: 3px 6px;
}

.player-order-avatar {
  width: 20px;
  height: 20px;
  
  font-size: 0.6rem;
  
}


.player-order-arrow {
  font-size: 0.6rem;
}

}

/* Layout para tablets em modo paisagem */
@media (min-width: 769px) and (max-width: 1024px) and (orientation: landscape) {
  .mesa {
    grid-template-rows: auto auto 1fr;
  }

  .player-bottom {
    margin-bottom: 30px;
  }

    .bot-left, .bot-right {
    min-height: 280px;
    max-height: 350px;
    height: 300px;
  }
  
  .bot-left .bot-hand, .bot-right .bot-hand {
    max-height: 200px;
    height: 190px;
  }
}

/* Layout para desktops */
@media (min-width: 1025px) {
  .mesa {
    height: 100vh;
    max-height: 100vh;
    grid-template-rows: 1fr 2fr 1fr;
  }

  .player-top .bot-avatar {
    width: 65px;
    height: 65px;
  }

  .bot-avatar {
    width: 60px;
    height: 60px;
  }

  .player-name {
    font-size: 0.9rem;
  }

 

  .player-bottom .hand {
    padding-bottom: 20px;
  }
}

/* Layout para telas muito grandes */
@media (min-width: 1600px) {
  :root {
    --card-width: clamp(60px, 5vw, 80px);
  }

  .player-top .bot-avatar {
    width: 90px;
    height: 90px;
  }

  .bot-avatar {
    width: 90px;
    height: 90px;
  }

   .player-bottom .hand {
        max-width: calc(7 * (85px + 20px)); 
    }
}

@media (max-height: 500px) {
  .mesa {
    grid-template-rows: auto auto auto;
  }

  .player-bottom {
    margin-bottom: 10px;
  }

  .player-bottom .hand {
    max-height: 100px;
  }
}

@media (max-width: 350px) {
  :root {
    --card-width: 30px;
  }

  .player-name {
    font-size: 0.6rem;
  }

  .status {
    font-size: 0.5rem;
  }

  button {
    font-size: 0.5rem;
    padding: 5px 10px;
  }
} @media (max-width: 768px) and (orientation: landscape) {
  .mesa {
    grid-template-areas:
      "left top right"
      "left center right"
      "bottom bottom bottom";
    grid-template-columns: auto 1fr auto;
    grid-template-rows: auto 1fr auto;
  }

  .player-bottom {
    margin-bottom: 10px;
  }

  .player-bottom .hand {
    max-height: 80px;
  }

  .lateral-esquerda, .lateral-direita {
    padding: 2px;
  }

  .bot-avatar {
    width: 30px;
    height: 30px;
  }

  .player-name {
    font-size: 0.6rem;
  }

    .centro-superior {
    flex-direction: row;
    gap: 10px;
  }
  
  .centro {
    margin-top: -15px;
    padding: 3px;
  }
  
  .discard-pile .card,
  .deck {
    width: 45px;
    height: 67px;
  }
  
  .status {
    font-size: 0.5rem;
    margin-top: 3px;
  }
}
`;

document.head.appendChild(styleElement);
  
  
  const DELAYS = {
      botThink: 2200,    // Tempo que o bot "pensa" antes de jogar
      cardPlay: 1000,     // Tempo de animação ao jogar carta
      messageShow: 6000, // Tempo que mensagens ficam visíveis
      nextTurn: 2200     // Tempo entre turnos
    };
    const BOT_NAMES = ["LUCY", "PEDRO", "HANNA"]; // Lucy (top), Pedro (left), Hanna (right)
    const colors = ["vermelho", "verde", "azul", "amarelo"];
    const specialCards = ["skip", "reverse", "+2"];
    const wildCards = ["wild", "wild+4"];

    let waitingForColorChoice = false;
    let playerHand = [];
    let bots = [[], [], []];
    let discardPile = [];
    let currentColor = null;
    let currentPlayer = 0; // 0 = player, 1-3 = bots
    let direction = 1;
    let gameStarted = false;

    const playerHandDiv = document.getElementById("player-hand");
    const botHands = [
      document.getElementById("bot1-hand"),
      document.getElementById("bot2-hand"),
      document.getElementById("bot3-hand"),
    ];
    const botSpeeches = [
      document.getElementById("bot1-speech"),
      document.getElementById("bot2-speech"),
      document.getElementById("bot3-speech"),
    ];
    const discardDiv = document.getElementById("discard-pile");
    const statusDiv = document.getElementById("status");
    const deckDiv = document.getElementById("deck");
    const drawButton = document.getElementById("draw-button");
    const victoryScreen = document.getElementById("victory-screen");
    const victoryMessage = document.getElementById("victory-message");
    const playAgainBtn = document.getElementById("play-again-btn");
    const quitBtn = document.getElementById("quit-btn");

const backgroundMusic = new Audio('./sounds/Bit Bit Loop.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.2;

let soundOn = false; // começa desligado

const soundToggleBtn = document.getElementById('sound-toggle-btn');

function updateSoundButton() {
  if (soundOn) {
    soundToggleBtn.textContent = '🔊 Ligado';
    soundToggleBtn.setAttribute('aria-pressed', 'true');
    soundToggleBtn.setAttribute('aria-label', 'Desativar som');
  } else {
    soundToggleBtn.textContent = '🔇 Desligado';
    soundToggleBtn.setAttribute('aria-pressed', 'false');
    soundToggleBtn.setAttribute('aria-label', 'Ativar som');
  }
}

function toggleSound() {
  soundOn = !soundOn;

  if (soundOn) {
    if (backgroundMusic.paused) {
      backgroundMusic.play().catch(e => console.log("Falha ao tocar música:", e));
    }
  } else {
    if (!backgroundMusic.paused) {
      backgroundMusic.pause();
      backgroundMusic.currentTime = 0;
    }
  }

  updateSoundButton();
}

soundToggleBtn.addEventListener('click', toggleSound);

updateSoundButton();


// Função playSound respeitando o som ligado/desligado
function playSound(type) {
  if (!soundOn) return;

  if (type === 'card') {
    const sounds = [
      './sounds/cardsound32562-37691.mp3'
    ];
    const sound = new Audio(sounds[Math.floor(Math.random() * sounds.length)]);
    sound.volume = 0.4;
    sound.play().catch(e => console.log("Audio play prevented:", e));

  } else if (type === 'win') {
    const sound = new Audio('./sounds/403007__inspectorj__ui-confirmation-alert-a2.wav');
    sound.volume = 0.5;
    sound.play().catch(e => console.log("Audio play prevented:", e));

  } else if (type === 'shuffle') {
    const sound = new Audio('./sounds/Bit Bit Loop.mp3');
    sound.volume = 0.5;
    sound.play().catch(e => console.log("Audio play prevented:", e));
  }
}

// Toca música após primeira interação do usuário (click) e só se som estiver ligado
document.addEventListener('click', () => {
  if (soundOn && backgroundMusic.paused) {
    backgroundMusic.play().catch(e => console.log("Music play prevented:", e));
  }
}, { once: true });


    function createDeck() {
      let deck = [];
      colors.forEach(color => {
        deck.push({ color, value: "0" });
        for (let i = 1; i <= 9; i++) {
          deck.push({ color, value: i.toString() });
          deck.push({ color, value: i.toString() });
        }
        specialCards.forEach(sc => {
          deck.push({ color, value: sc });
          deck.push({ color, value: sc });
        });
      });
      wildCards.forEach(wc => {
        for (let i = 0; i < 4; i++) deck.push({ color: "preto", value: wc });
      });
      return shuffle(deck);
    }

    function shuffle(array) {
      playSound('shuffle');
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

    let deck = createDeck();

    function drawCard(hand, count = 1) {
      const drawnCards = [];
      while (count-- && deck.length) {
        const card = deck.pop();
        hand.push(card);
        drawnCards.push(card);
      }
      return drawnCards;
    }
function renderHand(hand, container, isBot = false) {
    container.innerHTML = "";
    hand.forEach((card, index) => {
        // Container principal da carta
        const cardContainer = document.createElement("div");
        cardContainer.classList.add("card-container");
        
        // Adiciona classe apenas se for carta do jogador
        if (!isBot) {
            cardContainer.classList.add("player-card-container");
        }

        // Div da carta (elemento visual)
        const cardDiv = document.createElement("div");
        cardDiv.classList.add("card", card.color);
        
        // Configurações específicas para cartas do jogador
        if (!isBot) {
            cardDiv.classList.add("player-card");
            
            // Efeito de partículas ao passar o mouse
            cardContainer.addEventListener('mouseenter', (e) => {
                // Cria partículas de brilho
                for (let i = 0; i < 8; i++) {
                    const particle = document.createElement("div");
                    particle.style.position = "absolute";
                    particle.style.width = "6px";
                    particle.style.height = "6px";
                    particle.style.background = "radial-gradient(circle, white 30%, transparent 70%)";
                    particle.style.borderRadius = "50%";
                    particle.style.pointerEvents = "none";
                    particle.style.opacity = "0";
                    particle.style.filter = "blur(1px)";
                    particle.style.animation = `elegant-particle ${Math.random() * 1 + 1}s ease-out forwards`;
                    particle.style.setProperty('--x', Math.random() * 2 - 1);
                    particle.style.setProperty('--y', Math.random() * 2 - 1);
                    
                    cardDiv.appendChild(particle);
                    
                    // Remove a partícula após a animação
                    setTimeout(() => {
                        particle.remove();
                    }, 2000);
                }
            });
        }

        // Valor/número da carta
        const valueDiv = document.createElement("div");
        valueDiv.classList.add("value");
        
        // Define o símbolo/texto com base no tipo de carta
        switch(card.value) {
            case "skip": valueDiv.innerHTML = "⊘"; break;
            case "reverse": valueDiv.innerHTML = "⇄"; break;
            case "+2": valueDiv.innerHTML = "+2"; break;
            case "wild": valueDiv.innerHTML = "★"; break;
            case "wild+4": valueDiv.innerHTML = "+4"; break;
            default: valueDiv.textContent = card.value;
        }
        
        cardDiv.appendChild(valueDiv);
        
        // Configura interação apenas para cartas do jogador
        if (!isBot) {
            cardContainer.onclick = () => playCard(hand, index);
            cardContainer.style.cursor = "pointer";
        } else {
            // Desativa interações para cartas dos bots
            cardContainer.style.cursor = "default";
            cardDiv.style.pointerEvents = "none";
        }
        
        // Monta a estrutura
        cardContainer.appendChild(cardDiv);
        container.appendChild(cardContainer);
    });
}
   function showBotMessage(botIndex, message) {
  const speech = botSpeeches[botIndex];
  // Limita o tamanho do texto
  if (message.length > 30) {
    message = message.substring(0, 27) + '...';
  }
  speech.textContent = message;
  speech.classList.add("show");
  
  setTimeout(() => {
    speech.classList.remove("show");
  }, 2000);
}

function createConfetti() {
  // Desativa temporariamente o scroll
  document.documentElement.style.overflowY = 'hidden';
  
  const colors = [
    '#ff2a6d', // Vermelho neon
    '#05d9e8', // Azul neon
    '#00ff9d', // Verde neon
    '#f9f002', // Amarelo neon
    '#d300c5'  // Roxo neon
  ];

  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement('div');
    confetti.classList.add('confetti');
    confetti.style.position = 'fixed'; // Mudado para fixed
    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.top = '-10px';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.width = `${Math.random() * 15 + 5}px`;
    confetti.style.height = `${Math.random() * 15 + 5}px`;
    confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
    confetti.style.animationDelay = `${Math.random() * 2}s`;
    confetti.style.zIndex = '1000';
    confetti.style.boxShadow = '0 0 10px currentColor, 0 0 20px currentColor';
    
    // Adiciona diretamente no body como antes
    document.body.appendChild(confetti);
    
    setTimeout(() => {
      confetti.remove();
      // Reativa o scroll quando o último confete sumir
      if (i === 99) {
        setTimeout(() => {
          document.documentElement.style.overflowY = '';
        }, 500);
      }
    }, 4000);
  }
}
    
function initializeGame() {
  // Garante que todas as variáveis estão resetadas
  deck = createDeck();
  playerHand = [];
  bots = [[], [], []];
  discardPile = [];
  currentColor = null;
  currentPlayer = 0;
  direction = 1;
  gameStarted = false;
  
  // Esconde elementos do jogo
  document.body.classList.remove('game-started');
  document.querySelectorAll('.bot .player-name, .bot-hand').forEach(el => {
    el.style.display = 'none';
  });
  drawButton.style.display = 'none';
  
  // Mostra botão de iniciar
  document.getElementById("start-game-btn").style.display = "block";
  statusDiv.textContent = "AGUARDANDO INÍCIO";
}

function startGame() {
    createParticles();

    try {
        initializeGame();
        gameStarted = true;
        document.body.classList.add('game-started');
        document.getElementById("start-game-btn").style.display = "none";

        // Mostra todos os elementos dos bots
          document.querySelectorAll('.bot').forEach(bot => {
            bot.style.display = ''; // Remove qualquer display:none
        });

        // Ligar som e tocar música ao iniciar o jogo automaticamente
        if (!soundOn) {
            soundOn = true;
            backgroundMusic.play().catch(e => console.log("Falha ao tocar música:", e));
            updateSoundButton();
        }
        
          // Distribui cartas
        drawCard(playerHand, 7);
        bots.forEach(bot => drawCard(bot, 7));

        let firstCard;
        do {
            firstCard = deck.pop();
        } while (firstCard.color === "preto");

        discardPile.push(firstCard);
        currentColor = firstCard.color;

        renderAll();
        statusDiv.textContent = "SUA VEZ";
        createConfetti();

        document.getElementById('deck-container').style.display = 'block';
        document.querySelectorAll('.bot .player-name').forEach(name => {
            name.style.display = 'block';
        });
        document.querySelectorAll('.bot-hand').forEach(hand => {
            hand.style.display = 'flex';
        });
        drawButton.style.display = "block";

    } catch (error) {
        console.error("Erro ao iniciar jogo:", error);
        statusDiv.textContent = "ERRO AO INÍCIO DO JOGO";
        
        // Mostra o botão de iniciar novamente em caso de erro
        document.getElementById("start-game-btn").style.display = "block";
    }
}
// Event listener robusto
window.onload = function() {
  initializeGame();
  
  const startBtn = document.getElementById("start-game-btn");
  if (startBtn) {
    startBtn.addEventListener("click", startGame);
  } else {
    console.error("Botão 'Iniciar Jogo' não encontrado!");
  }
};

function renderAll() {
  renderHand(playerHand, playerHandDiv);
  bots.forEach((b, i) => renderHand(b, botHands[i], true));
  
  const topCard = discardPile[discardPile.length - 1];
  const isWildCard = (topCard.value === "wild" || topCard.value === "wild+4");
  
  discardDiv.innerHTML = `
    <div class="card ${topCard.color} ${isWildCard ? 'wild-card-played ' + currentColor : ''}">
      <div class="value">
        ${topCard.value === "skip" ? "⊘" : 
          topCard.value === "reverse" ? "⇄" : 
          topCard.value === "+2" ? "+2" : 
          topCard.value === "wild" ? "★" : 
          topCard.value === "wild+4" ? "+4" : 
          topCard.value}
      </div>
    </div>
  `;

  // Verifica o status UNO após renderizar
  checkUnoStatus();
}

    function isPlayable(card) {
      if (currentPlayer !== 0) return false;
      
      const top = discardPile[discardPile.length - 1];
      return (
        card.color === currentColor ||
        card.value === top.value ||
        card.color === "preto"
      );
    }

    function playCard(hand, index) {
    if (!gameStarted || currentPlayer !== 0 || waitingForColorChoice) return;
      
    const card = hand[index];
    if (!isPlayable(card)) {
        statusDiv.textContent = "CARTA INVÁLIDA!";
        setTimeout(() => statusDiv.textContent = "SUA VEZ", 1000);
        return;
    }
      
    hand.splice(index, 1);
    discardPile.push(card);
    if (card.color !== "preto") currentColor = card.color;
      
      // Adiciona animação à carta jogada
      const cardDiv = document.createElement("div");
      cardDiv.classList.add("card", card.color, "played");
      cardDiv.style.position = "fixed";
      cardDiv.style.top = "50%";
      cardDiv.style.left = "50%";
      cardDiv.style.transform = "translate(-50%, -50%)";
      cardDiv.style.zIndex = "1000";
      
      const valueDiv = document.createElement("div");
      valueDiv.classList.add("value");
      valueDiv.innerHTML = card.value === "skip" ? "⊘" : 
                         card.value === "reverse" ? "⇄" : 
                         card.value === "+2" ? "+2" : 
                         card.value === "wild" ? "★" : 
                         card.value === "wild+4" ? "+4" : 
                         card.value;
      
      cardDiv.appendChild(valueDiv);
      document.body.appendChild(cardDiv);
      
      playSound('card');
      
       setTimeout(() => {
        document.body.removeChild(cardDiv);
        renderAll();
        
        handleSpecial(card, hand);
        
        if (hand.length === 0) {
            showVictory("VOCÊ VENCEU!");
            return;
        }
        
        // Verifica UNO após jogar carta
        if (hand.length === 1) {
            showUnoEffect(playerHandDiv.parentElement, "VOCÊ TEM UNO!");
            playSound('win'); // Toca um som especial para UNO
        }
        
        nextTurn();
    }, 500);
    }

    function handleSpecial(card, hand) {
  if (card.value === "+2") {
    let next = (currentPlayer + direction + 4) % 4;
    let target = next === 0 ? playerHand : bots[next - 1];
    drawCard(target, 2);
    statusDiv.textContent = `+2 PARA ${next === 0 ? 'VOCÊ' : BOT_NAMES[next - 1]}!`;
    
    if (next !== 0) {
      showBotMessage(next - 1, "OH NÃO! +2 PARA MIM?");
    }
  } else if (card.value === "skip") {
    currentPlayer = (currentPlayer + direction + 4) % 4;
    statusDiv.textContent = `PULADO! VEZ DE ${currentPlayer === 0 ? 'VOCÊ' : BOT_NAMES[currentPlayer - 1]}`;
    
    if (currentPlayer !== 0) {
      showBotMessage(currentPlayer - 1, "FUI PULADO AF!");
    }
  } else if (card.value === "reverse") {
    direction *= -1;
    statusDiv.textContent = `SENTIDO INVERTIDO!`;
    updatePlayerOrder(); // Atualiza a ordem visual dos jogadores
    
    // Mostra mensagem para todos os bots
    bots.forEach((_, i) => {
      showBotMessage(i, "SENTIDO INVERTIDO!");
    });
  } else if (card.value === "wild" || card.value === "wild+4") {
    // Armazena a cor escolhida na própria carta
    card.chosenColor = null;
    
    if (currentPlayer === 0) {
      waitingForColorChoice = true;
      
      const colorModal = document.createElement("div");
      colorModal.style.position = "fixed";
      colorModal.style.top = "0";
      colorModal.style.left = "0";
      colorModal.style.width = "100%";
      colorModal.style.height = "100%";
      colorModal.style.backgroundColor = "rgba(0,0,0,0.8)";
      colorModal.style.display = "flex";
      colorModal.style.flexDirection = "column";
      colorModal.style.justifyContent = "center";
      colorModal.style.alignItems = "center";
      colorModal.style.zIndex = "2000";
      
      const modalTitle = document.createElement("h2");
      modalTitle.textContent = "ESCOLHA UMA COR";
      modalTitle.style.color = "white";
      modalTitle.style.fontFamily = "'Press Start 2P', cursive";
      modalTitle.style.marginBottom = "30px";
      modalTitle.style.textShadow = "0 0 10px var(--neon-purple)";
      
      const colorOptions = document.createElement("div");
      colorOptions.style.display = "flex";
      colorOptions.style.gap = "20px";
      colorOptions.style.flexWrap = "wrap";
      colorOptions.style.justifyContent = "center";
      
      colors.forEach(color => {
        const colorBtn = document.createElement("button");
        colorBtn.textContent = color.toUpperCase();
        colorBtn.style.padding = "15px 25px";
        colorBtn.style.fontFamily = "'Press Start 2P', cursive";
        colorBtn.style.border = "3px solid white";
        colorBtn.style.borderRadius = "10px";
        colorBtn.style.cursor = "pointer";
        colorBtn.style.textTransform = "uppercase";
        colorBtn.style.fontWeight = "bold";
        colorBtn.style.margin = "5px";
        
        // Estilo baseado na cor
        if (color === "vermelho") {
          colorBtn.style.backgroundColor = "#ff2a6d";
          colorBtn.style.boxShadow = "0 0 15px var(--neon-red)";
        } else if (color === "verde") {
          colorBtn.style.backgroundColor = "#00ff9d";
          colorBtn.style.boxShadow = "0 0 15px var(--neon-green)";
        } else if (color === "azul") {
          colorBtn.style.backgroundColor = "#05d9e8";
          colorBtn.style.boxShadow = "0 0 15px var(--neon-blue)";
        } else if (color === "amarelo") {
          colorBtn.style.backgroundColor = "#f9f002";
          colorBtn.style.boxShadow = "0 0 15px var(--neon-yellow)";
        }
        
        colorBtn.onclick = () => {
          currentColor = color;
          card.chosenColor = color; // Armazena a cor escolhida
          document.body.removeChild(colorModal);
          waitingForColorChoice = false;
          
          // Renderiza novamente para mostrar a borda colorida
          renderAll();
          
          if (card.value === "wild+4") {
            let next = (currentPlayer + direction + 4) % 4;
            let target = next === 0 ? playerHand : bots[next - 1];
            drawCard(target, 4);
            statusDiv.textContent = `MUDOU PARA ${color.toUpperCase()} E +4 PARA ${next === 0 ? 'VOCÊ' : BOT_NAMES[next - 1]}!`;
            
            if (next !== 0) {
              showBotMessage(next - 1, "+4 CARTAS? QUE INJUSTO!");
            }
          } else {
            statusDiv.textContent = `MUDOU PARA ${color.toUpperCase()}`;
          }
          
          nextTurn();
        };
        
        colorOptions.appendChild(colorBtn);
      });
      
      colorModal.appendChild(modalTitle);
      colorModal.appendChild(colorOptions);
      document.body.appendChild(colorModal);
      
    } else {
      // Lógica para bots - escolhe cor aleatória
      currentColor = colors[Math.floor(Math.random() * 4)];
      card.chosenColor = currentColor; // Armazena a cor escolhida
      
      statusDiv.textContent = `${BOT_NAMES[currentPlayer - 1]} ESCOLHEU ${currentColor.toUpperCase()}`;
      showBotMessage(currentPlayer - 1, `MUDANDO PARA ${currentColor.toUpperCase()}!`);
      
      if (card.value === "wild+4") {
        let next = (currentPlayer + direction + 4) % 4;
        let target = next === 0 ? playerHand : bots[next - 1];
        drawCard(target, 4);
        statusDiv.textContent += ` E +4 PARA ${next === 0 ? 'VOCÊ' : BOT_NAMES[next - 1]}!`;
        
        if (next !== 0) {
          showBotMessage(next - 1, "+4 CARTAS? QUE INJUSTO!");
        }
      }
      
      // Renderiza novamente para mostrar a borda colorida
      renderAll();
    }
  }
}

function nextTurn() {
    if (waitingForColorChoice) return; // Não avança o turno se estiver esperando escolha
    
    currentPlayer = (currentPlayer + direction + 4) % 4;
    
    // Atualiza o indicador de ordem dos jogadores
    updatePlayerOrder();
    
    if (currentPlayer === 0) {
        setTimeout(() => {
            statusDiv.textContent = "SUA VEZ";
            drawButton.style.display = "block";
            
            // Efeito visual para destacar o turno do jogador
            const playerOrderItem = document.getElementById(`player-order-0`);
            playerOrderItem.classList.add('active');
            playerOrderItem.style.animation = 'pulse 0.5s 3';
            
            // Remove a animação após terminar
            setTimeout(() => {
                playerOrderItem.style.animation = '';
            }, 1500);
            
        }, DELAYS.nextTurn);
    } else {
        setTimeout(() => {
            const botName = BOT_NAMES[currentPlayer - 1];
            statusDiv.textContent = `VEZ DE ${botName}`;
            drawButton.style.display = "none";
            
            // Efeito visual para destacar o turno do bot
            const botOrderItem = document.getElementById(`player-order-${currentPlayer}`);
            botOrderItem.classList.add('active');
            botOrderItem.style.animation = 'pulse 0.5s 3';
            
            // Remove a animação após terminar
            setTimeout(() => {
                botOrderItem.style.animation = '';
            }, 1500);
            
            // Mostra mensagem do bot
            const messages = [
                "MINHA VEZ!",
                "DEIXEM EU PENSAR...",
                "VAMOS LÁ!",
                "HMM... QUE CARTA JOGAR?"
            ];
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            showBotMessage(currentPlayer - 1, randomMessage);
            
            setTimeout(() => botPlay(currentPlayer - 1), DELAYS.botThink);
        }, DELAYS.nextTurn);
    }
}

function getCardName(card) {
  return card.value === "wild" ? "CORINGA" : 
         card.value === "wild+4" ? "CORINGA +4" : 
         card.value === "+2" ? "+2" : 
         card.value === "skip" ? "PULAR" : 
         card.value === "reverse" ? "INVERTER" : 
         card.value;
}

function botPlay(botIndex) {
  if (!gameStarted || waitingForColorChoice) return; // Não executa se estiver esperando escolha
  
  const hand = bots[botIndex];
  const playableIndex = hand.findIndex(isBotCardPlayable);
  
  if (playableIndex >= 0) {
    const card = hand[playableIndex];
    hand.splice(playableIndex, 1);
    discardPile.push(card);
    if (card.color !== "preto") currentColor = card.color;
    
    showBotMessage(botIndex, `JOGANDO ${getCardName(card)} ${card.color !== "preto" ? card.color.toUpperCase() : ""}`);
    
    renderAll();
    playSound('card');
    
    setTimeout(() => {
      handleSpecial(card, hand);
      
      if (hand.length === 0) {
        showVictory(`${BOT_NAMES[botIndex]} VENCEU!`);
        return;
      }
      
      nextTurn();
    }, DELAYS.cardPlay);
  } else {
    const drawnCard = drawCard(hand, 1)[0];
    showBotMessage(botIndex, "PRECISO COMPRAR!");
    renderAll();
    
    setTimeout(() => {
      if (drawnCard && isBotCardPlayable(drawnCard)) {
        hand.pop();
        discardPile.push(drawnCard);
        if (drawnCard.color !== "preto") currentColor = drawnCard.color;
        
        showBotMessage(botIndex, "JOGANDO A CARTA QUE COMPREI!");
        renderAll();
        playSound('card');
        
        setTimeout(() => {
          handleSpecial(drawnCard, hand);
          
          if (hand.length === 0) {
            showVictory(`${BOT_NAMES[botIndex]} VENCEU!`);
            return;
          }
          
          nextTurn();
        }, DELAYS.cardPlay);
      } else {
        showBotMessage(botIndex, "PASSO A VEZ!");
        setTimeout(nextTurn, DELAYS.messageShow);
      }
    }, DELAYS.botThink);
  }
}

    function isBotCardPlayable(card) {
      const top = discardPile[discardPile.length - 1];
      return (
        card.color === currentColor ||
        card.value === top.value ||
        card.color === "preto"
      );
    }

// Modifique a função showVictory
function showVictory(message) {
  gameStarted = false;
  victoryMessage.textContent = message;
  victoryScreen.classList.add("show");
  createConfetti();
  playSound('win');
}

// Atualize a função resetGame para voltar ao início
function resetGame() {
  // Para e reseta a música
  backgroundMusic.pause();
  backgroundMusic.currentTime = 0;
  
  // Desliga o som e atualiza o botão
  soundOn = false;
  updateSoundButton();
  
  // Remove a tela de vitória
  victoryScreen.classList.remove("show");
  
  // Reseta todas as variáveis do jogo
  playerHand = [];
  bots = [[], [], []];
  discardPile = [];
  currentColor = null;
  currentPlayer = 0;
  direction = 1;
  gameStarted = false;
  
  // Limpa as mãos visuais
  playerHandDiv.innerHTML = "";
  botHands.forEach(hand => hand.innerHTML = "");
  
  // Esconde completamente os containers dos bots
  document.querySelectorAll('.bot').forEach(bot => {
    bot.style.display = 'none';
  });
  
  // Mostra o botão de iniciar
  const startBtn = document.getElementById("start-game-btn");
  startBtn.style.display = "block";
  
  // Esconde o botão de comprar
  drawButton.style.display = "none";
  
  // Reseta o deck
  deck = createDeck();
  
  // Reseta o status
  statusDiv.textContent = "AGUARDANDO INÍCIO";
  
  // Remove qualquer carta no descarte
  discardDiv.innerHTML = "";
  
  // Reativa o scroll se estiver desativado
  document.documentElement.style.overflowY = '';
  
  // Remove a classe de jogo iniciado
  document.body.classList.remove('game-started');
  
  // Esconde o deck
  document.getElementById('deck-container').style.display = 'none';
}

// Atualize o event listener do botão quit
quitBtn.addEventListener("click", resetGame);

    drawButton.addEventListener("click", () => {
    if (currentPlayer === 0 && !waitingForColorChoice) {
        const drawnCard = drawCard(playerHand, 1)[0];
        renderAll();
        
        if (drawnCard && isPlayable(drawnCard)) {
          statusDiv.textContent = "JOGUE A CARTA COMPRADA!";
          const lastCardIndex = playerHand.length - 1;
          playerHandDiv.children[lastCardIndex].onclick = () => playCard(playerHand, lastCardIndex);
        } else {
          nextTurn();
        }
      }
    });

    playAgainBtn.addEventListener("click", resetGame);
    quitBtn.addEventListener("click", () => {
     
    });

    document.getElementById("start-game-btn").addEventListener("click", function() {
  this.style.display = "none";
  startGame();
});

    document.getElementById("start-game-btn").addEventListener("click", function() {
  this.style.display = "none";
  startGame();
});

function updatePlayerOrder() {
  // Determina a ordem atual considerando a direção
  let order = [];
  if (direction === 1) {
    order = [0, 1, 2, 3]; // Ordem normal: Você, Lucy, Pedro, Hanna
  } else {
    order = [0, 3, 2, 1]; // Ordem invertida: Você, Hanna, Pedro, Lucy
  }
  
  // Remove a classe 'active' de todos
  document.querySelectorAll('.player-order-item').forEach(item => {
    item.classList.remove('active');
  });
  
  // Atualiza a posição dos itens na div para refletir a ordem
  const playerOrderDiv = document.getElementById('player-order');
  
  // Limpa e recria os itens na ordem correta
  playerOrderDiv.innerHTML = '';
  
  order.forEach(playerIndex => {
    const item = document.createElement('div');
    item.className = 'player-order-item';
    item.id = `player-order-${playerIndex}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'player-order-avatar';
    
    const name = document.createElement('div');
    name.className = 'player-order-name';
    
    const arrow = document.createElement('div');
    arrow.className = 'player-order-arrow';
    arrow.textContent = '↓';
    
    // Configura cada jogador
    if (playerIndex === 0) {
      avatar.textContent = 'V';
      name.textContent = 'VOCÊ';
      item.style.color = 'var(--neon-green)';
    } else {
      avatar.textContent = BOT_NAMES[playerIndex - 1].charAt(0);
      name.textContent = BOT_NAMES[playerIndex - 1];
      item.style.color = 'var(--neon-yellow)';
    }
    
    // Destaca o jogador atual
    if (playerIndex === currentPlayer) {
      item.classList.add('active');
    }
    
    item.appendChild(avatar);
    item.appendChild(name);
    item.appendChild(arrow);
    playerOrderDiv.appendChild(item);
  });
}

function createParticles() {
  const neonParticles = document.querySelector('.neon-particles');
  const colorfulDots = document.querySelector('.colorful-dots');
  
  // Cria partículas neon
  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('span');
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.animationDelay = `${Math.random() * 10}s`;
    particle.style.animationDuration = `${5 + Math.random() * 10}s`;
    
    // Escolhe uma cor neon aleatória
    const colors = ['var(--neon-red)', 'var(--neon-blue)', 'var(--neon-green)', 'var(--neon-yellow)'];
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];
    particle.style.boxShadow = `0 0 10px currentColor, 0 0 20px currentColor`;
    
    neonParticles.appendChild(particle);
  }
  
  // Cria pontos coloridos
  for (let i = 0; i < 20; i++) {
    const dot = document.createElement('span');
    dot.style.left = `${Math.random() * 100}%`;
    dot.style.top = `${Math.random() * 100}%`;
    dot.style.animationDelay = `${Math.random() * 4}s`;
    
    // Escolhe uma cor aleatória
    const colors = [
      'rgba(255, 42, 109, 0.5)',
      'rgba(5, 217, 232, 0.5)',
      'rgba(0, 255, 157, 0.5)',
      'rgba(249, 240, 2, 0.5)',
      'rgba(211, 0, 197, 0.5)'
    ];
    dot.style.background = colors[Math.floor(Math.random() * colors.length)];
    
    colorfulDots.appendChild(dot);
  }
  
  // Cria cartas flutuantes adicionais
  const floatingCards = document.querySelector('.floating-cards');
  for (let i = 0; i < 5; i++) {
    const card = document.createElement('div');
    card.style.position = 'absolute';
    card.style.width = '30px';
    card.style.height = '45px';
    card.style.backgroundSize = 'contain';
    card.style.backgroundRepeat = 'no-repeat';
    card.style.opacity = '0.2';
    card.style.animation = `float ${15 + Math.random() * 10}s infinite linear`;
    card.style.animationDelay = `${Math.random() * 10}s`;
    card.style.left = `${Math.random() * 90 + 5}%`;
    card.style.top = `${Math.random() * 80 + 10}%`;
    
    const colors = ['vermelho', 'verde', 'azul', 'amarelo'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    let svg;
    switch(color) {
      case 'vermelho':
        svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 150"><rect width="90" height="140" rx="10" fill="%23ff2a6d"/></svg>';
        break;
      case 'verde':
        svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 150"><rect width="90" height="140" rx="10" fill="%2300ff9d"/></svg>';
        break;
      case 'azul':
        svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 150"><rect width="90" height="140" rx="10" fill="%2305d9e8"/></svg>';
        break;
      case 'amarelo':
        svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 150"><rect width="90" height="140" rx="10" fill="%23f9f002"/></svg>';
        break;
    }
    
    card.style.backgroundImage = `url('data:image/svg+xml;utf8,${svg}')`;
    floatingCards.appendChild(card);
  }
}

// Chame esta função quando o jogo iniciar
document.getElementById("start-game-btn").addEventListener("click", function() {
  createParticles();
});

// Adicione estas funções ao seu JS
function checkUnoStatus() {
  // Verifica o jogador humano
  if (playerHand.length === 1) {
    showUnoEffect(playerHandDiv.parentElement, "VOCÊ TEM UNO!");
  } else {
    removeUnoEffect(playerHandDiv.parentElement);
  }

  // Verifica cada bot
  bots.forEach((botHand, index) => {
    const botContainer = botHands[index].parentElement;
    if (botHand.length === 1) {
      showUnoEffect(botContainer, `${BOT_NAMES[index]} TEM UNO!`);
    } else {
      removeUnoEffect(botContainer);
    }
  });
}

function showUnoEffect(container, text) {
  if (!container.classList.contains('uno-warning')) {
    container.classList.add('uno-warning');
    
    // Adiciona o texto UNO
    const unoText = document.createElement('div');
    unoText.className = 'uno-text';
    unoText.textContent = 'UNO!';
    container.appendChild(unoText);
    
    // Se for um bot, mostra mensagem especial
    if (text.includes('TEM UNO!') && !text.includes('VOCÊ')) {
      const botIndex = BOT_NAMES.findIndex(name => text.includes(name));
      if (botIndex !== -1) {
        showBotMessage(botIndex, "UNO!!!");
      }
    }
  }
}

function removeUnoEffect(container) {
  if (container.classList.contains('uno-warning')) {
    container.classList.remove('uno-warning');
    
    // Remove o texto UNO
    const unoText = container.querySelector('.uno-text');
    if (unoText) {
      container.removeChild(unoText);
    }
  }
}

