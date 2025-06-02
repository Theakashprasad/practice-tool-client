import { useState, useEffect, Fragment } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import Swal from 'sweetalert2';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconUserPlus from '../../components/Icon/IconUserPlus';
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

const ClientDatabase = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('entities'); // Changed default to 'entities'
    const [clientGroups, setClientGroups] = useState<any[]>([]);
    const [clientEntities, setClientEntities] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [filteredGroups, setFilteredGroups] = useState<any[]>([]);
    const [filteredEntities, setFilteredEntities] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [addModal, setAddModal] = useState(false);
    const [selectedEntity, setSelectedEntity] = useState({ ...defaultClient });
    const [isEditMode, setIsEditMode] = useState(false);
    const [associatedEntities, setAssociatedEntities] = useState<any[]>([]);
    const [staffUsers, setStaffUsers] = useState<any[]>([]);
    const [serviceTypes, setServiceTypes] = useState<any[]>([]);
    const [selectedServiceTypes, setSelectedServiceTypes] = useState<string[]>([]);

    useEffect(() => {
        dispatch(setPageTitle('Client Database'));
        // Initial fetch for active tab
        if (activeTab === 'groups') {
            fetchClientGroups();
        } else {
            fetchClientEntities();
        }
        fetchStaffUsers();
        fetchServiceTypes();
    }, []);

    useEffect(() => {
        setFilteredGroups(
            clientGroups.filter((item) =>
                item.name.toLowerCase().includes(search.toLowerCase())
            )
        );
        setFilteredEntities(
            clientEntities.filter((item) =>
                item.name.toLowerCase().includes(search.toLowerCase()) ||
                item.jurisdiction.toLowerCase().includes(search.toLowerCase())
            )
        );
    }, [search, clientGroups, clientEntities]);

    const fetchClientGroups = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/api/client-groups`);
            const data = await res.json();
            console.log("client groups",data);
            
            if (Array.isArray(data)) {
                setClientGroups(data);
                setFilteredGroups(data);
            }
        } catch (error) {
            console.error('Error fetching client groups:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchClientEntities = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/api/clients`);
            const data = await res.json(); 

            console.log("data",data);
            
            if (Array.isArray(data) && data.length > 0) {
                setClientEntities(data);
                setFilteredEntities(data);
            } else {
                setClientEntities([dummyClient]);
                setFilteredEntities([dummyClient]);
            }
        } catch (error) {
            console.error('Error fetching client entities:', error);
            setClientEntities([dummyClient]);
            setFilteredEntities([dummyClient]);
        } finally {
            setLoading(false);
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

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        if (tab === 'groups') {
            fetchClientGroups();
        } else {
            fetchClientEntities();
        }
    };

    const handleView = (item: any) => {
        if (activeTab === 'groups') {
            navigate(`/apps/client-group/${item.id}`);
        } else {
            navigate(`/apps/client-entity/${item.id}`);
        }
    };

    const handleEntityChange = (e: any) => {
        const { name, value } = e.target;
        setSelectedEntity((prev) => ({ ...prev, [name]: value }));
    };

    const handleServiceTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setSelectedServiceTypes(selectedOptions);
    };

    const saveClientEntity = async () => {
        try {
            const entityData = {
                ...selectedEntity,
                serviceTypes: selectedServiceTypes
            };

            if (isEditMode) {
                await fetch(`${API_BASE_URL}/api/clients/${selectedEntity.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(entityData),
                });
                Swal.fire({ icon: 'success', title: 'Client Entity updated!' });
            } else {
                await fetch(`${API_BASE_URL}/api/clients`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(entityData),
                });
                Swal.fire({ icon: 'success', title: 'Client Entity created!' });
            }
            setAddModal(false);
            setSelectedEntity({ ...defaultClient });
            setSelectedServiceTypes([]);
            setIsEditMode(false);
            fetchClientEntities();
        } catch (error) {
            console.error(error);
            Swal.fire({ icon: 'error', title: 'Failed to save client entity' });
        }
    };

    const handleAdd = () => {
        if (activeTab === 'groups') {
            navigate('/apps/client-database/add-group');
        } else {
            navigate('/apps/client-database/add-entity');
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Client Database</h2>
                <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                    <div className="flex gap-3">
                        <div>
                            <button type="button" className="btn btn-primary shadow-lg hover:shadow-xl transition-all duration-300" onClick={handleAdd}>
                                <IconUserPlus className="ltr:mr-2 rtl:ml-2" />
                                Add {activeTab === 'groups' ? 'Client Group' : 'Client Entity'}
                            </button>
                        </div>
                    </div>
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder={`Search ${activeTab === 'groups' ? 'Client Groups' : 'Client Entities'}`} 
                            className="form-input py-2.5 ltr:pr-11 rtl:pl-11 peer rounded-lg border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary shadow-sm transition-all duration-300" 
                            value={search} 
                            onChange={(e) => setSearch(e.target.value)} 
                        />
                        <button type="button" className="absolute ltr:right-[11px] rtl:left-[11px] top-1/2 -translate-y-1/2 peer-focus:text-primary">
                            <IconSearch className="mx-auto" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-5">
                <div className="mb-5">
                    <div className="flex border-b border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            className={`py-3 px-6 font-medium text-lg transition-all duration-300 ${activeTab === 'entities' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            onClick={() => handleTabChange('entities')}
                        >
                            Client Entities
                        </button>
                        <button
                            type="button"
                            className={`py-3 px-6 font-medium text-lg transition-all duration-300 ${activeTab === 'groups' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            onClick={() => handleTabChange('groups')}
                        >
                            Client Groups
                        </button>
                    </div>
                </div>

                <div className="panel p-0 border-0 overflow-hidden rounded-lg shadow-lg">
                    {loading ? (
                        <div className="flex items-center justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table-striped table-hover">
                                <thead>
                                    {activeTab === 'groups' ? (
                                        <tr className="bg-gray-50 dark:bg-gray-800">
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Name</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Practice Name</th>
                                        </tr>
                                    ) : (
                                        <tr className="bg-gray-50 dark:bg-gray-800">
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Name</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Structure</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Client Group</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Registration ID</th>
                                        </tr>
                                    )}
                                </thead>
                                <tbody>
                                    {activeTab === 'groups' ? (
                                        filteredGroups.length === 0 ? (
                                            <tr>
                                                <td colSpan={2} className="text-center py-8 text-gray-500 dark:text-gray-400">No Data found.</td>
                                            </tr>
                                        ) : (
                                            filteredGroups.map((item) => (
                                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                                                    <td className="px-6 py-4">
                                                        <button 
                                                            type="button" 
                                                            className="text-primary hover:text-primary-dark font-medium transition-colors duration-200" 
                                                            onClick={() => handleView(item)}
                                                        >
                                                            {item.name}
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{item.practice?.name || 'N/A'}</td>
                                                </tr>
                                            ))
                                        )
                                    ) : (
                                        filteredEntities.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">No Data found.</td>
                                            </tr>
                                        ) : (
                                            filteredEntities.map((item) => (
                                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                                                    <td className="px-6 py-4">
                                                        <button 
                                                            type="button" 
                                                            className="text-primary hover:text-primary-dark font-medium transition-colors duration-200" 
                                                            onClick={() => handleView(item)}
                                                        >
                                                            {item.name}
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{item.structure}</td>
                                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{item.clientGroup?.name || 'N/A'}</td>
                                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{item.regId || 'N/A'}</td>
                                                </tr>
                                            ))
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {addModal && (
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
                                            {isEditMode ? 'Edit Client Entity' : 'Add Client Entity'}
                                        </div>
                                        <div className="p-5">
                                            <form onSubmit={e => { e.preventDefault(); saveClientEntity(); }}>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="mb-5">
                                                        <label htmlFor="name">Name</label>
                                                        <input id="name" name="name" type="text" placeholder="Enter Name" className="form-input" value={selectedEntity.name} onChange={handleEntityChange} required />
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="structure">Structure</label>
                                                        <input id="structure" name="structure" type="text" placeholder="Enter Structure" className="form-input" value={selectedEntity.structure} onChange={handleEntityChange} required />
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="clientGroupId">Client Group</label>
                                                        <select
                                                            id="clientGroupId"
                                                            name="clientGroupId"
                                                            className="form-input"
                                                            value={selectedEntity.clientGroupId}
                                                            onChange={handleEntityChange}
                                                            required
                                                        >
                                                            <option value="">Select Client Group</option>
                                                            {clientGroups.map(group => (
                                                                <option key={group.id} value={group.id}>{group.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="regId">Reg ID</label>
                                                        <input id="regId" name="regId" type="text" placeholder="Enter Reg ID" className="form-input" value={selectedEntity.regId} onChange={handleEntityChange} />
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="yearEnd">Year End</label>
                                                        <input id="yearEnd" name="yearEnd" type="date" className="form-input" value={selectedEntity.yearEnd} onChange={handleEntityChange} />
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="taxIds">Tax IDs</label>
                                                        <input id="taxIds" name="taxIds" type="text" placeholder="Enter Tax IDs (comma separated)" className="form-input" value={selectedEntity.taxIds} onChange={handleEntityChange} />
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="status">Status</label>
                                                        <input id="status" name="status" type="text" placeholder="Enter Status" className="form-input" value={selectedEntity.status} onChange={handleEntityChange} />
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="serviceStartDate">Service Start Date</label>
                                                        <input id="serviceStartDate" name="serviceStartDate" type="date" className="form-input" value={selectedEntity.serviceStartDate} onChange={handleEntityChange} />
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="serviceEndDate">Service End Date</label>
                                                        <input id="serviceEndDate" name="serviceEndDate" type="date" className="form-input" value={selectedEntity.serviceEndDate} onChange={handleEntityChange} />
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="staffPartnerId">Staff Partner</label>
                                                        <select
                                                            id="staffPartnerId"
                                                            name="staffPartnerId"
                                                            className="form-input"
                                                            value={selectedEntity.staffPartnerId}
                                                            onChange={handleEntityChange}
                                                        >
                                                            <option value="">Select Staff Partner</option>
                                                            {staffUsers.map(user => (
                                                                <option key={user.id} value={user.id}>{user.first_name} {user.last_name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="staffManager1Id">Staff Manager 1</label>
                                                        <select
                                                            id="staffManager1Id"
                                                            name="staffManager1Id"
                                                            className="form-input"
                                                            value={selectedEntity.staffManager1Id}
                                                            onChange={handleEntityChange}
                                                        >
                                                            <option value="">Select Staff Manager 1</option>
                                                            {staffUsers.map(user => (
                                                                <option key={user.id} value={user.id}>{user.first_name} {user.last_name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="staffManager2Id">Staff Manager 2</label>
                                                        <select
                                                            id="staffManager2Id"
                                                            name="staffManager2Id"
                                                            className="form-input"
                                                            value={selectedEntity.staffManager2Id}
                                                            onChange={handleEntityChange}
                                                        >
                                                            <option value="">Select Staff Manager 2</option>
                                                            {staffUsers.map(user => (
                                                                <option key={user.id} value={user.id}>{user.first_name} {user.last_name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="staffAccountantIds">Staff Accountants</label>
                                                        <select
                                                            id="staffAccountantIds"
                                                            name="staffAccountantIds"
                                                            className="form-input"
                                                            value={selectedEntity.staffAccountantIds}
                                                            onChange={handleEntityChange}
                                                            multiple
                                                        >
                                                            {staffUsers.map(user => (
                                                                <option key={user.id} value={user.id}>{user.first_name} {user.last_name}</option>
                                                            ))}
                                                        </select>
                                                        <small className="text-gray-500">Hold Ctrl/Cmd to select multiple accountants</small>
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="staffBookkeeper1Id">Staff Bookkeeper 1</label>
                                                        <select
                                                            id="staffBookkeeper1Id"
                                                            name="staffBookkeeper1Id"
                                                            className="form-input"
                                                            value={selectedEntity.staffBookkeeper1Id}
                                                            onChange={handleEntityChange}
                                                        >
                                                            <option value="">Select Staff Bookkeeper 1</option>
                                                            {staffUsers.map(user => (
                                                                <option key={user.id} value={user.id}>{user.first_name} {user.last_name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="staffBookkeeper2Id">Staff Bookkeeper 2</label>
                                                        <select
                                                            id="staffBookkeeper2Id"
                                                            name="staffBookkeeper2Id"
                                                            className="form-input"
                                                            value={selectedEntity.staffBookkeeper2Id}
                                                            onChange={handleEntityChange}
                                                        >
                                                            <option value="">Select Staff Bookkeeper 2</option>
                                                            {staffUsers.map(user => (
                                                                <option key={user.id} value={user.id}>{user.first_name} {user.last_name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="staffTaxSpecialistId">Staff Tax Specialist</label>
                                                        <select
                                                            id="staffTaxSpecialistId"
                                                            name="staffTaxSpecialistId"
                                                            className="form-input"
                                                            value={selectedEntity.staffTaxSpecialistId}
                                                            onChange={handleEntityChange}
                                                        >
                                                            <option value="">Select Staff Tax Specialist</option>
                                                            {staffUsers.map(user => (
                                                                <option key={user.id} value={user.id}>{user.first_name} {user.last_name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="staffOther1Id">Staff Other 1</label>
                                                        <select
                                                            id="staffOther1Id"
                                                            name="staffOther1Id"
                                                            className="form-input"
                                                            value={selectedEntity.staffOther1Id}
                                                            onChange={handleEntityChange}
                                                        >
                                                            <option value="">Select Staff Other 1</option>
                                                            {staffUsers.map(user => (
                                                                <option key={user.id} value={user.id}>{user.first_name} {user.last_name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="staffOther2Id">Staff Other 2</label>
                                                        <select
                                                            id="staffOther2Id"
                                                            name="staffOther2Id"
                                                            className="form-input"
                                                            value={selectedEntity.staffOther2Id}
                                                            onChange={handleEntityChange}
                                                        >
                                                            <option value="">Select Staff Other 2</option>
                                                            {staffUsers.map(user => (
                                                                <option key={user.id} value={user.id}>{user.first_name} {user.last_name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="staffOther3Id">Staff Other 3</label>
                                                        <select
                                                            id="staffOther3Id"
                                                            name="staffOther3Id"
                                                            className="form-input"
                                                            value={selectedEntity.staffOther3Id}
                                                            onChange={handleEntityChange}
                                                        >
                                                            <option value="">Select Staff Other 3</option>
                                                            {staffUsers.map(user => (
                                                                <option key={user.id} value={user.id}>{user.first_name} {user.last_name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="staffOther4Id">Staff Other 4</label>
                                                        <select
                                                            id="staffOther4Id"
                                                            name="staffOther4Id"
                                                            className="form-input"
                                                            value={selectedEntity.staffOther4Id}
                                                            onChange={handleEntityChange}
                                                        >
                                                            <option value="">Select Staff Other 4</option>
                                                            {staffUsers.map(user => (
                                                                <option key={user.id} value={user.id}>{user.first_name} {user.last_name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="staffOther5Id">Staff Other 5</label>
                                                        <select
                                                            id="staffOther5Id"
                                                            name="staffOther5Id"
                                                            className="form-input"
                                                            value={selectedEntity.staffOther5Id}
                                                            onChange={handleEntityChange}
                                                        >
                                                            <option value="">Select Staff Other 5</option>
                                                            {staffUsers.map(user => (
                                                                <option key={user.id} value={user.id}>{user.first_name} {user.last_name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="staffAdmin1Id">Staff Admin 1</label>
                                                        <select
                                                            id="staffAdmin1Id"
                                                            name="staffAdmin1Id"
                                                            className="form-input"
                                                            value={selectedEntity.staffAdmin1Id}
                                                            onChange={handleEntityChange}
                                                        >
                                                            <option value="">Select Staff Admin 1</option>
                                                            {staffUsers.map(user => (
                                                                <option key={user.id} value={user.id}>{user.first_name} {user.last_name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="staffAdmin2Id">Staff Admin 2</label>
                                                        <select
                                                            id="staffAdmin2Id"
                                                            name="staffAdmin2Id"
                                                            className="form-input"
                                                            value={selectedEntity.staffAdmin2Id}
                                                            onChange={handleEntityChange}
                                                        >
                                                            <option value="">Select Staff Admin 2</option>
                                                            {staffUsers.map(user => (
                                                                <option key={user.id} value={user.id}>{user.first_name} {user.last_name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="industry">Industry</label>
                                                        <input id="industry" name="industry" type="text" placeholder="Enter Industry" className="form-input" value={selectedEntity.industry} onChange={handleEntityChange} />
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="accountingSystem">Accounting System</label>
                                                        <input id="accountingSystem" name="accountingSystem" type="text" placeholder="Enter Accounting System" className="form-input" value={selectedEntity.accountingSystem} onChange={handleEntityChange} />
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="serviceLevel">Service Level</label>
                                                        <select
                                                            id="serviceLevel"
                                                            name="serviceLevel"
                                                            className="form-input"
                                                            value={selectedEntity.serviceLevel}
                                                            onChange={handleEntityChange}
                                                        >
                                                            <option value="">Select Service Level</option>
                                                            {['Self Service', 'Full Service', 'Tax Only', 'Valet', 'Coaching Only', 'Casual'].map(option => (
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
                                                        <textarea id="comments" name="comments" className="form-input" value={selectedEntity.comments} onChange={handleEntityChange} />
                                                    </div>
                                                </div>
                                                <div className="flex justify-end items-center mt-8">
                                                    <button type="button" className="btn btn-outline-danger" onClick={() => setAddModal(false)}>
                                                        Cancel
                                                    </button>
                                                    <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                                                        {isEditMode ? 'Update' : 'Create'}
                                                    </button>
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

export default ClientDatabase; 