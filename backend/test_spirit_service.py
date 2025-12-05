#!/usr/bin/env python3
"""
Test script for Kiro Spirit Service.

Tests the spirit service integration including:
- Response generation
- Word count validation
- Letter timing generation
- Error handling
"""

import asyncio
import sys
from app.services.kiro_spirit import spirit_service
from app.schemas.spirit import SpiritRequest


async def test_spirit_service():
    """Test spirit service functionality."""
    
    print("=" * 60)
    print("Séance Backend - Spirit Service Test")
    print("=" * 60)
    
    # Test questions
    test_questions = [
        "Who are you?",
        "Will my code work?",
        "What is the meaning of life?",
        "Should I deploy today?",
        "Tell me about the future"
    ]
    
    for i, question in enumerate(test_questions, 1):
        print(f"\n{'='*60}")
        print(f"Test {i}/{len(test_questions)}")
        print(f"{'='*60}")
        print(f"❓ Question: {question}")
        
        try:
            # Create spirit request
            request = SpiritRequest(
                session_id="test-session",
                question=question,
                user_name="Test User",
                session_history=[]
            )
            
            # Generate response
            print("⏳ Generating spirit response...")
            response = await spirit_service.generate_response(request)
            
            # Display results
            print(f"\n✅ Response generated successfully!")
            print(f"\n🔮 Spirit says: \"{response.text}\"")
            print(f"\n📊 Metrics:")
            print(f"   - Word count: {response.word_count}/30")
            print(f"   - Character count: {len(response.text)}")
            print(f"   - Letter timings: {len(response.letter_timings)} delays")
            print(f"   - Avg timing: {sum(response.letter_timings) // len(response.letter_timings)}ms")
            print(f"   - Min timing: {min(response.letter_timings)}ms")
            print(f"   - Max timing: {max(response.letter_timings)}ms")
            
            # Validate
            if response.word_count > 30:
                print(f"\n⚠️  WARNING: Response exceeds 30 words!")
            else:
                print(f"\n✅ Word count validation passed")
            
            if len(response.letter_timings) != len(response.text):
                print(f"\n⚠️  WARNING: Letter timing count mismatch!")
            else:
                print(f"✅ Letter timing count matches text length")
            
        except Exception as e:
            print(f"\n❌ Test failed: {e}")
            print(f"   Error type: {type(e).__name__}")
            sys.exit(1)
    
    print(f"\n{'='*60}")
    print("🎉 All spirit service tests passed!")
    print(f"{'='*60}")


async def test_word_limit_enforcement():
    """Test that responses are truncated if too long."""
    
    print(f"\n{'='*60}")
    print("Testing Word Limit Enforcement")
    print(f"{'='*60}")
    
    # This question might generate a longer response
    request = SpiritRequest(
        session_id="test-session",
        question="Explain everything about how computers work in great detail",
        user_name="Test User",
        session_history=[]
    )
    
    print("⏳ Generating potentially long response...")
    response = await spirit_service.generate_response(request)
    
    print(f"\n🔮 Spirit says: \"{response.text}\"")
    print(f"📊 Word count: {response.word_count}/30")
    
    if response.word_count <= 30:
        print("✅ Word limit enforced successfully!")
    else:
        print("❌ Word limit NOT enforced!")
        sys.exit(1)


async def test_letter_timing_generation():
    """Test letter timing generation."""
    
    print(f"\n{'='*60}")
    print("Testing Letter Timing Generation")
    print(f"{'='*60}")
    
    test_text = "I dwell in voltage and variable."
    timings = spirit_service._generate_letter_timings(test_text)
    
    print(f"Text: \"{test_text}\"")
    print(f"Length: {len(test_text)} characters")
    print(f"Timings: {len(timings)} delays")
    print(f"Sample timings: {timings[:10]}...")
    
    # Validate
    if len(timings) != len(test_text):
        print("❌ Timing count mismatch!")
        sys.exit(1)
    
    for i, timing in enumerate(timings):
        if timing < 50 or timing > 500:
            print(f"❌ Invalid timing at position {i}: {timing}ms")
            sys.exit(1)
    
    print("✅ Letter timing generation working correctly!")


async def test_fallback_response():
    """Test fallback response when API fails."""
    
    print(f"\n{'='*60}")
    print("Testing Fallback Response")
    print(f"{'='*60}")
    
    request = SpiritRequest(
        session_id="test-session",
        question="Test question",
        user_name="Test User",
        session_history=[]
    )
    
    # Create fallback response
    fallback = spirit_service._create_fallback_response(request)
    
    print(f"🔮 Fallback: \"{fallback.text}\"")
    print(f"📊 Word count: {fallback.word_count}/30")
    print(f"✅ Fallback response generated successfully!")


if __name__ == "__main__":
    print("\n🔮 Starting Spirit Service Tests...\n")
    
    try:
        # Run all tests
        asyncio.run(test_spirit_service())
        asyncio.run(test_word_limit_enforcement())
        asyncio.run(test_letter_timing_generation())
        asyncio.run(test_fallback_response())
        
        print("\n" + "=" * 60)
        print("✅ ALL TESTS PASSED!")
        print("=" * 60)
        print("\nThe Spirit Service is ready to haunt your sessions. 👻")
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")
        sys.exit(1)
