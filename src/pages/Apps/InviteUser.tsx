import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import { API_ENDPOINTS } from '../../constants';

const InviteUser = () => {
    const navigate = useNavigate();
    const [params, setParams] = useState({
        email: '',
        level: 'staff'
    });

    const changeValue = (e: any) => {
        const { value, id } = e.target;
        setParams({ ...params, [id]: value });
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

    const saveUser = async () => {
        if (!params.email) {
            showMessage('Email is required.', 'error');
            return true;
        }

        try {
            await axios.post(API_ENDPOINTS.INVITATION.BASE, {
                email: params.email,
                level: params.level || undefined,
                status: 'pending'
            });
            showMessage('Invitation has been sent successfully.');
            navigate('/apps/staff');
        } catch (error) {
            console.error('Error sending invitation:', error);
            showMessage('Error sending invitation', 'error');
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                <h2 className="text-xl">Invite User</h2>
            </div>
            <div className="panel">
                <div className="p-5">
                    <form className="space-y-5">
                        <div>
                            <label htmlFor="email">Email</label>
                            <input 
                                id="email" 
                                type="email" 
                                placeholder="Enter Email" 
                                className="form-input" 
                                value={params.email} 
                                onChange={(e) => changeValue(e)} 
                            />
                        </div>
                        {/* <div>
                            <label htmlFor="level">Level (Optional)</label>
                            <select 
                                id="level" 
                                className="form-select" 
                                value={params.level} 
                                onChange={(e) => changeValue(e)}
                            >
                                <option value="staff">Staff</option>
                                <option value="client">Client</option>
                            </select>
                        </div> */}
                        <div className="flex gap-4 justify-end">
                            <button 
                                type="button" 
                                className="btn btn-outline-danger" 
                                onClick={() => navigate('/apps/staff')}
                            >
                                Cancel
                            </button>
                            <button 
                                type="button" 
                                className="btn btn-primary" 
                                onClick={saveUser}
                            >
                                Send Invitation
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default InviteUser; 