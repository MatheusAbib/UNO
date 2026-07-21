# 🎮 UNO Arcade

Bem-vindo ao **UNO Arcade**, uma versão digital do clássico jogo de cartas UNO com um visual **neon retro** inspirado nos anos 80!

Este projeto foi desenvolvido com **Angular** e traz toda a experiência do UNO com efeitos visuais impressionantes, bots inteligentes, sistema de torneio e uma interface totalmente responsiva.

---

## ✨ Funcionalidades

### 🎮 Jogo Completo
- Todas as regras do UNO implementadas
- Cartas especiais: Pular, Inverter, +2, +4 e Coringa
- Cartas exclusivas: **SWAP** (troca de mãos) e **PEEK** (olhar a mão do adversário)
- Sistema de UNO com aviso visual e sonoro

### 🤖 Bots Inteligentes
- 3 bots com personalidades próprias: **Hanna**, **Lucia** e **Pedro**
- IA estratégica que prioriza cartas especiais
- Bots reagem com mensagens e expressões durante o jogo
- Comportamento adaptativo baseado na situação da partida

### 🏆 Modo Torneio
- Torneio com 4 jogadores em 6 rodadas eliminatórias
- Sistema de classificação: 4º, 3º, 2º lugar e CAMPEÃO
- Jogadores eliminados viram observadores
- Histórico completo das rodadas
- Ranking de vitórias salvo no navegador

### 🌈 Design Neon Retro
- Cores vibrantes e efeitos de brilho
- Animações suaves e transições
- Efeitos de partículas e confetes
- Cursor personalizado com tema arcade

### 📱 100% Responsivo
- Layout adaptado para desktop, tablet e mobile
- Bots laterais em telas menores (Lucia e Pedro lado a lado)
- Experiência otimizada em qualquer dispositivo

### 💬 Interação em Tempo Real
- Chat de ações com histórico completo das jogadas
- Balões de fala dos bots
- Animações de troca de mãos e compra de cartas

### 🏅 Ranking
- Estatísticas de vitórias por modo de jogo (2, 3 e 4 jogadores)
- Taxa de vitórias calculada automaticamente
- Dados salvos localmente no navegador

---

## 🎯 Como Jogar

### Partida Normal
1. **Inicie o jogo** na tela inicial
2. **Escolha o número de adversários** (1 a 3 bots)
3. **Jogue suas cartas** clicando nelas
4. **Use cartas especiais** para ganhar vantagem:
   - **Pular (⊘)** : Pula o próximo jogador
   - **Inverter (⟳)** : Inverte a direção do jogo
   - **+2** : O próximo jogador compra 2 cartas
   - **+4** : Escolha a cor e o próximo compra 4 cartas
   - **Coringa (★)** : Escolha a cor que vai continuar
   - **SWAP (⇆)** : Troca todas as suas cartas com um adversário
   - **PEEK (👁)** : Olha a mão de um adversário por 2 segundos
5. **Grite UNO!** quando tiver 1 carta restante
6. **Vença** sendo o primeiro a ficar sem cartas!

### Modo Torneio
1. Clique em **"MODO TORNEIO"** na tela inicial
2. Acompanhe as 6 rodadas eliminatórias
3. **Rodada 1**: Todos os 4 jogadores disputam
4. **Rodada 2**: Perdedores da rodada 1 jogam entre si
5. **Rodada 3**: Define o **4º lugar**
6. **Rodada 4**: Vencedores disputam
7. **Rodada 5**: Define o **3º lugar**
8. **Rodada 6**: Final - Define o **CAMPEÃO** e o **2º lugar**

---

## 🛠️ Tecnologias Utilizadas

<div style="display: flex; gap: 10px; flex-wrap: wrap;">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg" alt="Angular" width="40" height="40">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" alt="TypeScript" width="40" height="40">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" alt="HTML5" width="40" height="40">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" alt="CSS3" width="40" height="40">
</div>

- **Angular 17+** - Framework frontend (Standalone Components)
- **TypeScript** - Tipagem e segurança
- **HTML5 & CSS3** - Estrutura e estilização neon
- **RxJS** - Gerenciamento de estado e reatividade
- **LocalStorage** - Persistência de dados (ranking e histórico)

---
