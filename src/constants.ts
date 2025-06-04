// API Base URL configuration
const getBaseUrl = () => {
    if (process.env.NODE_ENV === 'production') {
        return 'http://69.62.83.80:3000';
    }
    return 'http://69.62.83.80:3000';
};

export const API_BASE_URL = getBaseUrl();

// API Endpoints
export const API_ENDPOINTS = {
    // Auth endpoints
    AUTH: {
        LOGIN: `${API_BASE_URL}/auth/login`,
        REGISTER: `${API_BASE_URL}/auth/register`,
        LOGOUT: `${API_BASE_URL}/auth/logout`,
    },
    
    // User endpoints
    USERS: {
        BASE: `${API_BASE_URL}/api/users`,
        BY_ID: (id: string | number) => `${API_BASE_URL}/api/users/${id}`,
        STAFF: `${API_BASE_URL}/api/users?level=staff`,
    },
    
    // Invitation endpoints
    INVITATION: {
        BASE: `${API_BASE_URL}/api/invitation`,
    },
    
    // Practice endpoints
    PRACTICE: {
        BASE: `${API_BASE_URL}/api/practices`,
        BY_ID: (id: string | number) => `${API_BASE_URL}/api/practices/${id}`,
    },
    
    // Client endpoints
    CLIENT: {
        BASE: `${API_BASE_URL}/api/clients`,
        BY_ID: (id: string | number) => `${API_BASE_URL}/api/clients/${id}`,
        GROUPS: `${API_BASE_URL}/api/client-groups`,
        GROUP_BY_ID: (id: string | number) => `${API_BASE_URL}/api/client-groups/${id}`,
    },
    
    // Service endpoints
    SERVICE: {
        TYPES: `${API_BASE_URL}/api/service-types`,
        TYPE_BY_ID: (id: string | number) => `${API_BASE_URL}/api/service-types/${id}`,
        SUBSCRIBED: `${API_BASE_URL}/api/services-subscribed`,
        SUBSCRIBED_BY_ID: (id: string | number) => `${API_BASE_URL}/api/services-subscribed/${id}`,
    },
    
    // Industry endpoints
    INDUSTRY: {
        BASE: `${API_BASE_URL}/api/industries`,
        BY_ID: (id: string | number) => `${API_BASE_URL}/api/industries/${id}`,
    },
    
    // Contact endpoints
    CONTACT: {
        BASE: `${API_BASE_URL}/api/contacts`,
        BY_ID: (id: string | number) => `${API_BASE_URL}/api/contacts/${id}`,
    },
    
    // Chat endpoints
    CHAT: {
        MODELS: `${API_BASE_URL}/api/chat/models`,
        PREFERENCES: {
            BASE: `${API_BASE_URL}/api/chat/preferences`,
            BY_USER_ID: (userId: string | number) => `${API_BASE_URL}/api/chat/preferences/${userId}`,
        },
    },
}; 