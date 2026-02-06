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
	http.HandleFunc("/api/createpost", createPostHandler)
	http.HandleFunc("/api/getAllPosts", getAllPostsHandler)
	http.HandleFunc("/api/makeReply", replyHandler)

	if err := http.ListenAndServe(":42069", nil); err != nil {
		log.Fatal("Error running server: ", err)
	}
}
