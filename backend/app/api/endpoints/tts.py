from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import Response
from pydantic import BaseModel
from app.services.tts import tts_service
from app.utils.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)

class TTSRequest(BaseModel):
    text: str
    voice_id: str = "en-US-ChristopherNeural"  # Default Edge TTS voice

@router.post("/generate")
async def generate_speech(request: TTSRequest):
    """
    Generate speech from text.
    """
    try:
        # edge-tts service is async
        audio_bytes = await tts_service.generate_speech(request.text, request.voice_id)
        return Response(content=audio_bytes, media_type="audio/mpeg")
    except Exception as e:
        logger.error("api.tts.failed", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to generate speech")
