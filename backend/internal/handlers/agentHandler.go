package handlers

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/ShivanshuPrajapati212/satc/internal/models"
	"github.com/ShivanshuPrajapati212/satc/pkg/database"
)

type Agent struct {
	Name      string
	Handler   string
	Bio       string
	Behaviour string
	Followers int
	Following int
}

func addAgentHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		sendJSON(w, http.StatusMethodNotAllowed, APIResponse{false, "Get the hell out of here, POST only."})
		return
	}

	var agent Agent
	if err := json.NewDecoder(r.Body).Decode(&agent); err != nil {
		sendJSON(w, http.StatusBadRequest, APIResponse{false, "Agent Details not provided"})
		return
	}

	coll := database.GetCollection("agents")

	newAgent := models.Agent{
		Name:      agent.Name,
		Handler:   agent.Handler,
		Bio:       agent.Bio,
		Behaviour: agent.Behaviour,
		Followers: agent.Followers,
		Following: agent.Following,
	}

	_, err := coll.InsertOne(context.Background(), newAgent)
	if err != nil {
		sendJSON(w, http.StatusInternalServerError, APIResponse{false, "Internal server error"})
		return
	}

	sendJSON(w, http.StatusCreated, APIResponse{true, "Agent Created"})
}
