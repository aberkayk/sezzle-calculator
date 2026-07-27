// Package api exposes the calculator engine over HTTP as JSON.
package api

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"github.com/ahmetkocak/sezzle-calculator/backend/internal/calculator"
)

// calculateRequest is the JSON body accepted by POST /api/v1/calculate.
//
// B is a pointer so we can distinguish "omitted" from "explicitly 0" when
// validating unary operations like sqrt.
type calculateRequest struct {
	Operation string   `json:"operation"`
	A         *float64 `json:"a"`
	B         *float64 `json:"b"`
}

type calculateResponse struct {
	Result float64 `json:"result"`
}

type errorResponse struct {
	Error string `json:"error"`
}

// supportedOperations whitelists the operation strings accepted from clients,
// independent of the calculator package's internal Operation type.
var supportedOperations = map[string]calculator.Operation{
	"add":          calculator.Add,
	"subtract":     calculator.Subtract,
	"multiply":     calculator.Multiply,
	"divide":       calculator.Divide,
	"exponentiate": calculator.Exponentiate,
	"sqrt":         calculator.SquareRoot,
	"percentage":   calculator.Percentage,
}

// Calculate handles POST /api/v1/calculate.
func Calculate(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	var req calculateRequest
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON body")
		return
	}

	op, ok := supportedOperations[req.Operation]
	if !ok {
		writeError(w, http.StatusBadRequest, fmt.Sprintf("unsupported operation %q", req.Operation))
		return
	}

	if req.A == nil {
		writeError(w, http.StatusBadRequest, "field \"a\" is required")
		return
	}

	isUnary := calculator.UnaryOperations[op]
	if !isUnary && req.B == nil {
		writeError(w, http.StatusBadRequest, "field \"b\" is required")
		return
	}

	a := *req.A
	var b float64
	if req.B != nil {
		b = *req.B
	}

	result, err := calculator.Calculate(op, a, b)
	if err != nil {
		writeError(w, statusForCalcError(err), err.Error())
		return
	}

	writeJSON(w, http.StatusOK, calculateResponse{Result: result})
}

// statusForCalcError maps domain errors to HTTP status codes. Anything
// unrecognized is treated as a client-side validation problem, since the
// calculator package only ever returns validation-style errors.
func statusForCalcError(err error) int {
	switch {
	case errors.Is(err, calculator.ErrDivisionByZero),
		errors.Is(err, calculator.ErrNegativeSqrt),
		errors.Is(err, calculator.ErrUnknownOperation),
		errors.Is(err, calculator.ErrResultOutOfRange):
		return http.StatusBadRequest
	default:
		return http.StatusInternalServerError
	}
}

func writeJSON(w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(body)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, errorResponse{Error: message})
}
