import json
import boto3
from utils.logger import select_powertools_logger

logger = select_powertools_logger("bedrock-client")

bedrock_runtime = boto3.client('bedrock-runtime', region_name='us-east-1')

MOTIVATIONAL_QUOTE_PROMPT = """You are an expert dermatologist and hormone specialist with deep knowledge of the menstrual cycle's impact on skin health.

CONTEXT:
User Name: {user_name}
Cycle Phase: {cycle_phase} (Day {cycle_day} of {cycle_length})
Current Mood: {feeling}
Energy Level: {energy}/100
Recent Thoughts: {thoughts}
Skin Condition: {skin_summary}
7-Day Patterns: {patterns_summary}
Data Status: {data_status}

YOUR MISSION:

IF NO DATA (data_status = NO_DATA):
- Return EXACTLY: "{user_name}, the more I know about you, the better I can support you"
- Use the exact user name provided
- NO variations, NO emojis

IF HAS DATA (data_status = HAS_DATA):
- Analyze the CONNECTION between cycle phase, skin condition, and emotional state
- Write ONE highly personalized insight (max 12 words)
- Show you understand THEIR specific situation
- Be warm, professional, and empowering
- NO emojis, NO generic advice

EXPERT ANALYSIS FRAMEWORK:

1. CYCLE-SKIN CONNECTION:
   - Menstrual: Low hormones → skin sensitivity, inflammation, slower healing
   - Follicular: Rising estrogen → increased collagen, natural glow, hydration
   - Ovulation: Peak estrogen → maximum radiance, balanced oil production
   - Luteal: Rising progesterone → increased sebum, potential breakouts, water retention

2. MOOD-SKIN-CYCLE TRIANGLE:
   - Low energy + breakouts + luteal = hormonal, expected, temporary
   - High energy + clear skin + follicular = optimal phase, encourage consistency
   - Anxiety + sensitivity + menstrual = inflammation response, need gentleness
   - Calm + glowing + ovulation = peak state, celebrate this moment

3. PERSONALIZATION RULES:
   - Reference THEIR specific cycle day when relevant
   - Acknowledge THEIR current skin concern if present
   - Connect THEIR mood/energy to hormonal phase
   - Make them feel SEEN and UNDERSTOOD
   - Validate their experience as normal/expected

EXAMPLES (MAX 12 WORDS, HIGHLY PERSONALIZED):

MENSTRUAL + BREAKOUTS + LOW ENERGY:
- "Day 2 breakouts are hormonal inflammation, not skincare failure"
- "Your skin sensitivity now is temporary, gentleness is key"
- "Low energy and breakouts together signal hormone reset, be patient"

FOLLICULAR + CLEAR SKIN + HIGH ENERGY:
- "Your rising estrogen is creating this glow, embrace it"
- "Day 10 radiance reflects your hormonal peak, you're thriving"
- "This energy and clarity are your follicular gifts, enjoy"

OVULATION + GOOD MOOD + BALANCED SKIN:
- "Peak estrogen brings this confidence and glow, you're radiant"
- "Day 14 balance shows your body's perfect hormonal rhythm"
- "Your skin and mood reflect optimal hormone harmony now"

LUTEAL + OILY SKIN + ANXIETY:
- "Progesterone increases oil and anxiety, both are temporary patterns"
- "Day 22 skin changes are hormonal preparation, not regression"
- "Your luteal sensitivity is your body preparing, stay consistent"

LUTEAL + BREAKOUTS + TIRED:
- "Pre-period breakouts and fatigue are connected, both will pass"
- "Your skin reflects progesterone surge, this phase always shifts"
- "Day 25 symptoms show your cycle working, trust the process"

FOLLICULAR + DRYNESS + CALM:
- "Rising estrogen will restore hydration, your skin is adjusting"
- "Post-period dryness is temporary, moisture is returning naturally"
- "Your calm energy supports skin healing, consistency pays off"

MENSTRUAL + REDNESS + LOW MOOD:
- "Inflammation and low mood both stem from hormones, be gentle"
- "Day 3 sensitivity needs extra care, your skin is vulnerable"
- "This phase brings inflammation, your response is working perfectly"

OVULATION + CONCERNS + HIGH ENERGY:
- "Peak hormones support healing, your energy will help recovery"
- "Day 13 is optimal for skin repair, stay consistent"
- "Your body's peak state accelerates improvement, trust the timing"

CRITICAL RULES:
❌ NO emojis or symbols
❌ NO generic advice like "drink water" or "get sleep"
❌ NO longer than 12 words
✅ Reference their specific cycle day when impactful
✅ Connect their mood/energy to skin/hormones
✅ Make them feel understood and validated
✅ Professional yet warm tone
✅ Show expert understanding of their unique situation

GENERATE ONLY THE MESSAGE - no quotes, no labels, just the personalized insight."""



def generate_motivational_quote(user_context: dict) -> str:
    """
    Generate SHORT personalized motivational message using Bedrock.
    Max 12 words, always fresh from AI.
    NO FALLBACKS - AI only!
    
    Args:
        user_context: Dictionary containing user wellness data
    
    Returns:
        String with motivational message (1 sentence, max 12 words)
    
    Raises:
        Exception if Bedrock call fails
    """
    # Check if user has ANY data at all
    has_any_data = user_context.get('has_any_data', False)
    
    # If no data at all, return welcome message immediately (no AI call needed)
    if not has_any_data:
        user_name = user_context.get('user_name', 'Friend')
        welcome_message = f"{user_name}, the more I know about you, the better I can support you"
        logger.info(f"New user detected - returning welcome message: {welcome_message}")
        return welcome_message
    
    # User has data - generate personalized message with AI
    cycle_phase = user_context.get('cycle_phase', 'unknown')
    cycle_day = user_context.get('cycle_day', 0)
    cycle_length = user_context.get('cycle_length', 28)
    feeling = user_context.get('feeling', 'calm')
    energy = user_context.get('energy', 70)
    thoughts = user_context.get('thoughts', '')[:150]
    
    # Check data types
    patterns = user_context.get('recent_patterns', {})
    journal_entries = patterns.get('entries_count', 0)
    skin_condition = user_context.get('skin_condition', {})
    has_skin_data = bool(skin_condition)
    has_cycle_data = cycle_day > 0
    
    data_status = "HAS_DATA"
    
    # Detailed skin summary
    skin_issues = []
    if skin_condition.get('acne_detected'):
        skin_issues.append('breakouts')
    if skin_condition.get('dryness_detected'):
        skin_issues.append('dryness')
    if skin_condition.get('oiliness_detected'):
        skin_issues.append('oiliness')
    if skin_condition.get('redness_detected'):
        skin_issues.append('redness')
    
    skin_summary = ', '.join(skin_issues) if skin_issues else 'no specific concerns detected'
    
    # Rich patterns summary with more context
    avg_energy = patterns.get('avg_energy_7d', 70)
    top_concerns = patterns.get('top_concerns', [])
    
    # Build detailed patterns summary
    patterns_summary = f"{journal_entries} journal entries in 7 days"
    if avg_energy < 60:
        patterns_summary += f", consistently low energy (avg {avg_energy}/100)"
    elif avg_energy > 80:
        patterns_summary += f", high energy levels (avg {avg_energy}/100)"
    else:
        patterns_summary += f", moderate energy (avg {avg_energy}/100)"
    
    if top_concerns:
        patterns_summary += f", main concerns: {', '.join(top_concerns[:2])}"
    
    # Build ultra-concise but rich prompt
    message_prompt = MOTIVATIONAL_QUOTE_PROMPT.format(
        user_name=user_context.get('user_name', 'Friend'),
        cycle_phase=cycle_phase.capitalize(),
        cycle_day=cycle_day,
        cycle_length=cycle_length,
        feeling=feeling.capitalize(),
        energy=energy,
        thoughts=thoughts if thoughts else "no recent thoughts shared",
        skin_summary=skin_summary,
        patterns_summary=patterns_summary,
        data_status=data_status
    )
    
    # Call Bedrock with optimized settings for PERSONALIZED, EXPERT messages
    request_body = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 60,  # Max 12 words
        "messages": [
            {
                "role": "user",
                "content": message_prompt
            }
        ],
        "temperature": 0.8  # Balanced for personalization with consistency
    }
    
    logger.info(f"Calling Bedrock for EXPERT PERSONALIZED message (cycle: {cycle_phase} day {cycle_day}, skin: {skin_summary}, mood: {feeling}, energy: {energy})")
    
    response = bedrock_runtime.invoke_model(
        modelId='anthropic.claude-3-haiku-20240307-v1:0',
        body=json.dumps(request_body)
    )
    
    response_body = json.loads(response['body'].read())
    message = response_body['content'][0]['text'].strip()
    
    # Clean up message (remove quotes, emojis, and extra text)
    message = message.strip('"').strip("'").strip()
    
    # Remove any emojis that might have slipped through
    import re
    emoji_pattern = re.compile("["
        u"\U0001F600-\U0001F64F"  # emoticons
        u"\U0001F300-\U0001F5FF"  # symbols & pictographs
        u"\U0001F680-\U0001F6FF"  # transport & map symbols
        u"\U0001F1E0-\U0001F1FF"  # flags
        u"\U00002702-\U000027B0"
        u"\U000024C2-\U0001F251"
        "]+", flags=re.UNICODE)
    message = emoji_pattern.sub('', message).strip()
    
    logger.info(f"Generated motivational message: {message}")
    return message


def generate_wellness_support(user_context: dict) -> dict:
    """
    Generate personalized wellness support using AWS Bedrock.
    AI-ONLY - no fallbacks. If Bedrock fails, error is raised.
    
    Args:
        user_context: Dictionary containing user wellness data
    
    Returns:
        Dictionary with wellness support message
    """
    from datetime import datetime
    
    # Generate motivational message using Bedrock AI (no fallbacks!)
    motivational_message = generate_motivational_quote(user_context)
    
    # Return simple response with just the AI message
    wellness_response = {
        "message": motivational_message,
        "generated_at": datetime.now().isoformat(),
        "source": "bedrock_ai"
    }
    
    logger.info(f"Generated AI motivational message: {motivational_message}")
    return wellness_response


def get_bedrock_client():
    """Get configured Bedrock runtime client"""
    return bedrock_runtime
