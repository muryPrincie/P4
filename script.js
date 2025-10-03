import Joueur from "./modules/joueur.js";

class P4 {
  constructor(rows=6, cols=7, player1=new Joueur("Joueur 1",1,"#ff0000"), player2=new Joueur("Joueur 2",2,"#ffff00"), mode="2joueurs", difficulte="facile") {
    this.rows = rows;
    this.cols = cols;
    this.joueur1 = player1;
    this.joueur2 = player2;
    this.joueurActuel = this.joueur1;
    this.grille = Array.from({length: rows}, ()=>Array(cols).fill(0));
    this.mode = mode;           // "2joueurs" ou "ordi"
    this.difficulte = difficulte; // "facile", "moyen", "difficile"
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

    // 🔘 Boutons son
    this.creerBoutonsSon();

    // ✅ Indicateur joueur
    const playerIndicator = document.getElementById("currentPlayerName");
    playerIndicator.textContent = this.joueurActuel.nom;
    playerIndicator.style.color = this.joueurActuel.couleur;

    // 💻 Si l'ordi commence, on le lance directement
    if(this.mode === "ordi" && this.joueurActuel.nom === "Ordi"){
      setTimeout(()=>this.jouerOrdi(),500);
    }
  }

  creerBoutonsSon() {
    if (P4.boutonsCrees) return;
    P4.boutonsCrees=true;

    const container=document.createElement("div");
    container.style.position="absolute";
    container.style.top="50px";
    container.style.right="20px";
    container.style.display="flex";
    container.style.flexDirection="column";
    container.style.gap="20px";
    document.body.appendChild(container);

    const musicBtn=document.createElement("button");
    musicBtn.id="musicToggle";
    musicBtn.innerHTML=this.backgroundMusic.muted?"🔇":"🔊";
    musicBtn.style.fontSize="24px";
    musicBtn.style.padding="10px 20px";
    container.appendChild(musicBtn);
    musicBtn.addEventListener("click",()=>{
      this.backgroundMusic.muted=!this.backgroundMusic.muted;
      musicBtn.innerHTML=this.backgroundMusic.muted?"🔇":"🔊";
    });

    const coinBtn=document.createElement("button");
    coinBtn.id="coinToggle";
    coinBtn.innerHTML=this.coinSound.muted?"🔇":"🎵";
    coinBtn.style.fontSize="24px";
    coinBtn.style.padding="10px 20px";
    container.appendChild(coinBtn);
    coinBtn.addEventListener("click",()=>{
      this.coinSound.muted=!this.coinSound.muted;
      coinBtn.innerHTML=this.coinSound.muted?"🔇":"🎵";
    });
  }

  creerGrille() {
    const game = document.getElementById("game");
    game.innerHTML="";
    game.style.display="grid";
    game.style.gridTemplateColumns=`repeat(${this.cols},80px)`;
    game.style.gridTemplateRows=`repeat(${this.rows},80px)`;
    for(let row=0;row<this.rows;row++){
      for(let col=0;col<this.cols;col++){
        const cell=document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.row=row;
        cell.dataset.col=col;
        cell.addEventListener("click",()=> {
          if(this.mode==="ordi" && this.joueurActuel.nom==="Ordi") return;
          this.jouer(col);
        });
        game.appendChild(cell);
      }
    }
  }

  jouer(col){
    for(let row=this.rows-1;row>=0;row--){
      if(this.grille[row][col]===0){
        this.grille[row][col]=this.joueurActuel.numero;
        this.animerPiece(row,col);
        break;
      }
    }
  }

  animerPiece(row,col){
    let currentRow=0;
    const interval=setInterval(()=>{
      if(currentRow>0){
        document.querySelector(`.cell[data-row="${currentRow-1}"][data-col="${col}"]`).style.backgroundColor="white";
      }
      const cell=document.querySelector(`.cell[data-row="${currentRow}"][data-col="${col}"]`);
      cell.style.backgroundColor=this.joueurActuel.couleur;
      this.coinSound.currentTime=0;
      this.coinSound.play();

      if(currentRow===row){
        clearInterval(interval);
        cell.dataset.player=this.joueurActuel.numero;

        if(this.verifierVictoire(row,col)){
          setTimeout(()=>alert(`${this.joueurActuel.nom} a gagné !`),500);
          setTimeout(()=>this.reinitialiser(),2000);
        } else if(this.verifierMatchNul()){
          setTimeout(()=>alert("Match nul !"),500);
          setTimeout(()=>this.reinitialiser(),2000);
        } else {
          this.joueurActuel=this.joueurActuel.numero===1?this.joueur2:this.joueur1;
          const playerIndicator=document.getElementById("currentPlayerName");
          playerIndicator.textContent=this.joueurActuel.nom;
          playerIndicator.style.color=this.joueurActuel.couleur;

          if(this.mode==="ordi" && this.joueurActuel.nom==="Ordi"){
            setTimeout(()=>this.jouerOrdi(),500);
          }
        }
      } else currentRow++;
    },50);
  }

  // ------------------ IA Ordi ------------------
  jouerOrdi(){
    let col;
    if(this.difficulte==="facile"){
      col = this.colAleatoire();
    }
    else if(this.difficulte==="moyen"){
      // l'ordi joue en premier et tente de gagner
      col = this.colGagneOrdi() || this.colAleatoire();
    }
    else if(this.difficulte==="difficile"){
      // l'ordi joue en premier, tente de gagner et bloque joueur
      col = this.colGagneOrdi() || this.colBloqueJoueur() || this.colAleatoire();
    }
    this.jouer(col);
  }

  colAleatoire(){
    const colsLibres=[];
    for(let c=0;c<this.cols;c++) if(this.grille[0][c]===0) colsLibres.push(c);
    return colsLibres[Math.floor(Math.random()*colsLibres.length)];
  }

  colGagneOrdi(){
    for(let c=0;c<this.cols;c++){
      for(let r=this.rows-1;r>=0;r--){
        if(this.grille[r][c]===0){
          this.grille[r][c]=2;
          if(this.verifierVictoire(r,c)){
            this.grille[r][c]=0;
            return c;
          }
          this.grille[r][c]=0;
          break;
        }
      }
    }
    return null;
  }

  colBloqueJoueur(){
    for(let c=0;c<this.cols;c++){
      for(let r=this.rows-1;r>=0;r--){
        if(this.grille[r][c]===0){
          this.grille[r][c]=1;
          if(this.verifierVictoire(r,c)){
            this.grille[r][c]=0;
            return c;
          }
          this.grille[r][c]=0;
          break;
        }
      }
    }
    return null;
  }

  colStrategique(){
    const centre=Math.floor(this.cols/2);
    if(this.grille[0][centre]===0) return centre;
    return null;
  }

  verifierVictoire(row,col){
    const j=this.joueurActuel.numero;
    return this.verifierDirection(row,col,1,0,j)
        || this.verifierDirection(row,col,0,1,j)
        || this.verifierDirection(row,col,1,1,j)
        || this.verifierDirection(row,col,1,-1,j);
  }

  verifierDirection(row,col,dirRow,dirCol,joueur){
    let count=1;
    for(let i=1;i<4;i++){
      const r=row+dirRow*i, c=col+dirCol*i;
      if(r<0||r>=this.rows||c<0||c>=this.cols||this.grille[r][c]!==joueur) break;
      count++;
    }
    for(let i=1;i<4;i++){
      const r=row-dirRow*i, c=col-dirCol*i;
      if(r<0||r>=this.rows||c<0||c>=this.cols||this.grille[r][c]!==joueur) break;
      count++;
    }
    return count>=4;
  }

  verifierMatchNul(){
    return this.grille.every(row=>row.every(cell=>cell!==0));
  }

  reinitialiser(){
    this.grille=Array.from({length:this.rows},()=>Array(this.cols).fill(0));
    document.querySelectorAll(".cell").forEach(c=>{
      c.style.backgroundColor="white";
      delete c.dataset.player;
    });
    this.joueurActuel=this.joueur1;
    const playerIndicator=document.getElementById("currentPlayerName");
    playerIndicator.textContent=this.joueurActuel.nom;
    playerIndicator.style.color=this.joueurActuel.couleur;

    if(this.mode==="ordi" && this.joueurActuel.nom==="Ordi"){
      setTimeout(()=>this.jouerOrdi(),500);
    }
  }
}

// ------------------- Initialisation -------------------
let game;
let difficulteSelectionnee="facile";
let modeOrdi = false;

// cacher le conteneur difficulté par défaut
document.getElementById("difficulteContainer").style.display = "none";

// Bouton Ordinateur
const modeOrdiBtn = document.getElementById("modeOrdiBtn");
modeOrdiBtn.addEventListener("click", () => {
    modeOrdi = !modeOrdi;
    modeOrdiBtn.textContent = `Ordinateur : ${modeOrdi ? "ON" : "OFF"}`;
    document.getElementById("difficulteContainer").style.display = modeOrdi ? "block" : "none";
});

// Boutons difficulté
document.querySelectorAll(".difficulteBtn").forEach(btn=>{
  btn.addEventListener("click",()=>{
    difficulteSelectionnee=btn.dataset.level;
    document.querySelectorAll(".difficulteBtn").forEach(b=>b.classList.remove("selected"));
    btn.classList.add("selected");
  });
});

// Démarrage du jeu
document.getElementById("startGame").addEventListener("click",()=>{
  const rows=parseInt(document.getElementById("rows").value);
  const cols=parseInt(document.getElementById("cols").value);
  const player1Name=document.getElementById("player1Name").value;
  const player1Color=document.getElementById("player1Color").value;

  let player2;
  const mode = modeOrdi ? "ordi" : "2joueurs";

  if(modeOrdi){
    player2 = new Joueur("Ordi",2,"#00ff00");
  } else {
    const player2Name=document.getElementById("player2Name").value;
    const player2Color=document.getElementById("player2Color").value;
    player2 = new Joueur(player2Name,2,player2Color);
  }

  const player1 = new Joueur(player1Name,1,player1Color);
  game = new P4(rows,cols,player1,player2,mode,difficulteSelectionnee);

  if(P4.backgroundMusicInstance && P4.backgroundMusicInstance.paused){
    P4.backgroundMusicInstance.play().catch(()=>console.log("⚠️ Autoplay bloqué"));
  }
});
