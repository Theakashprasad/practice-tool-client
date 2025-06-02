import { API_BASE_URL } from '../constants';

export interface StaffUser {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    level: string;
}

export const fetchStaffUsers = async (): Promise<StaffUser[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users?level=staff`);
        if (!response.ok) {
            throw new Error('Failed to fetch staff users');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching staff users:', error);
        return [];
    }
}; 