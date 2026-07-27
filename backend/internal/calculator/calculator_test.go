package calculator

import (
	"errors"
	"math"
	"testing"
)

func TestCalculate(t *testing.T) {
	tests := []struct {
		name    string
		op      Operation
		a, b    float64
		want    float64
		wantErr error
	}{
		{name: "add positive", op: Add, a: 2, b: 3, want: 5},
		{name: "add negative", op: Add, a: -2, b: -3, want: -5},
		{name: "subtract", op: Subtract, a: 10, b: 4, want: 6},
		{name: "multiply", op: Multiply, a: 6, b: 7, want: 42},
		{name: "multiply by zero", op: Multiply, a: 6, b: 0, want: 0},
		{name: "divide", op: Divide, a: 10, b: 4, want: 2.5},
		{name: "divide by zero", op: Divide, a: 10, b: 0, wantErr: ErrDivisionByZero},
		{name: "exponentiate", op: Exponentiate, a: 2, b: 10, want: 1024},
		{name: "exponentiate negative exponent", op: Exponentiate, a: 2, b: -1, want: 0.5},
		{name: "sqrt", op: SquareRoot, a: 81, want: 9},
		{name: "sqrt of zero", op: SquareRoot, a: 0, want: 0},
		{name: "sqrt negative", op: SquareRoot, a: -4, wantErr: ErrNegativeSqrt},
		{name: "percentage", op: Percentage, a: 200, b: 15, want: 30},
		{name: "percentage of zero", op: Percentage, a: 0, b: 50, want: 0},
		{name: "unknown operation", op: Operation("frobnicate"), a: 1, b: 1, wantErr: ErrUnknownOperation},
		{name: "result overflow", op: Exponentiate, a: 10, b: 1000, wantErr: ErrResultOutOfRange},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := Calculate(tt.op, tt.a, tt.b)

			if tt.wantErr != nil {
				if !errors.Is(err, tt.wantErr) {
					t.Fatalf("Calculate(%v, %v, %v) error = %v, want %v", tt.op, tt.a, tt.b, err, tt.wantErr)
				}
				return
			}

			if err != nil {
				t.Fatalf("Calculate(%v, %v, %v) unexpected error: %v", tt.op, tt.a, tt.b, err)
			}
			if math.Abs(got-tt.want) > 1e-9 {
				t.Fatalf("Calculate(%v, %v, %v) = %v, want %v", tt.op, tt.a, tt.b, got, tt.want)
			}
		})
	}
}

func TestUnaryOperations(t *testing.T) {
	if !UnaryOperations[SquareRoot] {
		t.Fatal("SquareRoot should be registered as a unary operation")
	}
	if UnaryOperations[Add] {
		t.Fatal("Add should not be registered as a unary operation")
	}
}
