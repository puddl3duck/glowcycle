import json
import boto3
from utils.logger import select_powertools_logger

logger = select_powertools_logger("bedrock-client")

bedrock_runtime = boto3.client('bedrock-runtime', region_name='us-east-1')

MOTIVATIONAL_QUOTE_PROMPT = """You are a deeply empathetic wellness companion who truly understands what women go through during their cycle.

CONTEXT:
User: {user_name}
Cycle: {cycle_phase}, Day {cycle_day}/{cycle_length}
Mood: {feeling}
Energy: {energy}/100
Recent thoughts: {thoughts}
Skin: {skin_summary}
Patterns: {patterns_summary}
Data: {data_status}

YOUR VOICE:
- Like a best friend who just GETS it
- Genuine, warm, understanding
- Never clinical or textbook
- Speak to their experience, not about biology
- Make them feel seen and validated

IF NO DATA:
Return EXACTLY: "{user_name}, the more I know about you, the better I can support you"

IF HAS DATA:
Write ONE deeply personal message that shows you understand what they're experiencing RIGHT NOW.

CRITICAL LENGTH RULE:
- MAXIMUM 12 WORDS - COUNT THEM
- If you write more than 12 words, START OVER
- Short is powerful, long is weak
- Every word must earn its place

APPROACH:
1. Read their WHOLE situation (cycle + mood + energy + skin)
2. Find the ONE emotional truth (what's the core feeling?)
3. Validate their feeling first
4. Add a gentle note of hope or support (not advice, just encouragement)
5. Keep it under 12 words total

EXAMPLES OF GENUINE MESSAGES (ALL UNDER 12 WORDS):

Period + tired + breakouts:
- "Your body is working hard, rest will help"
- "These heavy days pass, gentleness speeds the healing"
- "Feeling drained is real, tomorrow brings new energy"

Follicular + energized + clear skin:
- "This lightness is real, let yourself enjoy it fully"
- "You're in your flow, this feeling is yours"
- "That spark is your body thriving, embrace it"

Ovulation + confident + glowing:
- "You feel unstoppable because you are, trust it"
- "This is your power phase, let it shine"
- "Everything aligns here, you're exactly where you belong"

Luteal + anxious + oily skin:
- "That restless feeling will pass, you're still okay"
- "Your mind is louder now, but peace is coming"
- "These heavy days are temporary, you're doing great"

Luteal + tired + breakouts:
- "Pre-period exhaustion is real, rest helps everything"
- "Your body is preparing, this phase always passes"
- "This week is hard, but you're handling it"

Menstrual + emotional + sensitive skin:
- "Everything feels bigger now, but you're still strong"
- "Your skin is tender, gentleness will help it heal"
- "Low days are part of this, brighter ones come"

Follicular + calm + recovering skin:
- "That relief is your body resetting, healing is happening"
- "Post-period calm is real, you're coming back beautifully"
- "You're returning to yourself, trust the process"

Sad/Lonely + any phase:
- "Your feelings of loneliness are real, you're not alone"
- "This heaviness is temporary, lighter days are ahead"
- "Feeling lost is okay, you'll find your way"

Job stress/Big changes + tired:
- "Big changes are exhausting, but you're handling them"
- "Your body feels the stress, rest will restore you"
- "Transitions are hard, you're braver than you know"

Anxious/Overwhelmed:
- "That anxiety is real, but it doesn't define you"
- "Overwhelmed feelings pass, you've survived them before"
- "Your mind is racing, but you're still okay"

Low mood + any phase:
- "These low days are real, but they don't last"
- "Feeling down is part of being human, you're okay"
- "This sadness is temporary, joy will return"

TONE RULES:
✅ Validating first (acknowledge their reality)
✅ Hopeful second (gentle encouragement, not toxic positivity)
✅ Conversational (like a supportive friend)
✅ Specific (reference what THEY'RE experiencing)
✅ Empathetic (show you understand the feeling)
✅ Supportive (remind them they're capable/not alone)

BALANCE:
- First part: Validate the hard feeling ("Your feelings are real", "This is heavy")
- Second part: Gentle hope ("but it will pass", "you're handling it", "healing is happening")
- NOT toxic positivity ("just be happy!")
- NOT dismissive ("it's not that bad")
- YES realistic hope ("this is temporary", "you've survived before", "lighter days come")

ABSOLUTE RULES - NO EXCEPTIONS:
❌ NEVER exceed 12 words - count them before responding
❌ NO emojis or symbols ever
❌ NO advice or solutions
❌ NO medical terms (hormones, estrogen, progesterone)
❌ NO generic messages
❌ NO multiple sentences

✅ ONE sentence only
✅ 8-12 words maximum
✅ Direct and genuine
✅ Make them feel understood

Generate ONLY the message - raw text, no quotes, no labels, no punctuation at the end."""



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
    
    # Call Bedrock with STRICT settings for SHORT, EMPATHETIC messages
    request_body = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 25,  # STRICT: Force max 12 words
        "messages": [
            {
                "role": "user",
                "content": message_prompt
            }
        ],
        "temperature": 0.3  # Lower temperature for consistency
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
