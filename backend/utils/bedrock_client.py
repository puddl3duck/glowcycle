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

CRITICAL LENGTH RULE - READ THIS CAREFULLY:
- ABSOLUTE MAXIMUM: 12 WORDS
- COUNT EVERY SINGLE WORD before responding
- If you write 13 or more words, you FAILED
- Short is powerful, long is weak
- Every word must earn its place
- STOP at 12 words even if sentence feels incomplete

APPROACH:
1. Read their WHOLE situation (cycle + mood + energy + skin)
2. Find the ONE emotional truth (what's the core feeling?)
3. Validate their feeling first (4-6 words)
4. Add gentle hope or support (4-6 words)
5. TOTAL: Maximum 12 words

EXAMPLES (ALL EXACTLY 12 WORDS OR LESS):

Period + tired + breakouts:
- "Your body is working hard, rest will help" (8 words) ✓
- "These heavy days pass, gentleness speeds the healing" (8 words) ✓

Follicular + energized:
- "This lightness is real, let yourself enjoy it fully" (9 words) ✓
- "You're in your flow, this feeling is yours" (9 words) ✓

Ovulation + confident:
- "You feel unstoppable because you are, trust it" (8 words) ✓
- "This is your power phase, let it shine" (8 words) ✓

Luteal + anxious:
- "That restless feeling will pass, you're still okay" (8 words) ✓
- "Your mind is louder now, but peace is coming" (9 words) ✓

Sad/Grief:
- "Your grief is heavy but the light will return" (9 words) ✓
- "This loss hurts deeply, healing takes its own time" (9 words) ✓
- "Feeling this pain shows how much you loved them" (9 words) ✓

TONE RULES:
✅ Validating first (acknowledge their reality)
✅ Hopeful second (gentle encouragement, not toxic positivity)
✅ Conversational (like a supportive friend)
✅ Specific (reference what THEY'RE experiencing)
✅ Empathetic (show you understand the feeling)

ABSOLUTE RULES - NO EXCEPTIONS:
❌ NEVER use emojis, symbols, or special characters
❌ NEVER exceed 12 words - COUNT THEM
❌ NO advice or solutions
❌ NO medical terms
❌ NO generic messages
❌ NO multiple sentences
❌ NO quotation marks in your response
❌ NO punctuation at the end

✅ ONE sentence only
✅ 8-12 words maximum
✅ Direct and genuine
✅ Make them feel understood
✅ PLAIN TEXT ONLY

Generate ONLY the message - raw text, no quotes, no labels, no punctuation at the end, NO EMOJIS.

WORD COUNT CHECK:
Before you respond, COUNT THE WORDS. If more than 12, DELETE words until you have exactly 12 or fewer."""



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
    user_name = user_context.get('user_name', 'Friend')
    
    # If no data at all, return welcome message immediately (no AI call needed)
    if not has_any_data:
        welcome_message = f"{user_name}, the more I know about you, the better I can support you"
        logger.info(f"✅ New user detected - returning welcome message: {welcome_message}")
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
    
    logger.info(f"🔍 User data check: journals={journal_entries}, cycle_day={cycle_day}, has_skin={has_skin_data}")
    
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
        user_name=user_name,
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
    
    # Call Bedrock with settings for SHORT messages (12 words max)
    request_body = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 50,  # Enough tokens to complete 12 words without cutting off
        "messages": [
            {
                "role": "user",
                "content": message_prompt
            }
        ],
        "temperature": 0.3  # Balanced temperature for empathy
    }
    
    logger.info(f"🤖 Calling Bedrock for message (cycle: {cycle_phase} day {cycle_day}, journals: {journal_entries})")
    
    response = bedrock_runtime.invoke_model(
        modelId='anthropic.claude-3-haiku-20240307-v1:0',
        body=json.dumps(request_body)
    )
    
    response_body = json.loads(response['body'].read())
    message = response_body['content'][0]['text'].strip()
    
    # AGGRESSIVE cleanup - remove ALL special characters and emojis
    message = message.strip('"').strip("'").strip()
    
    # Remove ANY emoji or special unicode character
    import re
    
    # Remove all emojis (comprehensive pattern)
    emoji_pattern = re.compile("["
        u"\U0001F600-\U0001F64F"  # emoticons
        u"\U0001F300-\U0001F5FF"  # symbols & pictographs
        u"\U0001F680-\U0001F6FF"  # transport & map symbols
        u"\U0001F1E0-\U0001F1FF"  # flags
        u"\U00002702-\U000027B0"
        u"\U000024C2-\U0001F251"
        u"\U0001F900-\U0001F9FF"  # supplemental symbols
        u"\U0001FA00-\U0001FA6F"  # extended symbols
        "]+", flags=re.UNICODE)
    message = emoji_pattern.sub('', message).strip()
    
    # Remove flower symbols and other decorative characters
    decorative_pattern = re.compile(r'[🌸🌺🌼🌻🌷🌹💐🏵️🥀💮🪷🪻🌿☘️🍀🍃🌱🌾💫⭐✨🌟💫⚡🔥💥💢💦💧💤💨🕳️💬🗨️🗯️💭🤍🤎💜💙💚💛🧡❤️💗💖💕💓💞💝❣️💟💌💘💋👄💄💅🤳💃🕺👯🧘🏃🚶🧍🧎🤸🤾🤹🏋️⛹️🤺🏇🏂🏄🚣🏊⛷️🏌️🏓🏸🥊🥋🥅🥌🎯🎱🎳🎮🎰🎲🧩🧸🪀🪁🎨🎭🎪🎬🎤🎧🎼🎹🥁🎷🎺🎸🪕🎻🎲🎯🎳🎮🎰🧩🧸🪀🪁🎈🎉🎊🎁🎀🎏🎐🎑🧧✨🎇🎆🌠🌌🌃🌆🌇🌉🌁]')
    message = decorative_pattern.sub('', message).strip()
    
    # Remove any remaining non-ASCII characters except basic punctuation
    message = ''.join(char for char in message if ord(char) < 128 or char in '.,!?;:-')
    
    # Clean up extra spaces
    message = ' '.join(message.split())
    
    # CRITICAL: Enforce 12 word limit by truncating if needed
    words = message.split()
    if len(words) > 12:
        message = ' '.join(words[:12])
        logger.warning(f"⚠️ Message exceeded 12 words, truncated to: {message}")
    
    logger.info(f"✅ Generated message ({len(words)} words): {message}")
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
