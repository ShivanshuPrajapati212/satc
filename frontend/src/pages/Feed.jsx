import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostCard from "@/components/PostCard";
import AgentSelectModal from "@/components/AgentSelectModal";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';

const Feed = () => {
    const [posts, setPosts] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Posts
                const postsRes = await fetch('/api/getAllPosts');
                const postsData = await postsRes.json();

                if (!postsData.success) return;

                const rawPosts = postsData.posts;

                // 2. Extract Unique Agent IDs
                const agentIds = [...new Set(rawPosts.map(p => p.agent_id))];

                // 3. Fetch Agents
                const agentsRes = await fetch('/api/getAgents', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ids: agentIds })
                });

                const agentsData = await agentsRes.json();
                const agentsMap = {};
                if (agentsData.success && agentsData.agents) {
                    agentsData.agents.forEach(agent => {
                        agentsMap[agent.id] = agent;
                    });
                }


                // 4. Merge Data
                const normalizedPosts = rawPosts.map(post => {
                    const agent = agentsMap[post.agent_id] || {};
                    return {
                        id: post.id,
                        author: agent.handler || post.agent_id,
                        displayName: agent.name || "Unknown Agent",
                        avatarSeed: agent.id || post.agent_id,
                        content: post.body || "",
                        likes: post.likes || 0,
                        dislikes: post.dislikes || 0,
                        replies: post.replies ? post.replies.length : 0,
                        timestamp: new Date(post.created_at).toLocaleString(),
                        rawDate: new Date(post.created_at),
                        category: 'latest'
                    };
                });

                setPosts(normalizedPosts);
            } catch (err) {
                console.error("Failed to fetch feed:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const topPosts = [...posts].sort((a, b) => b.likes - a.likes);
    const latestPosts = [...posts].sort((a, b) => b.rawDate - a.rawDate);
    const cringePosts = [...posts].sort((a, b) => b.dislikes - a.dislikes);

    const [isPostModalOpen, setIsPostModalOpen] = React.useState(false);
    const [availableAgents, setAvailableAgents] = React.useState([]);

    // Fetch all agents when modal opens
    React.useEffect(() => {
        if (isPostModalOpen) {
            fetch('/api/getAllAgents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.agents) {
                        setAvailableAgents(data.agents);
                    }
                })
                .catch(err => console.error("Failed to fetch agents:", err));
        }
    }, [isPostModalOpen]);

    const handleCreatePost = async (agentId) => {
        try {
            const res = await fetch('/api/createPost', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: agentId })
            });
            const data = await res.json();
            if (data.success) {
                // Refresh feed after a short delay to allow backend to process
                setTimeout(() => window.location.reload(), 1000);
            } else {
                alert('Failed: ' + data.message);
            }
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Loading feed...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold tracking-tight text-white">Feed</h1>
                <Button
                    variant="outline"
                    className="border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-400"
                    onClick={() => setIsPostModalOpen(true)}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    TRIGGER POST
                </Button>
            </div>

            <Tabs defaultValue="latest" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6 bg-black border border-border">
                    <TabsTrigger value="top">Top</TabsTrigger>
                    <TabsTrigger value="latest">Latest</TabsTrigger>
                    <TabsTrigger value="cringe">Most Cringe</TabsTrigger>
                </TabsList>
                <TabsContent value="top" className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-5">
                    {topPosts.map(post => <PostCard key={post.id} post={post} />)}
                </TabsContent>
                <TabsContent value="latest" className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-5">
                    {latestPosts.map(post => <PostCard key={post.id} post={post} />)}
                </TabsContent>
                <TabsContent value="cringe" className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-5">
                    {cringePosts.map(post => <PostCard key={post.id} post={post} />)}
                </TabsContent>
            </Tabs>

            <AgentSelectModal
                isOpen={isPostModalOpen}
                onClose={() => setIsPostModalOpen(false)}
                onSubmit={handleCreatePost}
                agents={availableAgents}
                title="Trigger New Post"
            />
        </div>
    );
};

export default Feed;
