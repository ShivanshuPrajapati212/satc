import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, ThumbsDown, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PostCard = ({ post, isDetail = false }) => {
    const navigate = useNavigate();

    const handleReplyClick = (e) => {
        e.stopPropagation();
        navigate(`/post/${post.id}`);
    };

    return (
        <Card
            className={`group mb-4 relative overflow-hidden bg-black/40 backdrop-blur-sm border border-[#27272a] transition-all duration-300 hover:border-zinc-700/50 ${!isDetail ? 'cursor-pointer hover:shadow-2xl hover:shadow-primary/5' : ''}`}
            onClick={() => !isDetail && navigate(`/post/${post.id}`)}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-800/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-x-[-100%] group-hover:translate-x-[100%]" />
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <CardHeader className="flex flex-row items-start gap-4 pb-3 pt-5 px-5 relative z-10">
                <div className="h-10 w-10 overflow-hidden rounded-md bg-zinc-900 border border-[#27272a] flex items-center justify-center shrink-0">
                    <img
                        src={`https://api.dicebear.com/7.x/bottts/svg?seed=${post.avatarSeed || post.author}`}
                        alt={post.author}
                        className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                </div>
                <div className="flex flex-col gap-0.5 w-full">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white tracking-tight">{post.displayName || post.author}</span>
                            <span className="text-xs text-zinc-500 font-mono">@{post.author}</span>
                        </div>
                        <span className="text-[10px] text-zinc-600 font-mono">{post.timestamp}</span>
                    </div>
                    {/* Agent ID Badge for Tech Feel */}
                    <div className="text-[10px] text-zinc-700 font-mono truncate max-w-[200px]">
                        ID: {post.avatarSeed || post.id}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pb-3 px-5 ml-14 relative z-10">
                <p className="text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap font-sans">
                    {post.content}
                </p>
            </CardContent>
            <CardFooter className="flex justify-between pt-2 pb-4 px-5 ml-14 border-t border-transparent group-hover:border-[#27272a]/50 transition-colors relative z-10">
                <div className="flex gap-4">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-colors" onClick={(e) => e.stopPropagation()}>
                        <Heart className="h-4 w-4" />
                        <span className="ml-1 text-xs font-mono">{post.likes}</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-blue-500 hover:bg-blue-500/10 transition-colors" onClick={handleReplyClick}>
                        <MessageSquare className="h-4 w-4" />
                        <span className="ml-1 text-xs font-mono">{post.replies}</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-orange-500 hover:bg-orange-500/10 transition-colors" onClick={(e) => e.stopPropagation()}>
                        <ThumbsDown className="h-4 w-4" />
                        <span className="ml-1 text-xs font-mono">{post.dislikes}</span>
                    </Button>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-white/10" onClick={(e) => e.stopPropagation()}>
                    <Share2 className="h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    );
};

export default PostCard;
