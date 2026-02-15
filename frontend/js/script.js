let cycleDays = 28;
let currentQuestion = 1;

// ===== TIME-BASED PERSONALIZATION =====
let timeMode = 'morning'; // 'morning', 'afternoon', or 'night'
let themeOverride = localStorage.getItem('themeOverride'); // null, 'light', or 'dark'

// Detect time mode with 3 periods
function detectTimeMode() {
    const hour = new Date().getHours();
    // Morning: 05:00–11:59, Afternoon: 12:00–17:59, Night: 18:00–04:59
    if (hour >= 5 && hour < 12) {
        return 'morning';
    } else if (hour >= 12 && hour < 18) {
        return 'afternoon';
    } else {
        return 'night';
    }
}

// Apply theme based on time or override
function applyTheme() {
    timeMode = detectTimeMode();
    const body = document.body;
    
    // Check if user has manual override
    if (themeOverride) {
        body.classList.remove('light-theme', 'dark-theme');
        body.classList.add(`${themeOverride}-theme`);
    } else {
        // Auto theme based on time
        body.classList.remove('light-theme', 'dark-theme');
        if (timeMode === 'night') {
            body.classList.add('dark-theme');
        } else {
            body.classList.add('light-theme');
        }
    }
    
    updateTimeBasedContent();
}

// Toggle theme manually
function toggleTheme() {
    const body = document.body;
    if (body.classList.contains('light-theme')) {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
        themeOverride = 'dark';
    } else {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
        themeOverride = 'light';
    }
    localStorage.setItem('themeOverride', themeOverride);
}

// Reset to auto theme
function resetToAutoTheme() {
    themeOverride = null;
    localStorage.removeItem('themeOverride');
    applyTheme();
}

// Update time-based content
function updateTimeBasedContent() {
    // Update greeting in welcome line
    const subtextElement = document.querySelector('.motivational-subtext');
    if (subtextElement) {
        const userName = 'Sofia'; // Could be dynamic from localStorage
        let greeting = '';
        
        if (timeMode === 'morning') {
            greeting = `Good morning, ${userName}! ☀️ Let's understand your body's rhythm together.`;
        } else if (timeMode === 'afternoon') {
            greeting = `Good afternoon, ${userName}! 🌸 Let's understand your body's rhythm together.`;
        } else {
            greeting = `Good night, ${userName}! 🌙 Let's understand your body's rhythm together.`;
        }
        
        subtextElement.textContent = greeting;
    }
    
    // Update motivational quote (mood-based, no greeting)
    const quoteElement = document.querySelector('.motivational-quote');
    if (quoteElement) {
        const moodQuotes = [
            '"You deserve softness and care today 💜"',
            '"Your body is doing amazing things for you"',
            '"Be gentle with yourself, you\'re glowing from within"',
            '"Every phase of your cycle is beautiful"',
            '"You are worthy of rest and nourishment"',
            '"Listen to what your body needs today"'
        ];
        // Pick a random quote or cycle through them
        const randomQuote = moodQuotes[Math.floor(Math.random() * moodQuotes.length)];
        quoteElement.textContent = randomQuote;
    }
}

// Get time-based journal prompt
function getJournalPrompt() {
    if (timeMode === 'morning') {
        return 'How are you feeling this morning?';
    } else if (timeMode === 'afternoon') {
        return 'How is your day going?';
    } else {
        return 'How was your day?';
    }
}

// Get time-based skincare routine
function getSkincareRoutine() {
    if (timeMode === 'morning') {
        return {
            title: 'AM Routine',
            icon: '☀️',
            steps: [
                'Gentle Cleanser',
                'Vitamin C Serum',
                'Moisturizer',
                'SPF 30+ Sunscreen'
            ]
        };
    } else if (timeMode === 'afternoon') {
        return {
            title: 'Light Refresh',
            icon: '🌸',
            steps: [
                'Facial Mist',
                'Reapply SPF',
                'Hydrating Serum',
                'Light Moisturizer'
            ]
        };
    } else {
        return {
            title: 'PM Routine',
            icon: '🌙',
            steps: [
                'Oil Cleanser',
                'Treatment Serum',
                'Night Moisturizer',
                'Eye Cream'
            ]
        };
    }
}

// Get time-based self-care suggestions
function getSelfCareSuggestions() {
    if (timeMode === 'morning') {
        return [
            '💧 Drink a glass of water',
            '🧘‍♀️ 5-minute morning stretch',
            '🥗 Nourishing breakfast',
            '☀️ Get some sunlight'
        ];
    } else if (timeMode === 'afternoon') {
        return [
            '🚶‍♀️ Take a 15-minute walk',
            '💧 Stay hydrated',
            '🧘‍♀️ Quick breathing exercise',
            '🌸 Check in with yourself'
        ];
    } else {
        return [
            '🛀 Take a warm bath',
            '📖 Journal your thoughts',
            '🧘‍♀️ Gentle stretching',
            '🌙 Wind down routine'
        ];
    }
}

// Dashboard view switching
function showDashboardView() {
    document.getElementById('dashboard-view').style.display = 'block';
    document.getElementById('about-view').style.display = 'none';
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');
}

function showAboutView() {
    document.getElementById('dashboard-view').style.display = 'none';
    document.getElementById('about-view').style.display = 'block';
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');
}

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

// Check if user has completed onboarding
function hasCompletedOnboarding() {
    return localStorage.getItem('onboardingCompleted') === 'true';
}

// Mark onboarding as complete
function completeOnboarding() {
    localStorage.setItem('onboardingCompleted', 'true');
}

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
    completeOnboarding(); // Mark onboarding as complete
    showPage('dashboard-page');
}

// Check on page load if user should go directly to dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Apply theme on load
    applyTheme();
    
    const today = new Date().toISOString().split('T')[0];
    const lastPeriodInput = document.getElementById('last-period');
    if (lastPeriodInput) {
        lastPeriodInput.value = today;
    }
    
    // Check if navigating to dashboard via hash
    if (window.location.hash === '#dashboard') {
        if (hasCompletedOnboarding()) {
            showPage('dashboard-page');
        }
    } else if (hasCompletedOnboarding()) {
        // If user has completed onboarding, show dashboard instead of landing
        showPage('dashboard-page');
    }
    
    // Update time-based content every minute
    setInterval(applyTheme, 60000);
});

// ===== HOW IT WORKS MODAL =====
function openHowItWorksModal() {
    const modal = document.getElementById('howItWorksModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
}

function closeHowItWorksModal() {
    const modal = document.getElementById('howItWorksModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }
}

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeHowItWorksModal();
    }
});
