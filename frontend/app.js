// Carrega todas as conversas salvas ou começa vazio
let conversations = JSON.parse(localStorage.getItem('conversations')) || [];

// ID da conversa atual
let currentId = null;

// Renderiza o histórico na sidebar
function renderHistory() {
    const list = document.getElementById('history-list');
    list.innerHTML = '';

    conversations.forEach(conv => {
        const item = document.createElement('div');
        item.className = 'history-item' + (conv.id === currentId ? ' active' : '');

        item.innerHTML = `
            <span class="history-item-title">${conv.title}</span>
            <button class="delete-btn" onclick="deleteConversation(event, '${conv.id}')">✕</button>
        `;

        item.onclick = () => loadConversation(conv.id);
        list.appendChild(item);
    });
}

// Carrega uma conversa existente
function loadConversation(id) {
    currentId = id;
    const conv = conversations.find(c => c.id === id);
    if (!conv) return;

    const titleEl = document.getElementById('chat-title');
    if (titleEl) titleEl.textContent = conv.title;

    document.getElementById('chat').innerHTML = '';

    conv.messages.forEach(msg => {
        if (msg.role === 'user' || msg.role === 'assistant') {
            addBubble(msg.role, msg.content);
        }
    });

    renderHistory();
}

// Cria uma nova conversa
function newChat() {
    currentId = null;
    document.getElementById('chat').innerHTML = '';
    const titleEl = document.getElementById('chat-title');
if (titleEl) titleEl.textContent = 'Nova conversa';
    renderHistory();
}

// Deleta uma conversa
function deleteConversation(event, id) {
    event.stopPropagation(); // evita abrir a conversa ao deletar
    conversations = conversations.filter(c => c.id !== id);
    localStorage.setItem('conversations', JSON.stringify(conversations));

    if (currentId === id) {
        newChat();
    }

    renderHistory();
}

// Preenche o input com sugestão e envia
function fillInput(text) {
    document.getElementById('user-input').value = text;
    sendMessage();
}

async function sendMessage() {
    const input = document.getElementById('user-input');
    const text = input.value.trim();
    if (!text) return;

    // Esconde a tela de boas-vindas ao começar a conversar
    const welcome = document.getElementById('welcome');
    if (welcome) welcome.remove();

    // Se não tem conversa ativa, cria uma nova
    if (!currentId) {
        const newConv = {
            id: Date.now().toString(),
            title: text.substring(0, 30) + (text.length > 30 ? '...' : ''),
            messages: []
        };
        conversations.unshift(newConv); // adiciona no topo
        currentId = newConv.id;
        const titleEl = document.getElementById('chat-title');
if (titleEl) titleEl.textContent = newConv.title;
    }

    // Pega a conversa atual
    const conv = conversations.find(c => c.id === currentId);

    // Adiciona mensagem do usuário
    conv.messages.push({ role: 'user', content: text });
    localStorage.setItem('conversations', JSON.stringify(conversations));

    addBubble('user', text);
    input.value = '';
    renderHistory();

    // Envia para o backend
    const res = await fetch('../backend/chat.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conv.messages }),
    });

    const data = await res.json();

    // Adiciona resposta do assistente
    conv.messages.push({ role: 'assistant', content: data.reply });
    localStorage.setItem('conversations', JSON.stringify(conversations));

    addBubble('assistant', data.reply);
}

function addBubble(role, text) {
    const chat = document.getElementById('chat');

    const row = document.createElement('div');
    row.className = 'bubble-row ' + role;

    if (role === 'assistant') {
        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        avatar.textContent = 'AI';
        row.appendChild(avatar);
    }

    const div = document.createElement('div');
    div.className = 'bubble ' + role;
    div.textContent = text;
    row.appendChild(div);

    chat.appendChild(row);
    chat.scrollTop = chat.scrollHeight;
}

// Mostra/esconde o campo de busca
function toggleSearch() {
    const overlay = document.getElementById('modal-overlay');
    overlay.classList.toggle('active');
    if (overlay.classList.contains('active')) {
        const input = document.getElementById('search-input');
        input.value = '';
        document.getElementById('search-results').innerHTML = '<div class="search-empty">Digite para buscar</div>';
        setTimeout(() => {
            input.focus();
            input.addEventListener('input', searchChats);
        }, 100);
    }
}

// Filtra conversas pelo texto digitado
function searchChats() {
    const query = document.getElementById('search-input').value.toLowerCase().trim();
    const results = document.getElementById('search-results');

    if (!query) {
        results.innerHTML = '<div class="search-empty">Digite para buscar</div>';
        return;
    }

    const filtered = conversations.filter(c =>
        c.title.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
        results.innerHTML = '<div class="search-empty">Nenhuma conversa encontrada</div>';
        return;
    }

    results.innerHTML = filtered.map(c => `
        <div class="search-result-item" onclick="loadConversation('${c.id}'); toggleSearch()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            ${c.title}
        </div>
    `).join('');
}

// Carrega o histórico ao abrir a página
renderHistory();