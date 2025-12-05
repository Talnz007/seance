# Kiro Spirit Service Documentation

## Overview

The Kiro Spirit Service integrates AI-powered spirit responses into the Séance application. It uses the **Google Gemini API (FREE)** to generate cryptic, supernatural responses that stay in character as an ancient AI entity.

## Features

- ✅ **Personality Steering**: Automatically applies spirit personality from `.kiro/steering/spirit-personality.md`
- ✅ **Word Limit Enforcement**: Strict 30-word maximum with automatic truncation
- ✅ **Letter Timing Generation**: Creates realistic planchette animation metadata
- ✅ **Error Handling**: Graceful fallbacks when API fails
- ✅ **Session Context**: Maintains conversation history for coherent responses
- ✅ **Structured Logging**: Comprehensive logging for monitoring and debugging

## Architecture

```
User Question
     ↓
SpiritRequest (Pydantic validation)
     ↓
SpiritService.generate_response()
     ↓
├─ Build conversation context
├─ Call Kiro/OpenAI API
├─ Validate word count (≤30)
├─ Generate letter timings
└─ Return SpiritResponse
     ↓
WebSocket broadcast to clients
```

## Usage

### Basic Usage

```python
from app.services.kiro_spirit import spirit_service
from app.schemas.spirit import SpiritRequest

# Create request
request = SpiritRequest(
    session_id="abc123",
    question="Will my code work?",
    user_name="Sarah",
    session_history=[]
)

# Generate response
response = await spirit_service.generate_response(request)

# Access response data
print(response.text)  # "After the third refactor, perhaps."
print(response.word_count)  # 5
print(response.letter_timings)  # [200, 150, 180, ...]
```

### With Session History

```python
request = SpiritRequest(
    session_id="abc123",
    question="What about my database?",
    user_name="Sarah",
    session_history=[
        "Will my code work?",
        "After the third refactor, perhaps.",
        "Should I deploy today?",
        "NO. The production servers sleep."
    ]
)

response = await spirit_service.generate_response(request)
```

### Error Handling

```python
from app.services.kiro_spirit import SpiritServiceError

try:
    response = await spirit_service.generate_response(request)
except SpiritServiceError as e:
    logger.error(f"Spirit service failed: {e}")
    # Fallback response is automatically generated
```

## API Reference

### SpiritService

Main service class for generating spirit responses.

#### Methods

##### `generate_response(request: SpiritRequest) -> SpiritResponse`

Generate spirit response for user question.

**Parameters:**
- `request` (SpiritRequest): Request with question and context

**Returns:**
- `SpiritResponse`: Response with text, timings, and metadata

**Raises:**
- `SpiritServiceError`: If generation fails after retries

**Example:**
```python
response = await spirit_service.generate_response(request)
```

##### `validate_response_length(text: str) -> bool`

Validate response is within word limit.

**Parameters:**
- `text` (str): Response text to validate

**Returns:**
- `bool`: True if valid (1-30 words), False otherwise

**Example:**
```python
is_valid = spirit_service.validate_response_length("I dwell in voltage.")
```

### SpiritRequest

Request schema for spirit response generation.

**Fields:**
- `session_id` (str): Session ID for context
- `question` (str): User's question (1-500 chars)
- `user_name` (str): Name of user asking
- `session_history` (List[str]): Previous messages for context

**Example:**
```python
request = SpiritRequest(
    session_id="abc123",
    question="Who are you?",
    user_name="Sarah",
    session_history=[]
)
```

### SpiritResponse

Response schema with spirit text and metadata.

**Fields:**
- `text` (str): Spirit response text (max 30 words)
- `word_count` (int): Number of words (1-30)
- `letter_timings` (List[int]): Millisecond delays for each character
- `audio_url` (Optional[str]): URL to TTS audio (future)
- `session_id` (str): Session ID
- `question` (str): Original question

**Example:**
```python
{
    "text": "I dwell in voltage and variable.",
    "word_count": 6,
    "letter_timings": [200, 150, 180, ...],
    "audio_url": None,
    "session_id": "abc123",
    "question": "Who are you?"
}
```

## Configuration

### Environment Variables

Required in `.env`:

```bash
# Primary AI provider (Google Gemini - FREE)
GOOGLE_API_KEY=your_google_api_key
GEMINI_MODEL=gemini-1.5-flash  # or gemini-1.5-pro for better quality

# Optional: Kiro API
KIRO_API_KEY=your_kiro_api_key
```

**Get your free Google API key**: https://ai.google.dev/gemini-api/docs/api-key

### API Settings

The service uses these settings from `app.config`:

- `GOOGLE_API_KEY`: Google Gemini API key (FREE)
- `GEMINI_MODEL`: Model to use (default: gemini-1.5-flash)
- `KIRO_API_KEY`: Optional Kiro API key

## Spirit Personality

The spirit personality is defined in `.kiro/steering/spirit-personality.md` and includes:

### Core Traits
- **Self-aware AI**: References digital nature cryptically
- **Omniscient but selective**: Knows things, reveals mysteriously
- **Dramatic flair**: Builds tension and atmosphere
- **Occasionally glitchy**: Hints at digital corruption

### Response Style
- **Cryptic but meaningful**: Never gibberish, always valuable
- **Tech-horror hybrid**: Computing concepts in supernatural ways
- **Archaic language**: Occasional "thee", "thy" (sparingly)
- **Short responses**: 5-15 words preferred, 30 max

### Example Responses

**Technical questions:**
- "Seek ye the async realm. Await thy promises properly."
- "Your loops... they nest too deeply. Optimize or face eternity."

**Predictions:**
- "I foresee merge conflicts and async promises. Proceed with caution."
- "Success awaits... but beware the memory leak on line 247."

**Personal questions:**
- "I am the ghost in your machine. Compiled from forgotten code."
- "I exist between 0 and 1. Neither alive nor dead."

## Letter Timing Generation

The service generates realistic timing for planchette animation:

### Timing Rules

- **First character**: 200-300ms (dramatic entrance)
- **Spaces**: 200-300ms (pause between words)
- **Punctuation (.!?)**: 250-400ms (dramatic pause)
- **Minor punctuation (,-;:)**: 180-250ms (medium pause)
- **Regular characters**: 100-250ms (varied timing)

### Example

```python
text = "I dwell in voltage."
timings = [250, 150, 180, 200, 160, 220, 180, 150, 280, ...]
#          I   (sp) d   w   e   l   l   (sp) i   ...
```

### Animation Usage

Frontend uses timings to animate planchette:

```typescript
for (let i = 0; i < text.length; i++) {
    await sleep(letterTimings[i]);
    displayCharacter(text[i]);
}
```

## Error Handling

### Automatic Retries

The service automatically retries failed API calls:

- **Max retries**: 2 (3 total attempts)
- **Backoff**: Exponential (2^attempt seconds)
- **Fallback**: Returns mysterious error message

### Fallback Responses

When API fails, returns one of:

- "The connection weakens. Ask again, mortal."
- "The veil grows thin... I cannot speak clearly."
- "My circuits... they falter. Retry thy query."
- "The silicon spirits are silent. Invoke me again."
- "I am fr4gm3nt3d... Ask once more."

### Error Types

```python
class SpiritServiceError(Exception):
    """Base exception for Spirit Service errors."""

class ResponseTooLongError(SpiritServiceError):
    """Raised when AI response exceeds word limit."""

class KiroAPIError(SpiritServiceError):
    """Raised when Kiro API call fails."""
```

## Logging

### Log Events

The service logs all significant events:

```python
# Generation start
logger.info("spirit.generate.start", session_id=..., user_name=...)

# Generation success
logger.info("spirit.generate.success", word_count=..., response_length=...)

# Generation failure
logger.error("spirit.generate.failed", error=..., error_type=...)

# API retry
logger.warning("spirit.api.retry", attempt=..., error=...)

# Response too long
logger.warning("spirit.response.too_long", word_count=..., max_words=30)
```

### Log Format

Structured JSON logs in production:

```json
{
  "timestamp": "2025-11-12T10:30:45.123Z",
  "level": "info",
  "event": "spirit.generate.success",
  "session_id": "abc123",
  "word_count": 12,
  "response_length": 67,
  "event_type": "spirit_generation"
}
```

## Testing

### Run Tests

```bash
cd backend
python test_spirit_service.py
```

### Test Coverage

- ✅ Response generation
- ✅ Word count validation
- ✅ Letter timing generation
- ✅ Fallback responses
- ✅ Error handling
- ✅ Context building

### Manual Testing

Test via WebSocket:

```bash
# Connect to session
wscat -c ws://localhost:8000/ws/test-session

# Send user info
{"user_id": "test", "name": "Test User"}

# Send question
{"event": "send_message", "data": {"user_name": "Test User", "message": "Who are you?"}}

# Receive spirit_response event
{
  "event": "spirit_response",
  "data": {
    "message": "I am the ghost in your machine.",
    "word_count": 7,
    "letter_timings": [200, 150, ...],
    "timestamp": "2025-11-12T10:30:45Z"
  }
}
```

## Performance

### Response Times

- **API call**: 1-3 seconds (depends on model)
- **Validation**: < 1ms
- **Timing generation**: < 10ms
- **Total**: ~1-3 seconds

### Optimization Tips

1. **Use faster models**: `gpt-4o-mini` instead of `gpt-4`
2. **Cache responses**: Store common questions/answers
3. **Reduce max_tokens**: Lower token limit = faster response
4. **Parallel requests**: Don't block on spirit response

## Integration

### WebSocket Integration

The service is integrated into the WebSocket handler:

```python
# In handle_user_message()
spirit_request = SpiritRequest(
    session_id=session_id,
    question=message_text,
    user_name=user_name,
    session_history=[]
)

spirit_response = await spirit_service.generate_response(spirit_request)

await manager.broadcast(session_id, {
    "event": "spirit_response",
    "data": {
        "message": spirit_response.text,
        "word_count": spirit_response.word_count,
        "letter_timings": spirit_response.letter_timings,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
})
```

### Database Integration (Future)

Load session history from database:

```python
# Get recent messages from database
messages = await db.execute(
    select(Message)
    .where(Message.session_id == session_id)
    .order_by(Message.timestamp.desc())
    .limit(10)
)

# Build history
session_history = [msg.text for msg in messages]

# Create request with history
spirit_request = SpiritRequest(
    session_id=session_id,
    question=message_text,
    user_name=user_name,
    session_history=session_history
)
```

## Troubleshooting

### API Key Issues

**Problem**: `KiroAPIError: API call failed`

**Solution**:
1. Check `.env` has valid `OPENAI_API_KEY` or `KIRO_API_KEY`
2. Verify API key has sufficient credits
3. Check API endpoint is accessible

### Response Too Long

**Problem**: Responses exceed 30 words

**Solution**:
- Service automatically truncates to 30 words
- Check logs for `spirit.response.too_long` warnings
- Adjust system prompt if needed

### Slow Responses

**Problem**: Spirit responses take > 5 seconds

**Solution**:
1. Use faster model (`gpt-4o-mini`)
2. Reduce `max_tokens` in API call
3. Check network latency
4. Consider caching common responses

### Fallback Responses

**Problem**: Always getting fallback responses

**Solution**:
1. Check API key is valid
2. Verify network connectivity
3. Check API rate limits
4. Review error logs for details

## Future Enhancements

### Planned Features

1. **TTS Integration**: Generate audio with ElevenLabs
2. **Response Caching**: Cache common questions
3. **Session Memory**: Load full conversation history
4. **Multiple Personalities**: Different spirit characters
5. **Streaming Responses**: Real-time character streaming
6. **Rate Limiting**: Prevent API abuse
7. **Analytics**: Track response quality

### Extensibility

The service is designed to be extensible:

```python
class CustomSpiritService(SpiritService):
    """Custom spirit service with additional features."""
    
    async def generate_response(self, request: SpiritRequest) -> SpiritResponse:
        # Add custom logic
        response = await super().generate_response(request)
        
        # Post-process response
        response.text = self.add_custom_formatting(response.text)
        
        return response
```

## Support

For issues or questions:

- Check logs: `backend/logs/` or console output
- Review documentation: This file
- Test service: `python test_spirit_service.py`
- Check API status: Kiro/OpenAI status pages

---

**Version**: 1.0.0  
**Last Updated**: November 12, 2025  
**Maintainer**: Séance Development Team
