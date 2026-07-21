import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Player } from '../models/player';

export interface TournamentPlayer extends Player {
  eliminated: boolean;
  eliminatedRound?: number;
  group?: 'winners' | 'losers' | 'final' | 'champion';
  position?: number;
}

export interface TournamentState {
  players: TournamentPlayer[];
  currentRound: number;
  currentPhase: number;
  isActive: boolean;
  winner: TournamentPlayer | null;
  roundHistory: { round: number; eliminated: string[]; winner: string; description: string }[];
  currentMatchPlayers: string[];
  matchType: string;
  winners: string[];
  losers: string[];
}

export interface TournamentHistory {
  id: string;
  date: string;
  players: {
    name: string;
    position: number;
    group?: string;
  }[];
  winner: string;
  rounds: number;
}

@Injectable({
  providedIn: 'root'
})
export class TournamentService {
  private tournamentState = new BehaviorSubject<TournamentState | null>(null);
  private historyKey = 'tournament-history';

  getTournamentState(): Observable<TournamentState | null> {
    return this.tournamentState.asObservable();
  }

  getTournamentStateValue(): TournamentState | null {
    return this.tournamentState.getValue();
  }

  initializeTournament(playerNames: string[]): void {
    const players: TournamentPlayer[] = playerNames.map((name, index) => ({
      id: `player-${index}`,
      name: name,
      hand: [],
      isHuman: index === 0,
      isUno: false,
      score: 0,
      eliminated: false,
      eliminatedRound: undefined,
      group: undefined,
      position: undefined
    }));

    const state: TournamentState = {
      players: players,
      currentRound: 1,
      currentPhase: 0,
      isActive: true,
      winner: null,
      roundHistory: [],
      currentMatchPlayers: [],
      matchType: 'all',
      winners: [],
      losers: []
    };

    console.log('🏆 TORNEIO INICIADO - FASE 0, RODADA 1');
    this.tournamentState.next(state);
  }

registerRoundResult(winnerName: string, eliminatedName: string | null, round: number, description: string, losers?: string[]): void {
  const state = this.tournamentState.getValue();
  if (!state) return;

  console.log(`📝 REGISTRANDO RESULTADO - Rodada ${round}, Vencedor: ${winnerName}, Eliminado: ${eliminatedName || 'NENHUM'}`);
  console.log(`📝 [DEBUG] losers recebidos no registerRoundResult:`, losers);
  console.log(`📝 [DEBUG] losers length:`, losers?.length);

  // ✅ PRIMEIRO: ADICIONA OS PERDEDORES DA RODADA ATUAL
  if (losers && losers.length > 0) {
    // ✅ VERIFICA SE É FASE 3 (RODADA 4) - WINNERS JOGAM ENTRE SI
    const isWinnersPhase = round === 4; // Rodada 4 = FASE 3

    losers.forEach(name => {
      const player = state.players.find(p => p.name === name);
      if (player && !player.eliminated) {
        // ✅ NA FASE 3, PERDEDORES SÃO REMOVIDOS DOS WINNERS E ADICIONADOS AOS LOSERS
        if (isWinnersPhase) {
          // Remove dos winners se estiver lá
          state.winners = state.winners.filter(w => w !== name);
          // Adiciona aos losers
          if (!state.losers.includes(name)) {
            state.losers.push(name);
            console.log(`📌 ${name} removido dos winners e adicionado aos perdedores (FASE 3)`);
          }
        } else if (!state.winners.includes(name)) {
          // Para outras fases, só adiciona se não for winner
          if (!state.losers.includes(name)) {
            state.losers.push(name);
            console.log(`📌 ${name} adicionado aos perdedores`);
          }
        }
      }
    });
  }

  // ✅ SEGUNDO: ELIMINAÇÃO (se houver)
  if (eliminatedName) {
    const eliminated = state.players.find(p => p.name === eliminatedName);
    if (eliminated) {
      eliminated.eliminated = true;
      eliminated.eliminatedRound = round;

      const eliminatedCount = state.players.filter(p => p.eliminated).length;
      if (eliminatedCount === 1) {
        eliminated.position = 4;
      } else if (eliminatedCount === 2) {
        eliminated.position = 3;
      } else if (eliminatedCount === 3) {
        eliminated.position = 2;
      }

      eliminated.group = 'losers';
      console.log(`🔴 ${eliminatedName} ELIMINADO em ${eliminated.position}º lugar!`);

      // Remove dos losers se foi eliminado
      state.losers = state.losers.filter(name => name !== eliminatedName);
    }
  }

  // ✅ TERCEIRO: CLASSIFICA O VENCEDOR
  const winner = state.players.find(p => p.name === winnerName);
  if (winner) {
    winner.group = 'winners';
    if (!state.winners.includes(winnerName)) {
      state.winners.push(winnerName);
    }
    state.losers = state.losers.filter(name => name !== winnerName);
    console.log(`✅ ${winnerName} CLASSIFICADO como VENCEDOR`);
  }

  // ✅ QUARTO: LIMPA LOSERS (remove eliminados e winners)
  state.losers = state.losers.filter(name => {
    const player = state.players.find(p => p.name === name);
    return player && !player.eliminated && !state.winners.includes(name);
  });

  // ✅ QUINTO: VERIFICA SE É A RODADA FINAL (RODADA 6)
// ✅ QUINTO: VERIFICA SE É A RODADA FINAL (RODADA 6)
if (round === 6) {
  const champion = state.players.find(p => p.name === winnerName);
  if (champion) {
    champion.position = 1;
    champion.group = 'champion';
    state.winner = champion;
    state.isActive = false;
    console.log(`🏆 ${champion.name} É O CAMPEÃO DO TORNEIO!`);

    if (losers && losers.length > 0) {
      const runnerUpName = losers[0];
      const runnerUp = state.players.find(p => p.name === runnerUpName);
      if (runnerUp && !runnerUp.eliminated) {
        runnerUp.position = 2;
        runnerUp.group = 'losers';
        console.log(`🥈 ${runnerUp.name} É O 2º LUGAR!`);
      }
    }

    // ✅ ADICIONA A RODADA 6 AO HISTÓRICO ANTES DE FINALIZAR
    state.roundHistory.push({
      round: round,
      eliminated: [],
      winner: winnerName,
      description: `${winnerName} venceu a FINAL e é o CAMPEÃO!`
    });

    state.currentRound = 6;
    state.currentPhase = 5;
    this.saveTournamentHistory();
  }

  this.tournamentState.next(state);
  return;
}

  // ✅ HISTÓRICO (para rodadas que não são a final)
  state.roundHistory.push({
    round: round,
    eliminated: eliminatedName ? [eliminatedName] : [],
    winner: winnerName,
    description: description
  });

  state.currentRound = round + 1;
  state.currentPhase = this.getPhaseFromRound(state.currentRound);

  console.log(`🔄 PRÓXIMA RODADA: ${state.currentRound}, FASE: ${state.currentPhase}`);
  console.log(`📊 WINNERS: [${state.winners.join(', ')}]`);
  console.log(`📊 LOSERS: [${state.losers.join(', ')}]`);
  console.log(`📊 ELIMINADOS: [${state.players.filter(p => p.eliminated).map(p => p.name).join(', ')}]`);

  this.tournamentState.next(state);
}

private getPhaseFromRound(round: number): number {
  const phaseMap: { [key: number]: number } = {
    1: 0,
    2: 1,
    3: 2,
    4: 3,
    5: 4,
    6: 5
  };
  return phaseMap[round] !== undefined ? phaseMap[round] : 0;
}

  getNextMatchPlayers(): string[] {
  const state = this.tournamentState.getValue();
  if (!state) return [];

  const phase = state.currentPhase;
  const allPlayers = state.players.map(p => p.name);
  const winners = state.winners;
  const losers = state.losers;
  const eliminated = state.players.filter(p => p.eliminated).map(p => p.name);

  console.log(`🔍 getNextMatchPlayers - FASE: ${phase}`);
  console.log(`   winners: [${winners.join(', ')}]`);
  console.log(`   losers: [${losers.join(', ')}]`);
  console.log(`   eliminated: [${eliminated.join(', ')}]`);

  let result: string[] = [];

  if (phase === 0) {
    // ✅ FASE 0: TODOS JOGAM
    result = allPlayers.filter(p => !eliminated.includes(p));
  } else if (phase === 1) {
    // ✅ FASE 1: PERDEDORES DA RODADA 1 JOGAM
    result = losers.filter(p => !winners.includes(p) && !eliminated.includes(p));
  } else if (phase === 2) {
    // ✅ FASE 2: DOIS PERDEDORES JOGAM (DEFINE 4º LUGAR)
    const available = losers.filter(p => !winners.includes(p) && !eliminated.includes(p));
    result = available.slice(0, 2);
  } else if (phase === 3) {
    // ✅ FASE 3: TODOS OS WINNERS JOGAM (RODADA 4)
    result = winners.filter(p => !eliminated.includes(p));
  } else if (phase === 4) {
    // ✅ FASE 4: PERDEDORES DA RODADA 4 JOGAM (DEFINE 3º LUGAR)
    // ⭐ CORREÇÃO: pega os perdedores da rodada anterior, não os winners
    const losersFromPreviousRound = state.losers.filter(p => !eliminated.includes(p) && !winners.includes(p));

    // Se não houver perdedores suficientes, pega os players não eliminados
    if (losersFromPreviousRound.length >= 2) {
      result = losersFromPreviousRound.slice(0, 2);
    } else {
      // Fallback: pega os não eliminados que não são winners
      const nonWinners = allPlayers.filter(p => !winners.includes(p) && !eliminated.includes(p));
      result = nonWinners.slice(0, 2);
    }

    console.log(`   ⭐ FASE 4 - Perdedores da rodada anterior: [${result.join(', ')}]`);
  } else if (phase === 5) {
    // ✅ FASE 5: FINAL (VENCEDOR DA FASE 4 + WINNER DA FASE 3)
    const activePlayers = state.players.filter(p => !p.eliminated).map(p => p.name);
    // Pega os primeiros 2 (o winner da fase 3 + o vencedor da fase 4)
    result = activePlayers.slice(0, 2);
  }

  console.log(`   result: [${result.join(', ')}]`);
  return result;
}

  declareTournamentWinner(playerId: string, position: number): void {
    const state = this.tournamentState.getValue();
    if (!state) return;

    const player = state.players.find(p => p.id === playerId);
    if (player) {
      state.winner = player;
      player.group = 'champion';
      player.position = position;
      state.isActive = false;
      console.log(`🏆 ${player.name} é o CAMPEÃO do torneio!`);
    }

    this.tournamentState.next(state);
  }

  getActivePlayers(): TournamentPlayer[] {
    const state = this.tournamentState.getValue();
    if (!state) return [];
    return state.players.filter(p => !p.eliminated);
  }

  isTournamentOver(): boolean {
    const state = this.tournamentState.getValue();
    if (!state) return false;
    return state.isActive === false && state.winner !== null;
  }

  resetTournament(): void {
    console.log('🔄 RESETANDO TORNEIO');
    this.tournamentState.next(null);
  }

  getCurrentMatchPlayers(): string[] {
    const state = this.tournamentState.getValue();
    if (!state) return [];
    return state.currentMatchPlayers;
  }

saveTournamentHistory(): void {
  const state = this.tournamentState.getValue();
  if (!state || !state.winner) {
    console.log('❌ Nenhum vencedor para salvar');
    return;
  }

  const history: TournamentHistory = {
    id: Date.now().toString(),
    date: new Date().toLocaleString('pt-BR'),
    players: state.players.map(p => ({
      name: p.name,
      position: p.position || 0,
      group: p.group
    })),
    winner: state.winner.name,
    rounds: state.currentRound - 1
  };

  const allHistory = this.getTournamentHistory();
  allHistory.unshift(history);

  if (allHistory.length > 50) {
    allHistory.pop();
  }

  localStorage.setItem(this.historyKey, JSON.stringify(allHistory));
  console.log('📜 Histórico do torneio salvo!', history);
}
  getTournamentHistory(): TournamentHistory[] {
    const data = localStorage.getItem(this.historyKey);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  }

  clearTournamentHistory(): void {
    localStorage.removeItem(this.historyKey);
    console.log('🗑️ Histórico de torneios limpo!');
  }
}
