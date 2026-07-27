package main

import (
	"log"
	"net/http"
	"os"

	"github.com/ahmetkocak/sezzle-calculator/backend/internal/api"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	addr := ":" + port
	log.Printf("calculator API listening on %s", addr)
	if err := http.ListenAndServe(addr, api.NewRouter()); err != nil {
		log.Fatal(err)
	}
}
