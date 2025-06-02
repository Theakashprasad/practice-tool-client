import axios from 'axios';
import { API_ENDPOINTS, API_BASE_URL } from '../constants';

// Backend response interface
interface BackendUser {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    level: 'admin' | 'staff' | 'client';
    reset_required: boolean;
    active: boolean;
    created_at: string;
    updated_at: string;
}

interface BackendResponse {
    success: boolean;
    data: BackendUser[];
    message?: string;
}

// Frontend interface
export interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    level: 'admin' | 'staff' | 'client';
    reset_required: boolean;
    status: string;
    password?: string;
    created_at: string;
    updated_at: string;
}

// Mapping functions
const mapBackendToFrontend = (user: BackendUser): User => ({
    ...user,
    status: user.active ? 'active' : 'inactive'
});

const mapFrontendToBackend = (user: Partial<User>): Partial<BackendUser> => {
    const { status, ...rest } = user;
    return {
        ...rest,
        active: status === 'active' ? true : false
    };
};

export const userService = {
    getAllUsers: async (): Promise<User[]> => {
        try {
            const response = await axios.get<BackendResponse>(API_ENDPOINTS.USERS.BASE);
            console.log("API Response:", response.data);
            
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to fetch users');
            }
            
            return response.data.data.map(mapBackendToFrontend);
        } catch (error) {
            console.error("Error fetching users:", error);
            throw new Error('Failed to fetch users');
        }
    },

    getUserById: async (id: number): Promise<User> => {
        const response = await axios.get<BackendUser>(API_ENDPOINTS.USERS.BY_ID(id));
        return mapBackendToFrontend(response.data);
    },

    createUser: async (user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> => {
        if (!user.password) {
            throw new Error('Password is required for creating a new user');
        }
        const backendUser = mapFrontendToBackend(user);
        console.log('Creating user:', backendUser);
        
        const response = await axios.post<BackendUser>(API_ENDPOINTS.USERS.BASE, backendUser);
        return mapBackendToFrontend(response.data);
    },

    updateUser: async (id: number, user: Partial<User>): Promise<User> => {
        const backendUser = mapFrontendToBackend(user);
        console.log('Updating user with data:', backendUser);
        console.log("update user id", id);
        const response = await axios.put<BackendUser>(API_ENDPOINTS.USERS.BY_ID(id), backendUser);
        
        return mapBackendToFrontend(response.data);
    },

    deleteUser: async (id: string): Promise<void> => {
        await axios.delete(API_ENDPOINTS.USERS.BY_ID(id));
    }
}; 