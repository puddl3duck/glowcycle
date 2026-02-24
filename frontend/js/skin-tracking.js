// Time-based functionality
let timeMode = "morning"; // 'morning', 'afternoon', or 'night'

// CRITICAL: Sync session data from sessionStorage to localStorage on page load
(function syncSessionData() {
  const savedSession = sessionStorage.getItem('userSession');
  if (savedSession) {
    try {
      const session = JSON.parse(savedSession);
      if (session.userName) {
        localStorage.setItem('userName', session.userName);
      }
      if (session.userDisplayName) {
        localStorage.setItem('userDisplayName', session.userDisplayName);
      }
    } catch (e) {
      console.error('Error syncing session:', e);
    }
  }
})();

// Load user profile
function loadUserProfile() {
  // Try to get display name first, then username, then default
  const userDisplayName = localStorage.getItem('userDisplayName');
  const userName = localStorage.getItem('userName');
  const finalName = userDisplayName || userName || 'Beautiful';
  
  const profileNameElement = document.getElementById('profile-name');
  const profileAvatarElement = document.getElementById('profile-avatar');
  
  if (profileNameElement) {
    profileNameElement.textContent = finalName;
  }
  
  if (profileAvatarElement) {
    profileAvatarElement.textContent = finalName.charAt(0).toUpperCase();
  }
}

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
    routineTitle.innerHTML = "☀️ Morning Skin Routine";
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
    routineTitle.innerHTML = "🌙 Night Skin Routine";
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
};

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
    topSkinRatio > 0.15 &&
    middleSkinRatio > 0.2 &&
    bottomSkinRatio > 0.15 &&
    edgeCount > 60 &&
    symmetryRatio > 0.3 &&
    Math.abs(topBrightness - middleBrightness) < 70 &&
    Math.abs(middleBrightness - bottomBrightness) < 70;

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
  // Hide main content
  document.querySelector('.method-selection-single').style.display = 'none';
  document.querySelector('.scan-history-section').style.display = 'none';
  document.querySelector('.page-header').style.display = 'none';
  document.querySelector('.back-navigation').style.display = 'none';

  // Show scanner
  document.getElementById('scanner-view').style.display = 'block';

  // Start camera
  startCamera();
}

function closeScanner() {
  // Stop camera
  const video = document.getElementById('camera-video');
  if (video && video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
    video.srcObject = null;
  }

  // Hide scanner
  document.getElementById('scanner-view').style.display = 'none';

  // Restore main content
  document.querySelector('.method-selection-single').style.display = 'block';
  document.querySelector('.scan-history-section').style.display = 'block';
  document.querySelector('.page-header').style.display = 'block';
  document.querySelector('.back-navigation').style.display = 'block';
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
        cyclePhase: getCycleDayAndPhase().phase,
        skinGoals: ["hydration", "texture"],
        skinType: localStorage.getItem('skinType') || 'normal',
      }),
    });
    if (!analyzeResp.ok) {
      const err = await analyzeResp.text();
      throw new Error(err || "Analyze failed");
    }

    const analysis = await analyzeResp.json();
    
    // CRITICAL: Store both the captured image (for immediate view) and S3 key (for history)
    analysis.capturedImage = dataUrl;
    analysis.s3ImageKey = s3Key; // Store S3 key for loading from history
    
    window.__skinAnalysisResult = analysis;

  } catch (err) {
    console.error("Error in sendCapturedImageToBackend:", err);
  }
}

// Save report to DynamoDB when user clicks Save Report
async function saveReport() {
  const result = window.__skinAnalysisResult;
  if (!result) {
    alert("No analysis to save yet.");
    return;
  }

  const apiConfig = typeof API_CONFIG !== "undefined" ? API_CONFIG : window.API_CONFIG;
  const user = document.querySelector(".profile-name")?.textContent?.trim()
    || localStorage.getItem("userName")
    || "anonymous";

  const saveBtn = document.querySelector(".save-btn");
  if (saveBtn) {
    saveBtn.textContent = "Saving...";
    saveBtn.disabled = true;
  }

  try {
    const cycleInfo = getCycleDayAndPhase();

    // CRITICAL: Remove capturedImage before saving to avoid DynamoDB size limit (400KB)
    // The image is already in S3, we don't need to duplicate it in DynamoDB
    const analysisToSave = {
      ...result,
      cycleDay: cycleInfo.day,
      cyclePhase: cycleInfo.phase,
    };
    
    // Remove the large capturedImage data URL to avoid exceeding DynamoDB limits
    delete analysisToSave.capturedImage;

    const resp = await fetch(apiConfig.BASE_URL + "/skin/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user,
        analysis: analysisToSave
      }),
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      console.error('Backend error:', resp.status, errorText);
      throw new Error(`Save failed: ${resp.status} - ${errorText}`);
    }

    if (saveBtn) {
      saveBtn.textContent = "✓ Saved!";
      saveBtn.style.background = "linear-gradient(135deg, #A8E6CF, #68C9A3)";
    }

    // Reload history so the new entry appears immediately
    await loadScanHistory();

  } catch (err) {
    console.error("Error saving report:", err);
    if (saveBtn) {
      saveBtn.textContent = "Save failed — try again";
      saveBtn.disabled = false;
    }
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

function showResults() {
  // Hide scanner and main content
  document.getElementById("scanner-view").style.display = "none";
  document.querySelector('.method-selection-single').style.display = 'none';
  document.querySelector('.scan-history-section').style.display = 'none';
  document.querySelector('.page-header').style.display = 'none';
  document.querySelector('.back-navigation').style.display = 'none';

  // Show results
  document.getElementById("results-view").style.display = "block";

  // Update cycle day dynamically
  const { day, phase, emoji } = getCycleDayAndPhase();
  const reportDate = document.querySelector(".report-date");
  if (reportDate) {
    reportDate.textContent = day
      ? `Day ${day} • ${phase} ${emoji}`
      : `${phase} ${emoji}`;
  }

  renderSkinAnalysisResult();
  drawRadarChart();
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
  const overallScore = result.overall_skin_health ?? avgScore;

  const scoreEl = document.querySelector(".score-number");
  if (scoreEl) scoreEl.textContent = overallScore;

  const scoreCircle = document.querySelector(".score-circle circle:nth-child(2)");
  if (scoreCircle) {
    scoreCircle.setAttribute("stroke-dashoffset", 314 - (314 * overallScore) / 100);
  }

  // Metric cards
  const metricItems = document.querySelectorAll(".metric-item");
  const metricMap = [
    { label: "Radiance", key: "radiance" },
    { label: "Moisture", key: "moisture" },
    { label: "Texture", key: "texture" },
    { label: "Pores", key: "pores" },
    { label: "Dark Circles", key: "dark_circles" },
    { label: "Redness", key: "redness"},
    { label: "Oiliness", key: "oiliness"},
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
  if (routineTitle) {
    routineTitle.innerHTML = isNight 
      ? `🌙 Night Skincare Routine<span class="routine-subtitle">Click a step for product recommendations</span>`
      : `☀️ Morning Skincare Routine<span class="routine-subtitle">Click a step for product recommendations</span>`;
  }
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

if (Array.isArray(result.concerns_detected) && result.concerns_detected.length) {
    const tipsEl = document.getElementById("ai-tips");
    if (tipsEl) {
      tipsEl.innerHTML += `
    <h3 style="margin-top: 1.5rem">Concerns Detected</h3>
    <div class="recommendation-card" onclick="toggleConcerns()" style="cursor: pointer; flex-direction: column; gap: 0.3rem;">
      <div style="display: flex; align-items: center; gap: 1rem;">
        <span class="rec-icon">✨</span>
        <div style="flex: 1;">
          <p style="font-weight: 600; color: var(--accent-purple); margin: 0;">You look amazing bestie, just the way you are!</p>
          <p style="font-size: 0.8rem; color: var(--text-medium); margin: 0.25rem 0 0 0;">Want to see detailed concerns? Click here</p>
        </div>
        <span class="concerns-chevron" id="concerns-chevron" style="font-size: 1.3rem; color: #9B7EBD; transition: transform 0.2s ease;">›</span>
      </div>
    </div>
    <div id="concerns-expanded" style="display:none;">
      ${result.concerns_detected.map((c) => `
        <div class="recommendation-card">
          <div class="rec-icon">🔍</div>
          <div class="rec-content"><p>${c}</p></div>
        </div>`).join("")}
    </div>
  `;
    }
  }

  // Disclaimer
  const disEl = document.getElementById("ai-disclaimer");
  if (disEl && result.disclaimer) disEl.textContent = result.disclaimer;
}

function toggleConcerns() {
  const expanded = document.getElementById("concerns-expanded");
  const chevron = document.getElementById("concerns-chevron");
  const isOpen = expanded.style.display !== "none";
  expanded.style.display = isOpen ? "none" : "block";
  chevron.style.transform = isOpen ? "rotate(0deg)" : "rotate(90deg)";
}

// Cycle day and phase info 
function getCycleDayAndPhase() {
  const lastPeriod = localStorage.getItem('lastPeriod');
  const cycleLength = parseInt(localStorage.getItem('cycleLength')) || 28;

  if (!lastPeriod) return { day: null, phase: 'Unknown Phase', emoji: '🌸' };

  const start = new Date(lastPeriod);
  const today = new Date();
  const diffMs = today - start;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const currentDay = (diffDays % cycleLength) + 1;

  // Determine phase
  let phase, emoji;
  if (currentDay <= 5) {
    phase = 'Menstrual Phase'; emoji = '🔴';
  } else if (currentDay <= 13) {
    phase = 'Follicular Phase'; emoji = '🌱';
  } else if (currentDay <= 16) {
    phase = 'Ovulation Phase'; emoji = '✨';
  } else {
    phase = 'Luteal Phase'; emoji = '🌙';
  }

  return { day: currentDay, phase, emoji };
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

  const result = window.__skinAnalysisResult;
  const m = result?.metrics || {};
  const faceData = result?.face_data;
  const landmarks = faceData?.landmarks || [];
  const bbox = faceData?.bounding_box || {};

  const W = canvas.width;
  const H = canvas.height;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, W, H);

  function scoreColor(score, alpha = 0.5) {
    if (score >= 75) return `rgba(168, 230, 207, ${alpha})`;
    if (score >= 50) return `rgba(255, 220, 150, ${alpha})`;
    return `rgba(255, 160, 160, ${alpha})`;
  }

  // Add padding around the face bbox so we don't crop too tight
  const pad = 0.02;
  const padTop = 0.06; // extra room for forehead/hair

  // Find chinBottom landmark to crop exactly at chin, not neck
  const chinLandmark = landmarks.find(l => l.Type === "chinBottom");
  const chinFrac = chinLandmark ? chinLandmark.Y + 0.02 : (bbox.Top ?? 0.1) + (bbox.Height ?? 0.8) + pad;

  const cropLeft   = Math.max(0, (bbox.Left ?? 0.2) - pad);
  const cropTop    = Math.max(0, (bbox.Top  ?? 0.1) - padTop);
  const cropRight  = Math.min(1, (bbox.Left ?? 0.2) + (bbox.Width ?? 0.6) + pad);
  const cropBottom = Math.min(1, chinFrac);
  const cropW = cropRight  - cropLeft;
  const cropH = cropBottom - cropTop;

  // Convert original image fraction → canvas pixel
  // by mapping the cropped region to fill the canvas
  function fc(fracX, fracY) {
    return {
      x: ((fracX - cropLeft) / cropW) * W,
      y: ((fracY - cropTop)  / cropH) * H,
    };
  }

  // Build landmark lookup in canvas coords
  const lm = {};
  landmarks.forEach(l => {
    lm[l.Type] = fc(l.X, l.Y);
  });

  function drawEverything(img) {
    // ── 1. Draw cropped face region filling the canvas ────────────────
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(W / 2, H / 2.2, W / 2, H / 2.1, 0, 0, Math.PI * 2);
    ctx.clip();

    if (img) {
      const srcX = cropLeft * img.naturalWidth;
      const srcY = cropTop  * img.naturalHeight;
      const srcW = cropW    * img.naturalWidth;
      const srcH = cropH    * img.naturalHeight;
      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, W, H);

      // Subtle dark overlay so zone colours pop
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
      ctx.fillRect(0, 0, W, H);
    } else {
      ctx.fillStyle = "#f5ebff";
      ctx.fillRect(0, 0, W, H);
    }

    ctx.restore();

    // ── 2. Face outline using jawline landmarks ───────────────────────
    const jawPoints = [
      "upperJawlineLeft", "midJawlineLeft", "chinBottom",
      "midJawlineRight",  "upperJawlineRight",
    ].map(t => lm[t]).filter(Boolean);

    if (jawPoints.length >= 3) {
      ctx.beginPath();
      ctx.moveTo(jawPoints[0].x, jawPoints[0].y);
      jawPoints.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.closePath();
      ctx.strokeStyle = "rgba(255,255,255,0.7)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // ── 3. Face centre & size from bbox remapped to canvas ────────────
    const faceTopLeft     = fc(bbox.Left ?? 0.2,  bbox.Top  ?? 0.1);
    const faceBottomRight = fc((bbox.Left ?? 0.2) + (bbox.Width ?? 0.6),
                               (bbox.Top  ?? 0.1) + (bbox.Height ?? 0.8));
    const fW = faceBottomRight.x - faceTopLeft.x;
    const fH = faceBottomRight.y - faceTopLeft.y;
    const fCX = faceTopLeft.x + fW / 2;
    const fCY = faceTopLeft.y + fH / 2;

    // ── 4. Zones using real landmarks ────────────────────────────────
    const eyeL       = lm["eyeLeft"]        ?? { x: fCX - fW * 0.2, y: fCY - fH * 0.15 };
    const eyeR       = lm["eyeRight"]       ?? { x: fCX + fW * 0.2, y: fCY - fH * 0.15 };
    const nose       = lm["nose"]           ?? { x: fCX,             y: fCY };
    const mouthUp    = lm["mouthUp"]        ?? { x: fCX,             y: fCY + fH * 0.2 };
    const chinBottom = lm["chinBottom"]     ?? { x: fCX,             y: fCY + fH * 0.4 };
    const browL      = lm["leftEyeBrowUp"]  ?? { x: eyeL.x,          y: eyeL.y - fH * 0.08 };
    const browR      = lm["rightEyeBrowUp"] ?? { x: eyeR.x,          y: eyeR.y - fH * 0.08 };
    const jawL       = lm["midJawlineLeft"] ?? { x: faceTopLeft.x + fW * 0.1, y: fCY + fH * 0.2 };
    const jawR       = lm["midJawlineRight"]?? { x: faceTopLeft.x + fW * 0.9, y: fCY + fH * 0.2 };

    const zones = [
      {
        label: "Forehead", key: "radiance",
        cx: (eyeL.x + eyeR.x) / 2,
        cy: browL.y - fH * 0.08,
        rx: fW * 0.25, ry: fH * 0.07,
      },
      {
        label: "Left Eye", key: "dark_circles",
        cx: eyeL.x, cy: eyeL.y,
        rx: fW * 0.12, ry: fH * 0.05,
      },
      {
        label: "Right Eye", key: "dark_circles",
        cx: eyeR.x, cy: eyeR.y,
        rx: fW * 0.12, ry: fH * 0.05,
      },
      {
        label: "Nose", key: "pores",
        cx: nose.x, cy: nose.y,
        rx: fW * 0.09, ry: fH * 0.08,
      },
      {
        label: "Left Cheek", key: "oiliness",
        cx: jawL.x + fW * 0.08, cy: (eyeL.y + mouthUp.y) / 2,
        rx: fW * 0.12, ry: fH * 0.09,
      },
      {
        label: "Right Cheek", key: "redness",
        cx: jawR.x - fW * 0.08, cy: (eyeR.y + mouthUp.y) / 2,
        rx: fW * 0.12, ry: fH * 0.09,
      },
      {
        label: "Lips", key: "moisture",
        cx: mouthUp.x,
        cy: mouthUp.y + fH * 0.03,
        rx: fW * 0.15, ry: fH * 0.05,
      },
      {
        label: "Chin", key: "texture",
        cx: chinBottom.x,
        cy: chinBottom.y - fH * 0.03,
        rx: fW * 0.12, ry: fH * 0.05,
      },
    ];

    // ── 5. Draw zones ─────────────────────────────────────────────────
    zones.forEach(zone => {
      const score = m[zone.key] ?? 70;

      ctx.beginPath();
      ctx.ellipse(zone.cx, zone.cy, zone.rx, zone.ry, 0, 0, Math.PI * 2);
      ctx.fillStyle = scoreColor(score, 0.4);
      ctx.fill();
      ctx.strokeStyle = scoreColor(score, 1);
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.9)";
      ctx.shadowBlur = 4;
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 10px Outfit, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(zone.label, zone.cx, zone.cy - zone.ry - 4);

      const pillW = 26, pillH = 14;
      ctx.shadowBlur = 0;
      ctx.fillStyle = scoreColor(score, 0.95);
      ctx.beginPath();
      ctx.roundRect(zone.cx - pillW / 2, zone.cy + zone.ry + 2, pillW, pillH, 7);
      ctx.fill();
      ctx.fillStyle = "#2D2250";
      ctx.font = "bold 9px Outfit, sans-serif";
      ctx.fillText(score, zone.cx, zone.cy + zone.ry + 12);
      ctx.restore();
    });

    // ── 6. Legend ─────────────────────────────────────────────────────
    const legend = [
      { label: "Good (75+)",   color: "rgba(168,230,207,0.9)" },
      { label: "Fair (50–74)", color: "rgba(255,220,150,0.9)" },
      { label: "Needs care",   color: "rgba(255,160,160,0.9)" },
    ];
    legend.forEach((item, i) => {
      const lx = 8, ly = H - 54 + i * 18;
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.beginPath();
      ctx.roundRect(lx - 2, ly, 88, 15, 3);
      ctx.fill();
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.roundRect(lx + 1, ly + 2, 10, 10, 2);
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "9px Outfit, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(item.label, lx + 14, ly + 11);
    });
  }

  if (capturedImageData) {
    const img = new Image();
    img.onload = () => drawEverything(img);
    img.src = capturedImageData;
  } else {
    drawEverything(null);
  }
}

// Set canvas size on load
window.addEventListener("load", () => {
  const canvas = document.getElementById("skinRadar");
  if (canvas) {
    canvas.width = 380;
    canvas.height = 520;
  }
});

// ===== SCAN HISTORY FUNCTIONALITY =====

/**
 * Load scan history from localStorage
 * In production, this would fetch from backend API
 */
async function loadScanHistory() {
    const userName = localStorage.getItem('userName');
    if (!userName) return;

    const apiConfig = typeof API_CONFIG !== "undefined" ? API_CONFIG : window.API_CONFIG;

    try {
        const resp = await fetch(`${apiConfig.BASE_URL}/skin/history?user=${encodeURIComponent(userName)}`);
        if (!resp.ok) throw new Error("Failed to fetch history");
        const data = await resp.json();

        const scans = (data.analyses || []).map(entry => ({
            date: entry.created_at,
            overallScore: entry.overall_skin_health || 0,
            cycleDay: entry.cycle_day || entry.cycleDay || 0,
            cyclePhase: entry.cycle_phase || entry.cyclePhase || 'follicular',
            metrics: {
                radiance: entry.metrics?.radiance || 0,
                texture: entry.metrics?.texture || 0,
                hydration: entry.metrics?.moisture || entry.metrics?.hydration || 0,
                moisture: entry.metrics?.moisture || entry.metrics?.hydration || 0,
                spots: entry.metrics?.pores || entry.metrics?.spots || 0,
                pores: entry.metrics?.pores || entry.metrics?.spots || 0,
                darkCircles: entry.metrics?.dark_circles || entry.metrics?.darkCircles || 0,
                dark_circles: entry.metrics?.dark_circles || entry.metrics?.darkCircles || 0,
                redness: entry.metrics?.redness || 0,
                oiliness: entry.metrics?.oiliness || 0
            },
            summary: entry.summary || '',
            am_routine: entry.am_routine || [],
            pm_routine: entry.pm_routine || [],
            tips: entry.tips || [],
            concerns_detected: entry.concerns_detected || [],
            disclaimer: entry.disclaimer || 'This analysis is for informational purposes only.',
            s3ImageKey: entry.s3_image_key || entry.s3ImageKey || null,
            face_data: entry.face_data || null
        }));

        const scanCountEl = document.getElementById('scan-count');
        if (scanCountEl) {
            scanCountEl.textContent = `${scans.length} ${scans.length === 1 ? 'scan' : 'scans'}`;
        }

        displayScanHistory(scans);
        window.__scanHistory = scans;

    } catch (err) {
        console.error("Failed to load scan history:", err);
    }
}

/**
 * Display scan history cards
 */
function displayScanHistory(scans) {
    const historyList = document.getElementById('history-list');
    const emptyHistory = document.getElementById('empty-history');

    if (!historyList) return;

    if (scans.length === 0) {
        // Show empty state
        if (emptyHistory) {
            emptyHistory.style.display = 'block';
        }
        return;
    }

    // Hide empty state
    if (emptyHistory) {
        emptyHistory.style.display = 'none';
    }

    // Sort scans by date (newest first)
    scans.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Create history cards
    scans.forEach((scan, index) => {
        const card = createHistoryCard(scan, index);
        historyList.appendChild(card);
    });
}
/**
 * Create a history card element
 */
function createHistoryCard(scan, index) {
    const card = document.createElement('div');
    card.className = 'history-card';
    card.onclick = () => viewScanReport(index);

    // Determine score class
    const scoreClass = scan.overallScore >= 80 ? 'score-high' : 
                       scan.overallScore >= 60 ? 'score-medium' : 'score-low';

    // Format date
    const scanDate = new Date(scan.date);
    const dateStr = scanDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
 // Get cycle phase emoji
    const phaseEmoji = {
        'menstrual': '🌙',
        'follicular': '🌸',
        'ovulation': '✨',
        'luteal': '🌺'
    }[scan.cyclePhase] || '🌸';

    card.innerHTML = `
        <div class="history-score ${scoreClass}">
            <div class="history-score-number">${scan.overallScore}</div>
        </div>
        
        <div class="history-info">
            <div class="history-date">${dateStr}</div>
            <div class="history-cycle">
                <span>${phaseEmoji}</span>
                <span>Day ${scan.cycleDay} • ${scan.cyclePhase.charAt(0).toUpperCase() + scan.cyclePhase.slice(1)}</span>
            </div>
            <div class="history-metrics">
                <div class="history-metric">
                    <div class="history-metric-label">Radiance</div>
                    <div class="history-metric-value">${scan.metrics.radiance}</div>
                </div>
                <div class="history-metric">
                    <div class="history-metric-label">Texture</div>
                    <div class="history-metric-value">${scan.metrics.texture}</div>
                </div>
                <div class="history-metric">
                    <div class="history-metric-label">Hydration</div>
                    <div class="history-metric-value">${scan.metrics.hydration}</div>
                </div>
            </div>
        </div>
        
        <button class="history-view-btn" onclick="event.stopPropagation(); viewScanReport(${index})">
            View Report →
        </button>
    `;

    return card;
}

/**
 * View a specific scan report
 */
function viewScanReport(scanIndex) {
    const userName = localStorage.getItem('userName');
    if (!userName) return;

    // Get scans from window.__scanHistory
    const scans = window.__scanHistory || [];
    
    if (!scans || scans.length === 0 || scanIndex >= scans.length) {
        console.error('No scan data available or invalid index');
        return;
    }

    const scan = scans[scanIndex];
    loadScanIntoResultsView(scan);

    // Hide main content
    const methodSelection = document.querySelector('.method-selection-single');
    const scanHistory = document.querySelector('.scan-history-section');
    const pageHeader = document.querySelector('.page-header');
    const backNav = document.querySelector('.back-navigation');
    
    if (methodSelection) methodSelection.style.display = 'none';
    if (scanHistory) scanHistory.style.display = 'none';
    if (pageHeader) pageHeader.style.display = 'none';
    if (backNav) backNav.style.display = 'none';

    // Show results
    document.getElementById('results-view').style.display = 'block';
}

/**
 * Load scan data into the results view
 */
async function loadScanIntoResultsView(scan) {
    // Simulate the result structure that renderSkinAnalysisResult expects
    window.__skinAnalysisResult = {
        overall_skin_health: scan.overallScore,
        summary: scan.summary || 'Your skin analysis results',
        metrics: {
            radiance: scan.metrics?.radiance || 0,
            moisture: scan.metrics?.hydration || scan.metrics?.moisture || 0,
            texture: scan.metrics?.texture || 0,
            pores: scan.metrics?.spots || scan.metrics?.pores || 0,
            dark_circles: scan.metrics?.darkCircles || scan.metrics?.dark_circles || 0,
            redness: scan.metrics?.redness || 0,
            oiliness: scan.metrics?.oiliness || 0
        },
        am_routine: scan.am_routine || [],
        pm_routine: scan.pm_routine || [],
        tips: scan.tips || [],
        concerns_detected: scan.concerns_detected || [],
        disclaimer: scan.disclaimer || 'This analysis is for informational purposes only.',
        face_data: scan.face_data || null
    };
    
    // CRITICAL: Load image from S3 if available
    if (scan.s3ImageKey) {
        try {
            const apiConfig = typeof API_CONFIG !== "undefined" ? API_CONFIG : window.API_CONFIG;
            // Construct S3 URL - using the correct bucket name from infrastructure
            const s3Url = `https://glowcycle-assets.s3.amazonaws.com/${scan.s3ImageKey}`;
            
            console.log('Loading image from S3:', s3Url);
            
            // Load image and convert to data URL
            const response = await fetch(s3Url);
            if (!response.ok) {
                throw new Error(`Failed to fetch image: ${response.status}`);
            }
            const blob = await response.blob();
            const reader = new FileReader();
            reader.onloadend = () => {
                capturedImageData = reader.result;
                console.log('Image loaded successfully from S3');
                // Redraw radar chart with the loaded image
                if (typeof drawRadarChart === 'function') {
                    drawRadarChart();
                }
            };
            reader.readAsDataURL(blob);
        } catch (error) {
            console.error('Error loading image from S3:', error);
            capturedImageData = null;
        }
    } else {
        console.log('No s3ImageKey found for this scan');
        capturedImageData = null;
    }

    // Update report date with cycle info
    const reportDateEl = document.querySelector('.report-date');
    if (reportDateEl) {
        const phaseEmoji = {
            'menstrual': '🌙',
            'follicular': '🌸',
            'ovulation': '✨',
            'luteal': '🌺'
        }[scan.cyclePhase] || '🌸';

        if (scan.cycleDay) {
            reportDateEl.textContent = `Day ${scan.cycleDay} • ${scan.cyclePhase.charAt(0).toUpperCase() + scan.cyclePhase.slice(1)} Phase ${phaseEmoji}`;
        } else {
            reportDateEl.textContent = `${scan.cyclePhase.charAt(0).toUpperCase() + scan.cyclePhase.slice(1)} Phase ${phaseEmoji}`;
        }
    }

    // Use the same rendering function as fresh scans
    renderSkinAnalysisResult();
    
    // Draw radar chart (will use capturedImageData if loaded)
    if (typeof drawRadarChart === 'function') {
        drawRadarChart();
    }
}

/**
 * Save a new scan to history
 */
function saveScanToHistory(scanData) {
    const userName = localStorage.getItem('userName');
    if (!userName) {
        console.error('No user logged in');
        return;
    }

    // Get existing scans
    const scansKey = `skinScans_${userName}`;
    const scans = JSON.parse(localStorage.getItem(scansKey) || '[]');

    // Add new scan
    scans.push(scanData);

    // Save back to localStorage
    localStorage.setItem(scansKey, JSON.stringify(scans));

    console.log('Scan saved to history');

    // Reload history display
    const historyList = document.getElementById('history-list');
    if (historyList) {
        historyList.innerHTML = '<div class="empty-history" id="empty-history" style="display: none;"><div class="empty-icon">📊</div><p>No scans yet</p><p class="empty-subtitle">Start your first skin analysis to track your progress</p></div>';
        loadScanHistory();
    }
}

document.addEventListener("DOMContentLoaded", () => {
  applyTheme();
  loadUserProfile();
  loadScanHistory(); // add this if not already there

  // Enable accept button when consent checkbox is ticked
  const consentCheck = document.getElementById("consent-check");
  const acceptBtn = document.getElementById("accept-btn");
  if (consentCheck && acceptBtn) {
    consentCheck.addEventListener("change", () => {
      acceptBtn.disabled = !consentCheck.checked;
    });
  }
});