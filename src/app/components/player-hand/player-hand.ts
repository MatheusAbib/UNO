
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Player } from '../../models/player';
import { Card } from '../../models/card';
import { GameState } from '../../models/game-state';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-player-hand',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player-hand.html',
  styleUrls: ['./player-hand.css']
})
export class PlayerHandComponent implements OnChanges {
  @Input() player: Player | null = null;
  @Input() position: 'top' | 'bottom' | 'left' | 'right' = 'bottom';
  @Input() isCurrent = false;
  @Input() isHuman = false;
  @Input() speechMessage = '';
  @Input() gameService: GameService | null = null;
  @Input() gameState: GameState | null = null;

  @Output() cardPlayed = new EventEmitter<number>();

  shakeIndex: number | null = null;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(): void {
    this.cdr.markForCheck();
  }

  getAvatarImage(name: string): string {
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

  getAvatarInitial(name: string): string {
    if (!name) return '?';
    if (name === 'Hanna') return 'H';
    if (name === 'Lucia') return 'L';
    if (name === 'Pedro') return 'P';
    if (name.startsWith('Bot')) return 'B';

    return name.charAt(0).toUpperCase();
  }

  hasImage(name: string): boolean {
    return !!this.getAvatarImage(name);
  }

  isNewCard(index: number): boolean {
    if (!this.player) return false;

    return index === this.player.hand.length - 1;
  }

  getAvatarColor(name: string): string {
    const colors: Record<string, string> = {
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

  getCardColor(card: Card): string {
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

  getCardDisplay(card: Card): string {
    if (card.value === 'skip') return '⊘';
    if (card.value === 'reverse') return '⟳';
    if (card.value === 'draw2') return '+2';
    if (card.value === 'swap') return '⇆';
    if (card.value === 'peek') return '👁';
    if (card.value === 'wild') return '★';
    if (card.value === 'wild_draw_four') return '+4';

    return card.value.toString();
  }

  getCardTransform(index: number, total: number): string {
    if (total <= 1) {
      return 'translate(0px, 0px) rotate(0deg)';
    }

    const center = (total - 1) / 2;
    const distance = index - center;
    const normalized = distance / center;
    const absoluteDistance = Math.abs(normalized);

    if (this.position === 'bottom') {
      const maxAngle = Math.min(18, 8 + total * 0.65);
      const angle = normalized * maxAngle;
      const curve = (1 - absoluteDistance * absoluteDistance) * 15;

      return `translateY(${-curve}px) rotate(${angle}deg)`;
    }

    if (this.position === 'top') {
      const maxAngle = Math.min(22, 10 + total * 0.8);
      const angle = normalized * maxAngle;
      const curve = (1 - absoluteDistance * absoluteDistance) * 12;

      return `translateY(${curve}px) rotate(${angle}deg)`;
    }

    if (this.position === 'left') {
      const maxAngle = Math.min(12, 5 + total * 0.4);
      const angle = normalized * maxAngle;
      const curve = (1 - absoluteDistance * absoluteDistance) * 8;

      return `translateX(${curve}px) rotate(${angle}deg)`;
    }

    if (this.position === 'right') {
      const maxAngle = Math.min(12, 5 + total * 0.4);
      const angle = -normalized * maxAngle;
      const curve = (1 - absoluteDistance * absoluteDistance) * 8;

      return `translateX(${-curve}px) rotate(${angle}deg)`;
    }

    return 'translate(0px, 0px) rotate(0deg)';
  }

  isCardPlayable(card: Card): boolean {
    if (
      !this.isHuman ||
      !this.isCurrent ||
      !this.gameService ||
      !this.gameState
    ) {
      return false;
    }

    return this.gameService.isValidPlay(card, this.gameState);
  }

  playCard(index: number): void {
    if (!this.isHuman || !this.isCurrent || !this.player) {
      return;
    }

    const card = this.player.hand[index];

    if (!card || !this.isCardPlayable(card)) {
      return;
    }

    this.cardPlayed.emit(index);
  }

  showSpeech(): boolean {
    return !this.isHuman && !!this.speechMessage;
  }
}
