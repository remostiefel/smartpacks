# Design Guidelines: SmartPacks - Personal Homework

## Design Approach: Modern Educational Platform

This is a **modern, bold educational application** combining clarity, efficiency, and professional trustworthiness with a fresh, energetic design. The design features a clean interface with strong typography and hand-drawn style icons, creating a friendly yet smart learning environment.

**Core Design Principle**: Smart lernen. Intelligente Förderung. Zeit für smarte Übungen. Create an engaging platform that makes personalized learning feel accessible and exciting for teachers.

## Feature Names

- **Power-Packs**: Systematische Mathe-Aufgabenreihen
- **Rechtschreib-Radar**: 4-stufige Fehleranalyse
- **Wort-Werkstatt**: Interaktive Vokabelübungen
- **Kreativ-Kicks**: Personalisierte kreative Tasks

---

## Color Palette

### Light Mode (Primary)
- **Primary Brand**: 220 85% 50% (Educational blue - trust and focus)
- **Secondary/Accent**: 145 65% 45% (Success green for correct patterns)
- **Warning/Error**: 15 85% 55% (For highlighting student errors)
- **Background**: 220 15% 98% (Soft off-white)
- **Surface**: 0 0% 100% (Pure white cards)
- **Text Primary**: 220 20% 20% (Deep slate)
- **Text Secondary**: 220 15% 45% (Muted slate)

### Dark Mode
- **Primary**: 220 75% 60%
- **Background**: 220 20% 12%
- **Surface**: 220 18% 18%
- **Text Primary**: 220 10% 95%

---

## Typography

**Font Stack**: 
- Primary: 'Inter' from Google Fonts (clean, professional, excellent readability for data)
- Monospace: 'JetBrains Mono' for calculation displays (5+8=12)

**Hierarchy**:
- Page Headers: text-2xl font-semibold (teacher dashboard titles)
- Section Headers: text-lg font-medium
- Body: text-base font-normal
- Calculation Display: text-lg font-mono (for math errors)
- Small Labels: text-sm text-secondary
- Button Text: text-sm font-medium

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16** for consistency
- Tight spacing: p-2, gap-2 (within cards)
- Standard spacing: p-4, gap-4 (between elements)
- Section spacing: p-6, gap-6 (card padding)
- Large spacing: p-8, gap-8 (page margins)
- Major sections: mb-12, py-16

**Grid Structure**:
- Container: max-w-7xl mx-auto px-4
- Dashboard: 12-column grid for flexible data layouts
- Student cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Data tables: full-width with horizontal scroll on mobile

---

## Component Library

### Navigation & Layout

**Top Navigation Bar**:
- Fixed header with subtle shadow
- Logo/app name left-aligned
- Class selector (dropdown) center
- Teacher name and logout button right-aligned
- Height: h-16
- Background: surface color with border-b

**Sidebar Navigation** (Admin only):
- Collapsible left sidebar (w-64 when open, w-16 collapsed)
- Class management, teacher overview, global settings
- Icons: Heroicons (academic-cap, user-group, cog-6-tooth)

### Core Components

**Student Data Cards**:
- Rounded corners (rounded-lg)
- Shadow: shadow-sm hover:shadow-md transition
- Padding: p-6
- Contains: Student name (bold), error count badge, recent errors list
- Action buttons: "View Details" and "Generate Homework"

**Error Input Interface**:
- Large, prominent text input with monospace font
- Format guidance: "Enter errors like: 5+8=12"
- Tag-style display of entered errors with x-remove buttons
- Error type auto-detection (Zehnerübergang, etc.)

**Homework Generation Panel**:
- Step-by-step wizard interface
- Page count selector (1-4 pages)
- Päckchen type auto-selection with manual override option
- Preview section showing selected exercises
- "Generate PDF" primary button (large, prominent)

**Data Tables**:
- Striped rows for readability (even:bg-gray-50)
- Sortable headers with arrow indicators
- Compact padding (px-4 py-3)
- Sticky header on scroll
- Highlight row on hover

### Forms & Inputs

**Text Inputs**:
- Border: border border-gray-300 dark:border-gray-600
- Rounded: rounded-md
- Padding: px-3 py-2
- Focus: ring-2 ring-primary ring-offset-2
- Dark mode: consistent contrast

**Buttons**:
- Primary: bg-primary text-white, hover slight darken
- Secondary: border-2 border-primary text-primary
- Danger: bg-error text-white (for delete actions)
- Sizes: Small (px-3 py-1.5), Standard (px-4 py-2), Large (px-6 py-3)

**Select Dropdowns**:
- Class selector: Large, prominent in header
- Styled with chevron icon
- Dropdown menu: shadow-lg rounded-md

### Data Visualization

**Error Pattern Indicators**:
- Badge components for error types
- Color-coded: Zehnerübergang (orange), Basic operations (blue)
- Small rounded pills with counts

**Student Progress Indicators**:
- Simple progress bars (h-2 rounded-full)
- Color gradient from error (red) to success (green)
- Percentage display alongside

### PDF Preview Components

**Homework Preview Card**:
- A4 aspect ratio preview (scaled)
- Border: border-2 border-gray-300
- White background regardless of theme
- German text preview samples
- Download/Print buttons below

---

## Interaction Patterns

**Error Input Flow**:
1. Focus on large input field
2. Type error (auto-format detection)
3. Press Enter to add to list
4. Errors appear as removable tags below
5. System analyzes pattern in real-time

**Homework Generation Flow**:
1. Select student from list/search
2. Review student errors (displayed prominently)
3. Auto-suggested Päckchen types highlighted
4. Adjust page count and exercises
5. Generate preview
6. Download PDF (opens in new tab)

**Class/Student Navigation**:
- Quick class switcher in header (no page reload)
- Student search bar with instant filtering
- Breadcrumb navigation for admin (Classes > 4a > Student Rico)

---

## Special Considerations

### German Language UI
- All interface text in German
- Date format: DD.MM.YYYY (European)
- Number format: Decimal comma (13,5 not 13.5)
- Terms: "Klasse" (class), "Lehrer/in" (teacher), "Schüler/in" (student)

### Print Optimization
- PDF homework sheets: Clean, high-contrast black/white primary
- Generous margins for handwriting
- Clear mathematical notation (monospace)
- Page numbers and student name in footer

### Accessibility
- WCAG AA contrast ratios minimum
- Keyboard navigation for all workflows
- Focus indicators clearly visible
- Screen reader labels for all interactive elements

### Mobile Responsiveness
- Primarily desktop-focused (teacher workstations)
- Mobile: Stack cards single column, collapsible navigation
- Tablet: 2-column layouts work well

---

## Page-Specific Layouts

**Teacher Dashboard**:
- Header with class selector
- Student grid (3 columns on desktop)
- Quick stats bar: Total students, students needing homework, recent activity

**Student Detail Page**:
- Two-column layout (60/40 split)
- Left: Student info, error history, homework history
- Right: Generate new homework panel

**Admin Overview**:
- Sidebar + main content area
- Tables for class/teacher management
- Summary statistics cards at top

**No hero images needed** - this is a functional dashboard application focused on data and workflows.