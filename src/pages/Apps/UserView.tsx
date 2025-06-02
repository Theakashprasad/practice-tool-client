import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService, User } from '../../services/userService';
import axios from 'axios';
import Swal from 'sweetalert2';
import { API_ENDPOINTS } from '../../constants';

interface Invitation {
    id: string;
    email: string;
    level?: 'admin' | 'staff' | 'client' | '';
    status: 'pending' | 'accepted' | 'cancelled';
    created_at: string;
    updated_at: string;
}

const UserView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isInvitation, setIsInvitation] = useState(false);
    const [params, setParams] = useState<any>({
        first_name: '',
        last_name: '',
        email: '',
        level: 'staff',
        status: 'active',
        password: '',
    });

    useEffect(() => {
        if (id) {
            if (id.startsWith('inv_')) {
                // Handle invitation
                const invitationId = id.replace('inv_', '');
                fetchInvitation(invitationId);
                setIsInvitation(true);
            } else {
                // Handle regular user
                fetchUser();
                setIsInvitation(false);
            }
        }
    }, [id]);

    const fetchUser = async () => {
        try {
            if (!id) return;
            const user = await userService.getUserById(parseInt(id));
            setParams(user);
        } catch (error) {
            console.error('Error fetching user:', error);
            showMessage('Error fetching user', 'error');
        }
    };

    const fetchInvitation = async (invitationId: string) => {
        try {
            const response = await axios.get(`${API_ENDPOINTS.INVITATION.BASE}/${invitationId}`);
            const invitation = response.data;
            setParams({
                ...params,
                email: invitation.email,
                level: invitation.level || 'staff',
                status: 'inactive'
            });
        } catch (error) {
            console.error('Error fetching invitation:', error);
            showMessage('Error fetching invitation', 'error');
        }
    };

    const changeValue = (e: any) => {
        const { value, id } = e.target;
        setParams({ ...params, [id]: value });
    };

    const saveUser = async () => {
        if (!params.email) {
            showMessage('Email is required.', 'error');
            return;
        }

        try {
            if (isInvitation) {
                // Update invitation
                const invitationId = id?.replace('inv_', '');
                await axios.put(`${API_ENDPOINTS.INVITATION.BASE}/${invitationId}`, {
                    email: params.email,
                    level: params.level,
                    status: 'pending'
                });
                showMessage('Invited user has been updated successfully.');
            } else {
                // Update user
                if (!id) {
                    showMessage('User ID is missing', 'error');
                    return;
                }
                const { password, ...updateParams } = params;  // Remove password from update
                await userService.updateUser(parseInt(id), updateParams);
                showMessage('User has been updated successfully.');
            }
            navigate('/apps/staff');
        } catch (error) {
            console.error('Error saving:', error);
            showMessage('Error saving', 'error');
        }
    };

    const showMessage = (msg = '', type = 'success') => {
        const toast: any = Swal.mixin({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
            customClass: { container: 'toast' },
        });
        toast.fire({
            icon: type,
            title: msg,
            padding: '10px 20px',
        });
    };

    return (
        <div>
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl">{isInvitation ? 'Invitation Details' : 'User Details'}</h2>
                <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                    <button type="button" className="btn btn-outline-danger" onClick={() => navigate('/apps/staff')}>
                        Back
                    </button>
                </div>
            </div>
            <div className="panel mt-5">
                <form>
                    {!isInvitation && (
                        <>
                            <div className="mb-5">
                                <label htmlFor="first_name">First Name</label>
                                <input id="first_name" type="text" placeholder="Enter First Name" className="form-input" value={params.first_name} onChange={(e) => changeValue(e)} />
                            </div>
                            <div className="mb-5">
                                <label htmlFor="last_name">Last Name</label>
                                <input id="last_name" type="text" placeholder="Enter Last Name" className="form-input" value={params.last_name} onChange={(e) => changeValue(e)} />
                            </div>
                            {/* <div className="mb-5">
                                <label htmlFor="password">Password</label>
                                <input id="password" type="password" placeholder="Enter Password" className="form-input" value={params.password} onChange={(e) => changeValue(e)} />
                            </div> */}
                            <div className="mb-5">
                                <label htmlFor="status">Status</label>
                                <select id="status" className="form-select" value={params.status} onChange={(e) => changeValue(e)}>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </>
                    )}
                    <div className="mb-5">
                        <label htmlFor="email">Email</label>
                        <input id="email" type="email" placeholder="Enter Email" className="form-input" value={params.email} onChange={(e) => changeValue(e)} />
                    </div>
                    <div className="mb-5">
                        <label htmlFor="level">Level</label>
                        <select id="level" className="form-select" value={params.level} onChange={(e) => changeValue(e)}>
                            <option value="staff">Staff</option>
                            <option value="client">Client</option>
                        </select>
                    </div>
                    <div className="flex justify-end items-center mt-8">
                        <button type="button" className="btn btn-outline-danger" onClick={() => navigate('/apps/staff')}>
                            Cancel
                        </button>
                        <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={saveUser}>
                            Update
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserView; 