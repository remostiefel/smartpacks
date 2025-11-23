
# Visualisierungs-Konzept: Mathematische Lern- und Denkprozesse

## Übersicht

Dieses Dokument beschreibt die mathematikdidaktisch fundierten Visualisierungen zur Optimierung der Lern-App.

## Implementierte Visualisierungen

### 1. Fehler-Zeitstrahl (ERROR_TIMELINE)
**Zweck:** Lernfortschritt sichtbar machen
**Mathematischer Nutzen:** Persistente vs. sporadische Fehler erkennen
**Technologie:** React + Tailwind, Backend Analytics-Modul

### 2. Zahlenraum-Heatmap (NUMBER_HEATMAP)
**Zweck:** Problematische Zahlenkombinationen identifizieren
**Mathematischer Nutzen:** Gezielte Päckchen-Generierung
**Technologie:** HTML Table mit dynamischem Styling

### 3. Facetten-Erfolgsmatrix (FACETTEN_MATRIX)
**Zweck:** Basis-Anwenden-Verknüpfen diagnostizieren
**Mathematischer Nutzen:** Adaptive Päckchen-Auswahl
**Technologie:** React Progress Bars

### 4. Kognitive-Last-Ampel (COGNITIVE_LED)
**Zweck:** Aufgabenschwierigkeit individualisieren
**Mathematischer Nutzen:** Zone der nächsten Entwicklung treffen
**Technologie:** Echtzeit-Analyse basierend auf Fehlerhistorie

## Geplante Visualisierungen

### Phase 2: Strategievisualisierung
- Zerlegungs-Baum-Darstellung
- Vergleich verschiedener Lösungswege

### Phase 3: Klassenanalyse
- Fehler-Radar für gesamte Klasse
- Päckchen-Wirksamkeits-Dashboard

## Mathematikdidaktische Prinzipien

1. **Transparenz:** Denkprozesse sichtbar machen
2. **Diagnose:** Lernlücken präzise identifizieren
3. **Adaptivität:** Visualisierung als Steuerungsinstrument
4. **Motivation:** Fortschritt erlebbar machen

## Technische Architektur

```
Frontend (React)          Backend (Node.js)
├── Visualization         ├── Analytics Module
│   Components            │   ├── Timeline Generator
│   ├── Timeline          │   ├── Heatmap Generator
│   ├── Heatmap           │   └── Cognitive Analyzer
│   ├── Matrix            └── Routes
│   └── LED Indicator         └── /api/analytics/*
```

## Forschungs-Roadmap

**Q2 2025:** A/B-Testing der Visualisierungen
**Q3 2025:** Machine Learning für Fehlerprognose
**Q4 2025:** Adaptive Visualisierung basierend auf Lehrstil

---

**Letzte Aktualisierung:** 2025-01-25
**Verantwortlich:** Mathematikdidaktik-Team
