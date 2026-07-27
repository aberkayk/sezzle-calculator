// Package calculator implements the arithmetic operations exposed by the API.
package calculator

import (
	"errors"
	"math"
)

// Operation identifies which arithmetic operation to perform.
type Operation string

const (
	Add          Operation = "add"
	Subtract     Operation = "subtract"
	Multiply     Operation = "multiply"
	Divide       Operation = "divide"
	Exponentiate Operation = "exponentiate"
	SquareRoot   Operation = "sqrt"
	Percentage   Operation = "percentage"
)

// Errors returned by Calculate. The API layer maps these to HTTP status codes.
var (
	ErrDivisionByZero   = errors.New("division by zero")
	ErrNegativeSqrt     = errors.New("cannot take square root of a negative number")
	ErrUnknownOperation = errors.New("unknown operation")
	ErrResultOutOfRange = errors.New("result is not a finite number")
)

// UnaryOperations only require the first operand; the second is ignored.
var UnaryOperations = map[Operation]bool{
	SquareRoot: true,
}

// Calculate dispatches to the requested operation and validates the result.
//
// b is ignored for unary operations (currently only SquareRoot).
func Calculate(op Operation, a, b float64) (float64, error) {
	var result float64

	switch op {
	case Add:
		result = a + b
	case Subtract:
		result = a - b
	case Multiply:
		result = a * b
	case Divide:
		if b == 0 {
			return 0, ErrDivisionByZero
		}
		result = a / b
	case Exponentiate:
		result = math.Pow(a, b)
	case SquareRoot:
		if a < 0 {
			return 0, ErrNegativeSqrt
		}
		result = math.Sqrt(a)
	case Percentage:
		// Interpreted as "b percent of a", e.g. Percentage(200, 15) => 15% of 200 => 30.
		result = a * (b / 100)
	default:
		return 0, ErrUnknownOperation
	}

	if math.IsNaN(result) || math.IsInf(result, 0) {
		return 0, ErrResultOutOfRange
	}

	return result, nil
}
