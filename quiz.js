// URL de la API de Sheety
const SHEETY_API_URL = 'https://api.sheety.co/ecb8569b38f7b237fb3d2393b5a46b67/preguntados/hoja1';
const QUESTIONS_PER_GAME = 10; // Número de preguntas por juego

let questions = [];
let currentQuestion = 0;
let score = 0;
let canAnswer = true;

// Elementos del DOM
const questionNumber = document.getElementById('question-number');
const scoreDisplay = document.getElementById('score');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const nextButton = document.getElementById('next-btn');
const endButton = document.getElementById('end-btn');
const resultContainer = document.getElementById('result-container');
const finalScore = document.getElementById('final-score');
const restartButton = document.getElementById('restart-btn');
const loadingSpinner = document.getElementById('loading-spinner');

// Función para obtener preguntas de Sheety
async function fetchQuestions() {
    try {
        showLoading(true);
        const response = await fetch(SHEETY_API_URL);
        if (!response.ok) {
            throw new Error('Error al cargar las preguntas');
        }
        const data = await response.json();

        // Transformar datos de Sheety al formato necesario
        const allQuestions = data[Object.keys(data)[0]].map(row => ({
            question: row.pregunta,
            options: [
                row.opcion1,
                row.opcion2,
                row.opcion3,
                row.opcion4
            ],
            correctAnswer: parseInt(row.respuestaCorrecta) - 1
        }));

        // Mezclar todas las preguntas
        shuffleArray(allQuestions);

        // Seleccionar solo las primeras 10 preguntas
        questions = allQuestions.slice(0, QUESTIONS_PER_GAME);
        
        showLoading(false);
        return true;
    } catch (error) {
        console.error('Error fetching questions:', error);
        showError('Error al cargar las preguntas. Por favor, intenta de nuevo.');
        showLoading(false);
        return false;
    }
}

// Función para mezclar un array (Fisher-Yates shuffle)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Función para inicializar el quiz
async function initQuiz() {
    const questionContainer = document.getElementById('question-container');
    const optionsContainer = document.getElementById('options-container');
    questionContainer.style.display = 'none';
    optionsContainer.style.display = 'none';
    resultContainer.style.display = 'none';

    currentQuestion = 0;
    score = 0;

    const questionsLoaded = await fetchQuestions();
    if (!questionsLoaded) return;

    questionContainer.style.display = 'block';
    optionsContainer.style.display = 'grid';
    showQuestion();
    updateStatusBar();
}

// Función para mostrar la pregunta actual
function showQuestion() {
    const question = questions[currentQuestion];
    questionText.textContent = question.question;

    optionsContainer.innerHTML = '';
    canAnswer = true;
    nextButton.style.display = 'none';
    endButton.style.display = 'none';
    
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option';
        button.textContent = option;
        button.onclick = () => checkAnswer(index);
        optionsContainer.appendChild(button);
    });
}

// Función para verificar la respuesta
function checkAnswer(selectedIndex) {
    if (!canAnswer) return;

    canAnswer = false;
    const question = questions[currentQuestion];
    const options = optionsContainer.children;

    for (let i = 0; i < options.length; i++) {
        if (i === question.correctAnswer) {
            options[i].classList.add('correct');
        } else if (i === selectedIndex) {
            options[i].classList.add('incorrect');
        } else {
            options[i].disabled = true;
        }
    }

    if (selectedIndex === question.correctAnswer) {
        score++;
        scoreDisplay.textContent = `Puntos: ${score}`;
    }

    if (currentQuestion === QUESTIONS_PER_GAME - 1) {
        nextButton.style.display = 'none';
        endButton.style.display = 'block';
    } else {
        nextButton.style.display = 'block';
        endButton.style.display = 'none';
    }
}

// Función para mostrar resultados
function showResults() {
    endButton.style.display = 'none';
    const questionContainer = document.getElementById('question-container');
    questionContainer.style.display = 'none';
    optionsContainer.style.display = 'none';
    resultContainer.style.display = 'block';

    finalScore.textContent = `Puntuación final: ${score} de ${QUESTIONS_PER_GAME}`;
    restartButton.style.display='block';
}

// Función para actualizar la barra de estado
function updateStatusBar() {
    questionNumber.textContent = `Pregunta ${currentQuestion + 1}/${QUESTIONS_PER_GAME}`;
    scoreDisplay.textContent = `Puntos: ${score}`;
}

// Función para mostrar/ocultar el spinner de carga
function showLoading(show) {
    if (loadingSpinner) {
        loadingSpinner.style.display = show ? 'block' : 'none';
    }
}

// Función para mostrar errores
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

// Event Listeners
nextButton.addEventListener('click', () => {
    currentQuestion++;
    showQuestion();
    updateStatusBar();
});

endButton.addEventListener('click', () => {
    showResults();
});

restartButton.addEventListener('click', async () => {
    const questionContainer = document.getElementById('question-container');
    questionContainer.style.display = 'none';
    optionsContainer.style.display = 'none';
    resultContainer.style.display = 'none';

    showLoading(true);
    await new Promise(resolve => setTimeout(resolve, 100));
    await initQuiz();
});

// Iniciar el quiz
document.addEventListener('DOMContentLoaded', initQuiz);