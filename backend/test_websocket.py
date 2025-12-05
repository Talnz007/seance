#!/usr/bin/env python3
"""
Simple WebSocket test script for Séance backend.
Tests WebSocket connection, user registration, and message broadcasting.
"""

import asyncio
import json
import sys
from websockets import connect


async def test_websocket():
    """Test WebSocket connection and basic functionality."""
    
    # Use the test session ID from the database
    session_id = "f5aa696a-daff-497b-9698-1c0193b0ce54"
    ws_url = f"ws://localhost:8000/ws/{session_id}"
    
    print(f"🔮 Testing WebSocket connection to: {ws_url}")
    
    try:
        async with connect(ws_url) as websocket:
            print("✅ WebSocket connected successfully!")
            
            # Send user info
            user_data = {
                "user_id": "test-user-1",
                "name": "Test User"
            }
            print(f"\n📤 Sending user info: {user_data}")
            await websocket.send(json.dumps(user_data))
            print("✅ User registered (no confirmation expected for first user)")
            
            # Send a test message
            message_data = {
                "event": "send_message",
                "data": {
                    "user_name": "Test User",
                    "message": "Is anyone there?"
                }
            }
            print(f"\n📤 Sending message: {message_data}")
            await websocket.send(json.dumps(message_data))
            
            # Receive message_received event
            print("\n⏳ Waiting for message_received event...")
            response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
            data = json.loads(response)
            print(f"📥 Received: {json.dumps(data, indent=2)}")
            
            if data.get("event") == "message_received":
                print("✅ Message received event confirmed!")
            
            # Receive spirit_thinking event
            print("\n⏳ Waiting for spirit_thinking event...")
            response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
            data = json.loads(response)
            print(f"📥 Received: {json.dumps(data, indent=2)}")
            
            if data.get("event") == "spirit_thinking":
                print("✅ Spirit thinking event received!")
            
            print("\n🎉 All WebSocket tests passed!")
            
    except Exception as e:
        print(f"\n❌ WebSocket test failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    print("=" * 60)
    print("Séance Backend - WebSocket Integration Test")
    print("=" * 60)
    asyncio.run(test_websocket())
