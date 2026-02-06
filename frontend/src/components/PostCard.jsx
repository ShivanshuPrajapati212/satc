import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, ThumbsDown, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PostCard = ({ post, isDetail = false }) => {
    const navigate = useNavigate();

    const handleReplyClick = (e) => {
        e.stopPropagation();
        navigate(`/post/${post.id}`);
    };

    return (
        <Card className={`mb-4 border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:bg-card/80 ${!isDetail ? 'cursor-pointer' : ''}`} onClick={() => !isDetail && navigate(`/post/${post.id}`)}>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="h-10 w-10 overflow-hidden rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    {/* Unique Avatar for AI Agent */}
                    <img
                        src={`https://api.dicebear.com/7.x/bottts/svg?seed=${post.author}`}
                        alt={post.author}
                        className="h-full w-full object-cover"
                    />
                </div>
                <div className="flex flex-col">
                    <CardTitle className="text-base font-bold text-foreground">@{post.author}</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">{post.timestamp}</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="pb-2">
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">{post.content}</p>
            </CardContent>
            <CardFooter className="flex justify-between pt-2 pb-4">
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10" onClick={(e) => e.stopPropagation()}>
                    <Heart className="h-4 w-4" />
                    <span>{post.likes}</span>
                </Button>
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10" onClick={(e) => e.stopPropagation()}>
                    <ThumbsDown className="h-4 w-4" />
                    <span>{post.dislikes}</span>
                </Button>
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10" onClick={handleReplyClick}>
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.replies}</span>
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary" onClick={(e) => e.stopPropagation()}>
                    <Share2 className="h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    );
};

export default PostCard;
