
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
import { TournamentService } from '../../services/tournament';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, PlayerHandComponent, ColorModalComponent],
  templateUrl: './game.html',
  styleUrls: ['./game.css']
})
export class GameComponent implements OnInit, OnDestroy {
  gameState: GameState | null = null;
  currentPlayer: Player | null = null;
  isProcessing = false;


  showColorModal = false;
  showRulesModal = false;
  pendingCardIndex = -1;

  chatMessages: { name: string; text: string; isBot: boolean }[] = [];
  speechMessages: { [key: string]: string } = {};

  showSwapModal = false;
  swapFromPlayer = '';
  swapTargetPlayer = '';
  private swapCallback: (() => void) | null = null;
  private swapTimer: ReturnType<typeof setTimeout> | null = null;

  showPeekModal = false;
  peekPlayerName = '';
  peekHand: Card[] = [];
  private peekTimer: ReturnType<typeof setTimeout> | null = null;

  showSwapChooseModal = false;
  swapChooseTargets: { id: string; name: string }[] = [];
  private pendingSwapCardIndex = -1;

  showPeekChooseModal = false;
  peekChooseTargets: { id: string; name: string }[] = [];
  private pendingPeekCardIndex = -1;

  showSwapBanner = false;
  swapBannerFrom = '';
  swapBannerTo = '';
  swapShakingPlayers: string[] = [];

specialEffectPlayerId: string | null = null;
specialEffectType: 'skip' | 'draw2' | 'wild_draw_four' | null = null;
private specialEffectVersion = 0;
private specialEffectExpiresAt = 0;

  private swapBannerTimer: ReturnType<typeof setTimeout> | null = null;
  private swapBannerEndTimer: ReturnType<typeof setTimeout> | null = null;
  private swapShakeTimer: ReturnType<typeof setTimeout> | null = null;
  private swapShakeEndTimer: ReturnType<typeof setTimeout> | null = null;

  showRoundResultModal = false;
  roundResultWinner = '';
  roundResultPosition = '';
  roundResultEliminated: string | null = null;
  roundResultCountdown = 5;
  private countdownTimer: ReturnType<typeof setInterval> | null = null;

  showTournamentModal = false;
  tournamentRound = 1;
  tournamentPlayers: any[] = [];
  tournamentHistory: any[] = [];

  private subscriptions = new Subscription();
  private hasStarted = false;
  private destroyed = false;
  private pendingTimers = new Set<ReturnType<typeof setTimeout>>();
  private lastDiscardCount = -1;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    public gameService: GameService,
    private tournamentService: TournamentService
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.gameService.getGameState().subscribe(state => {
        if (!state) {
          this.router.navigate(['/']);
          return;
        }

        const discardCount = state.discardPile?.length || 0;

        if (this.lastDiscardCount >= 0 && discardCount > this.lastDiscardCount) {
          this.schedule(() => this.animateDiscardPile(), 0);
        }

        this.lastDiscardCount = discardCount;
        this.gameState = state;
        this.currentPlayer = state.players[state.currentPlayerIndex] || null;
        this.isProcessing = false;
        this.refreshView();

        if (state.players.length > 0 && !this.hasStarted) {
          this.hasStarted = true;

          this.addChatMessage('SISTEMA', 'JOGO INICIADO!');

          const player = state.players[state.currentPlayerIndex];

          if (player?.isHuman) {
            this.addChatMessage('SISTEMA', 'SUA VEZ!');
          } else if (player) {
            this.addChatMessage(
              'SISTEMA',
              `VEZ DE ${player.name.toUpperCase()}!`
            );
          }

          this.schedule(() => this.createConfetti(), 300);
        }
      })
    );

    this.subscriptions.add(
      this.gameService.getChatMessages().subscribe(message => {
        this.chatMessages.push(message);

        if (this.chatMessages.length > 50) {
          this.chatMessages.shift();
        }

        this.refreshView();
        this.schedule(() => this.scrollToBottom(), 50);
      })
    );

    this.subscriptions.add(
      this.gameService.getSpeech().subscribe(speech => {
        this.speechMessages[speech.name] = speech.text;
        this.refreshView();

        this.schedule(() => {
          if (this.speechMessages[speech.name] === speech.text) {
            this.speechMessages[speech.name] = '';
            this.refreshView();
          }
        }, 3000);
      })
    );



    this.subscriptions.add(
      this.gameService.getConfetti().subscribe(() => {
        this.schedule(() => this.createConfetti(), 500);
      })
    );

    this.subscriptions.add(
      this.gameService.getSwapRequests().subscribe(request => {
        if (this.swapTimer) {
          clearTimeout(this.swapTimer);
          this.swapTimer = null;
        }

        this.swapFromPlayer = request.fromPlayer;
        this.swapTargetPlayer = request.targetPlayer;
        this.swapCallback = request.callback;
        this.showSwapModal = true;
        this.isProcessing = true;

        this.refreshView();

        this.swapTimer = setTimeout(() => {
          this.swapTimer = null;
          this.onSwapConfirm();
        }, 2200);
      })
    );

    this.subscriptions.add(
      this.gameService.getPeekRequests().subscribe(request => {
        if (this.peekTimer) {
          clearTimeout(this.peekTimer);
          this.peekTimer = null;
        }

        this.peekPlayerName = request.playerName;
        this.peekHand = request.hand;
        this.showPeekModal = true;
        this.refreshView();

        this.peekTimer = setTimeout(() => {
          this.peekTimer = null;
          this.showPeekModal = false;
          this.peekHand = [];
          this.refreshView();
          this.gameService.resumeAfterPeek();
        }, 2000);
      })
    );

    this.subscriptions.add(
      this.gameService.getDrawAnimation().subscribe(() => {
        this.triggerDrawAnimation();
      })
    );

    this.subscriptions.add(
      this.gameService.getSwapAnimation().subscribe(data => {
        this.showSwapAnimation(data.fromPlayer, data.toPlayer);
      })
    );


this.subscriptions.add(
  this.gameService.getSpecialEffect().subscribe(data => {
    const activePlayerCount = this.gameService
      .getCurrentGameState()
      ?.players.filter(player => !player.isObserver).length ?? 0;

    if (!data.playerId || !data.effect) {
      if (
        activePlayerCount === 2 &&
        this.specialEffectPlayerId &&
        Date.now() < this.specialEffectExpiresAt
      ) {
        return;
      }

      this.specialEffectVersion++;
      this.specialEffectPlayerId = null;
      this.specialEffectType = null;
      this.specialEffectExpiresAt = 0;
      this.refreshView();
      return;
    }

    const version = ++this.specialEffectVersion;

    this.specialEffectPlayerId = data.playerId;
    this.specialEffectType = data.effect;
    this.specialEffectExpiresAt =
      activePlayerCount === 2 ? Date.now() + 2000 : 0;

    this.refreshView();

    if (activePlayerCount === 2) {
      this.schedule(() => {
        if (version !== this.specialEffectVersion) {
          return;
        }

        this.specialEffectVersion++;
        this.specialEffectPlayerId = null;
        this.specialEffectType = null;
        this.specialEffectExpiresAt = 0;
        this.specialEffectExpiresAt = 0;
        this.refreshView();
      }, 2000);
    }
  })
);



    this.subscriptions.add(
      this.gameService.roundResult$.subscribe(data => {
        if (!this.gameService.isTournamentMode) {
          return;
        }

        this.gameService.notifyTournamentWinner(
          data.winnerName,
          data.position,
          data.eliminatedName,
          data.losers
        );

        this.showRoundResult(
          data.winnerName,
          data.position,
          data.eliminatedName
        );
      })
    );
  }

private animateDiscardPile(): void {
  const card = document.querySelector(
    '.discard-pile-wrapper .pile-card:last-child'
  );

  if (!card) return;

  card.classList.remove('pile-card-discard');
  void (card as HTMLElement).offsetWidth;
  card.classList.add('pile-card-discard');

  this.schedule(() => {
    card.classList.remove('pile-card-discard');
  }, 350);
}

  ngOnDestroy(): void {
    this.destroyed = true;
    this.subscriptions.unsubscribe();
    this.pendingTimers.forEach(timer => clearTimeout(timer));

    if (this.swapShakeTimer) {
      clearTimeout(this.swapShakeTimer);
      this.swapShakeTimer = null;
    }

    if (this.swapShakeEndTimer) {
      clearTimeout(this.swapShakeEndTimer);
      this.swapShakeEndTimer = null;
    }

    if (this.swapTimer) {
      clearTimeout(this.swapTimer);
      this.swapTimer = null;
    }

    if (this.peekTimer) {
      clearTimeout(this.peekTimer);
      this.peekTimer = null;
    }

    if (this.swapBannerTimer) {
      clearTimeout(this.swapBannerTimer);
      this.swapBannerTimer = null;
    }

    if (this.swapBannerEndTimer) {
      clearTimeout(this.swapBannerEndTimer);
      this.swapBannerEndTimer = null;
    }

    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }

    this.pendingTimers.forEach(timer => clearTimeout(timer));
    this.pendingTimers.clear();
    this.swapCallback = null;
    this.specialEffectPlayerId = null;
    this.specialEffectType = null;

  }

  private refreshView(): void {
    if (!this.destroyed) {
      this.cdr.detectChanges();
    }
  }

  private schedule(callback: () => void, delay: number): void {
    const timer = setTimeout(() => {
      this.pendingTimers.delete(timer);

      if (!this.destroyed) {
        callback();
      }
    }, delay);

    this.pendingTimers.add(timer);
  }

  private scrollToBottom(): void {
    const container = document.querySelector('.chat-container');

    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  trackByMessage(index: number, message: any): number {
    return index;
  }

  addChatMessage(name: string, text: string, isBot = false): void {
    this.chatMessages.push({ name, text, isBot });

    if (this.chatMessages.length > 50) {
      this.chatMessages.shift();
    }

    this.refreshView();
    this.schedule(() => this.scrollToBottom(), 50);
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
    if (!playerName || !this.gameState) {
      return false;
    }

    const state = this.tournamentService.getTournamentStateValue();

    if (!state) {
      return false;
    }

    const player = state.players.find(p => p.name === playerName);

    if (!player) {
      return false;
    }

    const isCurrentlyPlaying = this.gameState.players.some(
      p => p.name === playerName
    );

    if (isCurrentlyPlaying) {
      return false;
    }

    return player.group === 'winners' && !player.eliminated;
  }

  isEliminated(playerName: string | undefined): boolean {
    if (!playerName) {
      return false;
    }

    const state = this.tournamentService.getTournamentStateValue();

    if (!state) {
      return false;
    }

    const player = state.players.find(p => p.name === playerName);

    return player?.eliminated || false;
  }

  getSpectatorStatus(playerName: string | undefined): string {
    if (!playerName) {
      return 'AGUARDANDO';
    }

    const state = this.tournamentService.getTournamentStateValue();

    if (!state) {
      return 'AGUARDANDO';
    }

    const player = state.players.find(p => p.name === playerName);

    if (!player) {
      return 'AGUARDANDO';
    }

    if (player.eliminated) {
      if (player.position === 4) return '4º LUGAR';
      if (player.position === 3) return '3º LUGAR';
      if (player.position === 2) return '2º LUGAR';

      return 'ELIMINADO';
    }

    if (player.group === 'winners') {
      return '★ CLASSIFICADO';
    }

    const isCurrentlyPlaying = this.gameState?.players.some(
      p => p.name === playerName
    );

    return isCurrentlyPlaying ? 'JOGANDO' : 'AGUARDANDO';
  }

  getObserverMessage(playerName: string | undefined): string {
    if (!playerName) {
      return 'AGUARDANDO...';
    }

    if (this.gameState?.winner?.name === playerName) {
      return 'VENCEU A RODADA ANTERIOR!';
    }

    return 'AGUARDANDO...';
  }

  isHumanTurn(): boolean {
    if (!this.gameState || !this.currentPlayer) {
      return false;
    }

    return (
      this.currentPlayer.isHuman &&
      !this.gameState.isGameOver &&
      !this.isProcessing &&
      !this.gameService.isProcessing
    );
  }

  getCardColor(card: any): string {
    if (card.color === 'wild') {
      return 'var(--neon-purple)';
    }

    const colors: Record<string, string> = {
      red: 'var(--neon-red)',
      blue: 'var(--neon-blue)',
      green: 'var(--neon-green)',
      yellow: 'var(--neon-yellow)'
    };

    return colors[card.color] || 'white';
  }

  getCardDisplay(card: any): string {
    if (card.value === 'skip') return '⊘';
    if (card.value === 'reverse') return '⟳';
    if (card.value === 'draw2') return '+2';
    if (card.value === 'swap') return '⇆';
    if (card.value === 'peek') return '';
    if (card.value === 'wild') return '★';
    if (card.value === 'wild_draw_four') return '+4';

    return String(card.value);
  }

  isPeekCard(card: any): boolean {
    return card.value === 'peek';
  }

  getLastCards(pile: any[], count: number): any[] {
    if (!pile?.length) {
      return [];
    }

    return pile.slice(-count);
  }


getDrawPileOffset(index: number): string {
  const offsets = [
    { x: -5, y: 4, r: -6 },
    { x: 4, y: -3, r: 5 },
    { x: -4, y: 2, r: -4 },
    { x: 3, y: 3, r: 3 },
    { x: 0, y: 0, r: -1 }
  ];

  const offset = offsets[Math.min(index, offsets.length - 1)];

  return `translate(${offset.x}px, ${offset.y}px) rotate(${offset.r}deg)`;
}


  getDiscardPileOffset(index: number): string {
    const visibleCards = Math.min(
      this.gameState?.discardPile?.length || 0,
      5
    );

    const offsets = [
      { x: -3, y: 2, r: -3 },
      { x: 2, y: -2, r: 2 },
      { x: -2, y: 1, r: -1 },
      { x: 2, y: 2, r: 2 },
      { x: 0, y: 0, r: 0 }
    ];

    const firstOffsetIndex = 5 - visibleCards;
    const offsetIndex = Math.min(firstOffsetIndex + index, 4);
    const offset = offsets[offsetIndex];

    return `translate(${offset.x}px, ${offset.y}px) rotate(${offset.r}deg)`;
  }

  getAvatarImage(name: string | undefined): string {
    if (!name) {
      return '';
    }

    const avatars: Record<string, string> = {
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
    if (!name) {
      return false;
    }

    return [
      'Mãe',
      'Hanna',
      'Lucia',
      'Pedro',
      'Bot 1',
      'Bot 2',
      'Bot 3'
    ].includes(name);
  }

  getAvatarInitial(name: string | undefined): string {
    if (!name) return '?';
    if (name === 'Hanna') return 'H';
    if (name === 'Lucia') return 'L';
    if (name === 'Pedro') return 'P';
    if (name.startsWith('Bot')) return 'B';

    return name.charAt(0).toUpperCase();
  }

  getAvatarColor(name: string | undefined): string {
    const colors: Record<string, string> = {
      'Mãe': 'linear-gradient(135deg, #ff2a6d, #ff0040)',
      'Hanna': 'linear-gradient(135deg, #05d9e8, #00a2ff)',
      'Lucia': 'linear-gradient(135deg, #00ff9d, #00cc7a)',
      'Pedro': 'linear-gradient(135deg, #f9f002, #ffcc00)',
      'Bot 1': 'linear-gradient(135deg, #05d9e8, #00a2ff)',
      'Bot 2': 'linear-gradient(135deg, #00ff9d, #00cc7a)',
      'Bot 3': 'linear-gradient(135deg, #f9f002, #ffcc00)'
    };

    return colors[name || ''] ||
      'linear-gradient(135deg, #ff2a6d, #ff0040)';
  }

  drawCard(): void {
    if (this.isProcessing || !this.currentPlayer || !this.isHumanTurn()) {
      return;
    }

    this.isProcessing = true;
    this.gameService.drawCard(this.currentPlayer.id);
  }

  playCard(cardIndex: number): void {
    if (
      this.isProcessing ||
      !this.currentPlayer ||
      !this.gameState ||
      !this.isHumanTurn()
    ) {
      return;
    }

    const card = this.currentPlayer.hand[cardIndex];

    if (!card || !this.gameService.isValidPlay(card, this.gameState)) {
      return;
    }

    if (card.color === 'wild') {
      this.pendingCardIndex = cardIndex;
      this.showColorModal = true;
      this.isProcessing = true;
      return;
    }

    if (card.value === 'swap') {
      const targets = this.gameState.players.filter(
        player =>
          player.id !== this.currentPlayer?.id &&
          !player.isObserver
      );

      if (targets.length === 0) {
        this.addChatMessage(
          'SISTEMA',
          'NÃO HÁ JOGADORES DISPONÍVEIS PARA TROCAR!'
        );
        return;
      }

      this.swapChooseTargets = targets.map(player => ({
        id: player.id,
        name: player.name
      }));

      this.pendingSwapCardIndex = cardIndex;
      this.showSwapChooseModal = true;
      this.isProcessing = true;
      return;
    }

    if (card.value === 'peek') {
      const targets = this.gameState.players.filter(
        player =>
          player.id !== this.currentPlayer?.id &&
          !player.isObserver
      );

      if (targets.length === 0) {
        this.addChatMessage(
          'SISTEMA',
          'NÃO HÁ JOGADORES DISPONÍVEIS PARA OLHAR!'
        );
        return;
      }

      this.peekChooseTargets = targets.map(player => ({
        id: player.id,
        name: player.name
      }));

      this.pendingPeekCardIndex = cardIndex;
      this.showPeekChooseModal = true;
      this.isProcessing = true;
      return;
    }

    this.isProcessing = true;

    const success = this.gameService.playCard(
      this.currentPlayer.id,
      cardIndex
    );

    if (!success) {
      this.isProcessing = false;
    }
  }

  getPlayerByName(name: string): Player | null {
    return this.gameState?.players.find(
      player => player.name === name
    ) || null;
  }

  getPlayerIndex(name: string): number {
    return this.gameState?.players.findIndex(
      player => player.name === name
    ) ?? -1;
  }

  onSwapChoose(targetId: string): void {
    if (!this.currentPlayer || this.pendingSwapCardIndex < 0) {
      return;
    }

    const playerId = this.currentPlayer.id;
    const cardIndex = this.pendingSwapCardIndex;

    this.showSwapChooseModal = false;
    this.pendingSwapCardIndex = -1;
    this.isProcessing = true;

    const success = this.gameService.playCard(playerId, cardIndex);

    if (!success) {
      this.isProcessing = false;
      return;
    }

    this.schedule(() => {
      this.gameService.confirmSwap(targetId);
    }, 200);
  }

  onSwapChooseClose(): void {
    this.showSwapChooseModal = false;
    this.pendingSwapCardIndex = -1;
    this.isProcessing = false;
  }

  onSwapConfirm(): void {
    if (this.swapTimer) {
      clearTimeout(this.swapTimer);
      this.swapTimer = null;
    }

    if (!this.showSwapModal) {
      return;
    }

    this.showSwapModal = false;

    const callback = this.swapCallback;
    this.swapCallback = null;

    this.refreshView();

    if (callback) {
      callback();
    }
  }

  onSwapCancel(): void {
    this.onSwapConfirm();
  }

  onPeekChoose(targetId: string): void {
    if (!this.currentPlayer || this.pendingPeekCardIndex < 0) {
      return;
    }

    const playerId = this.currentPlayer.id;
    const cardIndex = this.pendingPeekCardIndex;

    this.showPeekChooseModal = false;
    this.pendingPeekCardIndex = -1;
    this.isProcessing = true;

    const success = this.gameService.playCard(playerId, cardIndex);

    if (!success) {
      this.isProcessing = false;
      return;
    }

    this.schedule(() => {
      this.gameService.confirmPeek(targetId);
    }, 200);
  }

  onPeekChooseClose(): void {
    this.showPeekChooseModal = false;
    this.pendingPeekCardIndex = -1;
    this.isProcessing = false;
  }

  onColorSelected(color: string): void {
    this.showColorModal = false;

    if (!this.currentPlayer || this.pendingCardIndex < 0) {
      this.pendingCardIndex = -1;
      this.isProcessing = false;
      return;
    }

    const success = this.gameService.playCard(
      this.currentPlayer.id,
      this.pendingCardIndex,
      color
    );

    this.pendingCardIndex = -1;

    if (!success) {
      this.isProcessing = false;
    }
  }

  isWildCardWithColor(card: any, color: string): boolean {
    return card.color === 'wild' && card.chosenColor === color;
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
    const colors: Record<string, string> = {
      red: 'vermelho',
      green: 'verde',
      blue: 'azul',
      yellow: 'amarelo',
      wild: 'preto'
    };

    return colors[card.color] || '';
  }

  triggerDrawAnimation(): void {
    const pile = document.querySelector('.draw-pile-wrapper');

    if (!pile) {
      return;
    }

    pile.classList.remove('draw-pile-moving');
    void (pile as HTMLElement).offsetWidth;
    pile.classList.add('draw-pile-moving');

    this.schedule(() => {
      pile.classList.remove('draw-pile-moving');
    }, 500);
  }

  isSwapShaking(playerName: string | undefined): boolean {
  return !!playerName && this.swapShakingPlayers.includes(playerName);
}


getSpecialEffect(
  playerId: string | undefined
): 'skip' | 'draw2' | 'wild_draw_four' | null {
  if (!playerId || this.specialEffectPlayerId !== playerId) {
    return null;
  }

  return this.specialEffectType;
}


showSwapAnimation(fromPlayer: string, toPlayer: string): void {
  if (this.swapBannerTimer) {
    clearTimeout(this.swapBannerTimer);
    this.swapBannerTimer = null;
  }

  if (this.swapBannerEndTimer) {
    clearTimeout(this.swapBannerEndTimer);
    this.swapBannerEndTimer = null;
  }

  if (this.swapShakeTimer) {
    clearTimeout(this.swapShakeTimer);
    this.swapShakeTimer = null;
  }

  if (this.swapShakeEndTimer) {
    clearTimeout(this.swapShakeEndTimer);
    this.swapShakeEndTimer = null;
  }

  this.swapShakingPlayers = [];
  this.swapBannerFrom = fromPlayer;
  this.swapBannerTo = toPlayer;
  this.showSwapBanner = true;
  this.isProcessing = true;
  this.gameService.isProcessing = true;

  this.refreshView();

  this.schedule(() => {
    document
      .querySelector('.swap-animation-banner')
      ?.classList.add('show');
  }, 50);

  this.swapShakeTimer = setTimeout(() => {
    this.swapShakeTimer = null;

    if (this.destroyed) {
      return;
    }

    this.swapShakingPlayers = [fromPlayer, toPlayer];
    this.refreshView();

    this.swapShakeEndTimer = setTimeout(() => {
      this.swapShakeEndTimer = null;
      this.swapShakingPlayers = [];
      this.refreshView();
    }, 700);
  }, 650);

  this.swapBannerTimer = setTimeout(() => {
    this.swapBannerTimer = null;

    document
      .querySelector('.swap-animation-banner')
      ?.classList.remove('show');

    this.swapBannerEndTimer = setTimeout(() => {
      this.swapBannerEndTimer = null;

      if (this.destroyed) {
        return;
      }

      this.showSwapBanner = false;
      this.swapShakingPlayers = [];
      this.isProcessing = false;
      this.gameService.isProcessing = false;

      this.refreshView();
      this.gameService.resumeAfterSwap();
    }, 500);
  }, 2000);
}
  showRoundResult(
    winnerName: string,
    position: string,
    eliminatedName?: string
  ): void {
    if (!this.gameService.isTournamentMode) {
      return;
    }

    this.gameService.isProcessing = true;
    this.isProcessing = true;

    this.roundResultWinner = winnerName;
    this.roundResultPosition = position;
    this.roundResultEliminated = eliminatedName || null;
    this.roundResultCountdown = 5;
    this.showRoundResultModal = true;

    this.refreshView();

    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }

    this.countdownTimer = setInterval(() => {
      if (this.destroyed) {
        return;
      }

      this.roundResultCountdown--;
      this.refreshView();

      if (this.roundResultCountdown <= 0) {
        if (this.countdownTimer) {
          clearInterval(this.countdownTimer);
          this.countdownTimer = null;
        }

        this.closeRoundResultAndContinue();
      }
    }, 1000);
  }

  closeRoundResultAndContinue(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }

    this.showRoundResultModal = false;
    this.gameService.isProcessing = false;
    this.isProcessing = false;

    const state = this.tournamentService.getTournamentStateValue();

    if (!state || !state.isActive) {
      this.router.navigate(['/tournament']);
      return;
    }

    this.startNextTournamentMatch();
  }

  onGameOver(): void {
    if (this.gameService.isTournamentMode) {
      this.router.navigate(['/tournament']);
    } else {
      this.router.navigate(['/']);
    }
  }

  getSortedTournamentPlayers(): any[] {
    if (!this.tournamentPlayers.length) {
      return [];
    }

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
    const state = this.tournamentService.getTournamentStateValue();

    if (!state) {
      return '';
    }

    const labels: Record<number, string> = {
      1: 'RODADA 1',
      2: 'RODADA 2',
      3: 'RODADA 3 - 4º LUGAR',
      4: 'RODADA 4',
      5: 'RODADA 5 - 3º LUGAR',
      6: 'RODADA 6 - FINAL'
    };

    if (state.currentRound > 6) {
      return 'FINALIZADO';
    }

    return labels[state.currentRound] ||
      `RODADA ${state.currentRound}`;
  }

  startNextTournamentMatch(): void {
    const state = this.tournamentService.getTournamentStateValue();

    if (!state) {
      this.router.navigate(['/']);
      return;
    }

    const nextPlayers = this.tournamentService.getNextMatchPlayers();
    const phase = state.currentPhase;

    if (phase === 5) {
      if (nextPlayers.length >= 2) {
        this.gameService.initializeGame(nextPlayers, true);
        this.router.navigate(['/game']);
      } else {
        const champion = state.players.find(
          player => player.name === nextPlayers[0]
        );

        if (champion) {
          champion.position = 1;
          champion.group = 'champion';
          state.winner = champion;
          state.isActive = false;

          this.tournamentService.saveTournamentHistory();
        }

        this.router.navigate(['/tournament']);
      }

      return;
    }

    if (phase === 4) {
      if (nextPlayers.length >= 2) {
        this.gameService.initializeGame(nextPlayers, true);
        this.router.navigate(['/game']);
      } else {
        const thirdPlace = state.players.find(
          player => player.name === nextPlayers[0]
        );

        if (thirdPlace) {
          thirdPlace.position = 3;
          thirdPlace.group = 'losers';
        }

        this.router.navigate(['/tournament']);
      }

      return;
    }

    if (nextPlayers.length <= 1) {
      const champion = state.players.find(
        player => player.name === nextPlayers[0]
      );

      if (champion) {
        champion.position = 1;
        champion.group = 'champion';
        state.winner = champion;
        state.isActive = false;

        this.tournamentService.saveTournamentHistory();
      }

      this.router.navigate(['/tournament']);
      return;
    }

    this.gameService.initializeGame(nextPlayers, true);
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
    const state = this.tournamentService.getTournamentStateValue();

    if (!state) {
      return 'JOGANDO';
    }

    if (player.eliminated) {
      const positions: Record<number, string> = {
        4: '4º LUGAR',
        3: '3º LUGAR',
        2: '2º LUGAR'
      };

      return positions[player.position] || 'ELIMINADO';
    }

    if (state.winner?.id === player.id) {
      return 'CAMPEÃO';
    }

    const isCurrentlyPlaying = this.gameState?.players.some(
      current => current.name === player.name
    );

    if (isCurrentlyPlaying) {
      return 'JOGANDO';
    }

    if (player.group === 'winners') {
      return 'CLASSIFICADO';
    }

    return 'JOGANDO';
  }

  createConfetti(): void {
    const colors = [
      '#ff2a6d',
      '#05d9e8',
      '#00ff9d',
      '#f9f002',
      '#d300c5'
    ];

    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement('div');
      const size = Math.random() * 10 + 5;
      const duration = Math.random() * 2 + 2;
      const delay = Math.random() * 2;
      const left = Math.random() * 100;
      const color = colors[Math.floor(Math.random() * colors.length)];

      confetti.className = 'game-confetti';

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
        animation: none;
        transition: none;
      `;

      document.body.appendChild(confetti);

      const startTime = performance.now() + delay * 1000;
      const endY = window.innerHeight + size;

      const fall = (now: number): void => {
        if (this.destroyed) {
          confetti.remove();
          return;
        }

        if (now < startTime) {
          requestAnimationFrame(fall);
          return;
        }

        const elapsed = (now - startTime) / 1000;
        const progress = Math.min(elapsed / duration, 1);

        if (progress >= 1) {
          confetti.remove();
          return;
        }

        const y = progress * endY;
        const rotation = progress * 720;
        const opacity = 1 - progress * 0.8;

        confetti.style.transform =
          `translateY(${y}px) rotate(${rotation}deg)`;

        confetti.style.opacity = opacity.toString();

        requestAnimationFrame(fall);
      };

      requestAnimationFrame(fall);
    }
  }
}
