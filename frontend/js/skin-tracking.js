// Time-based functionality
let timeMode = "morning"; // 'morning', 'afternoon', or 'night'

function detectTimeMode() {
  const hour = new Date().getHours();
  // Morning: 05:00–11:59, Afternoon: 12:00–17:59, Night: 18:00–04:59
  if (hour >= 5 && hour < 12) {
    return "morning";
  } else if (hour >= 12 && hour < 18) {
    return "afternoon";
  } else {
    return "night";
  }
}

function applyTheme() {
  timeMode = detectTimeMode();
  const body = document.body;
  const themeOverride = localStorage.getItem("themeOverride");

  if (themeOverride) {
    body.classList.remove("light-theme", "dark-theme");
    body.classList.add(`${themeOverride}-theme`);
  } else {
    body.classList.remove("light-theme", "dark-theme");
    if (timeMode === "night") {
      body.classList.add("dark-theme");
    } else {
      body.classList.add("light-theme");
    }
  }

  updateSkincareRoutine();
}

function toggleTheme() {
  const body = document.body;
  let themeOverride;

  if (body.classList.contains("light-theme")) {
    body.classList.remove("light-theme");
    body.classList.add("dark-theme");
    themeOverride = "dark";
  } else {
    body.classList.remove("dark-theme");
    body.classList.add("light-theme");
    themeOverride = "light";
  }
  localStorage.setItem("themeOverride", themeOverride);
}

function updateSkincareRoutine() {
  const routineTitle = document.querySelector(".routine-title");
  const routineSteps = document.querySelector(".routine-steps");

  if (!routineTitle || !routineSteps) return;

  if (timeMode === "morning") {
    routineTitle.innerHTML = "☀️ AM Routine";
    routineSteps.innerHTML = `
      <div class="routine-step">✓ Gentle Cleanser</div>
      <div class="routine-step">✓ Vitamin C Serum</div>
      <div class="routine-step">✓ Moisturizer</div>
      <div class="routine-step">✓ SPF 30+ Sunscreen</div>
    `;
  } else if (timeMode === "afternoon") {
    routineTitle.innerHTML = "🌸 Light Refresh";
    routineSteps.innerHTML = `
      <div class="routine-step">✓ Facial Mist</div>
      <div class="routine-step">✓ Reapply SPF</div>
      <div class="routine-step">✓ Hydrating Serum</div>
      <div class="routine-step">✓ Light Moisturizer</div>
    `;
  } else {
    routineTitle.innerHTML = "🌙 PM Routine";
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
  // Skip popup if user previously consented
  if (localStorage.getItem("skinConsentGiven") === "true") {
    showScanner();
    return;
  }
  document.getElementById("consent-popup").style.display = "flex";
}

// Close Consent Popup
function closeConsentPopup() {
  document.getElementById("consent-popup").style.display = "none";
  document.getElementById("consent-check").checked = false;
  document.getElementById("remember-check").checked = false;
  document.getElementById("accept-btn").disabled = true;
}

// Accept Consent and Show Scanner
function acceptConsent() {
  if (document.getElementById("remember-check").checked) {
    localStorage.setItem("skinConsentGiven", "true");
  }
  closeConsentPopup();
  showScanner();
}

// Enable/disable accept button based on checkbox
document.addEventListener("DOMContentLoaded", () => {
  applyTheme();

  const consentCheck = document.getElementById("consent-check");
  const acceptBtn = document.getElementById("accept-btn");

  if (consentCheck && acceptBtn) {
    consentCheck.addEventListener("change", (e) => {
      acceptBtn.disabled = !e.target.checked;
    });
  }
});

// Camera variables
let stream = null;
let currentFacingMode = "user";
let capturedImageData = null;
let faceDetectionInterval = null;
let faceDetector = null;

// Initialize Face Detector
async function initFaceDetector() {
  try {
    if ("FaceDetector" in window) {
      faceDetector = new FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
      return true;
    }
  } catch (error) {
    // Face Detection API not available, using fallback
  }
  return false;
}

// Start Camera
async function startCamera() {
  try {
    const constraints = {
      video: {
        facingMode: currentFacingMode,
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    };

    stream = await navigator.mediaDevices.getUserMedia(constraints);
    const video = document.getElementById("camera-video");
    video.srcObject = stream;

    video.onloadedmetadata = () => {
      video.play();
      setTimeout(() => {
        startFaceDetection();
      }, 500);
    };

    updateCameraStatus("Initializing camera...", "⏳", "info");
  } catch (error) {
    console.error("Error accessing camera:", error);
    updateCameraStatus("Camera access denied", "⚠️", "error");
  }
}

// Start Face Detection
function startFaceDetection() {
  const video = document.getElementById("camera-video");
  const guideOval = document.querySelector(".face-guide-oval");

  faceDetectionInterval = setInterval(() => {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      detectFaceInVideo(video, guideOval);
    }
  }, 300);
}

// Enhanced face detection using image analysis
function detectFaceInVideo(video, guideOval) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = 320;
  canvas.height = 240;

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const ovalWidth = canvas.width * 0.35;
  const ovalHeight = ovalWidth * 1.33;
  const radiusX = ovalWidth / 2;
  const radiusY = ovalHeight / 2;

  const topRegion = { y: centerY - radiusY, height: radiusY * 0.4 };
  const middleRegion = { y: centerY - radiusY * 0.2, height: radiusY * 0.6 };
  const bottomRegion = { y: centerY + radiusY * 0.4, height: radiusY * 0.6 };

  let topSkinPixels = 0, topTotalPixels = 0;
  let middleSkinPixels = 0, middleTotalPixels = 0;
  let bottomSkinPixels = 0, bottomTotalPixels = 0;
  let topBrightness = 0, middleBrightness = 0, bottomBrightness = 0;
  let edgeCount = 0;
  let symmetryScore = 0;

  for (let y = Math.floor(centerY - radiusY); y < Math.floor(centerY + radiusY); y++) {
    for (let x = Math.floor(centerX - radiusX); x < Math.floor(centerX + radiusX); x++) {
      if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
        const normalizedX = (x - centerX) / radiusX;
        const normalizedY = (y - centerY) / radiusY;
        const isInsideOval = normalizedX * normalizedX + normalizedY * normalizedY <= 1;

        if (isInsideOval) {
          const i = (y * canvas.width + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const brightness = (r + g + b) / 3;

          const isSkinTone =
            (r > 60 && g > 40 && b > 20 &&
              r > b && r > g - 20 &&
              Math.abs(r - g) < 50 &&
              r - b > 10 && r - b < 80) ||
            (r > 40 && g > 30 && b > 20 && r >= g && r >= b && r - b < 60);

          if (y >= topRegion.y && y < topRegion.y + topRegion.height) {
            topTotalPixels++;
            topBrightness += brightness;
            if (isSkinTone) topSkinPixels++;
          }
          if (y >= middleRegion.y && y < middleRegion.y + middleRegion.height) {
            middleTotalPixels++;
            middleBrightness += brightness;
            if (isSkinTone) middleSkinPixels++;
          }
          if (y >= bottomRegion.y && y < bottomRegion.y + bottomRegion.height) {
            bottomTotalPixels++;
            bottomBrightness += brightness;
            if (isSkinTone) bottomSkinPixels++;
          }

          if (x < canvas.width - 1 && y < canvas.height - 1) {
            const nextI = (y * canvas.width + (x + 1)) * 4;
            const diff = Math.abs(r - data[nextI]);
            if (diff > 35) edgeCount++;
          }

          if (x < centerX) {
            const mirrorX = Math.floor(centerX + (centerX - x));
            if (mirrorX < canvas.width) {
              const mirrorI = (y * canvas.width + mirrorX) * 4;
              const mirrorR = data[mirrorI];
              if (Math.abs(r - mirrorR) < 40) symmetryScore++;
            }
          }
        }
      }
    }
  }

  const topSkinRatio = topTotalPixels > 0 ? topSkinPixels / topTotalPixels : 0;
  const middleSkinRatio = middleTotalPixels > 0 ? middleSkinPixels / middleTotalPixels : 0;
  const bottomSkinRatio = bottomTotalPixels > 0 ? bottomSkinPixels / bottomTotalPixels : 0;

  topBrightness = topTotalPixels > 0 ? topBrightness / topTotalPixels : 0;
  middleBrightness = middleTotalPixels > 0 ? middleBrightness / middleTotalPixels : 0;
  bottomBrightness = bottomTotalPixels > 0 ? bottomBrightness / bottomTotalPixels : 0;

  const avgBrightness = (topBrightness + middleBrightness + bottomBrightness) / 3;
  const totalPixels = topTotalPixels + middleTotalPixels + bottomTotalPixels;
  const symmetryRatio = totalPixels > 0 ? symmetryScore / (totalPixels / 2) : 0;

  const faceDetected =
    avgBrightness > 50 && avgBrightness < 210 &&
    topSkinRatio > 0.2 &&
    middleSkinRatio > 0.3 &&
    bottomSkinRatio > 0.25 &&
    edgeCount > 80 &&
    symmetryRatio > 0.4 &&
    Math.abs(topBrightness - middleBrightness) < 60 &&
    Math.abs(middleBrightness - bottomBrightness) < 60;

  if (faceDetected) {
    guideOval.classList.add("face-detected");
    updateCameraStatus("Ready to capture", "✓", "success");
    const captureBtn = document.getElementById("capture-btn");
    if (captureBtn) captureBtn.disabled = false;
  } else {
    guideOval.classList.remove("face-detected");
    const captureBtn = document.getElementById("capture-btn");
    if (captureBtn) captureBtn.disabled = true;

    if (avgBrightness < 50) {
      updateCameraStatus("Need more light", "💡", "warning");
    } else if (avgBrightness > 210) {
      updateCameraStatus("Too bright, adjust lighting", "☀️", "warning");
    } else if (topSkinRatio < 0.15 || bottomSkinRatio < 0.15) {
      updateCameraStatus("Center your face in the oval", "👤", "info");
    } else if (middleSkinRatio < 0.25) {
      updateCameraStatus("Move closer to the camera", "📷", "info");
    } else if (symmetryRatio < 0.3) {
      updateCameraStatus("Face the camera directly", "↔️", "info");
    } else {
      updateCameraStatus("Position your face in the oval", "📷", "info");
    }
  }
}

// Kept for compatibility (no longer used)
let lastImageData = null;
function detectMotion(video) {}

// Stop Face Detection
function stopFaceDetection() {
  if (faceDetectionInterval) {
    clearInterval(faceDetectionInterval);
    faceDetectionInterval = null;
  }
  lastImageData = null;
}

// Show Scanner View
function showScanner() {
  document.querySelector(".method-selection-single").style.display = "none";
  document.getElementById("scanner-view").style.display = "block";
  startCamera();
}

// Close Scanner
function closeScanner() {
  stopCamera();
  hideViews();
}

// Hide all views and show method selection
function hideViews() {
  const methodSelection = document.querySelector(".method-selection-single");
  if (methodSelection) {
    methodSelection.style.display = "flex";
  }
  document.getElementById("scanner-view").style.display = "none";
  document.getElementById("results-view").style.display = "none";
}

// Stop Camera
function stopCamera() {
  stopFaceDetection();

  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    stream = null;
  }
  const video = document.getElementById("camera-video");
  if (video) video.srcObject = null;

  const guideOval = document.querySelector(".face-guide-oval");
  if (guideOval) guideOval.classList.remove("face-detected");
}

// Flip Camera
async function flipCamera() {
  currentFacingMode = currentFacingMode === "user" ? "environment" : "user";
  stopCamera();
  await startCamera();
}

// Update Camera Status
function updateCameraStatus(text, icon, type = "info") {
  const statusElement = document.getElementById("camera-status");
  if (statusElement) {
    statusElement.innerHTML = `
      <span class="status-icon">${icon}</span>
      <span class="status-text ${type}">${text}</span>
    `;
  }
}

// Helper: Convert dataURL to Blob
function dataURLtoBlob(dataurl) {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

// Capture Photo — async so we can await both animation and API call
async function capturePhoto() {
  stopFaceDetection();

  const video = document.getElementById("camera-video");
  const canvas = document.getElementById("camera-canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  capturedImageData = canvas.toDataURL("image/jpeg", 0.9);

  canvas.style.display = "block";
  video.style.display = "none";
  document.querySelector(".camera-overlay").style.display = "none";
  document.getElementById("camera-status").style.display = "none";
  document.getElementById("capture-btn").style.display = "none";
  document.getElementById("retake-btn").style.display = "flex";

  // Run animation and API call in parallel.
  // completeAnalysis only fires when BOTH are done — fixes the race condition.
  await Promise.all([
    runAnalysisAnimation(4500),
    sendCapturedImageToBackend(capturedImageData),
  ]);

  completeAnalysis();
}

// Send captured image to backend: presign → S3 upload → AI analyze
async function sendCapturedImageToBackend(dataUrl) {
  try {
    const apiConfig = typeof API_CONFIG !== "undefined" ? API_CONFIG : window.API_CONFIG;

    const blob = dataURLtoBlob(dataUrl);
    const contentType = blob.type || "image/jpeg";

    // 1) Get presigned URL from backend
    const presignResp = await fetch(apiConfig.BASE_URL + apiConfig.ENDPOINTS.SKIN_UPLOAD_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentType }),
    });
    if (!presignResp.ok) throw new Error("Failed to get upload URL");
    const { uploadUrl, s3Key } = await presignResp.json();

    // 2) Upload directly to S3
    const putResp = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body: blob,
    });
    if (!putResp.ok) throw new Error("Failed to upload to S3");

    // 3) Trigger AI analysis
    const analyzeResp = await fetch(apiConfig.BASE_URL + apiConfig.ENDPOINTS.SKIN_ANALYZE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        s3Key,
        timeOfDay: detectTimeMode(),
        cyclePhase: "unknown",
        skinGoals: ["hydration", "texture"],
      }),
    });
    if (!analyzeResp.ok) {
      const err = await analyzeResp.text();
      throw new Error(err || "Analyze failed");
    }

    const analysis = await analyzeResp.json();
    window.__skinAnalysisResult = analysis;
  } catch (err) {
    console.error("Error in sendCapturedImageToBackend:", err);
    // Don't block the UI — results will render with fallback/default values
  }
}

// Runs progress bar + step animations for a guaranteed minimum duration,
// resolves when done so Promise.all can gate on both this and the API call.
function runAnalysisAnimation(durationMs) {
  return new Promise((resolve) => {
    const overlay = document.getElementById("ai-analysis-overlay");
    const progressBar = document.getElementById("analysis-progress");

    overlay.style.display = "flex";

    // Phase 1: animate to 90% over durationMs
    let progress = 0;
    const intervalMs = durationMs / 90;
    const progressInterval = setInterval(() => {
      progress += 1;
      progressBar.style.width = progress + "%";
      if (progress >= 90) {
        clearInterval(progressInterval);
        // Phase 2: crawl slowly from 90% → 99% until API resolves
        const crawlInterval = setInterval(() => {
          if (progress < 99) {
            progress += 0.2;
            progressBar.style.width = progress + "%";
          }
        }, 200);
        // Store crawl interval so completeAnimation can clear it
        progressBar._crawlInterval = crawlInterval;
        resolve(); // signal Promise.all we're "done" — API now controls the gate
      }
    }, intervalMs);

    const steps = ["step-1", "step-2", "step-3", "step-4"];
    steps.forEach((stepId, index) => {
      setTimeout(() => {
        const step = document.getElementById(stepId);
        step.classList.add("active");
        setTimeout(() => {
          step.classList.add("completed");
          step.querySelector(".step-icon").textContent = "✓";
        }, 800);
      }, (index / steps.length) * durationMs);
    });
  });
}

// Legacy wrapper — kept in case anything else calls this
function startAIAnalysis() {
  runAnalysisAnimation(4500);
}

// Complete Analysis
function completeAnalysis() {
  const overlay = document.getElementById("ai-analysis-overlay");
  const title = document.getElementById("analysis-title");
  const progressBar = document.getElementById("analysis-progress");

  // Clear the crawl interval and snap to 100%
  if (progressBar._crawlInterval) {
    clearInterval(progressBar._crawlInterval);
    progressBar._crawlInterval = null;
  }
  progressBar.style.width = "100%";

  title.textContent = "Analysis Complete! ✨";

  setTimeout(() => {
    overlay.style.display = "none";
    stopCamera();
    showResults();
    resetAnalysisOverlay();
  }, 1000);
}

// Reset Analysis Overlay
function resetAnalysisOverlay() {
  document.getElementById("analysis-progress").style.width = "0%";

  const steps = ["step-1", "step-2", "step-3", "step-4"];
  const icons = ["🔍", "✨", "💎", "🎯"];

  steps.forEach((stepId, index) => {
    const step = document.getElementById(stepId);
    step.classList.remove("active", "completed");
    step.querySelector(".step-icon").textContent = icons[index];
  });

  document.getElementById("analysis-title").textContent = "Analyzing Your Skin";
}

// Retake Photo
function retakePhoto() {
  const video = document.getElementById("camera-video");
  const canvas = document.getElementById("camera-canvas");

  canvas.style.display = "none";
  video.style.display = "block";
  document.querySelector(".camera-overlay").style.display = "flex";
  document.getElementById("camera-status").style.display = "flex";
  document.getElementById("capture-btn").style.display = "flex";
  document.getElementById("retake-btn").style.display = "none";

  capturedImageData = null;

  setTimeout(() => {
    startFaceDetection();
  }, 300);
}

// Show Results View
function showResults() {
  document.getElementById("scanner-view").style.display = "none";
  document.getElementById("results-view").style.display = "block";

  renderSkinAnalysisResult();
  drawRadarChart();
  
  // Generate and display product recommendations
  const skinType = localStorage.getItem('skinType') || 'normal';
  const cyclePhase = calculateCurrentCyclePhase();
  
  // Get skin analysis from backend result
  const result = window.__skinAnalysisResult;
  const skinAnalysis = {
    acne_detected: result?.concerns_detected?.some(c => c.toLowerCase().includes('acne')) || false,
    dryness_detected: result?.concerns_detected?.some(c => c.toLowerCase().includes('dry')) || false,
    oiliness_detected: result?.concerns_detected?.some(c => c.toLowerCase().includes('oil')) || false,
    redness_detected: result?.concerns_detected?.some(c => c.toLowerCase().includes('red')) || false
  };
  
  displayProductRecommendations(skinAnalysis, cyclePhase, skinType);
}

function calculateCurrentCyclePhase() {
  const lastPeriod = localStorage.getItem('lastPeriod');
  const cycleDays = parseInt(localStorage.getItem('cycleDays')) || 28;
  
  if (!lastPeriod) {
    return 'follicular';
  }
  
  try {
    const lastPeriodDate = new Date(lastPeriod);
    const today = new Date();
    const daysSince = Math.floor((today - lastPeriodDate) / (1000 * 60 * 60 * 24));
    const cycleDay = (daysSince % cycleDays) + 1;
    
    if (cycleDay <= 5) {
      return 'menstrual';
    } else if (cycleDay <= Math.floor(cycleDays * 0.43)) {
      return 'follicular';
    } else if (cycleDay <= Math.floor(cycleDays * 0.57)) {
      return 'ovulation';
    } else {
      return 'luteal';
    }
  } catch (error) {
    console.error('Error calculating cycle phase:', error);
    return 'follicular';
  }
}

// Toggle for routine step product section 
function toggleRoutineStep(index, stepText) {
  const expanded = document.getElementById(`routine-step-expanded-${index}`);
  const card = document.getElementById(`routine-step-${index}`);
  const chevron = card.querySelector('.routine-step-chevron');
  
  const isOpen = expanded.style.display !== 'none';
  expanded.style.display = isOpen ? 'none' : 'block';
  chevron.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(90deg)';
  card.classList.toggle('expanded', !isOpen);
}

// Render AI analysis result into the UI
function renderSkinAnalysisResult() {
  const result = window.__skinAnalysisResult;
  if (!result) return;

  // Summary
  const msgEl = document.querySelector(".score-message");
  if (msgEl && result.summary) msgEl.textContent = result.summary;

  // Overall score from metrics
  const m = result.metrics || {};
  const metricValues = Object.values(m).filter((v) => typeof v === "number");
  const avgScore = metricValues.length
    ? Math.round(metricValues.reduce((a, b) => a + b, 0) / metricValues.length)
    : 75;

  const scoreEl = document.querySelector(".score-number");
  if (scoreEl) scoreEl.textContent = avgScore;

  const scoreCircle = document.querySelector(".score-circle circle:nth-child(2)");
  if (scoreCircle) {
    scoreCircle.setAttribute("stroke-dashoffset", 314 - (314 * avgScore) / 100);
  }

  // Metric cards
  const metricItems = document.querySelectorAll(".metric-item");
  const metricMap = [
    { label: "Radiance", key: "radiance" },
    { label: "Moisture", key: "moisture" },
    { label: "Texture", key: "texture" },
    { label: "Pores", key: "pores" },
    { label: "Dark Circles", key: "dark_circles" },
  ];
  metricItems.forEach((item, i) => {
    if (metricMap[i]) {
      const val = m[metricMap[i].key];
      const valEl = item.querySelector(".metric-value");
      const labelEl = item.querySelector(".metric-label");
      if (valEl && val !== undefined) valEl.textContent = val;
      if (labelEl) labelEl.textContent = metricMap[i].label;
    }
  });

  // AM/PM routine
  const routineSteps = document.querySelector(".routine-steps");
  const routineTitle = document.querySelector(".routine-title");
  const isNight = detectTimeMode() === "night";
  const steps = isNight ? result.pm_routine : result.am_routine;
  if (routineTitle) routineTitle.textContent = isNight ? "🌙 Night Skincare Routine" : "☀️ Day Skincare Routine";
  if (routineSteps && Array.isArray(steps))  {
    routineSteps.innerHTML = steps.map((s, i) => `
      <div class="routine-step" id="routine-step-${i}" onclick="toggleRoutineStep(${i}, '${s.replace(/'/g, "\\'")}')">
        <div class="routine-step-header">
          <span class="routine-step-check">✓</span>
          <span class="routine-step-text">${s}</span>
          <span class="routine-step-chevron">›</span>
        </div>
        <div class="routine-step-expanded" id="routine-step-expanded-${i}" style="display:none;">
          <div class="suggested-product">
            <span class="suggested-label">🛍️ Suggested product</span>
            <a href="https://www.amazon.com.au/s?k=${encodeURIComponent(s)}" 
               target="_blank" 
               class="amazon-link">
              Search "${s}" on Amazon →
            </a>
          </div>
        </div>
      </div>
    `).join("");
  }

  // Remove static hardcoded recommendation cards
  document.querySelectorAll(".recommendations .recommendation-card").forEach((el) => el.remove());

  // Tips
  const tipsEl = document.getElementById("ai-tips");
  if (tipsEl && Array.isArray(result.tips)) {
    tipsEl.innerHTML = `
      <h3 style="margin-top: 1.5rem">Tips for You</h3>
      ${result.tips.map((t) => `
        <div class="recommendation-card">
          <div class="rec-icon">✨</div>
          <div class="rec-content"><p>${t}</p></div>
        </div>`).join("")}
    `;
  }

  // Concerns detected
  if (Array.isArray(result.concerns_detected) && result.concerns_detected.length) {
    const tipsEl = document.getElementById("ai-tips");
    if (tipsEl) {
      tipsEl.innerHTML += `
        <h3 style="margin-top: 1.5rem">Concerns Detected</h3>
        ${result.concerns_detected.map((c) => `
          <div class="recommendation-card">
            <div class="rec-icon">🔍</div>
            <div class="rec-content"><p>${c}</p></div>
          </div>`).join("")}
      `;
    }
  }

  // Disclaimer
  const disEl = document.getElementById("ai-disclaimer");
  if (disEl && result.disclaimer) disEl.textContent = result.disclaimer;
}

// Draw Radar Chart
function drawRadarChart() {
  const canvas = document.getElementById("skinRadar");
  if (!canvas) return;

  // Make canvas responsive
  const container = canvas.parentElement;
  const containerWidth = container.clientWidth;
  const size = Math.min(containerWidth - 40, 400);
  
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY) - 40;

  const labels = ["Radiance", "Moisture", "Texture", "Pores", "Dark Circles", "Oiliness", "Redness"];

  const result = window.__skinAnalysisResult;
  const m = result?.metrics || {};
  const data = [
    m.radiance ?? 70,
    m.moisture ?? 70,
    m.texture ?? 70,
    m.pores ?? 70,
    m.dark_circles ?? 70,
    m.oiliness ?? 70,
    m.redness ?? 70,
  ];
  const numPoints = data.length;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background circles
  ctx.strokeStyle = "#E8E4F3";
  ctx.lineWidth = 1;
  for (let i = 1; i <= 5; i++) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, (radius / 5) * i, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Axes + labels
  ctx.strokeStyle = "#E8E4F3";
  ctx.lineWidth = 1;
  for (let i = 0; i < numPoints; i++) {
    const angle = (Math.PI * 2 * i) / numPoints - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x, y);
    ctx.stroke();

    const labelX = centerX + (radius + 30) * Math.cos(angle);
    const labelY = centerY + (radius + 30) * Math.sin(angle);
    ctx.fillStyle = "#7A7A8E";
    ctx.font = "12px Outfit";
    ctx.textAlign = "center";
    ctx.fillText(labels[i], labelX, labelY);
  }

  // Data polygon
  ctx.beginPath();
  for (let i = 0; i < numPoints; i++) {
    const angle = (Math.PI * 2 * i) / numPoints - Math.PI / 2;
    const value = data[i] / 100;
    const x = centerX + radius * value * Math.cos(angle);
    const y = centerY + radius * value * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "rgba(168, 230, 207, 0.3)");
  gradient.addColorStop(1, "rgba(255, 182, 217, 0.3)");
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.strokeStyle = "#FFB6D9";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Data points
  for (let i = 0; i < numPoints; i++) {
    const angle = (Math.PI * 2 * i) / numPoints - Math.PI / 2;
    const value = data[i] / 100;
    const x = centerX + radius * value * Math.cos(angle);
    const y = centerY + radius * value * Math.sin(angle);

    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#FFB6D9";
    ctx.fill();
  }
}

// Set canvas size on load and resize
function initRadarChart() {
  const canvas = document.getElementById('skinRadar');
  if (canvas) {
    drawRadarChart();
  }
}

window.addEventListener('load', initRadarChart);
window.addEventListener('resize', drawRadarChart);Align = "center";
    ctx.fillText(labels[i], labelX, labelY);
  }

  // Data polygon
  ctx.beginPath();
  for (let i = 0; i < numPoints; i++) {
    const angle = (Math.PI * 2 * i) / numPoints - Math.PI / 2;
    const value = data[i] / 100;
    const x = centerX + radius * value * Math.cos(angle);
    const y = centerY + radius * value * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "rgba(168, 230, 207, 0.3)");
  gradient.addColorStop(1, "rgba(255, 182, 217, 0.3)");
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.strokeStyle = "#FFB6D9";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Data points
  for (let i = 0; i < numPoints; i++) {
    const angle = (Math.PI * 2 * i) / numPoints - Math.PI / 2;
    const value = data[i] / 100;
    const x = centerX + radius * value * Math.cos(angle);
    const y = centerY + radius * value * Math.sin(angle);

    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#FFB6D9";
    ctx.fill();
  }
}

<<<<<<< HEAD
// Set canvas size on load
window.addEventListener("load", () => {
  const canvas = document.getElementById("skinRadar");
  if (canvas) {
    canvas.width = 400;
    canvas.height = 400;
  }
});
=======
// Set canvas size on load and resize
function initRadarChart() {
    const canvas = document.getElementById('skinRadar');
    if (canvas) {
        drawRadarChart();
    }
}

window.addEventListener('load', initRadarChart);
window.addEventListener('resize', drawRadarChart);


// ===== PRODUCT RECOMMENDATIONS =====

function generateProductRecommendations(skinAnalysis, cyclePhase, skinType) {
    /**
     * Generate personalized product recommendations based on:
     * - Skin analysis results (acne, dryness, oiliness, etc.)
     * - Cycle phase (menstrual, follicular, ovulation, luteal)
     * - Skin type (from user profile)
     */
    
    const products = [];
    
    // Get skin type from localStorage if not provided
    if (!skinType) {
        skinType = localStorage.getItem('skinType') || 'normal';
    }
    
    // Get cycle phase (simplified - you can enhance this)
    if (!cyclePhase) {
        cyclePhase = 'follicular'; // Default
    }
    
    // PRODUCT DATABASE
    const productDatabase = {
        // CLEANSERS
        gentle_cleanser: {
            name: "CeraVe Hydrating Facial Cleanser",
            category: "Cleanser",
            icon: "🧼",
            description: "A mild, non-stripping cleanser that removes impurities while maintaining skin's natural moisture barrier.",
            benefits: ["Hydrating", "pH-Balanced", "Fragrance-Free"],
            ingredients: "Ceramides, Hyaluronic Acid, Glycerin",
            forSkinTypes: ["dry", "sensitive", "normal"],
            forConcerns: ["dryness", "sensitivity"],
            cyclePhases: ["menstrual", "luteal"],
            price: "$14.99",
            rating: 4.6,
            reviews: 45000,
            amazonLink: "AMAZON_LINK_PLACEHOLDER_1" // Tu compañera reemplazará esto
        },
        foaming_cleanser: {
            name: "La Roche-Posay Effaclar Cleanser",
            category: "Cleanser",
            icon: "🫧",
            description: "Deep-cleansing formula that removes excess oil and unclogs pores without over-drying.",
            benefits: ["Oil Control", "Pore Cleansing", "Refreshing"],
            ingredients: "Salicylic Acid, Zinc, Glycerin",
            forSkinTypes: ["oily", "combination", "acne-prone"],
            forConcerns: ["oiliness", "acne", "large_pores"],
            cyclePhases: ["ovulation", "follicular"],
            price: "$15.99",
            rating: 4.5,
            reviews: 32000,
            amazonLink: "AMAZON_LINK_PLACEHOLDER_2"
        },
        
        // SERUMS
        vitamin_c_serum: {
            name: "TruSkin Vitamin C Serum",
            category: "Serum",
            icon: "✨",
            description: "Powerful antioxidant serum that brightens skin, evens tone, and boosts radiance.",
            benefits: ["Brightening", "Antioxidant", "Anti-Aging"],
            ingredients: "Vitamin C 20%, Hyaluronic Acid, Vitamin E",
            forSkinTypes: ["normal", "dry", "combination"],
            forConcerns: ["dullness", "dark_spots", "uneven_tone"],
            cyclePhases: ["ovulation", "follicular"],
            price: "$19.99",
            rating: 4.3,
            reviews: 78000,
            amazonLink: "AMAZON_LINK_PLACEHOLDER_3"
        },
        hyaluronic_serum: {
            name: "The Ordinary Hyaluronic Acid 2% + B5",
            category: "Serum",
            icon: "💧",
            description: "Intense hydration serum that plumps skin and reduces the appearance of fine lines.",
            benefits: ["Deep Hydration", "Plumping", "Soothing"],
            ingredients: "Hyaluronic Acid, Vitamin B5",
            forSkinTypes: ["dry", "sensitive", "normal", "combination"],
            forConcerns: ["dryness", "fine_lines", "dehydration"],
            cyclePhases: ["menstrual", "luteal"],
            price: "$7.99",
            rating: 4.5,
            reviews: 95000,
            amazonLink: "AMAZON_LINK_PLACEHOLDER_4"
        },
        niacinamide_serum: {
            name: "The Ordinary Niacinamide 10% + Zinc 1%",
            category: "Serum",
            icon: "🌟",
            description: "Multi-tasking serum that controls oil, minimizes pores, and reduces inflammation.",
            benefits: ["Oil Control", "Pore Minimizing", "Anti-Inflammatory"],
            ingredients: "Niacinamide 10%, Zinc 1%",
            forSkinTypes: ["oily", "combination", "acne-prone"],
            forConcerns: ["oiliness", "acne", "large_pores", "redness"],
            cyclePhases: ["luteal", "ovulation"],
            price: "$5.99",
            rating: 4.4,
            reviews: 120000,
            amazonLink: "AMAZON_LINK_PLACEHOLDER_5"
        },
        retinol_serum: {
            name: "RoC Retinol Correxion Deep Wrinkle Serum",
            category: "Treatment",
            icon: "🔬",
            description: "Anti-aging powerhouse that accelerates cell turnover and reduces wrinkles.",
            benefits: ["Anti-Aging", "Smoothing", "Acne Prevention"],
            ingredients: "Retinol, Hyaluronic Acid, Glycerin",
            forSkinTypes: ["normal", "oily", "combination", "acne-prone"],
            forConcerns: ["wrinkles", "acne", "texture"],
            cyclePhases: ["follicular", "ovulation"],
            price: "$22.99",
            rating: 4.4,
            reviews: 28000,
            amazonLink: "AMAZON_LINK_PLACEHOLDER_6"
        },
        
        // MOISTURIZERS
        rich_moisturizer: {
            name: "CeraVe Moisturizing Cream",
            category: "Moisturizer",
            icon: "🧴",
            description: "Deeply nourishing cream that repairs and strengthens the skin barrier.",
            benefits: ["Intense Hydration", "Barrier Repair", "Soothing"],
            ingredients: "Ceramides, Hyaluronic Acid, Petrolatum",
            forSkinTypes: ["dry", "sensitive"],
            forConcerns: ["dryness", "sensitivity", "barrier_damage"],
            cyclePhases: ["menstrual", "luteal"],
            price: "$16.99",
            rating: 4.7,
            reviews: 67000,
            amazonLink: "AMAZON_LINK_PLACEHOLDER_7"
        },
        lightweight_moisturizer: {
            name: "Neutrogena Hydro Boost Water Gel",
            category: "Moisturizer",
            icon: "💦",
            description: "Oil-free gel formula that hydrates without clogging pores or adding shine.",
            benefits: ["Oil-Free", "Non-Comedogenic", "Lightweight"],
            ingredients: "Hyaluronic Acid, Glycerin, Dimethicone",
            forSkinTypes: ["oily", "combination", "acne-prone"],
            forConcerns: ["oiliness", "acne"],
            cyclePhases: ["ovulation", "follicular"],
            price: "$17.99",
            rating: 4.5,
            reviews: 52000,
            amazonLink: "AMAZON_LINK_PLACEHOLDER_8"
        },
        
        // TREATMENTS
        salicylic_treatment: {
            name: "Paula's Choice 2% BHA Liquid Exfoliant",
            category: "Treatment",
            icon: "🎯",
            description: "Targeted treatment that quickly reduces breakouts and prevents new ones.",
            benefits: ["Acne Fighting", "Pore Clearing", "Exfoliating"],
            ingredients: "Salicylic Acid 2%, Green Tea Extract",
            forSkinTypes: ["oily", "combination", "acne-prone"],
            forConcerns: ["acne", "breakouts"],
            cyclePhases: ["luteal", "menstrual"],
            price: "$32.00",
            rating: 4.5,
            reviews: 41000,
            amazonLink: "AMAZON_LINK_PLACEHOLDER_9"
        },
        azelaic_acid: {
            name: "The Ordinary Azelaic Acid Suspension 10%",
            category: "Treatment",
            icon: "🌸",
            description: "Multi-benefit treatment for acne, redness, and hyperpigmentation.",
            benefits: ["Anti-Acne", "Brightening", "Anti-Redness"],
            ingredients: "Azelaic Acid 10%",
            forSkinTypes: ["sensitive", "acne-prone", "combination"],
            forConcerns: ["acne", "redness", "dark_spots"],
            cyclePhases: ["luteal", "menstrual"],
            price: "$12.99",
            rating: 4.3,
            reviews: 38000,
            amazonLink: "AMAZON_LINK_PLACEHOLDER_10"
        },
        
        // SUNSCREEN
        mineral_sunscreen: {
            name: "EltaMD UV Clear Broad-Spectrum SPF 46",
            category: "Sunscreen",
            icon: "☀️",
            description: "Gentle mineral sunscreen that protects without irritation.",
            benefits: ["Broad Spectrum", "Oil-Free", "Lightweight"],
            ingredients: "Zinc Oxide 9%, Niacinamide, Hyaluronic Acid",
            forSkinTypes: ["sensitive", "dry", "normal"],
            forConcerns: ["sensitivity", "sun_protection"],
            cyclePhases: ["menstrual", "follicular", "ovulation", "luteal"],
            price: "$39.00",
            rating: 4.6,
            reviews: 15000,
            amazonLink: "AMAZON_LINK_PLACEHOLDER_11"
        },
        chemical_sunscreen: {
            name: "La Roche-Posay Anthelios Melt-In Milk SPF 60",
            category: "Sunscreen",
            icon: "🌞",
            description: "Invisible, lightweight sunscreen perfect for oily skin.",
            benefits: ["Matte Finish", "Oil-Free", "Water-Resistant"],
            ingredients: "Avobenzone, Homosalate, Octisalate",
            forSkinTypes: ["oily", "combination", "acne-prone"],
            forConcerns: ["oiliness", "sun_protection"],
            cyclePhases: ["menstrual", "follicular", "ovulation", "luteal"],
            price: "$35.99",
            rating: 4.5,
            reviews: 22000,
            amazonLink: "AMAZON_LINK_PLACEHOLDER_12"
        }
    };
    
    // RECOMMENDATION LOGIC
    
    // 1. CLEANSER - Based on skin type
    if (skinType === 'dry' || skinType === 'sensitive') {
        products.push({
            ...productDatabase.gentle_cleanser,
            why: `Perfect for ${skinType} skin. Your skin needs gentle cleansing to avoid stripping natural oils, especially during ${cyclePhase} phase.`
        });
    } else if (skinType === 'oily' || skinType === 'acne-prone' || skinType === 'combination') {
        products.push({
            ...productDatabase.foaming_cleanser,
            why: `Ideal for ${skinType} skin. Controls excess oil and prevents breakouts, especially important during ${cyclePhase} phase.`
        });
    }
    
    // 2. SERUM - Based on skin analysis + cycle phase
    if (skinAnalysis && skinAnalysis.acne_detected) {
        // Acne detected
        if (cyclePhase === 'luteal' || cyclePhase === 'menstrual') {
            products.push({
                ...productDatabase.niacinamide_serum,
                why: "Acne detected + hormonal phase. Niacinamide reduces inflammation and controls oil production during PMS/period."
            });
            products.push({
                ...productDatabase.salicylic_treatment,
                why: "Target active breakouts with this spot treatment. Hormonal acne needs targeted care during luteal/menstrual phase."
            });
        } else {
            products.push({
                ...productDatabase.retinol_serum,
                why: "Acne detected + follicular/ovulation phase. Perfect time for retinol - prevents future breakouts and improves texture."
            });
        }
    } else if (skinAnalysis && skinAnalysis.dryness_detected) {
        // Dryness detected
        products.push({
            ...productDatabase.hyaluronic_serum,
            why: "Dryness detected. Hyaluronic acid provides intense hydration without heaviness."
        });
    } else if (cyclePhase === 'ovulation' || cyclePhase === 'follicular') {
        // Peak glow phase
        products.push({
            ...productDatabase.vitamin_c_serum,
            why: `${cyclePhase} phase = peak glow time! Vitamin C boosts your natural radiance and evens skin tone.`
        });
    } else {
        // Default serum
        products.push({
            ...productDatabase.niacinamide_serum,
            why: "Multi-tasking serum that balances oil, minimizes pores, and reduces redness. Perfect for all skin types."
        });
    }
    
    // 3. MOISTURIZER - Based on skin type
    if (skinType === 'dry' || skinType === 'sensitive') {
        products.push({
            ...productDatabase.rich_moisturizer,
            why: `${skinType} skin needs rich hydration. This cream repairs your skin barrier and locks in moisture.`
        });
    } else if (skinType === 'oily' || skinType === 'acne-prone' || skinType === 'combination') {
        products.push({
            ...productDatabase.lightweight_moisturizer,
            why: `${skinType} skin needs hydration without heaviness. This gel moisturizer won't clog pores or add shine.`
        });
    }
    
    // 4. SUNSCREEN - Always recommend (based on skin type)
    if (skinType === 'sensitive' || skinType === 'dry') {
        products.push({
            ...productDatabase.mineral_sunscreen,
            why: "Gentle mineral sunscreen perfect for sensitive skin. Protects without irritation. Non-negotiable daily step!"
        });
    } else {
        products.push({
            ...productDatabase.chemical_sunscreen,
            why: "Lightweight, invisible sunscreen that won't make your skin greasy. Essential daily protection!"
        });
    }
    
    // 5. SPECIAL TREATMENTS - Based on specific concerns
    if (skinAnalysis && skinAnalysis.redness_detected && skinType === 'sensitive') {
        products.push({
            ...productDatabase.azelaic_acid,
            why: "Redness detected. Azelaic acid calms inflammation and reduces redness without irritation."
        });
    }
    
    return products;
}

function displayProductRecommendations(skinAnalysis, cyclePhase, skinType) {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;
    
    // Generate recommendations
    const products = generateProductRecommendations(skinAnalysis, cyclePhase, skinType);
    
    // Clear existing products
    productsGrid.innerHTML = '';
    
    // Display products
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        productCard.innerHTML = `
            <div class="product-header">
                <div class="product-icon">${product.icon}</div>
                <div class="product-info">
                    <div class="product-name">${product.name}</div>
                    <div class="product-category">${product.category}</div>
                </div>
            </div>
            <div class="product-rating">
                <div class="stars">${'⭐'.repeat(Math.floor(product.rating))}${product.rating % 1 >= 0.5 ? '½' : ''}</div>
                <span class="rating-count">(${(product.reviews / 1000).toFixed(1)}k reviews)</span>
            </div>
            <p class="product-description">${product.description}</p>
            <div class="product-benefits">
                ${product.benefits.map(benefit => `<span class="benefit-tag">${benefit}</span>`).join('')}
            </div>
            <div class="product-why">
                <div class="product-why-title">💜 Why this product for you?</div>
                <div class="product-why-text">${product.why}</div>
            </div>
            <div class="product-ingredients">
                <div class="ingredients-title">Key Ingredients:</div>
                <div class="ingredients-list">${product.ingredients}</div>
            </div>
            <div class="product-footer">
                <div class="product-price">${product.price}</div>
                <a href="${product.amazonLink}" target="_blank" rel="noopener noreferrer" class="amazon-buy-btn">
                    <span class="amazon-icon">🛒</span>
                    <span>Buy on Amazon</span>
                </a>
            </div>
        `;
        
        productsGrid.appendChild(productCard);
    });
}

// Call this function when showing results
// Example: displayProductRecommendations(skinAnalysisData, 'luteal', 'acne-prone');
