import Joueur from "./joueur.js";

export default class P4 {
    constructor(rows=6, cols=7, player1=new Joueur("Joueur 1",1,"#ff0000"), player2=new Joueur("Joueur 2",2,"#ffff00"), mode="2joueurs", difficulte="facile") {
        this.rows = rows;
        this.cols = cols;
        this.joueur1 = player1;
        this.joueur2 = player2;
        this.joueurActuel = this.joueur1;
        this.grille = Array.from({length: rows}, () => Array(cols).fill(0));
        this.mode = mode;
        this.difficulte = difficulte;

        // Musique
        if (!P4.backgroundMusicInstance) {
            P4.backgroundMusicInstance = new Audio("../assets/LoFi_theme.mp3");
            P4.backgroundMusicInstance.loop = true;
            P4.backgroundMusicInstance.volume = 0.4;
        }
        this.backgroundMusic = P4.backgroundMusicInstance;

        this.coinSound = new Audio("../assets/Mario Coin Sound - Sound Effect (HD).mp3");
        this.coinSound.volume = 0.05;

        this.creerBoutonsSon();
        this.creerGrille();
        this.updatePlayerIndicator();

        if(this.mode==="ordi" && this.joueurActuel.nom==="Ordi") setTimeout(()=>this.jouerOrdi(),500);
    }

    updatePlayerIndicator(){
        const playerIndicator=document.getElementById("currentPlayerName");
        playerIndicator.textContent=this.joueurActuel.nom;
        playerIndicator.style.color=this.joueurActuel.couleur;
    }

    creerBoutonsSon(){
        if(P4.boutonsCrees) return;
        P4.boutonsCrees=true;

        const container=document.createElement("div");
        container.id="toggleContainer";
        document.body.appendChild(container);

        const musicBtn=document.createElement("button");
        musicBtn.id="musicToggle";
        musicBtn.innerHTML=this.backgroundMusic.muted?"🔇":"🔊";
        container.appendChild(musicBtn);
        musicBtn.addEventListener("click",()=>{
            this.backgroundMusic.muted=!this.backgroundMusic.muted;
            musicBtn.innerHTML=this.backgroundMusic.muted?"🔇":"🔊";
        });

        const coinBtn=document.createElement("button");
        coinBtn.id="coinToggle";
        coinBtn.innerHTML=this.coinSound.muted?"🔇":"🎵";
        container.appendChild(coinBtn);
        coinBtn.addEventListener("click",()=>{
            this.coinSound.muted=!this.coinSound.muted;
            coinBtn.innerHTML=this.coinSound.muted?"🔇":"🎵";
        });
    }

    creerGrille(){
        const game=document.getElementById("game");
        game.innerHTML="";
        game.style.display="grid";
        game.style.gridTemplateColumns=`repeat(${this.cols},1fr)`;
        game.style.gridTemplateRows=`repeat(${this.rows},1fr)`;
        game.style.width="95vw";
        game.style.maxWidth="600px";
        game.style.aspectRatio = `${this.cols} / ${this.rows}`;
        game.style.margin = "auto";
        game.style.gap = "0.5vw";

        for(let row=0;row<this.rows;row++){
            for(let col=0;col<this.cols;col++){
                const cell=document.createElement("div");
                cell.classList.add("cell");
                cell.dataset.row=row;
                cell.dataset.col=col;
                cell.style.backgroundColor="white";
                cell.addEventListener("click",()=>{if(!(this.mode==="ordi" && this.joueurActuel.nom==="Ordi")) this.jouer(col)});
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

   animerPiece(targetRow, col){
    const cellHeight = document.querySelector(".cell").offsetHeight;
    let y = 0;
    let speed = 0;
    const gravity = 0.8; 
    let lastRow = -1; // pour mémoriser la dernière cellule colorée

    const drop = () => {
        speed += gravity;
        y += speed;
        const currentRow = Math.min(Math.floor(y / cellHeight), targetRow);

        // reset la cellule précédente
        if(lastRow >= 0 && lastRow !== currentRow){
            const prevCell = document.querySelector(`.cell[data-row="${lastRow}"][data-col="${col}"]`);
            prevCell.style.backgroundColor = "white";
        }

        // colorer la cellule actuelle
        const cell = document.querySelector(`.cell[data-row="${currentRow}"][data-col="${col}"]`);
        cell.style.backgroundColor = this.joueurActuel.couleur;

        // jouer le son seulement si on change de cellule
        if(lastRow !== currentRow){
            this.coinSound.currentTime = 0; 
            this.coinSound.play();
        }

        lastRow = currentRow;

        if(currentRow >= targetRow){
            cell.dataset.player = this.joueurActuel.numero;

            if(this.verifierVictoire(targetRow,col)){setTimeout(()=>alert(`${this.joueurActuel.nom} a gagné !`),500); setTimeout(()=>this.reinitialiser(),2000);}
            else if(this.verifierMatchNul()){setTimeout(()=>alert("Match nul !"),500); setTimeout(()=>this.reinitialiser(),2000);}
            else{
                this.joueurActuel=this.joueurActuel.numero===1?this.joueur2:this.joueur1;
                this.updatePlayerIndicator();
                if(this.mode==="ordi" && this.joueurActuel.nom==="Ordi") setTimeout(()=>this.jouerOrdi(),500);
            }
            return;
        }

        requestAnimationFrame(drop);
    }

    requestAnimationFrame(drop);
}


    jouerOrdi(){
        let col;
        if(this.difficulte==="facile") col=this.colAleatoire();
        else if(this.difficulte==="moyen") col=this.colGagneOrdi()||this.colAleatoire();
        else if(this.difficulte==="difficile") col=this.colGagneOrdi()||this.colBloqueJoueur()||this.colAleatoire();
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
                    if(this.verifierVictoire(r,c)){this.grille[r][c]=0; return c;}
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
                    if(this.verifierVictoire(r,c)){this.grille[r][c]=0; return c;}
                    this.grille[r][c]=0;
                    break;
                }
            }
        }
        return null;
    }

    verifierVictoire(row,col){
        const j=this.joueurActuel.numero;
        return this.verifierDirection(row,col,1,0,j) || this.verifierDirection(row,col,0,1,j)
            || this.verifierDirection(row,col,1,1,j) || this.verifierDirection(row,col,1,-1,j);
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

    verifierMatchNul(){ return this.grille.every(row=>row.every(cell=>cell!==0)); }

    reinitialiser(){
        this.grille=Array.from({length:this.rows},()=>Array(this.cols).fill(0));
        document.querySelectorAll(".cell").forEach(c=>{c.style.backgroundColor="white"; delete c.dataset.player;});
        this.joueurActuel=this.joueur1;
        this.updatePlayerIndicator();
        if(this.mode==="ordi" && this.joueurActuel.nom==="Ordi") setTimeout(()=>this.jouerOrdi(),500);
    }
}
