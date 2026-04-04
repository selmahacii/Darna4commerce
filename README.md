# Darna — Algerian Artisan E-Commerce Platform

> A premium, full-stack e-commerce platform celebrating Algerian craftsmanship.
> Built with Next.js 16, Node.js Express, Three.js & Prisma.

---

## Architecture

```mermaid
graph TB
    subgraph Client["Client (Browser)"]
        U[User]
    end

    subgraph Gateway["Caddy Reverse Proxy :3000"]
        C1["/ → Frontend"]
        C2["/api/* → Backend :3003"]
    end

    subgraph Frontend["Next.js Frontend :3000"]
        NX["App Router<br/>React 19 + TypeScript"]
        R3["Three.js 3D<br/>HeroScene + ProductViewer"]
        ZS["Zustand Stores<br/>cart · wishlist · auth"]
        SH["shadcn/ui + Tailwind<br/>Framer Motion Animations"]
    end

    subgraph Backend["Express Backend :3003"]
        AUTH["JWT Auth Middleware<br/>bcrypt + jsonwebtoken"]
        R1["/api/auth — Register, Login, Me"]
        R2["/api/products — CRUD + Filter"]
        R3B["/api/categories — CRUD"]
        R4["/api/orders — Create + Status"]
        R5["/api/users — Manage + Points"]
        R6["/api/cart — Session/User"]
        R7["/api/reviews — CRUD"]
        R8["/api/ai — Recommendations"]
        R9["/api/analytics — KPIs"]
    end

    subgraph DB["Database Layer"]
        PR["Prisma ORM"]
        SQ["SQLite<br/>db/custom.db"]
    end

    U -->|"HTTP"| Gateway
    Gateway -->|"Route"| Frontend
    Gateway -->|"XTransformPort=3003"| Backend
    Frontend -->|"API calls<br/>XTransformPort=3003"| Backend
    Frontend -->|"Zustand persist<br/>localStorage"| Client
    Backend --> AUTH
    AUTH --> R1 & R2 & R3B & R4 & R5 & R6 & R7 & R8 & R9
    R1 & R2 & R3B & R4 & R5 & R6 & R7 & R8 & R9 --> PR
    PR --> SQ
```

---

## Database Schema

```mermaid
erDiagram
    User {
        string id PK
        string email UK
        string name
        string role "admin | customer"
        string password
        int points
        int level
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    Category {
        string id PK
        string name
        string slug UK
        string description
        string image
        string parentId
        datetime createdAt
        datetime updatedAt
    }

    Product {
        string id PK
        string name
        string slug UK
        string description
        float price
        float comparePrice
        string categoryId FK
        string images "JSON array"
        int stock
        boolean isFeatured
        boolean isNew
        float rating
        int reviewCount
        string tags "JSON array"
        datetime createdAt
        datetime updatedAt
    }

    Order {
        string id PK
        string userId FK
        string status "pending|processing|shipped|delivered|cancelled"
        float total
        float subtotal
        float tax
        float shipping
        string address
        string city
        string country
        string paymentMethod
        datetime createdAt
        datetime updatedAt
    }

    OrderItem {
        string id PK
        string orderId FK
        string productId FK
        int quantity
        float price
        string color
        string material
        string engraving
    }

    CartItem {
        string id PK
        string userId FK
        string sessionId
        string productId FK
        int quantity
        string color
        string material
    }

    Review {
        string id PK
        string productId FK
        string userId FK
        int rating
        string title
        string comment
        datetime createdAt
    }

    Badge {
        string id PK
        string name
        string description
        string icon
        int requirement
    }

    UserBadge {
        string id PK
        string userId FK
        string badgeId FK
        datetime earnedAt
    }

    PointHistory {
        string id PK
        string userId FK
        int points
        string reason
        datetime createdAt
    }

    AnalyticsEvent {
        string id PK
        string event
        string properties "JSON"
        string sessionId
        string userId
        datetime createdAt
    }

    User ||--o{ Order : "places"
    User ||--o{ Review : "writes"
    User ||--o{ CartItem : "has"
    User ||--o{ UserBadge : "earns"
    User ||--o{ PointHistory : "accumulates"

    Category ||--o{ Product : "contains"

    Product ||--o{ OrderItem : "included in"
    Product ||--o{ Review : "has"
    Product ||--o{ CartItem : "in cart"

    Order ||--o{ OrderItem : "contains"

    Badge ||--o{ UserBadge : "awarded to"
```

---

## Data Flow — Authentication & Requests

```mermaid
sequenceDiagram
    actor C as Client
    participant F as Next.js Frontend
    participant G as Caddy Gateway
    participant B as Express Backend
    participant D as SQLite DB

    Note over C,D: Login Flow
    C->>F: Enter email + password
    F->>G: POST /api/auth/login?XTransformPort=3003
    G->>B: Forward to :3003
    B->>D: Find user by email
    D-->>B: User record (hashed password)
    B->>B: bcrypt.compare(password, hash)
    B->>B: Generate JWT token
    B-->>G: { user, token }
    G-->>F: JSON response
    F->>F: Store token in Zustand + localStorage

    Note over C,D: Authenticated Request
    C->>F: Click "Place Order"
    F->>G: POST /api/orders?XTransformPort=3003<br/>Authorization: Bearer <token>
    G->>B: Forward with headers
    B->>B: authenticate middleware<br/>Verify JWT → attach req.user
    B->>D: db.$transaction(order creation)
    D-->>B: Success
    B-->>G: 201 Order created
    G-->>F: JSON response
    F-->>C: Show confirmation
```

---

## Roles & Permissions

```mermaid
graph LR
    subgraph Public["Public (No Auth)"]
        P1[Browse products]
        P2[View categories]
        P3[Search catalog]
        P4[Register / Login]
    end

    subgraph Customer["Customer (JWT Token)"]
        C1[View profile]
        C2[Place orders]
        C3[Write reviews]
        C4[Manage cart]
        C5[Use wishlist]
        C6[Change password]
    end

    subgraph Admin["Admin (role=admin)"]
        A1[Admin dashboard]
        A2[CRUD products]
        A3[CRUD categories]
        A4[Manage orders]
        A5[Manage users]
        A6[View analytics]
        A7[Award points]
    end

    Public -->|"Login"| Customer
    Customer -->|"role=admin"| Admin
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript 5 |
| 3D Engine | Three.js, @react-three/fiber, @react-three/drei |
| UI | shadcn/ui (New York), Tailwind CSS 4, Radix UI |
| Animations | Framer Motion 12 |
| State | Zustand 5 (persisted to localStorage) |
| Charts | Recharts 2 |
| Backend | Node.js Express 5, TypeScript |
| Runtime | Bun 1 |
| Database | SQLite + Prisma ORM 6 |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Security | Helmet, CORS |
| Proxy | Caddy |
| Container | Docker (multi-stage), Docker Compose |

---

## Getting Started Locally

### Prerequisites

- **[Bun](https://bun.sh/)** v1.0+ (install: `curl -fsSL https://bun.sh/install | bash`)
- **[Docker](https://docs.docker.com/get-docker/)** + Docker Compose (optional, for migration)
- **[Git](https://git-scm.com/)**

### Step 1 — Clone the repository

```bash
git clone <your-repo-url> darna
cd darna
```

### Step 2 — Install dependencies

```bash
# Frontend
bun install

# Backend
cd mini-services/backend
bun install
cd ../..
```

### Step 3 — Initialize the database

```bash
# Push Prisma schema (creates tables)
bun run db:push

cd mini-services/backend
bun run db:push

# Seed demo data (8 products, 5 categories, 2 users, badges...)
bun run seed

cd ../..
```

### Step 4 — Start both servers

You need **two terminals**:

```bash
# ─── Terminal 1: Backend API ───
cd mini-services/backend
bun run dev
# → Running on http://localhost:3003
```

```bash
# ─── Terminal 2: Next.js Frontend ───
bun run dev
# → Running on http://localhost:3000
```

### Step 5 — Open the app

Go to **http://localhost:3000** in your browser.

#### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@darna.dz` | `admin123` |
| **Customer** | `amina@email.com` | `amina123` |

---

## Migrating to Production with Docker

### How It Works

```mermaid
flowchart TD
    A["docker compose up --build"] --> B["Stage 1: Install dependencies<br/>bun install --frozen-lockfile"]
    B --> C["Stage 2: Build Next.js<br/>bun run build → standalone output"]
    C --> D["Stage 3: Production image<br/>Non-root user, minimal layers"]
    D --> E["Entry script runs:"]
    E --> F["Generate Prisma clients<br/>(frontend + backend)"]
    F --> G["Push DB schema<br/>(creates tables if missing)"]
    G --> H{DB empty?}
    H -->|Yes| I["Seed demo data"]
    H -->|No| J["Skip seeding"]
    I --> K["Start Backend :3003"]
    J --> K
    K --> L["Health check wait<br/>(up to 15s)"]
    L --> M["Start Frontend :3000"]
    M --> N["App live on port 3000"]
```

### Docker Build Details

```mermaid
graph LR
    subgraph Stage1["Stage 1 — deps"]
        S1A["Copy package files"]
        S1B["bun install --frozen-lockfile"]
    end

    subgraph Stage2["Stage 2 — builder"]
        S2A["Copy all source code"]
        S2B["Generate Prisma client"]
        S2C["bun run build<br/>→ .next/standalone/"]
    end

    subgraph Stage3["Stage 3 — runner"]
        S3A["Non-root user (darna:1001)"]
        S3B["Copy standalone build"]
        S3C["Copy backend + Prisma"]
        S3D["docker-entrypoint.sh"]
    end

    Stage1 --> Stage2 --> Stage3
```

### Step 1 — Build and launch

```bash
docker compose up -d --build
```

This single command:
- Builds the multi-stage Docker image
- Creates a persistent volume for the SQLite database
- Starts the container in detached mode
- Exposes port **3000**

### Step 2 — Verify it's running

```bash
# Check container status
docker compose ps

# View live logs
docker compose logs -f
```

You should see:
```
🚀 Starting backend API server...
   ✅ Backend is healthy (PID: ...)
🚀 Starting Next.js frontend on port 3000...
```

### Step 3 — Access the app

Open **http://localhost:3000** in your browser.

### Step 4 — Configure for production

Before going live, edit `docker-compose.yml`:

```yaml
environment:
  - JWT_SECRET=your-strong-random-secret-here   # <-- CHANGE THIS
  - JWT_EXPIRES_IN=7d
  - NODE_ENV=production
```

Then restart:

```bash
docker compose up -d --build --force-recreate
```

### Useful Docker Commands

| Command | Description |
|---------|-------------|
| `docker compose up -d --build` | Build & start |
| `docker compose logs -f` | Follow logs |
| `docker compose restart` | Restart container |
| `docker compose down` | Stop container (data preserved) |
| `docker compose down -v` | Stop + **delete database** |
| `docker compose up -d --build --force-recreate` | Full rebuild |

### Backing Up the Database

The SQLite file lives inside the Docker volume at `/app/db/custom.db`.

```bash
# Copy database out of the container
docker cp darna-ecommerce:/app/db/custom.db ./backup-$(date +%Y%m%d).db

# Restore from backup
docker cp ./backup-20250101.db darna-ecommerce:/app/db/custom.db
docker compose restart
```

---

## Project Structure

```mermaid
graph TD
    ROOT["darna/"] --> SRC["src/"]
    ROOT --> MS["mini-services/backend/"]
    ROOT --> DB["db/custom.db"]
    ROOT --> DOCKER["Dockerfile"]
    ROOT --> DC["docker-compose.yml"]
    ROOT --> ENTRY["docker-entrypoint.sh"]
    ROOT --> PUB["public/"]

    SRC --> APP["app/page.tsx<br/>app/layout.tsx<br/>app/globals.css"]
    SRC --> COMP["components/"]
    SRC --> STORES["stores/<br/>app-store.ts<br/>cart-store.ts<br/>wishlist-store.ts"]
    SRC --> LIB["lib/format.ts<br/>lib/db.ts"]

    COMP --> ECOM["ecommerce/<br/>Navbar.tsx<br/>ProductCard.tsx<br/>CartDrawer.tsx<br/>AdminDashboard.tsx"]
    COMP --> THREE["three/<br/>HeroScene3D.tsx<br/>ProductViewer3D.tsx"]
    COMP --> UI["ui/ (40+ shadcn components)"]

    MS --> IDX["src/index.ts<br/>(Express entry)"]
    MS --> ROUTES["src/routes/<br/>auth · products · categories<br/>orders · users · cart<br/>reviews · ai · analytics"]
    MS --> MW["src/middleware/<br/>auth.ts · errorHandler.ts"]
    MS --> PRISMA["prisma/<br/>schema.prisma<br/>seed.ts"]
```

---

## API Endpoints Summary

```mermaid
graph LR
    subgraph Public["Public Endpoints"]
        PA["POST /api/auth/register"]
        PB["POST /api/auth/login"]
        PC["GET /api/products"]
        PD["GET /api/products/:id"]
        PE["GET /api/categories"]
        PF["GET /api/reviews/product/:id"]
        PG["GET /api/health"]
    end

    subgraph Auth["Authenticated (JWT)"]
        AA["GET /api/auth/me"]
        AB["PUT /api/auth/change-password"]
        AC["POST /api/orders"]
        AD["GET /api/orders/user/:id"]
        AE["POST /api/reviews"]
        AF["POST/PUT/DELETE /api/cart"]
        AG["GET/PUT /api/users/:id (own)"]
    end

    subgraph Admin["Admin Only (role=admin)"]
        AX["POST/PUT/DELETE /api/products"]
        AY["POST/PUT/DELETE /api/categories"]
        AZ["GET /api/orders"]
        BA["PATCH /api/orders/:id/status"]
        BB["GET /api/users"]
        BC["DELETE /api/users/:id"]
        BD["POST /api/users/:id/points"]
        BE["GET /api/analytics/summary"]
        BF["GET /api/ai/recommendations"]
    end

    Public -->|"Login"| Auth
    Auth -->|"role=admin"| Admin
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | `development` or `production` |
| `DATABASE_URL` | `file:./db/custom.db` | Path to SQLite database |
| `PORT` | `3003` | Backend API port |
| `JWT_SECRET` | `darna-secret-key-2025` | **Must change in production** |
| `JWT_EXPIRES_IN` | `7d` | Token expiration time |

---
