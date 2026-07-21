import { Injectable } from '@angular/core';

export interface PlayerStats {
  wins: number;
  games: number;
}

export interface RankingData {
  '2-players': { [name: string]: PlayerStats };
  '3-players': { [name: string]: PlayerStats };
  '4-players': { [name: string]: PlayerStats };
}

@Injectable({
  providedIn: 'root'
})
export class RankingService {
  private storageKey = 'uno-ranking';

  getRanking(): RankingData {
    const data = localStorage.getItem(this.storageKey);
    if (data) {
      return JSON.parse(data);
    }
    return this.getDefaultRanking();
  }

  private getDefaultRanking(): RankingData {
    return {
      '2-players': {},
      '3-players': {},
      '4-players': {}
    };
  }

updateRanking(playerNames: string[], winnerName: string): void {
  const ranking = this.getRanking();
  const mode = this.getModeKey(playerNames.length);

  const normalizedNames = playerNames.map(name => {
    if (name === 'Mãe' || name === 'Você') return 'Você';
    return name;
  });

  const normalizedWinner = winnerName === 'Mãe' || winnerName === 'Você' ? 'Você' : winnerName;

  normalizedNames.forEach(name => {
    if (!ranking[mode][name]) {
      ranking[mode][name] = { wins: 0, games: 0 };
    }
    ranking[mode][name].games++;
  });

  if (ranking[mode][normalizedWinner]) {
    ranking[mode][normalizedWinner].wins++;
  }

  localStorage.setItem(this.storageKey, JSON.stringify(ranking));
}

  private getModeKey(playerCount: number): keyof RankingData {
    if (playerCount === 2) return '2-players';
    if (playerCount === 3) return '3-players';
    return '4-players';
  }

  clearRanking(): void {
    localStorage.removeItem(this.storageKey);
  }
}
