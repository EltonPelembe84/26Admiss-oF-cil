let dadosTemporariosRegisto = {};

// Alternar entre telas
function irParaPasso(passo) {
    document.getElementById('card-login').classList.add('hidden');
    document.getElementById('card-reg-passo1').classList.add('hidden');
    document.getElementById('card-reg-passo2').classList.add('hidden');

    if (passo === 'login') {
        document.getElementById('card-login').classList.remove('hidden');
    } else if (passo === 'registar-passo1') {
        document.getElementById('card-reg-passo1').classList.remove('hidden');
    } else if (passo === 'registar-passo2') {
        document.getElementById('card-reg-passo2').classList.remove('hidden');
    }
}

// PASSO 1: Guarda Temporariamente Nome/Email/Senha e vai para o Passo 2
function avancarParaPasso2(e) {
    e.preventDefault();

    const nome = document.getElementById('reg-nome').value.trim();
    const email = document.getElementById('reg-email').value.trim().toLowerCase();
    const senha = document.getElementById('reg-senha').value;

    let utilizadores = JSON.parse(localStorage.getItem('admissao_utilizadores')) || [];
    const utilizadorExiste = utilizadores.find(u => u.email === email);
    
    if (utilizadorExiste) {
        alert('Este email já está registado. Tente fazer login!');
        return;
    }

    dadosTemporariosRegisto = { nome, email, senha };
    irParaPasso('registar-passo2');
}

// PASSO 2: Recolhe Universidade, Curso e Disciplinas e Finaliza
function finalizarRegisto(e) {
    e.preventDefault();

    const universidade = document.getElementById('reg-universidade').value;
    const curso = document.getElementById('reg-curso').value.trim();
    
    // Obter disciplinas selecionadas
    const checkboxes = document.querySelectorAll('input[name="disciplinas"]:checked');
    const disciplinas = Array.from(checkboxes).map(cb => cb.value);

    if (disciplinas.length < 1) {
        alert('Por favor, selecione pelo menos 1 disciplina que pretende preparar!');
        return;
    }

    // Objeto completo do Utilizador Personalizado
    const novoUtilizador = {
        ...dadosTemporariosRegisto,
        universidade: universidade,
        curso: curso,
        disciplinas: disciplinas,
        simuladosFeitos: 0,
        mediaAcertos: 0
    };

    let utilizadores = JSON.parse(localStorage.getItem('admissao_utilizadores')) || [];
    utilizadores.push(novoUtilizador);

    // Guardar utilizadores e sessão ativa
    localStorage.setItem('admissao_utilizadores', JSON.stringify(utilizadores));
    localStorage.setItem('admissao_usuario_logado', JSON.stringify(novoUtilizador));

    alert(`Parabéns ${novoUtilizador.nome}! O teu plano focado para ${novoUtilizador.curso} na ${novoUtilizador.universidade} está pronto!`);
    window.location.href = 'dashboard.html';
}

// FAZER LOGIN
function fazerLogin(e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const senha = document.getElementById('login-senha').value;

    let utilizadores = JSON.parse(localStorage.getItem('admissao_utilizadores')) || [];
    const utilizadorEncontrado = utilizadores.find(u => u.email === email && u.senha === senha);

    if (utilizadorEncontrado) {
        localStorage.setItem('admissao_usuario_logado', JSON.stringify(utilizadorEncontrado));
        window.location.href = 'dashboard.html';
    } else {
        alert('Email ou palavra-passe incorretos!');
    }
}

// VERIFICAR SE ESTÁ LOGADO
function verificarAutenticacao() {
    const usuarioLogado = JSON.parse(localStorage.getItem('admissao_usuario_logado'));
    if (!usuarioLogado) {
        window.location.href = 'login.html';
    }
    return usuarioLogado;
}