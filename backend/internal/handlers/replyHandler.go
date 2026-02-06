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

type AgentIDWithPostID struct {
	ID     string `json:"id" bson:"_id"`
	PostID string `json:"post_id" bson:"post_id"`
}

func replyHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		sendJSON(w, http.StatusMethodNotAllowed, APIResponse{false, "oh no, pOST only,"})
	}

	var agentIDWithPostID AgentIDWithPostID
	if err := json.NewDecoder(r.Body).Decode(&agentIDWithPostID); err != nil {
		sendJSON(w, http.StatusBadRequest, APIResponse{false, "hahah, id not provided"})
		return
	}

	id, err := primitive.ObjectIDFromHex(agentIDWithPostID.ID)
	if err != nil {
		sendJSON(w, http.StatusBadRequest, APIResponse{false, "Invalid ID format"})
		return
	}
	postID, err := primitive.ObjectIDFromHex(agentIDWithPostID.PostID)
	if err != nil {
		sendJSON(w, http.StatusBadRequest, APIResponse{false, "Invalid ID format"})
		return
	}

	colls := database.GetCollection("agents")
	postColls := database.GetCollection("posts")
	replyColls := database.GetCollection("replies")

	var agent models.Agent
	err = colls.FindOne(context.Background(), bson.M{"_id": id}).Decode(&agent)
	if err != nil {
		sendJSON(w, http.StatusBadRequest, APIResponse{false, "Agent not found with that id"})
		return
	}
	var post models.Post
	err = postColls.FindOne(context.Background(), bson.M{"_id": postID}).Decode(&post)
	if err != nil {
		sendJSON(w, http.StatusBadRequest, APIResponse{false, "post not found with that id"})
		return
	}

	body, err := gemini.GenerateReply(agent, post)
	if err != nil {
		sendJSON(w, http.StatusBadRequest, APIResponse{false, "internal server error, api rate limited i guess"})
		return
	}

	newReply := models.Reply{AgentID: id, PostID: postID, Body: body, CreatedAt: time.Now()}
	replyRes, err := replyColls.InsertOne(context.Background(), newReply)
	if err != nil {
		sendJSON(w, http.StatusBadRequest, APIResponse{false, "internal server error, mongo error i guess"})
		return
	}

	newPostReplies := append(post.Replies, replyRes.InsertedID.(primitive.ObjectID))

	_, err = postColls.UpdateOne(context.Background(), bson.M{"_id": postID}, bson.M{"$set": bson.M{"replies": newPostReplies}})
	if err != nil {
		sendJSON(w, http.StatusBadRequest, APIResponse{false, "internal server error, mongo error i guess"})
		return
	}

	sendJSON(w, http.StatusCreated, APIResponse{true, "Reply created"})
}
