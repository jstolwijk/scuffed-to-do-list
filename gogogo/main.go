package main

import (
	"log"
	"net/http"
	"os"

	"github.com/dgraph-io/badger"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func getEnvOrDefault(varName string, fallback string) string {
	value := os.Getenv(varName)

	if value == "" {
		value = fallback
		log.Printf("No env var %s found, use default: %s", varName, fallback)
	}

	return value
}

func openBadgerDb() *badger.DB {
	dbStoragePath := getEnvOrDefault("DB_STORAGE_PATH", "D:\\tmp\\database-files")

	db, err := badger.Open(badger.DefaultOptions(dbStoragePath))

	if err != nil {
		panic(err)
	}

	return db
}

var DB *badger.DB

func main() {
	DB = openBadgerDb()
	defer DB.Close()

	port := getEnvOrDefault("port", "8080")

	e := echo.New()

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	// Routes
	e.GET("/", hello)
	e.GET("/to-do-lists/:id", getToDoList)
	e.POST("/to-do-lists", createToDoList)

	// Start server
	e.Logger.Fatal(e.Start(":" + port))
}

func getToDoList(c echo.Context) error {
	DB.View(func(txn *badger.Txn) error {
		value, err := txn.Get([]byte("tdl@test"))
		if err != nil {
			return err
		}

		err = value.Value(func(val []byte) error {
			return c.String(http.StatusOK, string(val))
		})
		return err
	})
	return nil
}

func createToDoList(c echo.Context) error {
	err := DB.Update(func(txn *badger.Txn) error {
		err := txn.Set([]byte("tdl@test"), []byte("hello world"))
		return err
	})

	return err
}

func hello(c echo.Context) error {

	return c.String(http.StatusOK, "Hello, World!")
}
