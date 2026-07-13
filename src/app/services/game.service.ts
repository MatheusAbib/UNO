import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Card } from '../models/card';
import { Player } from '../models/player';
import { GameState } from '../models/game-state';
import { DeckService } from './deck';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private gameState = new BehaviorSubject<GameState | null>(null);
  private chatMessageSubject = new Subject<{ name: string; text: string; isBot: boolean }>();
  private speechSubject = new Subject<{ name: string; text: string }>();
  private confettiSubject = new Subject<void>();
  private deckService: DeckService;
  private botTimer: any = null;
  private waitingForDraw: boolean = false;
  private confettiTriggered: boolean = false;
  private isProcessing: boolean = false;

  constructor(deckService: DeckService) {
    this.deckService = deckService;
  }

  getGameState(): Observable<GameState | null> {
    return this.gameState.asObservable();
  }

  getChatMessages(): Observable<{ name: string; text: string; isBot: boolean }> {
    return this.chatMessageSubject.asObservable();
  }

  getSpeech(): Observable<{ name: string; text: string }> {
    return this.speechSubject.asObservable();
  }

  getConfetti(): Observable<void> {
    return this.confettiSubject.asObservable();
  }

  private triggerConfetti(): void {
    if (this.confettiTriggered) {
      return;
    }
    this.confettiTriggered = true;
    this.confettiSubject.next();
  }

  private addChatMessage(name: string, text: string, isBot: boolean = false): void {
    this.chatMessageSubject.next({ name, text, isBot });
  }

  private addSpeech(name: string, text: string): void {
    this.speechSubject.next({ name, text });
  }

  private getCardDisplayName(card: Card): string {
    if (card.value === 'skip') return 'PULAR';
    if (card.value === 'reverse') return 'INVERTER';
    if (card.value === 'draw2') return '+2';
    if (card.value === 'wild') return '★';
    if (card.value === 'wild_draw_four') return '+4';
    return card.value.toString();
  }

  private getColorName(color: string): string {
    const colors: {[key: string]: string} = {
      'red': 'VERMELHO',
      'blue': 'AZUL',
      'green': 'VERDE',
      'yellow': 'AMARELO'
    };
    return colors[color] || color;
  }

  initializeGame(playerNames: string[]): void {
  this.confettiTriggered = false;
  this.isProcessing = false;
  const fullDeck = this.deckService.createDeck();

  const botNames = ['Hanna', 'Lucia', 'Pedro'];
  const players: Player[] = playerNames.map((name, index) => ({
    id: `player-${index}`,
    name: index === 0 ? name : botNames[index - 1],
    hand: [],
    isHuman: index === 0,
    isUno: false,
    score: 0
  }));

  const drawPile = [...fullDeck];
  const discardPile: Card[] = [];

  let firstCard = this.deckService.drawCards(drawPile, 1)[0];
  while (firstCard.color === 'wild') {
    drawPile.push(firstCard);
    firstCard = this.deckService.drawCards(drawPile, 1)[0];
  }
  discardPile.push(firstCard);

  players.forEach(player => {
    player.hand = this.deckService.drawCards(drawPile, 7);
  });

  const state: GameState = {
    players: players,
    currentPlayerIndex: 0,
    discardPile: discardPile,
    drawPile: drawPile,
    currentColor: firstCard.color,
    currentValue: firstCard.value,
    direction: 1,
    isGameOver: false,
    winner: null,
    mustDraw: 0
  };

  this.waitingForDraw = false;
  this.gameState.next(state);

  setTimeout(() => {
    this.addChatMessage('SISTEMA', 'JOGO INICIADO!', false);
    const currentPlayer = state.players[state.currentPlayerIndex];
    if (currentPlayer && currentPlayer.isHuman) {
      this.addChatMessage('SISTEMA', 'SUA VEZ!', false);
    } else if (currentPlayer) {
      this.addChatMessage('SISTEMA', `VEZ DE ${currentPlayer.name.toUpperCase()}!`, false);
    }
  }, 500);

  this.triggerBotIfNeeded();
}

  playCard(playerId: string, cardIndex: number, chosenColor?: string): boolean {
    if (this.isProcessing) {
      return false;
    }
    this.isProcessing = true;

    const state = this.gameState.getValue();
    if (!state || state.isGameOver) {
      this.isProcessing = false;
      return false;
    }

    const player = state.players.find(p => p.id === playerId);
    if (!player) {
      this.isProcessing = false;
      return false;
    }

    const card = player.hand[cardIndex];
    if (!this.isValidPlay(card, state)) {
      this.isProcessing = false;
      return false;
    }

    this.waitingForDraw = false;
    player.hand.splice(cardIndex, 1);
    state.discardPile.push(card);

    if (card.color === 'wild') {
      const selectedColor = chosenColor || this.getRandomColor();
      state.currentColor = selectedColor;
      state.currentValue = card.value;
      (card as any).chosenColor = selectedColor;
      const colorLabel = this.getColorName(selectedColor);
      this.addChatMessage(player.name, `JOGOU ${this.getCardDisplayName(card)} E ESCOLHEU ${colorLabel.toUpperCase()}`, !player.isHuman);
    } else {
      state.currentColor = card.color;
      state.currentValue = card.value;
      this.addChatMessage(player.name, `JOGOU ${this.getCardDisplayName(card)} ${this.getColorName(card.color).toUpperCase()}`, !player.isHuman);
    }

    if (card.value === 'skip') {
      this.addChatMessage(player.name, `PULOU O PRÓXIMO!`, !player.isHuman);
      const nextPlayer = state.players[(state.currentPlayerIndex + state.direction + state.players.length) % state.players.length];
      if (nextPlayer && !nextPlayer.isHuman) {
        const skipMessages = ['AF ME PULOU', 'QUE FDP!', 'AH NÂO NÉ!', 'DEIXEM EU JOGAR!'];
        const msg = skipMessages[Math.floor(Math.random() * skipMessages.length)];
        this.addSpeech(nextPlayer.name, msg);
      }
      this.nextTurn(state);
      this.nextTurn(state);
    } else if (card.value === 'reverse') {
      this.addChatMessage(player.name, `INVERTEU O SENTIDO!`, !player.isHuman);
      this.reverseDirection(state);
      this.nextTurn(state);
    } else if (card.value === 'draw2') {
      this.nextTurn(state);
      const nextPlayer = state.players[state.currentPlayerIndex];
      if (nextPlayer) {
        for (let i = 0; i < 2; i++) {
          const drawn = this.tryDrawCard(state);
          if (drawn) {
            nextPlayer.hand.push(drawn);
          }
        }
        this.addChatMessage(player.name, `DEU +2 EM ${nextPlayer.name}`, !player.isHuman);
        if (!nextPlayer.isHuman) {
          const draw2Messages = ['OH NÃO! +2 PARA MIM?', 'QUE SACANAGEM!', '+2?! INJUSTO!', 'SEU LIXO', 'MALDITO +2!'];
          const msg = draw2Messages[Math.floor(Math.random() * draw2Messages.length)];
          this.addSpeech(nextPlayer.name, msg);
        }
      }
      this.nextTurn(state);
    } else if (card.value === 'wild_draw_four') {
      this.nextTurn(state);
      const nextPlayer = state.players[state.currentPlayerIndex];
      if (nextPlayer) {
        for (let i = 0; i < 4; i++) {
          const drawn = this.tryDrawCard(state);
          if (drawn) {
            nextPlayer.hand.push(drawn);
          }
        }
        this.addChatMessage(player.name, `DEU +4 EM ${nextPlayer.name}`, !player.isHuman);
        if (!nextPlayer.isHuman) {
          const draw4Messages = ['+4!? INJUSTO!', 'ISSO É CRUEL!', '+4?! TÔ FORA!', 'RANÇOOO', 'QUE ÓDIO!'];
          const msg = draw4Messages[Math.floor(Math.random() * draw4Messages.length)];
          this.addSpeech(nextPlayer.name, msg);
        }
      }
      this.nextTurn(state);
    } else {
      if (!state.isGameOver) {
        this.nextTurn(state);
      }
    }

    if (player.hand.length === 0) {
      state.isGameOver = true;
      state.winner = player;
      this.addChatMessage(player.name, `🏆 VENCEU! 🏆`, !player.isHuman);
      if (!player.isHuman) {
        const winMessages = ['VENCEU! SOU O MELHOR!', 'MAIS UMA VITÓRIA!', 'NINGUÉM ME SEGURA!', 'VITÓRIA CERTA!'];
        const msg = winMessages[Math.floor(Math.random() * winMessages.length)];
        this.addSpeech(player.name, msg);
      }
      this.triggerConfetti();
      this.gameState.next(state);
      if (this.botTimer) {
        clearTimeout(this.botTimer);
        this.botTimer = null;
      }
      this.isProcessing = false;
      return true;
    }

    if (player.hand.length === 1 && !player.isUno) {
      this.addChatMessage(player.name, `ESTÁ EM UNO!`, !player.isHuman);
      if (!player.isHuman) {
        const unoMessages = ['UNO!', 'UNO!!!', 'CUIDADO, TÔ DE UNO!', 'QUASE LÁ!'];
        const msg = unoMessages[Math.floor(Math.random() * unoMessages.length)];
        this.addSpeech(player.name, msg);
      }
    }

    player.isUno = player.hand.length === 1;
    this.gameState.next(state);
    this.isProcessing = false;
    this.triggerBotIfNeeded();
    return true;
  }

  private tryDrawCard(state: GameState): Card | null {
    if (state.drawPile.length === 0) {
      if (state.discardPile.length > 1) {
        const lastCard = state.discardPile.pop()!;
        const shuffledDiscard = this.deckService.shuffle(state.discardPile);
        state.drawPile = shuffledDiscard;
        state.discardPile = [lastCard];
        this.addChatMessage('SISTEMA', 'BARALHO RECICLADO!', false);
      } else {
        return null;
      }
    }

    const cards = this.deckService.drawCards(state.drawPile, 1);
    if (cards.length > 0) {
      return cards[0];
    }
    return null;
  }

  private isValidPlay(card: Card, state: GameState): boolean {
    if (card.color === 'wild') return true;
    if (card.color === state.currentColor) return true;
    if (card.value === state.currentValue) return true;
    return false;
  }

  private getRandomColor(): string {
    const colors = ['red', 'blue', 'green', 'yellow'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private reverseDirection(state: GameState): void {
    state.direction = state.direction === 1 ? -1 : 1;
  }

  private nextTurn(state: GameState): void {
    state.currentPlayerIndex = (state.currentPlayerIndex + state.direction + state.players.length) % state.players.length;
    state.mustDraw = 0;
    this.waitingForDraw = false;
  }

  drawCard(playerId: string): boolean {
    if (this.isProcessing) {
      return false;
    }
    this.isProcessing = true;

    const state = this.gameState.getValue();
    if (!state || state.isGameOver) {
      this.isProcessing = false;
      return false;
    }

    const player = state.players.find(p => p.id === playerId);
    if (!player) {
      this.isProcessing = false;
      return false;
    }

    const drawnCard = this.tryDrawCard(state);
    if (drawnCard) {
      player.hand.push(drawnCard);
      this.waitingForDraw = true;
      this.addChatMessage(player.name, `COMPROU UMA CARTA`, !player.isHuman);

      player.isUno = player.hand.length === 1;
      this.gameState.next(state);

      const isPlayable = this.isValidPlay(drawnCard, state);

      if (isPlayable && player.isHuman) {
        this.isProcessing = false;
        return true;
      } else if (isPlayable && !player.isHuman) {
        const cardIndex = player.hand.length - 1;
        const chosenColor = drawnCard.color === 'wild' ? this.getRandomColor() : undefined;
        this.isProcessing = false;
        this.playCard(player.id, cardIndex, chosenColor);
        return true;
      } else {
        if (!player.isHuman) {
          const noPlayMessages = ['PRECISO COMPRAR!', 'NÃO TENHO CARTA!', 'QUE BOSTA!', 'TENHO QUE COMPRAR...', 'NÃO TEM JOGADA!'];
          const msg = noPlayMessages[Math.floor(Math.random() * noPlayMessages.length)];
          this.addSpeech(player.name, msg);
        } else {
          this.addChatMessage(player.name, `COMPROU MAS NÃO PODE JOGAR`, !player.isHuman);
        }
        this.waitingForDraw = false;
        this.nextTurn(state);
        this.gameState.next(state);
        this.isProcessing = false;
        this.triggerBotIfNeeded();
        return true;
      }
    } else {
      this.addChatMessage(player.name, `NÃO CONSEGUIU COMPRAR`, !player.isHuman);
      this.waitingForDraw = false;
      this.nextTurn(state);
      this.gameState.next(state);
      this.isProcessing = false;
      this.triggerBotIfNeeded();
      return false;
    }
  }

  private triggerBotIfNeeded(): void {
    if (this.botTimer) {
      clearTimeout(this.botTimer);
      this.botTimer = null;
    }

    const state = this.gameState.getValue();
    if (!state || state.isGameOver) {
      return;
    }

    const currentPlayer = state.players[state.currentPlayerIndex];
    if (!currentPlayer) return;

    if (!currentPlayer.isHuman) {
      const turnMessages = ['MINHA VEZ!', 'DEIXEM EU PENSAR...', 'VAMOS LÁ!', 'HMM...', 'VOU GANHAR ESSA!', 'AH SEI...', 'VAMOS VER...', 'HORA DA ESTRATÉGIA!'];
      const randomMessage = turnMessages[Math.floor(Math.random() * turnMessages.length)];
      this.addSpeech(currentPlayer.name, randomMessage);

      this.botTimer = setTimeout(() => {
        this.botPlay();
      }, 1500);
    }
  }

  private botPlay(): void {
    const state = this.gameState.getValue();
    if (!state || state.isGameOver) {
      return;
    }

    const currentPlayer = state.players[state.currentPlayerIndex];
    if (!currentPlayer || currentPlayer.isHuman) {
      return;
    }

    const playableCards = currentPlayer.hand
      .map((card, index) => ({ card, index }))
      .filter(({ card }) => this.isValidPlay(card, state));

    if (playableCards.length > 0) {
      const randomIndex = Math.floor(Math.random() * playableCards.length);
      const selected = playableCards[randomIndex];
      let chosenColor = undefined;
      if (selected.card.color === 'wild') {
        chosenColor = this.getRandomColor();
        (selected.card as any).chosenColor = chosenColor;
      }
      this.playCard(currentPlayer.id, selected.index, chosenColor);
    } else {
      this.drawCard(currentPlayer.id);
    }
  }

  resetGame(): void {
    if (this.botTimer) {
      clearTimeout(this.botTimer);
      this.botTimer = null;
    }
    this.waitingForDraw = false;
    this.confettiTriggered = false;
    this.isProcessing = false;
    this.gameState.next(null);
  }
}