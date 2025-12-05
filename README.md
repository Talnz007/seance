# 🔮 Séance - AI-Powered Digital Ouija Board

<div align="center">

![Séance Banner](https://img.shields.io/badge/🎃-Kiroween_2025-orange?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.121-009688?style=for-the-badge&logo=fastapi)

**Summon an AI spirit with friends through a hauntingly beautiful digital Ouija board.**

[Live Demo](https://your-app.vercel.app) • [Demo Video](https://youtube.com/watch?v=xxx) • [Report Bug](https://github.com/Talnz007/seance/issues)

</div>

---

## 👻 What is Séance?

Séance is a real-time multiplayer Ouija board experience where an AI "spirit" responds to your questions. Multiple users can join a session, watch the planchette move letter-by-letter across the board, and hear the spirit speak through eerie text-to-speech.

### ✨ Features

- 🎭 **Multi-user sessions** - Gather friends for a virtual séance
- 🔮 **Animated planchette** - Smooth letter-by-letter reveals
- 🗣️ **AI Spirit voice** - Microsoft Neural TTS with spooky effects
- 🎵 **Immersive audio** - Stereo spatial audio and ambient sounds
- 🌙 **Haunting UI** - Dark theme with candle-lit atmosphere
- ⚡ **Real-time sync** - WebSocket-powered instant updates

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.10+
- PostgreSQL (or Supabase)
- Google Gemini API key (free)

### Installation

```bash
# Clone the repo
git clone https://github.com/Talnz007/seance.git
cd seance

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
cp .env.example .env  # Edit with your values
alembic upgrade head
uvicorn app.main:app --reload

# Frontend setup (new terminal)
cd frontend
npm install
cp .env.example .env.local  # Edit with your values
npm run dev
```

Visit `http://localhost:3000` to start your séance! 🔮

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 18, Tailwind CSS, Framer Motion |
| Backend | FastAPI, SQLAlchemy, Alembic, WebSockets |
| Database | PostgreSQL (Supabase) |
| AI | Google Gemini 2.0 Flash |
| Audio | Edge TTS, Howler.js, Web Audio API |
| Deployment | Vercel (Frontend), Heroku (Backend) |

---

## 🤖 How We Used Kiro

This project was built for the **Kiroween 2025 Hackathon**, showcasing Kiro's AI-powered development capabilities.

### 🎨 Vibe Coding

We used natural language conversations with Kiro to build core features:

```
"Build a FastAPI WebSocket manager that handles multiple session rooms,
broadcasts messages to all participants, and tracks user presence."

→ Kiro generated complete ConnectionManager class with all features
```

- WebSocket infrastructure built through conversation
- React components generated from high-level descriptions
- Audio system implemented from specs alone

### 📜 Steering Documents

Our `.kiro/steering/` directory contains 9 comprehensive docs:

| Document | Purpose |
|----------|---------|
| `spirit-personality.md` | 2000+ word AI character definition |
| `api-standards.md` | Consistent API patterns |
| `websocket-patterns.md` | Real-time communication specs |
| `audio-implementation.md` | TTS and spatial audio guide |
| `ui-components.md` | Design system and components |

The `spirit-personality.md` is always loaded, ensuring the AI spirit maintains a consistent, cryptic personality across all responses.

### 🪝 Agent Hooks

Automated workflows in `.kiro/hooks/`:

- **Pre-commit**: Auto code quality checks
- **On-save**: Auto-formatting with Prettier/Black
- **Response filter**: Spirit response enhancement

### 📋 Spec-Driven Development

Architecture defined before coding:
- `structure.md` defines project organization
- `tech.md` specifies technology choices
- `product.md` outlines features and user stories

### 🔌 MCP Integration

Model Context Protocol servers for:
- Session memory and context awareness
- User tracking for personalized responses
- Analytics for response quality metrics

---

## 🎬 Demo

[![Demo Video](https://img.youtube.com/vi/xxx/maxresdefault.jpg)](https://youtube.com/watch?v=xxx)

Watch our 3-minute demo showing:
1. Multi-user session creation
2. Spirit summoning experience
3. Planchette animation in action
4. Behind-the-scenes Kiro usage

---

## 📁 Project Structure

```
seance/
├── .kiro/                    # Kiro configuration
│   ├── steering/             # AI guidance docs (9 files)
│   ├── hooks/                # Automated workflows
│   └── specs/                # Feature specifications
├── backend/                  # FastAPI server
│   ├── app/
│   │   ├── api/              # REST + WebSocket endpoints
│   │   ├── models/           # SQLAlchemy models
│   │   ├── services/         # Business logic + AI
│   │   └── core/             # WebSocket manager
│   └── alembic/              # Database migrations
├── frontend/                 # Next.js app
│   ├── app/                  # Pages and layouts
│   ├── components/           # React components
│   │   └── ouija/            # Ouija board UI
│   └── lib/                  # Utilities + audio
└── docker-compose.yml        # Local development
```

---

## 🌐 Deployment

### Backend (Heroku)

```bash
cd backend
heroku create seance-api
heroku config:set DATABASE_URL="postgresql+asyncpg://..."
heroku config:set GOOGLE_API_KEY="your-key"
heroku config:set JWT_SECRET="your-secret"
git push heroku main
```

### Frontend (Vercel)

1. Connect GitHub repo to Vercel
2. Set root directory: `frontend`
3. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = `https://seance-api.herokuapp.com`

---

## 🔐 Environment Variables

See `.env.example` files in both `backend/` and `frontend/` directories.

---

## 🏆 Hackathon Categories

- **Primary**: Costume Contest (Haunting UI)
- **Bonus**: Most Creative, Best Startup Project

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 👥 Team

Built with 💀 by [Talnz007](https://github.com/Talnz007) for Kiroween 2025.

---

<div align="center">

**🔮 The spirits are waiting... Will you answer their call? 👻**

</div>
