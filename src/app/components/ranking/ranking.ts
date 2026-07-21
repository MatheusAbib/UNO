import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RankingService, RankingData } from '../../services/ranking';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal';

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

  constructor(private rankingService: RankingService) {
    this.rankingData = this.rankingService.getRanking();
  }

  getModes(): string[] {
    return ['2-players', '3-players', '4-players'];
  }

  getModeLabel(mode: string): string {
    const labels: { [key: string]: string } = {
      '2-players': '2 Jogadores (1 Bot)',
      '3-players': '3 Jogadores (2 Bots)',
      '4-players': '4 Jogadores (3 Bots)'
    };
    return labels[mode] || mode;
  }

  getPlayers(mode: string): { name: string; stats: { wins: number; games: number } }[] {
    const data = this.rankingData[mode as keyof RankingData];
    if (!data) return [];

    return Object.keys(data)
      .map(name => ({
        name: name === 'Mãe' ? 'Você' : name,
        stats: data[name]
      }))
      .sort((a, b) => b.stats.wins - a.stats.wins);
  }

  getWinRate(stats: { wins: number; games: number }): string {
    if (stats.games === 0) return '0%';
    return Math.round((stats.wins / stats.games) * 100) + '%';
  }

  getTotalWins(mode: string): number {
    const data = this.rankingData[mode as keyof RankingData];
    if (!data) return 0;
    return Object.values(data).reduce((sum, stats) => sum + stats.wins, 0);
  }

  getTotalGames(mode: string): number {
    const data = this.rankingData[mode as keyof RankingData];
    if (!data) return 0;
    return Object.values(data).reduce((sum, stats) => sum + stats.games, 0);
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
