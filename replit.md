# SmartPacks v0.2

## Overview
SmartPacks is a comprehensive AI-powered learning platform for primary school teachers, designed to provide personalized education in mathematics, spelling, vocabulary, creative tasks, and self-concept development. It integrates scientifically-backed methodologies, such as the "Entdecker-Päckchen" didactic, to offer automatic error analysis, adaptive exercise generation, and professional PDF creation. The platform aims to enhance educational outcomes through personalized learning paths and data-driven insights.

## User Preferences
Preferred communication style: Simple, everyday language (no technical jargon for users).

## System Architecture

### Frontend
- **Framework:** React 18 + TypeScript
- **Build:** Vite 5
- **UI:** Radix UI + shadcn/ui (New York Style)
- **Styling:** Tailwind CSS with custom Educational Design System
- **State Management:** TanStack Query v5 (Server State), React Context (Local State)
- **Routing:** Wouter
- **Charts:** Recharts
- **Animations:** Framer Motion
- **Icons:** Lucide React + 40+ Custom Educational SVG Icons
- **Fonts:** Inter (UI), JetBrains Mono (Code)
- **Accessibility:** WCAG AA compliant, Colorblind-friendly, Keyboard Navigation, Screen Reader Support, Reduced Motion Support
- **Theming:** Full Dark Mode support with automatic theme adaptation.

### Backend
- **Runtime:** Node.js + Express.js
- **API:** RESTful Architecture
- **Authentication:** Dual Mode (Local for development, ready for Replit OAuth for production)
- **Session Management:** express-session + connect-pg-simple
- **Database:** PostgreSQL (Neon Serverless)
- **ORM:** Drizzle ORM (type-safe)
- **PDF Generation:** PDFKit

### Core Modules & Features
- **Power-Packs (Mathematics):** Automatic error classification (9 categories), 12 packet types (e.g., constant sum, inverse tasks), Facet-system (Basis → Anwenden → Verknüpfen), Visualizations (Error-Timeline, Number-Heatmap), PDF export.
- **Rechtschreib-Radar (Spelling):** 4-stage error classification (HSP-based), DaZ-support, automatic exercise generation, word lists, PDF export.
- **Wort-Werkstatt (Vocabulary):** 5 learning modes (Flashcard, Matching, Writing, Multiple Choice, Listening), Spaced Repetition, Plant Growth Card visualization, progress tracking.
- **Kreativ-Kicks (Creative Tasks):** Student profiles, AI-powered Smart-Match algorithm for task recommendations, Creativity Dice (248,832 combinations), 7 categories, Difficulty Mountain visualization.
- **Flow-Facetten (Self-Concept & Motivation):** Assessment across 8 dimensions (e.g., Goal Orientation, Self-Efficacy), 6 assessment scale types, Radar-Charts, actionable recommendations, longitudinal diagnostics.
- **Living-Life (Experiential Learning):** 6 categories for out-of-school tasks, badge system, long-term projects, reflection prompts, parent involvement.

### Pedagogical Engines
- **Math Pedagogy Engine:** Rule-based generator for error classification and packet generation based on scientific didactics.
- **Spelling Pedagogy Engine:** Implements HSP-based strategies for phonetic, orthographic, morphemic, and word-specific spelling.
- **Creative Matching Algorithm:** AI-driven matching based on student interests, strengths, creativity type, and category diversity.

### Visualizations
- **Custom Icon Library:** 40+ educational SVG icons for various modules and concepts.
- **Data Visualizations:** Number Heatmap, Error Timeline, Vocabulary Plant Card, Difficulty Mountain Card, Spelling Strategy Pie Charts.
- **Assessment Scales:** 6 types of interactive scales (Likert, Star, Smiley, Number, Yes/No, Frequency).

## External Dependencies
- **PostgreSQL:** Primary database for all application data.
- **Neon Serverless:** Hosts the PostgreSQL database.
- **PDFKit:** Library for generating PDF documents.
- **OpenAI GPT-5:** Optional integration for advanced features (e.g., AI-driven content generation, recommendations).
- **Google Fonts (Inter):** Used for UI typography.