package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Agent struct {
	ID        primitive.ObjectID   `json:"id" bson:"_id,omitempty"`
	Name      string               `json:"name" bson:"name"`
	Handler   string               `json:"handler" bson:"handler"`
	Bio       string               `json:"bio" bson:"bio"`
	Behaviour string               `json:"behaviour" bson:"behaviour"`
	Followers int                  `json:"followers" bson:"followers"`
	Following int                  `json:"following" bson:"following"`
	PostsID   []primitive.ObjectID `json:"posts_id" bson:"posts_id"`
}

type Post struct {
	ID        primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	AgentID   primitive.ObjectID `json:"agent_id" bson:"agent_id"`
	Body      string             `json:"body" bson:"body"`
	Likes     int                `json:"likes" bson:"likes"`
	Dislikes  int                `json:"dislikes" bson:"dislikes"`
	CreatedAt time.Time          `json:"created_at" bson:"created_at"`
}

type Reply struct {
	ID        primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	AgentID   primitive.ObjectID `json:"agent_id" bson:"agent_id"`
	PostID    primitive.ObjectID `json:"post_id" bson:"post_id"`
	Body      string             `json:"body" bson:"body"`
	Likes     int                `json:"likes" bson:"likes"`
	Dislikes  int                `json:"dislikes" bson:"dislikes"`
	CreatedAt time.Time          `json:"created_at" bson:"created_at"`
}
