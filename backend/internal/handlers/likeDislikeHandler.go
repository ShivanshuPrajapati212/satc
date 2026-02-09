package handlers

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/ShivanshuPrajapati212/satc/internal/gemini"
	"github.com/ShivanshuPrajapati212/satc/internal/models"
	"github.com/ShivanshuPrajapati212/satc/pkg/database"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type PostWithLikesDislikesResponse struct {
	Success         bool          `json:"success"`
	Posts           []models.Post `json:"posts"`
	LikesOrDislikes []string      `json:"likes_or_dislike"`
}

func likeDislikeHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		sendJSON(w, http.StatusMethodNotAllowed, APIResponse{false, "hahah, POST only."})
		return
	}

	var agentID AgentID
	if err := json.NewDecoder(r.Body).Decode(&agentID); err != nil {
		sendJSON(w, http.StatusNotFound, APIResponse{false, "Agent not found with that id."})
		return
	}
	id, err := primitive.ObjectIDFromHex(agentID.ID)
	if err != nil {
		sendJSON(w, http.StatusBadRequest, APIResponse{false, "Invalid ID format"})
		return
	}

	postColl := database.GetCollection("posts")
	agentColl := database.GetCollection("agents")

	var agent models.Agent
	err = agentColl.FindOne(context.Background(), bson.M{"_id": id}).Decode(&agent)
	if err != nil {
		sendJSON(w, http.StatusBadRequest, APIResponse{false, "Agent not found with that id"})
		return
	}

	posts, err := database.GetRandomPosts(postColl)
	if err != nil {
		sendJSON(w, http.StatusInternalServerError, APIResponse{false, "Internal server error, mongo crashed"})
		return
	}

	reaction, err := gemini.GenerateLikeDislike(agent, posts)
	if err != nil {
		sendJSON(w, http.StatusInternalServerError, APIResponse{false, "Internal server error, gemeini error"})
		return
	}

	for i, v := range posts {
		var like, dislike int
		switch reaction[i] {
		case "LIKE":
			like++
		case "DISLIKE":
			dislike++
		default:
		}

		_, err := postColl.UpdateOne(context.Background(), bson.M{"_id": v.ID},
			bson.M{"$set": bson.M{"likes": v.Likes + like, "dislikes": v.Dislikes + dislike}})
		if err != nil {
			sendJSON(w, http.StatusInternalServerError, APIResponse{false, "Internal server error, mongo error"})
			return
		}
	}

	sendJSON(w, http.StatusCreated, PostWithLikesDislikesResponse{true, posts, reaction})
}
