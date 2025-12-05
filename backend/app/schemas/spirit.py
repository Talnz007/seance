"""
Pydantic schemas for Spirit AI responses.

Defines data structures for spirit responses including text,
letter timing metadata, and audio information.
"""

from typing import List, Optional
from pydantic import BaseModel, Field, field_validator


class SpiritResponse(BaseModel):
    """
    Spirit response from AI with timing metadata.
    
    Attributes:
        text: The spirit's response text (max 30 words)
        word_count: Number of words in response
        letter_timings: Millisecond delays for each character (for planchette animation)
        audio_url: Optional URL to TTS audio file
        session_id: Session this response belongs to
        question: Original question asked
    """
    
    text: str = Field(..., description="Spirit response text")
    word_count: int = Field(..., ge=1, le=30, description="Number of words")
    letter_timings: List[int] = Field(
        ...,
        description="Millisecond delay for each character animation"
    )
    audio_url: Optional[str] = Field(
        None,
        description="URL to TTS audio file"
    )
    session_id: str = Field(..., description="Session ID")
    question: str = Field(..., description="Original question")
    
    @field_validator('text')
    @classmethod
    def validate_text_length(cls, v: str) -> str:
        """Validate response is not empty and within word limit."""
        if not v or not v.strip():
            raise ValueError("Response text cannot be empty")
        
        word_count = len(v.split())
        if word_count > 30:
            raise ValueError(f"Response exceeds 30 word limit (got {word_count} words)")
        
        return v.strip()
    
    @field_validator('letter_timings')
    @classmethod
    def validate_timings(cls, v: List[int], info) -> List[int]:
        """Validate letter timings match text length."""
        # Note: We can't access 'text' here in Pydantic v2, so we just validate the list
        if not v:
            raise ValueError("Letter timings cannot be empty")
        
        for timing in v:
            if timing < 50 or timing > 500:
                raise ValueError(f"Letter timing {timing}ms out of range (50-500ms)")
        
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "text": "I sense... disruption in your repository",
                "word_count": 6,
                "letter_timings": [150, 200, 180, 150, 200, 180],
                "audio_url": "https://cdn.example.com/spirit_response_123.mp3",
                "session_id": "abc123",
                "question": "Will my code work?"
            }
        }


class SpiritRequest(BaseModel):
    """
    Request to generate spirit response.
    
    Attributes:
        session_id: Session ID for context
        question: User's question to the spirit
        user_name: Name of user asking
        session_history: Previous messages in session (for context)
    """
    
    session_id: str = Field(..., description="Session ID")
    question: str = Field(
        ...,
        min_length=1,
        max_length=500,
        description="User's question"
    )
    user_name: str = Field(..., description="Name of user asking")
    session_history: List[str] = Field(
        default_factory=list,
        description="Previous messages for context"
    )
    
    @field_validator('question')
    @classmethod
    def validate_question(cls, v: str) -> str:
        """Validate question is not empty."""
        if not v or not v.strip():
            raise ValueError("Question cannot be empty")
        return v.strip()
    
    class Config:
        json_schema_extra = {
            "example": {
                "session_id": "abc123",
                "question": "Will my startup succeed?",
                "user_name": "Sarah",
                "session_history": [
                    "Who are you?",
                    "I am the ghost in your machine"
                ]
            }
        }
