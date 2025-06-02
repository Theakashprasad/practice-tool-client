import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import axios from 'axios';
import { API_ENDPOINTS, API_BASE_URL } from '../../constants';

interface RetrievedResult {
    id: string;
    score: number;
    text: string;
}

interface UserData {
    id: number;
    email: string;
    level?: string;
}

const RagRetrieval = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<RetrievedResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [topK, setTopK] = useState<number>(5);
    const resultsEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        dispatch(setPageTitle('RAG Retrieval'));
        
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
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim() || isLoading || !userData) return;

        setIsLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/api/rag/search`, {
                query,
                topK
            });

            setResults(response.data.results);
        } catch (error) {
            console.error('Error retrieving results:', error);
            setResults([{
                id: 'error',
                score: 0,
                text: 'Sorry, there was an error processing your request. Please try again.'
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

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-white dark:bg-gray-900">
            <div className="border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <select
                            value={topK}
                            onChange={(e) => setTopK(Number(e.target.value))}
                            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2"
                        >
                            <option value={3}>Top 3 Results</option>
                            <option value={5}>Top 5 Results</option>
                            <option value={10}>Top 10 Results</option>
                        </select>
                    </div>
                </div>
            </div>

            {!userData ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center p-4">
                        <p className="text-lg text-gray-600 dark:text-gray-300">
                            Please log in to use the RAG retrieval.
                        </p>
                    </div>
                </div>
            ) : results.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <div className="text-center max-w-2xl">
                        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">RAG Retrieval</h1>
                        <p className="text-gray-600 dark:text-gray-300 mb-8">
                            Enter your query to retrieve relevant information from the knowledge base.
                        </p>
                        <div className="w-full max-w-2xl">
                            <form onSubmit={handleSubmit} className="relative">
                                <textarea
                                    ref={inputRef}
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Enter your query here..."
                                    className="w-full p-4 pr-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                    rows={3}
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || !query.trim()}
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
                        {results.map((result, index) => (
                            <div
                                key={result.id}
                                className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Result {index + 1}
                                    </span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        Score: {(result.score * 100).toFixed(2)}%
                                    </span>
                                </div>
                                <div className="text-gray-900 dark:text-white whitespace-pre-wrap">
                                    {result.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-center">
                                <div className="max-w-3xl rounded-lg p-4 bg-gray-100 dark:bg-gray-800">
                                    <div className="flex space-x-2">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={resultsEndRef} />
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                        <form onSubmit={handleSubmit} className="relative">
                            <textarea
                                ref={inputRef}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Enter your query here..."
                                className="w-full p-4 pr-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                rows={3}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !query.trim()}
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

export default RagRetrieval; 