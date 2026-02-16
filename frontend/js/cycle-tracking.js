// Cycle Tracking JavaScript

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

// Save period date
function savePeriodDate() {
    const dateInput = document.getElementById('period-date');
    const date = dateInput.value;
    
    if (!date) {
        alert('Please select a date');
        return;
    }
    
    // Save to localStorage
    localStorage.setItem('lastPeriodDate', date);
    
    // Show success message
    const btn = document.querySelector('.save-btn');
    const originalText = btn.textContent;
    btn.textContent = '✓ Saved!';
    btn.style.background = 'linear-gradient(135deg, #A8E6CF, #C8E6E6)';
    
    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
    }, 2000);
}

// Update slider values in real-time
document.addEventListener('DOMContentLoaded', function() {
    // Apply theme on load
    applyTheme();
    
    // Load saved period date if exists
    const savedDate = localStorage.getItem('lastPeriodDate');
    if (savedDate) {
        const periodDateInput = document.getElementById('period-date');
        if (periodDateInput) {
            periodDateInput.value = savedDate;
        }
    }
    
    // Calculate current cycle day and phase
    updateCycleInfo();
});

function updateCycleInfo() {
    const savedDate = localStorage.getItem('lastPeriodDate');
    if (!savedDate) return;
    
    const lastPeriod = new Date(savedDate);
    const today = new Date();
    const daysDiff = Math.floor((today - lastPeriod) / (1000 * 60 * 60 * 24));
    const cycleDay = (daysDiff % 28) + 1;
    
    // Update UI with calculated day
}
