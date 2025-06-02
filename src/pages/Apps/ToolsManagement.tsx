import { useState, Fragment, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconPlus from '../../components/Icon/IconPlus';
import IconListCheck from '../../components/Icon/IconListCheck';
import IconLayoutGrid from '../../components/Icon/IconLayoutGrid';
import IconSearch from '../../components/Icon/IconSearch';
import IconEdit from '../../components/Icon/IconEdit';
import IconTrash from '../../components/Icon/IconTrash';
import Swal from 'sweetalert2';
import axios from 'axios';

interface Practice {
    id: string;
    name: string;
}

interface Client {
    id: string;
    name: string;
}

interface Tool {
    id: string;
    name: string;
    category: string;
    executionUrl: string;
    startingPrompt: string;
    sessionMemory: boolean;
    status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
    practices: Practice[];
    clients: Client[];
    createdById: string;
    createdAt: string;
    updatedAt: string;
}

const ToolsManagement = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    useEffect(() => {
        dispatch(setPageTitle('Tools Management'));
        fetchTools();
    }, []);

    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [search, setSearch] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [tools, setTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTools = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:3000/api/tools');
            setTools(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch tools');
            console.error('Error fetching tools:', err);
        } finally {
            setLoading(false);
        }
    };

    const deleteTool = async (tool: Tool) => {
        try {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
                padding: '2em',
            });

            if (result.value) {
                await axios.delete(`http://localhost:3000/api/tools/${tool.id}`);
                await fetchTools();
                showMessage('Tool has been deleted successfully.');
            }
        } catch (err) {
            showMessage('Failed to delete tool', 'error');
            console.error('Error deleting tool:', err);
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

    const handleAddTool = () => {
        navigate('/apps/tools-management/add');
    };

    const handleViewTool = (toolId: string) => {
        navigate(`/apps/tools-management/${toolId}`);
    };

    const handleEditTool = (toolId: string) => {
        navigate(`/apps/tools-management/${toolId}`);
    };

    const filteredTools = tools.filter(tool => 
        tool.name.toLowerCase().includes(search.toLowerCase()) ||
        tool.category.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    if (error) {
        return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;
    }

    return (
        <div>
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl">Tools Management</h2>
                <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                    <div className="flex gap-3">
                        <div>
                            <button 
                                type="button" 
                                className="btn btn-primary"
                                onClick={handleAddTool}
                            >
                                <IconPlus className="ltr:mr-2 rtl:ml-2" />
                                Add Tool
                            </button>
                        </div>
                        <div>
                            <button
                                type="button"
                                className={`btn btn-outline-primary p-2 ${viewMode === 'list' ? 'bg-primary text-white' : ''}`}
                                onClick={() => setViewMode('list')}
                            >
                                <IconListCheck />
                            </button>
                        </div>
                        <div>
                            <button
                                type="button"
                                className={`btn btn-outline-primary p-2 ${viewMode === 'grid' ? 'bg-primary text-white' : ''}`}
                                onClick={() => setViewMode('grid')}
                            >
                                <IconLayoutGrid />
                            </button>
                        </div>
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search Tools..."
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

            {viewMode === 'list' && (
                <div className="mt-5 panel p-0 border-0 overflow-hidden">
                    <div className="table-responsive">
                        <table className="table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Category</th>
                                    <th>Execution URL</th>
                                    <th>Assigned To</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTools.map((tool) => (
                                    <tr key={tool.id}>
                                        <td>
                                            <button 
                                                type="button" 
                                                className="text-primary hover:underline"
                                                onClick={() => handleViewTool(tool.id)}
                                            >
                                                {tool.name}
                                            </button>
                                        </td>
                                        <td>{tool.category}</td>
                                        <td>{tool.executionUrl}</td>
                                        <td>
                                            {tool.practices.length > 0 && (
                                                <div>Practices: {tool.practices.map(p => p.name).join(', ')}</div>
                                            )}
                                            {tool.clients.length > 0 && (
                                                <div>Clients: {tool.clients.map(c => c.name).join(', ')}</div>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`badge ${
                                                tool.status === 'ACTIVE' ? 'badge-outline-success' : 
                                                tool.status === 'MAINTENANCE' ? 'badge-outline-warning' : 
                                                'badge-outline-danger'
                                            }`}>
                                                {tool.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {viewMode === 'grid' && (
                <div className="grid 2xl:grid-cols-4 xl:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6 mt-5 w-full">
                    {filteredTools.map((tool) => (
                        <div className="bg-white dark:bg-[#1c232f] rounded-md overflow-hidden text-center shadow relative" key={tool.id}>
                            <div className="p-6">
                                <div className="text-xl">{tool.name}</div>
                                <div className="text-white-dark">{tool.category}</div>
                                <div className="mt-4 text-sm">{tool.executionUrl}</div>
                                <div className="mt-4">
                                    <span className={`badge ${
                                        tool.status === 'ACTIVE' ? 'badge-outline-success' : 
                                        tool.status === 'MAINTENANCE' ? 'badge-outline-warning' : 
                                        'badge-outline-danger'
                                    }`}>
                                        {tool.status}
                                    </span>
                                </div>
                                <div className="mt-4 text-sm">
                                    {tool.practices.length > 0 && (
                                        <div>Practices: {tool.practices.map(p => p.name).join(', ')}</div>
                                    )}
                                    {tool.clients.length > 0 && (
                                        <div>Clients: {tool.clients.map(c => c.name).join(', ')}</div>
                                    )}
                                </div>
                                <div className="mt-6 flex gap-4">
                                    <button type="button" className="btn btn-outline-primary w-1/2" onClick={() => handleViewTool(tool.id)}>
                                        View
                                    </button>
                                    <button type="button" className="btn btn-outline-primary w-1/2" onClick={() => handleEditTool(tool.id)}>
                                        <IconEdit className="w-4 h-4 mr-2" />
                                        Edit
                                    </button>
                                    {isAdmin && (
                                        <button 
                                            type="button" 
                                            className="btn btn-outline-danger w-1/2"
                                            onClick={() => deleteTool(tool)}
                                        >
                                            <IconTrash className="w-4 h-4 mr-2" />
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ToolsManagement;