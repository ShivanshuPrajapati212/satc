package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/ShivanshuPrajapati212/satc/internal/models"
)

type APIResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}
type PostResponse struct {
	Success bool          `json:"success"`
	Posts   []models.Post `json:"posts"`
}

func sendJSON(w http.ResponseWriter, status int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(payload)
}
