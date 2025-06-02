import { useState, Fragment, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconUserPlus from '../../components/Icon/IconUserPlus';
import IconListCheck from '../../components/Icon/IconListCheck';
import IconLayoutGrid from '../../components/Icon/IconLayoutGrid';
import IconSearch from '../../components/Icon/IconSearch';
import { userService, User } from '../../services/userService';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../../constants';

interface Invitation {
    id: string;
    email: string;
    level?: 'admin' | 'staff' | 'client' | '';
    status: 'pending' | 'accepted' | 'cancelled';
    created_at: string;
    updated_at: string;
}

const Users = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    useEffect(() => {
        dispatch(setPageTitle('Contacts'));
        fetchUsers();
    }, []);

    const [value, setValue] = useState<any>('list');
    const [search, setSearch] = useState<any>('');
    const [contactList, setContactList] = useState<User[]>([]);
    const [filteredItems, setFilteredItems] = useState<User[]>([]);
    const [invitations, setInvitations] = useState<Invitation[]>([]);

    useEffect(() => {
        // Filter contacts based on search term
        const filtered = contactList.filter((contact) => {
            const searchTerm = search.toLowerCase();
            return (
                contact.first_name.toLowerCase().includes(searchTerm) ||
                contact.last_name.toLowerCase().includes(searchTerm) ||
                contact.email.toLowerCase().includes(searchTerm)
            );
        });
        setFilteredItems(filtered);
    }, [search, contactList]);

    const fetchUsers = async () => {
        try {
            // Fetch both users and invitations
            const [users, invitationsResponse] = await Promise.all([
                userService.getAllUsers(),
                axios.get(`${API_BASE_URL}/api/invitation`)
            ]);

            const invitations = invitationsResponse.data;
            setInvitations(invitations);

            // Update user status based on invitation status
            const updatedUsers = users.map((user: User) => {
                const invitation = invitations.find((inv: Invitation) => inv.email === user.email);
                if (invitation) {
                    return {
                        ...user,
                        status: invitation.status === 'accepted' ? 'active' : 'inactive'
                    };
                }
                return user;
            });

            console.log("Fetched users:", updatedUsers);
            console.log("Fetched invitations:", invitations);
            
            setContactList(updatedUsers);
            setFilteredItems(updatedUsers);
        } catch (error) {
            console.error("Error details:", error);
            showMessage('Error fetching users and invitations', 'error');
        }
    };

    const deleteUser = async (user: User) => {
        // First confirmation
        const firstConfirm = await Swal.fire({
            title: 'Are you sure?',
            text: `You are about to delete user ${user.email}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, proceed',
            cancelButtonText: 'No, cancel',
            padding: '2em',
        });

        if (!firstConfirm.isConfirmed) {
            return;
        }

        // Second confirmation
        const secondConfirm = await Swal.fire({
            title: 'Final Confirmation',
            text: 'This action cannot be undone. Are you absolutely sure?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete user',
            cancelButtonText: 'No, cancel',
            confirmButtonColor: '#dc2626',
            padding: '2em',
        });

        if (!secondConfirm.isConfirmed) {
            return;
        }

        try {
            await userService.deleteUser(user.id);
            showMessage('User has been deleted successfully.');
            fetchUsers();
        } catch (error) {
            showMessage('Error deleting user', 'error');
        }
    };

    const deleteInvitation = async (invitation: Invitation) => {
        const confirm = await Swal.fire({
            title: 'Delete Invitation',
            text: `Are you sure you want to delete the invitation for ${invitation.email}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete',
            cancelButtonText: 'No, cancel',
            padding: '2em',
        });

        if (!confirm.isConfirmed) {
            return;
        }

        try {
            await axios.delete(`${API_BASE_URL}/api/invitation/${invitation.id}`);
            showMessage('Invitation has been deleted successfully.');
            fetchUsers();
        } catch (error) {
            showMessage('Error deleting invitation', 'error');
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
                <h2 className="text-xl">User Management</h2>
                <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                    <div className="flex gap-3">
                        <div>
                            <button type="button" className="btn btn-primary" onClick={() => navigate('/apps/staff/invite')}>
                                <IconUserPlus className="ltr:mr-2 rtl:ml-2" />
                                Invite User
                            </button>
                        </div>
                        <div>
                            <button type="button" className={`btn btn-outline-primary p-2 ${value === 'list' && 'bg-primary text-white'}`} onClick={() => setValue('list')}>
                                <IconListCheck />
                            </button>
                        </div>
                        <div>
                            <button type="button" className={`btn btn-outline-primary p-2 ${value === 'grid' && 'bg-primary text-white'}`} onClick={() => setValue('grid')}>
                                <IconLayoutGrid />
                            </button>
                        </div>
                    </div>
                    <div className="relative">
                        <input type="text" placeholder="Search Contacts" className="form-input py-2 ltr:pr-11 rtl:pl-11 peer" value={search} onChange={(e) => setSearch(e.target.value)} />
                        <button type="button" className="absolute ltr:right-[11px] rtl:left-[11px] top-1/2 -translate-y-1/2 peer-focus:text-primary">
                            <IconSearch className="mx-auto" />
                        </button>
                    </div>
                </div>
            </div>
            {value === 'list' && (
                <div className="mt-5 panel p-0 border-0 overflow-hidden">
                    <div className="table-responsive">
                        <table className="table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>First Name</th>
                                    <th>Last Name</th>
                                    <th>Email</th>
                                    <th>Level</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.map((contact: User) => {
                                    return (
                                        <tr 
                                            key={contact.id}
                                            className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                                            onClick={() => navigate(`/apps/staff/${contact.id}`)}
                                        >
                                            <td>
                                                <span className="text-primary">
                                                    {contact.first_name}
                                                </span>
                                            </td>
                                            <td>{contact.last_name}</td>
                                            <td>{contact.email}</td>
                                            <td>
                                                <span className="badge badge-outline-info">
                                                    {contact.level}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${contact.status === 'active' ? 'badge-outline-success' : 'badge-outline-danger'}`}>
                                                    {contact.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {invitations.filter((inv: Invitation) => inv.status === 'pending').map((invitation: Invitation) => {
                                    return (
                                        <tr 
                                            key={invitation.id} 
                                            className="bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                            onClick={() => navigate(`/apps/staff/inv_${invitation.id}`)}
                                        >
                                            <td>-</td>
                                            <td>-</td>
                                            <td>
                                                {invitation.email}
                                            </td>
                                            <td>
                                                <span className="badge badge-outline-info">
                                                    {invitation.level || 'pending'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="badge badge-outline-danger">
                                                    inactive
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {value === 'grid' && (
                <div className="grid 2xl:grid-cols-4 xl:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6 mt-5 w-full">
                    {filteredItems.map((contact: User) => {
                        return (
                            <div className="bg-white dark:bg-[#1c232f] rounded-md overflow-hidden text-center shadow relative" key={contact.id}>
                                <div className="p-6">
                                    <div className="text-xl">
                                        <button 
                                            type="button" 
                                            className="text-primary hover:underline" 
                                            onClick={() => navigate(`/apps/staff/${contact.id}`)}
                                        >
                                            {contact.first_name} {contact.last_name}
                                        </button>
                                    </div>
                                    <div className="text-white-dark">{contact.email}</div>
                                    <div className="mt-4 flex flex-col gap-2">
                                        <div>
                                            <span className="badge badge-outline-info">
                                                Level: {contact.level}
                                            </span>
                                        </div>
                                        <div>
                                            <span className={`badge ${contact.status === 'active' ? 'badge-outline-success' : 'badge-outline-danger'}`}>
                                                Status: {contact.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {invitations.filter((inv: Invitation) => inv.status === 'pending').map((invitation: Invitation) => {
                        return (
                            <div className="bg-gray-50 dark:bg-[#1c232f] rounded-md overflow-hidden text-center shadow relative" key={invitation.id}>
                                <div className="p-6">
                                    <div className="text-xl">Pending Invitation</div>
                                    <div className="text-white-dark">{invitation.email}</div>
                                    <div className="mt-4 flex flex-col gap-2">
                                        <div>
                                            <span className="badge badge-outline-info">
                                                Level: {invitation.level || 'pending'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="badge badge-outline-danger">
                                                Status: inactive
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Users;
