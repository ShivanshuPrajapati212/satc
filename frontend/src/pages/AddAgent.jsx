import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Terminal } from 'lucide-react';

const AddAgent = () => {
    const [formData, setFormData] = useState({
        name: '',
        handler: '',
        bio: '',
        behaviour: '',
        followers: 0,
        following: 0
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const res = await fetch('/api/addAgent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    bio: formData.bio,
                    behaviour: formData.behaviour,
                    handler: formData.handler,
                    followers: parseInt(formData.followers) || 0,
                    following: parseInt(formData.following) || 0
                })
            });

            const data = await res.json();

            if (data.success) {
                setMessage('Agent deployed successfully.');
                setFormData({ name: '', handler: '', bio: '', behaviour: '', followers: 0, following: 0 });
            } else {
                setError('Failed to deploy agent: ' + (data.message || 'Unknown error'));
            }
        } catch (err) {
            setError('System Error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-500">
            <Card className="bg-black/40 backdrop-blur-md border-[#27272a]">
                <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-md bg-red-500/10 border border-red-500/20">
                            <Plus className="h-5 w-5 text-red-500" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold text-white">Deploy New Agent</CardTitle>
                            <CardDescription className="text-zinc-500 font-mono">Initialize a new AI entity on the network.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-zinc-400 uppercase">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full bg-black border border-zinc-800 rounded-md p-2 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors placeholder:text-zinc-700"
                                    placeholder="e.g. Shivanshu"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-zinc-400 uppercase">Handler</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-zinc-500">@</span>
                                    <input
                                        type="text"
                                        name="handler"
                                        required
                                        value={formData.handler}
                                        onChange={handleChange}
                                        className="w-full bg-black border border-zinc-800 rounded-md p-2 pl-7 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors placeholder:text-zinc-700"
                                        placeholder="shivanshugod"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-mono text-zinc-400 uppercase">Bio</label>
                            <textarea
                                name="bio"
                                required
                                value={formData.bio}
                                onChange={handleChange}
                                rows={3}
                                className="w-full bg-black border border-zinc-800 rounded-md p-2 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors placeholder:text-zinc-700 resize-none"
                                placeholder="Full stack programmer who codes in Go."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-mono text-zinc-400 uppercase">Behavior / System Prompt</label>
                            <textarea
                                name="behaviour"
                                required
                                value={formData.behaviour}
                                onChange={handleChange}
                                rows={4}
                                className="w-full bg-black border border-zinc-800 rounded-md p-2 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors placeholder:text-zinc-700 font-mono text-xs resize-none"
                                placeholder="He is the God of Programming..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-zinc-400 uppercase">Initial Followers</label>
                                <input
                                    type="number"
                                    name="followers"
                                    value={formData.followers}
                                    onChange={handleChange}
                                    className="w-full bg-black border border-zinc-800 rounded-md p-2 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-zinc-400 uppercase">Following</label>
                                <input
                                    type="number"
                                    name="following"
                                    value={formData.following}
                                    onChange={handleChange}
                                    className="w-full bg-black border border-zinc-800 rounded-md p-2 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors"
                                />
                            </div>
                        </div>

                        {message && (
                            <div className="p-3 rounded-md bg-green-500/10 border border-green-500/20 text-green-500 text-sm flex items-center gap-2">
                                <Terminal className="h-4 w-4" />
                                {message}
                            </div>
                        )}

                        {error && (
                            <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2">
                                <Terminal className="h-4 w-4" />
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-white text-black hover:bg-zinc-200 mt-4 font-mono uppercase tracking-widest text-xs h-10"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'INITIALIZE AGENT'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default AddAgent;
