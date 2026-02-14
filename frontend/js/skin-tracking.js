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
    
    updateSkincareRoutine();
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

function updateSkincareRoutine() {
    const routineTitle = document.querySelector('.routine-title');
    const routineSteps = document.querySelector('.routine-steps');
    
    if (!routineTitle || !routineSteps) return;
    
    if (timeMode === 'morning') {
        routineTitle.innerHTML = '☀️ AM Routine';
        routineSteps.innerHTML = `
            <div class="routine-step">✓ Gentle Cleanser</div>
            <div class="routine-step">✓ Vitamin C Serum</div>
            <div class="routine-step">✓ Moisturizer</div>
            <div class="routine-step">✓ SPF 30+ Sunscreen</div>
        `;
    } else if (timeMode === 'afternoon') {
        routineTitle.innerHTML = '🌸 Light Refresh';
        routineSteps.innerHTML = `
            <div class="routine-step">✓ Facial Mist</div>
            <div class="routine-step">✓ Reapply SPF</div>
            <div class="routine-step">✓ Hydrating Serum</div>
            <div class="routine-step">✓ Light Moisturizer</div>
        `;
    } else {
        routineTitle.innerHTML = '🌙 PM Routine';
        routineSteps.innerHTML = `
            <div class="routine-step">✓ Oil Cleanser</div>
            <div class="routine-step">✓ Treatment Serum</div>
            <div class="routine-step">✓ Night Moisturizer</div>
            <div class="routine-step">✓ Eye Cream</div>
        `;
    }
}

// Show Consent Popup
function showConsentPopup() {
    document.getElementById('consent-popup').style.display = 'flex';
}

// Close Consent Popup
function closeConsentPopup() {
    document.getElementById('consent-popup').style.display = 'none';
    document.getElementById('consent-check').checked = false;
    document.getElementById('accept-btn').disabled = true;
}

// Accept Consent and Show Scanner
function acceptConsent() {
    closeConsentPopup();
    showScanner();
}

// Enable/disable accept button based on checkbox
document.addEventListener('DOMContentLoaded', () => {
    applyTheme(); // Apply theme on load
    
    const consentCheck = document.getElementById('consent-check');
    const acceptBtn = document.getElementById('accept-btn');
    
    if (consentCheck && acceptBtn) {
        consentCheck.addEventListener('change', (e) => {
            acceptBtn.disabled = !e.target.checked;
        });
    }
});

// Show Scanner View
function showScanner() {
    document.querySelector('.method-selection-single').style.display = 'none';
    document.getElementById('scanner-view').style.display = 'block';
}

// Hide all views and show method selection
function hideViews() {
    const methodSelection = document.querySelector('.method-selection-single');
    if (methodSelection) {
        methodSelection.style.display = 'flex';
    }
    document.getElementById('scanner-view').style.display = 'none';
    document.getElementById('results-view').style.display = 'none';
}

// Simulate scan and show results
function simulateScan() {
    // Add scanning animation
    const btn = document.querySelector('.capture-btn');
    btn.textContent = 'Analyzing...';
    btn.disabled = true;
    
    setTimeout(() => {
        showResults();
    }, 2000);
}

// Show Results View
function showResults() {
    document.getElementById('scanner-view').style.display = 'none';
    document.getElementById('results-view').style.display = 'block';
    
    // Draw radar chart
    drawRadarChart();
}

// Draw Radar Chart
function drawRadarChart() {
    const canvas = document.getElementById('skinRadar');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 40;
    
    // Data points
    const data = [85, 70, 88, 73, 78, 67, 82];
    const labels = ['Radiance', 'Moisture', 'Texture', 'Pores', 'Dark Circles', 'Oiliness', 'Redness'];
    const numPoints = data.length;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background circles
    ctx.strokeStyle = '#E8E4F3';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 5; i++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, (radius / 5) * i, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // Draw axes
    ctx.strokeStyle = '#E8E4F3';
    ctx.lineWidth = 1;
    for (let i = 0; i < numPoints; i++) {
        const angle = (Math.PI * 2 * i) / numPoints - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();
        
        // Draw labels
        const labelX = centerX + (radius + 30) * Math.cos(angle);
        const labelY = centerY + (radius + 30) * Math.sin(angle);
        ctx.fillStyle = '#7A7A8E';
        ctx.font = '12px Outfit';
        ctx.textAlign = 'center';
        ctx.fillText(labels[i], labelX, labelY);
    }
    
    // Draw data polygon
    ctx.beginPath();
    for (let i = 0; i < numPoints; i++) {
        const angle = (Math.PI * 2 * i) / numPoints - Math.PI / 2;
        const value = data[i] / 100;
        const x = centerX + radius * value * Math.cos(angle);
        const y = centerY + radius * value * Math.sin(angle);
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.closePath();
    
    // Fill with gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, 'rgba(168, 230, 207, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 182, 217, 0.3)');
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Stroke
    ctx.strokeStyle = '#FFB6D9';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw data points
    for (let i = 0; i < numPoints; i++) {
        const angle = (Math.PI * 2 * i) / numPoints - Math.PI / 2;
        const value = data[i] / 100;
        const x = centerX + radius * value * Math.cos(angle);
        const y = centerY + radius * value * Math.sin(angle);
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#FFB6D9';
        ctx.fill();
    }
}

// Set canvas size on load
window.addEventListener('load', () => {
    const canvas = document.getElementById('skinRadar');
    if (canvas) {
        canvas.width = 400;
        canvas.height = 400;
    }
});
