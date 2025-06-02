import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../store/themeConfigSlice';
import { useNavigate } from 'react-router-dom';
import IconArrowLeft from '../../../components/Icon/IconArrowLeft';
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

const AddTool = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    useEffect(() => {
        dispatch(setPageTitle('Add Tool'));
    }, []);

    const [params, setParams] = useState({
        name: '',
        description: '',
        category: '',
        executionUrl: '',
        startingPrompt: '',
        sessionMemory: false,
        status: 'ACTIVE',
        practiceIds: [] as string[],
        clientIds: [] as string[],
    });

    const changeValue = (e: any) => {
        const { value, id, type } = e.target;
        setParams({ ...params, [id]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value });
    };

    const saveTool = async () => {
        if (!params.name) {
            showMessage('Tool name is required.', 'error');
            return true;
        }
        if (!params.category) {
            showMessage('Category is required.', 'error');
            return true;
        }
        if (!params.executionUrl) {
            showMessage('Execution URL is required.', 'error');
            return true;
        }

        try {
            const response = await fetch('http://localhost:3000/api/tools', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
            });

            if (!response.ok) {
                throw new Error('Failed to save tool');
            }

            showMessage('Tool has been saved successfully.');
            navigate('/apps/tools');
        } catch (error) {
            console.error('Error saving tool:', error);
            showMessage('Error saving tool', 'error');
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

    return (
        <div>
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl">Add Tool</h2>
                <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                    <button type="button" className="btn btn-primary" onClick={() => navigate('/apps/tools')}>
                        <IconArrowLeft className="ltr:mr-2 rtl:ml-2" />
                        Back to Tools
                    </button>
                </div>
            </div>

            <div className="mt-5 panel">
                <form className="space-y-5">
                    <div className="mb-5">
                        <label htmlFor="name">Name</label>
                        <input
                            id="name"
                            type="text"
                            placeholder="Enter Tool Name"
                            className="form-input"
                            value={params.name}
                            onChange={(e) => changeValue(e)}
                        />
                    </div>
                    <div className="mb-5">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            placeholder="Enter Tool Description"
                            className="form-textarea"
                            value={params.description}
                            onChange={(e) => changeValue(e)}
                        />
                    </div>
                    <div className="mb-5">
                        <label htmlFor="category">Category</label>
                        <select id="category" className="form-select" value={params.category} onChange={(e) => changeValue(e)}>
                            <option value="">Select Category</option>
                            <option value="HR">HR</option>
                            <option value="Finance">Finance</option>
                            <option value="Operations">Operations</option>
                        </select>
                    </div>
                    <div className="mb-5">
                        <label htmlFor="executionUrl">Execution URL</label>
                        <input
                            id="executionUrl"
                            type="text"
                            placeholder="Enter Execution URL"
                            className="form-input"
                            value={params.executionUrl}
                            onChange={(e) => changeValue(e)}
                        />
                    </div>
                    <div className="mb-5">
                        <label htmlFor="startingPrompt">Starting Prompt</label>
                        <textarea
                            id="startingPrompt"
                            placeholder="Enter Starting Prompt"
                            className="form-textarea"
                            value={params.startingPrompt}
                            onChange={(e) => changeValue(e)}
                        />
                    </div>
                    <div className="mb-5">
                        <label htmlFor="sessionMemory">Session Memory</label>
                        <div className="flex items-center mt-2">
                            <input
                                id="sessionMemory"
                                type="checkbox"
                                className="form-checkbox"
                                checked={params.sessionMemory}
                                onChange={(e) => changeValue(e)}
                            />
                            <span className="ml-2">Enable Session Memory</span>
                        </div>
                    </div>
                    <div className="mb-5">
                        <label htmlFor="status">Status</label>
                        <select id="status" className="form-select" value={params.status} onChange={(e) => changeValue(e)}>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                    </div>
                    <div className="flex justify-end items-center mt-8">
                        <button type="button" className="btn btn-outline-danger" onClick={() => navigate('/apps/tools')}>
                            Cancel
                        </button>
                        <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={saveTool}>
                            Add Tool
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTool; 