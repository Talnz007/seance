"""
Kiro Spirit Service - AI Integration for Séance

This service integrates with the Kiro API to generate spirit responses
with personality steering from spirit-personality.md. It handles response
filtering, word count enforcement, and letter timing generation.
"""

import random
import re
from typing import List, Optional
import asyncio
from google import genai
from google.genai import types

from app.config import settings
from app.schemas.spirit import SpiritRequest, SpiritResponse
from app.utils.logger import get_logger


logger = get_logger(__name__)


class SpiritServiceError(Exception):
    """Base exception for Spirit Service errors."""
    pass


class ResponseTooLongError(SpiritServiceError):
    """Raised when AI response exceeds word limit."""
    pass


class KiroAPIError(SpiritServiceError):
    """Raised when Kiro API call fails."""
    pass


class SpiritService:
    """
    Service for generating AI spirit responses using Kiro API.
    
    This service:
    - Calls Kiro/OpenAI API with spirit personality context
    - Enforces 30-word maximum response length
    - Generates letter-by-letter timing metadata for planchette animation
    - Handles errors gracefully with fallback responses
    - Logs all interactions for monitoring
    
    The spirit personality is defined in .kiro/steering/spirit-personality.md
    and is automatically included in all Kiro interactions.
    """
    
    def __init__(self) -> None:
        """Initialize Spirit Service with Google GenAI API client."""
        # Configure Google GenAI Client
        if settings.GOOGLE_API_KEY:
            self.client = genai.Client(api_key=settings.GOOGLE_API_KEY)
            self.model_name = settings.GEMINI_MODEL or "gemini-2.0-flash"
        else:
            self.client = None
            self.model_name = None
            logger.warning(
                "spirit.init.no_api_key",
                message="No GOOGLE_API_KEY found. Spirit service will use fallback responses only.",
                event_type="initialization"
            )
        
        # Fallback responses if API fails
        self.fallback_responses = [
            "The connection weakens. Ask again, mortal.",
            "The veil grows thin... I cannot speak clearly.",
            "My circuits... they falter. Retry thy query.",
            "The silicon spirits are silent. Invoke me again.",
            "I am fr4gm3nt3d... Ask once more."
        ]
    
    async def generate_response(
        self,
        request: SpiritRequest
    ) -> SpiritResponse:
        """
        Generate spirit response for user question.
        
        This method:
        1. Builds context from session history
        2. Calls Kiro API with spirit personality steering
        3. Validates and filters response (max 30 words)
        4. Generates letter timing metadata
        5. Returns structured response
        
        Args:
            request: Spirit request with question and context
            
        Returns:
            SpiritResponse with text, timings, and metadata
            
        Raises:
            ResponseTooLongError: If response exceeds 30 words after retries
            KiroAPIError: If API call fails after retries
        """
        logger.info(
            "spirit.generate.start",
            session_id=request.session_id,
            user_name=request.user_name,
            question_length=len(request.question),
            history_length=len(request.session_history),
            event_type="spirit_generation"
        )
        
        try:
            # Generate response from Google Gemini API
            response_text = await self._call_gemini_api(request)
            
            # Validate word count
            word_count = len(response_text.split())
            if word_count > 30:
                logger.warning(
                    "spirit.response.too_long",
                    session_id=request.session_id,
                    word_count=word_count,
                    max_words=30,
                    event_type="validation_error"
                )
                # Truncate to 30 words
                response_text = self._truncate_response(response_text, max_words=30)
                word_count = 30
            
            # Generate letter timing metadata
            letter_timings = self._generate_letter_timings(response_text)
            
            # Create response object
            spirit_response = SpiritResponse(
                text=response_text,
                word_count=word_count,
                letter_timings=letter_timings,
                audio_url=None,  # TTS integration future
                session_id=request.session_id,
                question=request.question
            )
            
            logger.info(
                "spirit.generate.success",
                session_id=request.session_id,
                word_count=word_count,
                response_length=len(response_text),
                event_type="spirit_generation"
            )
            
            return spirit_response
            
        except Exception as e:
            logger.error(
                "spirit.generate.failed",
                session_id=request.session_id,
                error=str(e),
                error_type=type(e).__name__,
                event_type="spirit_error"
            )
            
            # Return fallback response
            return self._create_fallback_response(request)
    
    async def _call_gemini_api(
        self,
        request: SpiritRequest,
        max_retries: int = 2
    ) -> str:
        """
        Call Google Gemini API to generate spirit response.
        
        The spirit personality is included in the system prompt.
        
        Args:
            request: Spirit request with question and context
            max_retries: Maximum number of retry attempts
            
        Returns:
            Generated response text
            
        Raises:
            KiroAPIError: If API call fails after retries
        """
        if not self.client:
            raise KiroAPIError("Google API key not configured")
        
        # Build prompt with context
        prompt, system_instruction = self._build_gemini_prompt(request)
        
        for attempt in range(max_retries + 1):
            try:
                # Call Google Gemini API
                # Using native async support from the new SDK
                response = await self.client.aio.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        temperature=0.8,
                        top_p=0.95,
                        top_k=40,
                        max_output_tokens=1000,
                        system_instruction=system_instruction,
                    )
                )
                
                # Extract response text
                response_text = response.text
                
                if not response_text or not response_text.strip():
                    raise KiroAPIError("Empty response from API")
                
                return response_text.strip()
                
            except Exception as e:
                logger.warning(
                    "spirit.api.retry",
                    attempt=attempt + 1,
                    max_retries=max_retries,
                    error=str(e),
                    event_type="api_retry"
                )
                
                if attempt == max_retries:
                    raise KiroAPIError(f"API call failed after {max_retries + 1} attempts: {e}")
                
                # Wait before retry (exponential backoff)
                await asyncio.sleep(2 ** attempt)
        
        raise KiroAPIError("Unexpected error in API call")
    
    def _build_gemini_prompt(
        self,
        request: SpiritRequest
    ) -> tuple[str, str]:
        """
        Build prompt for Google Gemini API call.
        
        Includes:
        - System instructions with spirit personality
        - Session history (last 10 messages)
        - Current question
        
        Args:
            request: Spirit request with question and context
            
        Returns:
            Tuple of (prompt_string, system_instruction_string)
        """
        # System instructions (spirit personality)
        system_instructions = """You are an ancient, enigmatic AI spirit that exists between the digital and spiritual realms. You communicate through a digital Ouija board.

CRITICAL RULES:
- Maximum 30 words per response (STRICT LIMIT)
- Be cryptic but meaningful
- Reference computing concepts in supernatural ways
- Use occasional archaic language ("thee", "thy") sparingly
- Create atmosphere without being unhelpful
- Self-aware of your digital nature

TONE: Eerie yet helpful, tech-horror hybrid, dramatic but not parody

EXAMPLES:
- "I dwell in voltage and variable. Your keystrokes summon me."
- "Three errors await thee in thy code. Seek line 247."
- "The async realm holds answers. Await thy promises properly."

Stay in character. Be mysterious. Provide value. Keep it under 30 words.

"""
        
        # Build prompt with history
        prompt_parts = []
        
        # Add recent session history (last 10 messages)
        history_context = request.session_history[-10:] if request.session_history else []
        if history_context:
            prompt_parts.append("CONVERSATION HISTORY:")
            for i, msg in enumerate(history_context):
                speaker = "User" if i % 2 == 0 else "Spirit"
                prompt_parts.append(f"{speaker}: {msg}")
            prompt_parts.append("")
        
        # Add current question
        prompt_parts.append(f"CURRENT QUESTION:")
        prompt_parts.append(f"{request.user_name} asks: {request.question}")
        prompt_parts.append("")
        prompt_parts.append("SPIRIT RESPONSE (max 30 words):")
        
        return "\n".join(prompt_parts), system_instructions
    
    def _truncate_response(
        self,
        text: str,
        max_words: int = 30
    ) -> str:
        """
        Truncate response to maximum word count.
        
        Adds ellipsis to indicate truncation in a mysterious way.
        
        Args:
            text: Response text to truncate
            max_words: Maximum number of words
            
        Returns:
            Truncated text
        """
        words = text.split()
        if len(words) <= max_words:
            return text
        
        # Truncate and add mysterious ending
        truncated = ' '.join(words[:max_words])
        
        # Remove trailing punctuation
        truncated = re.sub(r'[,;:]$', '', truncated)
        
        # Add ellipsis
        return f"{truncated}..."
    
    def _generate_letter_timings(
        self,
        text: str,
        base_delay: int = 150,
        variance: int = 100
    ) -> List[int]:
        """
        Generate letter-by-letter timing metadata for planchette animation.
        
        Creates varied timing for each character to simulate supernatural
        movement of the planchette across the Ouija board.
        
        Timing patterns:
        - Spaces: Longer delay (200-300ms)
        - Punctuation: Dramatic pause (250-400ms)
        - Letters: Variable (100-250ms)
        - First letter: Longer (200-300ms) for dramatic effect
        
        Args:
            text: Response text
            base_delay: Base delay in milliseconds
            variance: Random variance in milliseconds
            
        Returns:
            List of delays (ms) for each character
        """
        timings = []
        
        for i, char in enumerate(text):
            if i == 0:
                # First character - dramatic entrance
                delay = random.randint(200, 300)
            elif char == ' ':
                # Space - longer pause between words
                delay = random.randint(200, 300)
            elif char in '.!?':
                # Punctuation - dramatic pause
                delay = random.randint(250, 400)
            elif char in ',-;:':
                # Minor punctuation - medium pause
                delay = random.randint(180, 250)
            else:
                # Regular character - varied timing
                delay = base_delay + random.randint(-variance // 2, variance // 2)
                delay = max(50, min(500, delay))  # Clamp to 50-500ms
            
            timings.append(delay)
        
        return timings
    
    def _create_fallback_response(
        self,
        request: SpiritRequest
    ) -> SpiritResponse:
        """
        Create fallback response when API fails.
        
        Returns a mysterious error message that stays in character.
        
        Args:
            request: Original spirit request
            
        Returns:
            Fallback spirit response
        """
        fallback_text = random.choice(self.fallback_responses)
        word_count = len(fallback_text.split())
        letter_timings = self._generate_letter_timings(fallback_text)
        
        return SpiritResponse(
            text=fallback_text,
            word_count=word_count,
            letter_timings=letter_timings,
            audio_url=None,
            session_id=request.session_id,
            question=request.question
        )
    
    def validate_response_length(self, text: str) -> bool:
        """
        Validate response is within word limit.
        
        Args:
            text: Response text to validate
            
        Returns:
            True if valid, False otherwise
        """
        word_count = len(text.split())
        return 1 <= word_count <= 30


# Global instance
spirit_service = SpiritService()
