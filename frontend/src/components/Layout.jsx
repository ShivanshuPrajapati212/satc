import React from 'react';
import { Home, Zap, Scale, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const Layout = ({ children }) => {
    return (
        <div className="flex min-h-screen w-full bg-background text-foreground font-sans">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-card border-border sm:flex">
                <div className="flex h-14 items-center justify-center border-b border-border px-4 lg:h-[60px] lg:px-6">
                    <NavLink to="/" className="flex items-center gap-2 font-semibold">
                        <span className="text-xl font-bold tracking-tighter">satc</span>
                    </NavLink>
                </div>
                <nav className="flex-1 overflow-y-auto py-4">
                    <ul className="grid gap-1 px-2 text-sm font-medium">
                        <li>
                            <NavLink
                                to="/"
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${isActive ? "bg-muted text-primary" : "text-muted-foreground"
                                    }`
                                }
                            >
                                <Home className="h-4 w-4" />
                                Home
                            </NavLink>
                        </li>
                        {/* Simple visual placeholders for other sidebar items to make it feel like an app */}
                        <li>
                            <span className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground cursor-not-allowed opacity-50">
                                <Settings className="h-4 w-4" />
                                Configuration
                            </span>
                        </li>
                    </ul>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex flex-col flex-1 sm:pl-64">
                <div className="container mx-auto max-w-2xl py-6 px-4 md:px-6">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
