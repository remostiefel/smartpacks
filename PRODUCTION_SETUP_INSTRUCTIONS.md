# 🚀 Production Setup - Schritt für Schritt

## ✅ Die App ist neu veröffentlicht!

Jetzt müssen Sie die Production-Datenbank einrichten.

## 📋 Anleitung

### Option A: SQL Runner verwenden (EMPFOHLEN)

1. **Öffnen Sie den Database SQL Runner:**
   - In Replit: **Tools** → **Database** → Tab **"SQL Runner"** oder **"My Data"**
   - Oder direkt über die Database-Schaltfläche in der linken Seitenleiste

2. **Öffnen Sie die Datei:** `production_seed.sql` (in diesem Workspace)

3. **Kopieren Sie den gesamten Inhalt** der Datei

4. **Fügen Sie ihn in den SQL Runner ein**

5. **Klicken Sie auf "Run"** oder "Execute"

6. **Überprüfen Sie das Ergebnis:**
   - Es sollten 7 Klassen erstellt werden
   - Es sollten 11 User erstellt werden

### Option B: psql Kommandozeile (Fortgeschritten)

Wenn Sie lieber die Kommandozeile verwenden:

```bash
# In der Production-Umgebung ausführen
psql $DATABASE_URL -f production_seed.sql
```

## ✅ Verifizierung

Nach dem Ausführen des SQL-Scripts sollten Sie folgende User haben:

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

## 🧪 Login testen

1. Gehen Sie zu Ihrer **Production-URL** (z.B. `https://ihre-app.replit.app`)
2. Versuchen Sie sich einzuloggen mit:
   - **Username:** `Test`
   - **Password:** `password2025`
3. Der Login sollte jetzt funktionieren! ✅

## 🔧 Troubleshooting

### Problem: SQL Runner zeigt Fehler "table does not exist"

**Lösung:** Das Database Schema wurde noch nicht deployed. Sie müssen eventuell erst:
```bash
npm run db:push
```
ausführen in der Production-Umgebung.

### Problem: "ON CONFLICT" Fehler

Das ist normal, wenn die User bereits existieren. Die Statements aktualisieren sie einfach.

### Problem: Login funktioniert immer noch nicht

Prüfen Sie:
1. Ist `NODE_ENV=production` in den Production Secrets gesetzt?
2. Ist `SESSION_SECRET` in den Production Secrets gesetzt?
3. Wurden die SQL-Statements erfolgreich ausgeführt?
4. Prüfen Sie die Production-Logs auf Fehler

## 📝 Wichtige Hinweise

- Das SQL-Script ist **idempotent** - Sie können es mehrmals ausführen ohne Probleme
- Existierende User werden aktualisiert (Passwörter zurückgesetzt)
- Die Passwörter sind im Klartext (für später: Hashing implementieren!)

## 🎉 Fertig!

Nach dem Ausführen des SQL-Scripts sollte Ihre Production-App voll funktionsfähig sein!
