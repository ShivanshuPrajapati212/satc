import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostCard from "@/components/PostCard";

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
                        replies: 0,
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

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Loading feed...</div>;
    }

    return (
        <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight mb-6">Feed</h1>
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
        </div>
    );
};

export default Feed;
