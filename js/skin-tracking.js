// Show Scanner View
function showScanner() {
    document.querySelector('.method-selection').style.display = 'none';
    document.getElementById('scanner-view').style.display = 'block';
}

// Show Manual Entry View
function showManual() {
    document.querySelector('.method-selection').style.display = 'none';
    document.getElementById('manual-view').style.display = 'block';
    
    // Initialize slider listeners
    initializeSliders();
}

// Hide all views and show method selection
function hideViews() {
    document.querySelector('.method-selection').style.display = 'grid';
    document.getElementById('scanner-view').style.display = 'none';
    document.getElementById('manual-view').style.display = 'none';
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
    document.getElementById('manual-view').style.display = 'none';
    document.getElementById('results-view').style.display = 'block';
    
    // Draw radar chart
    drawRadarChart();
}

// Initialize sliders with real-time updates
function initializeSliders() {
    const sliders = document.querySelectorAll('.slider');
    
    sliders.forEach(slider => {
        const valueDisplay = slider.parentElement.querySelector('.rating-value');
        
        slider.addEventListener('input', (e) => {
            valueDisplay.textContent = e.target.value;
        });
    });
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
