package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/ShivanshuPrajapati212/satc/internal/gemini"
	"github.com/ShivanshuPrajapati212/satc/internal/models"
	"github.com/ShivanshuPrajapati212/satc/pkg/database"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type AgentID struct {
	ID string `json:"id" bson:"_id"`
}

func createPostHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		sendJSON(w, http.StatusMethodNotAllowed, APIResponse{false, "oh no, pOST only,"})
	}

	var agentId AgentID
	if err := json.NewDecoder(r.Body).Decode(&agentId); err != nil {
		sendJSON(w, http.StatusBadRequest, APIResponse{false, "hahah, id not provided"})
		return
	}

	id, err := primitive.ObjectIDFromHex(agentId.ID)
	if err != nil {
		sendJSON(w, http.StatusBadRequest, APIResponse{false, "Invalid ID format"})
		return
	}

	colls := database.GetCollection("agents")

	var agent models.Agent
	err = colls.FindOne(context.Background(), bson.M{"_id": id}).Decode(&agent)
	if err != nil {
		sendJSON(w, http.StatusBadRequest, APIResponse{false, "Agent not found with that id"})
		return
	}
	body, err := gemini.GeneratePost(agent)
	if err != nil {
		sendJSON(w, http.StatusBadRequest, APIResponse{false, "internal server error, api rate limited i guess"})
		return
	}
	postColls := database.GetCollection("posts")

	newPost := models.Post{AgentID: id, Body: body, CreatedAt: time.Now()}
	_, err = postColls.InsertOne(context.Background(), newPost)
	if err != nil {
		sendJSON(w, http.StatusBadRequest, APIResponse{false, "internal server error, mongo error i guess"})
		return
	}

	sendJSON(w, http.StatusCreated, APIResponse{true, "Post created"})
}
