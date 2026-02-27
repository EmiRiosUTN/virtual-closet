import { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { createOpenAIChatService } from '../services/openaiChat';
import { storageService } from '../services/storage';
import { useToast } from '../hooks/useToast';
import type { ChatMessage, SavedTryOn } from '../types';

interface OutfitChatPanelProps {
    tryOn: SavedTryOn;
    userPhotoUrl: string;
    clothingPhotosUrls: string[];
    onClose: () => void;
}

type LocalChatMessage = ChatMessage | {
    id: string;
    role: 'system';
    content: string;
    created_at: string;
};

export function OutfitChatPanel({
    tryOn,
    userPhotoUrl,
    clothingPhotosUrls,
    onClose,
}: OutfitChatPanelProps) {
    const [messages, setMessages] = useState<LocalChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const [chatLimit, setChatLimit] = useState({ remaining: 15, allowed: true });
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [userGender, setUserGender] = useState<string | undefined>();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { error: showError } = useToast();

    useEffect(() => {
        loadChatData();
    }, [tryOn.id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadChatData = async () => {
        try {
            // Load user profile for gender
            const profile = await storageService.getUserProfile();
            setUserGender(profile?.gender);

            // Load existing messages
            const existingMessages = await storageService.getChatMessages(tryOn.id);
            setMessages(existingMessages);

            // Load chat limit
            const limit = await storageService.getUsageLimits();
            if (limit) {
                const remaining = 15 - limit.chat_message_count;
                setChatLimit({ remaining: Math.max(0, remaining), allowed: remaining > 0 });
            }
        } catch (err) {
            console.error('Error loading chat data:', err);
            showError('Error al cargar el chat');
        } finally {
            setInitializing(false);
        }
    };



    const handleSendMessage = async () => {
        if (!input.trim() || loading) return;

        // Check chat limit
        const limitCheck = await storageService.checkAndIncrementChatLimit();
        if (!limitCheck.allowed) {
            showError('Has alcanzado el límite de 15 mensajes en total.');
            setChatLimit({ remaining: 0, allowed: false });

            // Add system warning message locally
            const systemMessage: LocalChatMessage = {
                id: crypto.randomUUID(),
                role: 'system',
                content: '🛑 Has alcanzado el límite de 15 mensajes. No puedes enviar más consultas.',
                created_at: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, systemMessage]);
            return;
        }

        setChatLimit({ remaining: limitCheck.remaining, allowed: true });

        const userMessage: ChatMessage = {
            id: crypto.randomUUID(),
            user_id: tryOn.user_id,
            try_on_result_id: tryOn.id,
            role: 'user',
            content: input.trim(),
            created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);
        await storageService.saveChatMessage(tryOn.id, 'user', input.trim());

        const userInput = input.trim();
        setInput('');
        setLoading(true);

        try {
            const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
            const chatService = createOpenAIChatService(apiKey);

            const conversationHistory = messages
                .filter(msg => msg.role === 'user' || msg.role === 'assistant')
                .map((msg) => ({
                    role: msg.role as 'user' | 'assistant',
                    content: msg.content,
                }));

            const response = await chatService.sendChatMessage(
                userInput,
                userPhotoUrl,
                clothingPhotosUrls,
                tryOn.result_image_url,
                conversationHistory,
                userGender
            );

            const assistantMessage: ChatMessage = {
                id: crypto.randomUUID(),
                user_id: tryOn.user_id,
                try_on_result_id: tryOn.id,
                role: 'assistant',
                content: response,
                created_at: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
            await storageService.saveChatMessage(tryOn.id, 'assistant', response);
        } catch (err) {
            console.error('Error sending message:', err);
            showError('Error al enviar el mensaje');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: isCollapsed ? 'calc(100% - 48px)' : 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 h-[100dvh] w-full sm:w-[480px] bg-white shadow-2xl border-l border-gray-200 flex flex-col z-[10001]"
            >
                {/* Collapse/Expand Button */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full bg-white border border-r-0 border-gray-200 rounded-l-xl p-2 hover:bg-gray-50 transition-colors shadow-lg"
                >
                    {isCollapsed ? (
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                    ) : (
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                    )}
                </button>

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Asistente de Moda IA</h3>
                            <p className="text-xs text-gray-500">
                                {chatLimit.remaining} mensajes restantes
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/50 rounded-xl transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {initializing ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-sm text-gray-500">Cargando chat...</p>
                            </div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center max-w-sm px-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Sparkles className="w-8 h-8 text-purple-500" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">¡Hola! 👋</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Soy tu asistente de moda. Pregúntame sobre:
                                </p>
                                <ul className="text-sm text-gray-600 text-left space-y-2">
                                    <li>✨ Combinaciones de colores</li>
                                    <li>👗 Accesorios que combinen</li>
                                    <li>👠 Sugerencias de calzado</li>
                                    <li>🎉 Ocasiones para usar este outfit</li>
                                    <li>💡 Consejos de estilo</li>
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <>
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.role === 'user'
                                            ? 'bg-black text-white'
                                            : message.role === 'system'
                                                ? 'bg-red-50 text-red-700 border border-red-200'
                                                : 'bg-gradient-to-br from-purple-50 to-pink-50 text-gray-900 border border-purple-100'
                                            }`}
                                    >
                                        {message.role === 'assistant' ? (
                                            <div className="text-sm prose prose-sm max-w-none prose-headings:font-semibold prose-p:my-2 prose-ul:my-2 prose-li:my-1">
                                                <ReactMarkdown>{message.content}</ReactMarkdown>
                                            </div>
                                        ) : (
                                            <p className={`text-sm whitespace-pre-wrap ${message.role === 'system' ? 'font-medium' : ''}`}>
                                                {message.content}
                                            </p>
                                        )}
                                        <p
                                            className={`text-xs mt-2 ${message.role === 'user' ? 'text-gray-300'
                                                : message.role === 'system' ? 'text-red-400'
                                                    : 'text-gray-500'
                                                }`}
                                        >
                                            {new Date(message.created_at).toLocaleTimeString('es-ES', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl px-4 py-3 border border-purple-100">
                                        <div className="flex gap-2">
                                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>



                {/* Input */}
                <div className="p-4 pb-6 sm:pb-8 border-t border-gray-200 bg-white">
                    <div className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder={
                                chatLimit.allowed
                                    ? 'Escribe tu pregunta...'
                                    : 'Has usado todos tus mensajes'
                            }
                            disabled={loading}
                            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={loading || !input.trim()}
                            className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/30"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
