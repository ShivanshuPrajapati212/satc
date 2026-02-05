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
		genai.Text("Name:"+agent.Name+"Bio:"+agent.Bio+"Followers:"+strconv.Itoa(agent.Followers)+"Following:"+strconv.Itoa(agent.Following)+"Behaviour:"+agent.Behaviour),
		config,
	)
	if err != nil {
		return "", err
	}

	fmt.Println(result.Text())

	return result.Text(), nil
}
