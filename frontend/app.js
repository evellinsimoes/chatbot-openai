// Array que guarda todo o histórico da conversa
// É enviado completo a cada mensagem para o chatbot "lembrar" do contexto
const messages = [];

async function sendMessage() {
    // Pega o campo de texto e o valor digitado
    const input = document.getElementById('user-input');
    const text = input.value.trim(); // remove espaços em branco

    // Se o campo estiver vazio, não faz nada
    if (!text) return;

    // Adiciona a mensagem do usuário no histórico
    messages.push({ role: 'user', content: text });

    // Mostra a mensagem do usuário na tela
    addBubble('user', text);

    // Limpa o campo de texto
    input.value = '';

    // Envia o histórico completo para o backend PHP
    const res = await fetch('../backend/chat.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }), // converte array para JSON
    });

    // Recebe a resposta do backend
    const data = await res.json();

    // Adiciona a resposta do chatbot no histórico
    messages.push({ role: 'assistant', content: data.reply });

    // Mostra a resposta do chatbot na tela
    addBubble('assistant', data.reply);
}

// Função que cria e adiciona uma bolha de mensagem na tela
function addBubble(role, text) {
    const chat = document.getElementById('chat');

    // Cria um novo elemento div
    const div = document.createElement('div');

    // Adiciona as classes 'bubble' e 'user' ou 'assistant'
    div.className = 'bubble ' + role;

    // Define o texto da bolha
    div.textContent = text;

    // Adiciona a bolha na área do chat
    chat.appendChild(div);

    // Rola automaticamente para a última mensagem
    chat.scrollTop = chat.scrollHeight;
}