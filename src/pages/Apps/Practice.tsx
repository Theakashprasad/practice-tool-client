import { useState, Fragment, useEffect } from 'react';
import { Dialog, Transition, Menu } from '@headlessui/react';
import Swal from 'sweetalert2';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconUserPlus from '../../components/Icon/IconUserPlus';
import IconListCheck from '../../components/Icon/IconListCheck';
import IconLayoutGrid from '../../components/Icon/IconLayoutGrid';
import IconSearch from '../../components/Icon/IconSearch';
import IconX from '../../components/Icon/IconX';
import { API_BASE_URL } from '../../constants';
import { fetchStaffUsers, StaffUser } from '../../services/staffService';
import { useNavigate } from 'react-router-dom';

const defaultPractice = {
    id: '',
    name: '',
    currency: '',
    staffPartnerId: '',
    staffManager1Id: '',
    staffManager2Id: '',
    staffAccountantIds: '',
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
    clientGroupIds: [] as string[],
    createdAt: '',
    updatedAt: '',
};

const dummyPractice = {
    id: '1',
    name: 'Demo Practice',
    currency: 'USD',
    staffPartnerId: 'P001',
    staffManager1Id: 'M001',
    staffManager2Id: 'M002',
    staffAccountantIds: 'A001,A002',
    staffBookkeeper1Id: 'B001',
    staffBookkeeper2Id: 'B002',
    staffTaxSpecialistId: 'T001',
    staffOther1Id: 'O001',
    staffOther2Id: 'O002',
    staffOther3Id: 'O003',
    staffOther4Id: 'O004',
    staffOther5Id: 'O005',
    staffAdmin1Id: 'AD001',
    staffAdmin2Id: 'AD002',
    clientGroupIds: [] as string[],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

const Practice = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        dispatch(setPageTitle('Practice Management'));
        fetchPractices();
        fetchClientGroups();
        fetchStaffUsers()
            .then(users => {
                setStaffUsers(users || []);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error fetching staff users:', error);
                setStaffUsers([]);
                setIsLoading(false);
            });
    }, []);

    const [addPracticeModal, setAddPracticeModal] = useState(false);
    const [viewMode, setViewMode] = useState('list');
    const [practice, setPractice] = useState({ ...defaultPractice });
    const [practices, setPractices] = useState<any[]>([dummyPractice]);
    const [filteredItems, setFilteredItems] = useState<any[]>([dummyPractice]);
    const [search, setSearch] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [isViewMode, setIsViewMode] = useState(false);
    const [clientGroups, setClientGroups] = useState<any[]>([]);
    const [selectedPracticeId, setSelectedPracticeId] = useState<string | null>(null);

    useEffect(() => {
        setFilteredItems(
            practices.filter((item) =>
                item.name.toLowerCase().includes(search.toLowerCase()) ||
                item.currency.toLowerCase().includes(search.toLowerCase())
            )
        );
    }, [search, practices]);

    const fetchPractices = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/practices`);
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                setPractices(data);
                setFilteredItems(data);
            } else {
                setPractices([dummyPractice]);
                setFilteredItems([dummyPractice]);
            }
        } catch (error) {
            // Swal.fire({ icon: 'error', title: 'Failed to fetch practices' });
            console.error(error);
            setPractices([dummyPractice]);
            setFilteredItems([dummyPractice]);
        }
    };

    // console.log("filteredItems", filteredItems);
    

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

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setPractice((prev) => ({ ...prev, [name]: value }));
    };

    const handleClientGroupChange = (e: any) => {
        const { value, checked } = e.target;
        setPractice((prev) => {
            const currentGroups = prev.clientGroupIds || [];
            if (checked) {
                return { ...prev, clientGroupIds: [...currentGroups, value] };
            } else {
                return { ...prev, clientGroupIds: currentGroups.filter(id => id !== value) };
            }
        });
    };

    const handleStaffAccountantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setPractice(prev => ({
            ...prev,
            staffAccountantIds: selectedOptions.join(',')
        }));
    };

    const savePractice = async () => {
        try {
            if (isEditMode) {
                await fetch(`${API_BASE_URL}/api/practices/${practice.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(practice),
                });
            } else {
                await fetch(`${API_BASE_URL}/api/practices`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(practice),
                });
                Swal.fire({ icon: 'success', title: 'Practice created!' });
            }
            setAddPracticeModal(false);
            setPractice({ ...defaultPractice });
            setIsEditMode(false);
            fetchPractices();
        } catch (error) {
            // Swal.fire({ icon: 'error', title: 'Failed to save practice' });
            console.error(error);
        }
    };

    const editPractice = (item: any) => {
        setPractice({ ...item, staffAccountantIds: Array.isArray(item.staffAccountantIds) ? item.staffAccountantIds.join(',') : item.staffAccountantIds });
        setIsEditMode(true);
        setAddPracticeModal(true);
    };

    const viewPractice = (item: any) => {
        navigate(`/practice/${item.id}`);
    };

    const openAddModal = () => {
        setPractice({ ...defaultPractice });
        setIsEditMode(false);
        setAddPracticeModal(true);
    };

    const deletePractice = async (id: string) => {
        try {
            await fetch(`${API_BASE_URL}/api/practices/${id}`, { method: 'DELETE' });
            Swal.fire({ icon: 'success', title: 'Practice deleted!' });
            setAddPracticeModal(false);
            setPractice({ ...defaultPractice });
            setIsEditMode(false);
            fetchPractices();
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Failed to delete practice' });
            console.error(error);
        }
    };

    // Only show modal if there is data to edit/add
    const shouldShowModal = addPracticeModal && (isEditMode || Object.keys(practice).length > 0);

    const renderStaffDropdown = (fieldName: string, value: string, label: string) => (
        <div className="mb-5">
            <label htmlFor={fieldName}>{label}</label>
            <select
                id={fieldName}
                name={fieldName}
                className="form-select"
                value={value}
                onChange={handleChange}
                disabled={isLoading}
            >
                <option value="">Select {label}</option>
                {Array.isArray(staffUsers) && staffUsers.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                        {staff.first_name} {staff.last_name} ({staff.email})
                    </option>
                ))}
            </select>
        </div>
    );

    return (
        <div>
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl">Practice Management</h2>
                <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                    <div className="flex gap-3">
                        <div>
                            <button type="button" className="btn btn-primary" onClick={() => navigate('/apps/practice/add')}>
                                <IconUserPlus className="ltr:mr-2 rtl:ml-2" />
                                Add Practice
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
                        <input type="text" placeholder="Search Practices" className="form-input py-2 ltr:pr-11 rtl:pl-11 peer" value={search} onChange={(e) => setSearch(e.target.value)} />
                        <button type="button" className="absolute ltr:right-[11px] rtl:left-[11px] top-1/2 -translate-y-1/2 peer-focus:text-primary">
                            <IconSearch className="mx-auto" />
                        </button>
                    </div>
                    <Menu as="div" className="relative inline-block text-left">
                        <Menu.Button className="btn btn-outline-primary">Actions</Menu.Button>
                        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white dark:bg-[#181f2c] border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 rounded-md shadow-lg focus:outline-none z-50">
                            <div className="py-1">
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            type="button"
                                            className={`w-full text-left px-4 py-2 text-sm ${!selectedPracticeId ? 'text-gray-400 cursor-not-allowed' : active ? 'bg-red-100 text-red-700' : 'text-red-600'}`}
                                            disabled={!selectedPracticeId}
                                            onClick={async () => {
                                                if (!selectedPracticeId) return;
                                                const result = await Swal.fire({
                                                    title: 'Are you sure?',
                                                    text: 'You will not be able to recover this practice!',
                                                    icon: 'warning',
                                                    showCancelButton: true,
                                                    confirmButtonColor: '#d33',
                                                    cancelButtonColor: '#3085d6',
                                                    confirmButtonText: 'Yes, delete it!'
                                                });
                                                if (result.isConfirmed) {
                                                    deletePractice(selectedPracticeId);
                                                    setSelectedPracticeId(null);
                                                }
                                            }}
                                        >
                                            Delete Selected Practice
                                        </button>
                                    )}
                                </Menu.Item>
                            </div>
                        </Menu.Items>
                    </Menu>
                </div>
            </div>
            {viewMode === 'list' && (
                <div className="mt-5 panel p-0 border-0 overflow-hidden">
                    <div className="table-responsive">
                        <table className="table-striped table-hover">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Name</th>
                                    <th>Currency</th>
                                    <th>Client Groups</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-8">No Data found.</td>
                                    </tr>
                                ) : (
                                    filteredItems.map((item) => (
                                        <tr key={item.id} className="cursor-pointer hover:bg-gray-50">
                                            <td>
                                                <input
                                                    type="radio"
                                                    name="selectedPractice"
                                                    checked={selectedPracticeId === item.id}
                                                    onChange={() => setSelectedPracticeId(item.id)}
                                                    onClick={e => e.stopPropagation()}
                                                />
                                            </td>
                                            <td className="text-primary hover:underline" onClick={() => viewPractice(item)}>{item.name}</td>
                                            <td>{item.currency}</td>
                                            <td>
                                                {item.clientGroups && item.clientGroups.length > 0 
                                                    ? item.clientGroups.map((group: any) => group.name).join(', ')
                                                    : 'No groups'}
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
                                    <div className="text-white-dark">{item.currency}</div>
                                    <div className="mt-4 flex flex-col gap-2">
                                        <div>
                                            <span className="badge badge-outline-info">
                                                Partner: {item.staffPartnerId}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="badge badge-outline-info">
                                                Manager1: {item.staffManager1Id}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="badge badge-outline-info">
                                                Manager2: {item.staffManager2Id}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-6 flex gap-4">
                                        <button type="button" className="btn btn-outline-primary w-1/2" onClick={() => viewPractice(item)}>
                                            View
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
            {shouldShowModal && (
                <Transition appear show={addPracticeModal} as={Fragment}>
                    <Dialog as="div" open={addPracticeModal} onClose={() => setAddPracticeModal(false)} className="relative z-[51]">
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
                                            onClick={() => setAddPracticeModal(false)}
                                            className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                                        >
                                            <IconX />
                                        </button>
                                        <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                                            {isEditMode ? 'Edit Practice' : 'Add Practice'}
                                        </div>
                                        <div className="p-5">
                                            <form onSubmit={e => { e.preventDefault(); savePractice(); }}>
                                                <div className="mb-5">
                                                    <label htmlFor="name">Name</label>
                                                    <input id="name" name="name" type="text" placeholder="Enter Name" className="form-input" value={practice.name} onChange={handleChange} required />
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="currency">Currency</label>
                                                    <input id="currency" name="currency" type="text" placeholder="Enter Currency" className="form-input" value={practice.currency} onChange={handleChange} required maxLength={3} />
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
                                                        {Array.isArray(staffUsers) && staffUsers.map((staff) => (
                                                            <option key={staff.id} value={staff.id}>
                                                                {staff.first_name} {staff.last_name} ({staff.email})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="clientGroupIds">Client Groups</label>
                                                    <select id="clientGroupIds" name="clientGroupIds" multiple className="form-input" value={practice.clientGroupIds} onChange={handleClientGroupChange}>
                                                        <option value="">Select client groups</option>
                                                        {clientGroups.map((group) => (
                                                            <option key={group.id} value={group.id}>{group.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="flex justify-end items-center mt-8">
                                                    <button type="button" className="btn btn-outline-danger" onClick={() => setAddPracticeModal(false)}>
                                                        Cancel
                                                    </button>
                                                    <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={() => savePractice()}>
                                                        {isEditMode ? 'Update' : 'Create'}
                                                    </button>
                                                    {isEditMode && (
                                                        <button type="button" className="btn btn-danger ltr:ml-4 rtl:mr-4" onClick={() => deletePractice(practice.id)}>
                                                            Delete
                                                        </button>
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

export default Practice; 