import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../../constants';
import { fetchStaffUsers, StaffUser } from '../../services/staffService';
import axios from 'axios';
import { userService } from '../../services/userService';

const currencies = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'CNY', name: 'Chinese Yuan' },
    { code: 'INR', name: 'Indian Rupee' }
];

const defaultPractice = {
    name: '',
    currency: '',
    staffPartnerId: null as string | null,
    staffManager1Id: null as string | null,
    staffManager2Id: null as string | null,
    staffAccountantIds: null as string | null,
    staffBookkeeper1Id: null as string | null,
    staffBookkeeper2Id: null as string | null,
    staffTaxSpecialistId: null as string | null,
    staffOther1Id: null as string | null,
    staffOther2Id: null as string | null,
    staffOther3Id: null as string | null,
    staffOther4Id: null as string | null,
    staffOther5Id: null as string | null,
    staffAdmin1Id: null as string | null,
    staffAdmin2Id: null as string | null,
    clientGroups: [] as { id: string }[],
};

interface Invitation {
    id: string;
    email: string;
    level?: 'admin' | 'staff' | 'client' | '';
    status: 'pending' | 'accepted' | 'cancelled';
    created_at: string;
    updated_at: string;
}

const AddPractice = () => {
    const navigate = useNavigate();
    const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [practice, setPractice] = useState({ ...defaultPractice });
    const [clientGroups, setClientGroups] = useState<any[]>([]);

    useEffect(() => {
        fetchClientGroups();
        fetchStaffAndInvitations();
    }, []);

    const fetchClientGroups = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/client-groups`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setClientGroups(data);
            }
        } catch (error) {
            console.error('Error fetching client groups:', error);
        }
    };

    const fetchStaffAndInvitations = async () => {
        try {
            // Fetch both users and invitations
            const [users, invitationsResponse] = await Promise.all([
                userService.getAllUsers(),
                axios.get(`${API_BASE_URL}/api/invitation`)
            ]);

            console.log("users", users);
            console.log(invitationsResponse);

            // Convert User[] to StaffUser[] by mapping id to string
            setStaffUsers(Array.isArray(users) ? users.map(user => ({ ...user, id: String(user.id) })) : []);
            setInvitations(Array.isArray(invitationsResponse.data) ? invitationsResponse.data : []);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching staff users and invitations:', error);
            setStaffUsers([]);
            setInvitations([]);
            setIsLoading(false);
        }
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setPractice((prev) => ({ ...prev, [name]: value || null }));
    };

    const handleClientGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => ({ id: option.value }));
        setPractice(prev => ({
            ...prev,
            clientGroups: selectedOptions
        }));
    };

    const handleStaffAccountantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setPractice(prev => ({
            ...prev,
            staffAccountantIds: selectedOptions.length > 0 ? selectedOptions.join(',') : null
        }));
    };

console.log("practice",practice);
    

    const savePractice = async () => {
        try {
            await fetch(`${API_BASE_URL}/api/practices`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(practice),
            });
            Swal.fire({ icon: 'success', title: 'Practice created!' });
            navigate('/apps/practice');
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Failed to save practice' });
            console.error(error);
        }
    };

    const renderStaffDropdown = (fieldName: string, value: string | null, label: string) => (
        <div className="mb-5">
            <label htmlFor={fieldName}>{label}</label>
            <select
                id={fieldName}
                name={fieldName}
                className="form-select"
                value={value || ''}
                onChange={handleChange}
                disabled={isLoading}
            >
                <option value="">Select {label}</option>
                {/* Render active users */}
                {Array.isArray(staffUsers) && staffUsers.map(staff => (
                    <option key={staff.id} value={staff.id}>
                        {staff.first_name} {staff.last_name} ({staff.email})
                    </option>
                ))}
                {/* Render pending invitations */}
                {Array.isArray(invitations) && invitations
                    .filter(inv => inv.status === 'pending')
                    .map(inv => (
                        <option key={`${inv.id}`} value={`${inv.id}`}>
                            {inv.email} (Pending Invitation)
                        </option>
                    ))
                }
            </select>
        </div>
    );

    return (
        <div>
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl">Add Practice</h2>
            </div>
            <div className="panel mt-5">
                <form onSubmit={e => { e.preventDefault(); savePractice(); }}>
                    <div className="mb-5">
                        <label htmlFor="name">Name</label>
                        <input id="name" name="name" type="text" placeholder="Enter Name" className="form-input" value={practice.name} onChange={handleChange} required />
                    </div>
                    <div className="mb-5">
                        <label htmlFor="currency">Currency</label>
                        <select id="currency" name="currency" className="form-select" value={practice.currency} onChange={handleChange} required>
                            <option value="">Select Currency</option>
                            {currencies.map(currency => (
                                <option key={currency.code} value={currency.code}>
                                    {currency.code} - {currency.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    {renderStaffDropdown('staffPartnerId', practice.staffPartnerId, 'Staff Partner')}
                    {renderStaffDropdown('staffManager1Id', practice.staffManager1Id, 'Staff Manager 1')}
                    {renderStaffDropdown('staffManager2Id', practice.staffManager2Id, 'Staff Manager 2')}
                    {renderStaffDropdown('staffBookkeeper1Id', practice.staffBookkeeper1Id, 'Staff Bookkeeper 1')}
                    {renderStaffDropdown('staffBookkeeper2Id', practice.staffBookkeeper2Id, 'Staff Bookkeeper 2')}
                    {renderStaffDropdown('staffTaxSpecialistId', practice.staffTaxSpecialistId, 'Staff Tax Specialist')}
                    {renderStaffDropdown('staffOther1Id', practice.staffOther1Id, 'Staff Other 1')}
                    {renderStaffDropdown('staffOther2Id', practice.staffOther2Id, 'Staff Other 2')}
                    {renderStaffDropdown('staffOther3Id', practice.staffOther3Id, 'Staff Other 3')}
                    {renderStaffDropdown('staffOther4Id', practice.staffOther4Id, 'Staff Other 4')}
                    {renderStaffDropdown('staffOther5Id', practice.staffOther5Id, 'Staff Other 5')}
                    {renderStaffDropdown('staffAdmin1Id', practice.staffAdmin1Id, 'Staff Admin 1')}
                    {renderStaffDropdown('staffAdmin2Id', practice.staffAdmin2Id, 'Staff Admin 2')}
                    <div className="mb-5">
                        <label htmlFor="staffAccountantIds">Staff Accountants</label>
                        <select
                            id="staffAccountantIds"
                            name="staffAccountantIds"
                            multiple
                            className="form-multiselect"
                            value={practice.staffAccountantIds ? practice.staffAccountantIds.split(',') : []}
                            onChange={handleStaffAccountantChange}
                            disabled={isLoading}
                        >
                            {/* Render active users */}
                            {Array.isArray(staffUsers) && staffUsers.map(staff => (
                                <option key={staff.id} value={staff.id}>
                                    {staff.first_name} {staff.last_name} ({staff.email})
                                </option>
                            ))}
                            {/* Render pending invitations */}
                            {Array.isArray(invitations) && invitations
                                .filter(inv => inv.status === 'pending')
                                .map(inv => (
                                    <option key={`${inv.id}`} value={`${inv.id}`}>
                                        {inv.email} (Pending Invitation)
                                    </option>
                                ))
                            }
                        </select>
                    </div>
                    <div className="mb-5">
                        <label htmlFor="clientGroups">Client Groups</label>
                        <select
                            id="clientGroups"
                            name="clientGroups"
                            multiple
                            className="form-multiselect"
                            value={practice.clientGroups.map(group => group.id)}
                            onChange={handleClientGroupChange}
                        >
                            {clientGroups.map((group) => (
                                <option key={group.id} value={group.id}>{group.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end items-center mt-8">
                        <button type="button" className="btn btn-outline-danger" onClick={() => navigate('/apps/practice')}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPractice; 