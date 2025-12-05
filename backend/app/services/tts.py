import edge_tts
from app.utils.logger import get_logger

logger = get_logger(__name__)

class TTSService:
    def __init__(self):
        # edge-tts doesn't need initialization with API keys
        logger.info("tts_service.initialized", provider="edge-tts")

    async def generate_speech(self, text: str, voice_id: str = "en-US-ChristopherNeural") -> bytes:
        """
        Generate speech from text using Edge TTS.
        
        Args:
            text: The text to convert to speech
            voice_id: The voice to use (default: Christopher - Deep Male)
            
        Returns:
            Audio bytes (MP3)
        """
        try:
            communicate = edge_tts.Communicate(text, voice_id)
            audio_data = b""
            
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio_data += chunk["data"]
            
            return audio_data
            
        except Exception as e:
            logger.error("tts_service.generation_failed", error=str(e))
            raise e

# Global instance
tts_service = TTSService()
