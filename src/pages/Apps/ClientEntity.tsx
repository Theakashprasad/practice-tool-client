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
import { API_BASE_URL } from '../../constants';

const defaultClient = {
    id: '',
    name: '',
    structure: '',
    clientGroupId: '',
    jurisdiction: '',
    regId: '',
    yearEnd: '',
    taxIds: '', // comma separated for now
    status: '',
    serviceStartDate: '',
    serviceEndDate: '',
    staffPartnerId: '',
    staffManager1Id: '',
    staffManager2Id: '',
    staffAccountantIds: '', // comma separated for now
    staffBookkeeper1Id: '',
    staffBookkeeper2Id: '',
    staffTaxSpecialistId: '',
    staffOther1Id: '',
    staffOther2Id: '',
    staffOther3Id: '',
    staffOther4Id: '',
    staffOther5Id: '',
    staffAdmin1Id: '',
    staffAdmin2Id: '',
    industry: '',
    accountingSystem: '',
    serviceLevel: '',
    comments: '',
    createdAt: '',
    updatedAt: '',
};

const dummyClient = {
    id: '1',
    name: 'Demo Client',
    structure: 'Ind',
    clientGroupId: 'CG001',
    jurisdiction: 'USA',
    regId: 'REG123',
    yearEnd: '2024-12-31',
    taxIds: 'TIN:12345',
    status: 'Current',
    serviceStartDate: '2022-01-01',
    serviceEndDate: '',
    staffPartnerId: 'P001',
    staffManager1Id: 'M001',
    staffManager2Id: 'M002',
    staffAccountantIds: 'A001,A002',
    staffBookkeeper1Id: 'B001',
    staffBookkeeper2Id: 'B002',
    staffTaxSpecialistId: 'T001',
    staffOther1Id: 'O001',
    staffOther2Id: 'O002',
    staffOther3Id: '',
    staffOther4Id: '',
    staffOther5Id: '',
    staffAdmin1Id: 'AD001',
    staffAdmin2Id: 'AD002',
    industry: 'Tech',
    accountingSystem: 'Xero',
    serviceLevel: 'Full Service',
    comments: 'Demo client',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

const ClientEntity = () => {
    const dispatch = useDispatch();
    const [clientGroups, setClientGroups] = useState<any[]>([]);
    const [staffUsers, setStaffUsers] = useState<any[]>([]);
    const [serviceTypes, setServiceTypes] = useState<any[]>([]);
    const [selectedServiceTypes, setSelectedServiceTypes] = useState<string[]>([]);

    useEffect(() => {
        dispatch(setPageTitle('Client Management'));
        fetchClients();
        fetchClientGroups();
        fetchStaffUsers();
        fetchServiceTypes();
    }, []);

    const [addModal, setAddModal] = useState(false);
    const [viewMode, setViewMode] = useState('list');
    const [client, setClient] = useState({ ...defaultClient });
    const [clients, setClients] = useState<any[]>([dummyClient]);
    const [filteredItems, setFilteredItems] = useState<any[]>([dummyClient]);
    const [search, setSearch] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [isViewMode, setIsViewMode] = useState(false);

    const serviceLevelOptions = [
        'Self Service',
        'Full Service',
        'Tax Only',
        'Valet',
        'Coaching Only',
        'Casual',
    ];

    useEffect(() => {
        setFilteredItems(
            clients.filter((item) =>
                item.name.toLowerCase().includes(search.toLowerCase()) ||
                item.jurisdiction.toLowerCase().includes(search.toLowerCase())
            )
        );
    }, [search, clients]);

    const fetchClients = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/clients`);
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                setClients(data);
                setFilteredItems(data);
            } else {
                setClients([dummyClient]);
                setFilteredItems([dummyClient]);
            }
        } catch (error) {
            console.error(error);
            setClients([dummyClient]);
            setFilteredItems([dummyClient]);
        }
    };

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

    const fetchStaffUsers = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/users`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setStaffUsers(data.filter((user: any) => user.level === 'staff'));
            }
        } catch (error) {
            console.error('Error fetching staff users:', error);
        }
    };

    const fetchServiceTypes = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/service-types`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setServiceTypes(data);
            }
        } catch (error) {
            console.error('Error fetching service types:', error);
        }
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setClient((prev) => ({ ...prev, [name]: value }));
    };

    const handleServiceTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setSelectedServiceTypes(selectedOptions);
    };

    const saveClient = async () => {
        try {
            const clientData = {
                ...client,
                serviceTypes: selectedServiceTypes
            };

            if (isEditMode) {
                await fetch(`${API_BASE_URL}/api/clients/${client.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(clientData),
                });
                Swal.fire({ icon: 'success', title: 'Client updated!' });
            } else {
                await fetch(`${API_BASE_URL}/api/clients`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(clientData),
                });
                Swal.fire({ icon: 'success', title: 'Client created!' });
            }
            setAddModal(false);
            setClient({ ...defaultClient });
            setSelectedServiceTypes([]);
            setIsEditMode(false);
            fetchClients();
        } catch (error) {
            console.error(error);
        }
    };

    const editClient = (item: any) => {
        setClient({ ...item, staffAccountantIds: Array.isArray(item.staffAccountantIds) ? item.staffAccountantIds.join(',') : item.staffAccountantIds, taxIds: Array.isArray(item.taxIds) ? item.taxIds.map((t:any) => `${t.name}:${t.id}`).join(',') : item.taxIds });
        setIsEditMode(true);
        setIsViewMode(false);
        setAddModal(true);
    };

    const viewClient = (item: any) => {
        setClient({ ...item, staffAccountantIds: Array.isArray(item.staffAccountantIds) ? item.staffAccountantIds.join(',') : item.staffAccountantIds, taxIds: Array.isArray(item.taxIds) ? item.taxIds.map((t:any) => `${t.name}:${t.id}`).join(',') : item.taxIds });
        setIsEditMode(true);
        setIsViewMode(true);
        setAddModal(true);
    };

    const openAddModal = () => {
        setClient({ ...defaultClient });
        setIsEditMode(false);
        setAddModal(true);
    };

    const shouldShowModal = addModal && (isEditMode || Object.keys(client).length > 0);

    const deleteClient = async (id: string) => {
        try {
            await fetch(`${API_BASE_URL}/api/clients/${id}`, { method: 'DELETE' });
            Swal.fire({ icon: 'success', title: 'Client deleted!' });
            setAddModal(false);
            setClient({ ...defaultClient });
            setIsEditMode(false);
            fetchClients();
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Failed to delete client' });
            console.error(error);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl">Client Management</h2>
                <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                    <div className="flex gap-3">
                        <div>
                            <button type="button" className="btn btn-primary" onClick={openAddModal}>
                                <IconUserPlus className="ltr:mr-2 rtl:ml-2" />
                                Add Client
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
                        <input type="text" placeholder="Search Clients" className="form-input py-2 ltr:pr-11 rtl:pl-11 peer" value={search} onChange={(e) => setSearch(e.target.value)} />
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
                                    <th>Structure</th>
                                    <th>Client Group ID</th>
                                    <th>Jurisdiction</th>
                                    <th>Reg ID</th>
                                    <th>Year End</th>
                                    <th>Tax IDs</th>
                                    <th>Status</th>
                                    <th>Service Start</th>
                                    <th>Service End</th>
                                    <th>Partner</th>
                                    <th>Manager 1</th>
                                    <th>Manager 2</th>
                                    <th>Accountants</th>
                                    <th>Bookkeeper 1</th>
                                    <th>Bookkeeper 2</th>
                                    <th>Tax Specialist</th>
                                    <th>Other 1</th>
                                    <th>Other 2</th>
                                    <th>Other 3</th>
                                    <th>Other 4</th>
                                    <th>Other 5</th>
                                    <th>Admin 1</th>
                                    <th>Admin 2</th>
                                    <th>Industry</th>
                                    <th>Accounting System</th>
                                    <th>Service Level</th>
                                    <th>Comments</th>
                                    <th>Created At</th>
                                    <th>Updated At</th>
                                    <th className="!text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={31} className="text-center py-8">No Data found.</td>
                                    </tr>
                                ) : (
                                    filteredItems.map((item) => (
                                        <tr key={item.id}>
                                            <td>{item.name}</td>
                                            <td>{item.structure}</td>
                                            <td>{item.clientGroupId}</td>
                                            <td>{item.jurisdiction}</td>
                                            <td>{item.regId}</td>
                                            <td>{item.yearEnd}</td>
                                            <td>{item.taxIds}</td>
                                            <td>{item.status}</td>
                                            <td>{item.serviceStartDate}</td>
                                            <td>{item.serviceEndDate}</td>
                                            <td>{item.staffPartnerId}</td>
                                            <td>{item.staffManager1Id}</td>
                                            <td>{item.staffManager2Id}</td>
                                            <td>{item.staffAccountantIds}</td>
                                            <td>{item.staffBookkeeper1Id}</td>
                                            <td>{item.staffBookkeeper2Id}</td>
                                            <td>{item.staffTaxSpecialistId}</td>
                                            <td>{item.staffOther1Id}</td>
                                            <td>{item.staffOther2Id}</td>
                                            <td>{item.staffOther3Id}</td>
                                            <td>{item.staffOther4Id}</td>
                                            <td>{item.staffOther5Id}</td>
                                            <td>{item.staffAdmin1Id}</td>
                                            <td>{item.staffAdmin2Id}</td>
                                            <td>{item.industry}</td>
                                            <td>{item.accountingSystem}</td>
                                            <td>{item.serviceLevel}</td>
                                            <td>{item.comments}</td>
                                            <td>{item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}</td>
                                            <td>{item.updatedAt ? new Date(item.updatedAt).toLocaleString() : ''}</td>
                                            <td>
                                                <div className="flex gap-4 items-center justify-center">
                                                    <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => viewClient(item)}>
                                                        View
                                                    </button>
                                                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => editClient(item)}>
                                                        Edit
                                                    </button>
                                                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => deleteClient(item.id)}>
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
                                    <div className="text-white-dark">{item.structure}</div>
                                    <div className="mt-4 text-xs text-gray-400">Jurisdiction: {item.jurisdiction}</div>
                                    <div className="mt-1 text-xs text-gray-400">Status: {item.status}</div>
                                    <div className="mt-6 flex gap-4">
                                        <button type="button" className="btn btn-outline-primary w-1/2" onClick={() => viewClient(item)}>
                                            View
                                        </button>
                                        <button type="button" className="btn btn-outline-secondary w-1/2" onClick={() => editClient(item)}>
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
                                    <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-3xl text-black dark:text-white-dark">
                                        <button
                                            type="button"
                                            onClick={() => setAddModal(false)}
                                            className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                                        >
                                            <IconX />
                                        </button>
                                        <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                                            {isViewMode ? 'View Client' : isEditMode ? 'Edit Client' : 'Add Client'}
                                        </div>
                                        <div className="p-5">
                                            <form onSubmit={e => { e.preventDefault(); saveClient(); }}>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="mb-5">
                                                        <label htmlFor="name">Name</label>
                                                        <input id="name" name="name" type="text" placeholder="Enter Name" className="form-input" value={client.name} onChange={handleChange} required readOnly={isViewMode} />
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="structure">Structure</label>
                                                        <input id="structure" name="structure" type="text" placeholder="Enter Structure" className="form-input" value={client.structure} onChange={handleChange} required readOnly={isViewMode} />
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="clientGroupId">Client Group</label>
                                                        <select
                                                            id="clientGroupId"
                                                            name="clientGroupId"
                                                            className="form-input"
                                                            value={client.clientGroupId}
                                                            onChange={handleChange}
                                                            required
                                                            disabled={isViewMode}
                                                        >
                                                            <option value="">Select Client Group</option>
                                                            {clientGroups.map(group => (
                                                                <option key={group.id} value={group.id}>{group.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="jurisdiction">Jurisdiction</label>
                                                        <input id="jurisdiction" name="jurisdiction" type="text" placeholder="Enter Jurisdiction" className="form-input" value={client.jurisdiction} onChange={handleChange} required readOnly={isViewMode} />
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="regId">Reg ID</label>
                                                        <input id="regId" name="regId" type="text" placeholder="Enter Reg ID" className="form-input" value={client.regId} onChange={handleChange} readOnly={isViewMode} />
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="yearEnd">Year End</label>
                                                        <input id="yearEnd" name="yearEnd" type="date" className="form-input" value={client.yearEnd} onChange={handleChange} readOnly={isViewMode} />
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="taxIds">Tax IDs (comma separated name:id)</label>
                                                        <input id="taxIds" name="taxIds" type="text" className="form-input" value={client.taxIds} onChange={handleChange} readOnly={isViewMode} />
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="status">Status</label>
                                                        <input id="status" name="status" type="text" placeholder="Enter Status" className="form-input" value={client.status} onChange={handleChange} readOnly={isViewMode} />
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="serviceStartDate">Service Start Date</label>
                                                        <input id="serviceStartDate" name="serviceStartDate" type="date" className="form-input" value={client.serviceStartDate} onChange={handleChange} readOnly={isViewMode} />
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="serviceEndDate">Service End Date</label>
                                                        <input id="serviceEndDate" name="serviceEndDate" type="date" className="form-input" value={client.serviceEndDate} onChange={handleChange} readOnly={isViewMode} />
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="staffPartnerId">Staff Partner</label>
                                                        <select
                                                            id="staffPartnerId"
                                                            name="staffPartnerId"
                                                            className="form-input"
                                                            value={client.staffPartnerId}
                                                            onChange={handleChange}
                                                            disabled={isViewMode}
                                                        >
                                                            <option value="">Select Staff Partner</option>
                                                            {staffUsers.map(user => (
                                                                <option key={user.id} value={user.id}>{user.first_name} {user.last_name} ({user.email})</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="staffManager1Id">Staff Manager 1</label>
                                                        <select
                                                            id="staffManager1Id"
                                                            name="staffManager1Id"
                                                            className="form-input"
                                                            value={client.staffManager1Id}
                                                            onChange={handleChange}
                                                            disabled={isViewMode}
                                                        >
                                                            <option value="">Select Staff Manager 1</option>
                                                            {staffUsers.map(user => (
                                                                <option key={user.id} value={user.id}>{user.first_name} {user.last_name} ({user.email})</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="staffManager2Id">Staff Manager 2</label>
                                                        <select
                                                            id="staffManager2Id"
                                                            name="staffManager2Id"
                                                            className="form-input"
                                                            value={client.staffManager2Id}
                                                            onChange={handleChange}
                                                            disabled={isViewMode}
                                                        >
                                                            <option value="">Select Staff Manager 2</option>
                                                            {staffUsers.map(user => (
                                                                <option key={user.id} value={user.id}>{user.first_name} {user.last_name} ({user.email})</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="staffAccountantIds">Staff Accountants</label>
                                                        <select
                                                            id="staffAccountantIds"
                                                            name="staffAccountantIds"
                                                            className="form-input"
                                                            value={client.staffAccountantIds}
                                                            onChange={handleChange}
                                                            disabled={isViewMode}
                                                            multiple
                                                        >
                                                            <option value="">Select Staff Accountants</option>
                                                            {staffUsers.map(user => (
                                                                <option key={user.id} value={user.id}>{user.first_name} {user.last_name} ({user.email})</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="staffBookkeeper1Id">Staff Bookkeeper 1</label>
                                                        <select
                                                            id="staffBookkeeper1Id"
                                                            name="staffBookkeeper1Id"
                                                            className="form-input"
                                                            value={client.staffBookkeeper1Id}
                                                            onChange={handleChange}
                                                            disabled={isViewMode}
                                                        >
                                                            <option value="">Select Staff Bookkeeper 1</option>
                                                            {staffUsers.map(user => (
                                                                <option key={user.id} value={user.id}>{user.first_name} {user.last_name} ({user.email})</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="staffBookkeeper2Id">Staff Bookkeeper 2</label>
                                                        <select
                                                            id="staffBookkeeper2Id"
                                                            name="staffBookkeeper2Id"
                                                            className="form-input"
                                                            value={client.staffBookkeeper2Id}
                                                            onChange={handleChange}
                                                            disabled={isViewMode}
                                                        >
                                                            <option value="">Select Staff Bookkeeper 2</option>
                                                            {staffUsers.map(user => (
                                                                <option key={user.id} value={user.id}>{user.first_name} {user.last_name} ({user.email})</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="staffTaxSpecialistId">Staff Tax Specialist</label>
                                                        <select
                                                            id="staffTaxSpecialistId"
                                                            name="staffTaxSpecialistId"
                                                            className="form-input"
                                                            value={client.staffTaxSpecialistId}
                                                            onChange={handleChange}
                                                            disabled={isViewMode}
                                                        >
                                                            <option value="">Select Staff Tax Specialist</option>
                                                            {staffUsers.map(user => (
                                                                <option key={user.id} value={user.id}>{user.first_name} {user.last_name} ({user.email})</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="staffOther1Id">Staff Other 1</label>
                                                        <select
                                                            id="staffOther1Id"
                                                            name="staffOther1Id"
                                                            className="form-input"
                                                            value={client.staffOther1Id}
                                                            onChange={handleChange}
                                                            disabled={isViewMode}
                                                        >
                                                            <option value="">Select Staff Other 1</option>
                                                            {staffUsers.map(user => (
                                                                <option key={user.id} value={user.id}>{user.first_name} {user.last_name} ({user.email})</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="staffOther2Id">Staff Other 2</label>
                                                        <select
                                                            id="staffOther2Id"
                                                            name="staffOther2Id"
                                                            className="form-input"
                                                            value={client.staffOther2Id}
                                                            onChange={handleChange}
                                                            disabled={isViewMode}
                                                        >
                                                            <option value="">Select Staff Other 2</option>
                                                            {staffUsers.map(user => (
                                                                <option key={user.id} value={user.id}>{user.first_name} {user.last_name} ({user.email})</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="staffOther3Id">Staff Other 3</label>
                                                        <select
                                                            id="staffOther3Id"
                                                            name="staffOther3Id"
                                                            className="form-input"
                                                            value={client.staffOther3Id}
                                                            onChange={handleChange}
                                                            disabled={isViewMode}
                                                        >
                                                            <option value="">Select Staff Other 3</option>
                                                            {staffUsers.map(user => (
                                                                <option key={user.id} value={user.id}>{user.first_name} {user.last_name} ({user.email})</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="staffOther4Id">Staff Other 4</label>
                                                        <select
                                                            id="staffOther4Id"
                                                            name="staffOther4Id"
                                                            className="form-input"
                                                            value={client.staffOther4Id}
                                                            onChange={handleChange}
                                                            disabled={isViewMode}
                                                        >
                                                            <option value="">Select Staff Other 4</option>
                                                            {staffUsers.map(user => (
                                                                <option key={user.id} value={user.id}>{user.first_name} {user.last_name} ({user.email})</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="staffOther5Id">Staff Other 5</label>
                                                        <select
                                                            id="staffOther5Id"
                                                            name="staffOther5Id"
                                                            className="form-input"
                                                            value={client.staffOther5Id}
                                                            onChange={handleChange}
                                                            disabled={isViewMode}
                                                        >
                                                            <option value="">Select Staff Other 5</option>
                                                            {staffUsers.map(user => (
                                                                <option key={user.id} value={user.id}>{user.first_name} {user.last_name} ({user.email})</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="staffAdmin1Id">Staff Admin 1</label>
                                                        <select
                                                            id="staffAdmin1Id"
                                                            name="staffAdmin1Id"
                                                            className="form-input"
                                                            value={client.staffAdmin1Id}
                                                            onChange={handleChange}
                                                            disabled={isViewMode}
                                                        >
                                                            <option value="">Select Staff Admin 1</option>
                                                            {staffUsers.map(user => (
                                                                <option key={user.id} value={user.id}>{user.first_name} {user.last_name} ({user.email})</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="staffAdmin2Id">Staff Admin 2</label>
                                                        <select
                                                            id="staffAdmin2Id"
                                                            name="staffAdmin2Id"
                                                            className="form-input"
                                                            value={client.staffAdmin2Id}
                                                            onChange={handleChange}
                                                            disabled={isViewMode}
                                                        >
                                                            <option value="">Select Staff Admin 2</option>
                                                            {staffUsers.map(user => (
                                                                <option key={user.id} value={user.id}>{user.first_name} {user.last_name} ({user.email})</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="industry">Industry</label>
                                                        <input id="industry" name="industry" type="text" className="form-input" value={client.industry} onChange={handleChange} readOnly={isViewMode} />
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="accountingSystem">Accounting System</label>
                                                        <input id="accountingSystem" name="accountingSystem" type="text" className="form-input" value={client.accountingSystem} onChange={handleChange} readOnly={isViewMode} />
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="serviceLevel">Service Level</label>
                                                        <select
                                                            id="serviceLevel"
                                                            name="serviceLevel"
                                                            className="form-input"
                                                            value={client.serviceLevel}
                                                            onChange={handleChange}
                                                            disabled={isViewMode}
                                                        >
                                                            <option value="">Select Service Level</option>
                                                            {serviceLevelOptions.map(option => (
                                                                <option key={option} value={option}>{option}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="serviceTypes">Service Types</label>
                                                        <select
                                                            id="serviceTypes"
                                                            name="serviceTypes"
                                                            className="form-input"
                                                            multiple
                                                            value={selectedServiceTypes}
                                                            onChange={handleServiceTypeChange}
                                                            disabled={isViewMode}
                                                        >
                                                            {serviceTypes.map(serviceType => (
                                                                <option key={serviceType.id} value={serviceType.id}>
                                                                    {serviceType.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <small className="text-gray-500">Hold Ctrl/Cmd to select multiple services</small>
                                                    </div>
                                                    <div className="mb-5 md:col-span-2">
                                                        <label htmlFor="comments">Comments</label>
                                                        <textarea id="comments" name="comments" className="form-input" value={client.comments} onChange={handleChange} readOnly={isViewMode} />
                                                    </div>
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
                                                            <button type="button" className="btn btn-danger ltr:ml-4 rtl:mr-4" onClick={() => deleteClient(client.id)}>
                                                                Delete
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={() => saveClient()}>
                                                                {isEditMode ? 'Update' : 'Create'}
                                                            </button>
                                                            {isEditMode && (
                                                                <button type="button" className="btn btn-danger ltr:ml-4 rtl:mr-4" onClick={() => deleteClient(client.id)}>
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

export default ClientEntity; 