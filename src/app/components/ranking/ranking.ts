
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RankingService, RankingData } from '../../services/ranking';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal';

interface RankingPlayer {
  name: string;
  stats: {
    wins: number;
    games: number;
  };
}

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule, ConfirmModalComponent],
  templateUrl: './ranking.html',
  styleUrls: ['./ranking.css']
})
export class RankingComponent {
  @Output() close = new EventEmitter<void>();

  rankingData: RankingData;
  selectedMode: string = '4-players';
  showClearRankingModal: boolean = false;

  readonly modes = ['2-players', '3-players', '4-players'];

  constructor(private rankingService: RankingService) {
    this.rankingData = this.rankingService.getRanking();
  }

  getModes(): string[] {
    return this.modes;
  }

  getModeLabel(mode: string): string {
    const labels: Record<string, string> = {
      '2-players': '2 JOGADORES',
      '3-players': '3 JOGADORES',
      '4-players': '4 JOGADORES'
    };

    return labels[mode] || mode;
  }

  getModeDescription(mode: string): string {
    const descriptions: Record<string, string> = {
      '2-players': '1 BOT',
      '3-players': '2 BOTS',
      '4-players': '3 BOTS'
    };

    return descriptions[mode] || '';
  }

  getPlayers(mode: string): RankingPlayer[] {
    const data = this.rankingData[mode as keyof RankingData];

    if (!data) {
      return [];
    }

    return Object.keys(data)
      .map(name => ({
        name: name === 'Mãe' ? 'Você' : name,
        stats: data[name]
      }))
      .sort((a, b) => {
        if (b.stats.wins !== a.stats.wins) {
          return b.stats.wins - a.stats.wins;
        }

        return this.getWinRateNumber(b.stats) - this.getWinRateNumber(a.stats);
      });
  }

  getWinRateNumber(stats: { wins: number; games: number }): number {
    if (stats.games === 0) {
      return 0;
    }

    return (stats.wins / stats.games) * 100;
  }

  getWinRate(stats: { wins: number; games: number }): string {
    return Math.round(this.getWinRateNumber(stats)) + '%';
  }

  getTotalWins(mode: string): number {
    const data = this.rankingData[mode as keyof RankingData];

    if (!data) {
      return 0;
    }

    return Object.values(data).reduce((sum, stats) => sum + stats.wins, 0);
  }

  getTotalGames(mode: string): number {
    const data = this.rankingData[mode as keyof RankingData];

    if (!data) {
      return 0;
    }

    return Object.values(data).reduce((sum, stats) => sum + stats.games, 0);
  }

  getLeader(mode: string): string {
    const players = this.getPlayers(mode);

    if (players.length === 0 || players[0].stats.wins === 0) {
      return '---';
    }

    return players[0].name;
  }

  getRankClass(index: number): string {
    if (index === 0) return 'rank-first';
    if (index === 1) return 'rank-second';
    if (index === 2) return 'rank-third';

    return '';
  }

  isHumanPlayer(name: string): boolean {
    return name === 'Você' || name === 'Mãe';
  }

  selectMode(mode: string): void {
    this.selectedMode = mode;
  }

  isSelected(mode: string): boolean {
    return this.selectedMode === mode;
  }

  onClose(): void {
    this.close.emit();
  }

  clearRanking(): void {
    this.showClearRankingModal = true;
  }

  confirmClearRanking(): void {
    this.rankingService.clearRanking();
    this.rankingData = this.rankingService.getRanking();
    this.showClearRankingModal = false;
  }

  cancelClearRanking(): void {
    this.showClearRankingModal = false;
  }
}
