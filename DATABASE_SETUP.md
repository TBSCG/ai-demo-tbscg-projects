# Database Setup Guide

This guide will help you set up PostgreSQL for the Project Management application.

## Prerequisites

- PostgreSQL 18.0 (or compatible version)
- Node.js 22.18.0
- NPM 10.2.0

## Installation Steps

### 1. Install PostgreSQL

#### macOS (using Homebrew)
```bash
brew install postgresql@18
brew services start postgresql@18
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql-18
sudo systemctl start postgresql
```

#### Windows
Download and install from: https://www.postgresql.org/download/windows/

### 2. Create Database

Once PostgreSQL is running, create the database:

```bash
# Connect to PostgreSQL
psql postgres

# In the PostgreSQL prompt, create the database
CREATE DATABASE project_management_db;

# Exit
\q
```

Alternatively, use createdb command:
```bash
createdb project_management_db
```

### 3. Configure Environment

Create a `.env` file in the `backend/` directory:

```bash
cd backend
cp .env.example .env
```

Edit `.env` and update the `DATABASE_URL`:

```env
DATABASE_URL=postgres://username:password@localhost:5432/project_management_db
```

Replace `username` and `password` with your PostgreSQL credentials.

**Default PostgreSQL credentials:**
- Username: `postgres` (or your system username on macOS)
- Password: (empty by default on local installations, or as set during installation)

**Example URLs:**
```env
# macOS with default user
DATABASE_URL=postgres://localhost:5432/project_management_db

# With specific user and password
DATABASE_URL=postgres://myuser:mypass@localhost:5432/project_management_db

# Custom port
DATABASE_URL=postgres://localhost:5433/project_management_db
```

### 4. Run Migrations

Apply the database schema:

```bash
cd backend
npm run db:migrate
```

You should see:
```
🔄 Running database migrations...
✅ Migrations completed successfully!
```

### 5. Seed Database

Populate with sample data:

```bash
npm run db:seed
```

You should see:
```
🌱 Starting database seed...
📦 Inserting projects...
   ✓ Created project: Website Redesign
   ✓ Added 4 phases
   ...
✅ Database seeded successfully!
   📊 8 projects created
   📈 26 phases created
```

## Verification

### Check Database Connection

```bash
psql project_management_db
```

In PostgreSQL prompt:
```sql
-- List all tables
\dt

-- Check projects
SELECT id, title, client FROM projects;

-- Check phases
SELECT id, name, project_id FROM phases;

-- Exit
\q
```

### Expected Tables

You should see:
- `projects` table with 8 sample projects
- `phases` table with 26 phases

## Troubleshooting

### PostgreSQL not running
```bash
# macOS
brew services start postgresql@18

# Linux
sudo systemctl start postgresql

# Check status
pg_isready
```

### Connection refused
- Ensure PostgreSQL is running
- Check if the port (default 5432) is correct
- Verify firewall settings

### Authentication failed
- Check username and password in DATABASE_URL
- On macOS, try using your system username without password
- Update `pg_hba.conf` if needed (usually in `/usr/local/var/postgresql@18/`)

### Database doesn't exist
```bash
createdb project_management_db
```

### Permission denied
```bash
# Grant permissions (as postgres user)
psql postgres
GRANT ALL PRIVILEGES ON DATABASE project_management_db TO your_username;
```

### Reset database
If you need to start fresh:

```bash
# Drop and recreate database
dropdb project_management_db
createdb project_management_db

# Run migrations and seed again
npm run db:migrate
npm run db:seed
```

## Database Commands Reference

### Available NPM Scripts

```bash
# Generate new migration from schema changes
npm run db:generate

# Apply pending migrations
npm run db:migrate

# Seed the database with sample data
npm run db:seed
```

### PostgreSQL Commands

```bash
# Connect to database
psql project_management_db

# List databases
\l

# List tables
\dt

# Describe table
\d projects
\d phases

# Run SQL query
SELECT * FROM projects;

# Exit
\q
```

## Next Steps

Once your database is set up and seeded:

1. Start the backend server: `npm run dev` (from backend directory)
2. The API will be available at `http://localhost:3000`
3. Test the API endpoints with the frontend or API client

## Need Help?

- PostgreSQL Documentation: https://www.postgresql.org/docs/
- Drizzle ORM Documentation: https://orm.drizzle.team/
- Check the `api-spec.md` for API endpoint details

