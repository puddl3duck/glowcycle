let cycleDays = 28;
let currentQuestion = 1;

// Navigation
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

function startQuestionnaire() {
    showPage('questionnaire-page');
    updateProgress();
}

function goToDashboard() {
    showPage('dashboard-page');
}

// Questionnaire
function nextQuestion(questionNumber) {
    // Hide current question
    document.querySelectorAll('.question-card').forEach(card => {
        card.classList.remove('active');
    });
    
    // Show next question
    const nextCard = document.querySelector(`.question-card[data-question="${questionNumber}"]`);
    if (nextCard) {
        nextCard.classList.add('active');
        currentQuestion = questionNumber;
        updateProgress();
    }
}

function updateProgress() {
    const progressFill = document.getElementById('progress-fill');
    const percentage = (currentQuestion / 3) * 100;
    progressFill.style.width = percentage + '%';
}

function adjustCycle(change) {
    cycleDays = Math.max(21, Math.min(45, cycleDays + change));
    document.getElementById('cycle-days').textContent = cycleDays;
}

// Set default date to today
document.addEventListener('DOMContentLoaded', () => {
    const today = new Date().toISOString().split('T')[0];
    const lastPeriodInput = document.getElementById('last-period');
    if (lastPeriodInput) {
        lastPeriodInput.value = today;
    }
});
