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
    // Get user name from localStorage or default
    const userName = localStorage.getItem('userName') || 'Sofia';
    
    // Update greeting in welcome line
    const subtextElement = document.querySelector('.motivational-subtext');
    if (subtextElement) {
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
    
    // Update profile name and avatar
    updateUserProfile();
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
    // Clear all previous errors
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    document.querySelectorAll('.input-field').forEach(el => el.classList.remove('error'));
    
    // Validate current question before moving to next
    const currentCard = document.querySelector('.question-card.active');
    const currentQuestionNum = parseInt(currentCard.dataset.question);
    
    // Validation for each question
    if (currentQuestionNum === 1) {
        const nameInput = document.getElementById('user-name');
        if (!nameInput.value.trim()) {
            showError('user-name', 'name-error', 'Name is required');
            return;
        }
    } else if (currentQuestionNum === 2) {
        const ageInput = document.getElementById('age');
        if (!ageInput.value) {
            showError('age', 'age-error', 'Age is required');
            return;
        }
        if (ageInput.value < 13 || ageInput.value > 60) {
            showError('age', 'age-error', 'Age must be between 13 and 60');
            return;
        }
    } else if (currentQuestionNum === 3) {
        const lastPeriodInput = document.getElementById('last-period');
        if (!lastPeriodInput.value) {
            showError('last-period', 'period-error', 'Last period date is required');
            return;
        }
    }
    
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

// Show error message and highlight field
function showError(inputId, errorId, message) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    
    if (input) {
        input.classList.add('error');
        input.focus();
    }
    
    if (error) {
        error.textContent = message;
    }
}

// Clear error when user starts typing
document.addEventListener('DOMContentLoaded', () => {
    // Add event listeners to clear errors on input
    const inputs = ['user-name', 'age', 'last-period'];
    inputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', () => {
                input.classList.remove('error');
                const errorId = inputId === 'user-name' ? 'name-error' : 
                               inputId === 'age' ? 'age-error' : 'period-error';
                const error = document.getElementById(errorId);
                if (error) error.textContent = '';
            });
        }
    });
});

function updateProgress() {
    const progressFill = document.getElementById('progress-fill');
    const percentage = (currentQuestion / 4) * 100;
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

// Update user profile display
function updateUserProfile() {
    const userName = localStorage.getItem('userName') || 'Sofia';
    const profileNameElement = document.getElementById('profile-name');
    const profileAvatarElement = document.getElementById('profile-avatar');
    
    if (profileNameElement) {
        profileNameElement.textContent = userName;
    }
    
    if (profileAvatarElement) {
        // Get first letter of name for avatar
        profileAvatarElement.textContent = userName.charAt(0).toUpperCase();
    }
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
    // Clear all previous errors
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    document.querySelectorAll('.input-field').forEach(el => el.classList.remove('error'));
    
    // Validate ALL required fields
    const userNameInput = document.getElementById('user-name');
    const ageInput = document.getElementById('age');
    const lastPeriodInput = document.getElementById('last-period');
    
    let hasError = false;
    
    if (!userNameInput || !userNameInput.value.trim()) {
        showPage('questionnaire-page');
        document.querySelectorAll('.question-card').forEach(card => card.classList.remove('active'));
        document.querySelector('.question-card[data-question="1"]').classList.add('active');
        currentQuestion = 1;
        updateProgress();
        showError('user-name', 'name-error', 'Name is required');
        return;
    }
    
    if (!ageInput || !ageInput.value) {
        showPage('questionnaire-page');
        document.querySelectorAll('.question-card').forEach(card => card.classList.remove('active'));
        document.querySelector('.question-card[data-question="2"]').classList.add('active');
        currentQuestion = 2;
        updateProgress();
        showError('age', 'age-error', 'Age is required');
        return;
    }
    
    if (ageInput.value < 13 || ageInput.value > 60) {
        showPage('questionnaire-page');
        document.querySelectorAll('.question-card').forEach(card => card.classList.remove('active'));
        document.querySelector('.question-card[data-question="2"]').classList.add('active');
        currentQuestion = 2;
        updateProgress();
        showError('age', 'age-error', 'Age must be between 13 and 60');
        return;
    }
    
    if (!lastPeriodInput || !lastPeriodInput.value) {
        showPage('questionnaire-page');
        document.querySelectorAll('.question-card').forEach(card => card.classList.remove('active'));
        document.querySelector('.question-card[data-question="3"]').classList.add('active');
        currentQuestion = 3;
        updateProgress();
        showError('last-period', 'period-error', 'Last period date is required');
        return;
    }
    
    // All validations passed - save data
    localStorage.setItem('userName', userNameInput.value.trim());
    localStorage.setItem('userAge', ageInput.value);
    localStorage.setItem('lastPeriod', lastPeriodInput.value);
    localStorage.setItem('cycleDays', cycleDays);
    
    completeOnboarding();
    showPage('dashboard-page');
    
    // Update profile and content after showing dashboard
    setTimeout(() => {
        updateUserProfile();
        updateTimeBasedContent();
    }, 100);
}

// Check on page load if user should go directly to dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Apply theme on load
    applyTheme();
    
    // Update user profile on load
    updateUserProfile();
    
    // Set max date for last period input (today)
    const today = new Date().toISOString().split('T')[0];
    const lastPeriodInput = document.getElementById('last-period');
    if (lastPeriodInput) {
        lastPeriodInput.value = today;
        lastPeriodInput.max = today;  // Block future dates
    }
    
    // Check if user has name - if not, force onboarding
    const userName = localStorage.getItem('userName');
    if (!userName || userName.trim() === '') {
        // No user name - force onboarding
        localStorage.removeItem('onboardingCompleted');
        showPage('landing-page');
    } else if (window.location.hash === '#dashboard') {
        // Has name and navigating to dashboard
        if (hasCompletedOnboarding()) {
            showPage('dashboard-page');
            setTimeout(() => {
                updateTimeBasedContent();
            }, 100);
        }
    } else if (hasCompletedOnboarding()) {
        // Has name and completed onboarding - show dashboard
        showPage('dashboard-page');
        setTimeout(() => {
            updateTimeBasedContent();
        }, 100);
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

// ===== PROFILE SETTINGS MODAL =====
function openProfileSettings() {
    const modal = document.getElementById('profileSettingsModal');
    if (modal) {
        // Clear any previous errors
        document.querySelectorAll('#profileSettingsModal .error-message').forEach(el => el.textContent = '');
        document.querySelectorAll('#profileSettingsModal .input-field').forEach(el => el.classList.remove('error'));
        
        // Load current values
        document.getElementById('settings-name').value = localStorage.getItem('userName') || '';
        document.getElementById('settings-age').value = localStorage.getItem('userAge') || '';
        document.getElementById('settings-last-period').value = localStorage.getItem('lastPeriod') || '';
        
        const cycleDays = parseInt(localStorage.getItem('cycleDays')) || 28;
        document.getElementById('settings-cycle-days').textContent = cycleDays;
        
        // Set max date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('settings-last-period').max = today;
        
        // Add event listeners to clear errors on input
        ['settings-name', 'settings-age', 'settings-last-period'].forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', () => {
                    input.classList.remove('error');
                    const errorId = inputId + '-error';
                    const error = document.getElementById(errorId);
                    if (error) error.textContent = '';
                });
            }
        });
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeProfileSettings() {
    const modal = document.getElementById('profileSettingsModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function adjustSettingsCycle(change) {
    const cycleElement = document.getElementById('settings-cycle-days');
    let currentCycle = parseInt(cycleElement.textContent);
    currentCycle = Math.max(21, Math.min(45, currentCycle + change));
    cycleElement.textContent = currentCycle;
}

function saveProfileSettings() {
    // Clear previous errors
    document.querySelectorAll('#profileSettingsModal .error-message').forEach(el => el.textContent = '');
    document.querySelectorAll('#profileSettingsModal .input-field').forEach(el => el.classList.remove('error'));
    
    const name = document.getElementById('settings-name').value.trim();
    const age = document.getElementById('settings-age').value;
    const lastPeriod = document.getElementById('settings-last-period').value;
    const cycleDays = parseInt(document.getElementById('settings-cycle-days').textContent);
    
    let hasError = false;
    
    // Validate all required fields
    if (!name) {
        showSettingsError('settings-name', 'settings-name-error', 'Name is required');
        hasError = true;
    }
    
    if (!age) {
        showSettingsError('settings-age', 'settings-age-error', 'Age is required');
        hasError = true;
    } else if (age < 13 || age > 60) {
        showSettingsError('settings-age', 'settings-age-error', 'Age must be between 13 and 60');
        hasError = true;
    }
    
    if (!lastPeriod) {
        showSettingsError('settings-last-period', 'settings-period-error', 'Last period date is required');
        hasError = true;
    }
    
    if (hasError) {
        return;
    }
    
    // Save all settings
    localStorage.setItem('userName', name);
    localStorage.setItem('userAge', age);
    localStorage.setItem('lastPeriod', lastPeriod);
    localStorage.setItem('cycleDays', cycleDays);
    
    // Update UI
    updateUserProfile();
    updateTimeBasedContent();
    
    // Show success message
    alert('Profile updated successfully! 🎉');
    
    closeProfileSettings();
}

function showSettingsError(inputId, errorId, message) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    
    if (input) {
        input.classList.add('error');
    }
    
    if (error) {
        error.textContent = message;
    }
}

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeHowItWorksModal();
        closeProfileSettings();
    }
});
