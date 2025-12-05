---
inclusion: manual
---

# Kiroween Hackathon Context

Reference this file with `#hackathon-context` when you need to check submission requirements or judging criteria.

## Hackathon Overview

**Name**: Kiroween 2025
**Theme**: Halloween-themed hackathon for AI-powered development
**Deadline**: December 6, 2025 @ 3:00 AM GMT+5
**Prize Pool**: $100,000 in cash prizes
**Our Category**: Costume Contest (haunting, polished UI)

## Our Project: Séance

**Tagline**: "AI-powered Ouija board where the spirit is Kiro"
**Category**: Costume Contest
**Bonus Categories**: Most Creative, Best Startup Project

## Submission Requirements

### What to Submit

1. **Code Repository URL**
   - ✅ Must be public
   - ✅ OSI-approved open source license (MIT chosen)
   - ✅ Must contain `.kiro/` directory at root
   - ⚠️ **CRITICAL**: `.kiro/` must NOT be in `.gitignore`

2. **Functional Application URL**
   - Live deployment (Vercel + Railway)
   - Login credentials in README if needed
   - Working demo ready at all times

3. **3-Minute Demo Video**
   - Upload to YouTube/Vimeo
   - Must be public
   - Judges may stop watching after 3 minutes
   - Show: problem → solution → tech → impact

4. **Category Selection**
   - Primary: Costume Contest
   - Bonus: Most Creative, Best Startup Project

5. **Kiro Usage Write-up**
   - Detailed explanation of how Kiro was used
   - Examples of vibe coding conversations
   - Steering docs strategy
   - Agent hooks implementation
   - MCP integration details

### Repository Structure Requirements

```
seance/
├── .kiro/                    # ⚠️ MUST be present and committed
│   ├── steering/
│   └── hooks/
├── README.md                 # Must explain Kiro usage
├── LICENSE                   # OSI-approved (MIT)
├── backend/
├── frontend/
└── demo-video-link.txt       # Link to video
```

## Judging Criteria

### 1. Potential Value (Weight: High)
**What judges look for:**
- How useful is this to real users?
- Is it easy to use and accessible?
- Does it solve a real problem or create value?
- Could this be widely adopted?

**Our strengths:**
- ✅ Social entertainment (clear use case)
- ✅ Easy to use (one-click join)
- ✅ Accessible (web-based, no install)
- ✅ Shareable (viral potential)

### 2. Implementation (Weight: Critical)
**What judges look for:**
- How effectively was Kiro leveraged?
- Quality of steering docs
- Use of agent hooks
- MCP integration
- Specs-driven development
- Clear explanation of Kiro usage

**Our strengths:**
- ✅ Comprehensive steering doc (spirit-personality.md)
- ✅ Multiple agent hooks (response filter, test runner)
- ✅ MCP for session memory
- ✅ Clear documentation of Kiro role

**What to document:**
- Steering doc strategy (spirit personality)
- Hook automations (formatting, testing, response filtering)
- MCP usage (session context, user tracking)
- Vibe coding examples (actual conversations with Kiro)

### 3. Quality and Design (Weight: Critical for Costume Contest)
**What judges look for:**
- Creativity and originality
- Polished, professional design
- Attention to detail
- User experience
- Visual appeal

**Our strengths:**
- ✅ Unique concept (no competitors)
- ✅ Haunting UI with animations
- ✅ Stereo audio immersion
- ✅ Smooth interactions
- ✅ Spooky theme perfection

## Prize Categories

### Overall Prizes
- 1st Place: $30,000
- 2nd Place: $20,000
- 3rd Place: $10,000

### Category Prizes ($5,000 each)
- **Best Costume Contest**: ⭐ Our primary target
- Best Resurrection
- Best Frankenstein
- Best Skeleton Crew

### Bonus Prizes
- **Most Creative**: $2,500 ⭐ High probability for us
- **Best Startup Project**: $10,000 ⭐ We can target this
- Influencer Judges' Choice: $1,000 (2 winners)
- Social Blitz Prize: $100 (5 winners) - Easy win
- Blog Post: $100 (50 winners) - Easy win

## Kiro Feature Showcase

### Must Demonstrate All of These

#### 1. Vibe Coding
**What it is**: Natural language conversation with Kiro to build code

**How we use it**:
- Backend WebSocket infrastructure built through conversation
- Frontend component generation via description
- Audio system implementation from high-level specs

**Documentation example**:
```
"Build a FastAPI WebSocket manager that handles multiple session rooms,
broadcasts messages to all participants, and tracks user presence."

→ Kiro generated complete SessionManager class with all features
```

#### 2. Steering Docs
**What it is**: Persistent knowledge files that guide Kiro's responses

**How we use it**:
- `spirit-personality.md`: 2000+ word character definition
- Defines tone, style, response patterns
- Creates consistent AI personality across all interactions
- Always loaded (inclusion: always)

**Why it's powerful**:
- No need to repeat character instructions
- Consistent spirit responses
- Easy to iterate on personality

#### 3. Agent Hooks
**What it is**: Automated workflows triggered by events

**How we use it**:
- `pre-commit.json`: Code quality checks before commits
- `on-file-save.json`: Auto-formatting on save
- `test-runner.json`: Automated testing on file changes
- `spirit-response-filter.json`: Filter and enhance AI responses

**Why it's powerful**:
- Eliminates manual repetitive tasks
- Ensures code quality automatically
- Speeds up development workflow

#### 4. Spec-Driven Development
**What it is**: Define specs, let Kiro implement

**How we use it**:
- Project structure spec defines organization
- API standards spec ensures consistency
- Component patterns spec guides UI development

**Why it's powerful**:
- Faster development
- Consistent codebase
- Easy onboarding for collaborators

#### 5. MCP (Model Context Protocol)
**What it is**: Extend Kiro's capabilities with custom servers

**How we use it**:
- Session Memory Server: Track conversation context
- User Tracking Server: Remember participant names
- Analytics Server: Log response quality metrics

**Why it's powerful**:
- Gives Kiro access to runtime data
- Enables contextual responses
- Creates richer user experience

## Demo Video Strategy

### 3-Minute Structure

**0:00-0:20 - Hook** (20 seconds)
- Dark screen
- Candle lights up
- "What if you could summon an AI... like a spirit?"
- Show friends opening app

**0:20-1:00 - Live Demo** (40 seconds)
- 3 friends join session
- Ask spooky questions
- Watch planchette move letter-by-letter
- Show creepy-accurate response
- Reactions: "How did it know that?!"

**1:00-1:45 - Technical Deep Dive** (45 seconds)
- Split screen: UI + code
- Show steering doc in action
- Highlight agent hooks
- Demonstrate MCP session memory
- Quick code snippets

**1:45-2:30 - Kiro Integration** (45 seconds)
- Show Kiro specs for architecture
- Agent hook for response filtering
- Steering doc personality shaping
- Vibe coding examples
- "Built in 20 days with Kiro"

**2:30-3:00 - Impact & Closing** (30 seconds)
- Business potential
- Social/viral use cases
- Call to action
- Group saying "GOODBYE"
- Spirit farewell message

## Competitive Advantages

### Against Other Costume Contest Entries
1. **Unique concept**: Nothing like this exists
2. **Full-stack polish**: Not just pretty UI, fully functional
3. **Kiro showcase**: Clear demonstration of all features
4. **Social proof**: Multi-user sessions show collaboration
5. **Immersive**: Audio + visual create complete experience

### For Bonus Prizes
- **Most Creative**: Obviously unique and innovative
- **Best Startup**: Clear business model and market
- **Social Blitz**: Naturally shareable content

## Success Checklist

### Technical
- [ ] All Kiro features demonstrated
- [ ] `.kiro/` directory committed (NOT in `.gitignore`)
- [ ] Code is clean and well-documented
- [ ] Live deployment works flawlessly
- [ ] No bugs in demo flow

### Documentation
- [ ] README explains Kiro usage thoroughly
- [ ] Steering docs are comprehensive
- [ ] Agent hooks are documented
- [ ] MCP integration explained
- [ ] Video clearly shows everything

### Presentation
- [ ] 3-minute video is compelling
- [ ] Demo is smooth and impressive
- [ ] Kiro usage is crystal clear
- [ ] Impact/value is obvious
- [ ] Judges say "wow"

## Common Pitfalls to Avoid

❌ **Don't**:
- Put `.kiro/` in `.gitignore` (instant disqualification)
- Make video longer than 3 minutes
- Forget to show Kiro usage clearly
- Have broken features in demo
- Skip the write-up about Kiro usage

✅ **Do**:
- Test everything multiple times
- Record backup demo footage
- Document every Kiro feature used
- Make steering docs comprehensive
- Show real conversations with Kiro

## Submission Checklist

**Repository**:
- [ ] Public GitHub repo with MIT license
- [ ] `.kiro/` directory present and committed
- [ ] README documents Kiro usage extensively
- [ ] Code is formatted and linted
- [ ] No secrets or API keys in code

**Deployment**:
- [ ] Backend deployed and running
- [ ] Frontend deployed and accessible
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] SSL/HTTPS working

**Demo Video**:
- [ ] Uploaded to YouTube/Vimeo
- [ ] Set to public/unlisted (not private)
- [ ] Exactly 3 minutes or less
- [ ] Shows all key features
- [ ] Demonstrates Kiro integration

**Documentation**:
- [ ] Kiro usage write-up complete
- [ ] Category selection clear
- [ ] Contact info provided
- [ ] Screenshots/GIFs in README

**Testing**:
- [ ] Tested on multiple browsers
- [ ] Tested on mobile
- [ ] Multi-user sessions tested
- [ ] Audio works correctly
- [ ] No console errors

## Timeline to Submission

**20 Days Total**
- Week 1 (Days 1-7): Core backend + Kiro integration
- Week 2 (Days 8-14): Frontend + audio system
- Week 3 (Days 15-20): Polish + demo + documentation

**Final Days** (Days 18-20):
- Day 18: Record demo video
- Day 19: Write documentation, verify .kiro directory
- Day 20: Final testing, buffer day

**Submission Day** (Dec 6, 3:00 AM):
- Submit at least 6 hours early
- Verify all links work
- Test from fresh browser (incognito)

## Winning Strategy

1. **Nail the Costume Contest**: Haunting UI is our strength
2. **Target Most Creative**: Unique concept = easy win
3. **Show Kiro Mastery**: Clear demonstration of all features
4. **Polish Everything**: No rough edges allowed
5. **Tell a Story**: Demo video should be compelling

## Questions to Ask Yourself Before Submitting

- [ ] Would a judge immediately say "wow" when they see this?
- [ ] Is it 100% clear how Kiro was used?
- [ ] Does the demo work flawlessly every time?
- [ ] Is the UI actually haunting and polished?
- [ ] Would users actually want to use this?

If you answered "yes" to all of these, you're ready to win. 🏆👻

## Emergency Contacts

- Hackathon support: (from hackathon page)
- Technical questions: Email hackathon manager
- Kiro support: Check Kiro documentation

## Post-Submission

After submitting:
- Tweet about your project
- Share on Reddit (r/InternetIsBeautiful, r/webdev)
- Post on Product Hunt
- Engage with other participants
- Get ready to win! 🎉

Remember: The hackathon is about showcasing Kiro's capabilities while building something genuinely cool. Séance does both perfectly. 👻🔮⚡
