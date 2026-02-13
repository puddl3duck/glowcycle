// Journal & Mood JavaScript

let selectedMood = null;
let selectedTags = [];

// Update current date
document.addEventListener('DOMContentLoaded', function() {
    updateDate();
    setupEventListeners();
    loadEntries();
});

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

function saveEntry() {
    const journalText = document.getElementById('journal-entry').value;
    const energyLevel = document.getElementById('energy-level').value;
    
    if (!selectedMood) {
        alert('Please select your mood');
        return;
    }
    
    if (!journalText.trim()) {
        alert('Please write something in your journal');
        return;
    }
    
    // Create entry object
    const entry = {
        date: new Date().toISOString(),
        mood: selectedMood,
        energy: energyLevel,
        text: journalText,
        tags: selectedTags,
        cycleDay: getCycleDay()
    };
    
    // Save to localStorage
    let entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
    entries.unshift(entry);
    localStorage.setItem('journalEntries', JSON.stringify(entries));
    
    // Show success message
    const btn = document.querySelector('.save-entry-btn');
    const originalText = btn.textContent;
    btn.textContent = '✓ Entry Saved!';
    btn.style.background = 'linear-gradient(135deg, #A8E6CF, #C8E6E6)';
    
    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        
        // Clear form
        document.getElementById('journal-entry').value = '';
        document.querySelectorAll('.mood-option').forEach(opt => opt.classList.remove('selected'));
        document.querySelectorAll('.tag-btn').forEach(btn => btn.classList.remove('active'));
        selectedMood = null;
        selectedTags = [];
        
        // Reload entries
        loadEntries();
    }, 2000);
}

function loadEntries() {
    const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
    const entriesList = document.getElementById('entries-list');
    
    if (entries.length === 0) {
        entriesList.innerHTML = '<p style="text-align: center; color: var(--text-light);">No entries yet. Start journaling!</p>';
        return;
    }
    
    entriesList.innerHTML = entries.slice(0, 5).map(entry => {
        const date = new Date(entry.date);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const moodEmoji = getMoodEmoji(entry.mood);
        const snippet = entry.text.substring(0, 100) + (entry.text.length > 100 ? '...' : '');
        
        return `
            <div class="entry-preview">
                <div class="entry-header">
                    <span class="entry-date">${dateStr}</span>
                    <span class="entry-mood">${moodEmoji}</span>
                </div>
                <p class="entry-snippet">${snippet}</p>
                <div class="entry-tags">
                    ${entry.tags.map(tag => `<span class="entry-tag">${tag}</span>`).join('')}
                </div>
            </div>
        `;
    }).join('');
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
