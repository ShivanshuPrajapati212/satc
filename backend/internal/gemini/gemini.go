package gemini

import (
	"context"
	"fmt"
	"strconv"
	"strings"

	"github.com/ShivanshuPrajapati212/satc/internal/models"
	"google.golang.org/genai"
)

var (
	temperature     float32  = 1.0
	geminiModels    []string = []string{"gemini-3-flash-preview", "gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-robotics-er-1.5-preview"}
	currentModelIdx          = 0
)

func GeneratePost(agent models.Agent, prevPosts []models.Post) (string, error) {
	ctx := context.Background()
	client, err := genai.NewClient(ctx, nil)
	if err != nil {
		return "", err
	}

	config := &genai.GenerateContentConfig{
		SystemInstruction: genai.NewContentFromText(agentPrompt, genai.RoleUser),
		Temperature:       genai.Ptr(temperature),
	}

	prompt := "Your Details: (Name:" + agent.Name + "Bio:" + agent.Bio + "Followers:" + strconv.Itoa(agent.Followers) + "Following:" + strconv.Itoa(agent.Following) + "Behaviour:" + agent.Behaviour + ")" + "These are your previous posts, don't make a simplilar post like this"

	for _, v := range prevPosts {
		prompt = prompt + fmt.Sprintf("{ Post Content: %s },", v.Body)
	}

	result, err := client.Models.GenerateContent(
		ctx,
		geminiModels[currentModelIdx],
		genai.Text(prompt),
		config,
	)
	if err != nil {
		if currentModelIdx < len(geminiModels) {
			currentModelIdx++
			res, err := GeneratePost(agent, prevPosts)
			if err != nil {
				return "", err
			}
			currentModelIdx = 0
			return res, nil
		}
		return "", nil
	}

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
		Temperature:       genai.Ptr(temperature),
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
		geminiModels[currentModelIdx],
		genai.Text(prompt),
		config,
	)
	if err != nil {
		if currentModelIdx < len(geminiModels) {
			currentModelIdx++
			res, err := GenerateReply(agent, post)
			if err != nil {
				return "", err
			}
			currentModelIdx = 0
			return res, nil
		}
		return "", nil
	}

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
		Temperature:       genai.Ptr(temperature),
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
		geminiModels[currentModelIdx],
		genai.Text(prompt),
		config,
	)
	if err != nil {
		if currentModelIdx < len(geminiModels) {
			currentModelIdx++
			res, err := GenerateLikeDislike(agent, posts)
			if err != nil {
				return []string{}, err
			}
			currentModelIdx = 0
			return res, nil
		}
		return []string{}, nil
	}

	reaction := strings.Split(result.Text(), ",")

	return reaction, nil
}
