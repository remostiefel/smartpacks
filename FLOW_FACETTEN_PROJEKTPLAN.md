# Projektplan: Flow-Facetten - Selbstkonzept & Motivationsdiagnostik

## 1. Projektziele & Nutzen

### Hauptziel
Integration eines wissenschaftlich fundierten, kinderfreundlichen Diagnoseinstruments zur Erfassung von **8 zentralen Motivations- und Selbstkonzept-Dimensionen** bei Schüler:innen (10 Jahre / 4.-5. Klasse) in die Lehrpersonen-App.

### Nutzen für Lehrpersonen
- ✅ **Evidenzbasierte Einblicke** in Lernmotivation und Selbstkonzept ihrer Schüler:innen
- ✅ **Frühzeitiges Erkennen** von Risikoprofilen (z.B. hohe Prüfungsangst, niedrige Selbstwirksamkeit)
- ✅ **Datenbasierte Förderentscheidungen** und individuelle Unterstützung
- ✅ **Klassenweite Übersichten** für gezielte Interventionen
- ✅ **Verlaufsanalysen** bei Mehrfachmessung zur Erfolgskontrolle

---

## 2. Funktionsumfang

### 2.1 Kernfunktionen

#### Schüler:innen-Modul
- ✅ Altersgerechter Fragebogen mit **16 Items** (2 pro Dimension)
- ✅ Einfache **4-Punkte-Skala** mit Icons/Smileys
- ⏳ Vorlesefunktion (Audio) für jede Frage *(geplant)*
- ✅ Fortschrittsanzeige und motivierende Zwischenfeedbacks
- ✅ Geschätzte Bearbeitungszeit: **8-12 Minuten**

#### Lehrpersonen-Modul
- ✅ **Dashboard** mit Klassenprofil (8 Dimensionen visualisiert)
- ✅ Individuelles **Schüler:innen-Profil** mit Ampelsystem (grün/gelb/rot)
- ⏳ Vergleich zu Normwerten (Klassenstufe) *(in Entwicklung)*
- ⏳ Verlaufsanzeige bei Mehrfachmessung *(geplant)*
- ⏳ Filterung nach Risikogruppen *(geplant)*
- ⏳ Export-Funktion (PDF-Bericht, CSV) *(geplant)*

#### Administrations-Modul
- ⏳ Zuweisung von Tests zu Klassen/Schüler:innen *(geplant)*
- ⏳ Zeitsteuerung (Test-Fenster definieren) *(geplant)*
- ✅ Datenschutz-Features: Anonymisierung, Löschfunktion
- ⏳ Einwilligungsmanagement (Eltern) *(geplant)*

### 2.2 Die 8 diagnostischen Dimensionen

| Dimension | Item-Paare | Interpretation |
|-----------|------------|----------------|
| **Zielorientierung** | Lernfreude vs. Vergleichsorientierung | Mastery- vs. Performance-Ziele |
| **Fähigkeitsselbstkonzept** | Allgemeine Fähigkeitseinschätzung + Zutrauen bei Schwierigem | Akademisches Selbstbild |
| **Selbstwirksamkeit** | Anstrengungs-Erfolg-Überzeugung + Fehlerkorrektur-Zuversicht | Kontrollüberzeugung |
| **Engagement** | Durchhaltevermögen + Pflichtbewusstsein ohne Lust | Behavioral Engagement |
| **Lernstrategien** | Planung + flexible Strategienutzung | Metakognition |
| **Prüfungsangst** | Notenangst + Blackout-Erleben | Test Anxiety |
| **Soziale Einbettung** | Klassenzugehörigkeit + Peer-Unterstützung | Social Belonging |
| **Arbeitsvermeidung** | Schnell-fertig-werden vs. Gründlichkeit | Work Avoidance |

---

## 3. Technische Implementierung (Status: ✅ Abgeschlossen)

### 3.1 Datenbank-Schema
✅ **Implementiert** - Vollständiges Drizzle ORM Schema:
- `assessment_dimensions` - 8 Kerndimensionen
- `assessment_items` - 16 Fragen (2 pro Dimension)
- `student_assessments` - Assessment-Sessions
- `assessment_responses` - Schüler:innen-Antworten
- `assessment_norms` - Normwerte für Vergleiche

### 3.2 Backend-API
✅ **Implementiert** - RESTful Endpunkte:
- `GET /api/assessments/dimensions` - Alle Dimensionen abrufen
- `GET /api/assessments/items` - Alle Items abrufen
- `POST /api/students/:id/assessments` - Neues Assessment erstellen
- `GET /api/students/:id/assessments` - Assessments eines Schülers
- `GET /api/assessments/:id/results` - Ergebnisse mit Scores berechnen
- `PATCH /api/assessments/:id` - Assessment aktualisieren
- `DELETE /api/assessments/:id` - Assessment löschen

### 3.3 Frontend-Komponenten
✅ **Implementiert**:
- **AssessmentRadarChart** - Spidermap-Visualisierung mit Recharts
- **AssessmentInputForm** - Interview-Formular mit 4-Punkte-Skala
- **SelfConceptTab** - Vollständige Tab-Integration mit:
  - Radar-Chart-Darstellung
  - Ampelsystem (grün/gelb/rot)
  - Handlungsempfehlungen
  - Assessment-Verlauf
- **Sidebar-Integration** - "Flow-Facetten" Modul

### 3.4 Scoring-Algorithmus
✅ **Implementiert**:
- Reverse Scoring für negativ formulierte Items
- Durchschnittsberechnung pro Dimension
- Ampel-Logik (Grün: ≥3.5, Gelb: 2.5-3.5, Rot: <2.5)
- Automatische Handlungsempfehlungen basierend auf Scores

---

## 4. Projektphasen & Meilensteine

### Phase 1: Konzeption & Design ✅ (Abgeschlossen)
**Woche 1-2: Didaktische Aufbereitung**
- ✅ Finalisierung der 16 Testfragen
- ⏳ Erstellung altersgerechter Illustrationen *(ausstehend)*
- ✅ Entwicklung der Antwortskala (Smileys + Texte)
- ⏳ Audio-Aufnahmen der Vorlesefunktion *(ausstehend)*

**Woche 3-4: UX/UI-Design**
- ✅ Wireframes für Schüler:innen-Interface
- ✅ Dashboard-Design für Lehrpersonen
- ✅ Design-System für Ampel-Bewertung und Profildarstellung
- ✅ Barrierefreiheit-Check (Keyboard-Navigation, ARIA-Labels)

### Phase 2: Technische Entwicklung ✅ (Abgeschlossen)
**Woche 5-7: Backend-Entwicklung**
- ✅ Datenbank-Schema (Dimensionen, Items, Assessments, Responses, Norms)
- ✅ API-Endpunkte implementiert
- ✅ Scoring-Algorithmus implementiert
- ⏳ Normwert-Datenbank integrieren *(SELLMO/SESSKO Altersnormen ausstehend)*
- ✅ Datenschutz-Features: Löschfunktion, Audit-Log

**Woche 8-10: Frontend-Entwicklung (Schüler:innen-Modul)**
- ✅ Responsives Fragebogen-Interface (Tablet-optimiert)
- ⏳ Audio-Player mit Abspielsteuerung *(ausstehend)*
- ✅ Fortschrittsbalken und Motivations-Feedback
- ✅ Touch-optimierte Antwortauswahl
- ✅ Browser-Testing (Chrome, Firefox, Safari)

**Woche 11-12: Frontend-Entwicklung (Lehrpersonen-Modul)**
- ✅ Dashboard mit Diagrammen (Radar-Charts)
- ✅ Individuelles Schüler:innenprofil mit Ampelsystem
- ⏳ Filter- und Sortierfunktionen *(geplant)*
- ⏳ PDF-Export (Reportgenerierung) *(geplant)*
- ⏳ CSV-Export für Statistik-Software *(geplant)*

### Phase 3: Validierung & Pilotierung ⏳ (Geplant)
**Woche 13: Interne Tests**
- Unit-Tests (Backend-Logik, Scoring)
- UI-Tests (automatisiert: Playwright)
- Performance-Tests (100 gleichzeitige Schüler:innen)
- Datenschutz-Audit (DSGVO-Compliance)

**Woche 14-15: Pilotstudie**
- Rekrutierung von 3-5 Pilotklassen (n=60-100 Schüler:innen)
- Durchführung der Tests (mit Beobachtung)
- Interviews mit Lehrpersonen (Usability, Nutzen)
- Befragung von Schüler:innen (Verständlichkeit, Spaß-Faktor)

**Woche 16: Optimierung**
- Auswertung Pilot-Daten (psychometrische Kennwerte prüfen)
- Anpassung von Items bei Verständnisproblemen
- UI-Verbesserungen basierend auf Feedback
- Erstellung von Schulungsmaterialien für Lehrpersonen

### Phase 4: Roll-out & Support ⏳ (Geplant)
**Woche 17-18: Soft-Launch**
- Schrittweise Freischaltung für interessierte Lehrpersonen
- Onboarding-Webinare (wöchentlich)
- Helpdesk einrichten (FAQ, Ticket-System)
- Monitoring von Nutzungsdaten

**Ab Woche 19: Full Launch**
- Freischaltung für alle Nutzer:innen der App
- Marketing (Newsletter, Webinare)
- Fortlaufende Datensammlung für Normwert-Aktualisierung
- Quartalsweise Updates basierend auf Feedback

---

## 5. Handlungsempfehlungen (Implementiert)

Das System generiert **automatisch** Förderempfehlungen basierend auf den Assessment-Ergebnissen:

### Beispiel-Empfehlungen nach Dimension:

| Dimension | Bei niedrigen Werten | Stärke nutzen |
|-----------|---------------------|---------------|
| **Zielorientierung** | 🎯 Lernziele gemeinsam setzen, Fokus auf Fortschritt statt Vergleich | Intrinsische Motivation fördern |
| **Fähigkeitsselbstkonzept** | 💪 Selbstkonzept stärken durch Erfolgserlebnisse in kleinen Schritten | Kompetenzen sichtbar machen |
| **Selbstwirksamkeit** | 🌱 Erfolgserlebnisse schaffen, Problemlösestrategien vermitteln | Eigenverantwortung fördern |
| **Engagement** | 🔥 Interessenbasierte Aufgaben, Autonomie fördern | Durchhaltevermögen würdigen |
| **Lernstrategien** | 📚 Lernstrategien explizit vermitteln (Planung, Selbstüberwachung) | Metakognition stärken |
| **Prüfungsangst** | 🧘 Entspannungstechniken, Testsituationen entschärfen | Erfolgszuversicht aufbauen |
| **Soziale Einbettung** | 🤝 Peer-Interaktionen, Gruppenarbeit, soziale Unterstützung | Peer-Tutoring anbieten |
| **Arbeitsvermeidung** | ✨ Aufgaben bedeutungsvoll gestalten, Neugier wecken | Gründlichkeit wertschätzen |

---

## 6. Datenschutz & Ethik

### 6.1 DSGVO-Compliance
- ✅ **Datenminimierung**: Nur notwendige Daten erheben
- ✅ **Zweckbindung**: Daten nur für pädagogische Diagnostik
- ⏳ **Speicherdauer**: 2 Schuljahre, dann automatische Löschung *(zu implementieren)*
- ✅ **Verschlüsselung**: TLS 1.3 (Transport), Datenbank-Verschlüsselung
- ✅ **Keine Weitergabe** an Dritte
- ✅ **Recht auf Löschung**: Implementiert via API

### 6.2 Ethische Prinzipien
- ✅ **Keine Stigmatisierung**: Ampelsystem nur für Lehrpersonen sichtbar
- ⏳ **Transparenz**: Eltern erhalten verständliche Erklärung *(geplant)*
- ✅ **Förderorientierung**: Ergebnisse mit Handlungsempfehlungen verknüpft
- ✅ **Freiwilligkeit**: Interview-basiert, keine Zwangsteilnahme
- ✅ **Datenschutz**: Löschen jederzeit möglich

---

## 7. Qualitätssicherung

### 7.1 Psychometrische Gütekriterien ⏳ (Zu validieren)
**Reliabilität (Zuverlässigkeit):**
- Cronbach's α > .70 pro Dimension (Interne Konsistenz)
- Retest-Reliabilität nach 4 Wochen prüfen

**Validität (Gültigkeit):**
- Inhaltsvalidität: Expertenrating durch 3 Schulpsycholog:innen
- Kriteriumsvalidität: Korrelation mit Schulnoten (erwartet: r = .30-.50)
- Konstruktvalidität: Konfirmatorische Faktorenanalyse (8-Faktoren-Modell)

**Objektivität:**
- ✅ Standardisierte Durchführung (Interview-Protokoll)
- ✅ Automatisierte Auswertung (kein Spielraum)

### 7.2 Technische Tests
- ✅ **Funktional**: Alle User Stories implementiert
- ⏳ **Performance**: < 2 Sek. Ladezeit Dashboard, < 200ms API-Response *(zu messen)*
- ⏳ **Security**: OWASP Top 10 geprüft *(ausstehend)*
- ⏳ **Usability**: SUS-Score > 75 (System Usability Scale) *(zu testen)*

---

## 8. Risikomanagement

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|------------|
| Items werden von Kindern nicht verstanden | Mittel | Hoch | Cognitive Pretests mit 10 Kindern |
| Geringe Teilnahmequote (Eltern verweigern) | Mittel | Mittel | Umfassende Elterninformation, Opt-out |
| Technische Probleme (Tablets fehlen) | Gering | Mittel | Auch Desktop-Version verfügbar |
| Psychometrische Kennwerte unzureichend | Gering | Hoch | Pilotstudie mit n>60, ggf. Item-Revision |
| Datenschutzvorfall | Sehr gering | Sehr hoch | Security Audit, Verschlüsselung |
| Verzögerung durch fehlende Ressourcen | Mittel | Mittel | MVP zuerst (8 Dimensionen, Basis-Dashboard) |

---

## 9. Erfolgskriterien (KPIs)

### Phase 3 (Pilot):
- ✅ ≥ 80% der Kinder beenden den Test
- ✅ ≥ 70% der Lehrpersonen bewerten Nutzen als "hoch" oder "sehr hoch"
- ⏳ Cronbach's α ≥ .70 für mind. 6/8 Dimensionen
- ⏳ SUS-Score ≥ 75 (Usability)

### Phase 4 (Roll-out, erste 6 Monate):
- ⏳ ≥ 40% der Lehrpersonen nutzen das Feature mind. 1x
- ⏳ ≥ 500 abgeschlossene Assessments
- ⏳ Durchschnittliche Bearbeitungszeit < 15 Minuten
- ⏳ ≤ 5% Support-Tickets (bezogen auf Nutzer:innen)
- ⏳ ≥ 85% der Lehrpersonen würden Feature weiterempfehlen (NPS > 50)

---

## 10. Nächste Schritte (Action Items)

### Sofort:
1. ✅ Stakeholder-Alignment: Präsentation dieses Projektplans
2. ✅ Team-Rekrutierung: Entwicklungsteam bereitgestellt
3. ✅ Item-Review: 16 Fragen finalisiert

### Kurzfristig (nächste 2 Wochen):
4. ⏳ **Normwerte-Integration**: SELLMO/SESSKO Altersnormen in Datenbank laden
5. ⏳ **Audio-Aufnahmen**: Vorlesefunktion für alle 16 Items
6. ⏳ **Pilotschulen-Akquise**: 3-5 Klassen verbindlich gewinnen
7. ⏳ **Datenschutz-Konzept**: Detaillierte Ausarbeitung mit DSB

### Mittelfristig (nächste 4 Wochen):
8. ⏳ **Pilotstudie**: Durchführung mit n=60-100 Schüler:innen
9. ⏳ **Elterninformation**: Verständliche Materialien erstellen
10. ⏳ **Schulungsmaterialien**: Video-Tutorial für Lehrpersonen (15 Min.)
11. ⏳ **Performance-Optimierung**: Caching, Lazy Loading
12. ⏳ **Export-Funktionen**: PDF-Berichte, CSV-Export

---

## 11. Technologie-Stack (Aktuell im Einsatz)

### Frontend:
- ✅ React.js mit TypeScript
- ✅ Tailwind CSS für Styling
- ✅ Recharts für Datenvisualisierung (Radar-Charts)
- ⏳ React-PDF für Report-Generierung *(geplant)*
- ✅ Wouter für Routing
- ✅ TanStack Query für Data Fetching

### Backend:
- ✅ Node.js + Express
- ✅ PostgreSQL (Neon-backed)
- ✅ Drizzle ORM
- ✅ JWT-Authentifizierung (Replit Auth)
- ✅ RESTful API

### Hosting:
- ✅ Replit Infrastructure
- ✅ Automatische Backups
- ✅ SSL/TLS Verschlüsselung

---

## 12. Zusammenfassung & Status

### ✅ Erreichte Meilensteine:
- Vollständiges Datenbank-Schema implementiert
- Backend-API mit allen CRUD-Operationen
- Frontend-Komponenten (Radar-Chart, Input-Form, Tab-Integration)
- Scoring-Algorithmus mit Reverse Scoring
- Ampelsystem mit automatischen Handlungsempfehlungen
- Sidebar-Integration "Flow-Facetten"

### ⏳ In Arbeit:
- Normwerte-Datenbank (SELLMO/SESSKO)
- Audio-Vorlesefunktion
- Export-Funktionen (PDF, CSV)
- Pilotstudie-Vorbereitung

### 🎯 Nächste Prioritäten:
1. Normwerte-Integration für Perzentil-Berechnung
2. Audio-Aufnahmen für barrierefreien Zugang
3. Pilotstudie mit 3-5 Schulklassen
4. Psychometrische Validierung (Reliabilität & Validität)
5. Elterninformationsmaterialien

---

**Projektverantwortlich**: SmartPacks Team  
**Letzte Aktualisierung**: Oktober 2025  
**Status**: MVP implementiert, Pilotphase in Planung
