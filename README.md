# TaskFlow — Kanban Project Management Board

> A Trello-like, drag-and-drop team task management application.  
> Next.js 14 · PostgreSQL · dnd-kit · NextAuth · Vercel

---
 
## 🚀 Live Demo

**[taskflow-kanban.vercel.app](https://taskflow-kr8fly0l2-ozgemelteminans-projects.vercel.app)**

---

## 📋 Project Overview

A Kanban board application designed for small software teams. Users can create accounts, manage tasks through boards, columns, and cards, and move cards between columns via drag-and-drop. All ordering is persistently stored in the database.

---

## ✅ Implemented Features

| Feature | Status |
|---------|--------|
| User registration & login (bcrypt encrypted) | ✅ |
| Board creation / deletion | ✅ |
| Column add / rename / delete | ✅ |
| Card add / edit / delete | ✅ |
| Drag-and-drop between columns | ✅ |
| Card reordering within columns | ✅ |
| Column reordering via drag-and-drop | ✅ |
| Order preserved on page refresh | ✅ |
| Card details: title, description | ✅ |
| Card labels (Bug, Feature, Design…) | ✅ |
| Card priority (Low / Medium / High) | ✅ |
| Due date with overdue warning | ✅ |
| Assignee field | ✅ |
| Activity history panel | ✅ |
| Mobile touch support (TouchSensor) | ✅ |
| Visual drag overlay | ✅ |

---

## 🏗️ Technical Architecture

```
taskflow/
├── prisma/
│   └── schema.prisma          # Data model
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/          # NextAuth + register endpoint
│   │   │   ├── boards/        # CRUD + activity log
│   │   │   ├── columns/       # CRUD + ordering
│   │   │   └── cards/         # CRUD + bulk reorder
│   │   ├── dashboard/         # Board list (SSR)
│   │   ├── board/[id]/        # Kanban board (SSR + CSR)
│   │   ├── login/
│   │   └── register/
│   ├── components/
│   │   ├── board/
│   │   │   ├── BoardClient    # Core D&D logic
│   │   │   ├── SortableColumn # Draggable column
│   │   │   ├── CardItem       # Draggable card
│   │   │   ├── CardModal      # Card editor
│   │   │   └── ActivityPanel  # History panel
│   │   └── ui/
│   │       └── Modal          # Reusable modal
│   ├── lib/
│   │   ├── auth.ts            # NextAuth config
│   │   ├── prisma.ts          # Singleton client
│   │   └── utils.ts           # Constants + helpers
│   └── types/
│       └── index.ts           # TypeScript types
```

### Data Model Relationship

```
User ──< Board ──< Column ──< Card
              └──< Activity
```

Each `Column` and `Card` carries an `order: Int` field. After drag-end, the `/api/cards/reorder` endpoint atomically updates all orders via a Prisma `$transaction` — ordering is fully preserved on page refresh.

---

## 🔧 Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | Next.js 14 (App Router) | SSR + API Routes in one package |
| Auth | NextAuth.js v4 | JWT session, credentials provider |
| Database | PostgreSQL (Neon) | Relational data, free cloud tier |
| ORM | Prisma | Type-safe queries, easy migrations |
| Drag & Drop | **dnd-kit** | Actively maintained, TS native, mobile-ready |
| Styling | Tailwind CSS | Utility-first, rapid prototyping |
| Deploy | Vercel | Next.js native, automatic CI/CD |

---

## 🤔 Design Decisions & Q&A

### 1. Drag-and-Drop Library Selection

**Choice: `dnd-kit`**

| Library | Speed | Mobile | Bundle | Maintenance |
|---------|-------|--------|--------|-------------|
| **dnd-kit** ✅ | ⚡ Very fast | ✅ PointerSensor + TouchSensor | ~10kb | Actively developed |
| react-beautiful-dnd | Fast | ⚠️ Limited | ~30kb | ❌ Archived (Atlassian, 2023) |
| @hello-pangea/dnd | Fast | ⚠️ Limited | ~35kb | Fork, active but dependent |
| SortableJS | Very fast | ✅ | ~15kb | ⚠️ Poor React integration (ref-based) |
| Native Browser D&D | Fast | ❌ Broken | 0kb | Native but no touch events |

**Why dnd-kit won:** Native TypeScript support, dual `PointerSensor` + `TouchSensor` strategy for both desktop and mobile, actively maintained, and small bundle size.

---

### 2. How Is Sort Order Stored?

Every `Card` and `Column` carries an `order: Int` field in the database.

**Flow:**
1. User drags a card → UI updates immediately (optimistic update)
2. Drag ends → request sent to `/api/cards/reorder`
3. Endpoint atomically updates all `order` and `columnId` values via Prisma `$transaction`
4. On page refresh, DB returns items with `orderBy: { order: "asc" }` — no data loss

**Why not fractional indexing:** Decimal ordering (`1.0`, `1.5`, `1.25`) requires fewer DB writes but introduces floating point precision edge cases that aren't worth the risk in a 48-hour project. Integer index + bulk update is more robust.

---

### 3. Drag-and-Drop on Mobile Devices

**Solution: `TouchSensor` with 300ms long-press activation**

```typescript
useSensor(TouchSensor, {
  activationConstraint: { delay: 300, tolerance: 5 }
})
```

- **300ms delay:** Separates short tap (click) from drag initiation
- **5px tolerance:** Minor finger tremor won't cancel the drag
- **Overlay offset:** Drag ghost is shifted +16px right so it's not hidden under the finger
- **Responsive design:** Tailwind ensures proper layout across all screen sizes

---

### 4. Can Column Order Be Changed?

**Yes.** Columns also carry an `order: Int` field and support horizontal drag-and-drop via `horizontalListSortingStrategy`. When a column is moved, all column `order` values are updated in the DB.

---

### 5. Labels, Due Dates, Assignees — Which Is Worth 48 Hours?

**Decision: All of them — managed through a single modal.**

| Feature | Value | Cost | Decision |
|---------|-------|------|----------|
| Labels (tags) | High — visual categorization | Low — string array | ✅ Added |
| Due date | High — overdue warning | Low — date input | ✅ Added |
| Assignee | Medium — ownership visibility | Very low — text input | ✅ Added |
| Priority | High — visual color coding | Very low — 3 buttons | ✅ Added |

Since everything lives in `CardModal`, complexity was minimal. The 48-hour balance: "core features done right + useful extras" rather than "few features perfect" or "many features half-done."

---

### 6. Board Sharing

**Decision: Out of scope.**

Proper multi-user sync requires WebSockets, conflict resolution, and a permission system — investing that time would have compromised the core drag-and-drop experience. Instead:

- ✅ Single-user experience made polished
- ✅ Drag-and-drop + data persistence hardened

Sharing is marked as a future improvement:
- Read-only public link (easy — token-based)
- Real-time collaborative editing (hard — requires Supabase Realtime or Pusher)

---

### 7. Is Activity History Valuable?

**Yes — it was implemented.** In a team context, "who moved this card and when?" is a frequently needed answer.

**How it works:**
- Every card move logs `{ action, fromCol, toCol, userId, boardId }` to the `Activity` table
- Card creation is also logged
- The "Activity" button in the header opens a right-side panel
- Shows the last 50 events: who did what and when

---

### 8. Performance with Many Cards

**Yes, stays smooth — thanks to a few optimizations:**

- **Optimistic update:** UI updates instantly on drag-end, no waiting for DB response
- **Per-column SortableContext:** Each column has its own context, only the relevant column re-renders during drag
- **dnd-kit's virtual model:** Minimal real DOM manipulation, maintains 60fps
- **DragOverlay:** The dragged element's clone renders outside the DOM tree, preventing layout thrashing

Practical limit: 200+ cards in a single column remain smooth. Beyond that, virtualization (react-virtual) can be added.

---

## 🗄️ Database Schema

```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String   // bcrypt hash, never plain text
  boards    Board[]
}

model Board {
  id         String     @id @default(cuid())
  name       String
  color      String
  emoji      String
  userId     String
  columns    Column[]
  activities Activity[]
}

model Column {
  id      String @id @default(cuid())
  name    String
  color   String
  order   Int           // sort order
  boardId String
  cards   Card[]
}

model Card {
  id       String    @id @default(cuid())
  title    String
  desc     String?
  order    Int           // sort order
  priority String        // low | mid | high
  due      DateTime?
  assignee String?
  tags     String[]      // PostgreSQL string array
  columnId String
}

model Activity {
  id      String   @id @default(cuid())
  action  String
  fromCol String?
  toCol   String?
  boardId String
  userId  String
}
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/boards` | List user's boards |
| `POST` | `/api/boards` | Create new board |
| `GET` | `/api/boards/:id` | Board detail (with columns + cards) |
| `DELETE` | `/api/boards/:id` | Delete board |
| `GET` | `/api/boards/:id/activity` | Get activity history |
| `POST` | `/api/boards/:id/activity` | Log activity |
| `POST` | `/api/columns` | Add column |
| `PUT` | `/api/columns/:id` | Update / reorder column |
| `DELETE` | `/api/columns/:id` | Delete column |
| `POST` | `/api/cards` | Add card |
| `PUT` | `/api/cards/:id` | Update card |
| `DELETE` | `/api/cards/:id` | Delete card |
| `POST` | `/api/cards/reorder` | Bulk reorder after drag-and-drop |
| `POST` | `/api/auth/register` | New user registration |

All endpoints are protected via `getServerSession` — returns `401` if unauthenticated.

---

## 💻 Local Setup

```bash
# 1. Clone
git clone https://github.com/USERNAME/taskflow-kanban.git
cd taskflow-kanban

# 2. Install dependencies
npm install

# 3. Set environment variables
cp .env.example .env
# Edit .env with your values

# 4. Create database tables
npx prisma db push

# 5. Start dev server
npm run dev
```

`.env` contents:
```env
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
NEXTAUTH_SECRET="at-least-32-chars-random-string"
NEXTAUTH_URL="http://localhost:3000"
```

---

## ☁️ Vercel Deployment

1. **Database**: [neon.tech](https://neon.tech) → Free PostgreSQL → copy connection string
2. **GitHub**: Push the project
3. **Vercel**: Import → Add Environment Variables:
   ```
   DATABASE_URL     = neon connection string
   NEXTAUTH_SECRET  = strong random value
   NEXTAUTH_URL     = https://your-project.vercel.app
   ```
4. **Deploy** → then run: `npx prisma db push`

---

## 🔮 Future Improvements

- [ ] Board sharing (read-only public link)
- [ ] Real-time collaboration (Pusher or Supabase Realtime)
- [ ] Card search and label filtering
- [ ] WIP (Work in Progress) limits per column
- [ ] Card archiving
- [ ] CSV / JSON export
- [ ] Due date notification system

