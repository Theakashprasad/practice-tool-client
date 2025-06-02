import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import axios from 'axios';
import UserPreferences, { ChatRetentionPeriod } from '../../components/UserPreferences';
import { API_ENDPOINTS, API_BASE_URL } from '../../constants';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: Date;
}

interface ChatSession {
    id: string;
    messages: Message[];
    expiresAt: Date;
}

interface UserData {
    id: number;
    email: string;
    level?: string;
}

const ChatWithAI = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [selectedModel, setSelectedModel] = useState<string>('select for me');
    const [availableModels, setAvailableModels] = useState<Array<{ id: string; name: string }>>([]);
    const [userData, setUserData] = useState<UserData | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        dispatch(setPageTitle('Chat with AI'));
        fetchModels();
        
        // Load user data from localStorage
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
            try {
                const parsedUserData = JSON.parse(storedUserData);
                setUserData(parsedUserData);
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
        
        // Try to restore session from localStorage
        const savedSession = localStorage.getItem('currentChatSession');
        if (savedSession) {
            const session = JSON.parse(savedSession);
            if (new Date(session.expiresAt) > new Date()) {
                setSessionId(session.id);
                setMessages(session.messages);
            } else {
                localStorage.removeItem('currentChatSession');
            }
        }
    }, []);

    const fetchModels = async () => {
        try {
            const response = await axios.get(API_ENDPOINTS.CHAT.MODELS);
            setAvailableModels(response.data);
        } catch (error) {
            console.error('Error fetching models:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !userData) return;

        const userMessage: Message = { 
            role: 'user', 
            content: input,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/api/chat`, {
                messages: [...messages, userMessage],
                model: selectedModel,
                userId: userData.id.toString(),
                sessionId
            });

            const assistantMessage: Message = { 
                role: 'assistant', 
                content: response.data.response,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);
            setSessionId(response.data.sessionId);

            // Save session to localStorage
            const session: ChatSession = {
                id: response.data.sessionId,
                messages: [...messages, userMessage, assistantMessage],
                expiresAt: new Date(response.data.expiresAt)
            };
            localStorage.setItem('currentChatSession', JSON.stringify(session));

        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, there was an error processing your request. Please try again.',
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handlePreferencesChange = () => {
        // Preferences changed, we might want to update the UI or show a notification
        // For now, we'll just log it
        console.log('Chat retention preferences updated');
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-white dark:bg-gray-900">
            <div className="border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2"
                        >
                            {availableModels.map(model => (
                                <option key={model.id} value={model.id}>
                                    {model.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    {userData && (
                        <UserPreferences 
                            userId={userData.id.toString()}
                            onPreferencesChange={handlePreferencesChange}
                        />
                    )}
                </div>
            </div>

            {!userData ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center p-4">
                        <p className="text-lg text-gray-600 dark:text-gray-300">
                            Please log in to use the chat.
                        </p>
                    </div>
                </div>
            ) : messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <div className="text-center max-w-2xl">
                        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Chat with AI</h1>
                        <p className="text-gray-600 dark:text-gray-300 mb-8">
                            Ask me anything and I'll help you find the answers you need.
                        </p>
                        <div className="w-full max-w-2xl">
                            <form onSubmit={handleSubmit} className="relative">
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type your message here..."
                                    className="w-full p-4 pr-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                    rows={3}
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || !input.trim()}
                                    className="absolute right-4 bottom-4 p-2 rounded-lg bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-3xl rounded-lg p-4 ${
                                        message.role === 'user'
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                                    }`}
                                >
                                    <div className="mb-1">{message.content}</div>
                                    {message.timestamp && (
                                        <div className="text-xs opacity-75">
                                            {new Date(message.timestamp).toLocaleTimeString()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="max-w-3xl rounded-lg p-4 bg-gray-100 dark:bg-gray-800">
                                    <div className="flex space-x-2">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                        <form onSubmit={handleSubmit} className="relative">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type your message here..."
                                className="w-full p-4 pr-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                rows={3}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="absolute right-4 bottom-4 p-2 rounded-lg bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                ) : (
                                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </button>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
};

export default ChatWithAI; 