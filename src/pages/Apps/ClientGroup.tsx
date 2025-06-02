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
import { API_ENDPOINTS } from '../../constants';

const defaultClientGroup = {
    id: '',
    name: '',
    practiceId: '',
    createdAt: '',
    updatedAt: '',
};

const dummyClientGroup = {
    id: '1',
    name: 'Demo Client Group',
    practiceId: 'PRACTICE001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

const ClientGroup = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Client Group Management'));
        fetchClientGroups();
    }, []);

    const [addModal, setAddModal] = useState(false);
    const [viewMode, setViewMode] = useState('list');
    const [clientGroup, setClientGroup] = useState({ ...defaultClientGroup });
    const [clientGroups, setClientGroups] = useState<any[]>([dummyClientGroup]);
    const [filteredItems, setFilteredItems] = useState<any[]>([dummyClientGroup]);
    const [search, setSearch] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [isViewMode, setIsViewMode] = useState(false);

    useEffect(() => {
        setFilteredItems(
            clientGroups.filter((item) =>
                item.name.toLowerCase().includes(search.toLowerCase()) ||
                item.practiceId.toLowerCase().includes(search.toLowerCase())
            )
        );
    }, [search, clientGroups]);

    const fetchClientGroups = async () => {
        try {
            const res = await fetch(API_ENDPOINTS.CLIENT.GROUPS);
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                setClientGroups(data);
                setFilteredItems(data);
            } else {
                setClientGroups([dummyClientGroup]);
                setFilteredItems([dummyClientGroup]);
            }
        } catch (error) {
            console.error(error);
            setClientGroups([dummyClientGroup]);
            setFilteredItems([dummyClientGroup]);
        }
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setClientGroup((prev) => ({ ...prev, [name]: value }));
    };

    const saveClientGroup = async () => {
        try {
            if (isEditMode) {
                await fetch(API_ENDPOINTS.CLIENT.GROUP_BY_ID(clientGroup.id), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(clientGroup),
                });
                Swal.fire({ icon: 'success', title: 'Client Group updated!' });
            } else {
                await fetch(API_ENDPOINTS.CLIENT.GROUPS, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: clientGroup.name }),
                });
                Swal.fire({ icon: 'success', title: 'Client Group created!' });
            }
            setAddModal(false);
            setClientGroup({ ...defaultClientGroup });
            setIsEditMode(false);
            fetchClientGroups();
        } catch (error) {
            console.error(error);
        }
    };

    const editClientGroup = (item: any) => {
        setClientGroup({ ...item });
        setIsEditMode(true);
        setIsViewMode(false);
        setAddModal(true);
    };

    const viewClientGroup = (item: any) => {
        setClientGroup({ ...item });
        setIsEditMode(true);
        setIsViewMode(true);
        setAddModal(true);
    };

    const openAddModal = () => {
        setClientGroup({ ...defaultClientGroup });
        setIsEditMode(false);
        setAddModal(true);
    };

    const deleteClientGroup = async (id: string) => {
        try {
            await fetch(API_ENDPOINTS.CLIENT.GROUP_BY_ID(id), { method: 'DELETE' });
            Swal.fire({ icon: 'success', title: 'Client Group deleted!' });
            setAddModal(false);
            setClientGroup({ ...defaultClientGroup });
            setIsEditMode(false);
            fetchClientGroups();
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Failed to delete client group' });
            console.error(error);
        }
    };

    const shouldShowModal = addModal && (isEditMode || Object.keys(clientGroup).length > 0);

    return (
        <div>
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl">Client Group Management</h2>
                <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                    <div className="flex gap-3">
                        <div>
                            <button type="button" className="btn btn-primary" onClick={openAddModal}>
                                <IconUserPlus className="ltr:mr-2 rtl:ml-2" />
                                Add Client Group
                            </button>
                        </div>
                        <div>
                            <button type="button" className={`btn btn-outline-primary p-2 ${viewMode === 'list' ? 'bg-primary text-white' : ''}`} onClick={() => setViewMode('list')}>
                                <IconListCheck />
                            </button>
                        </div>
                        <div>
                            <button type="button" className={`btn btn-outline-primary p-2 ${viewMode === 'grid' ? 'bg-primary text-white' : ''}`} onClick={() => setViewMode('grid')}>
                                <IconLayoutGrid />
                            </button>
                        </div>
                    </div>
                    <div className="relative">
                        <input type="text" placeholder="Search Client Groups" className="form-input py-2 ltr:pr-11 rtl:pl-11 peer" value={search} onChange={(e) => setSearch(e.target.value)} />
                        <button type="button" className="absolute ltr:right-[11px] rtl:left-[11px] top-1/2 -translate-y-1/2 peer-focus:text-primary">
                            <IconSearch className="mx-auto" />
                        </button>
                    </div>
                </div>
            </div>
            {viewMode === 'list' && (
                <div className="mt-5 panel p-0 border-0 overflow-hidden">
                    <div className="table-responsive">
                        <table className="table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Practice ID</th>
                                    <th>Created At</th>
                                    <th>Updated At</th>
                                    <th className="!text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-8">No Data found.</td>
                                    </tr>
                                ) : (
                                    filteredItems.map((item) => (
                                        <tr key={item.id}>
                                            <td>{item.name}</td>
                                            <td>{item.practiceId}</td>
                                            <td>{item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}</td>
                                            <td>{item.updatedAt ? new Date(item.updatedAt).toLocaleString() : ''}</td>
                                            <td>
                                                <div className="flex gap-4 items-center justify-center">
                                                    <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => viewClientGroup(item)}>
                                                        View
                                                    </button>
                                                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => editClientGroup(item)}>
                                                        Edit
                                                    </button>
                                                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => deleteClientGroup(item.id)}>
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {viewMode === 'grid' && (
                <div className="grid 2xl:grid-cols-4 xl:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6 mt-5 w-full">
                    {filteredItems.length === 0 ? (
                        <div className="col-span-full text-center py-8 w-full">No Data found.</div>
                    ) : (
                        filteredItems.map((item) => (
                            <div className="bg-white dark:bg-[#1c232f] rounded-md overflow-hidden text-center shadow relative" key={item.id}>
                                <div className="p-6">
                                    <div className="text-xl">{item.name}</div>
                                    <div className="text-white-dark">Practice ID: {item.practiceId}</div>
                                    <div className="mt-4 text-xs text-gray-400">Created: {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}</div>
                                    <div className="mt-1 text-xs text-gray-400">Updated: {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : ''}</div>
                                    <div className="mt-6 flex gap-4">
                                        <button type="button" className="btn btn-outline-primary w-1/2" onClick={() => viewClientGroup(item)}>
                                            View
                                        </button>
                                        <button type="button" className="btn btn-outline-secondary w-1/2" onClick={() => editClientGroup(item)}>
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
            {shouldShowModal && (
                <Transition appear show={addModal} as={Fragment}>
                    <Dialog as="div" open={addModal} onClose={() => setAddModal(false)} className="relative z-[51]">
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
                                            onClick={() => setAddModal(false)}
                                            className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                                        >
                                            <IconX />
                                        </button>
                                        <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                                            {isViewMode ? 'View Client Group' : isEditMode ? 'Edit Client Group' : 'Add Client Group'}
                                        </div>
                                        <div className="p-5">
                                            <form onSubmit={e => { e.preventDefault(); saveClientGroup(); }}>
                                                <div className="mb-5">
                                                    <label htmlFor="name">Name</label>
                                                    <input id="name" name="name" type="text" placeholder="Enter Name" className="form-input" value={clientGroup.name} onChange={handleChange} required readOnly={isViewMode} />
                                                </div>
                                                <div className="flex justify-end items-center mt-8">
                                                    <button type="button" className="btn btn-outline-danger" onClick={() => setAddModal(false)}>
                                                        Cancel
                                                    </button>
                                                    {isViewMode ? (
                                                        <>
                                                            <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={() => { setIsViewMode(false); setIsEditMode(true); }}>
                                                                Edit
                                                            </button>
                                                            <button type="button" className="btn btn-danger ltr:ml-4 rtl:mr-4" onClick={() => deleteClientGroup(clientGroup.id)}>
                                                                Delete
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={() => saveClientGroup()}>
                                                                {isEditMode ? 'Update' : 'Create'}
                                                            </button>
                                                            {isEditMode && (
                                                                <button type="button" className="btn btn-danger ltr:ml-4 rtl:mr-4" onClick={() => deleteClientGroup(clientGroup.id)}>
                                                                    Delete
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </form>
                                        </div>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition>
            )}
        </div>
    );
};

export default ClientGroup; 