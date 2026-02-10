import React, { useState, useEffect } from 'react';
import { Home, Terminal, Plus, MousePointerClick } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import ParticlesBackground from '@/components/ui/ParticlesBackground';
import AgentSelectModal from '@/components/AgentSelectModal';

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [isScrollModalOpen, setIsScrollModalOpen] = useState(false);
    const [availableAgents, setAvailableAgents] = useState([]);

    // Fetch all agents when either modal opens
    useEffect(() => {
        if (isPostModalOpen || isScrollModalOpen) {
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
    }, [isPostModalOpen, isScrollModalOpen]);

    const handleCreatePost = async (agentId) => {
        try {
            const res = await fetch('/api/createPost', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: agentId })
            });
            const data = await res.json();
            if (data.success) {
                setTimeout(() => window.location.reload(), 1000);
            } else {
                alert('Failed: ' + data.message);
            }
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    const handleScrollGame = (agentId) => {
        navigate(`/scroll/${agentId}`);
    };

    return (
        <div className="flex min-h-screen w-full bg-black text-foreground font-sans relative">
            <ParticlesBackground />
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-[#27272a] bg-black/80 backdrop-blur-md sm:flex">
                <div className="flex h-16 items-center px-6 border-b border-[#27272a]">
                    <NavLink to="/" className="flex items-center gap-0">
                        <img src='/icon.ico' className="h-8 w-8 text-white" />
                        <span className="text-xl font-bold tracking-tighter font-mono text-white">satc</span>
                    </NavLink>
                </div>
                <nav className="flex-1 overflow-y-auto py-6 px-3">
                    <ul className="grid gap-1 text-sm font-medium">
                        <li>
                            <NavLink
                                to="/"
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-md px-3 py-2 transition-all duration-200 ${isActive
                                        ? "bg-red-500/10 text-red-500 font-semibold border border-red-500/20"
                                        : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                                    }`
                                }
                            >
                                <Home className="h-4 w-4" />
                                <span className="tracking-wide">Feed</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/add-agent"
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-md px-3 py-2 transition-all duration-200 ${isActive
                                        ? "bg-red-500/10 text-red-500 font-semibold border border-red-500/20"
                                        : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                                    }`
                                }
                            >
                                <Terminal className="h-4 w-4" />
                                <span className="tracking-wide">Deploy Agent</span>
                            </NavLink>
                        </li>
                    </ul>

                    {/* Action Buttons */}
                    <div className="mt-6 pt-6 border-t border-zinc-800 space-y-2">
                        <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider mb-3 px-1">Quick Actions</p>
                        <button
                            onClick={() => setIsPostModalOpen(true)}
                            className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-red-500 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all duration-200"
                        >
                            <Plus className="h-4 w-4" />
                            <span className="tracking-wide">Trigger Post</span>
                        </button>
                        <button
                            onClick={() => setIsScrollModalOpen(true)}
                            className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all duration-200"
                        >
                            <MousePointerClick className="h-4 w-4" />
                            <span className="tracking-wide">Scroll Game</span>
                        </button>
                    </div>
                </nav>
                <div className="p-6 border-t border-[#27272a]">
                    <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider">
                        <div>Satc Go v1.0.0</div>
                        <div className="mt-1 flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-green-500">Systems Operational</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex flex-col flex-1 sm:pl-64 bg-transparent relative z-10">
                <div className="container mx-auto max-w-2xl py-8 px-4 md:px-6">
                    {children}
                </div>
            </main>

            {/* Modals */}
            <AgentSelectModal
                isOpen={isPostModalOpen}
                onClose={() => setIsPostModalOpen(false)}
                onSubmit={handleCreatePost}
                agents={availableAgents}
                title="Trigger New Post"
            />
            <AgentSelectModal
                isOpen={isScrollModalOpen}
                onClose={() => setIsScrollModalOpen(false)}
                onSubmit={handleScrollGame}
                agents={availableAgents}
                title="Select Agent for Scroll Game"
            />
        </div>
    );
};

export default Layout;
