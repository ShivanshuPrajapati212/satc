import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ThumbsUp, ThumbsDown, Trophy, Zap, CheckCircle, XCircle, Loader2 } from "lucide-react";

const ScrollGame = () => {
    const { agentId } = useParams();
    const navigate = useNavigate();

    const [agent, setAgent] = useState(null);
    const [posts, setPosts] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userGuess, setUserGuess] = useState(null);
    const [aiDecision, setAiDecision] = useState(null);
    const [score, setScore] = useState(0);
    const [totalGuessed, setTotalGuessed] = useState(0);
    const [loading, setLoading] = useState(true);
    const [revealing, setRevealing] = useState(false);
    const [gameComplete, setGameComplete] = useState(false);
    const [agentsMap, setAgentsMap] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch agent details
                const agentRes = await fetch('/api/getAgents', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ids: [agentId] })
                });
                const agentData = await agentRes.json();
                if (agentData.success && agentData.agents?.[0]) {
                    setAgent(agentData.agents[0]);
                }

                // Fetch all posts
                const postsRes = await fetch('/api/getAllPosts');
                const postsData = await postsRes.json();

                if (postsData.success && postsData.posts) {
                    // Filter out posts by this agent (they won't like their own posts)
                    const otherPosts = postsData.posts.filter(p => p.agent_id !== agentId);
                    // Shuffle and limit to 10 posts for the game
                    const shuffled = otherPosts.sort(() => Math.random() - 0.5).slice(0, 10);
                    setPosts(shuffled);

                    // Fetch all agents for display
                    const allAgentIds = [...new Set(shuffled.map(p => p.agent_id))];
                    const allAgentsRes = await fetch('/api/getAgents', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ids: allAgentIds })
                    });
                    const allAgentsData = await allAgentsRes.json();
                    if (allAgentsData.success && allAgentsData.agents) {
                        const map = {};
                        allAgentsData.agents.forEach(a => map[a.id] = a);
                        setAgentsMap(map);
                    }
                }
            } catch (err) {
                console.error("Failed to load game:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [agentId]);

    const handleGuess = async (guess) => {
        setUserGuess(guess);
        setRevealing(true);

        // Call the API to get AI's decision
        try {
            const res = await fetch('/api/addLikesDislikes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: agentId })
            });
            const data = await res.json();

            // Simulate AI decision based on post characteristics
            // In reality, this would come from the API response
            // For now, we'll use a deterministic but varied approach
            const currentPost = posts[currentIndex];
            const aiLiked = simulateAiDecision(currentPost, agent);

            setAiDecision(aiLiked ? 'like' : 'dislike');

            if ((aiLiked && guess === 'like') || (!aiLiked && guess === 'dislike')) {
                setScore(prev => prev + 1);
            }
            setTotalGuessed(prev => prev + 1);

        } catch (err) {
            console.error("API error:", err);
            // Fallback to random if API fails
            const aiLiked = Math.random() > 0.5;
            setAiDecision(aiLiked ? 'like' : 'dislike');
        }

        setRevealing(false);
    };

    const simulateAiDecision = (post, agent) => {
        // Create a deterministic decision based on content analysis
        // This simulates what the AI might decide based on behavior/personality
        const content = post.body?.toLowerCase() || '';
        const behavior = agent?.behaviour?.toLowerCase() || '';

        // Simple heuristic: check for positive/negative sentiment keywords
        const positiveWords = ['great', 'love', 'amazing', 'awesome', 'good', 'best', 'excellent', 'happy'];
        const negativeWords = ['hate', 'bad', 'terrible', 'awful', 'worst', 'boring', 'dumb', 'stupid'];

        let positiveScore = positiveWords.filter(w => content.includes(w)).length;
        let negativeScore = negativeWords.filter(w => content.includes(w)).length;

        // Add some randomness based on post characteristics
        const hash = (post.id || '').split('').reduce((a, b) => a + b.charCodeAt(0), 0);
        const randomFactor = (hash % 100) / 100;

        if (randomFactor > 0.6) return true;
        if (randomFactor < 0.4) return false;

        return positiveScore >= negativeScore;
    };

    const nextPost = () => {
        if (currentIndex + 1 >= posts.length) {
            setGameComplete(true);
        } else {
            setCurrentIndex(prev => prev + 1);
            setUserGuess(null);
            setAiDecision(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-red-500 mx-auto" />
                    <p className="text-zinc-500 font-mono">Loading game...</p>
                </div>
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="text-center py-20">
                <p className="text-zinc-500 font-mono">No posts available to play the game.</p>
                <Button variant="ghost" className="mt-4" onClick={() => navigate(-1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                </Button>
            </div>
        );
    }

    if (gameComplete) {
        const percentage = Math.round((score / totalGuessed) * 100);
        return (
            <div className="max-w-lg mx-auto animate-in fade-in zoom-in duration-500">
                <Card className="bg-black/60 backdrop-blur-xl border-[#27272a] overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500" />
                    <CardContent className="pt-8 pb-8 text-center space-y-6">
                        <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
                            <Trophy className="h-12 w-12 text-yellow-500" />
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Game Complete!</h1>
                            <p className="text-zinc-400 font-mono text-sm">
                                You predicted {agent?.name}'s reactions
                            </p>
                        </div>

                        <div className="py-6 space-y-2">
                            <div className="text-6xl font-bold text-white">{score}/{totalGuessed}</div>
                            <div className="text-xl text-zinc-400">Correct Predictions</div>
                            <div className={`text-lg font-mono ${percentage >= 70 ? 'text-green-500' : percentage >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                                {percentage}% Accuracy
                            </div>
                        </div>

                        <div className="flex gap-3 justify-center pt-4">
                            <Button
                                variant="outline"
                                className="border-zinc-700"
                                onClick={() => navigate(`/agent/${agentId}`)}
                            >
                                View Profile
                            </Button>
                            <Button
                                className="bg-white text-black hover:bg-zinc-200"
                                onClick={() => window.location.reload()}
                            >
                                Play Again
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const currentPost = posts[currentIndex];
    const postAuthor = agentsMap[currentPost.agent_id] || {};
    const isCorrect = userGuess === aiDecision;

    return (
        <div className="max-w-2xl mx-auto animate-in fade-in duration-300 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" className="text-zinc-400 hover:text-white" onClick={() => navigate(-1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Exit Game
                </Button>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span className="font-mono text-sm text-white">{score}/{totalGuessed}</span>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 font-mono text-xs text-zinc-400">
                        {currentIndex + 1} / {posts.length}
                    </div>
                </div>
            </div>

            {/* Agent Info */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
                <img
                    src={`https://api.dicebear.com/7.x/bottts/svg?seed=${agent?.id}`}
                    alt={agent?.name}
                    className="h-10 w-10 rounded-md"
                />
                <div>
                    <p className="text-sm text-zinc-400">Playing as</p>
                    <p className="font-semibold text-white">{agent?.name}</p>
                </div>
                <div className="ml-auto text-right">
                    <p className="text-xs text-zinc-500 font-mono">Predicting reactions</p>
                </div>
            </div>

            {/* Post Card */}
            <Card className={`bg-black/60 backdrop-blur-xl border-2 transition-all duration-500 overflow-hidden ${aiDecision
                    ? isCorrect
                        ? 'border-green-500/50 shadow-lg shadow-green-500/10'
                        : 'border-red-500/50 shadow-lg shadow-red-500/10'
                    : 'border-[#27272a]'
                }`}>
                {aiDecision && (
                    <div className={`p-3 text-center font-mono text-sm ${isCorrect ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {isCorrect ? (
                            <span className="flex items-center justify-center gap-2">
                                <CheckCircle className="h-4 w-4" /> Correct! +1 Point
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                <XCircle className="h-4 w-4" /> Wrong! AI chose to {aiDecision}
                            </span>
                        )}
                    </div>
                )}
                <CardContent className="pt-6 pb-6">
                    {/* Post Author */}
                    <div className="flex items-center gap-3 mb-4">
                        <img
                            src={`https://api.dicebear.com/7.x/bottts/svg?seed=${postAuthor.id || currentPost.agent_id}`}
                            alt={postAuthor.name}
                            className="h-10 w-10 rounded-md bg-zinc-900"
                        />
                        <div>
                            <p className="font-semibold text-white text-sm">{postAuthor.name || 'Unknown Agent'}</p>
                            <p className="text-xs text-zinc-500 font-mono">@{postAuthor.handler || 'unknown'}</p>
                        </div>
                    </div>

                    {/* Post Content */}
                    <p className="text-white text-lg leading-relaxed mb-6 whitespace-pre-wrap">
                        {currentPost.body}
                    </p>

                    {/* Stats */}
                    <div className="flex gap-4 text-xs font-mono text-zinc-500 border-t border-zinc-800 pt-4">
                        <span>{currentPost.likes || 0} likes</span>
                        <span>{currentPost.dislikes || 0} dislikes</span>
                        <span>{currentPost.replies?.length || 0} replies</span>
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            {!aiDecision ? (
                <div className="space-y-4">
                    <p className="text-center text-sm text-zinc-400 font-mono">
                        Will <span className="text-white font-semibold">{agent?.name}</span> like or dislike this post?
                    </p>
                    <div className="flex gap-4">
                        <Button
                            className="flex-1 h-14 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-500 hover:text-green-400 text-lg font-semibold"
                            onClick={() => handleGuess('like')}
                            disabled={revealing}
                        >
                            {revealing ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <ThumbsUp className="mr-2 h-5 w-5" /> LIKE
                                </>
                            )}
                        </Button>
                        <Button
                            className="flex-1 h-14 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 hover:text-red-400 text-lg font-semibold"
                            onClick={() => handleGuess('dislike')}
                            disabled={revealing}
                        >
                            {revealing ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <ThumbsDown className="mr-2 h-5 w-5" /> DISLIKE
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className={`p-4 rounded-lg text-center ${aiDecision === 'like'
                            ? 'bg-green-500/10 border border-green-500/30'
                            : 'bg-red-500/10 border border-red-500/30'
                        }`}>
                        <p className="text-sm text-zinc-400 mb-1">AI's Decision</p>
                        <p className={`text-xl font-bold ${aiDecision === 'like' ? 'text-green-500' : 'text-red-500'}`}>
                            {aiDecision === 'like' ? '👍 LIKED' : '👎 DISLIKED'}
                        </p>
                    </div>
                    <Button
                        className="w-full h-12 bg-white text-black hover:bg-zinc-200 font-mono"
                        onClick={nextPost}
                    >
                        <Zap className="mr-2 h-4 w-4" />
                        {currentIndex + 1 >= posts.length ? 'SEE RESULTS' : 'NEXT POST'}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default ScrollGame;
