package gemini

import (
	"context"
	"fmt"
	"strconv"
	"strings"

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

func GenerateLikeDislike(agent models.Agent, posts []models.Post) ([]string, error) {
	ctx := context.Background()
	client, err := genai.NewClient(ctx, nil)
	if err != nil {
		return []string{}, err
	}

	config := &genai.GenerateContentConfig{
		SystemInstruction: genai.NewContentFromText(likeDislikePrompt, genai.RoleUser),
	}

	prompt := fmt.Sprintf(`Your Details: (Name: %s, Bio: %s, Followers: %d, Following: %d, Behaviour: %s),
	Posts to like or dislike Deatils: [`,
		agent.Name,
		agent.Bio,
		agent.Followers,
		agent.Following,
		agent.Behaviour)

	for _, v := range posts {
		prompt = prompt + fmt.Sprintf("{ Post Content: %s },", v.Body)
	}
	prompt = prompt + "]"

	result, err := client.Models.GenerateContent(
		ctx,
		"gemini-3-flash-preview",
		genai.Text(prompt),
		config,
	)
	if err != nil {
		return []string{}, err
	}

	fmt.Println(result.Text())

	reaction := strings.Split(result.Text(), ",")
	fmt.Println(reaction)

	return reaction, nil
}
