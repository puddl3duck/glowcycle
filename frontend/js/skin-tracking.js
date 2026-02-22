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
  document.getElementById("consent-popup").style.display = "flex";
}

// Close Consent Popup
function closeConsentPopup() {
  document.getElementById("consent-popup").style.display = "none";
  document.getElementById("consent-check").checked = false;
  document.getElementById("accept-btn").disabled = true;
}

// Accept Consent and Show Scanner
function acceptConsent() {
  closeConsentPopup();
  showScanner();
}

// Enable/disable accept button based on checkbox
document.addEventListener("DOMContentLoaded", () => {
  applyTheme(); // Apply theme on load

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
let currentFacingMode = "user"; // 'user' for front camera, 'environment' for back camera
let capturedImageData = null;
let faceDetectionInterval = null;
let faceDetector = null;

// Initialize Face Detector
async function initFaceDetector() {
  try {
    // Check if Face Detection API is available
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

    // Wait for video to be ready
    video.onloadedmetadata = () => {
      video.play();
      // Start face detection after a short delay
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

  // Always use the fallback method as it's more reliable
  faceDetectionInterval = setInterval(() => {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      detectFaceInVideo(video, guideOval);
    }
  }, 300); // Check every 300ms for better responsiveness
}

// Enhanced face detection using image analysis
function detectFaceInVideo(video, guideOval) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // Use smaller canvas for faster processing
  canvas.width = 320;
  canvas.height = 240;

  // Draw current video frame
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Define oval region (center of frame, matching the visual oval)
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const ovalWidth = canvas.width * 0.35; // 35% of width
  const ovalHeight = ovalWidth * 1.33; // 3:4 aspect ratio
  const radiusX = ovalWidth / 2;
  const radiusY = ovalHeight / 2;

  // Divide oval into regions for better face detection
  const topRegion = { y: centerY - radiusY, height: radiusY * 0.4 }; // Top 40% (forehead/hair)
  const middleRegion = { y: centerY - radiusY * 0.2, height: radiusY * 0.6 }; // Middle 60% (eyes, nose)
  const bottomRegion = { y: centerY + radiusY * 0.4, height: radiusY * 0.6 }; // Bottom 60% (mouth, chin)

  let topSkinPixels = 0,
    topTotalPixels = 0;
  let middleSkinPixels = 0,
    middleTotalPixels = 0;
  let bottomSkinPixels = 0,
    bottomTotalPixels = 0;
  let topBrightness = 0,
    middleBrightness = 0,
    bottomBrightness = 0;
  let edgeCount = 0;
  let symmetryScore = 0;

  // Scan the oval region
  for (
    let y = Math.floor(centerY - radiusY);
    y < Math.floor(centerY + radiusY);
    y++
  ) {
    for (
      let x = Math.floor(centerX - radiusX);
      x < Math.floor(centerX + radiusX);
      x++
    ) {
      if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
        // Check if point is inside oval
        const normalizedX = (x - centerX) / radiusX;
        const normalizedY = (y - centerY) / radiusY;
        const isInsideOval =
          normalizedX * normalizedX + normalizedY * normalizedY <= 1;

        if (isInsideOval) {
          const i = (y * canvas.width + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          const brightness = (r + g + b) / 3;

          // Detect skin tones (improved algorithm)
          const isSkinTone =
            (r > 60 &&
              g > 40 &&
              b > 20 && // Minimum values
              r > b &&
              r > g - 20 && // Red dominant
              Math.abs(r - g) < 50 && // R and G similar
              r - b > 10 &&
              r - b < 80) || // R greater than B but not too much
            // Darker skin tones
            (r > 40 && g > 30 && b > 20 && r >= g && r >= b && r - b < 60);

          // Classify by region
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

          // Edge detection (facial features)
          if (x < canvas.width - 1 && y < canvas.height - 1) {
            const nextI = (y * canvas.width + (x + 1)) * 4;
            const diff = Math.abs(r - data[nextI]);
            if (diff > 35) edgeCount++;
          }

          // Symmetry check (compare left and right sides)
          if (x < centerX) {
            const mirrorX = Math.floor(centerX + (centerX - x));
            if (mirrorX < canvas.width) {
              const mirrorI = (y * canvas.width + mirrorX) * 4;
              const mirrorR = data[mirrorI];
              const colorDiff = Math.abs(r - mirrorR);
              if (colorDiff < 40) symmetryScore++;
            }
          }
        }
      }
    }
  }

  // Calculate ratios and averages
  const topSkinRatio = topTotalPixels > 0 ? topSkinPixels / topTotalPixels : 0;
  const middleSkinRatio =
    middleTotalPixels > 0 ? middleSkinPixels / middleTotalPixels : 0;
  const bottomSkinRatio =
    bottomTotalPixels > 0 ? bottomSkinPixels / bottomTotalPixels : 0;

  topBrightness = topTotalPixels > 0 ? topBrightness / topTotalPixels : 0;
  middleBrightness =
    middleTotalPixels > 0 ? middleBrightness / middleTotalPixels : 0;
  bottomBrightness =
    bottomTotalPixels > 0 ? bottomBrightness / bottomTotalPixels : 0;

  const avgBrightness =
    (topBrightness + middleBrightness + bottomBrightness) / 3;
  const totalPixels = topTotalPixels + middleTotalPixels + bottomTotalPixels;
  const symmetryRatio = totalPixels > 0 ? symmetryScore / (totalPixels / 2) : 0;

  // STRICT face detection criteria
  const faceDetected =
    // Good lighting
    avgBrightness > 50 &&
    avgBrightness < 210 &&
    // All three regions must have skin tone (complete face)
    topSkinRatio > 0.2 && // Top region (forehead/hair area)
    middleSkinRatio > 0.3 && // Middle region (eyes, nose) - highest requirement
    bottomSkinRatio > 0.25 && // Bottom region (mouth, chin)
    // Sufficient facial features detected
    edgeCount > 80 &&
    // Face should be relatively symmetrical
    symmetryRatio > 0.4 &&
    // Brightness should be consistent across regions (not just showing part of face)
    Math.abs(topBrightness - middleBrightness) < 60 &&
    Math.abs(middleBrightness - bottomBrightness) < 60;

  if (faceDetected) {
    guideOval.classList.add("face-detected");
    updateCameraStatus("Ready to capture", "✓", "success");

    // Enable capture button
    const captureBtn = document.getElementById("capture-btn");
    if (captureBtn) {
      captureBtn.disabled = false;
    }
  } else {
    guideOval.classList.remove("face-detected");

    // Disable capture button
    const captureBtn = document.getElementById("capture-btn");
    if (captureBtn) {
      captureBtn.disabled = true;
    }

    // Provide specific feedback
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

// Fallback: Simple motion/brightness detection (removed, using enhanced detection above)
let lastImageData = null;
function detectMotion(video) {
  // This function is no longer used, kept for compatibility
}

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
  if (video) {
    video.srcObject = null;
  }

  // Remove face detected class
  const guideOval = document.querySelector(".face-guide-oval");
  if (guideOval) {
    guideOval.classList.remove("face-detected");
  }
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

// Capture Photo
function capturePhoto() {
  // Stop face detection
  stopFaceDetection();

  const video = document.getElementById("camera-video");
  const canvas = document.getElementById("camera-canvas");
  const ctx = canvas.getContext("2d");

  // Set canvas size to match video
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  // Draw video frame to canvas
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Store captured image
  capturedImageData = canvas.toDataURL("image/jpeg", 0.9);

  // Send image to backend S3
  sendCapturedImageToBackend(capturedImageData);

  // Show captured image
  canvas.style.display = "block";
  video.style.display = "none";

  // Hide camera overlay and status
  document.querySelector(".camera-overlay").style.display = "none";
  document.getElementById("camera-status").style.display = "none";

  // Update UI
  document.getElementById("capture-btn").style.display = "none";
  document.getElementById("retake-btn").style.display = "flex";

  // Start AI analysis animation
  startAIAnalysis();
}

// Send captured image to backend S3
async function sendCapturedImageToBackend(dataUrl) {
  try {
    const apiConfig =
      typeof API_CONFIG !== "undefined" ? API_CONFIG : window.API_CONFIG;

    // 1) Convert dataURL -> Blob
    const blob = dataURLtoBlob(dataUrl);
    const contentType = blob.type || "image/jpeg";

    // 2) Ask backend for presigned URL
    updateCameraStatus("Preparing secure upload...", "🔐", "info");
    const presignResp = await fetch(
      apiConfig.BASE_URL + apiConfig.ENDPOINTS.SKIN_UPLOAD_URL,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType }),
      },
    );

    if (!presignResp.ok) throw new Error("Failed to get upload URL");
    const { uploadUrl, s3Key } = await presignResp.json();

    // 3) Upload directly to S3
    updateCameraStatus("Uploading photo...", "⬆️", "info");
    const putResp = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body: blob,
    });

    if (!putResp.ok) throw new Error("Failed to upload to S3");

    // 4) Ask backend to analyze (Rekognition + Bedrock)
    updateCameraStatus("Analyzing with AI...", "✨", "info");
    const analyzeResp = await fetch(
      apiConfig.BASE_URL + apiConfig.ENDPOINTS.SKIN_ANALYZE,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          s3Key,
          timeOfDay: detectTimeMode(),
          cyclePhase: "unknown",
          skinGoals: ["hydration", "texture"],
        }),
      },
    );

    if (!analyzeResp.ok) {
      const err = await analyzeResp.text();
      throw new Error(err || "Analyze failed");
    }

    const analysis = await analyzeResp.json();
    window.__skinAnalysisResult = analysis;

    completeAnalysis(); // show results when real analysis is done
  } catch (err) {
    console.error(err);
    updateCameraStatus("Something went wrong. Please try again.", "⚠️", "error");
  }
}

// Start AI Analysis Animation
function startAIAnalysis() {
  const overlay = document.getElementById("ai-analysis-overlay");
  const progressBar = document.getElementById("analysis-progress");

  overlay.style.display = "flex";

  // Animate progress bar
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += 1;
    progressBar.style.width = progress + "%";

    if (progress >= 100) {
      clearInterval(progressInterval);
    }
  }, 40); // 4 seconds total

  // Animate steps
  const steps = ["step-1", "step-2", "step-3", "step-4"];
  steps.forEach((stepId, index) => {
    setTimeout(() => {
      const step = document.getElementById(stepId);
      step.classList.add("active");

      // Add completion checkmark after a moment
      setTimeout(() => {
        step.classList.add("completed");
        const icon = step.querySelector(".step-icon");
        icon.textContent = "✓";
      }, 800);
    }, index * 1000);
  });
}

// Complete Analysis
function completeAnalysis() {
  const overlay = document.getElementById("ai-analysis-overlay");
  const title = document.getElementById("analysis-title");

  title.textContent = "Analysis Complete! ✨";

  setTimeout(() => {
    overlay.style.display = "none";
    stopCamera();
    showResults();

    // Reset for next use
    resetAnalysisOverlay();
  }, 1000);
}

// Reset Analysis Overlay
function resetAnalysisOverlay() {
  const progressBar = document.getElementById("analysis-progress");
  progressBar.style.width = "0%";

  const steps = ["step-1", "step-2", "step-3", "step-4"];
  const icons = ["🔍", "✨", "💎", "🎯"];

  steps.forEach((stepId, index) => {
    const step = document.getElementById(stepId);
    step.classList.remove("active", "completed");
    const icon = step.querySelector(".step-icon");
    icon.textContent = icons[index];
  });

  document.getElementById("analysis-title").textContent = "Analyzing Your Skin";
}

// Retake Photo
function retakePhoto() {
  const video = document.getElementById("camera-video");
  const canvas = document.getElementById("camera-canvas");

  canvas.style.display = "none";
  video.style.display = "block";

  // Show camera overlay and status
  document.querySelector(".camera-overlay").style.display = "flex";
  document.getElementById("camera-status").style.display = "flex";

  document.getElementById("capture-btn").style.display = "flex";
  document.getElementById("retake-btn").style.display = "none";

  capturedImageData = null;

  // Restart face detection
  setTimeout(() => {
    startFaceDetection();
  }, 300);
}

// Show Results View
function showResults() {
  document.getElementById("scanner-view").style.display = "none";
  document.getElementById("results-view").style.display = "block";
  renderSkinAnalysisResult();
  // Draw radar chart
  drawRadarChart();
}
function renderSkinAnalysisResult() {
  const result = window.__skinAnalysisResult;
  if (!result) return;

  // Summary
  const msgEl = document.querySelector(".score-message");
  if (msgEl && result.summary) msgEl.textContent = result.summary;

  // Calculate overall score from metrics
  const m = result.metrics || {};
  const metricValues = Object.values(m).filter(v => typeof v === "number");
  const avgScore = metricValues.length
    ? Math.round(metricValues.reduce((a, b) => a + b, 0) / metricValues.length)
    : 75;

  // Update score number
  const scoreEl = document.querySelector(".score-number");
  if (scoreEl) scoreEl.textContent = avgScore;

  // Update score circle
  const scoreCircle = document.querySelector(".score-circle circle:nth-child(2)");
  if (scoreCircle) {
    const offset = 314 - (314 * avgScore) / 100;
    scoreCircle.setAttribute("stroke-dashoffset", offset);
  }

  // Update metric cards
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
  if (routineTitle) routineTitle.textContent = isNight ? "🌙 PM Routine" : "☀️ AM Routine";
  if (routineSteps && Array.isArray(steps)) {
    routineSteps.innerHTML = steps.map(s => `<div class="routine-step">✓ ${s}</div>`).join("");
  }

  // Remove static hardcoded recommendation cards
  document.querySelectorAll(".recommendations .recommendation-card").forEach(el => el.remove());

  // Tips
  const tipsEl = document.getElementById("ai-tips");
  if (tipsEl && Array.isArray(result.tips)) {
    tipsEl.innerHTML = `
      <h3 style="margin-top: 1.5rem">Tips for You</h3>
      ${result.tips.map(t => `
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
        ${result.concerns_detected.map(c => `
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
  const pad = 0.04;
  const cropLeft   = Math.max(0, (bbox.Left   ?? 0.2) - pad);
  const cropTop    = Math.max(0, (bbox.Top    ?? 0.1) - pad);
  const cropRight  = Math.min(1, (bbox.Left   ?? 0.2) + (bbox.Width  ?? 0.6) + pad);
  const cropBottom = Math.min(1, (bbox.Top    ?? 0.1) + (bbox.Height ?? 0.8) + pad);
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
    ctx.ellipse(W / 2, H / 2, W / 2, H / 2, 0, 0, Math.PI * 2);
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
    canvas.width = 300;
    canvas.height = 360;
  }
});
