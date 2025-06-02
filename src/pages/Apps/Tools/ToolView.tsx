import { useState, useEffect, Fragment } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../store/themeConfigSlice';
import IconArrowLeft from '../../../components/Icon/IconArrowLeft';
import IconEdit from '../../../components/Icon/IconEdit';
import IconTrash from '../../../components/Icon/IconTrash';
import IconSettings from '../../../components/Icon/IconSettings';
import IconInfoCircle from '../../../components/Icon/IconInfoCircle';
import { Dialog, Transition } from '@headlessui/react';
import Swal from 'sweetalert2';

interface Tool {
    id: string;
    name: string;
    description: string;
    category: string;
    executionUrl: string;
    startingPrompt: string;
    sessionMemory: boolean;
    status: 'ACTIVE' | 'INACTIVE';
    practices: any[];
    clients: any[];
    createdById: string;
    created_at: string;
    updated_at: string;
}

const labelClass = 'text-gray-500 font-semibold flex items-center gap-2';
const valueClass = 'mt-1 text-lg text-gray-900 dark:text-white-dark break-words';
const sectionClass = 'rounded-lg bg-white dark:bg-[#181f2c] shadow p-6 mb-6 border border-gray-100 dark:border-gray-800';
const dividerClass = 'col-span-full border-b border-dashed border-gray-200 my-2';

const ToolView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [tool, setTool] = useState<Tool | null>(null);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isEditing, setIsEditing] = useState(true);

    useEffect(() => {
        dispatch(setPageTitle('Tool Details'));
        fetchToolData();
        checkAdminStatus();
    }, []);

    const checkAdminStatus = () => {
        const userData = localStorage.getItem('userData');
        if (userData) {
            const { level } = JSON.parse(userData);
            setIsAdmin(level === 'admin');
        }
    };

    const fetchToolData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:3000/api/tools/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch tool');
            }
            const data = await response.json();
            setTool(data);
        } catch (error) {
            console.error('Error fetching tool:', error);
            showMessage('Error fetching tool data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (!tool) return;
        
        setTool({
            ...tool,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        });
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tool) return;

        setIsUpdating(true);
        try {
            const response = await fetch(`http://localhost:3000/api/tools/${tool.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(tool),
            });

            if (!response.ok) {
                throw new Error('Failed to update tool');
            }

            showMessage('Tool updated successfully');
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating tool:', error);
            showMessage('Error updating tool', 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async () => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            padding: '2em',
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`http://localhost:3000/api/tools/${tool?.id}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    throw new Error('Failed to delete tool');
                }

                showMessage('Tool deleted successfully');
                navigate('/apps/tools');
            } catch (error) {
                console.error('Error deleting tool:', error);
                showMessage('Error deleting tool', 'error');
            }
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

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    if (!tool) {
        return <div className="flex items-center justify-center h-screen">Tool not found</div>;
    }

    return (
        <div className="max-w-4xl mx-auto mt-8">
            <div className="flex items-center justify-between mb-8">
                <button type="button" className="btn btn-outline-primary flex items-center gap-2" onClick={() => navigate('/apps/tools')}>
                    <IconArrowLeft />
                    <span>Back to List</span>
                </button>
                <div className="flex gap-3">
                    {isAdmin && (
                        <>
                            <button 
                                type="button" 
                                className="btn btn-outline-primary" 
                                onClick={() => setIsEditing(!isEditing)}
                            >
                                <IconEdit />
                                {isEditing ? 'Cancel Edit' : 'Edit'}
                            </button>
                            <button type="button" className="btn btn-outline-danger" onClick={handleDelete}>
                                <IconTrash />
                                Delete
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className={sectionClass}>
                <form onSubmit={handleUpdate}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        {/* Basic Information */}
                        <div className="col-span-2">
                            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                <IconSettings />
                                Basic Information
                            </h3>
                        </div>

                        <div>
                            <span className={labelClass}>Name</span>
                            {isEditing ? (
                                <input 
                                    name="name" 
                                    className="form-input mt-1 w-full" 
                                    value={tool.name} 
                                    onChange={handleChange} 
                                    required 
                                />
                            ) : (
                                <div className={valueClass}>{tool.name}</div>
                            )}
                        </div>

                        <div>
                            <span className={labelClass}>Category</span>
                            {isEditing ? (
                                <select 
                                    name="category" 
                                    className="form-select mt-1 w-full" 
                                    value={tool.category} 
                                    onChange={handleChange} 
                                    required 
                                >
                                    <option value="">Select Category</option>
                                    <option value="HR">HR</option>
                                    <option value="Finance">Finance</option>
                                    <option value="Operations">Operations</option>
                                </select>
                            ) : (
                                <div className={valueClass}>{tool.category}</div>
                            )}
                        </div>

                        <div className="col-span-2">
                            <span className={labelClass}>Description</span>
                            {isEditing ? (
                                <textarea 
                                    name="description" 
                                    className="form-textarea mt-1 w-full" 
                                    value={tool.description} 
                                    onChange={handleChange} 
                                    required 
                                />
                            ) : (
                                <div className={valueClass}>{tool.description}</div>
                            )}
                        </div>

                        <div>
                            <span className={labelClass}>Execution URL</span>
                            {isEditing ? (
                                <input 
                                    name="executionUrl" 
                                    type="url" 
                                    className="form-input mt-1 w-full" 
                                    value={tool.executionUrl} 
                                    onChange={handleChange} 
                                    required 
                                />
                            ) : (
                                <div className={valueClass}>
                                    <a href={tool.executionUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                        {tool.executionUrl}
                                    </a>
                                </div>
                            )}
                        </div>

                        <div>
                            <span className={labelClass}>Starting Prompt</span>
                            {isEditing ? (
                                <textarea 
                                    name="startingPrompt" 
                                    className="form-textarea mt-1 w-full" 
                                    value={tool.startingPrompt} 
                                    onChange={handleChange} 
                                />
                            ) : (
                                <div className={valueClass}>{tool.startingPrompt}</div>
                            )}
                        </div>

                        <div>
                            <span className={labelClass}>Session Memory</span>
                            {isEditing ? (
                                <label className="inline-flex mt-1">
                                    <input
                                        type="checkbox"
                                        name="sessionMemory"
                                        className="form-checkbox"
                                        checked={tool.sessionMemory}
                                        onChange={handleChange}
                                    />
                                    <span className="ml-2">Enabled</span>
                                </label>
                            ) : (
                                <div className={valueClass}>
                                    <span className={`badge ${tool.sessionMemory ? 'badge-outline-success' : 'badge-outline-danger'}`}>
                                        {tool.sessionMemory ? 'Enabled' : 'Disabled'}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div>
                            <span className={labelClass}>Status</span>
                            {isEditing ? (
                                <select 
                                    name="status" 
                                    className="form-select mt-1 w-full" 
                                    value={tool.status} 
                                    onChange={handleChange} 
                                    required 
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                </select>
                            ) : (
                                <div className={valueClass}>
                                    <span className={`badge ${tool.status === 'ACTIVE' ? 'badge-outline-success' : 'badge-outline-danger'}`}>
                                        {tool.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className={dividerClass}></div>

                        {/* Additional Information */}
                        <div className="col-span-2">
                            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                <IconInfoCircle />
                                Additional Information
                            </h3>
                        </div>

                        <div>
                            <span className={labelClass}>Created At</span>
                            <div className={valueClass}>
                                {new Date(tool.created_at).toLocaleString()}
                            </div>
                        </div>

                        <div>
                            <span className={labelClass}>Updated At</span>
                            <div className={valueClass}>
                                {new Date(tool.updated_at).toLocaleString()}
                            </div>
                        </div>
                    </div>

                    {isEditing && (
                        <div className="flex justify-end mt-8">
                            <button type="submit" className="btn btn-primary" disabled={isUpdating}>
                                {isUpdating ? 'Updating...' : 'Update'}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ToolView; 