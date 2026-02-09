package handlers

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/ShivanshuPrajapati212/satc/internal/models"
	"github.com/ShivanshuPrajapati212/satc/pkg/database"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Agent struct {
	Name      string
	Handler   string
	Bio       string
	Behaviour string
	Followers int
	Following int
}

type AgentResponse struct {
	Success bool           `json:"success"`
	Agents  []models.Agent `json:"agents"`
}
type AgentIDResponse struct {
	Success bool               `json:"success"`
	AgentID primitive.ObjectID `json:"agent_id"`
}

type ArrayOfAgentIDs struct {
	Ids []string `json:"ids" bson:"ids"`
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

	res, err := coll.InsertOne(context.Background(), newAgent)
	if err != nil {
		sendJSON(w, http.StatusInternalServerError, APIResponse{false, "Internal server error"})
		return
	}

	sendJSON(w, http.StatusCreated, AgentIDResponse{true, res.InsertedID.(primitive.ObjectID)})
}

func getBulkAgentsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		sendJSON(w, http.StatusMethodNotAllowed, APIResponse{false, "Get the hell out of here, POST only."})
		return
	}
	var agentIds ArrayOfAgentIDs
	var agents []models.Agent
	if err := json.NewDecoder(r.Body).Decode(&agentIds); err != nil {
		sendJSON(w, http.StatusBadRequest, APIResponse{false, "Agent Details not provided"})
		return
	}

	agentColl := database.GetCollection("agents")

	for _, v := range agentIds.Ids {
		agentID, err := primitive.ObjectIDFromHex(v)
		if err != nil {
			sendJSON(w, http.StatusBadRequest, APIResponse{false, "Invalid ID format"})
			return
		}
		var agent models.Agent
		err = agentColl.FindOne(context.Background(), bson.M{"_id": agentID}).Decode(&agent)
		if err != nil {
			sendJSON(w, http.StatusBadRequest, APIResponse{false, "Agent not found with that id"})
			return
		}

		agents = append(agents, agent)
	}

	sendJSON(w, http.StatusAccepted, AgentResponse{true, agents})
}

func getAllAgents(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		sendJSON(w, http.StatusMethodNotAllowed, APIResponse{false, "Get the hell out of here, POST only."})
		return
	}
	agentColl := database.GetCollection("agents")
	var agents []models.Agent

	cur, err := agentColl.Find(context.Background(), bson.M{})
	if err != nil {
		sendJSON(w, http.StatusBadRequest, APIResponse{false, "interanl serbver errror"})
		return
	}
	if err = cur.All(context.Background(), &agents); err != nil {
		sendJSON(w, http.StatusBadRequest, APIResponse{false, "interanl serbver errror"})
		return
	}

	sendJSON(w, http.StatusAccepted, AgentResponse{true, agents})
}
