export const isAdmin = (): boolean => {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    return userData.level === 'admin';
}; 