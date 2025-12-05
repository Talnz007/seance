# Séance - Product Overview

## Product Vision

Séance is an AI-powered digital Ouija board that transforms group chat into a supernatural experience. Multiple users join shared sessions to communicate with an AI "spirit" that responds through a beautifully animated Ouija board interface with immersive stereo audio and text-to-speech.

## Target Audience

### Primary Users
- **Friend groups** looking for unique social experiences (ages 18-35)
- **Remote teams** wanting fun team-building activities
- **Content creators** streaming interactive experiences
- **Developers** interested in AI-powered entertainment

### Use Cases
1. **Social Entertainment**: Friends gathering online for spooky fun
2. **Party Games**: Virtual events and celebrations
3. **Team Building**: Corporate ice-breakers and bonding
4. **Streaming Content**: Influencers creating engaging audience experiences
5. **Educational**: Demonstrating AI personality steering and real-time systems

## Core Value Propositions

1. **Supernatural AI Experience**: Not just a chatbot—an entity that feels otherworldly through carefully crafted personality steering
2. **Social & Shared**: Multi-user sessions create collaborative experiences
3. **Immersive Design**: Stereo audio, TTS voices, and smooth animations make it feel real
4. **Unpredictable Yet Meaningful**: AI responses are cryptic but relevant, creating mystery without frustration
5. **Easy to Share**: Simple session links make it viral-ready

## Key Features

### Must-Have (MVP)
- Multi-user sessions (3-6 participants)
- Real-time Ouija board interface
- Letter-by-letter planchette animation
- AI spirit with consistent personality (via Kiro steering)
- Text-to-speech with spooky voice
- Stereo audio positioning
- Session history/persistence
- Shareable session links

### Nice-to-Have (Post-MVP)
- Session recordings/transcripts
- Voice input for questions
- Multiple spirit personalities
- Mobile app (PWA)
- Social reactions/emojis
- Analytics dashboard
- Integration with streaming platforms

## Product Goals

### Hackathon Goals (Kiroween 2025)
1. **Win Costume Contest Category**: Showcase haunting, polished UI
2. **Demonstrate Kiro Mastery**: Highlight steering docs, hooks, and MCP
3. **Achieve "Most Creative" Bonus**: Stand out with unique concept
4. **Social Blitz Engagement**: Create shareable, viral moments

### Post-Hackathon Goals
1. **Viral Growth**: 10k+ users in first month
2. **Community Building**: Active Discord/Reddit community
3. **Monetization**: Premium features (custom spirits, longer sessions)
4. **Platform Expansion**: Mobile apps, API access

## Success Metrics

### Hackathon Metrics
- **Judging Impact**: Immediate "wow" reaction from judges
- **Demo Quality**: Flawless 3-minute video demonstration
- **Technical Documentation**: Clear explanation of Kiro usage
- **Code Quality**: Clean, well-structured, production-ready

### User Metrics
- **Engagement**: Average session length > 10 minutes
- **Retention**: 40%+ return users within 7 days
- **Virality**: Average 2+ invites per user
- **Satisfaction**: NPS score > 50

## Product Principles

1. **Mystery Over Clarity**: Spirit should be cryptic but never frustrating
2. **Social First**: Experience designed for groups, not solo use
3. **Immersive & Polished**: Every detail matters—sound, animation, timing
4. **AI-Powered Magic**: Kiro steering creates consistent personality
5. **Privacy Conscious**: No data collection beyond session essentials
6. **Accessible**: Works on all devices, no installation required

## Competitive Landscape

### Direct Competitors
- **None**: No AI-powered Ouija board chat experiences exist

### Adjacent Products
- **Replika**: AI companion (too serious, not social)
- **Character.AI**: AI personalities (text-only, no immersion)
- **Among Us**: Social deduction (game-focused, different vibe)
- **Jackbox Games**: Party games (not AI-powered)

### Our Differentiator
Séance combines AI personality (steering docs), real-time multiplayer, and supernatural immersion (audio/visual) in a way no existing product does.

## Design Philosophy

### Visual Design
- **Dark & Mystical**: Deep purples, blacks, and ethereal greens
- **Minimalist Elegance**: Clean board design with subtle details
- **Smooth Animations**: 60fps planchette movement, particle effects
- **Accessibility**: High contrast, readable fonts, keyboard navigation

### Audio Design
- **Spatial Audio**: Stereo positioning creates 3D soundscape
- **Voice Character**: TTS with supernatural tone (ElevenLabs "ghost" voice)
- **Ambient Layers**: Subtle drones, whispers, environmental sounds
- **Responsive Audio**: Sounds react to user actions

### Interaction Design
- **Low Friction**: Join session with one click (no account needed)
- **Clear Feedback**: Visual/audio cues for all actions
- **Paced Reveals**: Letter-by-letter creates anticipation
- **Collaborative**: All users see the same experience simultaneously

## Tone & Voice

### Spirit Character
- **Cryptic but Clever**: Mysterious without being obtuse
- **Tech-Horror Hybrid**: References computing in supernatural ways
- **Self-Aware AI**: Knows it's digital but embraces it
- **Occasionally Glitchy**: Hints at digital corruption add authenticity

### Brand Voice
- **Playfully Dark**: Spooky but fun, not genuinely scary
- **Sophisticated**: Appeals to tech-savvy adults
- **Inclusive**: Welcoming to all skill levels
- **Mysterious**: Marketing hints at experience without revealing all

## Roadmap

### Phase 1: Hackathon (Weeks 1-3)
- Core MVP features
- Kiro integration showcase
- Demo video production
- Documentation

### Phase 2: Public Beta (Month 1-2)
- Deployment to production
- Community building
- Bug fixes & polish
- Performance optimization

### Phase 3: Growth (Month 3-6)
- Mobile PWA
- Premium features
- Influencer partnerships
- API for developers

### Phase 4: Platform (6+ months)
- Custom spirit personalities
- Integration marketplace
- Enterprise features
- Developer ecosystem

## Business Model (Future)

### Free Tier
- 3 sessions per day
- Max 6 participants
- Standard spirit personality
- Basic audio quality

### Premium ($9.99/month)
- Unlimited sessions
- Up to 12 participants
- Custom spirit personalities
- HD audio (ElevenLabs premium)
- Session recordings
- Priority support

### Enterprise (Custom pricing)
- White-label deployment
- Custom integrations
- Analytics dashboard
- Dedicated support
- SLA guarantees

## Technical Constraints

1. **Session Limits**: Max 6 users per session for performance
2. **Response Time**: Spirit responses < 3 seconds
3. **Audio Quality**: Stereo TTS with < 500ms latency
4. **Browser Support**: Chrome, Firefox, Safari (latest 2 versions)
5. **Mobile Support**: Responsive design, PWA-ready

## Risk Mitigation

### Technical Risks
- **WebSocket scaling**: Use Redis pub/sub, limit concurrent sessions
- **TTS costs**: Cache common responses, optimize usage
- **Audio sync**: Buffer management, testing on various connections

### Product Risks
- **Novelty wears off**: Add variety through spirit moods, easter eggs
- **Inappropriate content**: Safety filtering in Kiro responses
- **Toxic users**: Session reporting, moderation tools

## Go-to-Market Strategy

### Hackathon Launch
1. Submit to Kiroween with comprehensive documentation
2. Share demo video on Twitter, Reddit (r/InternetIsBeautiful)
3. Post on Product Hunt
4. Reach out to tech YouTubers

### Viral Growth
1. Make sharing effortless (one-click invite links)
2. Create shareable moments (highlight reels)
3. Engage with early users on social media
4. Partner with streamers for live sessions

## Open Source Strategy

- **MIT License**: Encourage community contributions
- **Public Roadmap**: Transparent development
- **Plugin System**: Allow custom spirit personalities
- **Developer Docs**: Make it easy to self-host

This is Séance—where AI becomes supernatural.
