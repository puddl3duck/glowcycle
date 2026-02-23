// Journal & Mood JavaScript

// API URL - Production endpoint
const API_URL = 'https://7ofiibs7k7.execute-api.ap-southeast-2.amazonaws.com/prod';

let selectedMood = null;
let selectedTags = [];
let customTags = [];
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
    const promptElement = document.getElementById('journal-prompt');
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
    loadCustomTags(); // Load saved custom tags
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
    
    // Custom tag input - Enter key
    const customTagInput = document.getElementById('custom-tag-input');
    customTagInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addCustomTag();
        }
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
    
    // Get tag text without the × symbol
    const tagContent = button.querySelector('span:first-child') || button;
    const tagText = tagContent.textContent.trim();
    
    if (button.classList.contains('active')) {
        // Add only if not already in array
        if (!selectedTags.includes(tagText)) {
            selectedTags.push(tagText);
        }
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

        // Save to AWS backend
        const response = await fetch(`${API_URL}/journal`, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(entry)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Entry saved to backend:', result);
        
        // Mark that user has journal entries (no longer first time)
        localStorage.setItem('hasJournalEntries', 'true');

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
            document.querySelectorAll('.custom-tag-btn').forEach(btn => btn.classList.remove('active'));
            selectedMood = null;
            selectedTags = [];
            
            loadEntries();
            
            // Mark journal updated for wellness message refresh
            if (typeof markJournalUpdated === 'function') {
                markJournalUpdated();
            }
            
            // Refresh wellness message on dashboard if available
            if (typeof loadAIMotivationalMessage === 'function') {
                const userName = localStorage.getItem('userName');
                if (userName) {
                    console.log('Refreshing wellness message after journal entry...');
                    loadAIMotivationalMessage(userName);
                }
            }
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
        
        // Load from AWS backend only
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
        console.log('Loaded entries from backend:', entries.length);
        
        // Mark that user has journal entries if any exist
        if (entries.length > 0) {
            localStorage.setItem('hasJournalEntries', 'true');
        }
        
        if (entries.length === 0) {
            entriesList.innerHTML = '<p style="text-align: center; color: var(--text-light);">No entries yet. Start journaling!</p>';
            updateStats(entries);
            return;
        }
        
        // Update stats
        updateStats(entries);
        
        // Extract unique custom tags from all entries to suggest them
        suggestTagsFromHistory(entries);
        
        entriesList.innerHTML = entries.slice(0, 5).map(entry => {
            const dateStr = entry.date;
            const timeStr = entry.timestamp || '';  // Show time if available
            const displayDate = timeStr ? `${dateStr} ${timeStr}` : dateStr;
            const moodEmoji = getMoodEmoji(entry.feeling);
            const snippet = entry.thoughts.substring(0, 100) + (entry.thoughts.length > 100 ? '...' : '');
            
            // Handle tags - ensure it's an array and properly formatted
            let tags = [];
            if (entry.tags) {
                if (Array.isArray(entry.tags)) {
                    // Tags is already an array
                    tags = entry.tags.map(tag => {
                        // If tag is an object like {S: "value"}, extract the value
                        if (typeof tag === 'object' && tag.S) {
                            return tag.S;
                        }
                        return tag;
                    });
                } else if (typeof entry.tags === 'string') {
                    try {
                        tags = JSON.parse(entry.tags);
                    } catch (e) {
                        tags = [entry.tags];
                    }
                }
            }
            
            const tagsHtml = tags.length > 0 
                ? tags.map(tag => `<span class="entry-tag">${tag}</span>`).join('')
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

function suggestTagsFromHistory(entries) {
    // Get all tags from entries
    const allTags = new Set();
    const defaultTags = ['💪 Workout', '🧘 Meditation', '😴 Good Sleep', '🍎 Healthy Eating', 
                         '💧 Hydrated', '🎉 Social', '📚 Productive', '🌸 Self-care'];
    const deletedTags = getDeletedTags(); // Get list of tags user has deleted
    
    entries.forEach(entry => {
        let tags = [];
        
        // Handle different tag formats
        if (entry.tags) {
            if (Array.isArray(entry.tags)) {
                tags = entry.tags.map(tag => {
                    // If tag is an object like {S: "value"}, extract the value
                    if (typeof tag === 'object' && tag.S) {
                        return tag.S;
                    }
                    return tag;
                });
            } else if (typeof entry.tags === 'string') {
                try {
                    tags = JSON.parse(entry.tags);
                } catch (e) {
                    tags = [entry.tags];
                }
            }
        }
        
        tags.forEach(tag => {
            // Only add if it's not a default tag AND not in deleted tags list
            if (!defaultTags.includes(tag) && !deletedTags.includes(tag)) {
                allTags.add(tag);
            }
        });
    });
    
    // Add these tags to custom tags (they were used before)
    allTags.forEach(tag => {
        if (!customTags.includes(tag)) {
            customTags.push(tag);
            renderCustomTag(tag);
        }
    });
    
    // Save the updated custom tags
    if (allTags.size > 0) {
        saveCustomTags();
    }
}

function updateStats(entries) {
    const now = new Date();
    
    // Calculate entries this week
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const entriesThisWeek = entries.filter(entry => {
        const entryDate = parseEntryDate(entry.date);
        return entryDate >= startOfWeek;
    }).length;
    
    // Calculate entries this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const entriesThisMonth = entries.filter(entry => {
        const entryDate = parseEntryDate(entry.date);
        return entryDate >= startOfMonth;
    }).length;
    
    // Calculate streak (consecutive days with entries)
    const sortedEntries = entries.sort((a, b) => {
        const dateA = parseEntryDate(a.date);
        const dateB = parseEntryDate(b.date);
        return dateB - dateA;
    });
    
    let streak = 0;
    let checkDate = new Date(now);
    checkDate.setHours(0, 0, 0, 0);
    
    for (const entry of sortedEntries) {
        const entryDate = parseEntryDate(entry.date);
        entryDate.setHours(0, 0, 0, 0);
        
        if (entryDate.getTime() === checkDate.getTime()) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else if (entryDate < checkDate) {
            break;
        }
    }
    
    // Update UI
    document.getElementById('entries-this-week').textContent = entriesThisWeek;
    document.getElementById('entries-this-month').textContent = entriesThisMonth;
    document.getElementById('current-streak').textContent = streak;
}

function parseEntryDate(dateStr) {
    // Parse DD-MM-YYYY format
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        return new Date(parts[2], parts[1] - 1, parts[0]);
    }
    return new Date(dateStr);
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


// Custom Tags Functionality
function addCustomTag() {
    const input = document.getElementById('custom-tag-input');
    const tagText = input.value.trim();
    
    if (!tagText) {
        return; // Just clear, no error
    }
    
    if (tagText.length > 30) {
        showNotification('Tag is too long (max 30 characters)', 'error');
        return;
    }
    
    // Check if tag already exists
    if (customTags.includes(tagText)) {
        // If it exists, just select it
        const existingBtn = Array.from(document.querySelectorAll('.custom-tag-btn')).find(btn => {
            const span = btn.querySelector('span:first-child');
            return span && span.textContent === tagText;
        });
        if (existingBtn && !existingBtn.classList.contains('active')) {
            existingBtn.click(); // Select it
        }
        input.value = '';
        return;
    }
    
    // Add to custom tags array
    customTags.push(tagText);
    
    // Save to localStorage
    saveCustomTags();
    
    // Render the tag (but don't auto-select it)
    renderCustomTag(tagText);
    
    // Clear input
    input.value = '';
    
    // Show success
    showNotification('Tag added! ✨', 'success');
}

function renderCustomTag(tagText) {
    const container = document.getElementById('custom-tags-container');
    
    // Check if tag already rendered
    const existingTags = Array.from(container.querySelectorAll('.custom-tag-btn'));
    const existing = existingTags.find(btn => {
        const span = btn.querySelector('span:first-child');
        return span && span.textContent === tagText;
    });
    
    if (existing) {
        return existing; // Return existing button
    }
    
    const tagBtn = document.createElement('button');
    tagBtn.className = 'custom-tag-btn';
    tagBtn.onclick = function() { toggleTag(this); };
    
    const tagContent = document.createElement('span');
    tagContent.textContent = tagText;
    
    const removeBtn = document.createElement('span');
    removeBtn.className = 'remove-tag';
    removeBtn.innerHTML = '&times;'; // Use HTML entity
    removeBtn.title = 'Delete this tag permanently';
    removeBtn.onclick = function(e) {
        e.stopPropagation();
        removeCustomTag(tagText, tagBtn);
    };
    
    tagBtn.appendChild(tagContent);
    tagBtn.appendChild(removeBtn);
    container.appendChild(tagBtn);
    
    return tagBtn; // Return the button so we can select it
}

function removeCustomTag(tagText, tagElement) {
    // Remove from array
    customTags = customTags.filter(tag => tag !== tagText);
    
    // Remove from selected tags if it was selected
    selectedTags = selectedTags.filter(tag => tag !== tagText);
    
    // Add to deleted tags list so it doesn't come back from history
    addToDeletedTags(tagText);
    
    // Save to localStorage
    saveCustomTags();
    
    // Remove from DOM with animation
    tagElement.style.transform = 'scale(0)';
    tagElement.style.opacity = '0';
    setTimeout(() => {
        tagElement.remove();
    }, 300);
    
    showNotification('Tag removed', 'success');
}

function addToDeletedTags(tagText) {
    if (!currentUser) return;
    
    let deletedTags = [];
    const saved = localStorage.getItem(`deletedTags_${currentUser}`);
    if (saved) {
        try {
            deletedTags = JSON.parse(saved);
        } catch (e) {
            deletedTags = [];
        }
    }
    
    if (!deletedTags.includes(tagText)) {
        deletedTags.push(tagText);
        localStorage.setItem(`deletedTags_${currentUser}`, JSON.stringify(deletedTags));
    }
}

function getDeletedTags() {
    if (!currentUser) return [];
    
    const saved = localStorage.getItem(`deletedTags_${currentUser}`);
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            return [];
        }
    }
    return [];
}

function saveCustomTags() {
    if (!currentUser) return;
    localStorage.setItem(`customTags_${currentUser}`, JSON.stringify(customTags));
}

function loadCustomTags() {
    if (!currentUser) {
        currentUser = localStorage.getItem('userName');
    }
    
    if (!currentUser) return;
    
    const saved = localStorage.getItem(`customTags_${currentUser}`);
    if (saved) {
        try {
            customTags = JSON.parse(saved);
            customTags.forEach(tag => renderCustomTag(tag));
        } catch (e) {
            console.error('Error loading custom tags:', e);
            customTags = [];
        }
    }
}
