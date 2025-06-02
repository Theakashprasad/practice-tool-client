import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../store';
import { setPageTitle } from '../store/themeConfigSlice';
import axios from 'axios';
import ChatPreferences, { ChatRetentionPeriod } from '../components/ChatPreferences';
import { API_BASE_URL } from '../constants';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: Date;
}

interface Model {
    id: string;
    name: string;
}

interface ChatSession {
    id: string;
    messages: Message[];
    expiresAt: Date;
    sessionName: string;
}

interface UserData {
    id: number;
    email: string;
    level?: string;
}

interface ChatHistoryItem {
    id: string;
    sessionName: string;
    createdAt: Date;
    updatedAt: Date;
    lastMessage: string;
    messageCount: number;
}

const ChatWithAI = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [models, setModels] = useState<Model[]>([]);
    const [selectedModel, setSelectedModel] = useState('select for me');
    const [isLoadingModels, setIsLoadingModels] = useState(true);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [sessionName, setSessionName] = useState<string>('New Chat');
    const [isEditingName, setIsEditingName] = useState(false);
    const [userData, setUserData] = useState<UserData | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const nameInputRef = useRef<HTMLInputElement>(null);
    const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);

    useEffect(() => {
        dispatch(setPageTitle('Chat with AI'));
        
        // Load user data from localStorage
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
            try {
                const parsedUserData = JSON.parse(storedUserData);
                setUserData(parsedUserData);
                fetchChatHistory(parsedUserData.id.toString());
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }

        // Load existing session from localStorage
        const savedSession = localStorage.getItem('currentChatSession');
        if (savedSession) {
            const session: ChatSession = JSON.parse(savedSession);
            if (new Date(session.expiresAt) > new Date()) {
                setMessages(session.messages);
                setSessionId(session.id);
                setSessionName(session.sessionName);
            } else {
                localStorage.removeItem('currentChatSession');
            }
        }
        
        // Fetch available models
        fetchModels();
    }, []);

    const fetchModels = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/chat/models`);
            setModels(response.data);
            // Set default model to first available model
            if (response.data.length > 0) {
                setSelectedModel(response.data[0].id);
            }
        } catch (error) {
            console.error('Error fetching models:', error);
        } finally {
            setIsLoadingModels(false);
        }
    };

    const fetchChatHistory = async (userId: string) => {
        try {
            setIsHistoryLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/chat/history/${userId}`);
            setChatHistory(response.data);
        } catch (error) {
            console.error('Error fetching chat history:', error);
        } finally {
            setIsHistoryLoading(false);
        }
    };

    const loadChatSession = async (sessionId: string) => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/chat/session/${sessionId}`);
            setMessages(response.data.messages);
            setSessionId(sessionId);
            setSessionName(response.data.sessionName);
            
            // Refresh chat history after loading a session
            if (userData) {
                await fetchChatHistory(userData.id.toString());
            }
        } catch (error) {
            console.error('Error loading chat session:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Scroll to bottom when messages change
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !userData) return;

        const userMessage: Message = { 
            role: 'user', 
            content: input,
            timestamp: new Date()
        };
        setInput('');

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/api/chat`, {
                messages: [...messages, userMessage],
                model: selectedModel,
                userId: userData.id.toString(),
                sessionId,
                sessionName: messages.length === 0 ? input : undefined
            });

            const assistantMessage: Message = { 
                role: 'assistant', 
                content: response.data.response,
                timestamp: new Date()
            };
            
            setMessages(prev => [...prev, assistantMessage]);
            setSessionId(response.data.sessionId);
            setSessionName(response.data.sessionName);

            // Save session to localStorage
            const session: ChatSession = {
                id: response.data.sessionId,
                messages: [...messages, userMessage, assistantMessage],
                expiresAt: new Date(response.data.expiresAt),
                sessionName: response.data.sessionName
            };
            localStorage.setItem('currentChatSession', JSON.stringify(session));

            // Refresh chat history after successful message
            await fetchChatHistory(userData.id.toString());

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

    const clearChat = async () => {
        setMessages([]);
        setSessionId(null);
        localStorage.removeItem('currentChatSession');
        
        // Refresh chat history after clearing chat
        if (userData) {
            await fetchChatHistory(userData.id.toString());
        }
    };

    const handlePreferencesChange = (newPreferences: { chatRetentionPeriod: ChatRetentionPeriod }) => {
        // When preferences change, we need to update the current session's expiry
        if (sessionId) {
            const session = JSON.parse(localStorage.getItem('currentChatSession') || '{}');
            if (session) {
                const now = new Date();
                let expiryDate = new Date(now);
                
                switch (newPreferences.chatRetentionPeriod) {
                    case ChatRetentionPeriod.ONE_DAY:
                        expiryDate.setDate(now.getDate() + 1);
                        break;
                    case ChatRetentionPeriod.ONE_WEEK:
                        expiryDate.setDate(now.getDate() + 7);
                        break;
                    case ChatRetentionPeriod.ONE_MONTH:
                        expiryDate.setDate(now.getDate() + 30);
                        break;
                }
                
                session.expiresAt = expiryDate;
                localStorage.setItem('currentChatSession', JSON.stringify(session));
            }
        }
    };

    const handleNameEdit = () => {
        setIsEditingName(true);
        setTimeout(() => {
            nameInputRef.current?.focus();
            nameInputRef.current?.select();
        }, 0);
    };

    const handleNameSave = () => {
        setIsEditingName(false);
        if (sessionId) {
            const session = JSON.parse(localStorage.getItem('currentChatSession') || '{}');
            if (session) {
                session.sessionName = sessionName;
                localStorage.setItem('currentChatSession', JSON.stringify(session));
            }
        }
    };

    const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleNameSave();
        } else if (e.key === 'Escape') {
            setIsEditingName(false);
        }
    };

    if (!userData) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-white dark:bg-gray-900">
                <div className="text-center p-4">
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                        Please log in to use the chat.
                    </p>
                </div>
            </div>
        );
    }

    if (isLoadingModels) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-white dark:bg-gray-900">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-4rem)] bg-white dark:bg-gray-900">
            {/* Chat History Sidebar */}
            {showSidebar && (
                <div className="w-64 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Chat History</h2>
                        <button
                            onClick={() => setShowSidebar(false)}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="p-4 space-y-2">
                        <button
                            onClick={clearChat}
                            className="w-full px-4 py-2 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center space-x-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>New Chat</span>
                        </button>
                        {isHistoryLoading ? (
                            <div className="flex justify-center p-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                            </div>
                        ) : (
                            chatHistory.map((session) => (
                                <button
                                    key={session.id}
                                    onClick={() => loadChatSession(session.id)}
                                    className={`w-full px-4 py-2 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${
                                        sessionId === session.id ? 'bg-gray-100 dark:bg-gray-800' : ''
                                    }`}
                                >
                                    <div className="font-medium truncate">{session.sessionName}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                        {session.lastMessage || 'No messages'}
                                    </div>
                                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                        {new Date(session.updatedAt).toLocaleDateString()}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-4">
                        {!showSidebar && (
                            <button
                                onClick={() => setShowSidebar(true)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        )}
                        {isEditingName ? (
                            <input
                                ref={nameInputRef}
                                type="text"
                                value={sessionName}
                                onChange={(e) => setSessionName(e.target.value)}
                                onBlur={handleNameSave}
                                onKeyDown={handleNameKeyDown}
                                className="text-xl font-semibold bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-primary dark:text-white"
                                placeholder="Enter chat name"
                            />
                        ) : (
                            <h2 
                                className="text-xl font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-primary"
                                onClick={handleNameEdit}
                                title="Click to edit name"
                            >
                                {sessionName}
                            </h2>
                        )}
                        <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            disabled={isLoadingModels}
                        >
                            {models.map((model) => (
                                <option key={model.id} value={model.id}>
                                    {model.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center space-x-4">
                        {userData && (
                            <>
                                <ChatPreferences
                                    userId={userData.id.toString()}
                                    onPreferencesChange={handlePreferencesChange}
                                    className="relative"
                                />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {userData.email}
                                </span>
                            </>
                        )}
                        <button
                            onClick={clearChat}
                            className="text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                        >
                            Clear Chat
                        </button>
                    </div>
                </div>
                
                {messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-4">
                        <div className="text-center max-w-2xl">
                            <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Start a New Chat</h1>
                            <p className="text-gray-600 dark:text-gray-300 mb-8">
                                Select a model and start asking questions. I'll help you find the answers you need.
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
                                        disabled={isLoading || !input.trim() || !selectedModel}
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
                                    disabled={isLoading || !input.trim() || !selectedModel}
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
        </div>
    );
};

export default ChatWithAI; 