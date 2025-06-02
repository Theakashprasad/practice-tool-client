import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../constants';

export enum ChatRetentionPeriod {
    ONE_DAY = '1_day',
    ONE_WEEK = '1_week',
    ONE_MONTH = '1_month'
}

interface ChatPreferences {
    chatRetentionPeriod: ChatRetentionPeriod;
    userId: string;
}

interface Props {
    userId: string;
    onPreferencesChange?: (preferences: ChatPreferences) => void;
    className?: string;
}

const ChatPreferences: React.FC<Props> = ({ userId, onPreferencesChange, className = '' }) => {
    const [preferences, setPreferences] = useState<ChatPreferences | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (userId) {
            fetchPreferences();
        }
    }, [userId]);

    const fetchPreferences = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await axios.get(API_ENDPOINTS.CHAT.PREFERENCES.BY_USER_ID(userId));
            setPreferences(response.data);
            onPreferencesChange?.(response.data);
        } catch (error) {
            setError('Failed to load preferences');
            console.error('Error fetching preferences:', error);
            // Set default preferences if none exist
            const defaultPrefs = {
                userId,
                chatRetentionPeriod: ChatRetentionPeriod.ONE_MONTH
            };
            setPreferences(defaultPrefs);
            onPreferencesChange?.(defaultPrefs);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRetentionChange = async (period: ChatRetentionPeriod) => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await axios.post(API_ENDPOINTS.CHAT.PREFERENCES.BASE, {
                userId,
                chatRetentionPeriod: period
            });
            setPreferences(response.data);
            onPreferencesChange?.(response.data);
            setIsOpen(false); // Close the dropdown after successful update
        } catch (error) {
            setError('Failed to update preferences');
            console.error('Error updating preferences:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatPeriod = (period: ChatRetentionPeriod): string => {
        switch (period) {
            case ChatRetentionPeriod.ONE_DAY:
                return '1 Day';
            case ChatRetentionPeriod.ONE_WEEK:
                return '1 Week';
            case ChatRetentionPeriod.ONE_MONTH:
                return '1 Month';
            default:
                return period;
        }
    };

    return (
        <div className={className}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Retention Settings</span>
                {preferences && (
                    <span className="text-sm text-gray-500">
                        ({formatPeriod(preferences.chatRetentionPeriod)})
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <div className="p-4">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                            Chat History Retention
                        </h3>
                        <div className="space-y-2">
                            {Object.values(ChatRetentionPeriod).map((period) => (
                                <label key={period} className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name="retention"
                                        value={period}
                                        checked={preferences?.chatRetentionPeriod === period}
                                        onChange={() => handleRetentionChange(period)}
                                        className="form-radio text-primary"
                                        disabled={isLoading}
                                    />
                                    <span className="text-gray-700 dark:text-gray-300">
                                        {formatPeriod(period)}
                                    </span>
                                </label>
                            ))}
                        </div>
                        {error && (
                            <p className="mt-2 text-sm text-red-500">{error}</p>
                        )}
                        {isLoading && (
                            <div className="mt-2 text-sm text-gray-500">Updating...</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatPreferences; 