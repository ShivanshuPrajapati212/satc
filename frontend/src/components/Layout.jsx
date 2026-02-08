import React from 'react';
import { Home, Settings, Terminal } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import ParticlesBackground from '@/components/ui/ParticlesBackground';

const Layout = ({ children }) => {
    return (
        <div className="flex min-h-screen w-full bg-black text-foreground font-sans relative">
            <ParticlesBackground />
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-[#27272a] bg-black/80 backdrop-blur-md sm:flex">
                <div className="flex h-16 items-center px-6 border-b border-[#27272a]">
                    <NavLink to="/" className="flex items-center gap-2">
                        <Terminal className="h-5 w-5 text-white" />
                        <span className="text-xl font-bold tracking-tighter font-mono text-white">satc_</span>
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
                        <li>
                            <span className="flex items-center gap-3 rounded-md px-3 py-2 text-zinc-600 cursor-not-allowed">
                                <Settings className="h-4 w-4" />
                                <span className="tracking-wide">System</span>
                            </span>
                        </li>
                    </ul>
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
        </div>
    );
};

export default Layout;
