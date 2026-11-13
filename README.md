
# 🎮 UNO Arcade

**UNO Arcade** é uma releitura digital do clássico jogo de cartas UNO, desenvolvida com **Angular 21 e TypeScript**, combinando mecânicas tradicionais com cartas especiais exclusivas, adversários controlados por inteligência artificial e uma interface inspirada em **jogos RPG retrô e pixel art**.

O projeto oferece partidas individuais contra bots, um sistema de torneio, ranking de vitórias e uma experiência adaptada para diferentes dispositivos.

> 🔗 **Acesse o projeto online:** (https://matheusabib.github.io/UNO/#/)

---

## ✨ Funcionalidades

### 🃏 Sistema de Jogo

- Mecânicas tradicionais do UNO implementadas.
- Cartas especiais: Pular, Inverter, +2, +4 e Coringa.
- Cartas exclusivas:
  - **SWAP:** permite trocar sua mão de cartas com outro jogador.
  - **PEEK:** permite visualizar temporariamente as cartas de um adversário.
- Sistema de aviso de UNO com feedback visual e sonoro.
- Controle de turnos, compra de cartas e gerenciamento das partidas.

### 🤖 Adversários Inteligentes

- Três bots com personalidades próprias: **Hanna, Lucia e Pedro**.
- Estratégias de jogo baseadas nas cartas disponíveis.
- Priorização de cartas especiais em determinadas situações.
- Reações e mensagens durante as partidas.
- Comportamento adaptativo conforme o andamento do jogo.

### 🏆 Modo Torneio

- Torneio com quatro jogadores e seis rodadas.
- Sistema de classificação do 1º ao 4º lugar.
- Jogadores eliminados podem acompanhar as partidas como observadores.
- Histórico das rodadas e resultados.
- Registro de vitórias no navegador.

### 🕹️ Interface RPG e Pixel Art

- Identidade visual inspirada em jogos RPG clássicos.
- Tipografia pixelada e elementos de interface arcade.
- Painéis de jogo com bordas e elementos visuais retrô.
- Cartas estilizadas e indicadores de turno.
- Animações e transições durante as partidas.
- Efeitos visuais inspirados em monitores CRT.

### 📱 Design Responsivo

- Interface adaptada para computadores, tablets e celulares.
- Reorganização dos painéis dos adversários em telas menores.
- Ajuste automático das dimensões e distribuição das cartas.
- Controles e elementos visuais adaptados para dispositivos móveis.

### 💬 Interações Durante a Partida

- Histórico de ações e jogadas.
- Balões de fala dos adversários.
- Animações de compra e troca de cartas.
- Indicadores visuais para turnos e eventos especiais.

### 🏅 Ranking e Estatísticas

- Registro de vitórias por modo de jogo.
- Estatísticas para partidas com diferentes quantidades de jogadores.
- Cálculo de taxa de vitórias.
- Armazenamento local dos resultados por meio do LocalStorage.

---

## 🎯 Como Jogar

### Partida Normal

1. Acesse o jogo e inicie uma nova partida.
2. Escolha a quantidade de adversários, de um a três bots.
3. Observe a carta presente na mesa e selecione uma carta válida da sua mão.
4. Utilize cartas especiais para modificar o andamento da partida.
5. Quando restar apenas uma carta, anuncie **UNO!**
6. Seja o primeiro jogador a ficar sem cartas para vencer.

### Cartas Especiais

| Carta | Efeito |
|---|---|
| ⊘ Pular | Faz o próximo jogador perder a vez. |
| ⟳ Inverter | Altera o sentido da partida. |
| +2 | Faz o próximo jogador comprar duas cartas. |
| +4 | Permite escolher uma cor e obriga o próximo jogador a comprar quatro cartas. |
| ★ Coringa | Permite escolher a próxima cor da partida. |
| ⇆ SWAP | Troca todas as cartas da sua mão com as de outro jogador. |
| 👁 PEEK | Revela as cartas de um adversário por dois segundos. |

### Modo Torneio

O modo torneio reúne quatro jogadores em uma sequência de seis rodadas, definindo a classificação final.

| Rodada | Objetivo |
|---|---|
| 1 | Partida inicial com os quatro jogadores. |
| 2 | Confronto entre os perdedores da primeira rodada. |
| 3 | Definição do quarto colocado. |
| 4 | Confronto entre os vencedores. |
| 5 | Definição do terceiro colocado. |
| 6 | Final para definir o campeão e o vice-campeão. |

---

## 🛠️ Tecnologias Utilizadas

<div style="display: flex; gap: 10px; flex-wrap: wrap;">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg" alt="Angular" width="40" height="40">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" alt="TypeScript" width="40" height="40">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" alt="HTML5" width="40" height="40">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" alt="CSS3" width="40" height="40">
</div>

- **Angular 21:** framework utilizado na construção da aplicação.
- **TypeScript:** desenvolvimento da lógica e gerenciamento das funcionalidades.
- **HTML5:** estrutura e organização dos componentes.
- **CSS3:** estilização, responsividade, animações e identidade visual RPG.
- **RxJS:** programação reativa e gerenciamento de fluxos de dados.
- **LocalStorage:** armazenamento local de rankings e estatísticas.
- **GitHub Pages:** hospedagem e publicação da aplicação.
