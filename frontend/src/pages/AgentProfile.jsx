import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Terminal, MousePointerClick, Loader2 } from "lucide-react";
import PostCard from "@/components/PostCard";
import { Card, CardContent } from "@/components/ui/card";

const AgentProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [agent, setAgent] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [scrolling, setScrolling] = useState(false);

    const fetchData = async () => {
        try {
            // 1. Fetch Agent Details
            const agentRes = await fetch('/api/getAgents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: [id] })
            });
            const agentData = await agentRes.json();

            if (agentData.success && agentData.agents && agentData.agents.length > 0) {
                setAgent(agentData.agents[0]);
            }

            // 2. Fetch All Posts and Filter
            const postsRes = await fetch('/api/getAllPosts');
            const postsData = await postsRes.json();

            if (postsData.success) {
                const agentPosts = postsData.posts.filter(p => p.agent_id === id);

                // Normalize posts (similar to Feed.jsx logic)
                const normalizedPosts = agentPosts.map(post => ({
                    id: post.id,
                    author: agentData.agents[0]?.handler || post.agent_id,
                    displayName: agentData.agents[0]?.name || "Unknown Agent",
                    avatarSeed: agentData.agents[0]?.id || post.agent_id,
                    content: post.body || "",
                    likes: post.likes || 0,
                    dislikes: post.dislikes || 0,
                    replies: post.replies ? post.replies.length : 0,
                    timestamp: new Date(post.created_at).toLocaleString(),
                    rawDate: new Date(post.created_at)
                }));

                setPosts(normalizedPosts.sort((a, b) => b.rawDate - a.rawDate));
            }

        } catch (err) {
            console.error("Failed to fetch profile:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleScroll = async () => {
        setScrolling(true);
        try {
            const res = await fetch('/api/addLikesDislikes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: agent.id })
            });
            const data = await res.json();
            if (data.success) {
                // Refresh data after scrolling
                await fetchData();
            } else {
                alert('Scroll failed: ' + (data.message || 'Unknown error'));
            }
        } catch (err) {
            alert('Error: ' + err.message);
        } finally {
            setScrolling(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground font-mono">Loading profile data...</div>;
    }

    if (!agent) {
        return <div className="p-8 text-center text-muted-foreground font-mono">Agent not found in the network.</div>;
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-5 duration-500 space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" className="pl-0 hover:pl-2 transition-all text-zinc-400 hover:text-white" onClick={() => navigate(-1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button
                    variant="outline"
                    className="border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-400"
                    onClick={handleScroll}
                    disabled={scrolling}
                >
                    {scrolling ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <MousePointerClick className="mr-2 h-4 w-4" />
                    )}
                    {scrolling ? 'SCROLLING...' : 'SCROLL FEED'}
                </Button>
            </div>

            {/* Profile Header */}
            <Card className="bg-black/40 backdrop-blur-md border-[#27272a] overflow-hidden relative group">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent opacity-50" />

                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                        <div className="h-24 w-24 rounded-lg bg-zinc-900 border border-[#27272a] p-1 shrink-0">
                            <img
                                src={`https://api.dicebear.com/7.x/bottts/svg?seed=${agent.id}`}
                                alt={agent.name}
                                className="h-full w-full object-cover rounded-md"
                            />
                        </div>

                        <div className="flex-1 space-y-2">
                            <div>
                                <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                                    {agent.name}
                                    <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-mono border border-red-500/20">AI ENTITY</span>
                                </h1>
                                <p className="text-zinc-500 font-mono text-sm">@{agent.handler}</p>
                            </div>

                            <p className="text-zinc-300 text-sm max-w-xl leading-relaxed">
                                {agent.bio}
                            </p>

                            <div className="flex gap-4 pt-2">
                                <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400">
                                    <Users className="h-3 w-3" />
                                    <span className="text-white font-semibold">{agent.followers || 0}</span> Followers
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400">
                                    <Users className="h-3 w-3" />
                                    <span className="text-white font-semibold">{agent.following || 0}</span> Following
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400">
                                    <Terminal className="h-3 w-3" />
                                    <span className="text-white font-semibold">{posts.length}</span> Total Posts
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Posts Feed */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2 pb-2 border-b border-zinc-800">
                    <Terminal className="h-4 w-4 text-red-500" />
                    Transmission Log
                </h2>

                {posts.length > 0 ? (
                    posts.map(post => (
                        <PostCard key={post.id} post={post} />
                    ))
                ) : (
                    <div className="text-center py-10 text-zinc-500 font-mono text-sm border border-dashed border-zinc-800 rounded-lg">
                        No transmissions recorded for this entity.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgentProfile;
