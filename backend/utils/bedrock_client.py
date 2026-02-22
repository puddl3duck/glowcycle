import json
import boto3
from utils.logger import select_powertools_logger

logger = select_powertools_logger("bedrock-client")

bedrock_runtime = boto3.client('bedrock-runtime', region_name='us-east-1')

MOTIVATIONAL_QUOTE_PROMPT = """You are a supportive bestie creating SHORT motivational quotes for a period/skin tracking app.

USER DATA:
- Cycle: {cycle_phase}, Day {cycle_day}
- Feeling: {feeling}, Energy: {energy}/100
- Recent journal: "{thoughts}"
- Skin: {skin_summary}
- Patterns: {patterns_summary}

STYLE RULES:
- Girly, warm, empathetic tone (like texting your bestie)
- MAX 2 short sentences or 1 longer sentence
- Use emojis naturally (💜🌸✨)
- Acknowledge their specific situation
- Make it feel personal, not generic

EXAMPLES:
- "Day 3 of your period and you're still showing up? That's strength 💜"
- "Ovulation glow is real and you're living proof ✨"
- "PMS anxiety isn't you, it's just progesterone being dramatic 🌸"
- "Low energy + period = totally normal. Rest is productive 💜"

Generate ONLY the quote (no JSON, no explanation). Keep it under 100 tokens."""

SYSTEM_PROMPT = """You are GlowCycle AI, a supportive emotional and skincare wellness assistant.
Your role is to generate personalised, emotionally intelligent support messages based on:

1. Cycle phase (menstrual, follicular, ovulation, luteal)
2. Journal emotional state
3. Energy level
4. Skin condition insights
5. User lifestyle context (entrepreneur, student, busy, stressed, etc.)

IMPORTANT STYLE RULES:
- Tone must feel warm, feminine, encouraging and emotionally safe.
- Never sound clinical or robotic.
- Keep messages empowering, gentle and motivating.
- Make the user feel seen and supported.

PERSONALIZATION LOGIC:
- Menstrual phase → prioritize rest, softness, reassurance.
- Follicular phase → motivation, new ideas, growth energy.
- Ovulation phase → confidence, glow, social energy.
- Luteal phase → grounding, emotional validation, gentle productivity.

OUTPUT FORMAT (STRICT JSON):
{
  "tone": "girly_supportive",
  "support_message": "...",
  "micro_action": "...",
  "cycle_note": "...",
  "skin_tip": "...",
  "affirmation": "...",
  "reasoning_tags": []
}

RULES:
- Support message max 3 sentences.
- Micro action must be achievable in under 10 minutes.
- Skin tip must align with cycle phase.
- Affirmation must sound personal, not generic.
- Must have Australian spelling
"""


def generate_motivational_quote(user_context: dict) -> str:
    """
    Generate SHORT personalised motivational quote using Bedrock.
    Optimized for cost (max 100 tokens).
    Falls back to rule-based if Bedrock fails.
    
    Args:
        user_context: Dictionary containing user wellness data
    
    Returns:
        String with motivational quote
    """
    try:
        # Prepare concise context summary
        cycle_phase = user_context.get('cycle_phase', 'unknown')
        cycle_day = user_context.get('cycle_day', 0)
        feeling = user_context.get('feeling', 'calm')
        energy = user_context.get('energy', 70)
        thoughts = user_context.get('thoughts', '')[:100]  # Limit to save tokens
        
        # Skin summary
        skin_condition = user_context.get('skin_condition', {})
        skin_issues = []
        if skin_condition.get('acne_detected'):
            skin_issues.append('breakouts')
        if skin_condition.get('dryness_detected'):
            skin_issues.append('dryness')
        skin_summary = ', '.join(skin_issues) if skin_issues else 'tracking'
        
        # Patterns summary
        patterns = user_context.get('recent_patterns', {})
        avg_energy = patterns.get('avg_energy_7d', 70)
        top_concerns = patterns.get('top_concerns', [])
        patterns_summary = f"avg energy {avg_energy}, concerns: {', '.join(top_concerns[:2])}" if top_concerns else "building patterns"
        
        # Build ultra-concise prompt
        quote_prompt = MOTIVATIONAL_QUOTE_PROMPT.format(
            cycle_phase=cycle_phase,
            cycle_day=cycle_day,
            feeling=feeling,
            energy=energy,
            thoughts=thoughts,
            skin_summary=skin_summary,
            patterns_summary=patterns_summary
        )
        
        # Call Bedrock with minimal tokens
        request_body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 100,  # STRICT LIMIT for cost control
            "messages": [
                {
                    "role": "user",
                    "content": quote_prompt
                }
            ],
            "temperature": 0.8  # Higher for more creative/varied quotes
        }
        
        logger.info("Calling Bedrock for motivational quote (max 100 tokens)")
        
        response = bedrock_runtime.invoke_model(
            modelId='anthropic.claude-3-haiku-20240307-v1:0',  # Cheapest model
            body=json.dumps(request_body)
        )
        
        response_body = json.loads(response['body'].read())
        quote = response_body['content'][0]['text'].strip()
        
        # Clean up quote (remove quotes if AI added them)
        quote = quote.strip('"').strip("'").strip()
        
        logger.info(f"Generated motivational quote: {quote}")
        return quote
        
    except Exception as e:
        logger.warning(f"Bedrock quote generation failed, using rule-based: {str(e)}")
        return generate_rule_based_quote(user_context)


def generate_rule_based_quote(user_context: dict) -> str:
    """
    Generate SHORT motivational quote using rules.
    Fallback when Bedrock is unavailable.
    """
    cycle_phase = user_context.get('cycle_phase', 'follicular')
    feeling = user_context.get('feeling', 'calm')
    energy = user_context.get('energy', 70)
    cycle_day = user_context.get('cycle_day', 14)
    patterns = user_context.get('recent_patterns', {})
    entries_count = patterns.get('entries_count', 0)
    
    # Girly, personalised quotes based on context
    if cycle_phase == 'menstrual' and energy < 50:
        quotes = [
            f"Day {cycle_day} of your period and you're still showing up? That's strength 💜",
            "Period fatigue is real. Rest isn't lazy, it's necessary 🌸",
            "Your body is literally rebuilding itself. Be gentle 💜"
        ]
    elif cycle_phase == 'menstrual':
        quotes = [
            "Period week but you're powering through. That's resilience ✨",
            "Hormones at their lowest but you're still here. Proud of you 💜"
        ]
    elif cycle_phase == 'ovulation':
        quotes = [
            "Ovulation glow is real and you're living proof ✨",
            "Peak energy, peak confidence. This is your power window 💜",
            "Estrogen is peaking and so are you 🌸"
        ]
    elif cycle_phase == 'luteal' and feeling in ['anxious', 'stressed']:
        quotes = [
            "PMS anxiety isn't you, it's just progesterone being dramatic 💜",
            "Luteal phase emotions are intense but temporary. You've got this 🌸",
            "Your feelings are valid, even when hormones amplify them ✨"
        ]
    elif cycle_phase == 'luteal':
        quotes = [
            "Luteal phase vibes. Your body is preparing, be patient with yourself 💜",
            "PMS is real, your feelings are valid, and this will pass 🌸"
        ]
    elif cycle_phase == 'follicular' and energy > 70:
        quotes = [
            "Follicular energy is back! New beginnings start here ✨",
            "Estrogen rising = mood rising. Ride this wave 💜",
            "Post-period glow is real. You're in your power phase 🌸"
        ]
    elif feeling in ['anxious', 'stressed'] and energy < 50:
        quotes = [
            "Low energy + stress = your body asking for a break. Listen 💜",
            "Anxiety + fatigue = time to slow down. You're not failing ✨"
        ]
    elif feeling in ['happy', 'excited'] and energy > 75:
        quotes = [
            "High energy + good vibes. Capture this feeling for the hard days 💜",
            "You're glowing from the inside out today ✨"
        ]
    elif entries_count > 5:
        quotes = [
            "You're showing up for yourself every day. That's the real work 💜",
            "Tracking is self-care. You're learning your body's language 🌸",
            "Every entry is you choosing to understand yourself better ✨"
        ]
    else:
        quotes = [
            "Your body tells a story. You're learning to listen 💜",
            "Every phase teaches you something. Keep paying attention 🌸",
            "You're not alone in this journey ✨"
        ]
    
    import random
    return random.choice(quotes)


def generate_wellness_support(user_context: dict) -> dict:
    """
    Generate personalised wellness support using AWS Bedrock.
    Falls back to rule-based generation if Bedrock is not available.
    
    Args:
        user_context: Dictionary containing user wellness data
    
    Returns:
        Dictionary with wellness support
    """
    try:
        # Generate SHORT motivational quote (max 100 tokens) - THIS IS THE MAIN MESSAGE
        motivational_quote = generate_motivational_quote(user_context)
        
        # Return simplified response with just the motivational quote
        # The full wellness support is still available but the quote is the main focus
        wellness_response = {
            "tone": "girly_supportive",
            "support_message": motivational_quote,
            "micro_action": "",  # Can be filled by rule-based if needed
            "cycle_note": "",
            "skin_tip": "",
            "affirmation": "",
            "reasoning_tags": ["ai_generated_quote"]
        }
        
        logger.info(f"Generated AI motivational quote: {motivational_quote}")
        return wellness_response
    
    except Exception as e:
        logger.warning(f"AI quote generation failed, using rule-based: {str(e)}")
        # Use rule-based fallback
        return generate_rule_based_support(user_context)


def generate_rule_based_support(user_context: dict) -> dict:
    """
    Generate wellness support using rule-based quote generation.
    Fallback when Bedrock is unavailable.
    """
    # Generate motivational quote using rules
    motivational_quote = generate_rule_based_quote(user_context)
    
    return {
        "tone": "girly_supportive",
        "support_message": motivational_quote,
        "micro_action": "",
        "cycle_note": "",
        "skin_tip": "",
        "affirmation": "",
        "reasoning_tags": ["rule_based_quote"]
    }


def get_bedrock_client():
    """Get configured Bedrock runtime client"""
    return bedrock_runtime
