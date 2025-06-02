import { useEffect, useState } from 'react';
import axios from 'axios';
import IconEdit from '../../components/Icon/IconEdit';
import IconSave from '../../components/Icon/IconSave';
import { API_ENDPOINTS } from '../../constants';

interface UserDetails {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    level: string;
    created_at: string;
}

const MyProfile = () => {
    const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<UserDetails>>({});

    useEffect(() => {
        fetchUserDetails();
    }, []);

    const fetchUserDetails = async () => {
        try {
            // Get user ID from localStorage
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            const userId = userData.id;

            if (!userId) {
                setError('User ID not found');
                setLoading(false);
                return;
            }

            const response = await axios.get(API_ENDPOINTS.USERS.BY_ID(userId));
            setUserDetails(response.data);
            setFormData(response.data);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to fetch user details');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            const userId = userData.id;

            await axios.put(API_ENDPOINTS.USERS.BY_ID(userId), formData);
            setUserDetails(prev => ({ ...prev, ...formData } as UserDetails));
            setIsEditing(false);
            // Show success message
            alert('Profile updated successfully!');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to update profile');
            alert('Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin border-4 border-primary border-l-transparent rounded-full w-10 h-10"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="p-4 bg-red-100 text-red-700 rounded-lg">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="pt-5 px-4">
            <div className="panel">
                <div className="flex items-center justify-between mb-5">
                    <h5 className="font-semibold text-lg dark:text-white-light">My Profile</h5>
                    {!isEditing ? (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="btn btn-primary btn-sm flex items-center"
                        >
                            <IconEdit className="w-4 h-4 mr-2" />
                            Edit Profile
                        </button>
                    ) : (
                        <button 
                            onClick={handleSave}
                            className="btn btn-success btn-sm flex items-center"
                        >
                            <IconSave className="w-4 h-4 mr-2" />
                            Save Changes
                        </button>
                    )}
                </div>
                
                {userDetails && (
                    <div className="space-y-5">
                        <div className="border border-[#ebedf2] dark:border-[#191e3a] rounded-md p-4 mb-5 bg-white dark:bg-black">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-white-dark">First Name</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="first_name"
                                            className="form-input"
                                            value={formData.first_name || ''}
                                            onChange={handleInputChange}
                                        />
                                    ) : (
                                        <div className="font-semibold">{userDetails.first_name}</div>
                                    )}
                                </div>
                                <div>
                                    <label className="text-white-dark">Last Name</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="last_name"
                                            className="form-input"
                                            value={formData.last_name || ''}
                                            onChange={handleInputChange}
                                        />
                                    ) : (
                                        <div className="font-semibold">{userDetails.last_name}</div>
                                    )}
                                </div>
                                <div>
                                    <label className="text-white-dark">Email</label>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            name="email"
                                            className="form-input"
                                            value={formData.email || ''}
                                            onChange={handleInputChange}
                                        />
                                    ) : (
                                        <div className="font-semibold">{userDetails.email}</div>
                                    )}
                                </div>
                                <div>
                                    <label className="text-white-dark">Role</label>
                                    <div className="font-semibold capitalize">{userDetails.level}</div>
                                </div>
                                <div>
                                    <label className="text-white-dark">Member Since</label>
                                    <div className="font-semibold">
                                        {new Date(userDetails.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyProfile; 