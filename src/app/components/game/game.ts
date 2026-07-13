import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { GameService } from '../../services/game.service';
import { GameState } from '../../models/game-state';
import { Player } from '../../models/player';
import { PlayerHandComponent } from '../player-hand/player-hand';
import { ColorModalComponent } from '../color-modal/color-modal';

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
  currentPlayer: Player | null = null;
  isProcessing: boolean = false;
  showColorModal: boolean = false;
  showRulesModal: boolean = false;
  pendingCardIndex: number = -1;
  chatMessages: { name: string; text: string; isBot: boolean }[] = [];
  private hasStarted: boolean = false;
  speechMessages: { [key: string]: string } = {};

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    public gameService: GameService
  ) {}

  ngOnInit(): void {
    this.subscription = this.gameService.getGameState().subscribe(state => {
      if (!state) {
        this.router.navigate(['/']);
        return;
      }
      this.gameState = state;
      this.currentPlayer = state.players[state.currentPlayerIndex];
      this.isProcessing = false;
      this.cdr.detectChanges();

      if (state.players && state.players.length > 0 && !this.hasStarted) {
        this.hasStarted = true;
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
  }

  openRulesModal(): void {
    this.showRulesModal = true;
  }

  closeRulesModal(): void {
    this.showRulesModal = false;
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
      if (card.color === 'wild') {
        this.pendingCardIndex = cardIndex;
        this.showColorModal = true;
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