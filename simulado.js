let alunoLogado = null;
let disciplinaAtual = '';
let exameAtualNum = 1;
let tempoRestante = 45 * 60;
let timerInterval = null;
let respostasAluno = {};

const bancoQuestoes = {
    'Física': [
        { q: "Qual é a unidade da Força no Sistema Internacional (SI)?", opts: ["Joule", "Newton", "Watt", "Pascal"], ans: 1 },
        { q: "A primeira lei de Newton é também conhecida como lei da...", opts: ["Ação e Reação", "Inércia", "Gravidade", "Energia"], ans: 1 }
    ],
    'Matemática': [
        { q: "Qual é o valor de x na equação 2x + 8 = 16?", opts: ["x = 2", "x = 4", "x = 6", "x = 8"], ans: 1 }
    ],
    'Português': [
        { q: "Na frase 'O estudante passou no exame', qual é o sujeito?", opts: ["O estudante", "Exame", "Passou", "No"], ans: 0 }
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    // 1. Garantir que o modal inicia oculto
    const modal = document.getElementById('modal-simulado');
    if (modal) modal.classList.add('hidden');

    // 2. Carregar dados do aluno
    if (typeof verificarAutenticacao === 'function') {
        alunoLogado = verificarAutenticacao();
    } else {
        alunoLogado = JSON.parse(localStorage.getItem('admissao_usuario_logado')) || {
            email: 'aluno@teste.com',
            disciplinas: ['Física', 'Matemática']
        };
    }

    const disciplinas = alunoLogado.disciplinas || ['Física', 'Matemática'];
    
    // 3. Renderizar apenas a lista de disciplinas
    renderizarBotoesDisciplinas(disciplinas);

    // 4. Selecionar a primeira disciplina da lista por padrão
    if (disciplinas.length > 0) {
        selecionarDisciplina(disciplinas[0]);
    }
});

// Criar os botões das disciplinas do aluno
function renderizarBotoesDisciplinas(disciplinas) {
    const container = document.getElementById('disciplinas-buttons');
    if (!container) return;

    container.innerHTML = '';

    disciplinas.forEach(disc => {
        const btn = document.createElement('button');
        btn.className = 'btn-disc';
        btn.innerText = disc;
        btn.onclick = () => selecionarDisciplina(disc);
        container.appendChild(btn);
    });
}

// Quando o aluno clica numa disciplina
function selecionarDisciplina(disciplina) {
    disciplinaAtual = disciplina;

    // Atualizar estilo ativo nos botões
    document.querySelectorAll('.btn-disc').forEach(btn => {
        if (btn.innerText === disciplina) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Carregar a lista de exames daquela disciplina
    carregarExamesDisciplina(disciplina);
}

// Desenhar os 10 cards de exame (sem abrir nenhum)
function carregarExamesDisciplina(disciplina) {
    document.getElementById('disciplina-titulo').innerText = `Exames de ${disciplina}`;
    const grid = document.getElementById('exames-grid');
    if (!grid) return;

    grid.innerHTML = '';

    const progresso = JSON.parse(localStorage.getItem(`progresso_${alunoLogado.email}`)) || {};
    const progressoDisc = progresso[disciplina] || {};

    for (let i = 1; i <= 10; i++) {
        const card = document.createElement('div');
        
        let desbloqueado = (i === 1) || ((progressoDisc[i - 1] || 0) >= 15);
        const notaAtual = progressoDisc[i];

        if (desbloqueado) {
            card.className = 'exame-card unlocked';
            card.onclick = () => abrirSimulado(i);
            card.innerHTML = `
                <div class="status-icon">📝</div>
                <h4>Exame ${i}</h4>
                <p style="font-size:0.8rem; color:#666;">45 Minutos</p>
                ${notaAtual !== undefined ? `<div class="nota-badge">Melhor Nota: ${notaAtual}/20</div>` : '<div style="font-size:0.75rem; color:#2563eb; margin-top:5px; font-weight:bold;">Começar</div>'}
            `;
        } else {
            card.className = 'exame-card locked';
            card.innerHTML = `
                <div class="status-icon">🔒</div>
                <h4>Exame ${i}</h4>
                <p style="font-size:0.75rem; color:#64748b;">Bloqueado</p>
                <span style="font-size:0.7rem; color:#94a3b8;">Requer nota ≥ 15 no Exame ${i-1}</span>
            `;
        }

        grid.appendChild(card);
    }
}

// Esta função SÓ executa quando o estudante clica num Card de Exame
function abrirSimulado(numExame) {
    exameAtualNum = numExame;
    respostasAluno = {};
    tempoRestante = 45 * 60;

    document.getElementById('modal-titulo').innerText = `Exame ${numExame} - ${disciplinaAtual}`;
    document.getElementById('modal-simulado').classList.remove('hidden');

    renderizarQuestoes();
    iniciarCronometro();
}

function renderizarQuestoes() {
    const container = document.getElementById('questoes-container');
    const questoes = bancoQuestoes[disciplinaAtual] || bancoQuestoes['Física'];
    
    container.innerHTML = questoes.map((q, idx) => `
        <div style="margin-bottom: 1.2rem; text-align: left;">
            <p><strong>Questão ${idx + 1}:</strong> ${q.q}</p>
            ${q.opts.map((opt, oIdx) => `
                <label style="display:block; margin: 5px 0; cursor:pointer;">
                    <input type="radio" name="q_${idx}" value="${oIdx}" onclick="respostasAluno[${idx}] = ${oIdx}"> ${opt}
                </label>
            `).join('')}
        </div>
    `).join('');
}

function iniciarCronometro() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (tempoRestante <= 0) {
            clearInterval(timerInterval);
            finalizarEValidarExame();
        } else {
            tempoRestante--;
            let m = Math.floor(tempoRestante / 60);
            let s = tempoRestante % 60;
            document.getElementById('timer').innerText = `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
        }
    }, 1000);
}

function finalizarEValidarExame() {
    clearInterval(timerInterval);
    document.getElementById('modal-simulado').classList.add('hidden');

    const questoes = bancoQuestoes[disciplinaAtual] || bancoQuestoes['Física'];
    let acertos = 0;

    questoes.forEach((q, idx) => {
        if (respostasAluno[idx] === q.ans) acertos++;
    });

    const notaFinal = Math.round((acertos / questoes.length) * 20);

    let progresso = JSON.parse(localStorage.getItem(`progresso_${alunoLogado.email}`)) || {};
    if (!progresso[disciplinaAtual]) progresso[disciplinaAtual] = {};

    if (notaFinal > (progresso[disciplinaAtual][exameAtualNum] || 0)) {
        progresso[disciplinaAtual][exameAtualNum] = notaFinal;
        localStorage.setItem(`progresso_${alunoLogado.email}`, JSON.stringify(progresso));
    }

    if (notaFinal >= 15) {
        alert(`🎉 Parabéns! Obtiveste ${notaFinal}/20 valores no Exame ${exameAtualNum}.\n\nO Exame ${exameAtualNum + 1} foi desbloqueado! 🔓`);
    } else {
        alert(`📊 Obtiveste ${notaFinal}/20 valores.\n\nPrecisas de pelo menos 15 valores para desbloquear o Exame ${exameAtualNum + 1}.`);
    }

    carregarExamesDisciplina(disciplinaAtual);
}

function cancelarSimulado() {
    if (confirm("Desejas sair do exame?")) {
        clearInterval(timerInterval);
        document.getElementById('modal-simulado').classList.add('hidden');
    }
}