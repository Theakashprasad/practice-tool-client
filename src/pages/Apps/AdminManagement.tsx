import { useState, Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Swal from 'sweetalert2';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconUserPlus from '../../components/Icon/IconUserPlus';
import IconListCheck from '../../components/Icon/IconListCheck';
import IconLayoutGrid from '../../components/Icon/IconLayoutGrid';
import IconSearch from '../../components/Icon/IconSearch';
import IconX from '../../components/Icon/IconX';
import { userService, User } from '../../services/userService';

const Admins = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Admin Management'));
        fetchUsers();
    }, []);

    const [addContactModal, setAddContactModal] = useState<any>(false);
    const [value, setValue] = useState<any>('list');
    const [defaultParams] = useState({
        first_name: '',
        last_name: '',
        email: '',
        level: 'admin',
        reset_required: false,
        status: 'active',
        password: '',
    });
    const [params, setParams] = useState<any>(JSON.parse(JSON.stringify(defaultParams)));
    const [search, setSearch] = useState<any>('');
    const [contactList, setContactList] = useState<User[]>([]);
    const [filteredItems, setFilteredItems] = useState<User[]>([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem('userData');
        if (userData) {
            const { level } = JSON.parse(userData);
            setIsAdmin(level === 'admin');
        }
    }, []);

    useEffect(() => {
        if (addContactModal) {
            setIsEditMode(false);
        }
    }, [addContactModal]);

    const fetchUsers = async () => {
        try {
            const users = await userService.getAllUsers();
            console.log("Fetched users:", users);
            
            // Filter for admin-level users only
            const adminUsers = users.filter(user => user.level === 'admin');
            setContactList(adminUsers);
            setFilteredItems(adminUsers);
        } catch (error) {
            console.error("Error details:", error);
            showMessage('Error fetching users', 'error');
        }
    };

    const changeValue = (e: any) => {
        const { value, id } = e.target;
        setParams({ ...params, [id]: value });
    };

    const saveUser = async () => {
        if (!params.first_name) {
            showMessage('First Name is required.', 'error');
            return true;
        }
        if (!params.email) {
            showMessage('Email is required.', 'error');
            return true;
        }
        if (!params.id && !params.password) {
            showMessage('Password is required for new users.', 'error');
            return true;
        }

        try {
            if (params.id) {
                // Only include password in update if it's provided
                const updateParams = params.password ? params : { ...params, password: undefined };
                await userService.updateUser(params.id, updateParams);
                showMessage('User has been updated successfully.');
            } else {
                await userService.createUser(params);
                showMessage('User has been saved successfully.');
            }
            setAddContactModal(false);
            fetchUsers();
        } catch (error) {
            console.error('Error saving user:', error);
            showMessage('Error saving user', 'error');
        }
    };

    const editUser = (user: User | null = null) => {
        const json = JSON.parse(JSON.stringify(defaultParams));
        setParams(json);
        if (user) {
            let json1 = JSON.parse(JSON.stringify(user));
            setParams(json1);
            setIsEditMode(false);
        } else {
            setParams(json);
            setIsEditMode(true);
        }
        setAddContactModal(true);
    };

    const toggleEditMode = () => {
        setIsEditMode(!isEditMode);
    };

    const deleteUser = async (user: User) => {
        try {
            await userService.deleteUser(user.id);
            showMessage('User has been deleted successfully.');
            fetchUsers();
        } catch (error) {
            showMessage('Error deleting user', 'error');
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
                <h2 className="text-xl">Admin Management</h2>
                <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                    <div className="flex gap-3">
                        <div>
                            <button 
                                type="button" 
                                className={`btn btn-primary ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => {
                                    if (isAdmin) {
                                        setAddContactModal(true);
                                        setParams(defaultParams);
                                    }
                                }}
                                disabled={!isAdmin}
                            >
                                <IconUserPlus className="ltr:mr-2 rtl:ml-2" />
                                Add Admin
                            </button>
                        </div>
                        <div>
                            <button
                                type="button"
                                className={`btn btn-outline-primary p-2 ${value === 'list' ? 'bg-primary text-white' : ''}`}
                                onClick={() => setValue('list')}
                            >
                                <IconListCheck />
                            </button>
                        </div>
                        <div>
                            <button
                                type="button"
                                className={`btn btn-outline-primary p-2 ${value === 'grid' ? 'bg-primary text-white' : ''}`}
                                onClick={() => setValue('grid')}
                            >
                                <IconLayoutGrid />
                            </button>
                        </div>
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search Admins..."
                            className="form-input py-2 ltr:pr-11 rtl:pl-11 peer"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
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
                                    <th>Status</th>
                                    <th>Created At</th>
                                    <th>Updated At</th>
                                    <th className="!text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.map((contact: User) => {
                                    return (
                                        <tr key={contact.id}>
                                            <td>{contact.first_name}</td>
                                            <td>{contact.last_name}</td>
                                            <td>{contact.email}</td>
                                            <td>
                                                <span className={`badge ${contact.status === 'active' ? 'badge-outline-success' : 'badge-outline-danger'}`}>
                                                    {contact.status}
                                                </span>
                                            </td>
                                            <td>{contact.created_at}</td>
                                            <td>{contact.updated_at}</td>
                                            <td>
                                                <div className="flex gap-4 items-center justify-center">
                                                    <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => editUser(contact)}>
                                                        View
                                                    </button>
                                                    <button 
                                                        type="button" 
                                                        className={`btn btn-sm btn-outline-danger ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        onClick={() => isAdmin && deleteUser(contact)}
                                                        disabled={!isAdmin}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
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
                                    <div className="text-xl">{contact.first_name} {contact.last_name}</div>
                                    <div className="text-white-dark">{contact.email}</div>
                                    <div className="mt-4">
                                        <span className={`badge ${contact.status === 'active' ? 'badge-outline-success' : 'badge-outline-danger'}`}>
                                            Status: {contact.status}
                                        </span>
                                    </div>
                                    <div className="mt-6 flex gap-4">
                                        <button type="button" className="btn btn-outline-primary w-1/2" onClick={() => editUser(contact)}>
                                            View
                                        </button>
                                        <button 
                                            type="button" 
                                            className={`btn btn-outline-danger w-1/2 ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            onClick={() => isAdmin && deleteUser(contact)}
                                            disabled={!isAdmin}
                                        >
                                            Delete
                                        </button>
                                    </div>
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
                                        {params.id ? (isEditMode ? 'Edit Admin' : 'Admin Details') : 'Add Admin'}
                                    </div>
                                    <div className="p-5">
                                        {!params.id ? (
                                            <form>
                                                <div className="mb-5">
                                                    <label htmlFor="first_name">First Name</label>
                                                    <input id="first_name" type="text" placeholder="Enter First Name" className="form-input" value={params.first_name} onChange={(e) => changeValue(e)} />
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="last_name">Last Name</label>
                                                    <input id="last_name" type="text" placeholder="Enter Last Name" className="form-input" value={params.last_name} onChange={(e) => changeValue(e)} />
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="email">Email</label>
                                                    <input id="email" type="email" placeholder="Enter Email" className="form-input" value={params.email} onChange={(e) => changeValue(e)} />
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="password">Password</label>
                                                    <input id="password" type="password" placeholder="Enter Password" className="form-input" value={params.password} onChange={(e) => changeValue(e)} />
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="status">Status</label>
                                                    <select id="status" className="form-select" value={params.status} onChange={(e) => changeValue(e)}>
                                                        <option value="active">Active</option>
                                                        <option value="inactive">Inactive</option>
                                                    </select>
                                                </div>
                                                <div className="flex justify-end items-center mt-8">
                                                    <button type="button" className="btn btn-outline-danger" onClick={() => setAddContactModal(false)}>
                                                        Cancel
                                                    </button>
                                                    <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={saveUser}>
                                                        Add
                                                    </button>
                                                </div>
                                            </form>
                                        ) : (
                                            <div>
                                                {isEditMode ? (
                                                    <form>
                                                        <div className="mb-5">
                                                            <label htmlFor="first_name">First Name</label>
                                                            <input id="first_name" type="text" placeholder="Enter First Name" className="form-input" value={params.first_name} onChange={(e) => changeValue(e)} />
                                                        </div>
                                                        <div className="mb-5">
                                                            <label htmlFor="last_name">Last Name</label>
                                                            <input id="last_name" type="text" placeholder="Enter Last Name" className="form-input" value={params.last_name} onChange={(e) => changeValue(e)} />
                                                        </div>
                                                        <div className="mb-5">
                                                            <label htmlFor="email">Email</label>
                                                            <input id="email" type="email" placeholder="Enter Email" className="form-input" value={params.email} onChange={(e) => changeValue(e)} />
                                                        </div>
                                                        <div className="mb-5">
                                                            <label htmlFor="password">Password</label>
                                                            <input id="password" type="password" placeholder="Enter Password" className="form-input" value={params.password} onChange={(e) => changeValue(e)} />
                                                        </div>
                                                        <div className="mb-5">
                                                            <label htmlFor="status">Status</label>
                                                            <select id="status" className="form-select" value={params.status} onChange={(e) => changeValue(e)}>
                                                                <option value="active">Active</option>
                                                                <option value="inactive">Inactive</option>
                                                            </select>
                                                        </div>
                                                        <div className="flex justify-end items-center mt-8">
                                                            <button type="button" className="btn btn-outline-danger" onClick={() => setAddContactModal(false)}>
                                                                Cancel
                                                            </button>
                                                            <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={saveUser}>
                                                                Update
                                                            </button>
                                                        </div>
                                                    </form>
                                                ) : (
                                                    <div className="space-y-4">
                                                        <div className="flex items-center border-b pb-3">
                                                            <div className="w-1/3 font-semibold text-gray-500">First Name:</div>
                                                            <div className="w-2/3 text-gray-800">{params.first_name}</div>
                                                        </div>
                                                        <div className="flex items-center border-b pb-3">
                                                            <div className="w-1/3 font-semibold text-gray-500">Last Name:</div>
                                                            <div className="w-2/3 text-gray-800">{params.last_name}</div>
                                                        </div>
                                                        <div className="flex items-center border-b pb-3">
                                                            <div className="w-1/3 font-semibold text-gray-500">Email:</div>
                                                            <div className="w-2/3 text-gray-800">{params.email}</div>
                                                        </div>
                                                        <div className="flex items-center border-b pb-3">
                                                            <div className="w-1/3 font-semibold text-gray-500">Status:</div>
                                                            <div className="w-2/3">
                                                                <span className={`badge ${params.status === 'active' ? 'badge-outline-success' : 'badge-outline-danger'}`}>
                                                                    {params.status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center border-b pb-3">
                                                            <div className="w-1/3 font-semibold text-gray-500">Created At:</div>
                                                            <div className="w-2/3 text-gray-800">{params.created_at}</div>
                                                        </div>
                                                        <div className="flex items-center border-b pb-3">
                                                            <div className="w-1/3 font-semibold text-gray-500">Updated At:</div>
                                                            <div className="w-2/3 text-gray-800">{params.updated_at}</div>
                                                        </div>
                                                        <div className="flex justify-end items-center mt-8">
                                                            <button type="button" className="btn btn-outline-danger" onClick={() => setAddContactModal(false)}>
                                                                Close
                                                            </button>
                                                            <button 
                                                                type="button" 
                                                                className={`btn btn-primary ltr:ml-4 rtl:mr-4 ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                onClick={() => isAdmin && toggleEditMode()}
                                                                disabled={!isAdmin}
                                                            >
                                                                Edit
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
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

export default Admins; 