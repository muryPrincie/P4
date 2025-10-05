import Joueur from "./joueur.js";
import P4 from "./script.js";

let game;
let difficulteSelectionnee="facile";
let modeOrdi=false;

document.getElementById("difficulteContainer").style.display="none";

document.getElementById("modeOrdiBtn").addEventListener("click",()=>{
    modeOrdi=!modeOrdi;
    document.getElementById("modeOrdiBtn").textContent=`Ordinateur : ${modeOrdi?"ON":"OFF"}`;
    document.getElementById("difficulteContainer").style.display=modeOrdi?"block":"none";
});

document.querySelectorAll(".difficulteBtn").forEach(btn=>{
    btn.addEventListener("click",()=>{
        difficulteSelectionnee=btn.dataset.level;
        document.querySelectorAll(".difficulteBtn").forEach(b=>b.classList.remove("selected"));
        btn.classList.add("selected");
    });
});

document.getElementById("startGame").addEventListener("click",()=>{
    const rows=parseInt(document.getElementById("rows").value);
    const cols=parseInt(document.getElementById("cols").value);
    const player1Name=document.getElementById("player1Name").value;
    const player1Color=document.getElementById("player1Color").value;

    let player2;
    const mode=modeOrdi?"ordi":"2joueurs";

    if(modeOrdi) player2=new Joueur("Ordi",2,"#00ff00");
    else{
        const player2Name=document.getElementById("player2Name").value;
        const player2Color=document.getElementById("player2Color").value;
        player2=new Joueur(player2Name,2,player2Color);
    }

    const player1=new Joueur(player1Name,1,player1Color);
    game=new P4(rows,cols,player1,player2,mode,difficulteSelectionnee);

    if(P4.backgroundMusicInstance && P4.backgroundMusicInstance.paused) P4.backgroundMusicInstance.play().catch(()=>console.log("⚠️ Autoplay bloqué"));
});
