# Production Deployment Anleitung

## Problem gelöst ✅

Das Login-Problem zwischen Development und Production wurde behoben. Die App verwendet jetzt **ein einheitliches Authentifizierungssystem** mit Username/Passwort für **beide Umgebungen**.

## Was wurde geändert

### 1. **server/index.ts**
- Verwendet jetzt **immer** lokale Authentifizierung (username/password)
- Kein Replit OAuth mehr
- Funktioniert identisch in Development und Production

### 2. **server/auth.ts**
- Session-Cookies sind jetzt **umgebungsbewusst**:
  - **Development**: `secure: false` (HTTP)
  - **Production**: `secure: true` (HTTPS)
- `proxy: true` für korrekte Cookie-Handhabung hinter Replit's Proxy
- `SESSION_SECRET` wird **strikt geprüft** (muss gesetzt sein)

### 3. **Datenbank**
- Schema ist aktuell (`npm run db:push`)
- Alle Test-User sind geseedet (`tsx server/seed.ts`)

## Verfügbare Test-User

| Username | Password     | Role    | Klasse |
|----------|--------------|---------|--------|
| Ibra     | 2021         | teacher | 4a     |
| Rast     | 2022         | teacher | 4b     |
| Arid     | 2023         | teacher | 4c     |
| Pulv     | 2024         | teacher | 4d     |
| Jahi     | 2025         | teacher | 4e     |
| Stie     | 2020         | admin   | 6a     |
| Meie     | 2020         | admin   | 6a     |
| Bobo     | 2021         | teacher | 6a     |
| Muep     | 2021         | teacher | 6a     |
| Test     | password2025 | teacher | Test   |
| Casu     | 2025         | teacher | Test   |

## Production Deployment Checkliste

### Vor dem Deployment

Stellen Sie sicher, dass folgende **Secrets** in Production gesetzt sind:

1. ✅ **DATABASE_URL** - Production Datenbank (sollte schon gesetzt sein)
2. ✅ **SESSION_SECRET** - Für Session-Verschlüsselung (ist bereits gesetzt)
3. ⚠️ **NODE_ENV** - Muss auf `production` gesetzt sein

### Nach dem Deployment

1. **Database Schema pushen**:
   ```bash
   npm run db:push
   ```
   Falls Warnungen kommen:
   ```bash
   npm run db:push --force
   ```

2. **User in Production-DB seeden**:
   ```bash
   tsx server/seed.ts
   ```

3. **Testen**:
   - Production-URL öffnen
   - Mit einem Test-User einloggen (z.B. `Test` / `password2025`)
   - Login sollte jetzt funktionieren ✅

## Wie es funktioniert

### Development (NODE_ENV=development)
- HTTP (kein SSL)
- Session-Cookies: `secure: false`
- Lokale PostgreSQL-Datenbank
- Username/Password Login

### Production (NODE_ENV=production)
- HTTPS (hinter Replit Proxy)
- Session-Cookies: `secure: true`
- Production PostgreSQL-Datenbank (Neon)
- Username/Password Login (gleiche User wie in Dev)

## Wichtige Hinweise

1. **Kein OAuth mehr**: Replit OAuth wird nicht mehr verwendet
2. **Session-Sicherheit**: Cookies sind in Production automatisch sicher (HTTPS)
3. **Proxy-Unterstützung**: `trust proxy: 1` sorgt für korrekte Cookie-Handhabung
4. **Passwörter**: Aktuell Plaintext (für später: bcrypt verwenden!)

## Troubleshooting

### Problem: Login funktioniert in Production nicht
**Lösung**: 
- Prüfen Sie, ob `NODE_ENV=production` gesetzt ist
- Führen Sie `tsx server/seed.ts` in Production aus
- Prüfen Sie die Production-Logs auf Fehler

### Problem: Session wird nicht gespeichert
**Lösung**:
- Prüfen Sie, ob `SESSION_SECRET` gesetzt ist
- Prüfen Sie, ob `DATABASE_URL` korrekt ist
- Sessions werden in der `sessions` Tabelle gespeichert

### Problem: Cookie-Fehler
**Lösung**:
- In Production muss HTTPS verwendet werden
- `secure: true` funktioniert nur mit HTTPS
- Replit stellt automatisch HTTPS bereit

## Nächste Schritte (Optional)

1. **Passwort-Hashing**: Verwenden Sie bcrypt statt Plaintext
2. **User-Verwaltung**: Admin-Interface für User-Erstellung
3. **Session-Monitoring**: Logging für Login-Versuche
