import Joueur from "./joueur.js";

class P4 {
  constructor(
    rows = 6,
    cols = 7,
    player1 = new Joueur("Joueur 1", 1, "#ff0000"),
    player2 = new Joueur("Joueur 2", 2, "#ffff00")
  ) {
    this.rows = rows;
    this.cols = cols;
    this.joueur1 = player1;
    this.joueur2 = player2;
    this.joueurActuel = this.joueur1;
    this.grille = Array.from({ length: rows }, () => Array(cols).fill(0));
    this.creerGrille();

    // 🎵 Musique de fond
    if (!P4.backgroundMusicInstance) {
      P4.backgroundMusicInstance = new Audio("../assets/LoFi_theme.mp3");
      P4.backgroundMusicInstance.loop = true;
      P4.backgroundMusicInstance.volume = 0.4;
    }
    this.backgroundMusic = P4.backgroundMusicInstance;

    // 💰 Son pièce
    this.coinSound = new Audio("../assets/Mario Coin Sound - Sound Effect (HD).mp3");
    this.coinSound.volume = 0.05;

    // 🔘 Boutons son séparés à droite
    this.creerBoutonsSon();

    // ✅ Affichage initial du joueur
    const playerIndicator = document.getElementById("currentPlayerName");
    playerIndicator.textContent = this.joueurActuel.nom;
    playerIndicator.style.color = this.joueurActuel.couleur;
  }

  creerBoutonsSon() {
    if (P4.boutonsCrees) return; 
    P4.boutonsCrees = true;

    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.top = "50px";
    container.style.left = `calc(80px * ${this.cols} + 50px)`;
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "20px";
    document.body.appendChild(container);

    const musicBtn = document.createElement("button");
    musicBtn.id = "musicToggle";
    musicBtn.innerHTML = this.backgroundMusic.muted ? "🔇" : "🔊";
    musicBtn.style.fontSize = "40px";
    musicBtn.style.padding = "10px 15px";
    musicBtn.style.border = "2px solid #333";
    musicBtn.style.borderRadius = "10px";
    musicBtn.style.cursor = "pointer";
    musicBtn.style.background = "rgba(255,255,255,0.8)";
    container.appendChild(musicBtn);

    musicBtn.addEventListener("click", () => {
      this.backgroundMusic.muted = !this.backgroundMusic.muted;
      musicBtn.innerHTML = this.backgroundMusic.muted ? "🔇" : "🔊";
    });

    const coinBtn = document.createElement("button");
    coinBtn.id = "coinToggle";
    coinBtn.innerHTML = this.coinSound.muted ? "🔇" : "🎵";
    coinBtn.style.fontSize = "40px";
    coinBtn.style.padding = "10px 15px";
    coinBtn.style.border = "2px solid #333";
    coinBtn.style.borderRadius = "10px";
    coinBtn.style.cursor = "pointer";
    coinBtn.style.background = "rgba(255,255,255,0.8)";
    container.appendChild(coinBtn);

    coinBtn.addEventListener("click", () => {
      this.coinSound.muted = !this.coinSound.muted;
      coinBtn.innerHTML = this.coinSound.muted ? "🔇" : "🎵";
    });
  }

  creerGrille() {
    const game = document.getElementById("game");
    game.innerHTML = "";
    game.style.gridTemplateColumns = `repeat(${this.cols}, 80px)`;
    game.style.gridTemplateRows = `repeat(${this.rows}, 80px)`;
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.row = row;
        cell.dataset.col = col;
        cell.addEventListener("click", () => this.jouer(col));
        game.appendChild(cell);
      }
    }
  }

  jouer(col) {
    for (let row = this.rows - 1; row >= 0; row--) {
      if (this.grille[row][col] === 0) {
        this.grille[row][col] = this.joueurActuel.numero;
        this.animerPiece(row, col);
        break;
      }
    }
  }

  animerPiece(row, col) {
    let currentRow = 0;
    const interval = setInterval(() => {
      if (currentRow > 0) {
        const prevCell = document.querySelector(
          `.cell[data-row="${currentRow - 1}"][data-col="${col}"]`
        );
        prevCell.style.backgroundColor = "white";
      }
      const cell = document.querySelector(
        `.cell[data-row="${currentRow}"][data-col="${col}"]`
      );
      cell.style.backgroundColor = this.joueurActuel.couleur;

      this.coinSound.currentTime = 0;
      this.coinSound.play();

      if (currentRow === row) {
        clearInterval(interval);
        cell.dataset.player = this.joueurActuel.numero;

        if (this.verifierVictoire(row, col)) {
          setTimeout(() => alert(`${this.joueurActuel.nom} a gagné !`), 500);
          setTimeout(() => this.reinitialiser(), 2000);
        } else if (this.verifierMatchNul()) {
          setTimeout(() => alert("Match nul !"), 500);
          setTimeout(() => this.reinitialiser(), 2000);
        } else {
          // 🔄 Changement du joueur
          this.joueurActuel =
            this.joueurActuel.numero === 1 ? this.joueur2 : this.joueur1;

          // ✅ Mise à jour de l’indicateur après changement
          const playerIndicator = document.getElementById("currentPlayerName");
          playerIndicator.textContent = this.joueurActuel.nom;
          playerIndicator.style.color = this.joueurActuel.couleur;
        }
      } else {
        currentRow++;
      }
    }, 50);
  }

  verifierVictoire(row, col) {
    const joueur = this.joueurActuel.numero;
    return (
      this.verifierDirection(row, col, 1, 0, joueur) ||
      this.verifierDirection(row, col, 0, 1, joueur) ||
      this.verifierDirection(row, col, 1, 1, joueur) ||
      this.verifierDirection(row, col, 1, -1, joueur)
    );
  }

  verifierDirection(row, col, dirRow, dirCol, joueur) {
    let count = 1;
    for (let i = 1; i < 4; i++) {
      const r = row + dirRow * i;
      const c = col + dirCol * i;
      if (r < 0 || r >= this.rows || c < 0 || c >= this.cols || this.grille[r][c] !== joueur)
        break;
      count++;
    }
    for (let i = 1; i < 4; i++) {
      const r = row - dirRow * i;
      const c = col - dirCol * i;
      if (r < 0 || r >= this.rows || c < 0 || c >= this.cols || this.grille[r][c] !== joueur)
        break;
      count++;
    }
    return count >= 4;
  }

  verifierMatchNul() {
    return this.grille.every((row) => row.every((cell) => cell !== 0));
  }

  reinitialiser() {
    this.grille = Array.from({ length: this.rows }, () =>
      Array(this.cols).fill(0)
    );
    document.querySelectorAll(".cell").forEach((cell) => {
      cell.style.backgroundColor = "white";
      delete cell.dataset.player;
    });
  }
}

let game;
document.getElementById("startGame").addEventListener("click", () => {
  const rows = parseInt(document.getElementById("rows").value);
  const cols = parseInt(document.getElementById("cols").value);
  const player1Name = document.getElementById("player1Name").value;
  const player1Color = document.getElementById("player1Color").value;
  const player2Name = document.getElementById("player2Name").value;
  const player2Color = document.getElementById("player2Color").value;
  const player1 = new Joueur(player1Name, 1, player1Color);
  const player2 = new Joueur(player2Name, 2, player2Color);
  game = new P4(rows, cols, player1, player2);

  // ✅ ne lance la musique que si elle n'est pas déjà en cours
  if (P4.backgroundMusicInstance && P4.backgroundMusicInstance.paused) {
    P4.backgroundMusicInstance.play().catch(() => {
      console.log("⚠️ Autoplay bloqué, l’utilisateur doit cliquer quelque part.");
    });
  }
});
