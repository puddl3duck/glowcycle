// Cycle Tracking JavaScript

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
    // Load saved period date if exists
    const savedDate = localStorage.getItem('lastPeriodDate');
    if (savedDate) {
        document.getElementById('period-date').value = savedDate;
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
    console.log(`Cycle Day: ${cycleDay}`);
}
