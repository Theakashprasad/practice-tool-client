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
import { API_BASE_URL, API_ENDPOINTS } from '../../constants';

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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

const Practice1 = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Practice Management 1'));
        fetchPractices();
    }, []);

    const [addPracticeModal, setAddPracticeModal] = useState(false);
    const [viewMode, setViewMode] = useState('list');
    const [practice, setPractice] = useState({ ...defaultPractice });
    const [practices, setPractices] = useState<any[]>([dummyPractice]);
    const [filteredItems, setFilteredItems] = useState<any[]>([dummyPractice]);
    const [search, setSearch] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [isViewMode, setIsViewMode] = useState(false);

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
            const res = await fetch(API_ENDPOINTS.PRACTICE.BASE);
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                setPractices(data);
                setFilteredItems(data);
            } else {
                setPractices([dummyPractice]);
                setFilteredItems([dummyPractice]);
            }
        } catch (error) {
            console.error(error);
            setPractices([dummyPractice]);
            setFilteredItems([dummyPractice]);
        }
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setPractice((prev) => ({ ...prev, [name]: value }));
    };

    const savePractice = async () => {
        try {
            if (isEditMode) {
                await fetch(API_ENDPOINTS.PRACTICE.BY_ID(practice.id), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(practice),
                });
            } else {
                await fetch(API_ENDPOINTS.PRACTICE.BASE, {
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
            console.error(error);
        }
    };

    const editPractice = (item: any) => {
        setPractice({ ...item, staffAccountantIds: Array.isArray(item.staffAccountantIds) ? item.staffAccountantIds.join(',') : item.staffAccountantIds });
        setIsEditMode(true);
        setIsViewMode(false);
        setAddPracticeModal(true);
    };

    const viewPractice = (item: any) => {
        setPractice({ ...item, staffAccountantIds: Array.isArray(item.staffAccountantIds) ? item.staffAccountantIds.join(',') : item.staffAccountantIds });
        setIsEditMode(true);
        setIsViewMode(false);
        setAddPracticeModal(true);
    };

    const openAddModal = () => {
        setPractice({ ...defaultPractice });
        setIsEditMode(false);
        setAddPracticeModal(true);
    };

    const shouldShowModal = addPracticeModal && (isEditMode || Object.keys(practice).length > 0);

    return (
        <div>
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl">Practice Management 1</h2>
                <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                    <div className="flex gap-3">
                        <div>
                            <button type="button" className="btn btn-primary" onClick={openAddModal}>
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
                </div>
            </div>
            {viewMode === 'list' && (
                <div className="mt-5 panel p-0 border-0 overflow-hidden">
                    <div className="table-responsive">
                        <table className="table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Currency</th>
                                    <th>Staff Partner ID</th>
                                    <th>Staff Manager 1 ID</th>
                                    <th>Staff Manager 2 ID</th>
                                    <th>Staff Accountant IDs</th>
                                    <th>Staff Bookkeeper 1 ID</th>
                                    <th>Staff Bookkeeper 2 ID</th>
                                    <th>Staff Tax Specialist ID</th>
                                    <th>Staff Other 1 ID</th>
                                    <th>Staff Other 2 ID</th>
                                    <th>Staff Other 3 ID</th>
                                    <th>Staff Other 4 ID</th>
                                    <th>Staff Other 5 ID</th>
                                    <th>Staff Admin 1 ID</th>
                                    <th>Staff Admin 2 ID</th>
                                    <th>Created At</th>
                                    <th>Updated At</th>
                                    <th className="!text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={19} className="text-center py-8">No Data found.</td>
                                    </tr>
                                ) : (
                                    filteredItems.map((item) => (
                                        <tr key={item.id}>
                                            <td>{item.name}</td>
                                            <td>{item.currency}</td>
                                            <td>{item.staffPartnerId}</td>
                                            <td>{item.staffManager1Id}</td>
                                            <td>{item.staffManager2Id}</td>
                                            <td>{Array.isArray(item.staffAccountantIds) ? item.staffAccountantIds.join(', ') : item.staffAccountantIds}</td>
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
                                            <td>{item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}</td>
                                            <td>{item.updatedAt ? new Date(item.updatedAt).toLocaleString() : ''}</td>
                                            <td>
                                                <div className="flex gap-4 items-center justify-center">
                                                    <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => viewPractice(item)}>
                                                        View
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
                                            {isViewMode ? 'View Practice' : isEditMode ? 'Edit Practice' : 'Add Practice'}
                                        </div>
                                        <div className="p-5">
                                            <form onSubmit={e => { e.preventDefault(); savePractice(); }}>
                                                <div className="mb-5">
                                                    <label htmlFor="name">Name</label>
                                                    <input id="name" name="name" type="text" placeholder="Enter Name" className="form-input" value={practice.name} onChange={handleChange} required readOnly={isViewMode} />
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="currency">Currency</label>
                                                    <input id="currency" name="currency" type="text" placeholder="Enter Currency" className="form-input" value={practice.currency} onChange={handleChange} required maxLength={3} readOnly={isViewMode} />
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="staffPartnerId">Staff Partner ID</label>
                                                    <input id="staffPartnerId" name="staffPartnerId" type="text" className="form-input" value={practice.staffPartnerId} onChange={handleChange} readOnly={isViewMode} />
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="staffManager1Id">Staff Manager 1 ID</label>
                                                    <input id="staffManager1Id" name="staffManager1Id" type="text" className="form-input" value={practice.staffManager1Id} onChange={handleChange} readOnly={isViewMode} />
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="staffManager2Id">Staff Manager 2 ID</label>
                                                    <input id="staffManager2Id" name="staffManager2Id" type="text" className="form-input" value={practice.staffManager2Id} onChange={handleChange} readOnly={isViewMode} />
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="staffAccountantIds">Staff Accountant IDs (comma separated)</label>
                                                    <input id="staffAccountantIds" name="staffAccountantIds" type="text" className="form-input" value={practice.staffAccountantIds} onChange={handleChange} readOnly={isViewMode} />
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="staffBookkeeper1Id">Staff Bookkeeper 1 ID</label>
                                                    <input id="staffBookkeeper1Id" name="staffBookkeeper1Id" type="text" className="form-input" value={practice.staffBookkeeper1Id} onChange={handleChange} readOnly={isViewMode} />
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="staffBookkeeper2Id">Staff Bookkeeper 2 ID</label>
                                                    <input id="staffBookkeeper2Id" name="staffBookkeeper2Id" type="text" className="form-input" value={practice.staffBookkeeper2Id} onChange={handleChange} readOnly={isViewMode} />
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="staffTaxSpecialistId">Staff Tax Specialist ID</label>
                                                    <input id="staffTaxSpecialistId" name="staffTaxSpecialistId" type="text" className="form-input" value={practice.staffTaxSpecialistId} onChange={handleChange} readOnly={isViewMode} />
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="staffOther1Id">Staff Other 1 ID</label>
                                                    <input id="staffOther1Id" name="staffOther1Id" type="text" className="form-input" value={practice.staffOther1Id} onChange={handleChange} readOnly={isViewMode} />
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="staffOther2Id">Staff Other 2 ID</label>
                                                    <input id="staffOther2Id" name="staffOther2Id" type="text" className="form-input" value={practice.staffOther2Id} onChange={handleChange} readOnly={isViewMode} />
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="staffOther3Id">Staff Other 3 ID</label>
                                                    <input id="staffOther3Id" name="staffOther3Id" type="text" className="form-input" value={practice.staffOther3Id} onChange={handleChange} readOnly={isViewMode} />
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="staffOther4Id">Staff Other 4 ID</label>
                                                    <input id="staffOther4Id" name="staffOther4Id" type="text" className="form-input" value={practice.staffOther4Id} onChange={handleChange} readOnly={isViewMode} />
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="staffOther5Id">Staff Other 5 ID</label>
                                                    <input id="staffOther5Id" name="staffOther5Id" type="text" className="form-input" value={practice.staffOther5Id} onChange={handleChange} readOnly={isViewMode} />
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="staffAdmin1Id">Staff Admin 1 ID</label>
                                                    <input id="staffAdmin1Id" name="staffAdmin1Id" type="text" className="form-input" value={practice.staffAdmin1Id} onChange={handleChange} readOnly={isViewMode} />
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="staffAdmin2Id">Staff Admin 2 ID</label>
                                                    <input id="staffAdmin2Id" name="staffAdmin2Id" type="text" className="form-input" value={practice.staffAdmin2Id} onChange={handleChange} readOnly={isViewMode} />
                                                </div>
                                                <div className="flex justify-end items-center mt-8">
                                                    <button type="button" className="btn btn-outline-danger" onClick={() => setAddPracticeModal(false)}>
                                                        Cancel
                                                    </button>
                                                    <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={() => savePractice()}>
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

export default Practice1; 