# ScorePulse

A real-time sports commentary and match tracking system with WebSocket support for live updates. Built with Express.js, PostgreSQL, and WebSockets.

## 🎯 Features

- **Real-time Match Updates**: Live match creation and status tracking with instant WebSocket notifications
- **Commentary System**: Post live commentary for matches with detailed event tracking
- **Match Management**: Create and manage sports matches with automatic status calculation (Scheduled → Live → Finished)
- **WebSocket Subscriptions**: Subscribe to specific matches and receive real-time commentary updates
- **Score Tracking**: Track home and away team scores in real-time
- **Event Metadata**: Store rich event information including actor, team, period, and custom metadata
- **Automatic Status Management**: Matches automatically transition between scheduled, live, and finished states based on timestamps
- **Data Validation**: Comprehensive input validation using Zod
- **Connection Management**: Automatic ping/pong heartbeat to detect and clean up stale connections

## 🏗️ Tech Stack

- **Backend**: Express.js 5.2.1
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time**: WebSockets (ws 8.19.0)
- **Validation**: Zod 4.3.6
- **Database Migrations**: Drizzle Kit
- **Environment**: Node.js with ES Modules

## 📁 Project Structure

```
ScorePulse/
├── src/
│   ├── index.js                 # Main Express app and server setup
│   ├── db/
│   │   ├── db.js               # Database connection and Drizzle instance
│   │   └── schema.js           # Database schema (Matches and Commentary tables)
│   ├── routes/
│   │   ├── matches.js          # Match API endpoints
│   │   └── commentary.js       # Commentary API endpoints
│   ├── validation/
│   │   ├── matches.js          # Zod schemas for matches validation
│   │   └── commentary.js       # Zod schemas for commentary validation
│   ├── utils/
│   │   └── match-status.js     # Match status calculation logic
│   └── ws/
│       └── server.js           # WebSocket server and broadcast logic
├── drizzle/
│   ├── meta/                   # Migration metadata
│   └── *.sql                   # Generated migration files
├── package.json
├── drizzle.config.js           # Drizzle ORM configuration
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- pnpm (or npm/yarn)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ZammadNasir/score-pulse.git
   cd scorepulse
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Create `.env` file**
   ```bash
   cp .env.example .env
   ```
   
   Add your PostgreSQL connection string:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/scorepulse
   PORT=8000
   HOST=0.0.0.0
   ```

4. **Set up the database**
   ```bash
   # Generate initial migration
   pnpm run db:generate
   
   # Run migrations
   pnpm run db:migrate
   ```

5. **Start the server**
   ```bash
   # Development mode (with auto-reload)
   pnpm run dev
   
   # Production mode
   pnpm start
   ```

The server will start on `http://localhost:8000` and WebSocket on `ws://localhost:8000/ws`

## 📚 API Documentation

### Base URL
```
http://localhost:8000
```

### Matches Endpoints

#### Get All Matches
```
GET /matches?limit=50
```

**Query Parameters:**
- `limit` (optional): Number of matches to return (default: 50, max: 100)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "sport": "football",
      "homeTeam": "Manchester United",
      "awayTeam": "Liverpool",
      "status": "live",
      "startTime": "2026-02-28T15:00:00Z",
      "endTime": "2026-02-28T17:00:00Z",
      "homeScore": 2,
      "awayScore": 1,
      "createdAt": "2026-02-28T14:55:00Z"
    }
  ]
}
```

#### Create Match
```
POST /matches
Content-Type: application/json
```

**Request Body:**
```json
{
  "sport": "football",
  "homeTeam": "Manchester United",
  "awayTeam": "Liverpool",
  "startTime": "2026-02-28T15:00:00Z",
  "endTime": "2026-02-28T17:00:00Z",
  "homeScore": 0,
  "awayScore": 0
}
```

**Response:**
```json
{
  "data": {
    "id": 1,
    "sport": "football",
    "homeTeam": "Manchester United",
    "awayTeam": "Liverpool",
    "status": "scheduled",
    "startTime": "2026-02-28T15:00:00Z",
    "endTime": "2026-02-28T17:00:00Z",
    "homeScore": 0,
    "awayScore": 0,
    "createdAt": "2026-02-28T14:55:00Z"
  }
}
```

### Commentary Endpoints

#### Get Commentary for a Match
```
GET /matches/:id/commentary?limit=10
```

**Query Parameters:**
- `limit` (optional): Number of commentary entries (default: 10, max: 100)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "matchId": 1,
      "minute": 45,
      "sequence": 1,
      "period": "first half",
      "eventType": "goal",
      "actor": "Cristiano Ronaldo",
      "team": "Manchester United",
      "message": "Goal! Cristiano Ronaldo scores!",
      "metadata": { "assist": "Bruno Fernandes" },
      "tags": "goal,exciting",
      "createdAt": "2026-02-28T15:45:00Z"
    }
  ]
}
```

#### Create Commentary Entry
```
POST /matches/:id/commentary
Content-Type: application/json
```

**Request Body:**
```json
{
  "minutes": 45,
  "sequence": 1,
  "period": "first half",
  "eventType": "goal",
  "actor": "Cristiano Ronaldo",
  "team": "Manchester United",
  "message": "Goal! Cristiano Ronaldo scores!",
  "metadata": {
    "assist": "Bruno Fernandes",
    "method": "header"
  },
  "tags": ["goal", "exciting"]
}
```

**Response:**
```json
{
  "data": {
    "id": 1,
    "matchId": 1,
    "minute": 45,
    "sequence": 1,
    "period": "first half",
    "eventType": "goal",
    "actor": "Cristiano Ronaldo",
    "team": "Manchester United",
    "message": "Goal! Cristiano Ronaldo scores!",
    "metadata": { "assist": "Bruno Fernandes" },
    "tags": "goal,exciting",
    "createdAt": "2026-02-28T15:45:00Z"
  }
}
```

## 🔌 WebSocket API

Connect to the WebSocket server at `ws://localhost:8000/ws`

### Authentication & Connection
```javascript
const ws = new WebSocket('ws://localhost:8000/ws');

ws.onopen = () => {
  console.log('Connected to WebSocket');
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Received:', message);
};
```

### Subscribe to Match Updates
Send a subscription message with the match ID:
```json
{
  "type": "subscribe",
  "matchId": 1
}
```

**Response:**
```json
{
  "type": "subscribed",
  "matchId": 1
}
```

### Unsubscribe from Match
```json
{
  "type": "unsubscribe",
  "matchId": 1
}
```

**Response:**
```json
{
  "type": "unsubscribed",
  "matchId": 1
}
```

### Receive Live Updates

#### New Commentary Broadcast
When commentary is posted, all subscribed clients receive:
```json
{
  "type": "commentary",
  "data": {
    "id": 1,
    "matchId": 1,
    "minute": 45,
    "sequence": 1,
    "eventType": "goal",
    "actor": "Cristiano Ronaldo",
    "team": "Manchester United",
    "message": "Goal! Cristiano Ronaldo scores!",
    "createdAt": "2026-02-28T15:45:00Z"
  }
}
```

#### New Match Created Broadcast
All connected clients receive:
```json
{
  "type": "match_created",
  "data": {
    "id": 1,
    "sport": "football",
    "homeTeam": "Manchester United",
    "awayTeam": "Liverpool",
    "status": "scheduled",
    "startTime": "2026-02-28T15:00:00Z",
    "endTime": "2026-02-28T17:00:00Z",
    "homeScore": 0,
    "awayScore": 0,
    "createdAt": "2026-02-28T14:55:00Z"
  }
}
```

#### Welcome Message
Upon connection:
```json
{
  "type": "welcome"
}
```

#### Error Messages
```json
{
  "type": "error",
  "message": "Invalid JSON"
}
```

## 🧪 Testing with wscat

Install wscat globally:
```bash
npm install -g wscat
```

### Test WebSocket Connection
**Terminal 1 - Connect and Subscribe:**
```bash
wscat -c ws://localhost:8000/ws
```

Once connected, subscribe to a match:
```
{"type": "subscribe", "matchId": 1}
```

**Terminal 2 - Create Commentary:**
```bash
curl -X POST http://localhost:8000/matches/1/commentary \
  -H "Content-Type: application/json" \
  -d '{
    "minutes": 45,
    "eventType": "goal",
    "actor": "Player Name",
    "team": "Team Name",
    "message": "Goal scored!"
  }'
```

You should see the commentary broadcast in Terminal 1's wscat connection!

## 🗄️ Database Schema

### Matches Table
```
id          - Primary key (serial)
sport       - Sport type (varchar 50)
homeTeam    - Home team name (varchar 100)
awayTeam    - Away team name (varchar 100)
status      - Match status enum (scheduled, live, finished)
startTime   - Match start time (timestamp)
endTime     - Match end time (timestamp)
homeScore   - Home team score (integer)
awayScore   - Away team score (integer)
createdAt   - Creation timestamp (timestamp)
```

### Commentary Table
```
id          - Primary key (serial)
matchId     - Foreign key to matches
minute      - Event minute (integer)
sequence    - Event sequence (integer)
period      - Period/phase name (varchar 20)
eventType   - Type of event (varchar 50)
actor       - Player/actor name (varchar 100)
team        - Team name (varchar 100)
message     - Commentary text (text)
metadata    - Additional JSON data (jsonb)
tags        - Comma-separated tags (text)
createdAt   - Creation timestamp (timestamp)
```

## 🔧 Database Commands

```bash
# Generate migrations
pnpm run db:generate

# Run migrations
pnpm run db:migrate

# Open Drizzle Studio (GUI for database)
pnpm run db:studio
```

## 🛠️ Development

### Run in Development Mode
```bash
pnpm run dev
```

Auto-reload enabled with `--watch` flag.

### Project Scripts
- `pnpm run dev` - Start with auto-reload
- `pnpm start` - Start production server
- `pnpm run db:generate` - Generate database migrations
- `pnpm run db:migrate` - Run database migrations
- `pnpm run db:studio` - Open Drizzle Studio GUI

## 📊 Match Status Logic

Matches transition between states automatically based on timestamps:

```
Now < startTime      → scheduled
startTime ≤ Now ≤ endTime → live
Now > endTime        → finished
```

## 🔐 Validation

All inputs are validated using Zod schemas:

- **Match Creation**: Sport, team names, timestamps, scores
- **Commentary**: Minute, event type, actor, team, message
- **Time Validation**: endTime must be after startTime
- **Score Validation**: Non-negative integers
- **Message Validation**: Non-empty strings

## 🚨 Error Handling

The API returns appropriate HTTP status codes:

- `200` - Success
- `201` - Resource created
- `400` - Invalid request (validation error)
- `500` - Server error


## 📝 License

ISC

## 👤 Author

Zammad Nasir

