# SmartPacks - Production Deployment Guide

## Database Deployment Strategy

### ✅ SECURITY: All Dangerous Scripts Deleted - Production Ready

All dangerous legacy scripts have been **permanently deleted** from the codebase.

**Security Status:**
- ✅ Root directory is clean - no dangerous scripts
- ✅ All `server/seed-*.ts` scripts protected with environment checks  
- ✅ All 14 legacy scripts **DELETED** - permanently removed
- ✅ All hardcoded production URLs **REMOVED**
- ✅ **Safe for production deployment**

**See**: `DANGEROUS-SCRIPTS-WARNING.md` for historical record.

**Rule**: Only use `server/` scripts for database operations. All legacy scripts have been deleted.

### ⚠️ Critical Safety Rules

1. **NEVER run seed scripts in production**
   - All seed scripts are protected with `NODE_ENV` checks
   - Seeds contain development test data (test users, demo classes)
   - Production should only contain real user data

2. **NEVER manually write SQL migrations**
   - Use Drizzle's `db:push` for schema changes
   - Manual SQL can cause data loss and conflicts

3. **NEVER change primary key ID types**
   - Existing IDs use `varchar` with UUID
   - Changing to `serial` or other types breaks data

## Production Database Initialization

### First-Time Setup

When deploying to production for the first time:

```bash
# 1. Ensure DATABASE_URL is set (Replit does this automatically)
echo $DATABASE_URL

# 2. Push the schema to create all tables
npm run db:push

# 3. Verify tables were created (optional)
# Use Replit's Database pane to inspect
```

### What Gets Created

The `db:push` command creates ALL tables from `shared/schema.ts`:
- ✅ `users` - User accounts (via OAuth in production)
- ✅ `classes` - Class organization
- ✅ `students` - Student profiles
- ✅ `sessions` - Session storage
- ✅ `user_sessions` - Activity tracking
- ✅ `page_views` - Page view analytics
- ✅ `student_errors` - Error tracking
- ✅ `homeworks` - Homework assignments
- ✅ `creative_tasks` - Task templates
- ✅ `feedback_tickets` - User feedback
- ✅ And 15+ other tables...

### Initial Production Data

**Minimal Required Data:**

1. **Creative Tasks** (Optional but recommended)
   - Can be added manually via admin interface
   - Or create a production-safe task seeding script

2. **Admin Users**
   - Created automatically via Replit OAuth on first login
   - Assign admin role manually via database pane if needed

3. **Classes**
   - Create manually via admin panel (`/admin`)
   - Or via database pane

**❌ DO NOT seed in production:**
- Test users (Ibra, Rast, Arid, Test, etc.)
- Demo classes (4a, 4b, Test)
- Sample student data
- Development-only data

## Schema Changes & Updates

### Safe Schema Updates

When you modify `shared/schema.ts`:

```bash
# Development: Test changes first
NODE_ENV=development npm run db:push

# Production: Deploy when ready
# The workflow will run db:push automatically on deployment
# Or run manually:
npm run db:push
```

### Non-Backward Compatible Changes

Some changes require special handling:

**Dangerous Operations:**
- ❌ Removing columns (causes data loss)
- ❌ Changing column types (breaks existing data)
- ❌ Adding required fields without defaults
- ❌ Renaming tables/columns

**Safe Approach:**
1. Make changes additive first (add new column)
2. Migrate data gradually
3. Remove old column in separate deployment
4. Schedule changes during low-traffic periods

### Emergency: Force Schema Sync

If `db:push` fails due to conflicts:

```bash
npm run db:push --force
```

⚠️ **Warning:** `--force` can cause data loss. Only use if:
- You understand the schema conflict
- You have a backup (Replit provides automatic backups)
- You've coordinated with stakeholders

## Authentication Differences

### Development (Local Auth)
- Uses username/password from `server/auth.ts`
- Test users: Ibra/2021, Stie/2020, etc.
- User IDs are deterministic UUIDs

### Production (Replit OAuth)
- Uses Replit account authentication
- User IDs are generated from Replit user data
- Users created on first login

### Migration Notes

**Foreign Keys remain compatible** because:
- Both systems use `varchar` UUIDs for IDs
- `classId`, `teacherId` references work identically
- No ID type conversion needed

## Deployment Checklist

### Pre-Deployment
- [ ] Schema changes tested in development
- [ ] No manual SQL migrations added
- [ ] Seed scripts have environment checks
- [ ] Breaking changes documented

### Deployment
- [ ] DATABASE_URL environment variable set
- [ ] Run `npm run db:push` (or let workflow handle it)
- [ ] Verify no errors in deployment logs
- [ ] Test authentication flow

### Post-Deployment
- [ ] Verify database tables created
- [ ] Test user login (Replit OAuth)
- [ ] Create initial classes via admin panel
- [ ] Confirm no development data present

## Rollback Strategy

If deployment fails:

1. **Database Issues:**
   - Replit provides automatic database backups
   - Use Database pane → "View Checkpoints" to rollback
   - Contact Replit support for emergency recovery

2. **Application Issues:**
   - Revert deployment in Replit
   - Previous version auto-restores
   - Database remains unchanged

3. **Schema Issues:**
   - Identify breaking change
   - Create fix in `shared/schema.ts`
   - Redeploy with corrected schema

## Monitoring

### Activity Tracking (Admin Only)

Production includes automatic tracking:
- User login/logout events
- Page view analytics  
- Session duration
- Feedback submissions

Access via Admin Panel → Aktivität tab (Stie, Meie only)

### Database Health

Monitor via Replit Database pane:
- Connection status
- Storage usage
- Query performance
- Recent backups

## Troubleshooting

### "DATABASE_URL not set"
- Replit sets this automatically
- Check Environment Variables in Replit

### "Migration failed"
- Check schema syntax in `shared/schema.ts`
- Look for type mismatches
- Use `npm run db:push --force` if schema conflict

### "Seeds running in production"
- Check `NODE_ENV=production` is set
- Seeds should show "⚠️ Skipped" message
- Review `server/seed*.ts` for environment checks

### "Users can't login"
- Verify Replit OAuth is configured
- Check `server/replitAuth.ts` settings
- Confirm `REPLIT_DEPLOYMENT` environment variable

## Best Practices

1. **Test in Development First**
   - Always test schema changes locally
   - Use `NODE_ENV=development` for testing
   - Verify migrations work before production

2. **Incremental Deployments**
   - Deploy small, focused changes
   - One feature at a time
   - Easy to debug and rollback

3. **Communication**
   - Document breaking changes
   - Notify users of maintenance windows
   - Keep deployment log

4. **Backup Awareness**
   - Replit auto-backups database
   - Know how to access checkpoints
   - Test rollback process

## Support

For deployment issues:
- Replit Docs: https://docs.replit.com
- Database Support: Use Replit Database pane
- Schema Issues: Review `shared/schema.ts`
- Auth Issues: Check `server/replitAuth.ts`
