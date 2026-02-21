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
}

// Toggle for routine step proudct section 
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

// Set canvas size on load
window.addEventListener("load", () => {
  const canvas = document.getElementById("skinRadar");
  if (canvas) {
    canvas.width = 400;
    canvas.height = 400;
  }
});