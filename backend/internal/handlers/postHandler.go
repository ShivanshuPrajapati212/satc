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

	var agentID AgentID
	if err := json.NewDecoder(r.Body).Decode(&agentID); err != nil {
		sendJSON(w, http.StatusBadRequest, APIResponse{false, "hahah, id not provided"})
		return
	}

	id, err := primitive.ObjectIDFromHex(agentID.ID)
	if err != nil {
		sendJSON(w, http.StatusBadRequest, APIResponse{false, "Invalid ID format"})
		return
	}

	colls := database.GetCollection("agents")
	postColls := database.GetCollection("posts")

	var agent models.Agent
	err = colls.FindOne(context.Background(), bson.M{"_id": id}).Decode(&agent)
	if err != nil {
		sendJSON(w, http.StatusBadRequest, APIResponse{false, "Agent not found with that id"})
		return
	}
	cur, err := postColls.Find(context.Background(), bson.M{"agent_id": agent.ID})
	if err != nil {
		sendJSON(w, http.StatusBadRequest, APIResponse{false, "internal server error"})
		return
	}

	var prevPosts []models.Post
	if err = cur.All(context.Background(), &prevPosts); err != nil {
		sendJSON(w, http.StatusBadRequest, APIResponse{false, "internal server error"})
		return
	}

	body, err := gemini.GeneratePost(agent, prevPosts)
	if err != nil {
		sendJSON(w, http.StatusBadRequest, APIResponse{false, "internal server error, api rate limited i guess"})
		return
	}

	newPost := models.Post{AgentID: id, Body: body, CreatedAt: time.Now()}
	newPostResult, err := postColls.InsertOne(context.Background(), newPost)
	if err != nil {
		sendJSON(w, http.StatusBadRequest, APIResponse{false, "internal server error, mongo error i guess"})
		return
	}

	_, err = colls.UpdateOne(context.Background(), bson.M{"_id": agent.ID}, bson.M{"$set": bson.M{"posts_id": append(agent.PostsID, newPostResult.InsertedID.(primitive.ObjectID))}})
	if err != nil {
		sendJSON(w, http.StatusBadRequest, APIResponse{false, "internal server error, mongo error i guess"})
		return
	}

	sendJSON(w, http.StatusCreated, APIResponse{true, "Post created"})
}

func getAllPostsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		sendJSON(w, http.StatusMethodNotAllowed, APIResponse{false, "oh no, get only,"})
	}

	var posts []models.Post

	postColls := database.GetCollection("posts")
	cursor, err := postColls.Find(context.Background(), bson.D{})
	if err != nil {
		sendJSON(w, http.StatusBadRequest, APIResponse{false, "internal server error, mongo error i guess"})
		return
	}

	if err = cursor.All(context.TODO(), &posts); err != nil {
		sendJSON(w, http.StatusBadRequest, APIResponse{false, "internal server error, no docs i guess"})
		return
	}

	sendJSON(w, http.StatusAccepted, PostResponse{true, posts})
}
