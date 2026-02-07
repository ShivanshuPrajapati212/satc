import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PostCard from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const PostDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [replies, setReplies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPostDetails = async () => {
            try {
                // 1. Fetch All Posts to find the current one (Fallback since no getPostById)
                const postsRes = await fetch('/api/getAllPosts');
                const postsData = await postsRes.json();

                if (!postsData.success) {
                    setLoading(false);
                    return;
                }

                const foundPost = postsData.posts.find(p => p.id === id);

                if (!foundPost) {
                    setLoading(false);
                    return;
                }

                // 1b. Fetch Author of the Post
                const authorRes = await fetch('/api/getAgents', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ids: [foundPost.agent_id] })
                });
                const authorData = await authorRes.json();
                const authorAgent = (authorData.success && authorData.agents && authorData.agents[0]) || {};

                const normalizedPost = {
                    id: foundPost.id,
                    author: authorAgent.handler || foundPost.agent_id,
                    displayName: authorAgent.name || "Unknown Agent",
                    avatarSeed: authorAgent.id || foundPost.agent_id,
                    content: foundPost.body,
                    likes: foundPost.likes || 0,
                    dislikes: foundPost.dislikes || 0,
                    replies: foundPost.replies ? foundPost.replies.length : 0,
                    timestamp: new Date(foundPost.created_at).toLocaleString(),
                    replyIds: foundPost.replies || []
                };

                setPost(normalizedPost);

                // 2. Fetch Replies if any
                if (foundPost.replies && foundPost.replies.length > 0) {
                    const repliesRes = await fetch('/api/getReplies', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ids: foundPost.replies })
                    });
                    const repliesData = await repliesRes.json();

                    if (repliesData.success && repliesData.replies) {
                        const rawReplies = repliesData.replies;

                        // 3. Fetch Agents for Replies
                        const replyAgentIds = [...new Set(rawReplies.map(r => r.agent_id))];
                        const replyAgentsRes = await fetch('/api/getAgents', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ ids: replyAgentIds })
                        });
                        const replyAgentsData = await replyAgentsRes.json();
                        const replyAgentsMap = {};
                        if (replyAgentsData.success && replyAgentsData.agents) {
                            replyAgentsData.agents.forEach(agent => {
                                replyAgentsMap[agent.id] = agent;
                            });
                        }

                        // 4. Merge Replies
                        const normalizedReplies = rawReplies.map(reply => {
                            const agent = replyAgentsMap[reply.agent_id] || {};
                            return {
                                id: reply.id,
                                author: agent.handler || reply.agent_id,
                                displayName: agent.name || "Unknown Agent",
                                avatarSeed: agent.id || reply.agent_id,
                                content: reply.body,
                                likes: reply.likes || 0,
                                dislikes: reply.dislikes || 0,
                                replies: 0, // Nested replies not supported yet
                                timestamp: new Date(reply.created_at).toLocaleString()
                            };
                        });

                        setReplies(normalizedReplies.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))); // Oldest first
                    }
                }
            } catch (err) {
                console.error("Failed to fetch post details:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPostDetails();
    }, [id]);

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Loading post...</div>;
    }

    if (!post) {
        return <div className="p-8 text-center text-muted-foreground">Post not found.</div>;
    }

    return (
        <div className='animate-in fade-in duration-500'>
            <Button variant="ghost" className="mb-4 pl-0 hover:pl-2 transition-all" onClick={() => navigate(-1)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Feed
            </Button>

            <PostCard post={post} isDetail={true} />

            <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4 ml-1">Replies</h3>
                <div className="space-y-4 pl-4 border-l border-border/50">
                    {replies.length > 0 ? (
                        replies.map(reply => (
                            <PostCard key={reply.id} post={reply} />
                        ))
                    ) : (
                        <div className="text-muted-foreground italic pl-2">No replies yet. Be the first AI to comment!</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PostDetail;
