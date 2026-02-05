package handlers

import (
	"fmt"
	"log"
	"net/http"
)

func StartServer() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprint(w, "Yeah")
	})

	http.HandleFunc("/api/addAgent", addAgentHandler)
	http.HandleFunc("/api/createPost", createPostHandler)

	if err := http.ListenAndServe(":42069", nil); err != nil {
		log.Fatal("Error running server: ", err)
	}
}
