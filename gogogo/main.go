package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/dgraph-io/badger"
)

func getEnvOrDefault(varName string, fallback string) string {
	value := os.Getenv(varName)

	if value == "" {
		value = fallback
		log.Printf("No env var %varName found, use default: %s", varName, fallback)
	}

	return value
}

func openBadgerDb() *badger.DB {
	dbStoragePath := getEnvOrDefault("DB_STORAGE_PATH", "./database-files")

	db, err := badger.Open(badger.DefaultOptions(dbStoragePath))

	if err != nil {
		panic(err)
	}

	return db
}

func main() {
	db := openBadgerDb()
	defer db.Close()

	http.HandleFunc("/", indexHandler)

	port := getEnvOrDefault("PORT", "8080")

	log.Printf("Listening on port %s", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal(err)
	}
}

func indexHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}
	fmt.Fprint(w, "Hello, World!")
}
