---
## Task ID: 1 - Backend Auth System Developer
### Work Task
Implement a complete JWT-based authentication system for the Darna e-commerce backend with role-based access control.

### Work Summary

#### Files Created
1. **`/home/z/my-project/mini-services/backend/src/middleware/auth.ts`** — Auth middleware with `authenticate`, `requireAdmin` (self-contained auth+role check), `optionalAuth`, and `generateToken` helper
2. **`/home/z/my-project/mini-services/backend/src/routes/auth.ts`** — Auth routes: register, login, me, change-password

#### Files Modified
1. **`/home/z/my-project/prisma/schema.prisma`** — Added `password String` to User model
2. **`/home/z/my-project/mini-services/backend/prisma/schema.prisma`** — Added `password String` to User model
3. **`/home/z/my-project/mini-services/backend/src/index.ts`** — Mounted auth routes, updated health/banner
4. **`/home/z/my-project/mini-services/backend/src/routes/products.ts`** — POST/PUT/DELETE admin-only
5. **`/home/z/my-project/mini-services/backend/src/routes/categories.ts`** — POST/PUT/DELETE admin-only
6. **`/home/z/my-project/mini-services/backend/src/routes/orders.ts`** — Mixed auth (admin + authenticated + ownership)
7. **`/home/z/my-project/mini-services/backend/src/routes/users.ts`** — Mixed auth (admin + own profile)
8. **`/home/z/my-project/mini-services/backend/src/routes/reviews.ts`** — POST authenticated, DELETE own/admin
9. **`/home/z/my-project/mini-services/backend/src/routes/cart.ts`** — POST/PUT/DELETE authenticated with ownership
10. **`/home/z/my-project/mini-services/backend/src/routes/ai.ts`** — All routes admin-only
11. **`/home/z/my-project/mini-services/backend/src/routes/analytics.ts`** — GET admin-only, POST events public
12. **`/home/z/my-project/mini-services/backend/prisma/seed.ts`** — Hashed passwords with bcryptjs
13. **`/home/z/my-project/mini-services/backend/.env`** — Added JWT_SECRET, JWT_EXPIRES_IN
14. **`/home/z/my-project/mini-services/backend/package.json`** — Added bcryptjs, jsonwebtoken deps

#### Test Results (All Passing)
| Test | Expected | Actual |
|------|----------|--------|
| Health check | 200 | ✅ 200 |
| Register new user | 201 + token | ✅ 201 |
| Admin login | 200 + token | ✅ 200 |
| GET /me with token | 200 | ✅ 200 |
| Admin /api/users | 200 + list | ✅ 200 |
| Customer /api/users | 403 | ✅ 403 |
| No auth /api/users | 401 | ✅ 401 |
| Admin analytics | 200 + data | ✅ 200 |
| Customer analytics | 403 | ✅ 403 |
| Public products | 200 | ✅ 200 |
| Duplicate register | 409 | ✅ 409 |
| Invalid credentials | 401 | ✅ 401 |
| Short password | 400 | ✅ 400 |
| Change password | 200 | ✅ 200 |
| Login with new password | 200 | ✅ 200 |

#### Key Design Decisions
- `requireAdmin` is self-contained (authenticates + checks role) rather than requiring `authenticate` to be chained first
- Password never returned in API responses (excluded via Prisma `select`)
- Orders automatically use authenticated user's ID instead of trusting client-provided userId
- Cart operations verify ownership before modification
- Non-admin users cannot change their own role via PUT
