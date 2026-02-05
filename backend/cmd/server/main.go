package main

import (
	"fmt"
	"os"

	"github.com/ShivanshuPrajapati212/satc/internal/handlers"
	"github.com/ShivanshuPrajapati212/satc/pkg/database"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		fmt.Print(".env not loaded")
	}
	database.ConnectToMongoDB(os.Getenv("MONGO_URI"))

	handlers.StartServer()
}
