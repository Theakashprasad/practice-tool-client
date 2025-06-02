import { useState, Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Swal from 'sweetalert2';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconUserPlus from '../../components/Icon/IconUserPlus';
import IconListCheck from '../../components/Icon/IconListCheck';
import IconLayoutGrid from '../../components/Icon/IconLayoutGrid';
import IconSearch from '../../components/Icon/IconSearch';
import IconUser from '../../components/Icon/IconUser';
import IconFacebook from '../../components/Icon/IconFacebook';
import IconInstagram from '../../components/Icon/IconInstagram';
import IconLinkedin from '../../components/Icon/IconLinkedin';
import IconTwitter from '../../components/Icon/IconTwitter';
import IconX from '../../components/Icon/IconX';
import axios from 'axios';
import { isAdmin } from '../../utils/authUtils';
import { API_BASE_URL } from '../../constants';

interface Invitation {
    id: string;
    email: string;
    level?: 'admin' | 'staff' | 'client' | '';
    status: 'pending' | 'accepted' | 'cancelled';
    created_at: string;
    updated_at: string;
}

interface InvitationParams {
    email: string;
    level: 'admin' | 'staff' | 'client' | '';
}

const Invitation = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Invitation'));
        fetchInvitations();
    }, []);

    const [addContactModal, setAddContactModal] = useState<any>(false);
    const [value, setValue] = useState<any>('list');
    const [search, setSearch] = useState<any>('');
    const [filteredItems, setFilteredItems] = useState<any>([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);

    const [invitationParams, setInvitationParams] = useState<InvitationParams>({
        email: '',
        level: '',
    });

    const [params, setParams] = useState<any>(JSON.parse(JSON.stringify(invitationParams)));

    const fetchInvitations = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/invitation`);
            console.log("res",response);
            
            setFilteredItems(response.data);
        } catch (error) {
            showMessage('Failed to fetch invitations', 'error');
        }
    };

    const changeValue = (e: any) => {
        const { value, id } = e.target;
        setParams({ ...params, [id]: value });
    };

    useEffect(() => {
        setFilteredItems((prevItems: any) => {
            return prevItems.filter((item: any) => {
                return item?.email?.toLowerCase().includes(search.toLowerCase()) || '';
            });
        });
    }, [search]);

    const handleSaveUser = async () => {
        if (!invitationParams.email) {
            setError('Email is required');
            return;
        }

        try {
            setLoading(true);
            setError('');
            await createInvitation(invitationParams);
            setShowModal(false);
            setInvitationParams({ email: '', level: '' });
            fetchInvitations();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create invitation');
        } finally {
            setLoading(false);
        }
    };

    const editUser = (user: any = null) => {
        const json = JSON.parse(JSON.stringify(invitationParams));
        setParams(json);
        if (user) {
            let json1 = JSON.parse(JSON.stringify(user));
            setParams(json1);
            setIsEditMode(false);
        } else {
            setIsEditMode(true);
        }
        setAddContactModal(true);
    };

    const toggleEditMode = () => {
        setIsEditMode(!isEditMode);
    };

    const deleteUser = async (user: any = null) => {
        try {
            await axios.delete(`${API_BASE_URL}/api/invitation/${user.id}`);
            showMessage('Invitation has been deleted successfully.');
            fetchInvitations();
        } catch (error) {
            showMessage('Failed to delete invitation', 'error');
        }
    };

    const withdrawInvitation = async (user: any) => {
        try {
            await axios.post(`${API_BASE_URL}/api/invitation/${user.id}/withdraw`);
            showMessage('Invitation has been withdrawn successfully.');
            setAddContactModal(false);
            fetchInvitations();
        } catch (error) {
            showMessage('Failed to withdraw invitation', 'error');
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

    const createInvitation = async (params: InvitationParams) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/invitation`, {
                email: params.email,
                level: params.level || undefined,
                status: 'pending'
            });
            return response.data;
        } catch (error) {
            throw new Error('Failed to create invitation');
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl">Invitation Management</h2>
                <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                    <div className="flex gap-3">
                        {isAdmin() && (
                            <div>
                                <button type="button" className="btn btn-primary" onClick={() => editUser()}>
                                    <IconUserPlus className="ltr:mr-2 rtl:ml-2" />
                                    Invite User
                                </button>
                            </div>
                        )}
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
                        <input type="text" placeholder="Search Invited Users" className="form-input py-2 ltr:pr-11 rtl:pl-11 peer" value={search} onChange={(e) => setSearch(e.target.value)} />
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
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Status</th>
                                    <th>Sent Date</th>
                                    <th>Created At</th>
                                    <th>Updated At</th>
                                    {isAdmin() && <th className="!text-center">Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.map((contact: any) => {
                                    return (
                                        <tr key={contact.id}>
                                            <td>
                                                <div className="flex items-center w-max">
                                                    {contact.path && (
                                                        <div className="w-max">
                                                            <img src={`/assets/images/${contact.path}`} className="h-8 w-8 rounded-full object-cover ltr:mr-2 rtl:ml-2" alt="avatar" />
                                                        </div>
                                                    )}
                                                    {!contact.path && contact.name && (
                                                        <div className="grid place-content-center h-8 w-8 ltr:mr-2 rtl:ml-2 rounded-full bg-primary text-white text-sm font-semibold"></div>
                                                    )}
                                                    {!contact.path && !contact.name && (
                                                        <div className="border border-gray-300 dark:border-gray-800 rounded-full p-2 ltr:mr-2 rtl:ml-2">
                                                            <IconUser className="w-4.5 h-4.5" />
                                                        </div>
                                                    )}
                                                    <div>{contact.name}</div>
                                                </div>
                                            </td>
                                            <td>{contact.email}</td>
                                            <td>
                                                <span className={`badge ${contact.status === 'accepted' ? 'badge-outline-success' : 'badge-outline-warning'}`}>
                                                    {contact.status}
                                                </span>
                                            </td>
                                            <td>{contact.sentDate}</td>
                                            <td>{contact.created_at}</td>
                                            <td>{contact.updated_at}</td>
                                            {isAdmin() && (
                                                <td>
                                                    <div className="flex gap-4 items-center justify-center">
                                                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => editUser(contact)}>
                                                            View
                                                        </button>
                                                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => deleteUser(contact)}>
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
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
                    {filteredItems.map((contact: any) => {
                        return (
                            <div className="bg-white dark:bg-[#1c232f] rounded-md overflow-hidden text-center shadow relative" key={contact.id}>
                                <div className="bg-white dark:bg-[#1c232f] rounded-md overflow-hidden text-center shadow relative">
                                    <div
                                        className="bg-white/40 rounded-t-md bg-center bg-cover p-6 pb-0 bg-"
                                        style={{
                                            backgroundImage: `url('/assets/images/notification-bg.png')`,
                                            backgroundRepeat: 'no-repeat',
                                            width: '100%',
                                            height: '100%',
                                        }}
                                    >
                                        <img className="object-contain w-4/5 max-h-40 mx-auto" src={`/assets/images/${contact.path}`} alt="contact_image" />
                                    </div>
                                    <div className="px-6 pb-24 -mt-10 relative">
                                        <div className="shadow-md bg-white dark:bg-gray-900 rounded-md px-2 py-4">
                                            <div className="text-xl">{contact.name}</div>
                                            <div className="text-white-dark">{contact.role}</div>
                                            <div className="flex items-center justify-between flex-wrap mt-6 gap-3">
                                                <div className="flex-auto">
                                                    <div className="text-info">{contact.posts}</div>
                                                    <div>Posts</div>
                                                </div>
                                                <div className="flex-auto">
                                                    <div className="text-info">{contact.following}</div>
                                                    <div>Following</div>
                                                </div>
                                                <div className="flex-auto">
                                                    <div className="text-info">{contact.followers}</div>
                                                    <div>Followers</div>
                                                </div>
                                            </div>
                                            <div className="mt-4">
                                                <ul className="flex space-x-4 rtl:space-x-reverse items-center justify-center">
                                                    <li>
                                                        <button type="button" className="btn btn-outline-primary p-0 h-7 w-7 rounded-full">
                                                            <IconFacebook />
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button type="button" className="btn btn-outline-primary p-0 h-7 w-7 rounded-full">
                                                            <IconInstagram />
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button type="button" className="btn btn-outline-primary p-0 h-7 w-7 rounded-full">
                                                            <IconLinkedin />
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button type="button" className="btn btn-outline-primary p-0 h-7 w-7 rounded-full">
                                                            <IconTwitter />
                                                        </button>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                        <div className="mt-6 grid grid-cols-1 gap-4 ltr:text-left rtl:text-right">
                                            <div className="flex items-center">
                                                <div className="flex-none ltr:mr-2 rtl:ml-2">Email :</div>
                                                <div className="truncate text-white-dark">{contact.email}</div>
                                            </div>
                                            <div className="flex items-center">
                                                <div className="flex-none ltr:mr-2 rtl:ml-2">Phone :</div>
                                                <div className="text-white-dark">{contact.phone}</div>
                                            </div>
                                            <div className="flex items-center">
                                                <div className="flex-none ltr:mr-2 rtl:ml-2">Address :</div>
                                                <div className="text-white-dark">{contact.location}</div>
                                            </div>
                                        </div>
                                    </div>
                                    {isAdmin() && (
                                        <div className="mt-6 flex gap-4 absolute bottom-0 w-full ltr:left-0 rtl:right-0 p-6">
                                            <button type="button" className="btn btn-outline-primary w-1/2" onClick={() => editUser(contact)}>
                                                Edit
                                            </button>
                                            <button type="button" className="btn btn-outline-danger w-1/2" onClick={() => deleteUser(contact)}>
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <Transition appear show={addContactModal} as={Fragment}>
                <Dialog as="div" open={addContactModal} onClose={() => setAddContactModal(false)} className="relative z-[51]">
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-[black]/60" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center px-4 py-8">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg text-black dark:text-white-dark">
                                    <button
                                        type="button"
                                        onClick={() => setAddContactModal(false)}
                                        className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                                    >
                                        <IconX />
                                    </button>
                                    <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                                        {params.id ? 'Invitation Details' : 'Invite User'}
                                    </div>
                                    <div className="p-5">
                                        {params.id ? (
                                            <div className="space-y-4">
                                                <div className="flex items-center border-b pb-3">
                                                    <div className="w-1/3 font-semibold text-gray-500">Email:</div>
                                                    <div className="w-2/3 text-gray-800">{params.email}</div>
                                                </div>
                                                <div className="flex items-center border-b pb-3">
                                                    <div className="w-1/3 font-semibold text-gray-500">Level:</div>
                                                    <div className="w-2/3">
                                                        <span className="badge badge-outline-info">
                                                            {params.level}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center border-b pb-3">
                                                    <div className="w-1/3 font-semibold text-gray-500">Status:</div>
                                                    <div className="w-2/3">
                                                        <span className={`badge ${params.status === 'accepted' ? 'badge-outline-success' : 'badge-outline-warning'}`}>
                                                            {params.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center border-b pb-3">
                                                    <div className="w-1/3 font-semibold text-gray-500">Sent Date:</div>
                                                    <div className="w-2/3 text-gray-800">{new Date(params.created_at).toLocaleString()}</div>
                                                </div>
                                                <div className="flex items-center border-b pb-3">
                                                    <div className="w-1/3 font-semibold text-gray-500">Last Updated:</div>
                                                    <div className="w-2/3 text-gray-800">{new Date(params.updated_at).toLocaleString()}</div>
                                                </div>
                                                <div className="flex justify-end items-center mt-8">
                                                    <button type="button" className="btn btn-outline-danger" onClick={() => setAddContactModal(false)}>
                                                        Close
                                                    </button>
                                                    {params.status === 'pending' && (
                                                        <>
                                                            <button type="button" className="btn btn-warning ltr:ml-4 rtl:mr-4" onClick={() => withdrawInvitation(params)}>
                                                                Withdraw Invitation
                                                            </button>
                                                            <button type="button" className="btn btn-danger ltr:ml-4 rtl:mr-4" onClick={() => deleteUser(params)}>
                                                                Delete Invitation
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                        <form>
                                            <div className="mb-5">
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
                                                <div className="mb-4">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Level (Optional)</label>
                                                <select 
                                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                                                    value={params.level} 
                                                    onChange={(e) => changeValue(e)}
                                                        id="level"
                                                >
                                                        <option value="">Not Selected</option>
                                                    <option value="admin">Admin</option>
                                                    <option value="staff">Staff</option>
                                                    <option value="client">Client</option>
                                                </select>
                                            </div>
                                            <div className="flex justify-end items-center mt-8">
                                                <button type="button" className="btn btn-outline-danger" onClick={() => setAddContactModal(false)}>
                                                    Cancel
                                                </button>
                                                    <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={handleSaveUser}>
                                                    Send Invitation
                                                </button>
                                            </div>
                                        </form>
                                        )}
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default Invitation;
