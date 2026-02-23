let cycleDays = 28;
let currentQuestion = 1;
let selectedSkinType = null;
let selectedPeriodOption = null; // 'date', 'cant-remember', or 'pregnant'

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
    
    // Update greeting with contextual intelligence
    const subtextElement = document.querySelector('.motivational-subtext');
    if (subtextElement) {
        const greeting = generateContextualGreeting(userName);
        subtextElement.textContent = greeting;
    }
    
    // Load AI-generated motivational message (just the quote, nothing else)
    loadAIMotivationalMessage(userName);
    
    // Update profile name and avatar
    updateUserProfile();
}

// Generate intelligent contextual greeting based on ALL user data
function generateContextualGreeting(userName) {
    const hasJournal = localStorage.getItem('hasJournalEntries') === 'true';
    const hasCycle = localStorage.getItem('lastPeriod');
    const hasSkin = localStorage.getItem('skinType');
    const periodOption = localStorage.getItem('periodOption');
    
    // Calculate data completeness
    const dataPoints = [hasJournal, hasCycle, hasSkin].filter(Boolean).length;
    
    // Time-based emoji
    const timeEmoji = timeMode === 'morning' ? '☀️' : timeMode === 'afternoon' ? '🌸' : '🌙';
    const timeGreeting = timeMode === 'morning' ? 'Good morning' : timeMode === 'afternoon' ? 'Good afternoon' : 'Good night';
    
    // FIRST TIME USER - No data yet
    if (dataPoints === 0) {
        return `${timeGreeting}, ${userName}! ${timeEmoji} Ready to track your unique patterns?`;
    }
    
    // PARTIAL DATA - Encourage completion
    if (dataPoints < 3) {
        const missing = [];
        if (!hasJournal) missing.push('journal');
        if (!hasCycle) missing.push('cycle');
        if (!hasSkin) missing.push('skin');
        
        const missingText = missing.length === 1 ? missing[0] : 'your profile';
        return `${timeGreeting}, ${userName}! ${timeEmoji} Complete your ${missingText} to unlock deeper insights.`;
    }
    
    // FULL DATA - Contextual variations
    // Use different messages based on time + pregnancy status
    if (periodOption === 'pregnant') {
        const variations = [
            `${timeGreeting}, ${userName}! ${timeEmoji} Supporting you and your little one today.`,
            `${timeGreeting}, ${userName}! ${timeEmoji} Your body is doing amazing things right now.`,
            `${timeGreeting}, ${userName}! ${timeEmoji} Let's nurture your wellness journey together.`
        ];
        return variations[Math.floor(Math.random() * variations.length)];
    }
    
    // Regular cycle tracking - varied messages
    const variations = [
        `${timeGreeting}, ${userName}! ${timeEmoji} Let's understand your body's rhythm together.`,
        `${timeGreeting}, ${userName}! ${timeEmoji} Your wellness journey continues today.`,
        `${timeGreeting}, ${userName}! ${timeEmoji} Tracking your cycle, skin, and mood in harmony.`,
        `${timeGreeting}, ${userName}! ${timeEmoji} Every phase tells a story - let's listen together.`
    ];
    
    // Use time-based seed for variation (changes throughout the day)
    const hour = new Date().getHours();
    const index = hour % variations.length;
    return variations[index];
}

// Load AI-generated motivational message from Wellness Agent
async function loadAIMotivationalMessage(userName) {
    const quoteElement = document.querySelector('.motivational-quote');
    if (!quoteElement) return;
    
    // Validate userName
    if (!userName || userName.trim() === '') {
        console.log('No username available');
        quoteElement.textContent = '"Complete your profile to unlock personalised wellness insights 💜"';
        return;
    }
    
    // Check data completeness
    const hasJournal = localStorage.getItem('hasJournalEntries') === 'true';
    const hasCycle = localStorage.getItem('lastPeriod');
    const hasSkin = localStorage.getItem('skinType');
    const dataPoints = [hasJournal, hasCycle, hasSkin].filter(Boolean).length;
    
    // FIRST TIME - No data yet (FIXED MESSAGE, NO AI)
    if (dataPoints === 0) {
        quoteElement.textContent = `"You're not alone in this journey 💜"`;
        return;
    }
    
    // PARTIAL DATA - Encourage completion with variety
    if (dataPoints < 3) {
        const encouragementMessages = [
            `"${userName}, the more I know about you, the better I can support you 💜"`,
            `"Keep building your profile, ${userName} - deeper insights are coming 💜"`,
            `"Your wellness story is unfolding, ${userName} - let's complete it together 💜"`
        ];
        quoteElement.textContent = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
        
        // Still try to fetch AI message in background
        fetchAIMessageInBackground(userName, quoteElement);
        return;
    }
    
    // FULL DATA - Show loading then fetch AI
    quoteElement.textContent = '"Crafting your personalised message..."';
    
    try {
        // Fetch wellness support from backend
        const API_BASE = API_CONFIG?.BASE_URL || 'https://7ofiibs7k7.execute-api.ap-southeast-2.amazonaws.com/prod';
        const url = `${API_BASE}/wellness?user=${encodeURIComponent(userName.trim())}`;
        console.log('Fetching wellness from:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Backend error:', response.status, errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('AI Wellness data received:', data);
        
        if (data.wellness && data.wellness.support_message) {
            // Use ONLY the AI-generated support message as the quote
            quoteElement.textContent = `"${data.wellness.support_message}"`;
            
            // Store wellness data for debugging
            window.currentWellnessData = data.wellness;
            console.log('AI personalised message loaded:', data.wellness.support_message);
        } else {
            throw new Error('No wellness message in response');
        }
        
    } catch (error) {
        console.error('Error loading AI motivational message:', error);
        // Fallback with contextual variety
        const fallbackMessages = [
            `"${userName}, your body's wisdom is unique - I'm here to help you understand it 💜"`,
            `"Every day is a new chapter in your wellness story, ${userName} 💜"`,
            `"${userName}, trust your body's signals - I'm here to help you listen 💜"`
        ];
        quoteElement.textContent = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
    }
}

// Helper function to fetch AI message in background without blocking UI
async function fetchAIMessageInBackground(userName, quoteElement) {
    try {
        const API_BASE = API_CONFIG?.BASE_URL || 'https://7ofiibs7k7.execute-api.ap-southeast-2.amazonaws.com/prod';
        const url = `${API_BASE}/wellness?user=${encodeURIComponent(userName.trim())}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.wellness && data.wellness.support_message) {
                // Update with AI message if available
                quoteElement.textContent = `"${data.wellness.support_message}"`;
                window.currentWellnessData = data.wellness;
            }
        }
    } catch (error) {
        console.log('Background AI fetch failed, keeping fallback message');
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
    
    // CRITICAL: Refresh wellness message when returning to dashboard
    // This ensures the message updates with any new data (journal, skin, cycle)
    if (pageId === 'dashboard-page') {
        // Small delay to ensure page is visible before loading message
        setTimeout(() => {
            if (typeof initializeWellnessMessage === 'function') {
                const userName = localStorage.getItem('userName');
                if (userName) {
                    console.log('🔄 Dashboard shown - refreshing wellness message with latest data');
                    initializeWellnessMessage();
                }
            }
        }, 100);
    }
}

function startQuestionnaire() {
    showPage('questionnaire-page');
    updateProgress();
}

function backToLanding() {
    // Get current active question
    const activeCard = document.querySelector('.question-card.active');
    const currentQuestion = parseInt(activeCard.dataset.question);
    
    // If on first question, go back to landing page
    if (currentQuestion === 1) {
        showPage('landing-page');
        return;
    }
    
    // Otherwise, go to previous question
    const previousQuestion = currentQuestion - 1;
    document.querySelectorAll('.question-card').forEach(card => card.classList.remove('active'));
    document.querySelector(`.question-card[data-question="${previousQuestion}"]`).classList.add('active');
    
    // Update progress bar
    updateProgress();
}

function goToDashboard() {
    showPage('dashboard-page');
}

// Questionnaire
function selectPeriodOption(option) {
    // Remove selected class from all alternative buttons
    document.querySelectorAll('.alternative-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Add selected class to clicked button
    const selectedBtn = event.target.closest('.alternative-btn');
    if (selectedBtn) {
        selectedBtn.classList.add('selected');
    }
    
    // Store selection
    selectedPeriodOption = option;
    
    // Clear date input if alternative is selected
    const dateInput = document.getElementById('last-period');
    if (dateInput) {
        dateInput.value = '';
    }
    
    // Clear error if any
    const errorElement = document.getElementById('period-error');
    if (errorElement) {
        errorElement.textContent = '';
    }
}

function selectSkinType(type) {
    // Remove selected class from all options
    document.querySelectorAll('.skin-type-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Add selected class to clicked option
    const selectedOption = document.querySelector(`.skin-type-option[data-type="${type}"]`);
    if (selectedOption) {
        selectedOption.classList.add('selected');
    }
    
    // Store selection
    selectedSkinType = type;
    localStorage.setItem('skinType', type);

    // Enable next button
    const nextBtn = document.getElementById('skin-type-next');
    if (nextBtn) {
        nextBtn.disabled = false;
    }
    
    // Clear error if any
    const errorElement = document.getElementById('skin-type-error');
    if (errorElement) {
        errorElement.textContent = '';
    }
}

function nextQuestion(questionNumber) {
    // Clear all previous errors
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    document.querySelectorAll('.input-field').forEach(el => el.classList.remove('error'));
    
    // Validate current question before moving to next
    const currentCard = document.querySelector('.question-card.active');
    const currentQuestionNum = parseInt(currentCard.dataset.question);
    
    // Check if this is a judge account
    const isJudgeAccount = localStorage.getItem('isJudgeAccount') === 'true';
    
    // Validation for each question
    if (currentQuestionNum === 1 && !isJudgeAccount) {
        // Validate name and password for non-judge accounts
        const nameInput = document.getElementById('user-name');
        const passwordInput = document.getElementById('user-password');
        
        if (!nameInput.value.trim()) {
            showError('user-name', 'name-error', 'Name is required');
            return;
        }
        
        if (!passwordInput.value.trim()) {
            showError('user-password', 'password-error', 'Password is required');
            return;
        }
        
        if (passwordInput.value.length < 4) {
            showError('user-password', 'password-error', 'Password must be at least 4 characters long');
            return;
        }
        
        // Save user credentials when moving from question 1
        const username = nameInput.value.trim();
        const password = passwordInput.value.trim();
        
        // Create user account (async)
        createUserAccount(username, password).then(success => {
            if (success) {
                // Continue to next question
                proceedToNextQuestion(questionNumber);
            }
        });
        return; // Don't continue immediately
        
    } else if (currentQuestionNum === 2) {
        const ageInput = document.getElementById('age');
        if (!ageInput.value) {
            showError('age', 'age-error', 'Age is required');
            return;
        }
        if (ageInput.value < 10 || ageInput.value > 60) {
            showError('age', 'age-error', 'Age must be between 10 and 60');
            return;
        }
    } else if (currentQuestionNum === 3) {
        const lastPeriodInput = document.getElementById('last-period');
        const hasDate = lastPeriodInput && lastPeriodInput.value;
        const hasAlternative = selectedPeriodOption;
        
        if (!hasDate && !hasAlternative) {
            showError('last-period', 'period-error', 'Please select a date or choose an option below');
            return;
        }
    } else if (currentQuestionNum === 4) {
        // Validate skin type selection
        if (!selectedSkinType) {
            const errorElement = document.getElementById('skin-type-error');
            if (errorElement) {
                errorElement.textContent = 'Please select your skin type';
            }
            return;
        }
    }
    
    // Continue to next question
    proceedToNextQuestion(questionNumber);
}

function proceedToNextQuestion(questionNumber) {
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

// Create user account function
async function createUserAccount(displayName, password) {
    try {
        // Create normalized username from display name
        const username = displayName.toLowerCase().replace(/\s+/g, '');
        
        // ALWAYS save to localStorage first (works without backend)
        localStorage.setItem('userName', username);
        localStorage.setItem('userDisplayName', displayName);
        localStorage.setItem('isJudgeAccount', 'false');
        localStorage.setItem('userPassword', password); // Store for later backend sync
        
        console.log('✅ User account saved locally:', username);
        
        // Try to save to backend (optional - won't block if backend not deployed)
        try {
            const API_BASE = API_CONFIG?.BASE_URL || 'https://7ofiibs7k7.execute-api.ap-southeast-2.amazonaws.com/prod';
            
            const response = await fetch(`${API_BASE}/user/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                    displayName: displayName
                })
            });
            
            if (response.ok) {
                console.log('✅ User account also saved to backend');
            } else {
                console.warn('⚠️ Backend save failed, but local save succeeded');
            }
        } catch (backendError) {
            console.warn('⚠️ Backend not available, using local storage only:', backendError.message);
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Error creating user account:', error);
        showError('user-name', 'name-error', 'Failed to create account. Please try again.');
        return false;
    }
}

// Mark user setup as complete
async function markUserSetupComplete(username) {
    try {
        const API_BASE = API_CONFIG?.BASE_URL || 'https://7ofiibs7k7.execute-api.ap-southeast-2.amazonaws.com/prod';
        
        const response = await fetch(`${API_BASE}/user/complete-setup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username
            })
        });
        
        if (response.ok) {
            console.log('✅ User setup marked as complete in backend');
        } else {
            console.error('❌ Failed to mark setup as complete in backend');
        }
        
    } catch (error) {
        console.error('Error marking setup complete:', error);
    }
}
// Clear error when user starts typing
document.addEventListener('DOMContentLoaded', () => {
    // Add event listeners to clear errors on input
    const inputs = ['user-name', 'age', 'last-period'];
    updatePreviewCard();
    inputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', () => {
                input.classList.remove('error');
                const errorId = inputId === 'user-name' ? 'name-error' : 
                               inputId === 'age' ? 'age-error' : 'period-error';
                const error = document.getElementById(errorId);
                if (error) error.textContent = '';
                
                // If user types in period date, clear alternative selections
                if (inputId === 'last-period' && input.value) {
                    selectedPeriodOption = null;
                    document.querySelectorAll('.alternative-btn').forEach(btn => {
                        btn.classList.remove('selected');
                    });
                }
            });
        }
    });
});

function updateProgress() {
    const progressFill = document.getElementById('progress-fill');
    const percentage = (currentQuestion / 5) * 100;
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
    const userDisplayName = localStorage.getItem('userDisplayName');
    const userName = localStorage.getItem('userName');
    
    console.log('🔍 DEBUG updateUserProfile:');
    console.log('  - userDisplayName:', userDisplayName);
    console.log('  - userName:', userName);
    
    const finalName = userDisplayName || userName || 'Beautiful';
    console.log('  - finalName:', finalName);
    
    const profileNameElement = document.getElementById('profile-name');
    const profileAvatarElement = document.getElementById('profile-avatar');
    const userNameDisplayElement = document.getElementById('user-name-display');
    
    if (profileNameElement) {
        profileNameElement.textContent = finalName;
    }
    
    if (profileAvatarElement) {
        // Get first letter of name for avatar
        profileAvatarElement.textContent = finalName.charAt(0).toUpperCase();
    }
    
    // Update welcome message with user name
    if (userNameDisplayElement) {
        userNameDisplayElement.textContent = finalName;
    }
}

// Navigation
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
    
    // CRITICAL: Refresh wellness message when returning to dashboard
    // This ensures the message updates with any new data (journal, skin, cycle)
    if (pageId === 'dashboard-page') {
        // Small delay to ensure page is visible before loading message
        setTimeout(() => {
            if (typeof initializeWellnessMessage === 'function') {
                const userName = localStorage.getItem('userName');
                if (userName) {
                    console.log('🔄 Dashboard shown - refreshing wellness message with latest data');
                    initializeWellnessMessage();
                }
            }
        }, 100);
    }
}

function startQuestionnaire() {
    showPage('questionnaire-page');
    updateProgress();
}

function goToDashboard() {
    // Clear all previous errors
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    document.querySelectorAll('.input-field').forEach(el => el.classList.remove('error'));
    
    // Check if this is a judge account
    const isJudgeAccount = localStorage.getItem('isJudgeAccount') === 'true';
    const userName = localStorage.getItem('userName');
    
    // Get form inputs
    const userNameInput = document.getElementById('user-name');
    const ageInput = document.getElementById('age');
    const lastPeriodInput = document.getElementById('last-period');
    
    let hasError = false;
    
    // Validate name ONLY if NOT a judge account
    if (!isJudgeAccount) {
        if (!userNameInput || !userNameInput.value.trim()) {
            showPage('questionnaire-page');
            document.querySelectorAll('.question-card').forEach(card => card.classList.remove('active'));
            document.querySelector('.question-card[data-question="1"]').classList.add('active');
            currentQuestion = 1;
            updateProgress();
            showError('user-name', 'name-error', 'Name is required');
            return;
        }
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
    
    if (ageInput.value < 10 || ageInput.value > 60) {
        showPage('questionnaire-page');
        document.querySelectorAll('.question-card').forEach(card => card.classList.remove('active'));
        document.querySelector('.question-card[data-question="2"]').classList.add('active');
        currentQuestion = 2;
        updateProgress();
        showError('age', 'age-error', 'Age must be between 10 and 60');
        return;
    }
    
    // Validate period question (date OR alternative option)
    const hasDate = lastPeriodInput && lastPeriodInput.value;
    const hasAlternative = selectedPeriodOption;
    
    if (!hasDate && !hasAlternative) {
        showPage('questionnaire-page');
        document.querySelectorAll('.question-card').forEach(card => card.classList.remove('active'));
        document.querySelector('.question-card[data-question="3"]').classList.add('active');
        currentQuestion = 3;
        updateProgress();
        showError('last-period', 'period-error', 'Please select a date or choose an option below');
        return;
    }
    
    if (!selectedSkinType) {
        showPage('questionnaire-page');
        document.querySelectorAll('.question-card').forEach(card => card.classList.remove('active'));
        document.querySelector('.question-card[data-question="4"]').classList.add('active');
        currentQuestion = 4;
        updateProgress();
        const errorElement = document.getElementById('skin-type-error');
        if (errorElement) {
            errorElement.textContent = 'Please select your skin type';
        }
        return;
    }
    
    // All validations passed - save data
    if (!isJudgeAccount && userNameInput) {
        const displayName = userNameInput.value.trim();
        localStorage.setItem('userName', displayName.toLowerCase().replace(/\s+/g, '')); // ID: lowercase, no spaces
        localStorage.setItem('userDisplayName', displayName); // Display name: as entered
    }
    // For judge accounts, userName and userDisplayName are already set from login
    
    localStorage.setItem('userAge', ageInput.value);
    
    // Save period data based on selection
    if (hasDate) {
        localStorage.setItem('lastPeriod', lastPeriodInput.value);
        localStorage.setItem('periodOption', 'date');
    } else if (hasAlternative) {
        localStorage.setItem('periodOption', selectedPeriodOption);
        // Set a default date for "can't remember" (30 days ago)
        if (selectedPeriodOption === 'cant-remember') {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            localStorage.setItem('lastPeriod', thirtyDaysAgo.toISOString().split('T')[0]);
        } else if (selectedPeriodOption === 'pregnant') {
            // For pregnant users, we won't track cycle
            localStorage.removeItem('lastPeriod');
        }
    }
    
    localStorage.setItem('cycleDays', cycleDays);
    localStorage.setItem('skinType', selectedSkinType);
    
    // Mark setup as complete - SAVE TO BACKEND
    if (userName) {
        console.log('🔵 Saving setup completion to backend for user:', userName);
        
        if (isJudgeAccount) {
            // Prepare profile data for judges
            const profileData = {
                age: ageInput.value,
                lastPeriod: lastPeriodInput ? lastPeriodInput.value : null,
                periodOption: selectedPeriodOption,
                skinType: selectedSkinType,
                cycleDays: cycleDays,
                timestamp: new Date().toISOString()
            };
            
            // Save to backend (async, don't wait)
            saveJudgeSetupToBackend(userName, profileData);
        } else {
            // For regular users, just mark setup as completed
            markUserSetupComplete(userName);
        }
    }
    
    completeOnboarding();
    
    // Update profile BEFORE showing dashboard
    updateUserProfile();
    
    // Show dashboard page
    showPage('dashboard-page');
    
    // Initialize wellness message immediately after showing dashboard
    // This ensures the message loads with the new user data
    if (typeof initializeWellnessMessage === 'function') {
        initializeWellnessMessage();
    }
    
    // Update other time-based content
    updateTimeBasedContent();
}

function updatePreviewCard() {
  const lastPeriod = localStorage.getItem('lastPeriod');
  const cycleLength = parseInt(localStorage.getItem('cycleDays')) || 28;

  let previewDay;
  if (lastPeriod) {
    const start = new Date(lastPeriod);
    const today = new Date();
    const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
    previewDay = (diff % cycleLength) + 1;
  } else {
    previewDay = 14;
  }

  const phases = [
    {
      days: [1,2,3,4,5],
      name: "Menstrual Phase",
      emoji: "🔴",
      tagline: "Rest and restore — your body is doing powerful work",
      actions: [
        "✓ Gentle face massage with facial oil",
        "✓ Rest and light stretching",
        "✓ Warm herbal tea for cramp relief"
      ]
    },
    {
      days: [6,7,8,9,10,11,12,13],
      name: "Follicular Phase",
      emoji: "🌱",
      tagline: "Energy rises — great time to try new things",
      actions: [
        "✓ Exfoliate & Vitamin C Serum",
        "✓ 30-Minute outdoor walk",
        "✓ Try a new healthy recipe"
      ]
    },
    {
      days: [14,15,16],
      name: "Ovulation Phase",
      emoji: "✨",
      tagline: "Estrogen peaks — your skin is radiant and energy is high",
      actions: [
        "✓ Gentle Cleanser & Vitamin C Serum",
        "✓ 20-Minute Walk in Nature",
        "✓ Hydrate with 8 Glasses of Water"
      ]
    },
    {
      days: [17,18,19,20,21,22,23,24,25,26,27,28],
      name: "Luteal Phase",
      emoji: "🌙",
      tagline: "Wind down — focus on nourishment and calm",
      actions: [
        "✓ Hydrating mask & calming serum",
        "✓ Gentle yoga or stretching",
        "✓ Magnesium-rich foods for PMS support"
      ]
    },
  ];

  // Handle cycles longer than 28 days by mapping to nearest phase
  const phase = phases.find(p => p.days.includes(previewDay))
    || (previewDay <= 5 ? phases[0]
      : previewDay <= Math.floor(cycleLength * 0.46) ? phases[1]
      : previewDay <= Math.floor(cycleLength * 0.57) ? phases[2]
      : phases[3]);

  const header = document.querySelector('.preview-card .card-header h3');
  const phaseTitle = document.querySelector('.preview-card .cycle-phase h4');
  const phaseDesc = document.querySelector('.preview-card .cycle-phase p');
  const actionsContainer = document.querySelector('.preview-card .today-actions');

  if (header) header.textContent = `Day ${previewDay} — ${phase.name}`;
  if (phaseTitle) phaseTitle.textContent = `${phase.emoji} ${phase.name}`;
  if (phaseDesc) phaseDesc.textContent = phase.tagline;
  if (actionsContainer) {
    actionsContainer.innerHTML = `
      <h5>Suggested Actions:</h5>
      ${phase.actions.map(a => `<div class="action-item">${a}</div>`).join('')}
    `;
  }
}

function navigateToCyclePage() {
  window.location.href = 'pages/cycle-tracking.html';
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
    
    // Check if user is logged in (has userName in localStorage)
    const userName = localStorage.getItem('userName');
    const hasOnboarding = hasCompletedOnboarding();
    
    if (userName && userName.trim() !== '' && hasOnboarding) {
        // User is logged in - show dashboard
        if (window.location.hash === '#dashboard' || hasOnboarding) {
            showPage('dashboard-page');
            // Initialize wellness message for existing user
            if (typeof initializeWellnessMessage === 'function') {
                initializeWellnessMessage();
            }
            updateTimeBasedContent();
        }
    } else {
        // No user logged in - show landing page
        showPage('landing-page');
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
let settingsSkinType = null;

function selectSettingsSkinType(type) {
    // Remove selected class from all options in settings modal
    document.querySelectorAll('#profileSettingsModal .skin-type-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Add selected class to clicked option
    const selectedOption = document.querySelector(`#profileSettingsModal .skin-type-option[data-type="${type}"]`);
    if (selectedOption) {
        selectedOption.classList.add('selected');
    }
    
    // Store selection
    settingsSkinType = type;
    
    // Clear error if any
    const errorElement = document.getElementById('settings-skin-type-error');
    if (errorElement) {
        errorElement.textContent = '';
    }
}

function openProfileSettings() {
    const modal = document.getElementById('profileSettingsModal');
    if (modal) {
        // Clear any previous errors
        document.querySelectorAll('#profileSettingsModal .error-message').forEach(el => el.textContent = '');
        document.querySelectorAll('#profileSettingsModal .input-field').forEach(el => el.classList.remove('error'));
        document.querySelectorAll('#profileSettingsModal .skin-type-option').forEach(el => el.classList.remove('selected'));
        
        // Load current values
        document.getElementById('settings-name').value = localStorage.getItem('userName') || '';
        document.getElementById('settings-age').value = localStorage.getItem('userAge') || '';
        document.getElementById('settings-last-period').value = localStorage.getItem('lastPeriod') || '';
        
        const cycleDays = parseInt(localStorage.getItem('cycleDays')) || 28;
        document.getElementById('settings-cycle-days').textContent = cycleDays;
        
        // Load and select current skin type
        const currentSkinType = localStorage.getItem('skinType');
        if (currentSkinType) {
            settingsSkinType = currentSkinType;
            const skinTypeOption = document.querySelector(`#profileSettingsModal .skin-type-option[data-type="${currentSkinType}"]`);
            if (skinTypeOption) {
                skinTypeOption.classList.add('selected');
            }
        }
        
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
    } else if (age < 10 || age > 60) {
        showSettingsError('settings-age', 'settings-age-error', 'Age must be between 10 and 60');
        hasError = true;
    }
    
    if (!lastPeriod) {
        showSettingsError('settings-last-period', 'settings-period-error', 'Last period date is required');
        hasError = true;
    }
    
    if (!settingsSkinType) {
        const errorElement = document.getElementById('settings-skin-type-error');
        if (errorElement) {
            errorElement.textContent = 'Please select your skin type';
        }
        hasError = true;
    }
    
    if (hasError) {
        return;
    }
    
    // Save all settings
    localStorage.setItem('userName', name.toLowerCase().replace(/\s+/g, '')); // ID: lowercase, no spaces
    localStorage.setItem('userDisplayName', name); // Display name: as entered
    localStorage.setItem('userAge', age);
    localStorage.setItem('lastPeriod', lastPeriod);
    localStorage.setItem('cycleDays', cycleDays);
    localStorage.setItem('skinType', settingsSkinType);
    
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
        closeSignInModal();
    }
});

// ===== JUDGE ACCOUNTS CONFIGURATION =====
const JUDGE_ACCOUNTS = {
    'Rada Stanic': {
        password: 'glowcycle2026',
        displayName: 'Rada Stanic',
        title: 'Chief Technologist, ANZ'
    },
    'Luke Anderson': {
        password: 'glowcycle2026',
        displayName: 'Luke Anderson',
        title: 'Managing Dir. Data & AI, APJ'
    },
    'Sarah Basset': {
        password: 'glowcycle2026',
        displayName: 'Sarah Basset',
        title: 'Dir. Software & Saas, ANZ'
    },
    'Team': {
        password: 'glowcycle2026',
        displayName: 'Glow Cycle Team',
        title: 'Development Team'
    }
};

// Helper function to create consistent localStorage keys
function getSetupKey(username) {
    // Replace spaces with underscores for localStorage key
    return `${username.replace(/\s+/g, '_')}_setupCompleted`;
}

// Helper function to save judge setup to backend
async function saveJudgeSetupToBackend(username, profileData) {
    try {
        const API_BASE = API_CONFIG?.BASE_URL || 'https://7ofiibs7k7.execute-api.ap-southeast-2.amazonaws.com/prod';
        const response = await fetch(`${API_BASE}/judge/setup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user: username,
                profileData: profileData
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('🔵 Setup saved to backend successfully:', data);
        return true;
    } catch (error) {
        console.error('🔴 Error saving setup to backend:', error);
        return false;
    }
}

// Initialize judge setup flags on page load (for demo purposes)
function initializeJudgeSetupFlags() {
    // Only initialize if not already set
    const judges = ['Rada Stanic', 'Luke Anderson', 'Sarah Basset', 'Team'];
    judges.forEach(judge => {
        const key = getSetupKey(judge);
        // If the key doesn't exist, we'll let them do setup once
        // This is intentional - we want them to experience the onboarding
    });
}

// ===== SIGN IN MODAL =====
function openSignInModal() {
    const modal = document.getElementById('signInModal');
    if (modal) {
        // Clear previous errors and inputs
        const errorElement = document.getElementById('signin-error');
        const usernameInput = document.getElementById('signin-username');
        const passwordInput = document.getElementById('signin-password');
        
        if (errorElement) errorElement.textContent = '';
        if (usernameInput) {
            usernameInput.value = '';
            usernameInput.classList.remove('error');
        }
        if (passwordInput) {
            passwordInput.value = '';
            passwordInput.classList.remove('error');
        }
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus on username input
        setTimeout(() => {
            if (usernameInput) usernameInput.focus();
        }, 100);
    }
}

function closeSignInModal() {
    const modal = document.getElementById('signInModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ===== LOGOUT FUNCTION =====
function handleLogout() {
    openLogoutModal();
}

function openLogoutModal() {
    const modal = document.getElementById('logoutModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeLogoutModal() {
    const modal = document.getElementById('logoutModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function confirmLogout() {
    // Clear user session data (but keep other app data)
    localStorage.removeItem('userName');
    localStorage.removeItem('userDisplayName');
    localStorage.removeItem('onboardingCompleted');
    
    closeLogoutModal();
    
    // Redirect to landing page
    showPage('landing-page');
    
    console.log('User logged out successfully');
}

async function handleSignIn() {
    const usernameInput = document.getElementById('signin-username');
    const passwordInput = document.getElementById('signin-password');
    const errorElement = document.getElementById('signin-error');
    
    if (!usernameInput || !passwordInput || !errorElement) return;
    
    // Get credentials
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    
    // Clear previous errors
    errorElement.textContent = '';
    usernameInput.classList.remove('error');
    passwordInput.classList.remove('error');
    
    // Validate inputs
    if (!username) {
        usernameInput.classList.add('error');
        errorElement.textContent = 'Username is required';
        return;
    }
    
    if (!password) {
        passwordInput.classList.add('error');
        errorElement.textContent = 'Password is required';
        return;
    }
    
    console.log('Sign in attempt:', username);
    
    // Check if it's a judge account
    const judgeAccount = JUDGE_ACCOUNTS[username];
    
    if (judgeAccount) {
        // Validate judge password
        if (password !== judgeAccount.password) {
            usernameInput.classList.add('error');
            passwordInput.classList.add('error');
            errorElement.textContent = 'Invalid username or password';
            return;
        }
        
        // Judge account - successful login
        console.log('🟢 Judge account login:', username);
        
        // Save judge info to localStorage (for current session)
        localStorage.setItem('userName', username);
        localStorage.setItem('userDisplayName', judgeAccount.displayName);
        localStorage.setItem('isJudgeAccount', 'true');
        localStorage.setItem('judgeTitle', judgeAccount.title);
        
        // Check setup status from BACKEND (not localStorage)
        try {
            const API_BASE = API_CONFIG?.BASE_URL || 'https://7ofiibs7k7.execute-api.ap-southeast-2.amazonaws.com/prod';
            const response = await fetch(`${API_BASE}/judge/setup?user=${encodeURIComponent(username)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            const hasCompletedSetup = data.setupCompleted === true;
            
            console.log('🟢 Setup status from backend:', hasCompletedSetup);
            
            closeSignInModal();
            
            if (!hasCompletedSetup) {
                // First time login - go to setup questionnaire (skip name question)
                showPage('questionnaire-page');
                // Skip to question 2 (age)
                document.querySelectorAll('.question-card').forEach(card => card.classList.remove('active'));
                document.querySelector('.question-card[data-question="2"]').classList.add('active');
                currentQuestion = 2;
                updateProgress();
            } else {
                // Already completed setup - go to dashboard
                localStorage.setItem('onboardingCompleted', 'true');
                showPage('dashboard-page');
                updateUserProfile();
                if (typeof initializeWellnessMessage === 'function') {
                    initializeWellnessMessage();
                }
                updateTimeBasedContent();
            }
            
            console.log('Judge logged in:', username);
            return;
            
        } catch (error) {
            console.error('Error checking judge setup:', error);
            // If backend fails, show questionnaire to be safe
            closeSignInModal();
            showPage('questionnaire-page');
            document.querySelectorAll('.question-card').forEach(card => card.classList.remove('active'));
            document.querySelector('.question-card[data-question="2"]').classList.add('active');
            currentQuestion = 2;
            updateProgress();
            return;
        }
    }
    
    // Regular user account - try backend first, fallback to localStorage
    try {
        // Try backend authentication first
        const API_BASE = API_CONFIG?.BASE_URL || 'https://7ofiibs7k7.execute-api.ap-southeast-2.amazonaws.com/prod';
        
        try {
            const response = await fetch(`${API_BASE}/user/authenticate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                
                // Backend authentication successful
                localStorage.setItem('userName', data.username);
                localStorage.setItem('userDisplayName', data.displayName);
                localStorage.setItem('isJudgeAccount', 'false');
                localStorage.setItem('onboardingCompleted', 'true'); // ALWAYS true for existing users
                
                closeSignInModal();
                
                // EXISTING USER - Always go to dashboard (they already registered)
                showPage('dashboard-page');
                updateUserProfile();
                if (typeof initializeWellnessMessage === 'function') {
                    initializeWellnessMessage();
                }
                updateTimeBasedContent();
                
                console.log('✅ User logged in via backend:', data.username);
                return;
            }
        } catch (backendError) {
            console.warn('⚠️ Backend not available, trying localStorage:', backendError.message);
        }
        
        // Fallback to localStorage authentication
        const normalizedInput = username.toLowerCase().replace(/\s+/g, '');
        const storedUserName = localStorage.getItem('userName');
        const storedDisplayName = localStorage.getItem('userDisplayName');
        const storedPassword = localStorage.getItem('userPassword');
        
        // Check if user exists in localStorage
        if (storedUserName === normalizedInput || 
            (storedDisplayName && storedDisplayName.toLowerCase() === username.toLowerCase())) {
            
            // Verify password
            if (storedPassword && storedPassword === password) {
                // Authentication successful
                localStorage.setItem('userName', normalizedInput);
                localStorage.setItem('userDisplayName', storedDisplayName || username);
                localStorage.setItem('isJudgeAccount', 'false');
                localStorage.setItem('onboardingCompleted', 'true'); // ALWAYS true for existing users
                
                closeSignInModal();
                
                // EXISTING USER - Always go to dashboard (they already registered)
                showPage('dashboard-page');
                updateUserProfile();
                if (typeof initializeWellnessMessage === 'function') {
                    initializeWellnessMessage();
                }
                updateTimeBasedContent();
                
                console.log('✅ User logged in via localStorage:', normalizedInput);
                return;
            }
        }
        
        // Authentication failed
        usernameInput.classList.add('error');
        passwordInput.classList.add('error');
        errorElement.textContent = 'Invalid username or password';
        
    } catch (error) {
        console.error('❌ Error authenticating user:', error);
        usernameInput.classList.add('error');
        passwordInput.classList.add('error');
        errorElement.textContent = 'Login failed. Please try again.';
    }
}

// ===== ENTER KEY FUNCTIONALITY FOR QUESTIONNAIRE =====
document.addEventListener('DOMContentLoaded', () => {
    // Add Enter key listener for name input (Question 1)
    const nameInput = document.getElementById('user-name');
    if (nameInput) {
        nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                nextQuestion(2);
            }
        });
    }
    
    // Add Enter key listener for age input (Question 2)
    const ageInput = document.getElementById('age');
    if (ageInput) {
        ageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                nextQuestion(3);
            }
        });
    }
    
    // Add Enter key listener for last period input (Question 3)
    const lastPeriodInput = document.getElementById('last-period');
    if (lastPeriodInput) {
        lastPeriodInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                nextQuestion(4);
            }
        });
    }
    
    // Add Enter key listener for sign in modal - username
    const signInInput = document.getElementById('signin-username');
    if (signInInput) {
        signInInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                // Focus on password field
                const passwordInput = document.getElementById('signin-password');
                if (passwordInput) {
                    passwordInput.focus();
                }
            }
        });
    }
    
    // Add Enter key listener for sign in modal - password
    const signInPassword = document.getElementById('signin-password');
    if (signInPassword) {
        signInPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSignIn();
            }
        });
    }
});
