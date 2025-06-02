import { useState, Fragment, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setPageTitle } from '../../store/themeConfigSlice';
import Swal from 'sweetalert2';
import IconUserPlus from '../../components/Icon/IconUserPlus';
import IconListCheck from '../../components/Icon/IconListCheck';
import IconLayoutGrid from '../../components/Icon/IconLayoutGrid';
import IconSearch from '../../components/Icon/IconSearch';
import { API_BASE_URL } from '../../constants';

const dummyServiceSubscribed = {
    id: '1',
    type: { id: 't1', name: 'Bookkeeping' },
    frequency: 'Monthly',
    reportingDate: '2024-01-01',
    dueDate: '2024-01-10',
    nonBillable: false,
    packageBilled: true,
    mrr: '500',
    serviceStartDate: '2024-01-01',
    serviceEndDate: '2024-12-31',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

const ServicesSubscribed = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState('list');
    const [servicesSubscribed, setServicesSubscribed] = useState<any[]>([dummyServiceSubscribed]);
    const [filteredItems, setFilteredItems] = useState<any[]>([dummyServiceSubscribed]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        dispatch(setPageTitle('Services Subscribed Management'));
        fetchServicesSubscribed();
    }, []);

    useEffect(() => {
        setFilteredItems(
            servicesSubscribed.filter((item) =>
                (item.type?.name || '').toLowerCase().includes(search.toLowerCase()) ||
                (item.frequency || '').toLowerCase().includes(search.toLowerCase())
            )
        );
    }, [search, servicesSubscribed]);

    const fetchServicesSubscribed = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/services-subscribed`);
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                setServicesSubscribed(data);
                setFilteredItems(data);
            } else {
                setServicesSubscribed([dummyServiceSubscribed]);
                setFilteredItems([dummyServiceSubscribed]);
            }
        } catch (error) {
            console.error(error);
            setServicesSubscribed([dummyServiceSubscribed]);
            setFilteredItems([dummyServiceSubscribed]);
        }
    };

    const deleteServiceSubscribed = async (id: string) => {
        // First confirmation
        const firstConfirm = await Swal.fire({
            title: 'Are you sure?',
            text: 'You are about to delete this service subscription',
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
            confirmButtonText: 'Yes, delete service',
            cancelButtonText: 'No, cancel',
            confirmButtonColor: '#dc2626',
            padding: '2em',
        });

        if (!secondConfirm.isConfirmed) {
            return;
        }

        try {
            await fetch(`${API_BASE_URL}/api/services-subscribed/${id}`, { method: 'DELETE' });
            Swal.fire({ icon: 'success', title: 'Service Subscribed deleted!' });
            fetchServicesSubscribed();
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Failed to delete service subscribed' });
            console.error(error);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl">Services Subscribed Management</h2>
                <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                    <div className="flex gap-3">
                        <div>
                            <button type="button" className="btn btn-primary" onClick={() => navigate('/apps/services-subscribed/add')}>
                                <IconUserPlus className="ltr:mr-2 rtl:ml-2" />
                                Add Service Subscribed
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
                        <input type="text" placeholder="Search Services Subscribed" className="form-input py-2 ltr:pr-11 rtl:pl-11 peer" value={search} onChange={(e) => setSearch(e.target.value)} />
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
                                    <th>Type</th>
                                    <th>Frequency</th>
                                    <th>MRR</th>
                                    <th>Service Start</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-8">No Data found.</td>
                                    </tr>
                                ) : (
                                    filteredItems.map((item) => (
                                        <tr key={item.id} className="cursor-pointer hover:bg-gray-50" onClick={() => navigate(`/apps/services-subscribed/edit/${item.id}`)}>
                                            <td className="text-primary">{item.type?.name}</td>
                                            <td>{item.frequency}</td>
                                            <td>{item.mrr}</td>
                                            <td>{item.serviceStartDate}</td>
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
                            <div 
                                key={item.id} 
                                className="bg-white dark:bg-[#1c232f] rounded-md overflow-hidden text-center shadow relative cursor-pointer hover:shadow-lg transition-shadow"
                                onClick={() => navigate(`/apps/services-subscribed/edit/${item.id}`)}
                            >
                                <div className="p-6">
                                    <div className="text-xl text-primary">{item.type?.name}</div>
                                    <div className="text-white-dark">{item.frequency}</div>
                                    <div className="mt-4">
                                        <div className="text-sm">MRR: {item.mrr}</div>
                                        <div className="text-sm">Start Date: {item.serviceStartDate}</div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default ServicesSubscribed; 