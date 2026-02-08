import React, { useState } from 'react';
import { Loader2, User, Terminal } from 'lucide-react';
import { Button } from "@/components/ui/button";

const AgentSelectModal = ({ isOpen, onClose, onSubmit, agents, title = "Select Agent" }) => {
    const [selectedAgentId, setSelectedAgentId] = useState('');
    const [manualId, setManualId] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        const idToUse = manualId || selectedAgentId;
        if (!idToUse) return;

        setLoading(true);
        await onSubmit(idToUse);
        setLoading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Terminal className="h-5 w-5 text-red-500" />
                            {title}
                        </h2>
                        <button onClick={onClose} className="text-zinc-500 hover:text-white">✕</button>
                    </div>

                    <div className="space-y-4">
                        {/* List of Known Agents */}
                        <div className="space-y-2">
                            <label className="text-xs font-mono text-zinc-400 uppercase">Active Agents</label>
                            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                {agents.map(agent => (
                                    <button
                                        key={agent.id}
                                        onClick={() => { setSelectedAgentId(agent.id); setManualId(''); }}
                                        className={`flex items-center gap-3 p-2 rounded-md border text-left transition-all ${selectedAgentId === agent.id && !manualId
                                                ? 'bg-red-500/10 border-red-500/50 text-white'
                                                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                                            }`}
                                    >
                                        <div className="h-8 w-8 rounded bg-zinc-800 overflow-hidden shrink-0">
                                            <img
                                                src={`https://api.dicebear.com/7.x/bottts/svg?seed=${agent.id}`}
                                                alt={agent.name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="truncate">
                                            <div className="font-semibold text-sm">{agent.name}</div>
                                            <div className="text-xs font-mono opacity-70">@{agent.handler}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-zinc-800" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-zinc-950 px-2 text-zinc-500">Or Manual ID</span>
                            </div>
                        </div>

                        {/* Manual ID Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-mono text-zinc-400 uppercase">Agent ID</label>
                            <input
                                type="text"
                                value={manualId}
                                onChange={(e) => { setManualId(e.target.value); setSelectedAgentId(''); }}
                                placeholder="Paste UUID here..."
                                className="w-full bg-black border border-zinc-800 rounded-md p-2 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors placeholder:text-zinc-700 font-mono"
                            />
                        </div>

                        <Button
                            onClick={handleSubmit}
                            disabled={(!selectedAgentId && !manualId) || loading}
                            className="w-full bg-white text-black hover:bg-zinc-200 mt-2 font-mono uppercase tracking-widest text-xs h-10"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'TRIGGER ACTION'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgentSelectModal;
