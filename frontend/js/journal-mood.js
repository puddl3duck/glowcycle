// Journal & Mood JavaScript

// API URL - Production endpoint
const API_URL = 'https://7ofiibs7k7.execute-api.ap-southeast-2.amazonaws.com/prod';

let selectedMood = null;
let selectedTags = [];
let currentUser = null;

// Time-based functionality
let timeMode = 'morning'; // 'morning', 'afternoon', or 'night'

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

function getJournalPrompt() {
    timeMode = detectTimeMode();
    if (timeMode === 'morning') {
        return 'How are you feeling this morning?';
    } else if (timeMode === 'afternoon') {
        return 'How is your day going?';
    } else {
        return 'How was your day?';
    }
}

function getGreeting() {
    timeMode = detectTimeMode();
    if (timeMode === 'morning') {
        return 'Good morning ☀️';
    } else if (timeMode === 'afternoon') {
        return 'Good afternoon 🌸';
    } else {
        return 'Good night 🌙';
    }
}

function applyTheme() {
    timeMode = detectTimeMode();
    const body = document.body;
    const themeOverride = localStorage.getItem('themeOverride');
    
    if (themeOverride) {
        body.classList.remove('light-theme', 'dark-theme');
        body.classList.add(`${themeOverride}-theme`);
    } else {
        body.classList.remove('light-theme', 'dark-theme');
        if (timeMode === 'night') {
            body.classList.add('dark-theme');
        } else {
            body.classList.add('light-theme');
        }
    }
    
    updateJournalPrompt();
}

function updateJournalPrompt() {
    const promptElement = document.querySelector('.journal-prompt');
    if (promptElement) {
        promptElement.textContent = getJournalPrompt();
    }
}

function toggleTheme() {
    const body = document.body;
    let themeOverride;
    
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

// Update current date
document.addEventListener('DOMContentLoaded', function() {
    applyTheme(); // Apply theme on load
    updateDate();
    setupEventListeners();
    getUserName();
    updateUserProfile(); // Update profile on load
    loadEntries();
});

function getUserName() {
    currentUser = localStorage.getItem('userName');
    if (!currentUser) {
        currentUser = prompt('What is your name?');
        if (currentUser) {
            localStorage.setItem('userName', currentUser);
            updateUserProfile(); // Update profile after getting name
        }
    }
}

function updateUserProfile() {
    const userName = currentUser || localStorage.getItem('userName') || 'User';
    const profileNameElement = document.getElementById('profile-name');
    const profileAvatarElement = document.getElementById('profile-avatar');
    
    if (profileNameElement) {
        profileNameElement.textContent = userName;
    }
    
    if (profileAvatarElement) {
        profileAvatarElement.textContent = userName.charAt(0).toUpperCase();
    }
}

function updateDate() {
    const dateElement = document.getElementById('current-date');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date();
    dateElement.textContent = today.toLocaleDateString('en-US', options);
}

function setupEventListeners() {
    // Energy slider
    const energySlider = document.getElementById('energy-level');
    const energyDisplay = document.getElementById('energy-display');
    
    energySlider.addEventListener('input', function() {
        energyDisplay.textContent = this.value + '%';
    });
    
    // Journal textarea word count
    const journalEntry = document.getElementById('journal-entry');
    const wordCount = document.getElementById('word-count');
    
    journalEntry.addEventListener('input', function() {
        const words = this.value.trim().split(/\s+/).filter(word => word.length > 0);
        wordCount.textContent = words.length + ' words';
    });
}

function selectMood(mood) {
    // Remove previous selection
    document.querySelectorAll('.mood-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Add selection to clicked mood
    const moodOption = document.querySelector(`[data-mood="${mood}"]`);
    moodOption.classList.add('selected');
    selectedMood = mood;
}

function toggleTag(button) {
    button.classList.toggle('active');
    const tagText = button.textContent.trim();
    
    if (button.classList.contains('active')) {
        selectedTags.push(tagText);
    } else {
        selectedTags = selectedTags.filter(tag => tag !== tagText);
    }
}

async function saveEntry() {
    const journalText = document.getElementById('journal-entry').value;
    const energyLevel = document.getElementById('energy-level').value;
    
    // Validation
    if (!selectedMood) {
        showNotification('Please select your mood', 'error');
        return;
    }
    
    if (!journalText.trim()) {
        showNotification('Please write something in your journal', 'error');
        return;
    }

    if (!currentUser) {
        getUserName();
        if (!currentUser) return;
    }
    
    const btn = document.querySelector('.save-entry-btn');
    const originalText = btn.textContent;
    btn.textContent = 'Saving...';
    btn.disabled = true;

    try {
        const now = new Date();
        const hour = now.getHours();
        const isNight = hour >= 18 || hour < 5;
        
        // Format date as DD-MM-YYYY
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const formattedDate = `${day}-${month}-${year}`;
        
        const entry = {
            user: currentUser,
            feeling: selectedMood,
            energy: parseInt(energyLevel),
            thoughts: journalText,
            tags: selectedTags,
            date: formattedDate,
            night: isNight
        };

        const response = await fetch(`${API_URL}/journal`, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(entry)
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error('Server error:', data);
            throw new Error(data.error || data.message || 'Failed to save entry');
        }

        btn.textContent = '✓ Entry Saved!';
        btn.style.background = 'linear-gradient(135deg, #A8E6CF, #C8E6E6)';
        showNotification('Entry saved successfully!', 'success');
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
            btn.disabled = false;
            
            // Clear form
            document.getElementById('journal-entry').value = '';
            document.getElementById('energy-level').value = 70;
            document.getElementById('energy-display').textContent = '70%';
            document.getElementById('word-count').textContent = '0 words';
            document.querySelectorAll('.mood-option').forEach(opt => opt.classList.remove('selected'));
            document.querySelectorAll('.tag-btn').forEach(btn => btn.classList.remove('active'));
            selectedMood = null;
            selectedTags = [];
            
            loadEntries();
        }, 2000);
    } catch (error) {
        console.error('Error saving entry:', error);
        showNotification(`Failed to save entry: ${error.message}`, 'error');
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

async function loadEntries() {
    const entriesList = document.getElementById('entries-list');
    
    if (!currentUser) {
        entriesList.innerHTML = '<p style="text-align: center; color: var(--text-light);">Please enter your name to see entries.</p>';
        return;
    }

    // Show loading state
    entriesList.innerHTML = '<p style="text-align: center; color: var(--text-medium);">Loading entries...</p>';

    try {
        console.log(`Loading entries for user: ${currentUser}`);
        const response = await fetch(`${API_URL}/journal?user=${encodeURIComponent(currentUser)}`, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const entries = data.entries || [];
        
        if (entries.length === 0) {
            entriesList.innerHTML = '<p style="text-align: center; color: var(--text-light);">No entries yet. Start journaling!</p>';
            return;
        }
        
        entriesList.innerHTML = entries.slice(0, 5).map(entry => {
            const dateStr = entry.date;
            const timeStr = entry.timestamp || '';  // Show time if available
            const displayDate = timeStr ? `${dateStr} ${timeStr}` : dateStr;
            const moodEmoji = getMoodEmoji(entry.feeling);
            const snippet = entry.thoughts.substring(0, 100) + (entry.thoughts.length > 100 ? '...' : '');
            const tagsHtml = entry.tags && entry.tags.length > 0 
                ? entry.tags.map(tag => `<span class="entry-tag">${tag}</span>`).join('')
                : '';
            
            return `
                <div class="entry-preview">
                    <div class="entry-header">
                        <span class="entry-date">${displayDate}</span>
                        <span class="entry-mood">${moodEmoji}</span>
                    </div>
                    <p class="entry-snippet">${snippet}</p>
                    ${tagsHtml ? `<div class="entry-tags">${tagsHtml}</div>` : ''}
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading entries:', error);
        entriesList.innerHTML = `<p style="text-align: center; color: var(--accent-coral);">Error loading entries: ${error.message}</p>`;
    }
}

function getMoodEmoji(mood) {
    const moodMap = {
        'amazing': '🤩',
        'happy': '😊',
        'okay': '😐',
        'tired': '😴',
        'sad': '😢'
    };
    return moodMap[mood] || '😊';
}

function getCycleDay() {
    const savedDate = localStorage.getItem('lastPeriodDate');
    if (!savedDate) return null;
    
    const lastPeriod = new Date(savedDate);
    const today = new Date();
    const daysDiff = Math.floor((today - lastPeriod) / (1000 * 60 * 60 * 24));
    return (daysDiff % 28) + 1;
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'error' ? 'linear-gradient(135deg, #FF9B9B, #FF6B6B)' : 'linear-gradient(135deg, #A8E6CF, #C8E6E6)'};
        color: white;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        font-weight: 600;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
