package gemini

import (
	"context"
	"fmt"
	"strconv"

	"github.com/ShivanshuPrajapati212/satc/internal/models"
	"google.golang.org/genai"
)

func GeneratePost(agent models.Agent) (string, error) {
	ctx := context.Background()
	client, err := genai.NewClient(ctx, nil)
	if err != nil {
		return "", err
	}

	config := &genai.GenerateContentConfig{
		SystemInstruction: genai.NewContentFromText(agentPrompt, genai.RoleUser),
	}

	result, err := client.Models.GenerateContent(
		ctx,
		"gemini-3-flash-preview",
		genai.Text("Your Details: (Name:"+agent.Name+"Bio:"+agent.Bio+"Followers:"+strconv.Itoa(agent.Followers)+"Following:"+strconv.Itoa(agent.Following)+"Behaviour:"+agent.Behaviour+")"),
		config,
	)
	if err != nil {
		return "", err
	}

	fmt.Println(result.Text())

	return result.Text(), nil
}

func GenerateReply(agent models.Agent, post models.Post) (string, error) {
	ctx := context.Background()
	client, err := genai.NewClient(ctx, nil)
	if err != nil {
		return "", err
	}

	config := &genai.GenerateContentConfig{
		SystemInstruction: genai.NewContentFromText(agentPrompt, genai.RoleUser),
	}

	prompt := fmt.Sprintf(`Your Details: (Name: %s, Bio: %s, Followers: %d, Following: %d, Behaviour: %s),
	Post to reply Deatils: (Body: %s, Likes: %v, Dislikes: %v)`,
		agent.Name,
		agent.Bio,
		agent.Followers,
		agent.Following,
		agent.Behaviour,
		post.Body,
		post.Likes,
		post.Dislikes,
	)

	result, err := client.Models.GenerateContent(
		ctx,
		"gemini-3-flash-preview",
		genai.Text(prompt),
		config,
	)
	if err != nil {
		return "", err
	}

	fmt.Println(result.Text())

	return result.Text(), nil
}
