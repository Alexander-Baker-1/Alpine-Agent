# Alpine Agent - AI-Powered Multi-Retailer Shopping Platform

An intelligent shopping agent that automates the entire process of finding and purchasing products across multiple retailers. Built for the Hack-Nation Global AI Hackathon VC Track challenge.

**Launching with skiing gear as our wedge market, Alpine Agent's platform works for any multi-item shopping scenario: party planning, event organizing, travel packing, and beyond.**

## Overview

Alpine Agent transforms online shopping from a fragmented, time-consuming process into a seamless conversational experience. Instead of manually searching multiple websites, comparing prices, and completing separate checkouts, users simply describe what they need in natural language. The AI agent handles product discovery, intelligent ranking, cart optimization, and orchestrates a unified checkout experience across multiple retailers.

## Problem Statement

Online shopping today is:
- **Fragmented**: Users must visit multiple retailer websites separately
- **Time-consuming**: Endless comparison of prices, delivery times, and specifications
- **Repetitive**: Multiple checkout processes with redundant form filling
- **Complex**: Difficult to optimize across competing priorities (budget, delivery, quality)

## Solution

An end-to-end agentic commerce system that:
1. Understands high-level shopping intent through natural language
2. Discovers and ranks products across multiple retailers
3. Creates a unified shopping cart with intelligent optimization
4. Simulates cross-retailer checkout with automated form filling

## Features

### Core Capabilities

#### 1. Conversational Intent Parsing
- Natural language understanding of shopping requirements
- Extracts structured constraints: budget, size, delivery deadline, preferences
- Powered by AI agent (Claude/GPT with fallback to rule-based parsing)

#### 2. Multi-Retailer Product Discovery
- Searches across 3+ retailers (REI, Backcountry, Amazon)
- Modular adapter architecture supporting mock data and real APIs
- Category-aware search (jackets, pants, base layers, gloves, goggles, etc.)

#### 3. Intelligent Ranking Engine
- Multi-criteria scoring algorithm:
  - Price-to-budget fit (30% weight)
  - Delivery feasibility (25% weight)
  - Technical specifications (25% weight)
  - User preferences (10% weight)
  - Customer ratings (10% weight)
- Transparent scoring with human-readable explanations
- Configurable priority modes (budget, delivery, quality)

#### 4. Unified Cart Management
- Combined view of products from multiple retailers
- Automatic grouping and subtotal calculation per retailer
- Real-time budget tracking with visual progress indicator
- Add/remove items with instant recalculation

#### 5. Cross-Retailer Checkout Simulation
- Multi-step checkout flow demonstrating:
  - Single entry of shipping and payment information
  - Automated distribution to multiple retailer checkouts
  - Progress visualization across all retailers
  - Order confirmation with complete summary

### Additional Features

- **Budget Optimization**: Visual feedback on budget utilization with alerts for overages
- **Product Comparison**: Side-by-side display of top-ranked alternatives
- **Coherent Outfit Building**: Ensures complete product sets within constraints
- **Responsive Design**: Modern UI with gradient aesthetics and smooth animations

## Technical Architecture

### Technology Stack

**Frontend**
- React 19 with Vite for fast development
- Tailwind CSS v4 for utility-first styling
- Responsive grid layouts for desktop/mobile support

**Backend**
- Node.js with Express framework
- Anthropic Claude API for conversational AI
- RESTful API architecture

**Data Layer**
- Modular retailer adapter pattern
- Mock product database with realistic specifications
- Easy integration path for real API sources

### System Architecture

```
User Input (Natural Language)
           ↓
   Chat Interface (React)
           ↓
   Express API Server
           ↓
┌──────────────┬──────────────┬──────────────┐
│ Claude Agent │   Retailer   │   Ranking    │
│ (Intent)     │   Adapters   │   Engine     │
└──────────────┴──────────────┴──────────────┘
           ↓
   Combined Shopping Cart
           ↓
  Checkout Orchestration
```

### API Endpoints

- `POST /api/chat/intent` - Parse natural language to structured intent
- `POST /api/chat/message` - Conversational interaction with context
- `POST /api/search/rank` - Search and rank products by preferences
- `POST /api/search/outfit` - Find optimal complete outfit within budget
- `GET /api/cart/:sessionId` - Retrieve session cart
- `POST /api/cart/:sessionId/add` - Add item to cart
- `DELETE /api/cart/:sessionId/remove/:id` - Remove item from cart

## Installation & Setup

### Prerequisites

- Node.js v18 or higher
- npm or yarn package manager
- Anthropic API key (or OpenAI API key as alternative)

### Backend Setup

```bash
cd server
npm install
```

Create `.env` file:
```
ANTHROPIC_API_KEY=your_api_key_here
PORT=5000
USE_MOCK_AGENT=true  # Set to false when API credits available
USE_REAL_DATA=false
```

Start server:
```bash
npm run dev
```

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

Access application at `http://localhost:5173`

## Usage

### Basic Shopping Flow

1. **Describe Your Needs**: "I need a skiing outfit, budget $400, size M, delivery in 5 days"
2. **Review Options**: Browse top-ranked products across multiple retailers
3. **Optimize Cart**: Add/remove items, monitor budget utilization
4. **Checkout**: Simulate unified checkout across all selected retailers

### Example Queries

- "I need a ski jacket, waterproof, budget $200, size large"
- "Complete downhill skiing outfit, extra warm, $500 budget, needs to arrive by Friday"
- "Ski pants and base layers, size medium, cheapest options under $150"

## Design Decisions

### Modular Adapter Pattern
Separates data sources from business logic, enabling:
- Quick prototyping with mock data during hackathon
- Easy transition to real APIs post-demo
- Testing without external dependencies

### Ranking Algorithm Transparency
Provides scoring breakdowns and explanations to build user trust and enable informed decisions.

### Single-Page Application Architecture
Maintains state client-side for responsive interaction while delegating complex operations to backend services.

## Future Enhancements

- Integration with real retailer APIs (Amazon Product API, etc.)
- Web scraping for price comparison
- Machine learning for personalized recommendations
- Return policy awareness in ranking
- Price tracking and alerts
- Mobile-native applications
- Browser extension for in-context shopping

## Challenge Compliance

This project fulfills all requirements for the Hack-Nation Global AI Hackathon VC Track "Agentic Commerce" challenge:

**Required Features:**
- Conversational brief and constraints capture
- Multi-retailer discovery (3+ retailers)
- Transparent ranking engine
- Combined cart view
- Safe checkout orchestration (simulated)

**Implemented Stretch Goals:**
- Budget optimizer
- Style/category coherence
- Decision trace explanations

## Development Team

Built by Alexander Baker - Computer Science student at University of Colorado Boulder

## Acknowledgments

- Hack-Nation Global AI Hackathon for the challenge framework
- Anthropic for Claude API access
- Open source community for foundational libraries

## License

MIT License - See LICENSE file for details

---

**Project Repository**: [GitHub URL](https://github.com/Alexander-Baker-1/Alpine-Agent.git)  
**Demo Video**: [Video URL]  
**Live Demo**: [Deployment URL]
