# Prompts used

This project was built with Claude Code (Anthropic). The work was driven by
one primary prompt (the assignment brief), followed by a short round of
scoping questions the assistant asked before implementation.

## Primary prompt

```
Objective
Build a full-stack calculator application with a React frontend and a backend microservice. The frontend should consume the backend API to perform basic and advanced arithmetic operations. Focus on clean design, maintainable code, and testable architecture.

Requirements
Functional
Operations:
Addition, Subtraction, Multiplication, Division
Optional: Exponentiation, Square Root, Percentage
Frontend (React):
Intuitive UI for entering input and displaying results
Input validation and error handling
Responsive design (basic mobile support)
Backend (REST API):
Expose endpoints for calculator operations
Validate input and handle edge cases (division by zero, invalid data)
Return results in JSON format

Non-Functional
Clean, readable, and idiomatic code (frontend and backend)
Unit tests covering key functionality for both layers
Documentation: setup instructions, API usage, and design rationale
Optional: Dockerfile for full-stack deployment

Constraints
Frontend: React (TypeScript preferred)
Backend: Go is preferred

Deliverables
Git repository with frontend and backend code
README with setup instructions, API examples, and design decisions
Unit tests and coverage report
Optional: Dockerfile to run frontend + backend together

Instructions
Use any AI tooling you would like
Spend ~2-4 hours on this assignment. Prioritize correctness, clarity, and maintainability over extra features.
Push your solution to GitHub, GitLab, or another Git repository.
Share the repository link with us for evaluation.
Share any prompts that you used in your work
Make sure your README includes:
Setup instructions
How to run the frontend and backend
Examples of API calls (if using REST)
Design decisions or assumptions
```

## Scoping questions asked before implementation

Before writing any code, the assistant asked three clarifying questions to
resolve decisions the brief left open:

1. Whether to include the optional operations (exponentiation, square root,
   percentage) → **yes, include all of them**.
2. Whether to include a Dockerfile/docker-compose setup → **yes**.
3. Whether to create and push the GitHub repository directly, or leave
   publishing to the author → **create and push**.

No other prompting was used — the rest of the implementation (backend API,
frontend UI, tests, Docker setup, README) followed directly from the brief
and these three answers.
