import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { GameService } from '../../services/game.service';
import { GameState } from '../../models/game-state';
import { Player } from '../../models/player';
import { Card } from '../../models/card';
import { PlayerHandComponent } from '../player-hand/player-hand';
import { ColorModalComponent } from '../color-modal/color-modal';
import { TournamentService, TournamentPlayer } from '../../services/tournament';


@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, PlayerHandComponent, ColorModalComponent],
  templateUrl: './game.html',
  styleUrls: ['./game.css']
})
export class GameComponent implements OnInit, OnDestroy {
  gameState: GameState | null = null;
  private subscription: Subscription | null = null;
  private confettiSub: Subscription | null = null;
  private speechSub: Subscription | null = null;
  private swapRequestSub: Subscription | null = null;
  private peekRequestSub: Subscription | null = null;
  private drawAnimSub: Subscription | null = null;
  private swapAnimSub: Subscription | null = null;
  private roundResultSub: Subscription | null = null;
  currentPlayer: Player | null = null;
  isProcessing: boolean = false;
  showColorModal: boolean = false;
  showRulesModal: boolean = false;
  pendingCardIndex: number = -1;
  chatMessages: { name: string; text: string; isBot: boolean }[] = [];
  private hasStarted: boolean = false;
  speechMessages: { [key: string]: string } = {};

  showSwapModal: boolean = false;
  swapFromPlayer: string = '';
  swapTargetPlayer: string = '';
  private swapCallback: (() => void) | null = null;

  showPeekModal: boolean = false;
  peekPlayerName: string = '';
  peekHand: Card[] = [];
  private peekTimer: any = null;

  showSwapChooseModal: boolean = false;
  swapChooseTargets: { id: string; name: string }[] = [];
  private pendingSwapCardIndex: number = -1;

  showPeekChooseModal: boolean = false;
  peekChooseTargets: { id: string; name: string }[] = [];
  private pendingPeekCardIndex: number = -1;

  showSwapBanner: boolean = false;
  swapBannerFrom: string = '';
  swapBannerTo: string = '';
  private swapBannerTimer: any = null;

  showRoundResultModal: boolean = false;
  roundResultWinner: string = '';
  roundResultPosition: string = '';
  roundResultEliminated: string | null = null;  // ✅ NOVA VARIÁVEL
  roundResultCountdown: number = 5;
  private countdownTimer: any = null;

  showTournamentModal: boolean = false;
  tournamentRound: number = 1;
  tournamentPlayers: any[] = [];
  tournamentHistory: any[] = [];

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    public gameService: GameService,
    private tournamentService: TournamentService
  ) {}



  ngOnInit(): void {
    this.subscription = this.gameService.getGameState().subscribe(state => {
      if (!state) {
        this.router.navigate(['/']);
        return;
      }
      this.gameState = state;
      console.log('🔴 GAME STATE ATUALIZADO:', {
        players: state.players.map(p => p.name),
        playersLength: state.players.length,
        observers: state.observers,
        isGameOver: state.isGameOver
      });
      this.currentPlayer = state.players[state.currentPlayerIndex];
      this.isProcessing = false;
      this.cdr.detectChanges();

      if (state.players && state.players.length > 0 && !this.hasStarted) {
        this.hasStarted = true;

        this.addChatMessage('SISTEMA', 'JOGO INICIADO!', false);
        const currentPlayer = state.players[state.currentPlayerIndex];
        if (currentPlayer && currentPlayer.isHuman) {
          this.addChatMessage('SISTEMA', 'SUA VEZ!', false);
        } else if (currentPlayer) {
          this.addChatMessage('SISTEMA', `VEZ DE ${currentPlayer.name.toUpperCase()}!`, false);
        }

        setTimeout(() => {
          this.createConfetti();
        }, 300);
      }
    });

    this.gameService.getChatMessages().subscribe(msg => {
      this.chatMessages.push(msg);
      if (this.chatMessages.length > 50) {
        this.chatMessages.shift();
      }
      this.cdr.detectChanges();
      setTimeout(() => {
        this.scrollToBottom();
      }, 50);
    });

    this.speechSub = this.gameService.getSpeech().subscribe(speech => {
      this.speechMessages[speech.name] = speech.text;
      this.cdr.detectChanges();
      setTimeout(() => {
        this.speechMessages[speech.name] = '';
        this.cdr.detectChanges();
      }, 3000);
    });

    this.confettiSub = this.gameService.getConfetti().subscribe(() => {
      setTimeout(() => {
        this.createConfetti();
      }, 500);
    });

    this.swapRequestSub = this.gameService.getSwapRequests().subscribe(request => {
      this.swapFromPlayer = request.fromPlayer;
      this.swapTargetPlayer = request.targetPlayer;
      this.swapCallback = request.callback;
      this.showSwapModal = true;
      this.cdr.detectChanges();
    });

    this.peekRequestSub = this.gameService.getPeekRequests().subscribe(request => {
      this.peekPlayerName = request.playerName;
      this.peekHand = request.hand;
      this.showPeekModal = true;
      this.cdr.detectChanges();

      if (this.peekTimer) {
        clearTimeout(this.peekTimer);
      }

      this.peekTimer = setTimeout(() => {
        this.showPeekModal = false;
        this.peekHand = [];
        this.cdr.detectChanges();
        this.gameService.resumeAfterPeek();
      }, 2000);
    });

    this.drawAnimSub = this.gameService.getDrawAnimation().subscribe(() => {
      this.triggerDrawAnimation();
    });

    this.swapAnimSub = this.gameService.getSwapAnimation().subscribe(data => {
      this.showSwapAnimation(data.fromPlayer, data.toPlayer);
    });

    // ✅ ROUND RESULT CORRIGIDO
this.roundResultSub = this.gameService.roundResult$.subscribe(
  (data: { winnerName: string, position: string, eliminatedName?: string, losers?: string[] }) => {
    console.log('📢 [GameComponent] roundResultSub recebeu data.losers:', data.losers);
    console.log('📢 GameComponent recebeu roundResult:', data);
    if (this.gameService.isTournamentMode) {
      this.gameService.notifyTournamentWinner(
        data.winnerName,
        data.position,
        data.eliminatedName,
        data.losers  // ✅ NOVO: passa a lista de perdedores
      );
      this.showRoundResult(data.winnerName, data.position, data.eliminatedName);
    } else {
      this.showRoundResult(data.winnerName, data.position);
    }
  }
);
  }



  private scrollToBottom(): void {
    try {
      const container = document.querySelector('.chat-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    } catch (err) { }
  }

  trackByMessage(index: number, msg: any): number {
    return index;
  }

  addChatMessage(name: string, text: string, isBot: boolean = false): void {
    this.chatMessages.push({ name, text, isBot });
    if (this.chatMessages.length > 50) {
      this.chatMessages.shift();
    }
    this.cdr.detectChanges();
    setTimeout(() => {
      this.scrollToBottom();
    }, 50);
  }

  // ✅ SHOW ROUND RESULT CORRIGIDO - REMOVEU A CHAMADA DUPLICADA
showRoundResult(winnerName: string, position: string, eliminatedName?: string): void {
  console.log('🔍 showRoundResult CHAMADO!');
  console.log('🔍 isTournamentMode:', this.gameService.isTournamentMode);
  console.log('🔍 winnerName:', winnerName);
  console.log('🔍 position:', position);
  console.log('🔍 eliminatedName:', eliminatedName);

  if (!this.gameService.isTournamentMode) {
    console.log('🔴 NÃO É TORNEIO, SAINDO');
    return;
  }

  // ✅ PAUSA O JOGO QUANDO O BANNER APARECE
  this.gameService.isProcessing = true;
  this.isProcessing = true;
  console.log('⏸️ Jogo PAUSADO durante o banner');

  this.roundResultWinner = winnerName;
  this.roundResultPosition = position;
  this.roundResultEliminated = eliminatedName || null;
  this.roundResultCountdown = 5;
  this.showRoundResultModal = true;
  console.log('🔍 showRoundResultModal:', this.showRoundResultModal);
  this.cdr.detectChanges();

  if (this.countdownTimer) {
    clearInterval(this.countdownTimer);
  }

  this.countdownTimer = setInterval(() => {
    this.roundResultCountdown--;
    this.cdr.detectChanges();
    if (this.roundResultCountdown <= 0) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
      this.closeRoundResultAndContinue();
    }
  }, 1000);
}

closeRoundResultAndContinue(): void {
  this.showRoundResultModal = false;

  this.gameService.isProcessing = false;
  this.isProcessing = false;
  console.log('▶️ Jogo DESPAUSADO após o banner');

  // ✅ VERIFICA SE O TORNEIO AINDA ESTÁ ATIVO ANTES DE CONTINUAR
  const tournamentState = this.tournamentService.getTournamentStateValue();
  if (!tournamentState || !tournamentState.isActive) {
    console.log('🔴 Torneio finalizado, redirecionando para tela de torneio');
    this.router.navigate(['/tournament']);
    return;
  }

  this.startNextTournamentMatch();
}

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.confettiSub) {
      this.confettiSub.unsubscribe();
    }
    if (this.speechSub) {
      this.speechSub.unsubscribe();
    }
    if (this.swapRequestSub) {
      this.swapRequestSub.unsubscribe();
    }
    if (this.peekRequestSub) {
      this.peekRequestSub.unsubscribe();
    }
    if (this.drawAnimSub) {
      this.drawAnimSub.unsubscribe();
    }
    if (this.swapAnimSub) {
      this.swapAnimSub.unsubscribe();
    }
    if (this.roundResultSub) {
      this.roundResultSub.unsubscribe();
    }
    if (this.peekTimer) {
      clearTimeout(this.peekTimer);
    }
    if (this.swapBannerTimer) {
      clearTimeout(this.swapBannerTimer);
    }
  }

  openRulesModal(): void {
    this.showRulesModal = true;
  }

  closeRulesModal(): void {
    this.showRulesModal = false;
  }

openTournamentModal(): void {
  const state = this.tournamentService.getTournamentStateValue();
  if (state) {

    this.tournamentRound = state.currentRound;
    this.tournamentPlayers = state.players;
    this.tournamentHistory = state.roundHistory;
  }
  this.showTournamentModal = true;
}

  closeTournamentModal(): void {
    this.showTournamentModal = false;
  }

isObserver(playerName: string | undefined): boolean {
  if (!playerName) return false;
  if (!this.gameState) return false;

  const tournamentState = this.tournamentService.getTournamentStateValue();
  if (!tournamentState) return false;

  const player = tournamentState.players.find(p => p.name === playerName);
  if (!player) return false;

  const isWinner = player.group === 'winners';
  const isEliminated = player.eliminated;
  const isCurrentlyPlaying = this.gameState.players.some(p => p.name === playerName);

  if (isCurrentlyPlaying) return false;

  return isWinner && !isEliminated;
}

// ✅ VERIFICA SE O JOGADOR FOI ELIMINADO
isEliminated(playerName: string | undefined): boolean {
  if (!playerName) return false;
  const tournamentState = this.tournamentService.getTournamentStateValue();
  if (!tournamentState) return false;
  const player = tournamentState.players.find(p => p.name === playerName);
  return player?.eliminated || false;
}

// ✅ RETORNA O STATUS DO ESPECTADOR
getSpectatorStatus(playerName: string | undefined): string {
  if (!playerName) return 'AGUARDANDO';
  const tournamentState = this.tournamentService.getTournamentStateValue();
  if (!tournamentState) return 'AGUARDANDO';
  const player = tournamentState.players.find(p => p.name === playerName);
  if (!player) return 'AGUARDANDO';

  // ✅ ELIMINADO - MOSTRA POSIÇÃO COM ÍCONE
  if (player.eliminated) {
    if (player.position === 4) return '4º LUGAR';
    if (player.position === 3) return '3º LUGAR';
    if (player.position === 2) return '2º LUGAR';
    return 'ELIMINADO';
  }

  // ✅ CLASSIFICADO
  if (player.group === 'winners' && !player.eliminated) {
    return '★ CLASSIFICADO';
  }

  // ✅ JOGANDO ATUALMENTE
  const isCurrentlyPlaying = this.gameState?.players?.some(p => p.name === playerName);
  if (isCurrentlyPlaying) return 'JOGANDO';

  return 'AGUARDANDO';
}

getObserverMessage(playerName: string | undefined): string {
  if (!playerName) return 'AGUARDANDO...';
  if (this.gameState?.winner?.name === playerName) {
    return 'VENCEU A RODADA ANTERIOR!';
  }
  return 'AGUARDANDO...';
}

  isHumanTurn(): boolean {
    if (!this.gameState || !this.currentPlayer) return false;
    return this.currentPlayer.isHuman && !this.gameState.isGameOver;
  }

  getCardColor(card: any): string {
    if (card.color === 'wild') return 'var(--neon-purple)';
    const colors: {[key: string]: string} = {
      'red': 'var(--neon-red)',
      'blue': 'var(--neon-blue)',
      'green': 'var(--neon-green)',
      'yellow': 'var(--neon-yellow)'
    };
    return colors[card.color] || 'white';
  }

  getCardDisplay(card: any): string {
    if (card.value === 'skip') return '⊘';
    if (card.value === 'reverse') return '⟳';
    if (card.value === 'draw2') return '+2';
    if (card.value === 'swap') return '⇆';
    if (card.value === 'peek') return '👁';
    if (card.value === 'wild') return '★';
    if (card.value === 'wild_draw_four') return '+4';
    return card.value.toString();
  }

  getLastCards(pile: any[], count: number): any[] {
    if (pile.length === 0) return [];
    const start = Math.max(0, pile.length - count);
    return pile.slice(start);
  }

  getDrawPileOffset(index: number): string {
    const offsets = [
      { x: -8, y: -6, r: -5 },
      { x: 6, y: -4, r: 4 },
      { x: -4, y: 8, r: -3 },
      { x: 10, y: 2, r: 6 },
      { x: -6, y: -2, r: -7 },
      { x: 4, y: 10, r: 3 },
      { x: -10, y: 4, r: -4 },
      { x: 8, y: -8, r: 5 },
      { x: -2, y: 12, r: -2 },
      { x: 12, y: -2, r: 7 },
      { x: -12, y: 6, r: -6 },
      { x: 2, y: -10, r: 2 },
      { x: -8, y: 10, r: -8 },
      { x: 6, y: 6, r: 4 },
      { x: -4, y: -8, r: -3 }
    ];

    if (index < offsets.length) {
      const o = offsets[index];
      return `translate(${o.x}px, ${o.y}px) rotate(${o.r}deg)`;
    }
    return `translate(0px, 0px) rotate(0deg)`;
  }

  getAvatarImage(name: string | undefined): string {
  if (!name) return '';
  const avatars: {[key: string]: string} = {
    'Mãe': 'avatars/mae.png',
    'Hanna': 'avatars/hanna.webp',
    'Lucia': 'avatars/lucy.avif',
    'Pedro': 'avatars/pedro.jpg',
    'Bot 1': 'avatars/hanna.webp',
    'Bot 2': 'avatars/lucy.avif',
    'Bot 3': 'avatars/pedro.jpg'
  };
  return avatars[name] || '';
}

hasImage(name: string | undefined): boolean {
  if (!name) return false;
  const namesWithImage = ['Mãe', 'Hanna', 'Lucia', 'Pedro', 'Bot 1', 'Bot 2', 'Bot 3'];
  return namesWithImage.includes(name);
}

getAvatarInitial(name: string | undefined): string {
  if (!name) return '?';
  if (name === 'Hanna') return 'H';
  if (name === 'Lucia') return 'L';
  if (name === 'Pedro') return 'P';
  if (name?.startsWith('Bot')) return 'B';
  return name?.charAt(0).toUpperCase() || '?';
}

getAvatarColor(name: string | undefined): string {
  if (!name) return 'linear-gradient(135deg, #ff2a6d, #ff0040)';
  const colors: {[key: string]: string} = {
    'Mãe': 'linear-gradient(135deg, #ff2a6d, #ff0040)',
    'Hanna': 'linear-gradient(135deg, #05d9e8, #00a2ff)',
    'Lucia': 'linear-gradient(135deg, #00ff9d, #00cc7a)',
    'Pedro': 'linear-gradient(135deg, #f9f002, #ffcc00)',
    'Bot 1': 'linear-gradient(135deg, #05d9e8, #00a2ff)',
    'Bot 2': 'linear-gradient(135deg, #00ff9d, #00cc7a)',
    'Bot 3': 'linear-gradient(135deg, #f9f002, #ffcc00)'
  };
  return colors[name] || 'linear-gradient(135deg, #ff2a6d, #ff0040)';
}

  getDiscardPileOffset(index: number): string {
    const total = this.gameState?.discardPile?.length || 0;
    const maxCards = 5;
    const startIndex = Math.max(0, total - maxCards);
    const relativeIndex = index - startIndex;

    if (relativeIndex < 0) {
      return 'translate(-50%, -50%) rotate(0deg) scale(0.7)';
    }

    const offsets = [
      { x: -4, y: -2, r: -2, s: 0.85 },
      { x: 3, y: -1, r: 1, s: 0.90 },
      { x: -2, y: 2, r: -1, s: 0.95 },
      { x: 4, y: 3, r: 2, s: 0.98 },
      { x: 0, y: 0, r: 0, s: 1 }
    ];

    const offsetIndex = Math.min(relativeIndex, offsets.length - 1);
    const o = offsets[offsetIndex];

    return `translate(calc(-50% + ${o.x}px), calc(-50% + ${o.y}px)) rotate(${o.r}deg) scale(${o.s})`;
  }

  drawCard(): void {
    if (this.isProcessing) return;
    if (this.currentPlayer && this.isHumanTurn()) {
      this.isProcessing = true;
      this.gameService.drawCard(this.currentPlayer.id);
    }
  }

playCard(cardIndex: number): void {
  if (this.isProcessing) return;
  if (this.currentPlayer && this.isHumanTurn()) {
    const card = this.currentPlayer.hand[cardIndex];

    if (!this.gameState) return;

    const isValid = this.gameService.isValidPlay(card, this.gameState);
    if (!isValid) {
      return;
    }

    if (card.color === 'wild') {
      this.pendingCardIndex = cardIndex;
      this.showColorModal = true;
      this.isProcessing = true;
      return;
    }

    if (card.value === 'swap') {
      // ✅ FILTRAR OBSERVADORES
      const targets = this.gameState?.players.filter(p =>
        p.id !== this.currentPlayer?.id && !p.isObserver
      ) || [];

      // ✅ SE NÃO HOUVER ALVOS, NÃO PODE JOGAR
      if (targets.length === 0) {
        this.addChatMessage('SISTEMA', 'NÃO HÁ JOGADORES DISPONÍVEIS PARA TROCAR!', false);
        this.isProcessing = false;
        return;
      }

      this.swapChooseTargets = targets.map(p => ({ id: p.id, name: p.name }));
      this.pendingSwapCardIndex = cardIndex;
      this.showSwapChooseModal = true;
      this.isProcessing = true;
      return;
    }

    if (card.value === 'peek') {
      // ✅ FILTRAR OBSERVADORES
      const targets = this.gameState?.players.filter(p =>
        p.id !== this.currentPlayer?.id && !p.isObserver
      ) || [];

      // ✅ SE NÃO HOUVER ALVOS, NÃO PODE JOGAR
      if (targets.length === 0) {
        this.addChatMessage('SISTEMA', 'NÃO HÁ JOGADORES DISPONÍVEIS PARA OLHAR!', false);
        this.isProcessing = false;
        return;
      }

      this.peekChooseTargets = targets.map(p => ({ id: p.id, name: p.name }));
      this.pendingPeekCardIndex = cardIndex;
      this.showPeekChooseModal = true;
      this.isProcessing = true;
      return;
    }

    this.isProcessing = true;
    const success = this.gameService.playCard(this.currentPlayer.id, cardIndex);
    if (!success) {
      this.isProcessing = false;
    }
  }
}

getPlayerByName(name: string): Player | null {
  if (!this.gameState) return null;
  return this.gameState.players.find(p => p.name === name) || null;
}

getPlayerIndex(name: string): number {
  if (!this.gameState) return -1;
  return this.gameState.players.findIndex(p => p.name === name);
}

  onSwapChoose(targetId: string): void {
    this.showSwapChooseModal = false;
    if (this.currentPlayer && this.pendingSwapCardIndex >= 0) {
      this.isProcessing = true;
      const cardIndex = this.pendingSwapCardIndex;
      this.pendingSwapCardIndex = -1;

      this.gameService.playCard(this.currentPlayer.id, cardIndex);

      setTimeout(() => {
        this.gameService.confirmSwap(targetId);
      }, 200);
    }
  }

  onSwapChooseClose(): void {
    this.showSwapChooseModal = false;
    this.pendingSwapCardIndex = -1;
    this.isProcessing = false;
  }

  onSwapConfirm(): void {
    this.showSwapModal = false;
    if (this.swapCallback) {
      this.swapCallback();
      this.swapCallback = null;
    }
  }

  onSwapCancel(): void {
    this.showSwapModal = false;
  }

  onPeekChoose(targetId: string): void {
    this.showPeekChooseModal = false;
    if (this.currentPlayer && this.pendingPeekCardIndex >= 0) {
      this.isProcessing = true;
      const cardIndex = this.pendingPeekCardIndex;
      this.pendingPeekCardIndex = -1;

      this.gameService.playCard(this.currentPlayer.id, cardIndex);

      setTimeout(() => {
        this.gameService.confirmPeek(targetId);
      }, 200);
    }
  }

  onPeekChooseClose(): void {
    this.showPeekChooseModal = false;
    this.pendingPeekCardIndex = -1;
    this.isProcessing = false;
  }

  onColorSelected(color: string): void {
    this.showColorModal = false;
    if (this.currentPlayer && this.pendingCardIndex >= 0) {
      const success = this.gameService.playCard(this.currentPlayer.id, this.pendingCardIndex, color);
      this.pendingCardIndex = -1;
      if (!success) {
        this.isProcessing = false;
      }
    }
  }

  isWildCardWithColor(card: any, color: string): boolean {
    if (card.color !== 'wild') return false;
    return (card as any).chosenColor === color;
  }

  onModalClose(): void {
    this.showColorModal = false;
    this.pendingCardIndex = -1;
    this.isProcessing = false;
  }

  goHome(): void {
    this.gameService.resetGame();
    this.router.navigate(['/']);
  }

  getCardClass(card: any): string {
    if (card.color === 'red') return 'vermelho';
    if (card.color === 'green') return 'verde';
    if (card.color === 'blue') return 'azul';
    if (card.color === 'yellow') return 'amarelo';
    if (card.color === 'wild') return 'preto';
    return '';
  }

  triggerDrawAnimation(): void {
    const pileCards = document.querySelectorAll('.draw-pile-wrapper .pile-card');
    pileCards.forEach((card) => {
      card.classList.add('pile-card-draw');
      setTimeout(() => {
        card.classList.remove('pile-card-draw');
      }, 250);
    });
  }

  showSwapAnimation(fromPlayer: string, toPlayer: string): void {
    if (this.swapBannerTimer) {
      clearTimeout(this.swapBannerTimer);
    }

    this.swapBannerFrom = fromPlayer;
    this.swapBannerTo = toPlayer;
    this.showSwapBanner = true;
    this.isProcessing = true;
    this.gameService.isProcessing = true;
    this.cdr.detectChanges();

    setTimeout(() => {
      const banner = document.querySelector('.swap-animation-banner');
      if (banner) {
        banner.classList.add('show');
      }
    }, 50);

    this.swapBannerTimer = setTimeout(() => {
      const banner = document.querySelector('.swap-animation-banner');
      if (banner) {
        banner.classList.remove('show');
      }
      setTimeout(() => {
        this.showSwapBanner = false;
        this.isProcessing = false;
        this.gameService.isProcessing = false;
        this.gameService.resumeAfterSwap();
        this.cdr.detectChanges();
      }, 500);
    }, 2000);
  }

  onGameOver(): void {
    if (this.gameService.isTournamentMode) {
      this.router.navigate(['/tournament']);
    } else {
      this.router.navigate(['/']);
    }
  }

  getSortedTournamentPlayers(): any[] {
  if (!this.tournamentPlayers || this.tournamentPlayers.length === 0) return [];

  return [...this.tournamentPlayers].sort((a, b) => {
    if (a.position && b.position) {
      return a.position - b.position;
    }
    if (a.position && !b.position) return -1;
    if (!a.position && b.position) return 1;

    if (!a.eliminated && b.eliminated) return -1;
    if (a.eliminated && !b.eliminated) return 1;

    return a.name.localeCompare(b.name);
  });
}

getTournamentRoundLabel(): string {
  const tournamentState = this.tournamentService.getTournamentStateValue();
  if (!tournamentState) return '';

  const currentRound = tournamentState.currentRound;

  const labels: { [key: number]: string } = {
    1: 'RODADA 1',
    2: 'RODADA 2',
    3: 'RODADA 3 - 4º LUGAR',
    4: 'RODADA 4',
    5: 'RODADA 5 - 3º LUGAR',
    6: 'RODADA 6 - FINAL'
  };

  if (currentRound > 6) {
    return 'FINALIZADO';
  }

  return labels[currentRound] || `RODADA ${currentRound}`;
}

startNextTournamentMatch(): void {
  const tournamentState = this.tournamentService.getTournamentStateValue();
  if (!tournamentState) {
    this.router.navigate(['/']);
    return;
  }

  const nextPlayers = this.tournamentService.getNextMatchPlayers();
  const phase = tournamentState.currentPhase;

  console.log('🔴 startNextTournamentMatch:');
  console.log('  phase:', phase);
  console.log('  nextPlayers:', nextPlayers);

  // ✅ FASE 5 - FINAL (RODADA 6)
  if (phase === 5) {
    const activePlayers = nextPlayers;
    console.log('  activePlayers (FINAL):', activePlayers);

    if (activePlayers.length >= 2) {
      this.gameService.initializeGame(activePlayers, true);
      this.router.navigate(['/game']);
    } else {
      const champion = tournamentState.players.find(p => p.name === activePlayers[0]);
      if (champion) {
        champion.position = 1;
        champion.group = 'champion';
        tournamentState.winner = champion;
        tournamentState.isActive = false;
        console.log(`🏆 ${champion.name} É O CAMPEÃO DO TORNEIO!`);
        this.tournamentService.saveTournamentHistory();
        this.router.navigate(['/tournament']);
      }
    }
    return;
  }

  // ✅ FASE 4 - DISPUTA DO 3º LUGAR (RODADA 5)
  if (phase === 4) {
    const activePlayers = nextPlayers;
    console.log('  activePlayers (3º LUGAR):', activePlayers);

    if (activePlayers.length >= 2) {
      this.gameService.initializeGame(activePlayers, true);
      this.router.navigate(['/game']);
    } else {
      // Se só sobrou 1 ou nenhum, ele é o 3º lugar (ou já foi decidido)
      const thirdPlace = tournamentState.players.find(p => p.name === activePlayers[0]);
      if (thirdPlace) {
        thirdPlace.position = 3;
        thirdPlace.group = 'losers';
        console.log(`🥉 ${thirdPlace.name} É O 3º LUGAR!`);
        this.router.navigate(['/tournament']);
      } else {
        // ✅ FALBACK: se não encontrou jogador, vai para o tournament
        console.log('⚠️ Nenhum jogador para 3º lugar, finalizando torneio');
        this.router.navigate(['/tournament']);
      }
    }
    return;
  }

  // ✅ PARA OUTRAS FASES (0, 1, 2, 3)
  const activePlayers = nextPlayers;

  console.log('  activePlayers:', activePlayers);

  if (activePlayers.length <= 1) {
    const champion = tournamentState.players.find(p => p.name === activePlayers[0]);
    if (champion) {
      champion.position = 1;
      champion.group = 'champion';
      tournamentState.winner = champion;
      tournamentState.isActive = false;
      console.log(`🏆 ${champion.name} É O CAMPEÃO DO TORNEIO!`);
      this.tournamentService.saveTournamentHistory();
      this.router.navigate(['/tournament']);
    } else {
      // ✅ FALBACK: se não encontrou jogador, vai para o tournament
      console.log('⚠️ Nenhum jogador encontrado, finalizando torneio');
      this.router.navigate(['/tournament']);
    }
    return;
  }

  // ✅ PASSAR APENAS OS JOGADORES ATIVOS (QUEM VAI JOGAR)
  this.gameService.initializeGame(activePlayers, true);
  this.router.navigate(['/game']);
}


  getTournamentStatusIcon(player: any): string {
    if (player.eliminated) return '✕';
    if (player.group === 'winners') return '★';
    return '●';
  }

  getTournamentStatusColor(player: any): string {
    if (player.eliminated) return 'var(--neon-red)';
    if (player.group === 'winners') return 'var(--neon-yellow)';
    return 'var(--neon-green)';
  }

getTournamentStatusLabel(player: any): string {
  const tournamentState = this.tournamentService.getTournamentStateValue();
  if (!tournamentState) return 'JOGANDO';

  if (player.eliminated) {
    const positions = ['4º LUGAR', '3º LUGAR', '2º LUGAR'];
    const pos = player.position ? 4 - player.position : 0;
    return positions[pos] || 'ELIMINADO';
  }

  if (tournamentState.winner?.id === player.id) return 'CAMPEÃO';

  const isCurrentlyPlaying = this.gameState?.players?.some(p => p.name === player.name);
  if (isCurrentlyPlaying) return 'JOGANDO';

  if (player.group === 'winners' && !player.eliminated) return 'CLASSIFICADO';

  return 'JOGANDO';
}

  createConfetti(): void {
    const colors = ['#ff2a6d', '#05d9e8', '#00ff9d', '#f9f002', '#d300c5'];

    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement('div');
      const size = Math.random() * 10 + 5;
      const duration = Math.random() * 2 + 2;
      const delay = Math.random() * 2;
      const left = Math.random() * 100;
      const color = colors[Math.floor(Math.random() * colors.length)];

      confetti.style.cssText = `
        position: fixed;
        left: ${left}%;
        top: -${size}px;
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
        z-index: 9999;
        pointer-events: none;
        box-shadow: 0 0 10px ${color}, 0 0 20px ${color};
        animation: none;
        transition: none;
      `;

      document.body.appendChild(confetti);

      const startTime = Date.now() + delay * 1000;
      const endY = window.innerHeight + size;

      function fall() {
        const elapsed = (Date.now() - startTime) / 1000;
        if (elapsed >= duration) {
          confetti.remove();
          return;
        }

        const progress = elapsed / duration;
        const y = progress * endY;
        const rotation = progress * 720;
        const opacity = 1 - progress * 0.8;

        confetti.style.transform = `translateY(${y}px) rotate(${rotation}deg)`;
        confetti.style.opacity = opacity.toString();

        requestAnimationFrame(fall);
      }

      setTimeout(() => {
        requestAnimationFrame(fall);
      }, delay * 1000);
    }

    setTimeout(() => {
      document.querySelectorAll('.confetti').forEach(el => el.remove());
    }, 6000);
  }
}
