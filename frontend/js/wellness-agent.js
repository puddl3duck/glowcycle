// AI Wellness Agent - Frontend Integration

const WELLNESS_ENDPOINT = `${API_CONFIG?.BASE_URL || 'https://7ofiibs7k7.execute-api.ap-southeast-2.amazonaws.com/prod'}/wellness`;

let currentWellnessData = null;

/**
 * Fetch AI-generated wellness support from backend
 */
async function fetchWellnessSupport(userName) {
    try {
        console.log(`Fetching wellness support for: ${userName}`);
        
        const response = await fetch(`${WELLNESS_ENDPOINT}?user=${encodeURIComponent(userName)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Wellness support received:', data);
        
        currentWellnessData = data.wellness;
        return data.wellness;
        
    } catch (error) {
        console.error('Error fetching wellness support:', error);
        return null;
    }
}

/**
 * Display wellness support in a beautiful card
 */
function displayWellnessSupport(wellness, containerId = 'wellness-container') {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container ${containerId} not found`);
        return;
    }
    
    if (!wellness) {
        container.innerHTML = `
            <div class="wellness-card loading">
                <div class="wellness-icon">✨</div>
                <p>Loading your personalized wellness support...</p>
            </div>
        `;
        return;
    }
    
    const phaseEmojis = {
        'menstrual': '🌸',
        'follicular': '🌱',
        'ovulation': '✨',
        'luteal': '🌙'
    };
    
    const cyclePhase = wellness.user_context?.cycle_phase || 'unknown';
    const phaseEmoji = phaseEmojis[cyclePhase] || '💜';
    
    container.innerHTML = `
        <div class="wellness-card ai-generated">
            <div class="wellness-header">
                <div class="wellness-badge">
                    <span class="ai-icon">🤖</span>
                    <span class="ai-label">AI Wellness Agent</span>
                </div>
                <div class="cycle-indicator">
                    <span class="cycle-emoji">${phaseEmoji}</span>
                    <span class="cycle-text">${cyclePhase} phase</span>
                </div>
            </div>
            
            <div class="wellness-content">
                <div class="support-message">
                    <h3>💜 Your Personal Support</h3>
                    <p class="message-text">${wellness.support_message}</p>
                </div>
                
                <div class="wellness-grid">
                    <div class="wellness-item micro-action">
                        <div class="item-icon">⚡</div>
                        <div class="item-content">
                            <h4>Quick Action</h4>
                            <p>${wellness.micro_action}</p>
                        </div>
                    </div>
                    
                    <div class="wellness-item cycle-note">
                        <div class="item-icon">${phaseEmoji}</div>
                        <div class="item-content">
                            <h4>Cycle Insight</h4>
                            <p>${wellness.cycle_note}</p>
                        </div>
                    </div>
                    
                    <div class="wellness-item skin-tip">
                        <div class="item-icon">✨</div>
                        <div class="item-content">
                            <h4>Skin Care Tip</h4>
                            <p>${wellness.skin_tip}</p>
                        </div>
                    </div>
                </div>
                
                <div class="affirmation-box">
                    <div class="affirmation-icon">💫</div>
                    <p class="affirmation-text">"${wellness.affirmation}"</p>
                </div>
                
                ${wellness.reasoning_tags && wellness.reasoning_tags.length > 0 ? `
                <div class="reasoning-tags">
                    ${wellness.reasoning_tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                ` : ''}
            </div>
            
            <div class="wellness-footer">
                <button class="refresh-btn" onclick="refreshWellnessSupport()">
                    <span class="refresh-icon">🔄</span>
                    <span>Refresh Support</span>
                </button>
                <span class="generated-time">Generated just now</span>
            </div>
        </div>
    `;
    
    // Add animation
    container.querySelector('.wellness-card').classList.add('fade-in');
}

/**
 * Refresh wellness support
 */
async function refreshWellnessSupport() {
    const userName = localStorage.getItem('userName');
    if (!userName) {
        console.error('No user name found');
        return;
    }
    
    // Show loading state
    displayWellnessSupport(null);
    
    // Fetch new support
    const wellness = await fetchWellnessSupport(userName);
    
    if (wellness) {
        displayWellnessSupport(wellness);
    } else {
        const container = document.getElementById('wellness-container');
        if (container) {
            container.innerHTML = `
                <div class="wellness-card error">
                    <div class="wellness-icon">😔</div>
                    <p>Unable to load wellness support. Please try again.</p>
                    <button class="retry-btn" onclick="refreshWellnessSupport()">Retry</button>
                </div>
            `;
        }
    }
}

/**
 * Initialize wellness support on page load
 */
async function initializeWellnessSupport(containerId = 'wellness-container') {
    const userName = localStorage.getItem('userName');
    if (!userName) {
        console.log('No user name found, skipping wellness support');
        return;
    }
    
    // Show loading state
    displayWellnessSupport(null, containerId);
    
    // Fetch and display
    const wellness = await fetchWellnessSupport(userName);
    displayWellnessSupport(wellness, containerId);
}

// Auto-initialize if wellness container exists
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('wellness-container');
    if (container) {
        initializeWellnessSupport();
    }
});
