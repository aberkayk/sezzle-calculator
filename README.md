# Calculator

A full-stack calculator: a React + TypeScript frontend backed by a Go REST API.

```
sezzle/
├── backend/     Go REST API (net/http, no framework)
├── frontend/    React + TypeScript UI (Vite)
└── docker-compose.yml
```

## Operations supported

Addition, subtraction, multiplication, division, exponentiation, square root, and percentage.

## Quick start (Docker)

Requires Docker with Compose.

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8080

> Note: the Dockerfiles were authored following standard multi-stage build
> patterns (Go build → distroless runtime; Vite build → nginx) but could not
> be executed in the sandbox this was built in (no Docker daemon available).
> Please verify with `docker compose up --build` on your machine.

## Running locally without Docker

### Backend

Requires Go 1.23+.

```bash
cd backend
go run ./cmd/server
# listening on :8080 (override with PORT=xxxx)
```

### Frontend

Requires Node 20+.

```bash
cd frontend
npm install
npm run dev
# served at http://localhost:5173
```

The frontend calls the backend at `http://localhost:8080` by default. To point
it elsewhere, set `VITE_API_BASE_URL` (e.g. in `frontend/.env.local`).

## Running tests

### Backend

```bash
cd backend
go test ./... -cover
# with an HTML coverage report:
go test ./... -coverprofile=coverage.out && go tool cover -html=coverage.out
```

Coverage: 100% on the calculator engine, ~94% on the HTTP handlers (the
uncovered lines are an unreachable default-case branch).

### Frontend

```bash
cd frontend
npm run test            # single run
npm run test:coverage   # with coverage report
```

Coverage: ~98% across the API client and the `Calculator` component.

## API

### `POST /api/v1/calculate`

**Request body**

| Field       | Type   | Required                                | Description |
|-------------|--------|------------------------------------------|--------------|
| `operation` | string | yes                                      | One of `add`, `subtract`, `multiply`, `divide`, `exponentiate`, `sqrt`, `percentage` |
| `a`         | number | yes                                      | First operand |
| `b`         | number | yes, except for `sqrt`                   | Second operand (ignored for `sqrt`) |

**Response body (200 OK)**

```json
{ "result": 8 }
```

**Error response (4xx)**

```json
{ "error": "division by zero" }
```

### Examples

```bash
curl -X POST localhost:8080/api/v1/calculate \
  -H 'Content-Type: application/json' \
  -d '{"operation": "add", "a": 5, "b": 3}'
# {"result":8}

curl -X POST localhost:8080/api/v1/calculate \
  -H 'Content-Type: application/json' \
  -d '{"operation": "divide", "a": 1, "b": 0}'
# 400 {"error":"division by zero"}

curl -X POST localhost:8080/api/v1/calculate \
  -H 'Content-Type: application/json' \
  -d '{"operation": "sqrt", "a": 81}'
# {"result":9}

curl -X POST localhost:8080/api/v1/calculate \
  -H 'Content-Type: application/json' \
  -d '{"operation": "percentage", "a": 200, "b": 15}'
# {"result":30}   -- read as "15% of 200"
```

### `GET /healthz`

Returns `{"status": "ok"}`. Used for container/orchestrator health checks.

## Design decisions & assumptions

- **Single `/calculate` endpoint instead of one route per operation.** All
  operations share the same request/response shape and validation flow;
  branching on an `operation` field avoids seven near-identical handlers and
  makes adding a new operation a one-line change in `calculator.Calculate`
  plus the `supportedOperations` map in the API layer.
- **No web framework on the backend.** The API surface is a single endpoint
  with simple validation, so `net/http`'s `ServeMux` is sufficient and keeps
  the dependency graph at zero third-party packages.
- **Calculator logic is isolated from the HTTP layer** (`internal/calculator`
  vs. `internal/api`), so the arithmetic is unit-testable without spinning up
  a server, and the API layer is unit-testable via `httptest` without a real
  network call.
- **`a` and `b` are `*float64` in the request struct** so the server can tell
  "field omitted" apart from "field sent as `0`" — required to validate `sqrt`
  (which only needs `a`) without accidentally treating a legitimate `0` as
  missing.
- **`percentage(a, b)` is defined as `a * (b / 100)`**, i.e. "b percent of a".
  For example `percentage(200, 15) = 30` (15% of 200). This is documented here
  because "percentage" is otherwise ambiguous between this and "what percent
  is a of b".
- **Division by zero, negative square roots, and non-finite results
  (e.g. overflow from exponentiation) are treated as client errors (400)**,
  not server errors, since they result from the caller's input.
- **CORS is wide-open (`Access-Control-Allow-Origin: *`)** since this is a
  demo app with no auth or sensitive data; a production deployment would
  restrict this to the known frontend origin.
- **Frontend state is local to the `Calculator` component** (`useState`) —
  there's a single form with no cross-page state, so no state management
  library is warranted.
- **Client-side validation mirrors server-side validation** (numeric input
  required, second operand required unless the operation is unary) purely to
  give immediate feedback; the server re-validates everything independently
  and is the source of truth.

## Prompts used

See [`PROMPTS.md`](PROMPTS.md) for the prompts used to build this project with AI assistance.
