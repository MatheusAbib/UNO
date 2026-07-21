import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { Card } from '../models/card';
import { Player } from '../models/player';
import { GameState } from '../models/game-state';
import { DeckService } from './deck';
import { RankingService } from './ranking';
import { TournamentService, TournamentState } from './tournament';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private gameState = new BehaviorSubject<GameState | null>(null);
  private chatMessageSubject = new Subject<{ name: string; text: string; isBot: boolean }>();
  private speechSubject = new Subject<{ name: string; text: string }>();
  private confettiSubject = new Subject<void>();

  private botTimer: any = null;
  private waitingForDraw: boolean = false;
  private confettiTriggered: boolean = false;
  public isProcessing: boolean = false;
  public isTournamentMode: boolean = false;
  private playedCards: Card[] = [];
  private swapTargetPlayerId: string | null = null;
  private drawAnimationSubject = new Subject<void>();
  private isPaused: boolean = false;
  private peekChooseSubject = new Subject<{ playerName: string; hand: Card[] }>();
  private swapAnimationSubject = new Subject<{ fromPlayer: string; toPlayer: string }>();
  private peekedHands: Map<string, { hand: Card[], timestamp: number }> = new Map();

  private swapRequestSubject = new Subject<{ fromPlayer: string; targetPlayer: string; callback: () => void }>();
  private peekRequestSubject = new Subject<{ playerName: string; hand: Card[] }>();

  private roundResultSubject = new Subject<{ winnerName: string; position: string; eliminatedName?: string; losers?: string[] }>();
  roundResult$ = this.roundResultSubject.asObservable();

  private tournamentWinnerSubject = new Subject<{ winnerName: string; position: string; eliminatedName?: string; losers?: string[] }>();
  tournamentWinner$ = this.tournamentWinnerSubject.asObservable();

  private tournamentWinnerSub: Subscription | null = null;

  constructor(
    private deckService: DeckService,
    private rankingService: RankingService,
    private tournamentService: TournamentService
  ) {
    console.log('🟢 GameService CONSTRUTOR chamado - INSTÂNCIA ÚNICA?');

this.tournamentWinnerSub = this.tournamentWinner$.subscribe(
  (data: { winnerName: string; position: string; eliminatedName?: string; losers?: string[] }) => {
    const tournamentState = this.tournamentService.getTournamentStateValue();
    if (!tournamentState) {
      console.log('🔴 Nenhum torneio ativo, ignorando resultado');
      return;
    }

    // ✅ VERIFICA SE O TORNEIO JÁ ACABOU
    if (!tournamentState.isActive) {
      console.log('🔴 Torneio já finalizado, ignorando resultado');
      return;
    }

    console.log('🔥 GameService processando resultado do torneio:', data);
    console.log('🔥 [tournamentWinnerSub] data.losers:', data.losers);

    this.tournamentService.registerRoundResult(
      data.winnerName,
      data.eliminatedName || null,
      tournamentState.currentRound,
      `${data.winnerName} venceu a rodada`,
      data.losers || []
    );

    const activePlayers = tournamentState.players.filter(p => !p.eliminated);
    console.log('🔴 activePlayers:', activePlayers.map(p => p.name));

    if (activePlayers.length <= 1) {
      const champion = activePlayers[0];
      if (champion) {
        champion.position = 1;
        champion.group = 'champion';
        tournamentState.winner = champion;
        tournamentState.isActive = false;
        console.log('🏆 CAMPEÃO:', champion.name);

        const allPlayers = tournamentState.players.map(p => p.name);
        this.rankingService.updateRanking(allPlayers, champion.name);
      }
    } else {
      const nextPlayers = this.tournamentService.getNextMatchPlayers();
      console.log('🔴 Próximos jogadores:', nextPlayers);

      if (nextPlayers.length >= 2) {
        setTimeout(() => {
          this.initializeGame(nextPlayers, true);
        }, 2000);
      }
    }
  }
);
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

  getSwapAnimation(): Observable<{ fromPlayer: string; toPlayer: string }> {
    return this.swapAnimationSubject.asObservable();
  }

  getConfetti(): Observable<void> {
    return this.confettiSubject.asObservable();
  }

  getSwapRequests(): Observable<{ fromPlayer: string; targetPlayer: string; callback: () => void }> {
    return this.swapRequestSubject.asObservable();
  }

  getPeekRequests(): Observable<{ playerName: string; hand: Card[] }> {
    return this.peekRequestSubject.asObservable();
  }

  getDrawAnimation(): Observable<void> {
    return this.drawAnimationSubject.asObservable();
  }

  getCurrentGameState(): GameState | null {
    return this.gameState.getValue();
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
    if (card.value === 'swap') return 'TROCAR';
    if (card.value === 'peek') return 'OLHAR';
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

  private cleanOldPeekData(): void {
    const now = Date.now();
    for (const [key, value] of this.peekedHands) {
      if (now - value.timestamp > 30000) {
        this.peekedHands.delete(key);
      }
    }
  }

  showRoundResult(winnerName: string, position: string, eliminatedName?: string): void {
    console.log('📢 GameService.showRoundResult chamado:', { winnerName, position, eliminatedName });
    this.roundResultSubject.next({ winnerName, position, eliminatedName });
  }

notifyTournamentWinner(winnerName: string, position: string, eliminatedName?: string, losers?: string[]): void {
  console.log('📢 [notifyTournamentWinner] recebeu losers:', losers);
  this.tournamentWinnerSubject.next({ winnerName, position, eliminatedName, losers });
}
  confirmSwap(targetPlayerId: string): void {
    const state = this.gameState.getValue();
    if (!state) return;

    const currentPlayer = state.players[state.currentPlayerIndex];
    const targetPlayer = state.players.find(p => p.id === targetPlayerId);

    if (!currentPlayer || !targetPlayer) return;

    if (currentPlayer.hand.length === 1 && currentPlayer.hand[0]?.value === 'swap') {
      this.addChatMessage(currentPlayer.name, 'NÃO PODE GANHAR COM CARTA DE TROCA! COMPRE UMA CARTA!', !currentPlayer.isHuman);
      if (!currentPlayer.isHuman) {
        const swapBlockMessages = ['NÃO POSSO GANHAR COM TROCA?', 'QUE INJUSTO!', 'TIVE QUE COMPRAR...'];
        const msg = swapBlockMessages[Math.floor(Math.random() * swapBlockMessages.length)];
        this.addSpeech(currentPlayer.name, msg);
      }
      this.isProcessing = false;
      this.isPaused = false;
      this.gameState.next(state);
      this.triggerBotIfNeeded();
      return;
    }

    if (currentPlayer.hand.length === 0) {
      this.finishGame(currentPlayer, state);
      return;
    }

    const tempHand = currentPlayer.hand;
    currentPlayer.hand = targetPlayer.hand;
    targetPlayer.hand = tempHand;

    this.addChatMessage(currentPlayer.name, `TROCOU DE MÃO COM ${targetPlayer.name.toUpperCase()}!`, !currentPlayer.isHuman);

    if (!currentPlayer.isHuman) {
      const swapMessages = ['TROQUEI DE MÃO!', 'AGORA MINHA MÃO É MELHOR!', 'BOA TROCA!'];
      const msg = swapMessages[Math.floor(Math.random() * swapMessages.length)];
      this.addSpeech(currentPlayer.name, msg);
    }

    this.updateUnoStatus(currentPlayer, !currentPlayer.isHuman);
    this.updateUnoStatus(targetPlayer, !targetPlayer.isHuman);

    this.isProcessing = true;
    this.isPaused = true;

    this.swapAnimationSubject.next({
      fromPlayer: currentPlayer.name,
      toPlayer: targetPlayer.name
    });

    this.gameState.next(state);
  }

initializeGame(playerNames: string[], isTournament: boolean = false): void {
  this.isTournamentMode = isTournament;
  this.confettiTriggered = false;
  this.isProcessing = false;
  this.isPaused = false;
  this.playedCards = [];
  this.peekedHands.clear();
  const fullDeck = this.deckService.createDeck();

  let observerNames: string[] = [];
  let allPlayerNames: string[] = [];

if (isTournament) {
  const tournamentState = this.tournamentService.getTournamentStateValue();
  if (tournamentState) {
    // ✅ TODOS OS JOGADORES (INCLUINDO ELIMINADOS) - PARA EXIBIÇÃO
    allPlayerNames = tournamentState.players.map(p => p.name);

    // ✅ OBSERVADORES = TODOS QUE NÃO ESTÃO NA LISTA DE JOGADORES ATIVOS
    // Isso inclui: winners classificados + eliminados
    observerNames = tournamentState.players
      .filter(p => {
        // Se está na lista de jogadores ativos, NÃO é observador
        if (playerNames.includes(p.name)) return false;
        // Se está eliminado ou é winner, é observador
        return p.eliminated || p.group === 'winners';
      })
      .map(p => p.name);
  }
} else {
    allPlayerNames = playerNames;
  }

  // ✅ CRIAR TODOS OS JOGADORES (NÃO ELIMINADOS)
  const players: Player[] = allPlayerNames.map((name, index) => ({
    id: `player-${index}`,
    name: name,
    hand: [],
    isHuman: index === 0 && !observerNames.includes(name),
    isUno: false,
    score: 0,
    isObserver: observerNames.includes(name)
  }));

  // ✅ MANTER ORDEM FIXA
  const fixedOrder = ['Mãe', 'Lucia', 'Hanna', 'Pedro'];
  players.sort((a, b) => {
    const indexA = fixedOrder.indexOf(a.name);
    const indexB = fixedOrder.indexOf(b.name);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  const drawPile = [...fullDeck];
  const discardPile: Card[] = [];

  let firstCard = this.deckService.drawCards(drawPile, 1)[0];
  while (firstCard.color === 'wild') {
    drawPile.push(firstCard);
    firstCard = this.deckService.drawCards(drawPile, 1)[0];
  }
  discardPile.push(firstCard);

  // ✅ SÓ DAR CARTAS PARA QUEM NÃO É OBSERVADOR
  players.forEach(player => {
    if (!player.isObserver) {
      player.hand = this.deckService.drawCards(drawPile, 7);
    } else {
      player.hand = [];
    }
  });

  // ✅ ENCONTRAR PRIMEIRO JOGADOR NÃO OBSERVADOR
  let firstPlayerIndex = players.findIndex(p => !p.isObserver);
  if (firstPlayerIndex === -1) firstPlayerIndex = 0;

  const state: GameState = {
    players: players,
    currentPlayerIndex: firstPlayerIndex,
    discardPile: discardPile,
    drawPile: drawPile,
    currentColor: firstCard.color,
    currentValue: firstCard.value,
    direction: 1,
    isGameOver: false,
    winner: null,
    mustDraw: 0,
    observers: observerNames
  };

  this.waitingForDraw = false;
  this.gameState.next(state);

  setTimeout(() => {
    console.log('🟢 JOGO INICIADO! isTournamentMode:', this.isTournamentMode);
    console.log('📊 players:', state.players.map(p => ({ name: p.name, isObserver: p.isObserver })));
    console.log('📊 observers:', observerNames);
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

  confirmPeek(targetPlayerId: string): void {
    const state = this.gameState.getValue();
    if (!state) return;

    const currentPlayer = state.players[state.currentPlayerIndex];
    const targetPlayer = state.players.find(p => p.id === targetPlayerId);

    if (!currentPlayer || !targetPlayer) return;

    this.addChatMessage(currentPlayer.name, `OLHOU A MÃO DE ${targetPlayer.name.toUpperCase()}!`, !currentPlayer.isHuman);

    this.peekedHands.set(targetPlayer.name, {
      hand: [...targetPlayer.hand],
      timestamp: Date.now()
    });

    this.peekRequestSubject.next({
      playerName: targetPlayer.name,
      hand: [...targetPlayer.hand]
    });

    if (!targetPlayer.isHuman) {
      const peekMessages = ['ALGUÉM OLHOU MINHA MÃO!', 'QUE INVASÃO!', 'TÔ SENDO VIGIADO!'];
      const msg = peekMessages[Math.floor(Math.random() * peekMessages.length)];
      this.addSpeech(targetPlayer.name, msg);
    }

    this.gameState.next(state);
    this.isPaused = true;
    this.isProcessing = true;
  }

  private finishGame(winner: Player, state: GameState): void {
  console.log('🟢 JOGO TERMINOU! Vencedor:', winner.name);
  state.isGameOver = true;
  state.winner = winner;

  if (this.isTournamentMode) {
    state.observers.push(winner.name);  // ❌ SÓ O VENCEDOR DEVE SER OBSERVADOR

    // ✅ IDENTIFICA OS PERDEDORES (jogadores ativos que não são observadores)
    const losers = state.players
      .filter(p => p.id !== winner.id && !p.isObserver)
      .map(p => p.name);

    console.log('📊 Perdedores:', losers);

    const tournamentState = this.tournamentService.getTournamentStateValue();
    const currentRound = tournamentState?.currentRound || 1;

    // ✅ SÓ ELIMINA NAS RODADAS 3 e 5
    const shouldEliminate = currentRound === 3 || currentRound === 5;

    let eliminatedName: string | undefined = undefined;

    if (shouldEliminate) {
      // Elimina o jogador com mais cartas entre os perdedores
      let maxCards = -1;
      losers.forEach(name => {
        const player = state.players.find(p => p.name === name);
        if (player && player.hand.length > maxCards) {
          maxCards = player.hand.length;
          eliminatedName = name;
        }
      });
    }

console.log('📢 [finishGame] Emitindo roundResultSubject com losers:', losers);
this.roundResultSubject.next({
  winnerName: winner.name,
  position: 'CLASSIFICADO',
  eliminatedName: eliminatedName,
  losers: losers
});

    console.log('📢 Torneio - Vencedor:', winner.name, 'Eliminado:', eliminatedName || 'NENHUM', 'Perdedores:', losers);
  } else {
    this.roundResultSubject.next({ winnerName: winner.name, position: 'CLASSIFICADO' });
  }

  this.addChatMessage(winner.name, '🏆 VENCEU! 🏆', !winner.isHuman);
  if (!winner.isHuman) {
    const winMessages = ['VENCEU! SOU O MELHOR!', 'MAIS UMA VITÓRIA!', 'NINGUÉM ME SEGURA!', 'VITÓRIA CERTA!'];
    const msg = winMessages[Math.floor(Math.random() * winMessages.length)];
    this.addSpeech(winner.name, msg);
  }

  this.triggerConfetti();
  const playerNames = state.players.map(p => p.name);
  this.rankingService.updateRanking(playerNames, winner.name);
  this.gameState.next(state);

  if (this.botTimer) {
    clearTimeout(this.botTimer);
    this.botTimer = null;
  }
  this.isProcessing = false;
  this.isPaused = false;
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

    if (card.value === 'swap' && player.hand.length === 1) {
      this.addChatMessage(player.name, 'NÃO PODE GANHAR COM CARTA DE TROCA! COMPRE UMA CARTA!', !player.isHuman);
      if (!player.isHuman) {
        const swapBlockMessages = ['NÃO POSSO GANHAR COM TROCA?', 'QUE INJUSTO!', 'TIVE QUE COMPRAR...'];
        const msg = swapBlockMessages[Math.floor(Math.random() * swapBlockMessages.length)];
        this.addSpeech(player.name, msg);
      }
      this.isProcessing = false;
      return false;
    }

    this.waitingForDraw = false;
    player.hand.splice(cardIndex, 1);
    state.discardPile.push(card);
    this.playedCards.push(card);

    this.updateUnoStatus(player, !player.isHuman);

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

    if (player.hand.length === 0) {
      this.finishGame(player, state);
      return true;
    }

    if (card.value === 'skip') {
      this.addChatMessage(player.name, 'PULOU O PRÓXIMO!', !player.isHuman);
      const nextPlayer = state.players[(state.currentPlayerIndex + state.direction + state.players.length) % state.players.length];
      if (nextPlayer && !nextPlayer.isHuman) {
        const skipMessages = ['AF ME PULOU', 'QUE FDP!', 'AH NÂO NÉ!', 'DEIXEM EU JOGAR!'];
        const msg = skipMessages[Math.floor(Math.random() * skipMessages.length)];
        this.addSpeech(nextPlayer.name, msg);
      }
      this.nextTurn(state);
      this.nextTurn(state);
    } else if (card.value === 'reverse') {
      this.addChatMessage(player.name, 'INVERTEU O SENTIDO!', !player.isHuman);
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
            this.drawAnimationSubject.next();
          }
        }
        this.updateUnoStatus(nextPlayer, !nextPlayer.isHuman);

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
            this.drawAnimationSubject.next();
          }
        }
        this.updateUnoStatus(nextPlayer, !nextPlayer.isHuman);

        this.addChatMessage(player.name, `DEU +4 EM ${nextPlayer.name}`, !player.isHuman);
        if (!nextPlayer.isHuman) {
          const draw4Messages = ['+4!? INJUSTO!', 'ISSO É CRUEL!', '+4?! TÔ FORA!', 'RANÇOOO', 'QUE ÓDIO!'];
          const msg = draw4Messages[Math.floor(Math.random() * draw4Messages.length)];
          this.addSpeech(nextPlayer.name, msg);
        }
      }
      this.nextTurn(state);
    } else if (card.value === 'swap') {
      this.addChatMessage(player.name, 'USOU TROCA DE MÃOS!', !player.isHuman);
      this.isPaused = true;

      if (player.hand.length === 0) {
        this.finishGame(player, state);
        return true;
      }

      if (player.isHuman) {
        this.isProcessing = true;
        this.gameState.next(state);
        return true;
      } else {
        // ✅ FILTRAR OBSERVADORES PARA O SWAP DO BOT
        const otherPlayers = state.players.filter(p => p.id !== player.id && !p.isObserver);

        // Se não houver outros jogadores ativos, o bot não pode usar SWAP
        if (otherPlayers.length === 0) {
          this.addChatMessage(player.name, 'NÃO HÁ JOGADORES DISPONÍVEIS PARA TROCAR!', true);
          this.isProcessing = false;
          this.isPaused = false;
          this.gameState.next(state);
          this.triggerBotIfNeeded();
          return true;
        }

        let targetPlayer: Player | null = null;
        const random = Math.random();

        const playersInUno = otherPlayers.filter(p => p.hand.length === 1);
        if (playersInUno.length > 0 && random < 0.7) {
          targetPlayer = playersInUno[Math.floor(Math.random() * playersInUno.length)];
        } else {
          const sortedByCards = [...otherPlayers].sort((a, b) => a.hand.length - b.hand.length);
          const minCards = sortedByCards[0]?.hand.length || 0;
          const maxCards = [...otherPlayers].sort((a, b) => b.hand.length - a.hand.length)[0]?.hand.length || 0;

          const playersWithMinCards = otherPlayers.filter(p => p.hand.length === minCards);
          const playersWithMaxCards = otherPlayers.filter(p => p.hand.length === maxCards);

          if (player.hand.length > 5 && random < 0.5) {
            targetPlayer = playersWithMaxCards[Math.floor(Math.random() * playersWithMaxCards.length)];
          } else if (player.hand.length <= 3 && random < 0.5) {
            targetPlayer = playersWithMinCards[Math.floor(Math.random() * playersWithMinCards.length)];
          } else if (player.hand.length === 1) {
            targetPlayer = playersWithMaxCards[Math.floor(Math.random() * playersWithMaxCards.length)];
          } else {
            targetPlayer = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
          }
        }

        if (!targetPlayer) {
          targetPlayer = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
        }

        if (targetPlayer) {
          if (targetPlayer.isHuman) {
            this.swapRequestSubject.next({
              fromPlayer: player.name,
              targetPlayer: targetPlayer.name,
              callback: () => {
                this.confirmSwap(targetPlayer.id);
              }
            });
            this.isProcessing = false;
            this.gameState.next(state);
            return true;
          } else {
            const tempHand = player.hand;
            player.hand = targetPlayer.hand;
            targetPlayer.hand = tempHand;
            this.addChatMessage(player.name, `TROCOU DE MÃO COM ${targetPlayer.name.toUpperCase()}!`, true);
            this.updateUnoStatus(player, true);
            this.updateUnoStatus(targetPlayer, true);
            this.isPaused = true;
            this.isProcessing = true;
            this.swapAnimationSubject.next({
              fromPlayer: player.name,
              toPlayer: targetPlayer.name
            });
          }
        }
      }
    } else if (card.value === 'peek') {
      this.addChatMessage(player.name, 'USOU OLHAR!', !player.isHuman);
      this.isPaused = true;
      this.isProcessing = true;

      if (player.isHuman) {
        this.gameState.next(state);
        return true;
      } else {
        let targetPlayer: Player | null = null;
        const otherPlayers = state.players.filter(p => p.id !== player.id && !p.isObserver);

        const playersInUno = otherPlayers.filter(p => p.hand.length === 1);
        if (playersInUno.length > 0) {
          const unoNotPeeked = playersInUno.filter(p => !this.peekedHands.has(p.name) ||
            Date.now() - (this.peekedHands.get(p.name)?.timestamp || 0) > 15000);
          if (unoNotPeeked.length > 0) {
            targetPlayer = unoNotPeeked[Math.floor(Math.random() * unoNotPeeked.length)];
          } else {
            targetPlayer = playersInUno[Math.floor(Math.random() * playersInUno.length)];
          }
        }

        if (!targetPlayer) {
          const playersWithFewCards = otherPlayers.filter(p => p.hand.length >= 2 && p.hand.length <= 3);
          const fewNotPeeked = playersWithFewCards.filter(p => !this.peekedHands.has(p.name) ||
            Date.now() - (this.peekedHands.get(p.name)?.timestamp || 0) > 15000);
          if (fewNotPeeked.length > 0) {
            targetPlayer = fewNotPeeked[Math.floor(Math.random() * fewNotPeeked.length)];
          } else if (playersWithFewCards.length > 0) {
            targetPlayer = playersWithFewCards[Math.floor(Math.random() * playersWithFewCards.length)];
          }
        }

        if (!targetPlayer) {
          const playersWithoutPeekData = otherPlayers.filter(p => !this.peekedHands.has(p.name));
          if (playersWithoutPeekData.length > 0) {
            targetPlayer = playersWithoutPeekData[Math.floor(Math.random() * playersWithoutPeekData.length)];
          }
        }

        if (!targetPlayer) {
          const playersWithOldData = otherPlayers.filter(p => {
            const data = this.peekedHands.get(p.name);
            return data && Date.now() - data.timestamp > 30000;
          });
          if (playersWithOldData.length > 0) {
            targetPlayer = playersWithOldData[Math.floor(Math.random() * playersWithOldData.length)];
          } else {
            targetPlayer = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
          }
        }

        if (targetPlayer) {
          this.peekedHands.set(targetPlayer.name, {
            hand: [...targetPlayer.hand],
            timestamp: Date.now()
          });

          this.addChatMessage(player.name, `OLHOU A MÃO DE ${targetPlayer.name.toUpperCase()}!`, !player.isHuman);

          this.peekRequestSubject.next({
            playerName: targetPlayer.name,
            hand: [...targetPlayer.hand]
          });

          if (!targetPlayer.isHuman) {
            const peekMessages = ['ALGUÉM OLHOU MINHA MÃO!', 'QUE INVASÃO!', 'TÔ SENDO VIGIADO!'];
            const msg = peekMessages[Math.floor(Math.random() * peekMessages.length)];
            this.addSpeech(targetPlayer.name, msg);
          }
        }
        this.gameState.next(state);
        return true;
      }
    } else {
      if (!state.isGameOver) {
        this.nextTurn(state);
      }
    }

    this.gameState.next(state);
    this.isProcessing = false;
    if (!this.isPaused) {
      this.triggerBotIfNeeded();
    }
    return true;
  }

  resumeAfterSwap(): void {
    this.isPaused = false;
    this.isProcessing = false;
    const state = this.gameState.getValue();
    if (state && !state.isGameOver) {
      this.nextTurn(state);
      this.gameState.next(state);
      this.triggerBotIfNeeded();
    }
  }

  resumeAfterPeek(): void {
    this.isPaused = false;
    this.isProcessing = false;
    const state = this.gameState.getValue();
    if (state && !state.isGameOver) {
      this.nextTurn(state);
      this.gameState.next(state);
      this.triggerBotIfNeeded();
    }
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

  public isValidPlay(card: Card, state: GameState): boolean {
    if (card.color === 'wild') return true;
    if (card.color === state.currentColor) return true;
    if (card.value === state.currentValue) return true;
    if (card.value === 'peek' && card.color === state.currentColor) return true;
    if (card.value === 'swap' && card.color === state.currentColor) return true;
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
  // Avança para o próximo jogador
  state.currentPlayerIndex = (state.currentPlayerIndex + state.direction + state.players.length) % state.players.length;
  state.mustDraw = 0;
  this.waitingForDraw = false;

  // ✅ PULAR OBSERVADORES COM LIMITE
  let attempts = 0;
  const maxAttempts = state.players.length;
  while (state.players[state.currentPlayerIndex]?.isObserver && attempts < maxAttempts) {
    console.log(`⏭️ Pulando observador (nextTurn): ${state.players[state.currentPlayerIndex]?.name}`);
    state.currentPlayerIndex = (state.currentPlayerIndex + state.direction + state.players.length) % state.players.length;
    attempts++;
  }

  // ✅ SE PULOU TODOS, NÃO HÁ JOGADORES ATIVOS
  if (attempts >= maxAttempts) {
    console.log('⚠️ Nenhum jogador ativo encontrado em nextTurn!');
  }
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
      this.drawAnimationSubject.next();
      this.waitingForDraw = true;
      this.addChatMessage(player.name, 'COMPROU UMA CARTA', !player.isHuman);

      this.updateUnoStatus(player, !player.isHuman);
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
          this.addChatMessage(player.name, 'COMPROU MAS NÃO PODE JOGAR', !player.isHuman);
        }
        this.waitingForDraw = false;
        this.nextTurn(state);
        this.gameState.next(state);
        this.isProcessing = false;
        this.triggerBotIfNeeded();
        return true;
      }
    } else {
      this.addChatMessage(player.name, 'NÃO CONSEGUIU COMPRAR', !player.isHuman);
      this.waitingForDraw = false;
      this.nextTurn(state);
      this.gameState.next(state);
      this.isProcessing = false;
      this.triggerBotIfNeeded();
      return false;
    }
  }

public triggerBotIfNeeded(): void {
  if (this.isPaused) {
    return;
  }

  if (this.isProcessing) {
    return;
  }

  if (this.botTimer) {
    clearTimeout(this.botTimer);
    this.botTimer = null;
  }

  const state = this.gameState.getValue();
  if (!state || state.isGameOver) {
    return;
  }

  // ✅ LIMITAR PULOS PARA EVITAR LOOP INFINITO
  let skipCount = 0;
  const maxSkips = state.players.length + 1;

  let currentPlayer = state.players[state.currentPlayerIndex];
  while (currentPlayer?.isObserver && skipCount < maxSkips) {
    console.log(`⏭️ Pulando observador (triggerBot): ${currentPlayer.name}`);
    this.nextTurn(state);
    currentPlayer = state.players[state.currentPlayerIndex];
    skipCount++;
  }

  // ✅ SE PULOU TODOS OS JOGADORES, SIGNIFICA QUE NINGUÉM PODE JOGAR
  if (skipCount >= maxSkips) {
    console.log('⚠️ Nenhum jogador ativo encontrado!');
    return;
  }

  // ✅ ATUALIZAR O ESTADO APÓS OS PULOS
  this.gameState.next(state);

  // ✅ VERIFICAR SE O JOGO ACABOU
  if (state.isGameOver) {
    return;
  }

  currentPlayer = state.players[state.currentPlayerIndex];
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

    if (currentPlayer.hand.length === 1 && currentPlayer.hand[0]?.value === 'swap') {
      const swapBlockMessages = ['NÃO POSSO GANHAR COM TROCA?', 'QUE INJUSTO!', 'TIVE QUE COMPRAR...'];
      const msg = swapBlockMessages[Math.floor(Math.random() * swapBlockMessages.length)];
      this.addSpeech(currentPlayer.name, msg);
      this.drawCard(currentPlayer.id);
      return;
    }

    this.cleanOldPeekData();

    const playableCards = currentPlayer.hand
      .map((card, index) => ({ card, index }))
      .filter(({ card }) => this.isValidPlay(card, state));

    if (playableCards.length === 0) {
      this.drawCard(currentPlayer.id);
      return;
    }

    const nextPlayerIndex = (state.currentPlayerIndex + state.direction + state.players.length) % state.players.length;
    const nextPlayer = state.players[nextPlayerIndex];

    const playersInUno = state.players.filter(p =>
      p.hand.length === 1 && p.id !== currentPlayer.id && !p.isObserver
    );

    const playersWithFewCards = state.players
      .filter(p =>
        p.hand.length >= 2 && p.hand.length <= 3 && p.id !== currentPlayer.id && !p.isObserver
      )
      .sort((a, b) => a.hand.length - b.hand.length);

    let targetPlayer: Player | null = null;

    if (playersInUno.length > 0) {
      targetPlayer = playersInUno[0];
    } else if (playersWithFewCards.length > 0) {
      targetPlayer = playersWithFewCards[0];
    }

    const peekCard = playableCards.find(({ card }) => card.value === 'peek');
    if (peekCard && targetPlayer) {
      const peekedData = this.peekedHands.get(targetPlayer.name);
      if (!peekedData || Date.now() - peekedData.timestamp > 15000) {
        this.executeBotPlay(currentPlayer, peekCard.index, undefined);
        return;
      }
    }

    const peekedData = this.peekedHands.get(nextPlayer?.name || '');

    if (peekedData && nextPlayer) {
      const peekedHand = peekedData.hand;

      const colorCount: { [key: string]: number } = { red: 0, blue: 0, green: 0, yellow: 0 };
      peekedHand.forEach(c => {
        if (c.color !== 'wild' && colorCount[c.color] !== undefined) {
          colorCount[c.color]++;
        }
      });

      let mostCommonColor = 'red';
      let maxCount = 0;
      for (const color in colorCount) {
        if (colorCount[color] > maxCount) {
          maxCount = colorCount[color];
          mostCommonColor = color;
        }
      }

      if (nextPlayer.hand.length <= 3) {
        const blockCards = playableCards.filter(({ card }) =>
          card.value === 'draw2' || card.value === 'wild_draw_four' || card.value === 'skip'
        );
        if (blockCards.length > 0) {
          this.executeBotPlay(currentPlayer, blockCards[0].index, undefined);
          return;
        }

        const cardsNotInColor = playableCards.filter(({ card }) =>
          card.color !== mostCommonColor && card.color !== 'wild'
        );
        if (cardsNotInColor.length > 0) {
          this.executeBotPlay(currentPlayer, cardsNotInColor[0].index, undefined);
          return;
        }
      }

      if (maxCount >= 3) {
        const cardsNotInColor = playableCards.filter(({ card }) =>
          card.color !== mostCommonColor && card.color !== 'wild'
        );
        if (cardsNotInColor.length > 0) {
          this.executeBotPlay(currentPlayer, cardsNotInColor[0].index, undefined);
          return;
        }
      }
    }

    let selectedCard = null;
    let selectedIndex = -1;
    let chosenColor = undefined;

    const cardCount = currentPlayer.hand.length;

    if (cardCount === 1) {
      const firstPlayable = playableCards[0];
      selectedCard = firstPlayable.card;
      selectedIndex = firstPlayable.index;
      if (selectedCard.color === 'wild') {
        chosenColor = this.getBestColorForBot(currentPlayer);
      }
      this.executeBotPlay(currentPlayer, selectedIndex, chosenColor);
      return;
    }

    if (cardCount <= 2) {
      const wildFour = playableCards.find(({ card }) => card.value === 'wild_draw_four');
      if (wildFour) {
        selectedCard = wildFour.card;
        selectedIndex = wildFour.index;
        chosenColor = this.getBestColorForBot(currentPlayer);
        this.executeBotPlay(currentPlayer, selectedIndex, chosenColor);
        return;
      }
    }

    const specialCards = playableCards.filter(({ card }) =>
      card.value === 'draw2' || card.value === 'skip' || card.value === 'reverse' ||
      card.value === 'swap' || card.value === 'peek'
    );

    specialCards.sort((a, b) => {
      const aValue = a.card.value as string;
      const bValue = b.card.value as string;
      const order: { [key: string]: number } = {
        'swap': 0,
        'peek': 1,
        'draw2': 2,
        'skip': 3,
        'reverse': 4
      };
      return (order[aValue] !== undefined ? order[aValue] : 99) - (order[bValue] !== undefined ? order[bValue] : 99);
    });

    const nextPlayerHasManyCards = nextPlayer && nextPlayer.hand.length >= 5;

    const filteredSpecials = specialCards.filter(({ card }) => {
      if (card.value === 'draw2' && nextPlayerHasManyCards) {
        return false;
      }
      return true;
    });

    if (filteredSpecials.length > 0) {
      const selected = filteredSpecials[0];
      selectedCard = selected.card;
      selectedIndex = selected.index;
      if (selectedCard.color === 'wild') {
        chosenColor = this.getBestColorForBot(currentPlayer);
      }
      this.executeBotPlay(currentPlayer, selectedIndex, chosenColor);
      return;
    }

    const wildFourCards = playableCards.filter(({ card }) => card.value === 'wild_draw_four');
    if (wildFourCards.length > 0 && cardCount >= 3) {
      const selected = wildFourCards[0];
      selectedCard = selected.card;
      selectedIndex = selected.index;
      chosenColor = this.getBestColorForBot(currentPlayer);
      this.executeBotPlay(currentPlayer, selectedIndex, chosenColor);
      return;
    }

    const wildCards = playableCards.filter(({ card }) => card.value === 'wild');
    if (wildCards.length > 0) {
      const selected = wildCards[0];
      selectedCard = selected.card;
      selectedIndex = selected.index;
      chosenColor = this.getBestColorForBot(currentPlayer);
      this.executeBotPlay(currentPlayer, selectedIndex, chosenColor);
      return;
    }

    const normalCards = playableCards.filter(({ card }) => card.color !== 'wild');

    if (normalCards.length > 0) {
      const colorCountBot: { [key: string]: number } = { red: 0, blue: 0, green: 0, yellow: 0 };
      currentPlayer.hand.forEach(c => {
        if (c.color !== 'wild' && colorCountBot[c.color] !== undefined) {
          colorCountBot[c.color]++;
        }
      });

      normalCards.sort((a, b) => {
        const colorA = a.card.color as string;
        const colorB = b.card.color as string;
        return (colorCountBot[colorB] || 0) - (colorCountBot[colorA] || 0);
      });

      const selected = normalCards[0];
      selectedCard = selected.card;
      selectedIndex = selected.index;
      this.executeBotPlay(currentPlayer, selectedIndex, undefined);
      return;
    }

    if (playableCards.length > 0) {
      const selected = playableCards[0];
      selectedCard = selected.card;
      selectedIndex = selected.index;
      if (selectedCard.color === 'wild') {
        chosenColor = this.getBestColorForBot(currentPlayer);
      }
      this.executeBotPlay(currentPlayer, selectedIndex, chosenColor);
    } else {
      this.drawCard(currentPlayer.id);
    }
  }

  private getBestColorForBot(player: Player): string {
    const colorCount: { [key: string]: number } = { red: 0, blue: 0, green: 0, yellow: 0 };

    player.hand.forEach(card => {
      if (card.color !== 'wild' && colorCount[card.color] !== undefined) {
        colorCount[card.color]++;
      }
    });

    let bestColor = 'red';
    let maxCount = 0;

    for (const color in colorCount) {
      if (colorCount[color] > maxCount) {
        maxCount = colorCount[color];
        bestColor = color;
      }
    }

    return bestColor;
  }

  private executeBotPlay(player: Player, cardIndex: number, chosenColor?: string): void {
    this.playCard(player.id, cardIndex, chosenColor);
  }

  private updateUnoStatus(player: Player, isBot: boolean): void {
    const shouldBeUno = player.hand.length === 1;

    if (shouldBeUno && !player.isUno) {
      player.isUno = true;
      this.addChatMessage(player.name, 'ESTÁ EM UNO!', isBot);
      if (!player.isHuman) {
        const unoMessages = ['UNO!', 'UNO!!!', 'CUIDADO, TÔ DE UNO!', 'QUASE LÁ!'];
        const msg = unoMessages[Math.floor(Math.random() * unoMessages.length)];
        this.addSpeech(player.name, msg);
      }
    } else if (!shouldBeUno && player.isUno) {
      player.isUno = false;
      if (isBot) {
        this.addChatMessage(player.name, 'PERDEU O UNO!', isBot);
      }
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
    this.isPaused = false;
    this.playedCards = [];
    this.peekedHands.clear();
    this.gameState.next(null);
  }

  startNextTournamentMatch(): void {
    this.resetGame();
  }
}
