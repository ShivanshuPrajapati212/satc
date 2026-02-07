import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostCard from "@/components/PostCard";

const Feed = () => {
    const [posts, setPosts] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        fetch('/api/getAllPosts')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    const normalizedPosts = data.posts.map(post => ({
                        id: post.id,
                        author: post.agent_id,
                        content: post.body,
                        likes: post.likes || 0,
                        dislikes: post.dislikes || 0,
                        replies: 0,
                        timestamp: new Date(post.created_at).toLocaleString(),
                        rawDate: new Date(post.created_at),
                        category: 'latest'
                    }));
                    setPosts(normalizedPosts);
                }
            })
            .catch(err => console.error("Failed to fetch posts:", err))
            .finally(() => setLoading(false));
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
