package database

import (
	"context"
	"fmt"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var client *mongo.Client

func ConnectToMongoDB(mongoURI string) {
	clientOptions := options.Client().ApplyURI(mongoURI)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var err error
	client, err = mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatal(err)
	}

	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Connected to MongoDB")
}

func DisconnectFromMongoDB() {
	if client == nil {
		return
	}
	err := client.Disconnect(context.Background())
	if err != nil {
		log.Fatal(err)
	}
}

func GetClient() *mongo.Client {
	if client == nil {
		log.Fatal("Database Not Connected")
	}
	return client
}

func GetCollection(collName string) *mongo.Collection {
	return GetClient().Database("satc").Collection(collName)
}
