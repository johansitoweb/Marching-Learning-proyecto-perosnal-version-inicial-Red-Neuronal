const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const sendButton = document.getElementById('sendButton');
const loadingMessage = document.getElementById('loadingMessage');
const errorMessage = document.getElementById('errorMessage');

// Ocultar mensaje de carga y habilitar botón al cargar la página
loadingMessage.style.display = 'none';
sendButton.disabled = false;
sendButton.textContent = 'Enviar';

function addMessage(text, sender, extra = '') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = `bubble ${sender}`;
    bubbleDiv.innerHTML = text + (extra ? `<br><span style='font-size:0.9em;opacity:0.7;'>${extra}</span>` : '');
    messageDiv.appendChild(bubbleDiv);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function handleUserMessage(e) {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;
    errorMessage.textContent = '';
    addMessage(text, 'user');
    chatInput.value = '';
    sendButton.disabled = true;
    sendButton.textContent = 'Analizando...';
    try {
        const response = await fetch('http://localhost:5000/analizar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ texto: text })
        });
        const data = await response.json();
        let sentimentClass = '';
        if (data.sentimiento === 'Alegría') sentimentClass = 'sentiment-positive';
        else if (data.sentimiento === 'Tristeza' || data.sentimiento === 'Enojo' || data.sentimiento === 'Miedo') sentimentClass = 'sentiment-negative';
        else if (data.sentimiento === 'Amor' || data.sentimiento === 'Sorpresa') sentimentClass = 'sentiment-neutral';
        addMessage(`<span class='${sentimentClass}'>${data.sentimiento}</span>`, 'ia', `Confianza: ${(data.confianza * 100).toFixed(2)}%${data.mensaje ? '<br>' + data.mensaje : ''}`);
    } catch (error) {
        errorMessage.textContent = 'Error al procesar el texto o conectar con el servidor.';
    } finally {
        sendButton.disabled = false;
        sendButton.textContent = 'Enviar';
    }
}

chatForm.addEventListener('submit', handleUserMessage);