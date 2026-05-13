<?php
// Define que a resposta será em JSON
header('Content-Type: application/json');

// Permite que o frontend acesse esse arquivo (CORS)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');

// Lê o arquivo .env e pega a chave da OpenAI
$dotenv = parse_ini_file(__DIR__ . '/.env');
$apiKey = $dotenv['OPENAI_API_KEY'];

// Recebe o JSON enviado pelo frontend (as mensagens da conversa)
$body = json_decode(file_get_contents('php://input'), true);
$msgs = $body['messages'] ?? []; // se não vier nada, usa array vazio

// Monta o que vai ser enviado para a OpenAI
$payload = [
    'model' => 'gpt-4o-mini', // modelo mais barato e eficiente
    'messages' => array_merge(
        // Instrução inicial que define a personalidade do chatbot
        [['role' => 'system', 'content' => 'Você é um assistente útil e amigável.']],
        // Histórico completo da conversa (usuário + chatbot)
        $msgs
    ),
    'max_tokens' => 500, // limite de tamanho da resposta
];

// Abre uma conexão com a API da OpenAI
$ch = curl_init('https://api.openai.com/v1/chat/completions');

// Configura a requisição
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,  // retorna a resposta em vez de imprimir
    CURLOPT_POST => true,             // envia como POST
    CURLOPT_POSTFIELDS => json_encode($payload), // converte para JSON
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $apiKey, // autenticação com sua chave
    ],
]);

// Executa a requisição e fecha a conexão
$response = curl_exec($ch);
curl_close($ch);

// Converte a resposta da OpenAI de JSON para array PHP
$data = json_decode($response, true);

// Retorna só o texto da resposta para o frontend
echo json_encode([
    'reply' => $data['choices'][0]['message']['content'] ?? 'Erro na resposta.'
]);