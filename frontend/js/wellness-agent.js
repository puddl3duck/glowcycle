// AI Wellness Agent - ALWAYS FRESH from Bedrock
// NO CACHE - Always fetches new message from AI

// Get API base URL from config or use default
const getWellnessEndpoint = () => {
    const baseUrl = (typeof API_CONFIG !== 'undefined' && API_CONFIG?.BASE_URL) 
        ? API_CONFIG.BASE_URL 
        : 'https://7ofiibs7k7.execute-api.ap-southeast-2.amazonaws.com/prod';
    return `${baseUrl}/wellness`;
};

const WELLNESS_ENDPOINT = getWellnessEndpoint();

let currentWellnessData = null;

/**
 * Fetch AI-generated wellness message from backend
 * ALWAYS FRESH - No caching, always calls Bedrock
 */
async function fetchWellnessMessage(userName) {
    try {
        console.log(`Fetching FRESH wellness message from Bedrock for: ${userName}`);
        
        // CRITICAL: Always get display name from window.userSession
        const displayName = window.userSession?.userDisplayName || userName;
        
        console.log(`Using displayName: ${displayName} for wellness message`);
        
        const response = await fetch(`${WELLNESS_ENDPOINT}?user=${encodeURIComponent(userName)}&name=${encodeURIComponent(displayName)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Backend error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Fresh wellness message received from Bedrock:', data);
        
        currentWellnessData = data.wellness;
        return data.wellness;
        
    } catch (error) {
        console.error('Error fetching wellness message:', error);
        return null;
    }
}

/**
 * Display wellness message in a beautiful card
 */
function displayWellnessMessage(wellness, containerId = 'wellness-message-container') {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container ${containerId} not found`);
        return;
    }
    
    if (!wellness) {
        container.innerHTML = `
            <div class="wellness-message-card loading">
                <div class="loading-icon">...</div>
                <p class="loading-text">Generating your personalized message...</p>
            </div>
        `;
        return;
    }
    
    // Get message from either new structure (message) or old structure (support_message)
    const message = wellness.message || wellness.support_message || 'Generating your message...';
    
    container.innerHTML = `
        <div class="wellness-message-card">
            <div class="message-content centered">
                <p class="motivational-message">
                    "${message}"
                </p>
            </div>
        </div>
    `;
    
    // Add fade-in animation
    container.querySelector('.wellness-message-card').classList.add('fade-in');
}

/**
 * Refresh wellness message - ALWAYS calls Bedrock
 */
async function refreshWellnessMessage() {
    // CRITICAL: Get userName (normalized) for API call from window.userSession
    const userName = window.userSession?.userName;
    const userDisplayName = window.userSession?.userDisplayName;
    
    console.log('🔍 DEBUG refreshWellnessMessage:');
    console.log('  - userName:', userName);
    console.log('  - userDisplayName:', userDisplayName);
    
    if (!userName) {
        console.error('❌ No userName found');
        return;
    }
    
    console.log('🔄 Refreshing wellness message from Bedrock...');
    
    // Show loading state
    displayWellnessMessage(null);
    
    // Fetch new message from Bedrock
    const wellness = await fetchWellnessMessage(userName);
    
    if (wellness) {
        displayWellnessMessage(wellness);
    } else {
        const container = document.getElementById('wellness-message-container');
        if (container) {
            container.innerHTML = `
                <div class="wellness-message-card error">
                    <div class="error-icon">:(</div>
                    <p class="error-text">Unable to load your message. Please try again.</p>
                    <button class="retry-btn" onclick="refreshWellnessMessage()">Try Again</button>
                </div>
            `;
        }
    }
}

// Track last fetch to prevent duplicate calls
let lastWellnessFetch = 0;
const WELLNESS_FETCH_COOLDOWN = 2000; // 2 seconds cooldown

/**
 * Initialize wellness message on page load
 * ALWAYS FRESH - No cache
 */
async function initializeWellnessMessage(containerId = 'wellness-message-container') {
    // Prevent duplicate calls within cooldown period
    const now = Date.now();
    if (now - lastWellnessFetch < WELLNESS_FETCH_COOLDOWN) {
        console.log('⏸️ Skipping wellness fetch - too soon since last call');
        return;
    }
    lastWellnessFetch = now;
    
    // CRITICAL: Get userName (normalized) for API call
    const userName = window.userSession?.userName;
    const userDisplayName = window.userSession?.userDisplayName;
    
    console.log('🔍 DEBUG initializeWellnessMessage:');
    console.log('  - userName:', userName);
    console.log('  - userDisplayName:', userDisplayName);
    
    if (!userName) {
        console.log('❌ No userName found, skipping wellness message');
        return;
    }
    
    console.log('✅ Initializing wellness message - ALWAYS FRESH from Bedrock');
    console.log(`   Using userName: ${userName}, displayName: ${userDisplayName}`);
    
    // Show loading state
    displayWellnessMessage(null, containerId);
    
    // Fetch fresh message from Bedrock (userName is used for API, displayName is passed in URL)
    const wellness = await fetchWellnessMessage(userName);
    displayWellnessMessage(wellness, containerId);
}

/**
 * Mark functions - ACTIVELY refresh wellness message when data changes
 */
function markJournalUpdated() {
    console.log('✅ Journal updated - refreshing wellness message NOW');
    // Refresh immediately if on dashboard
    const container = document.getElementById('wellness-message-container');
    if (container) {
        refreshWellnessMessage();
    }
}

function markSkinScanUpdated() {
    console.log('✅ Skin scan updated - refreshing wellness message NOW');
    // Refresh immediately if on dashboard
    const container = document.getElementById('wellness-message-container');
    if (container) {
        refreshWellnessMessage();
    }
}

function markCycleUpdated() {
    console.log('✅ Cycle updated - refreshing wellness message NOW');
    // Refresh immediately if on dashboard
    const container = document.getElementById('wellness-message-container');
    if (container) {
        refreshWellnessMessage();
    }
}

// NOTE: Auto-initialization removed to prevent race conditions
// initializeWellnessMessage() should be called manually after user data is saved
