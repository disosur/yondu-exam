# yondu-exam

A simple full-stack Todo application with category-scoped tasks (`personal` and `professional`), built with an Express backend and a React SPA frontend using TanStack Router and TanStack Query.

---

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

This project uses **Turbo** for monorepo management. To get started:

1. Clone the repository
2. Install dependencies from the root:

   ```bash
   npm install
   ```

3. Set up environment variables

### Environment Variables

**Frontend** (`.env` in `apps/frontend` or frontend root):

```dotenv
VITE_SERVER_URL=http://localhost:3000
```

**Backend** (`.env` in `apps/backend` or backend root):

```dotenv
CORS_ORIGIN=http://localhost:3001
```

### Running the Application

From the root directory:

```bash
npm run dev
```

This will start both the frontend and backend concurrently using Turbo.

- Frontend will be available at: `http://localhost:5173` (or your configured Vite port)
- Backend API will be available at: `http://localhost:3000` (or your configured port)

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

## Data Storage and Persistence

### Backend Storage

The backend is the authoritative source of task data. For the purposes of this take-home assignment, tasks are stored **in memory** on the server. This means that all CRUD operations (create, update, delete) are handled by the backend API, and the data exists only while the server is running. Server restarts will reset the task data.

The backend is implemented using the **repository pattern**, which abstracts the data access layer from the business logic. This architectural decision means that even though we currently use an in-memory store, the application can be migrated to any database (PostgreSQL, MongoDB, MySQL, etc.) without requiring changes to the core business logic or API routes. The repository interface remains the same regardless of the underlying storage mechanism, making the codebase flexible and maintainable for future production deployments.

### Frontend Persistence

The frontend persists tasks in `localStorage` to satisfy the requirement of maintaining task data across page reloads and browser restarts as specified in the take-home assignment. On initial load, the application hydrates tasks from `localStorage` and then synchronizes with the backend API to fetch the latest data. All task mutations update both the backend API and `localStorage` to keep the client-side state consistent with the server.

### Summary

- **Backend**: in-memory storage, authoritative source, temporary
- **Frontend**: `localStorage` for persistence across reloads and browser restarts
- **Synchronization**: all CRUD operations update both backend and `localStorage` to maintain consistency
- **Scalability**: repository pattern allows seamless migration to any database without core logic changes

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

### Component Architecture

The frontend is organized into feature-based components to achieve better maintainability and separation of concerns:

```
src/
├── routes/
│   └── index.tsx                    # Route definition (minimal)
├── components/
│   └── todo/
│       ├── index.ts                 # Barrel export
│       ├── TodoApp.tsx              # Main container with tab state
│       ├── TodoHeader.tsx           # Title and tab navigation
│       ├── TodoList.tsx             # List with loading/error states
│       ├── TodoItem.tsx             # Individual todo item
│       └── TodoInput.tsx            # Input field with add functionality
└── api/
    └── v1/
        └── todos.ts                 # TanStack Query hooks
```

#### Component Responsibilities

**TodoApp.tsx** is implemented as the main container managing the active tab state (`personal` | `professional`). It orchestrates the layout between header, list, and mobile input, and implements responsive behavior for mobile devices.

**TodoHeader.tsx** is implemented as a pure presentational component that displays the application title and renders tab navigation for switching between categories. It receives state as props and has no internal state management.

**TodoList.tsx** is implemented to fetch todos using the `useTodosV1` hook and handle both loading and error states with appropriate UI feedback. It renders the list of `TodoItem` components, manages "Clear Completed" functionality, and conditionally shows `TodoInput` based on screen size for responsive behavior.

**TodoItem.tsx** is implemented to represent a single todo with all its interactions including inline editing mode with save/cancel actions, toggle completion state, and delete functionality. It manages its own local edit state and disables all actions during pending mutations to prevent race conditions.

**TodoInput.tsx** is implemented to provide the input field for creating new todos with loading states during creation. It handles create mutations via `useCreateTodoV1`, displays error messages for failed operations, and clears the input on successful creation.

### State Management

State management is implemented using **TanStack Query** for all server communication and cache management:

- Queries are scoped by category using `queryKey: ["todosV1", category]` to enable independent cache management per category
- Mutations implement optimistic updates for immediate UI feedback before server confirmation
- All mutations include proper error handling with automatic rollback on failure using the context pattern
- The `onMutate` handler performs optimistic updates to both `localStorage` and the query cache
- The `onError` handler rolls back changes using the context returned from `onMutate`
- The `onSettled` handler ensures the cache is synchronized with server state after mutations complete

### Loading & Error States

The application implements comprehensive loading and error states throughout:

**Loading States:**

- Input fields and buttons are implemented with disabled states during operations to prevent duplicate submissions
- Button text is implemented to change dynamically to indicate progress ("ADDING...", "Clearing...")
- List is implemented to show "Loading todos..." message during initial fetch
- All interactive elements are disabled during pending mutations using the `isPending` flag from mutations

**Error States:**

- Failed fetches are implemented to display error cards with retry buttons for user recovery
- Failed mutations are implemented to show inline error messages with the specific error description from the API
- Error boundaries are implemented to catch unexpected errors and provide graceful degradation
- Users can retry failed operations without losing their input, as form state is preserved

### Routing

Routing is implemented using **TanStack Router**:

- The route file (`routes/index.tsx`) is implemented minimally, only importing and rendering `TodoApp`
- All UI logic is delegated to components to achieve better separation of concerns
- This pattern allows for easy addition of new routes and features without cluttering route definitions

### Persistence

Persistence is implemented using `localStorage` to enable todos to survive reloads and browser restarts:

**Load sequence:**

1. Initial data is hydrated from `localStorage` using `initialData` in queries for instant UI rendering
2. Fresh data is fetched from the backend to ensure consistency
3. Local cache is synchronized with server state automatically by TanStack Query

**Mutation flow:**

All mutations are implemented to update three locations:

- Backend API (via `mutationFn`) to persist the change
- React Query cache (via `onSettled`) to update the in-memory cache
- `localStorage` (via `onMutate`) for optimistic updates and persistence

The `onMutate` handler is implemented to perform optimistic updates by immediately updating `localStorage` before the API call completes. If the mutation fails, the `onError` handler rolls back the changes using the context returned from `onMutate`, ensuring data consistency.

### Mobile-Responsive Design

Mobile-responsive design is implemented to provide optimal UX patterns across devices:

**Desktop (≥ md breakpoint):**

- Input is implemented at the top of the todo list for traditional desktop todo app layout
- All controls are visible and accessible in a single viewport

**Mobile (< md breakpoint):**

- Input is implemented as a sticky bottom bar to mimic messaging app behavior (WhatsApp, iMessage, etc.)
- This provides better ergonomics for thumb-based input on mobile devices
- List scrolling is implemented independently while the input stays accessible
- Shadow and border are implemented to visually separate the input from content
- Empty state message is implemented to adapt contextually ("Add one below" vs "Add one above")

This responsive behavior is implemented using Tailwind's `md:` breakpoint utilities and the `hidden/block` classes to conditionally show/hide the input in different positions based on viewport size.

### Edit Functionality

Edit functionality is implemented with inline editing capabilities:

- Clicking the edit icon enters edit mode for a todo item
- Edit mode is implemented with an inline input field replacing the todo text
- Save and cancel actions are implemented with visual buttons and keyboard shortcuts
- Enter key is implemented to save changes, Escape key to cancel
- All other todo interactions are disabled during edit mode to prevent conflicts
- Changes are persisted immediately to the backend via the `useUpdateTodoV1` mutation
- Failed edits are rolled back automatically, preserving the original text

---

## CORS

CORS is implemented on the backend to enable the following methods:

GET, POST, PUT, PATCH, DELETE, OPTIONS

Origin is controlled via environment configuration to support different deployment environments.

---

## Testing

The application includes comprehensive unit tests using Jest, covering all layers of the repository pattern architecture.

### Test Structure

Tests are organized by layer, mirroring the application's architecture:

```
src/v1/todos/__tests__/
├── repository.test.ts  # Data layer tests
├── service.test.ts     # Business logic tests
└── controller.test.ts  # HTTP layer tests
```

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run server tests only
npm run test:server
```

### Test Coverage

#### Repository Layer (`repository.test.ts`)

Tests the data persistence layer with in-memory storage:

- **getAll**: Retrieving all todos and filtering by category
- **getById**: Finding individual todos
- **add**: Creating new todos
- **update**: Modifying existing todos (partial and full updates)
- **remove**: Deleting individual todos
- **removeCompleted**: Bulk deletion of completed todos by category

#### Service Layer (`service.test.ts`)

Tests business logic with mocked repository:

- **getAllTodos**: Fetching todos with optional category filter
- **createTodo**: Todo creation with auto-generated IDs
- **updateTodo**: Updating todo fields
- **toggleTodo**: Toggling completion status
- **deleteTodo**: Single todo deletion
- **deleteCompletedTodos**: Batch deletion of completed todos

#### Controller Layer (`controller.test.ts`)

Tests HTTP request handling with mocked service:

- **getAll**: Query parameter validation and response formatting
- **create**: Request body validation and 201 status codes
- **update**: Path parameter handling and 404 responses
- **toggle**: Todo completion toggling
- **delete**: Deletion with proper 204/404 status codes
- **deleteCompleted**: Batch deletion with query validation

### Test Patterns

The test suite follows these patterns:

- **Mocking**: Each layer mocks its dependencies (repository → service → controller)
- **Isolation**: Tests run independently with `beforeEach` cleanup
- **Edge Cases**: Validates error handling, missing data, and invalid inputs
- **Type Safety**: Uses TypeScript for type-safe mocks and assertions

### Example Test

```typescript
it("should filter todos by category when category is provided", async () => {
  const personalTodo: Todo = {
    id: "1",
    text: "Personal task",
    completed: false,
    category: "personal",
  };

  await repository.add(personalTodo);
  const personalTodos = await repository.getAll("personal");

  expect(personalTodos).toHaveLength(1);
  expect(personalTodos[0]).toEqual(personalTodo);
});
```

---

## Summary

- **Backend**
  - In-memory storage is implemented for rapid development and testing
  - Versioned REST API is implemented to support future iterations
  - Category-scoped operations are implemented to prevent cross-category interference

- **Frontend**
  - React SPA is implemented with component-based architecture for maintainability
  - TanStack Router + Query are implemented for routing and state management
  - `localStorage` persistence is implemented with optimistic updates for resilience
  - Comprehensive loading and error handling are implemented throughout the application
  - Mobile-responsive design is implemented with bottom input on small screens
  - Inline editing is implemented for todos to provide seamless user experience

- **Design Goals**
  - Clear separation of concerns is implemented through component architecture
  - Predictable data flow is implemented with TanStack Query's mutation lifecycle
  - Safe API versioning is implemented for future iterations without breaking changes
  - Category-isolated mutations are implemented to prevent cross-category interference
  - Resilient UX is implemented with optimistic updates and automatic error recovery
  - Mobile-first design is implemented to ensure accessibility on all devices
