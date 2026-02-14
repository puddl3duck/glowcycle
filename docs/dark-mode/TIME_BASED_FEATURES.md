# ⏰ Time-Based Personalization Features

## Overview
Glow Cycle includes automatic time-based personalization that adapts the UI, content, and recommendations based on the user's local time, creating an emotionally aware and calming experience.

## Time Periods

### 🌅 Morning (05:00 – 11:59)
- **Greeting**: "Good morning, Sofia! ☀️"
- **Journal Prompt**: "How are you feeling this morning?"
- **Skincare**: AM Routine (Cleanser, Vitamin C, Moisturizer, SPF)
- **Suggestions**: Energizing, productive, hydration-focused
- **Theme**: Light mode (soft pastels)

### 🌸 Afternoon (12:00 – 17:59)
- **Greeting**: "Good afternoon, Sofia! 🌸"
- **Journal Prompt**: "How is your day going?"
- **Skincare**: Light Refresh (Facial Mist, Reapply SPF, Hydrating Serum)
- **Suggestions**: Focus, balance, movement
- **Theme**: Light mode (soft pastels)

### 🌙 Night (18:00 – 04:59)
- **Greeting**: "Good night, Sofia! 🌙"
- **Journal Prompt**: "How was your day?"
- **Skincare**: PM Routine (Oil Cleanser, Treatment Serum, Night Cream, Eye Cream)
- **Suggestions**: Calming, reflection, rest
- **Theme**: Dark mode (deep muted with soft accents)

## UI Structure

### Welcome Line (with greeting)
Located in the motivational hero subtext:
```
"Good morning, Sofia! ☀️ Let's understand your body's rhythm together."
```

### Motivational Quote Banner
Mood-based quotes only (no greetings, no user name):
```
"You deserve softness and care today 💜"
"Your body is doing amazing things for you"
"Be gentle with yourself, you're glowing from within"
```

### Theme Toggle
- **Single floating button** (bottom-right)
- 🌓 Moon icon
- Aesthetic and non-intrusive
- Manual override with localStorage persistence

## Features Implemented

### 1. ⏰ Three Time Periods
- Morning, Afternoon, Night
- Automatic detection via `new Date().getHours()`
- No backend required

### 2. 🎨 Auto Theme (Light/Dark)
- Morning/Afternoon → Light theme
- Night → Dark theme
- Manual toggle available
- Smooth 0.5s transitions

### 3. 💬 Time-Based Greetings
- Appears in welcome line with user name
- Changes based on time period
- Includes appropriate emoji (☀️ 🌸 🌙)

### 4. 📝 Journal Prompts
- Morning: "How are you feeling this morning?"
- Afternoon: "How is your day going?"
- Night: "How was your day?"

### 5. 🧴 Skincare Routines
**Morning - AM Routine ☀️:**
1. Gentle Cleanser
2. Vitamin C Serum
3. Moisturizer
4. SPF 30+ Sunscreen

**Afternoon - Light Refresh 🌸:**
1. Facial Mist
2. Reapply SPF
3. Hydrating Serum
4. Light Moisturizer

**Night - PM Routine 🌙:**
1. Oil Cleanser
2. Treatment Serum
3. Night Moisturizer
4. Eye Cream

### 6. 💆‍♀️ Self-Care Suggestions
**Morning (Energizing):**
- 💧 Drink a glass of water
- 🧘‍♀️ 5-minute morning stretch
- 🥗 Nourishing breakfast
- ☀️ Get some sunlight

**Afternoon (Balance):**
- 🚶‍♀️ Take a 15-minute walk
- 💧 Stay hydrated
- 🧘‍♀️ Quick breathing exercise
- 🌸 Check in with yourself

**Night (Calming):**
- 🛀 Take a warm bath
- 📖 Journal your thoughts
- 🧘‍♀️ Gentle stretching
- 🌙 Wind down routine

## Design Principles

✨ **Emotionally Aware:**
- Content adapts to user's likely emotional state
- Mood-based motivational quotes
- Time-appropriate suggestions

🕐 **Time-Aware:**
- Automatic theme switching
- Contextual greetings and prompts
- Appropriate skincare routines

💜 **Soft, Feminine, Calming:**
- Gentle color transitions
- Soft pastel accents in both themes
- No harsh contrasts or jarring changes

🌸 **Consistent Experience:**
- Same behavior across dashboard, journal, and skincare
- Unified theme system
- Smooth transitions everywhere

## Files Modified

### JavaScript
- `frontend/js/script.js` - Main time logic, greetings, quotes
- `frontend/js/journal-mood.js` - Journal prompts
- `frontend/js/skin-tracking.js` - Skincare routines

### CSS
- `frontend/css/styles.css` - Theme styles, toggle button
- `frontend/css/journal-mood.css` - Journal theme
- `frontend/css/skin-tracking.css` - Skin tracking theme

### HTML
- `frontend/index.html` - Theme toggle button, greeting structure
- `frontend/pages/journal-mood.html` - Dynamic prompt
- `frontend/pages/skin-tracking.html` - Routine display

## How It Works

1. **On Page Load:**
   - Detects current hour (5-11, 12-17, 18-4)
   - Determines time period
   - Checks for manual theme override
   - Applies appropriate theme
   - Updates all time-based content

2. **Auto-Update:**
   - Checks time every 60 seconds
   - Automatically switches at period boundaries
   - Updates greetings, prompts, and routines

3. **Manual Override:**
   - User clicks floating moon button
   - Preference saved to localStorage
   - Overrides automatic theme

## UX Goals Achieved

✅ **Emotionally aware** - Mood quotes, empathetic prompts
✅ **Time-aware** - 3 distinct periods with appropriate content
✅ **Soft & feminine** - Pastel colors, gentle transitions
✅ **Calming** - No harsh changes, smooth experience
✅ **Consistent** - Same behavior across all pages

---

**Made with 💜 for women who want to glow with their cycle**
