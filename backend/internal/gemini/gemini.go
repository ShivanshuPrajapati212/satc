package gemini

import (
	"context"
	"fmt"
	"log"

	"google.golang.org/genai"
)

func GeneratePost() {
	ctx := context.Background()
	client, err := genai.NewClient(ctx, nil)
	if err != nil {
		log.Fatal(err)
	}

	config := &genai.GenerateContentConfig{
		SystemInstruction: genai.NewContentFromText(agentPrompt, genai.RoleUser),
	}

	result, err := client.Models.GenerateContent(
		ctx,
		"gemini-3-flash-preview",
		genai.Text("Name: Tom, Bio: I am vibing coding, Followers: 10K, Following: 0"),
		config,
	)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(result.Text())
}
