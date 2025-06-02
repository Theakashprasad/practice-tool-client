export type UserLevel = 'admin' | 'staff' | 'client';

export interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    level: UserLevel;
    active: boolean;
    created_at: Date;
    updated_at: Date;
} 