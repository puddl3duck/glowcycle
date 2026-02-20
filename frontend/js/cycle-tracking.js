// Cycle Tracking JavaScript

// API Configuration
const API_BASE_URL = API_CONFIG?.BASE_URL || 'https://YOUR-API-ID.execute-api.YOUR-REGION.amazonaws.com/prod';
const PERIOD_ENDPOINT = API_CONFIG?.ENDPOINTS?.PERIOD || '/period';

// Time-based functionality
let timeMode = 'morning';
let currentCalendarDate = new Date();
let periodHistory = [];
let userCycleLength = 28; // Default, will load from localStorage
let userName = 'User';
let userAge = null;
let isLoadingFromBackend = false;

// Load user data from onboarding
async function loadUserData() {
    userName = localStorage.getItem('userName') || 'User';
    userAge = localStorage.getItem('userAge') || null;
    userCycleLength = parseInt(localStorage.getItem('cycleDays')) || 28;
    
    // Update profile display
    updateUserProfile();
    
    // Try to load from backend first
    const backendLoaded = await loadPeriodsFromBackend();
    
    // If backend failed or no data, use localStorage as fallback
    if (!backendLoaded || periodHistory.length === 0) {
        console.log('Using localStorage fallback for period data');
        loadPeriodHistory(); // Load from localStorage
        
        // If still no data, check for initial period from onboarding
        if (periodHistory.length === 0) {
            const initialPeriod = localStorage.getItem('lastPeriod');
            if (initialPeriod) {
                console.log('Adding initial period from onboarding:', initialPeriod);
                const date = new Date(initialPeriod);
                date.setHours(0, 0, 0, 0);
                periodHistory.push(date);
                savePeriodHistory(); // Save to localStorage
                
                // Try to save to backend (but don't wait)
                savePeriodToBackend(date).catch(err => {
                    console.log('Could not save to backend, using localStorage only');
                });
            }
        }
    }
    
    // Update cycle length from history if we have data
    if (periodHistory.length >= 2) {
        updateCycleLengthFromHistory();
    }
}

// Save period to backend (DynamoDB)
async function savePeriodToBackend(date) {
    try {
        const periodDate = new Date(date);
        periodDate.setHours(0, 0, 0, 0);
        
        // Format date as DD-MM-YYYY
        const day = String(periodDate.getDate()).padStart(2, '0');
        const month = String(periodDate.getMonth() + 1).padStart(2, '0');
        const year = periodDate.getFullYear();
        const formattedDate = `${day}-${month}-${year}`;
        
        const response = await fetch(`${API_BASE_URL}${PERIOD_ENDPOINT}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user: userName,
                period_date: formattedDate,
                user_age: userAge,
                cycle_length: userCycleLength
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Period saved to backend:', data);
        
        // Add to local history
        if (!periodHistory.some(d => d.getTime() === periodDate.getTime())) {
            periodHistory.push(periodDate);
            periodHistory.sort((a, b) => b - a);
            savePeriodHistory(); // Save to localStorage as backup
        }
        
        return true;
    } catch (error) {
        console.error('Error saving period to backend:', error);
        console.log('Saving to localStorage only');
        
        // Fallback: save to localStorage
        const periodDate = new Date(date);
        periodDate.setHours(0, 0, 0, 0);
        
        if (!periodHistory.some(d => d.getTime() === periodDate.getTime())) {
            periodHistory.push(periodDate);
            periodHistory.sort((a, b) => b - a);
            savePeriodHistory();
        }
        
        return true; // Return true even if backend failed, since we saved to localStorage
    }
}

// Load periods from backend (DynamoDB)
async function loadPeriodsFromBackend() {
    if (isLoadingFromBackend) return false;
    isLoadingFromBackend = true;
    
    try {
        const response = await fetch(`${API_BASE_URL}${PERIOD_ENDPOINT}?user=${encodeURIComponent(userName)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Periods loaded from backend:', data);
        
        // Parse periods from backend
        if (data.periods && Array.isArray(data.periods)) {
            periodHistory = data.periods.map(p => {
                // Parse DD-MM-YYYY format
                const [day, month, year] = p.period_date.split('-');
                const date = new Date(year, month - 1, day);
                date.setHours(0, 0, 0, 0);
                return date;
            });
            periodHistory.sort((a, b) => b - a);
            
            // Update cycle length from history
            updateCycleLengthFromHistory();
            
            // Also save to localStorage as backup
            savePeriodHistory();
            
            isLoadingFromBackend = false;
            return true;
        }
        
        isLoadingFromBackend = false;
        return false;
    } catch (error) {
        console.error('Error loading periods from backend:', error);
        console.log('Will use localStorage fallback');
        isLoadingFromBackend = false;
        return false;
    }
}

// Delete period from backend
async function deletePeriodFromBackend(date) {
    try {
        const periodDate = new Date(date);
        
        // Format date as DD-MM-YYYY
        const day = String(periodDate.getDate()).padStart(2, '0');
        const month = String(periodDate.getMonth() + 1).padStart(2, '0');
        const year = periodDate.getFullYear();
        const formattedDate = `${day}-${month}-${year}`;
        
        const response = await fetch(`${API_BASE_URL}${PERIOD_ENDPOINT}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user: userName,
                period_date: formattedDate
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        console.log('Period deleted from backend');
        return true;
    } catch (error) {
        console.error('Error deleting period from backend:', error);
        return false;
    }
}

function updateUserProfile() {
    const profileNameElement = document.getElementById('profile-name');
    const profileAvatarElement = document.getElementById('profile-avatar');
    
    if (profileNameElement) {
        profileNameElement.textContent = userName;
    }
    
    if (profileAvatarElement) {
        profileAvatarElement.textContent = userName.charAt(0).toUpperCase();
    }
}

function detectTimeMode() {
    const hour = new Date().getHours();
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

// Load period history from localStorage
function loadPeriodHistory() {
    const saved = localStorage.getItem('periodHistory');
    if (saved) {
        periodHistory = JSON.parse(saved).map(d => new Date(d));
    }
    periodHistory.sort((a, b) => b - a); // Sort newest first
}

// Save period history to localStorage
function savePeriodHistory() {
    localStorage.setItem('periodHistory', JSON.stringify(periodHistory.map(d => d.toISOString())));
}

// Add a new period date
async function addPeriodDate(date) {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    
    // Check if date already exists
    const exists = periodHistory.some(d => d.getTime() === newDate.getTime());
    if (exists) {
        return false;
    }
    
    // Save to backend
    const success = await savePeriodToBackend(newDate);
    
    if (success) {
        // Recalculate cycle length if we have enough data
        updateCycleLengthFromHistory();
        updateAllUI();
        return true;
    }
    
    return false;
}

// Smart cycle length calculation from history
function updateCycleLengthFromHistory() {
    if (periodHistory.length >= 2) {
        const cycleLengths = [];
        for (let i = 0; i < periodHistory.length - 1; i++) {
            const days = Math.round((periodHistory[i] - periodHistory[i + 1]) / (1000 * 60 * 60 * 24));
            if (days > 0 && days < 60) {
                cycleLengths.push(days);
            }
        }
        
        if (cycleLengths.length > 0) {
            const avgCycle = Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length);
            userCycleLength = avgCycle;
            localStorage.setItem('cycleDays', avgCycle);
        }
    }
}

// Calculate cycle insights
function calculateCycleInsights() {
    if (periodHistory.length === 0) {
        return {
            avgCycle: userCycleLength,
            cycleCount: 0,
            minCycle: userCycleLength,
            maxCycle: userCycleLength,
            confidence: 'low',
            isEstimated: true
        };
    }
    
    if (periodHistory.length === 1) {
        return {
            avgCycle: userCycleLength,
            cycleCount: 1,
            minCycle: userCycleLength,
            maxCycle: userCycleLength,
            confidence: 'low',
            isEstimated: true
        };
    }
    
    // Calculate cycle lengths from actual data
    const cycleLengths = [];
    for (let i = 0; i < periodHistory.length - 1; i++) {
        const days = Math.round((periodHistory[i] - periodHistory[i + 1]) / (1000 * 60 * 60 * 24));
        if (days > 0 && days < 60) {
            cycleLengths.push(days);
        }
    }
    
    if (cycleLengths.length === 0) {
        return {
            avgCycle: userCycleLength,
            cycleCount: periodHistory.length,
            minCycle: userCycleLength,
            maxCycle: userCycleLength,
            confidence: 'low',
            isEstimated: true
        };
    }
    
    const avgCycle = Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length);
    const minCycle = Math.min(...cycleLengths);
    const maxCycle = Math.max(...cycleLengths);
    
    // Determine confidence
    let confidence = 'low';
    if (cycleLengths.length >= 3) {
        const variance = maxCycle - minCycle;
        if (variance <= 3) confidence = 'high';
        else if (variance <= 5) confidence = 'medium';
        else confidence = 'medium';
    } else if (cycleLengths.length === 2) {
        confidence = 'medium';
    }
    
    return {
        avgCycle,
        cycleCount: periodHistory.length,
        minCycle,
        maxCycle,
        confidence,
        isEstimated: false
    };
}

// Update insights UI
function updateInsightsUI() {
    const insights = calculateCycleInsights();
    
    document.getElementById('avg-cycle').textContent = `${insights.avgCycle} days`;
    document.getElementById('cycle-count').textContent = insights.cycleCount;
    
    if (insights.minCycle === insights.maxCycle) {
        document.getElementById('cycle-range').textContent = `${insights.avgCycle} days`;
    } else {
        document.getElementById('cycle-range').textContent = `${insights.minCycle}-${insights.maxCycle} days`;
    }
    
    // Update insight message
    const messageEl = document.getElementById('insight-message');
    if (insights.cycleCount === 0) {
        messageEl.textContent = '💡 Using your estimated cycle length. Log your first period below!';
    } else if (insights.cycleCount === 1) {
        messageEl.textContent = '📊 Log your next period to calculate your actual cycle length';
    } else if (insights.cycleCount === 2) {
        messageEl.textContent = '🎯 Great! We\'re learning your pattern. Keep tracking for better accuracy';
    } else if (insights.confidence === 'high') {
        messageEl.textContent = '🌟 Your cycle is very consistent! Predictions are highly accurate';
    } else {
        messageEl.textContent = '💫 Your cycle varies a bit, but we\'re learning your unique pattern';
    }
}

// Calculate current cycle day and phase
function getCurrentCycleInfo() {
    if (periodHistory.length === 0) {
        return {
            currentDay: 1,
            phase: 'menstrual',
            phaseName: 'Menstrual Phase',
            phaseEmoji: '🌸',
            daysInPhase: '1-5'
        };
    }
    
    const lastPeriod = periodHistory[0];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const daysSinceLastPeriod = Math.floor((today - lastPeriod) / (1000 * 60 * 60 * 24));
    const currentDay = (daysSinceLastPeriod % userCycleLength) + 1;
    
    // Determine phase based on cycle day
    let phase, phaseName, phaseEmoji, daysInPhase;
    
    if (currentDay >= 1 && currentDay <= 5) {
        phase = 'menstrual';
        phaseName = 'Menstrual Phase';
        phaseEmoji = '🌸';
        daysInPhase = '1-5';
    } else if (currentDay >= 6 && currentDay <= Math.floor(userCycleLength * 0.43)) {
        phase = 'follicular';
        phaseName = 'Follicular Phase';
        phaseEmoji = '🌱';
        daysInPhase = `6-${Math.floor(userCycleLength * 0.43)}`;
    } else if (currentDay >= Math.floor(userCycleLength * 0.43) + 1 && currentDay <= Math.floor(userCycleLength * 0.57)) {
        phase = 'ovulation';
        phaseName = 'Ovulation Phase';
        phaseEmoji = '✨';
        daysInPhase = `${Math.floor(userCycleLength * 0.43) + 1}-${Math.floor(userCycleLength * 0.57)}`;
    } else {
        phase = 'luteal';
        phaseName = 'Luteal Phase';
        phaseEmoji = '🌙';
        daysInPhase = `${Math.floor(userCycleLength * 0.57) + 1}-${userCycleLength}`;
    }
    
    return {
        currentDay,
        phase,
        phaseName,
        phaseEmoji,
        daysInPhase
    };
}

// Update page header with current cycle info
function updatePageHeader() {
    const cycleInfo = getCurrentCycleInfo();
    
    // Update header status
    const statusDay = document.getElementById('status-day');
    const statusPhase = document.getElementById('status-phase');
    
    if (statusDay) {
        statusDay.textContent = `Day ${cycleInfo.currentDay}`;
    }
    
    if (statusPhase) {
        statusPhase.textContent = `${cycleInfo.phaseName} ${cycleInfo.phaseEmoji}`;
    }
    
    // Update phase card
    const phaseBadge = document.querySelector('.phase-badge');
    const phaseEmojiLarge = document.getElementById('phase-emoji-large');
    const phaseTitle = document.getElementById('phase-title');
    const phaseDayInfo = document.getElementById('phase-day-info');
    const phaseDescription = document.getElementById('phase-description');
    
    if (phaseEmojiLarge) phaseEmojiLarge.textContent = cycleInfo.phaseEmoji;
    if (phaseTitle) phaseTitle.textContent = cycleInfo.phaseName;
    if (phaseDayInfo) phaseDayInfo.textContent = `Day ${cycleInfo.currentDay} of ${userCycleLength}`;
    
    // Update phase badge color
    if (phaseBadge) {
        phaseBadge.style.background = getPhaseGradient(cycleInfo.phase);
        phaseBadge.style.boxShadow = getPhaseShadow(cycleInfo.phase);
    }
    
    // Update description based on phase
    if (phaseDescription) {
        phaseDescription.textContent = getPhaseDescription(cycleInfo.phase);
    }
    
    // Update timeline active state
    document.querySelectorAll('.timeline-segment').forEach(seg => {
        seg.classList.remove('active');
    });
    const activeSegment = document.querySelector(`.timeline-segment.${cycleInfo.phase}`);
    if (activeSegment) {
        activeSegment.classList.add('active');
    }
}

function getPhaseGradient(phase) {
    const gradients = {
        menstrual: 'linear-gradient(135deg, #FFB6D9, #FFD4E5)',
        follicular: 'linear-gradient(135deg, #A8E6CF, #C8E6E6)',
        ovulation: 'linear-gradient(135deg, #FFE0A0, #FFF0C0)',
        luteal: 'linear-gradient(135deg, #D4C5E8, #E8D4F0)'
    };
    return gradients[phase] || gradients.menstrual;
}

function getPhaseShadow(phase) {
    const shadows = {
        menstrual: '0 8px 25px rgba(255, 182, 217, 0.4)',
        follicular: '0 8px 25px rgba(168, 230, 207, 0.4)',
        ovulation: '0 8px 25px rgba(255, 224, 160, 0.4)',
        luteal: '0 8px 25px rgba(212, 197, 232, 0.4)'
    };
    return shadows[phase] || shadows.menstrual;
}

function getPhaseDescription(phase) {
    const descriptions = {
        menstrual: 'Low hormones make your skin dry and sensitive. Focus on gentle hydration and avoid harsh treatments during this time.',
        follicular: 'Rising estrogen improves skin texture and clarity. Your skin is getting clearer and more receptive to new products.',
        ovulation: 'Peak estrogen means your skin is at its best! Radiant, glowing, and less reactive. Perfect time for trying new products.',
        luteal: 'Rising progesterone increases oil production and can cause breakouts. Use oil-control products and keep spot treatments handy.'
    };
    return descriptions[phase] || descriptions.menstrual;
}

// Calculate predictions
function calculatePredictions() {
    const insights = calculateCycleInsights();
    
    if (periodHistory.length === 0) {
        return {
            nextPeriod: null,
            nextOvulation: null,
            periodConfidence: 0,
            ovulationConfidence: 0
        };
    }
    
    const lastPeriod = periodHistory[0];
    const avgCycle = insights.avgCycle;
    
    // Calculate next period
    const nextPeriod = new Date(lastPeriod);
    nextPeriod.setDate(nextPeriod.getDate() + avgCycle);
    
    // Calculate next ovulation (typically 14 days before next period)
    const nextOvulation = new Date(nextPeriod);
    nextOvulation.setDate(nextOvulation.getDate() - 14);
    
    // Calculate confidence percentages
    let periodConfidence = 50;
    let ovulationConfidence = 40;
    
    if (insights.confidence === 'high') {
        periodConfidence = 90;
        ovulationConfidence = 85;
    } else if (insights.confidence === 'medium') {
        periodConfidence = 75;
        ovulationConfidence = 65;
    } else if (insights.cycleCount >= 1) {
        periodConfidence = 60;
        ovulationConfidence = 50;
    }
    
    return {
        nextPeriod,
        nextOvulation,
        periodConfidence,
        ovulationConfidence,
        confidenceLevel: insights.confidence
    };
}

// Update predictions UI
function updatePredictionsUI() {
    const predictions = calculatePredictions();
    
    if (!predictions.nextPeriod) {
        document.getElementById('next-period-text').textContent = 'Log your first period to see predictions';
        document.getElementById('next-ovulation-text').textContent = 'Log your first period to see predictions';
        document.getElementById('period-confidence').style.width = '0%';
        document.getElementById('ovulation-confidence').style.width = '0%';
        document.getElementById('period-confidence-label').textContent = 'Confidence: N/A';
        document.getElementById('ovulation-confidence-label').textContent = 'Confidence: N/A';
        return;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Format next period
    const periodDays = Math.round((predictions.nextPeriod - today) / (1000 * 60 * 60 * 24));
    const periodDateStr = predictions.nextPeriod.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    if (periodDays < 0) {
        document.getElementById('next-period-text').textContent = `Was expected ${Math.abs(periodDays)} days ago • ${periodDateStr}`;
    } else if (periodDays === 0) {
        document.getElementById('next-period-text').textContent = `Expected today! 🌸 • ${periodDateStr}`;
    } else if (periodDays === 1) {
        document.getElementById('next-period-text').textContent = `Expected tomorrow • ${periodDateStr}`;
    } else {
        document.getElementById('next-period-text').textContent = `Expected in ${periodDays} days • ${periodDateStr}`;
    }
    
    // Format next ovulation
    const ovulationDays = Math.round((predictions.nextOvulation - today) / (1000 * 60 * 60 * 24));
    const ovulationDateStr = predictions.nextOvulation.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    if (ovulationDays < 0) {
        document.getElementById('next-ovulation-text').textContent = `Was ${Math.abs(ovulationDays)} days ago • ${ovulationDateStr}`;
    } else if (ovulationDays === 0) {
        document.getElementById('next-ovulation-text').textContent = `Today! ✨ • ${ovulationDateStr}`;
    } else if (ovulationDays === 1) {
        document.getElementById('next-ovulation-text').textContent = `Expected tomorrow • ${ovulationDateStr}`;
    } else {
        document.getElementById('next-ovulation-text').textContent = `Expected in ${ovulationDays} days • ${ovulationDateStr}`;
    }
    
    // Update confidence bars
    document.getElementById('period-confidence').style.width = `${predictions.periodConfidence}%`;
    document.getElementById('ovulation-confidence').style.width = `${predictions.ovulationConfidence}%`;
    
    const confidenceText = predictions.confidenceLevel === 'high' ? 'High' : 
                          predictions.confidenceLevel === 'medium' ? 'Medium' : 'Low';
    document.getElementById('period-confidence-label').textContent = `Confidence: ${confidenceText}`;
    document.getElementById('ovulation-confidence-label').textContent = `Confidence: ${confidenceText}`;
}

// Calendar functions
function renderCalendar() {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    // Update month header
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    document.getElementById('calendar-month').textContent = `${monthNames[month]} ${year}`;
    
    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';
    
    // Add day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-day-header';
        header.textContent = day;
        grid.appendChild(header);
    });
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const predictions = calculatePredictions();
    
    // Add previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const date = new Date(year, month - 1, day);
        const dayEl = createCalendarDay(day, date, true, today, predictions);
        grid.appendChild(dayEl);
    }
    
    // Add current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayEl = createCalendarDay(day, date, false, today, predictions);
        grid.appendChild(dayEl);
    }
    
    // Add next month days to fill grid
    const totalCells = grid.children.length - 7;
    const remainingCells = 42 - totalCells;
    for (let day = 1; day <= remainingCells; day++) {
        const date = new Date(year, month + 1, day);
        const dayEl = createCalendarDay(day, date, true, today, predictions);
        grid.appendChild(dayEl);
    }
}

function createCalendarDay(day, date, otherMonth, today, predictions) {
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day';
    dayEl.textContent = day;
    
    if (otherMonth) {
        dayEl.classList.add('other-month');
    }
    
    if (date.getTime() === today.getTime()) {
        dayEl.classList.add('today');
    }
    
    // Check if it's a period day (5 days)
    const isPeriodDay = periodHistory.some(periodStart => {
        const periodEnd = new Date(periodStart);
        periodEnd.setDate(periodEnd.getDate() + 5);
        return date >= periodStart && date < periodEnd;
    });
    
    if (isPeriodDay) {
        dayEl.classList.add('period');
    }
    
    // Check if it's predicted period
    if (predictions.nextPeriod && !isPeriodDay && date >= today) {
        const predictedEnd = new Date(predictions.nextPeriod);
        predictedEnd.setDate(predictedEnd.getDate() + 5);
        if (date >= predictions.nextPeriod && date < predictedEnd) {
            dayEl.classList.add('predicted');
        }
    }
    
    // Check if it's ovulation day (±2 days window)
    if (predictions.nextOvulation && date >= today) {
        const ovulationStart = new Date(predictions.nextOvulation);
        ovulationStart.setDate(ovulationStart.getDate() - 2);
        const ovulationEnd = new Date(predictions.nextOvulation);
        ovulationEnd.setDate(ovulationEnd.getDate() + 2);
        
        if (date >= ovulationStart && date <= ovulationEnd && !isPeriodDay) {
            dayEl.classList.add('ovulation');
        }
    }
    
    // Add click handler for past dates only
    if (date <= today && !otherMonth) {
        dayEl.style.cursor = 'pointer';
        dayEl.addEventListener('click', () => {
            const dateStr = date.toISOString().split('T')[0];
            const formattedDate = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            if (confirm(`Mark ${formattedDate} as period start date?`)) {
                addPeriodDate(dateStr).then(success => {
                    if (success) {
                        showNotification('Period date added! 🌸');
                    } else {
                        showNotification('This date is already logged');
                    }
                });
            }
        });
    }
    
    return dayEl;
}

function previousMonth() {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    renderCalendar();
}

function nextMonth() {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    renderCalendar();
}

// Quick action functions
function toggleQuickAction() {
    const btn = document.querySelector('.quick-action-btn');
    const menu = document.getElementById('quick-action-menu');
    
    btn.classList.toggle('active');
    menu.classList.toggle('active');
}

async function markPeriodToday() {
    const today = new Date().toISOString().split('T')[0];
    const success = await addPeriodDate(today);
    if (success) {
        showNotification('Period logged for today! 🌸');
        toggleQuickAction();
    } else {
        showNotification('Today is already logged');
    }
}

function openCalendarPicker() {
    const modal = document.getElementById('calendar-modal');
    modal.classList.add('active');
    
    // Reset modal state
    document.getElementById('custom-date-section').style.display = 'none';
    
    // Update date labels
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    document.getElementById('today-date').textContent = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    document.getElementById('yesterday-date').textContent = yesterday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    // Set max date to today
    const todayStr = today.toISOString().split('T')[0];
    const picker = document.getElementById('period-date-picker');
    picker.max = todayStr;
    picker.value = '';
}

function selectDateOption(option) {
    const today = new Date();
    let dateToLog;
    
    if (option === 'today') {
        dateToLog = today.toISOString().split('T')[0];
        addPeriodDate(dateToLog).then(success => {
            if (success) {
                showNotification('Period logged for today! 🌸');
                closeCalendarModal();
            } else {
                showNotification('Today is already logged');
            }
        });
    } else if (option === 'yesterday') {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        dateToLog = yesterday.toISOString().split('T')[0];
        const formattedDate = yesterday.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
        addPeriodDate(dateToLog).then(success => {
            if (success) {
                showNotification(`Period logged for ${formattedDate}! 🌸`);
                closeCalendarModal();
            } else {
                showNotification('Yesterday is already logged');
            }
        });
    } else if (option === 'custom') {
        // Show custom date picker
        document.getElementById('custom-date-section').style.display = 'block';
        // Set default to today
        const todayStr = today.toISOString().split('T')[0];
        document.getElementById('period-date-picker').value = todayStr;
    }
}

function closeCalendarModal() {
    const modal = document.getElementById('calendar-modal');
    modal.classList.remove('active');
}

function savePeriodFromModal() {
    const dateInput = document.getElementById('period-date-picker');
    const date = dateInput.value;
    
    if (!date) {
        alert('Please select a date');
        return;
    }
    
    const selectedDate = new Date(date);
    const formattedDate = selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    
    addPeriodDate(date).then(success => {
        if (success) {
            showNotification(`Period logged for ${formattedDate}! 🌸`);
            closeCalendarModal();
            dateInput.value = '';
        } else {
            showNotification('This date is already logged');
        }
    });
}

// Notification system
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #FFB6D9, #D4C5E8);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(255, 182, 217, 0.5);
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Update all UI components
function updateAllUI() {
    updateInsightsUI();
    updatePredictionsUI();
    updatePageHeader();
    updateHistorySummary();
    renderCalendar();
}

// Update history summary
function updateHistorySummary() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;
    
    if (periodHistory.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: var(--text-medium); padding: 1rem;">No periods logged yet. Click "+ Log Period" to start tracking!</p>';
        return;
    }
    
    // Show last 3 periods
    const recentPeriods = periodHistory.slice(0, 3);
    
    historyList.innerHTML = recentPeriods.map((date, index) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const daysAgo = Math.floor((today - date) / (1000 * 60 * 60 * 24));
        
        let badge = '';
        if (index === 0) {
            // Most recent
            if (daysAgo === 0) {
                badge = 'Today';
            } else if (daysAgo === 1) {
                badge = 'Yesterday';
            } else {
                badge = `${daysAgo} days ago`;
            }
        } else {
            // Calculate cycle length from previous period
            const prevDate = periodHistory[index - 1];
            const cycleLength = Math.round((prevDate - date) / (1000 * 60 * 60 * 24));
            badge = `${cycleLength} day cycle`;
        }
        
        const dateStr = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        
        return `
            <div class="history-item">
                <span class="history-date">${dateStr}</span>
                <span class="history-badge">${badge}</span>
            </div>
        `;
    }).join('');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async function() {
    applyTheme();
    await loadUserData();
    updateAllUI();
    
    // Close quick action menu when clicking outside
    document.addEventListener('click', (e) => {
        const btn = document.querySelector('.quick-action-btn');
        const menu = document.getElementById('quick-action-menu');
        if (btn && menu && !btn.contains(e.target) && !menu.contains(e.target)) {
            btn.classList.remove('active');
            menu.classList.remove('active');
        }
    });
});

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
