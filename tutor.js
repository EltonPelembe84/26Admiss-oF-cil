function enviarMensagem(e) {
    if (e) e.preventDefault();
    
    const input = document.getElementById('user-input');
    const texto = input.value.trim();

    if (!texto) return;

    // Adiciona mensagem do usuário
    adicionarMensagem(texto, 'user-message');
    input.value = '';

    // Simulação de resposta do Tutor IA
    setTimeout(() => {
        gerarRespostaBot(texto);
    }, 1000);
}

function usarPerguntaRapida(texto) {
    document.getElementById('user-input').value = texto;
    enviarMensagem();
}

function adicionarMensagem(texto, classe) {
    const chat = document.getElementById('chat-messages');
    const msg = document.createElement('div');
    msg.className = `message ${classe}`;
    msg.innerHTML = texto;
    chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;
}

function gerarRespostaBot(pergunta) {
    let resposta = "Essa é uma excelente dúvida! Para resolver essa questão no exame de admissão, lembre-se sempre de identificar primeiro os dados fornecidos e a fórmula/conceito principal aplicável.";

    if (pergunta.toLowerCase().includes('equações')) {
        resposta = "Para resolver uma **equação do 2º grau** ($ax^2 + bx + c = 0$), utilize a fórmula de Bhaskara:<br><strong>Δ = b² - 4ac</strong><br>Depois encontre as raízes com: <strong>x = (-b ± √Δ) / 2a</strong>.";
    } else if (pergunta.toLowerCase().includes('zambézia') || pergunta.toLowerCase().includes('português')) {
        resposta = "A chave para questões de Português nos exames de admissão é analisar bem a coesão textual e a função dos conectores nas frases!";
    }

    adicionarMensagem(resposta, 'bot-message');
}