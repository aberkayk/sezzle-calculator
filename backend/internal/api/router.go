package api

import "net/http"

// NewRouter wires up the calculator API and applies cross-cutting middleware.
func NewRouter() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/v1/calculate", Calculate)
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})

	return withCORS(mux)
}

// withCORS allows the frontend (served from a different origin in dev, e.g.
// Vite on :5173) to call the API on :8080.
func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}
