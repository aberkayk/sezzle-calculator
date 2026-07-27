package api

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func doCalculate(t *testing.T, body string) *httptest.ResponseRecorder {
	t.Helper()
	req := httptest.NewRequest(http.MethodPost, "/api/v1/calculate", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	NewRouter().ServeHTTP(rec, req)
	return rec
}

func TestCalculate_Success(t *testing.T) {
	tests := []struct {
		name string
		body string
		want float64
	}{
		{name: "add", body: `{"operation":"add","a":2,"b":3}`, want: 5},
		{name: "subtract", body: `{"operation":"subtract","a":10,"b":4}`, want: 6},
		{name: "multiply", body: `{"operation":"multiply","a":6,"b":7}`, want: 42},
		{name: "divide", body: `{"operation":"divide","a":9,"b":3}`, want: 3},
		{name: "exponentiate", body: `{"operation":"exponentiate","a":2,"b":8}`, want: 256},
		{name: "sqrt without b", body: `{"operation":"sqrt","a":16}`, want: 4},
		{name: "sqrt with b ignored", body: `{"operation":"sqrt","a":16,"b":999}`, want: 4},
		{name: "percentage", body: `{"operation":"percentage","a":200,"b":15}`, want: 30},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			rec := doCalculate(t, tt.body)
			if rec.Code != http.StatusOK {
				t.Fatalf("status = %d, want %d, body = %s", rec.Code, http.StatusOK, rec.Body.String())
			}

			var resp calculateResponse
			if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
				t.Fatalf("failed to decode response: %v", err)
			}
			if resp.Result != tt.want {
				t.Fatalf("result = %v, want %v", resp.Result, tt.want)
			}
		})
	}
}

func TestCalculate_ClientErrors(t *testing.T) {
	tests := []struct {
		name       string
		body       string
		wantStatus int
	}{
		{name: "division by zero", body: `{"operation":"divide","a":1,"b":0}`, wantStatus: http.StatusBadRequest},
		{name: "negative sqrt", body: `{"operation":"sqrt","a":-4}`, wantStatus: http.StatusBadRequest},
		{name: "unsupported operation", body: `{"operation":"log","a":1,"b":1}`, wantStatus: http.StatusBadRequest},
		{name: "missing a", body: `{"operation":"add","b":1}`, wantStatus: http.StatusBadRequest},
		{name: "missing b for binary op", body: `{"operation":"add","a":1}`, wantStatus: http.StatusBadRequest},
		{name: "malformed json", body: `{"operation":`, wantStatus: http.StatusBadRequest},
		{name: "unknown field", body: `{"operation":"add","a":1,"b":2,"c":3}`, wantStatus: http.StatusBadRequest},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			rec := doCalculate(t, tt.body)
			if rec.Code != tt.wantStatus {
				t.Fatalf("status = %d, want %d, body = %s", rec.Code, tt.wantStatus, rec.Body.String())
			}

			var resp errorResponse
			if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
				t.Fatalf("failed to decode error response: %v", err)
			}
			if resp.Error == "" {
				t.Fatal("expected non-empty error message")
			}
		})
	}
}

func TestCalculate_MethodNotAllowed(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/v1/calculate", nil)
	rec := httptest.NewRecorder()
	NewRouter().ServeHTTP(rec, req)

	if rec.Code != http.StatusMethodNotAllowed {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusMethodNotAllowed)
	}
}

func TestHealthz(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/healthz", nil)
	rec := httptest.NewRecorder()
	NewRouter().ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusOK)
	}
}
