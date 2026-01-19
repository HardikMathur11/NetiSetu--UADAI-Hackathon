import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, X, Bot, User, Loader2, Sparkles, Minimize2, Maximize2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { apiService } from '@/services/api';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export const AskNiti: React.FC = () => {
    const { currentFileId, isBackendConnected, isDemoMode } = useApp();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: 'Namaste! I am Niti, your policy assistant. Ask me anything about your dataset.',
            timestamp: new Date()
        }
    ]);

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsLoading(true);

        try {
            let responseText = "I'm sorry, I couldn't process that.";

            if (isDemoMode) {
                // Simulated Demo Response
                await new Promise(resolve => setTimeout(resolve, 1500));
                responseText = simulateDemoResponse(userMsg.content);
            } else if (isBackendConnected && currentFileId) {
                // Real Backend API Call
                const res = await apiService.chatWithData(currentFileId, userMsg.content);
                responseText = res.response;
            } else {
                responseText = "Plese upload a dataset first to start chatting.";
            }

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: responseText,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);

        } catch (error) {
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "I encountered an error connecting to the server. Please try again.",
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const simulateDemoResponse = (query: string): string => {
        const q = query.toLowerCase();
        if (q.includes('enrollment') || q.includes('growth')) return "Based on the demo data, Aadhaar enrollments in Uttar Pradesh have grown by 12% over the last 3 years, showing a steady upward trend.";
        if (q.includes('lowest') || q.includes('coverage')) return "Assam currently has the lowest coverage at 92.3%, which is significantly below the national average of 98%.";
        return "That's an interesting question about the demo data. In a real scenario, I would analyze the 2024 projections to answer that.";
    };

    if (!isOpen) {
        return (
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white p-0 z-50 animate-in zoom-in duration-300"
            >
                <MessageSquare className="h-6 w-6" />
                <span className="sr-only">Ask Niti</span>
            </Button>
        );
    }

    return (
        <Card className={cn(
            "fixed bottom-6 right-6 w-[90vw] md:w-[500px] shadow-2xl z-50 transition-all duration-300 border-indigo-100", // Widen to 500px on desktop
            isMinimized ? "h-[60px]" : "h-[600px]" // Increase height to 600px
        )}>
            {/* Header */}
            <div
                className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-xl flex items-center justify-between cursor-pointer"
                onClick={() => setIsMinimized(!isMinimized)}
            >
                <div className="flex items-center gap-2">
                    <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                        <Bot className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-bold flex items-center gap-2">
                            Ask Niti
                            <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-0 text-[10px] h-5 px-1.5">BETA</Badge>
                        </h3>
                        {!isMinimized && <p className="text-xs text-indigo-100">AI-Powered Policy Assistant</p>}
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}>
                        {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Chat Body */}
            {!isMinimized && (
                <>
                    <ScrollArea className="flex-1 p-4 h-[380px] bg-slate-50/50">
                        <div className="space-y-4">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={cn(
                                        "flex flex-col gap-2 rounded-lg px-3 py-2 text-sm max-w-[85%]", // Removed w-max, keep max-w
                                        msg.role === 'user'
                                            ? "ml-auto bg-indigo-600 text-white w-fit" // User msg can be w-fit
                                            : "bg-white border text-slate-700 shadow-sm w-full" // Assistant msg full width of container
                                    )}
                                >
                                    <div className="flex items-start gap-2"> {/* items-start for multiline alignment */}
                                        {msg.role === 'assistant' && <Sparkles className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />}
                                        <span className="whitespace-pre-wrap leading-relaxed">{msg.content}</span> {/* whitespace-pre-wrap for newlines */}
                                    </div>
                                    <span className={cn("text-[10px] opacity-70 block text-right", msg.role === 'user' ? "text-indigo-100" : "text-slate-400")}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="bg-white border text-slate-700 shadow-sm w-max rounded-lg px-3 py-2 flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                                    <span className="text-xs text-muted-foreground">Analyzing data...</span>
                                </div>
                            )}
                            <div ref={scrollRef} />
                        </div>
                    </ScrollArea>

                    {/* Input Area */}
                    <div className="p-3 border-t bg-white rounded-b-xl flex gap-2">
                        <Input
                            placeholder="Ask about trends, stats, or insights..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            className="flex-1 focus-visible:ring-indigo-500"
                        />
                        <Button size="icon" onClick={handleSend} disabled={isLoading || !inputValue.trim()} className="bg-indigo-600 hover:bg-indigo-700">
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </>
            )}
        </Card>
    );
};
