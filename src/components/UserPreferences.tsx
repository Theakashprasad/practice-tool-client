import React from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../constants';

export enum ChatRetentionPeriod {
    ONE_DAY = '1_day',
    ONE_WEEK = '1_week',
    ONE_MONTH = '1_month'
}

interface UserPreferences {
    chatRetentionPeriod: ChatRetentionPeriod;
    userId: string;
}

interface Props {
    userId: string;
    onPreferencesChange?: (preferences: UserPreferences) => void;
}

const UserPreferences: React.FC<Props> = ({ userId, onPreferencesChange }) => {
    const [preferences, setPreferences] = useState<UserPreferences | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchPreferences();
    }, [userId]);

    const fetchPreferences = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await axios.get(`${API_BASE_URL}/api/preferences/${userId}`);
            setPreferences(response.data);
            onPreferencesChange?.(response.data);
        } catch (error) {
            setError('Failed to load preferences');
            console.error('Error fetching preferences:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRetentionChange = async (period: ChatRetentionPeriod) => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await axios.put(`${API_BASE_URL}/api/preferences`, {
                userId,
                preferences: {
                    chatRetentionPeriod: period
                }
            });
            setPreferences(response.data);
            onPreferencesChange?.(response.data);
        } catch (error) {
            setError('Failed to update preferences');
            console.error('Error updating preferences:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && !preferences) {
        return <div className="text-center p-4">Loading preferences...</div>;
    }

    if (error) {
        return <div className="text-red-500 p-4">{error}</div>;
    }

    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Chat History Retention</h3>
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
                            {period === ChatRetentionPeriod.ONE_DAY && '1 Day'}
                            {period === ChatRetentionPeriod.ONE_WEEK && '1 Week'}
                            {period === ChatRetentionPeriod.ONE_MONTH && '1 Month'}
                        </span>
                    </label>
                ))}
            </div>
            {isLoading && (
                <div className="mt-2 text-sm text-gray-500">Updating...</div>
            )}
        </div>
    );
};

export default UserPreferences; 