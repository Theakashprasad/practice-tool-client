import { useState, Fragment, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconUserPlus from '../../components/Icon/IconUserPlus';
import IconListCheck from '../../components/Icon/IconListCheck';
import IconLayoutGrid from '../../components/Icon/IconLayoutGrid';
import IconSearch from '../../components/Icon/IconSearch';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../constants';

const dummyServiceType = {
    id: '1',
    name: 'Demo Service Type',
    comments: 'A sample service type',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

const ServiceTypes = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    useEffect(() => {
        dispatch(setPageTitle('Service Types Management'));
        fetchServiceTypes();
    }, []);

    const [viewMode, setViewMode] = useState('list');
    const [serviceTypes, setServiceTypes] = useState<any[]>([dummyServiceType]);
    const [filteredItems, setFilteredItems] = useState<any[]>([dummyServiceType]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        setFilteredItems(
            serviceTypes.filter((item) =>
                item.name.toLowerCase().includes(search.toLowerCase()) ||
                (item.comments || '').toLowerCase().includes(search.toLowerCase())
            )
        );
    }, [search, serviceTypes]);

    const fetchServiceTypes = async () => {
        try {
            const res = await fetch(API_ENDPOINTS.SERVICE.TYPES);
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                setServiceTypes(data);
                setFilteredItems(data);
            } else {
                setServiceTypes([dummyServiceType]);
                setFilteredItems([dummyServiceType]);
            }
        } catch (error) {
            console.error(error);
            setServiceTypes([dummyServiceType]);
            setFilteredItems([dummyServiceType]);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl">Service Types Management</h2>
                <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                    <div className="flex gap-3">
                        <div>
                            <button type="button" className="btn btn-primary" onClick={() => navigate('/apps/service-types/add')}>
                                <IconUserPlus className="ltr:mr-2 rtl:ml-2" />
                                Add Service Type
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
                        <input type="text" placeholder="Search Service Types" className="form-input py-2 ltr:pr-11 rtl:pl-11 peer" value={search} onChange={(e) => setSearch(e.target.value)} />
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
                                    <th>Comments</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={2} className="text-center py-8">No Data found.</td>
                                    </tr>
                                ) : (
                                    filteredItems.map((item) => (
                                        <tr key={item.id}>
                                            <td>
                                                <button 
                                                    type="button" 
                                                    className="text-primary hover:underline" 
                                                    onClick={() => navigate(`/apps/service-types/${item.id}`)}
                                                >
                                                    {item.name}
                                                </button>
                                            </td>
                                            <td>{item.comments}</td>
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
                                    <button 
                                        type="button" 
                                        className="text-xl text-primary hover:underline" 
                                        onClick={() => navigate(`/apps/service-types/${item.id}`)}
                                    >
                                        {item.name}
                                    </button>
                                    <div className="text-white-dark">{item.comments}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default ServiceTypes; 