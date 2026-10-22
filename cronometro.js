let tempoRestante = 45 * 60; // 45 minutos em segundos
let intervaloTimer = null;

function iniciarCronometro(displayElementId, aoFinalizar) {
    clearInterval(intervaloTimer);
    
    intervaloTimer = setInterval(() => {
        if (tempoRestante <= 0) {
            clearInterval(intervaloTimer);
            if (aoFinalizar) aoFinalizar();
        } else {
            tempoRestante--;
            let minutos = Math.floor(tempoRestante / 60);
            let segundos = tempoRestante % 60;
            
            document.getElementById(displayElementId).innerText = 
                `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
        }
    }, 1000);
}

function pararCronometro() {
    clearInterval(intervaloTimer);
}