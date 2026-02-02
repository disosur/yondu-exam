# yondu-exam

A simple full-stack Todo application with category-scoped tasks (`personal` and `professional`), built with an Express backend and a React SPA frontend using TanStack Router and TanStack Query.

---

## Architecture Overview

The application is split into two main parts:

- **Backend**: Express API (versioned under `/api/v1`)
- **Frontend**: React SPA using TanStack Router and TanStack Query

The backend is the source of truth for task state, while the frontend mirrors and persists state locally for resilience across reloads.

---

## Data Model

Each todo has the following shape:

- `id`: string
- `text`: string
- `completed`: boolean
- `category`: `personal | professional`

Todos are always scoped to a category.

---

## Backend

### API Versioning

All routes are versioned under:

```
/api/v1/todos
```

This allows future iterations (`v2`, `v3`, etc.) without breaking existing clients.

### Storage

- Todos are stored **in memory** on the server
- Data is reset when the server restarts
- The backend is the authoritative source for task state

### Routes

| Method | Route                               | Description                          |
| ------ | ----------------------------------- | ------------------------------------ |
| GET    | `/api/v1/todos?category=`           | Get todos by category                |
| POST   | `/api/v1/todos`                     | Create a todo                        |
| PUT    | `/api/v1/todos/:id`                 | Update a todo                        |
| PATCH  | `/api/v1/todos/:id/toggle`          | Toggle completed state               |
| DELETE | `/api/v1/todos/:id`                 | Delete a single todo                 |
| DELETE | `/api/v1/todos/completed?category=` | Delete completed todos in a category |

The **delete completed** route only removes completed todos for the provided category.

---

## Frontend

### State Management

- **TanStack Query** is used for all server communication and cache management
- Queries are scoped by category
- Mutations optimistically update local state

### Routing

- **TanStack Router** is used for routing
- The application is a single-page view with category tabs

### Persistence

The frontend persists todos in `localStorage` to survive reloads and browser restarts.

Load sequence:

1. Hydrate from `localStorage`
2. Fetch fresh data from the backend
3. Synchronize local cache with server state

All mutations update:

- Backend API
- React Query cache
- `localStorage`

---

## CORS

The backend enables CORS with the following methods:

GET, POST, PUT, PATCH, DELETE, OPTIONS

Origin is controlled via environment configuration.

---

## Summary

- **Backend**
  - In-memory storage
  - Versioned REST API
  - Category-scoped operations

- **Frontend**
  - React SPA
  - TanStack Router + Query
  - `localStorage` persistence

- **Design Goals**
  - Clear separation of concerns
  - Predictable data flow
  - Safe API versioning
  - Category-isolated mutations
