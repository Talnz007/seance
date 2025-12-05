# Google Gemini API Setup Guide

## Why Google Gemini?

✅ **FREE** - No credit card required  
✅ **Generous quotas** - 15 requests per minute, 1500 per day (free tier)  
✅ **Fast responses** - gemini-1.5-flash is optimized for speed  
✅ **High quality** - gemini-1.5-pro for better responses  
✅ **Easy setup** - Get API key in 2 minutes  

## Step 1: Get Your Free API Key

1. **Visit Google AI Studio**:
   - Go to: https://ai.google.dev/gemini-api/docs/api-key
   - Or directly: https://aistudio.google.com/app/apikey

2. **Sign in with Google Account**:
   - Use any Google account (Gmail, etc.)
   - No credit card required

3. **Create API Key**:
   - Click "Get API key" or "Create API key"
   - Select "Create API key in new project" (or use existing)
   - Copy the generated API key

4. **Save Your Key**:
   - Keep it secure
   - Don't commit to Git
   - Add to `.env` file

## Step 2: Configure Séance Backend

1. **Add to `.env` file**:
   ```bash
   # In backend/.env
   GOOGLE_API_KEY=AIzaSy...your_actual_key_here
   GEMINI_MODEL=gemini-1.5-flash
   ```

2. **Choose Your Model**:
   
   **gemini-1.5-flash** (Recommended):
   - Fastest responses (~1-2 seconds)
   - Good quality
   - Best for real-time chat
   - FREE tier: 15 RPM, 1500 RPD
   
   **gemini-1.5-pro**:
   - Better quality responses
   - Slightly slower (~2-3 seconds)
   - More nuanced understanding
   - FREE tier: 2 RPM, 50 RPD

3. **Install Dependencies**:
   ```bash
   cd backend
   pip install google-generativeai==0.8.3
   ```

## Step 3: Test the Integration

1. **Test the Spirit Service**:
   ```bash
   cd backend
   python test_spirit_service.py
   ```

2. **Test via WebSocket**:
   ```bash
   # Start backend
   uvicorn app.main:app --reload
   
   # In another terminal
   python test_websocket.py
   ```

3. **Expected Output**:
   ```
   🔮 Spirit says: "I dwell in voltage and variable."
   📊 Word count: 6/30
   ✅ All tests passed!
   ```

## API Quotas & Limits

### Free Tier (No Credit Card)

**gemini-1.5-flash**:
- 15 requests per minute
- 1,500 requests per day
- 1 million tokens per minute

**gemini-1.5-pro**:
- 2 requests per minute
- 50 requests per day
- 32,000 tokens per minute

### For Séance Usage

With **gemini-1.5-flash**:
- ~900 spirit responses per hour (15 RPM)
- ~1,500 responses per day
- Perfect for development and small deployments

**Recommendation**: Start with gemini-1.5-flash. Upgrade to paid tier only if you exceed limits.

## Troubleshooting

### Issue: "API key not valid"

**Solution**:
1. Check you copied the full API key
2. Verify key is enabled in Google Cloud Console
3. Make sure Gemini API is enabled for your project

### Issue: "Quota exceeded"

**Solution**:
1. Check your usage: https://aistudio.google.com/app/apikey
2. Wait for quota reset (per minute or per day)
3. Consider upgrading to paid tier if needed
4. Use caching to reduce API calls

### Issue: "Module not found: google.generativeai"

**Solution**:
```bash
pip install google-generativeai==0.8.3
```

### Issue: Slow responses

**Solution**:
1. Use `gemini-1.5-flash` instead of `gemini-1.5-pro`
2. Check your internet connection
3. Reduce `max_output_tokens` in config

## API Documentation

**Official Docs**: https://ai.google.dev/gemini-api/docs

**Key Resources**:
- API Key Setup: https://ai.google.dev/gemini-api/docs/api-key
- Python Quickstart: https://ai.google.dev/gemini-api/docs/get-started/python
- Model Comparison: https://ai.google.dev/gemini-api/docs/models/gemini
- Pricing: https://ai.google.dev/pricing

## Example API Usage

### Basic Usage

```python
import google.generativeai as genai

# Configure API
genai.configure(api_key="YOUR_API_KEY")

# Create model
model = genai.GenerativeModel('gemini-1.5-flash')

# Generate response
response = model.generate_content("Who are you?")
print(response.text)
```

### With Configuration

```python
model = genai.GenerativeModel(
    model_name='gemini-1.5-flash',
    generation_config={
        'temperature': 0.8,
        'top_p': 0.95,
        'top_k': 40,
        'max_output_tokens': 100,
    }
)

response = model.generate_content("Tell me a spooky story")
print(response.text)
```

## Security Best Practices

1. **Never commit API keys to Git**:
   ```bash
   # Add to .gitignore
   .env
   .env.local
   ```

2. **Use environment variables**:
   ```python
   import os
   api_key = os.getenv('GOOGLE_API_KEY')
   ```

3. **Restrict API key** (optional):
   - Go to Google Cloud Console
   - Restrict key to specific APIs
   - Restrict to specific IP addresses

4. **Rotate keys regularly**:
   - Generate new key every few months
   - Delete old keys

## Cost Comparison

| Provider | Free Tier | Paid Tier |
|----------|-----------|-----------|
| **Google Gemini** | ✅ 1,500 req/day | $0.00015/1K chars |
| OpenAI GPT-4 | ❌ None | $0.03/1K tokens |
| OpenAI GPT-3.5 | ❌ None | $0.002/1K tokens |
| Anthropic Claude | ❌ None | $0.008/1K tokens |

**Winner**: Google Gemini - FREE with generous quotas! 🎉

## Upgrading to Paid Tier

If you need more quota:

1. **Enable billing** in Google Cloud Console
2. **Pricing** (as of Nov 2024):
   - gemini-1.5-flash: $0.00015 per 1K characters
   - gemini-1.5-pro: $0.0035 per 1K characters
3. **Pay-as-you-go**: Only pay for what you use
4. **No minimum**: Start with $0

**Example cost**:
- 10,000 spirit responses/day
- Average 50 characters per response
- Total: 500K characters/day
- Cost: $0.075/day = **$2.25/month**

## Support

**Issues?**
- Check logs: `backend/logs/` or console
- Review docs: https://ai.google.dev/gemini-api/docs
- Test API key: Run `test_spirit_service.py`
- Check quotas: https://aistudio.google.com/app/apikey

**Questions?**
- Google AI Forum: https://discuss.ai.google.dev/
- Stack Overflow: Tag `google-gemini`
- GitHub Issues: Séance repository

---

**Last Updated**: November 12, 2025  
**Gemini API Version**: 0.8.3  
**Free Tier**: Available
