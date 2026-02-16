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

// Camera variables
let stream = null;
let currentFacingMode = 'user'; // 'user' for front camera, 'environment' for back camera
let capturedImageData = null;

// Show Scanner View
function showScanner() {
    document.querySelector('.method-selection-single').style.display = 'none';
    document.getElementById('scanner-view').style.display = 'block';
    startCamera();
}

// Close Scanner
function closeScanner() {
    stopCamera();
    hideViews();
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

// Start Camera
async function startCamera() {
    try {
        const constraints = {
            video: {
                facingMode: currentFacingMode,
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        };
        
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        const video = document.getElementById('camera-video');
        video.srcObject = stream;
        
        updateCameraStatus('Ready to capture', '✓', 'success');
    } catch (error) {
        console.error('Error accessing camera:', error);
        updateCameraStatus('Camera access denied', '⚠️', 'error');
    }
}

// Stop Camera
function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    const video = document.getElementById('camera-video');
    if (video) {
        video.srcObject = null;
    }
}

// Flip Camera
async function flipCamera() {
    currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
    stopCamera();
    await startCamera();
}

// Update Camera Status
function updateCameraStatus(text, icon, type = 'info') {
    const statusElement = document.getElementById('camera-status');
    if (statusElement) {
        statusElement.innerHTML = `
            <span class="status-icon">${icon}</span>
            <span class="status-text ${type}">${text}</span>
        `;
    }
}

// Capture Photo
function capturePhoto() {
    const video = document.getElementById('camera-video');
    const canvas = document.getElementById('camera-canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Store captured image
    capturedImageData = canvas.toDataURL('image/jpeg', 0.9);
    
    // Show captured image
    canvas.style.display = 'block';
    video.style.display = 'none';
    
    // Hide camera overlay and status
    document.querySelector('.camera-overlay').style.display = 'none';
    document.getElementById('camera-status').style.display = 'none';
    
    // Update UI
    document.getElementById('capture-btn').style.display = 'none';
    document.getElementById('retake-btn').style.display = 'flex';
    
    // Start AI analysis animation
    startAIAnalysis();
}

// Start AI Analysis Animation
function startAIAnalysis() {
    const overlay = document.getElementById('ai-analysis-overlay');
    const progressBar = document.getElementById('analysis-progress');
    
    overlay.style.display = 'flex';
    
    // Animate progress bar
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += 1;
        progressBar.style.width = progress + '%';
        
        if (progress >= 100) {
            clearInterval(progressInterval);
        }
    }, 40); // 4 seconds total
    
    // Animate steps
    const steps = ['step-1', 'step-2', 'step-3', 'step-4'];
    steps.forEach((stepId, index) => {
        setTimeout(() => {
            const step = document.getElementById(stepId);
            step.classList.add('active');
            
            // Add completion checkmark after a moment
            setTimeout(() => {
                step.classList.add('completed');
                const icon = step.querySelector('.step-icon');
                icon.textContent = '✓';
            }, 800);
        }, index * 1000);
    });
    
    // Complete analysis
    setTimeout(() => {
        completeAnalysis();
    }, 4500);
}

// Complete Analysis
function completeAnalysis() {
    const overlay = document.getElementById('ai-analysis-overlay');
    const title = document.getElementById('analysis-title');
    
    title.textContent = 'Analysis Complete! ✨';
    
    setTimeout(() => {
        overlay.style.display = 'none';
        stopCamera();
        showResults();
        
        // Reset for next use
        resetAnalysisOverlay();
    }, 1000);
}

// Reset Analysis Overlay
function resetAnalysisOverlay() {
    const progressBar = document.getElementById('analysis-progress');
    progressBar.style.width = '0%';
    
    const steps = ['step-1', 'step-2', 'step-3', 'step-4'];
    const icons = ['🔍', '✨', '💎', '🎯'];
    
    steps.forEach((stepId, index) => {
        const step = document.getElementById(stepId);
        step.classList.remove('active', 'completed');
        const icon = step.querySelector('.step-icon');
        icon.textContent = icons[index];
    });
    
    document.getElementById('analysis-title').textContent = 'Analyzing Your Skin';
}

// Retake Photo
function retakePhoto() {
    const video = document.getElementById('camera-video');
    const canvas = document.getElementById('camera-canvas');
    
    canvas.style.display = 'none';
    video.style.display = 'block';
    
    // Show camera overlay and status
    document.querySelector('.camera-overlay').style.display = 'flex';
    document.getElementById('camera-status').style.display = 'flex';
    
    document.getElementById('capture-btn').style.display = 'flex';
    document.getElementById('retake-btn').style.display = 'none';
    
    capturedImageData = null;
    updateCameraStatus('Ready to capture', '✓', 'success');
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
