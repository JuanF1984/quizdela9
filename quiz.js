// URL de la API de Sheety
const SHEETY_API_URL = 'https://api.sheety.co/ecb8569b38f7b237fb3d2393b5a46b67/preguntados/hoja1';

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
        questions = data[Object.keys(data)[0]].map(row => ({
            question: row.pregunta,
            options: [
                row.opcion1,
                row.opcion2,
                row.opcion3,
                row.opcion4
            ],
            correctAnswer: parseInt(row.respuestaCorrecta) - 1 // Asumiendo que en Sheets está como 1,2,3,4
        }));

        // Mezclar preguntas aleatoriamente
        shuffleQuestions();
        showLoading(false);
        return true;
    } catch (error) {
        console.error('Error fetching questions:', error);
        showError('Error al cargar las preguntas. Por favor, intenta de nuevo.');
        showLoading(false);
        return false;
    }
}

// Función para mezclar preguntas
function shuffleQuestions() {
    for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
    }
}

// Función para inicializar el quiz
async function initQuiz() {
    // Ocultar contenido anterior inmediatamente
    const questionContainer = document.getElementById('question-container');
    const optionsContainer = document.getElementById('options-container');
    questionContainer.style.display = 'none';
    optionsContainer.style.display = 'none';
    resultContainer.style.display = 'none';

    currentQuestion = 0;
    score = 0;

    // Cargar preguntas
    const questionsLoaded = await fetchQuestions();
    if (!questionsLoaded) return;

    // Mostrar contenido solo después de cargar las preguntas
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

    // Mostrar respuesta correcta e incorrecta
    for (let i = 0; i < options.length; i++) {
        if (i === question.correctAnswer) {
            options[i].classList.add('correct');
        } else if (i === selectedIndex) {
            options[i].classList.add('incorrect');
        } else {
            options[i].disabled = true;
        }
    }

    // Actualizar puntuación
    if (selectedIndex === question.correctAnswer) {
        score++;
        scoreDisplay.textContent = `Puntos: ${score}`;
    }

    // Esperar antes de mostrar los resultados en la última pregunta
    if (currentQuestion === questions.length - 1) {
        nextButton.style.display = 'none';
        endButton.style.display='block';
    } else {
        nextButton.style.display = 'block';
        endButton.style.display='none'
    }
}

// Función para mostrar resultados
function showResults() {
    endButton.style.display='none';
    const questionContainer = document.getElementById('question-container');
    questionContainer.style.display = 'none';
    optionsContainer.style.display = 'none';
    resultContainer.style.display = 'block';

    finalScore.textContent = `Puntuación final: ${score} de ${questions.length}`;
}

// Función para actualizar la barra de estado
function updateStatusBar() {
    questionNumber.textContent = `Pregunta ${currentQuestion + 1}/${questions.length}`;
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

endButton.addEventListener('click', ()=>{
    showResults();
})

// Event Listeners
restartButton.addEventListener('click', async () => {
    // Ocultar todo inmediatamente
    const questionContainer = document.getElementById('question-container');
    questionContainer.style.display = 'none';
    optionsContainer.style.display = 'none';
    resultContainer.style.display = 'none';

    // Mostrar loading
    showLoading(true);

    // Pequeña pausa para asegurar que la UI se actualice
    await new Promise(resolve => setTimeout(resolve, 100));

    // Iniciar el quiz
    await initQuiz();
});


// Iniciar el quiz
document.addEventListener('DOMContentLoaded', initQuiz);