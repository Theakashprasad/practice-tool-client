import { useState, Fragment, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconUserPlus from '../../components/Icon/IconUserPlus';
import IconListCheck from '../../components/Icon/IconListCheck';
import IconLayoutGrid from '../../components/Icon/IconLayoutGrid';
import IconSearch from '../../components/Icon/IconSearch';
import { API_ENDPOINTS } from '../../constants';

const dummyIndustry = {
    id: '1',
    name: 'Demo Industry',
    description: 'A sample industry',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

const Industry = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    useEffect(() => {
        dispatch(setPageTitle('Industry Management'));
        fetchIndustries();
    }, []);

    const [viewMode, setViewMode] = useState('list');
    const [industries, setIndustries] = useState<any[]>([dummyIndustry]);
    const [filteredItems, setFilteredItems] = useState<any[]>([dummyIndustry]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        setFilteredItems(
            industries
                .filter((item) =>
                    item.name.toLowerCase().includes(search.toLowerCase()) ||
                    (item.description || '').toLowerCase().includes(search.toLowerCase())
                )
                .sort((a, b) => a.name.localeCompare(b.name))
        );
    }, [search, industries]);

    const fetchIndustries = async () => {
        try {
            const res = await fetch(API_ENDPOINTS.INDUSTRY.BASE);
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                setIndustries(data);
                setFilteredItems(data);
            } else {
                setIndustries([dummyIndustry]);
                setFilteredItems([dummyIndustry]);
            }
        } catch (error) {
            console.error(error);
            setIndustries([dummyIndustry]);
            setFilteredItems([dummyIndustry]);
        }
    };

    const handleNameClick = (id: string) => {
        navigate(`/apps/industry/edit/${id}`);
    };

    return (
        <div>
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl">Industry Management</h2>
                <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                    <div className="flex gap-3">
                        <div>
                            <button type="button" className="btn btn-primary" onClick={() => navigate('/apps/industry/add')}>
                                <IconUserPlus className="ltr:mr-2 rtl:ml-2" />
                                Add Industry
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
                        <input type="text" placeholder="Search Industries" className="form-input py-2 ltr:pr-11 rtl:pl-11 peer" value={search} onChange={(e) => setSearch(e.target.value)} />
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
                                    <th>Description</th>
                                    <th>Active</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="text-center py-8">No Data found.</td>
                                    </tr>
                                ) : (
                                    filteredItems.map((item) => (
                                        <tr key={item.id}>
                                            <td>
                                                <button 
                                                    type="button" 
                                                    className="text-primary hover:underline"
                                                    onClick={() => handleNameClick(item.id)}
                                                >
                                                    {item.name}
                                                </button>
                                            </td>
                                            <td>{item.description}</td>
                                            <td>{item.isActive ? 'Yes' : 'No'}</td>
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
                                        onClick={() => handleNameClick(item.id)}
                                    >
                                        {item.name}
                                    </button>
                                    <div className="text-white-dark">{item.description}</div>
                                    <div className="mt-4 text-xs text-gray-400">Active: {item.isActive ? 'Yes' : 'No'}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default Industry; 