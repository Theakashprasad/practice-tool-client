import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import Swal from 'sweetalert2';
import IconX from '../../components/Icon/IconX';
import { API_BASE_URL } from '../../constants';

const defaultClientGroup = {
    id: '',
    name: '',
    practiceId: '',
    createdAt: '',
    updatedAt: '',
};

const AddClientGroup = () => {
    const navigate = useNavigate();
    const [selectedGroup, setSelectedGroup] = useState({ ...defaultClientGroup });
    const [isEditMode, setIsEditMode] = useState(false);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setSelectedGroup((prev) => ({ ...prev, [name]: value }));
    };

    const saveClientGroup = async () => {
        try {
            if (isEditMode) {
                await fetch(`${API_BASE_URL}/api/client-groups/${selectedGroup.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(selectedGroup),
                });
                Swal.fire({ icon: 'success', title: 'Client Group updated!' });
            } else {
                await fetch(`${API_BASE_URL}/api/client-groups`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: selectedGroup.name }),
                });
                Swal.fire({ icon: 'success', title: 'Client Group created!' });
            }
            navigate('/apps/client-database');
        } catch (error) {
            console.error(error);
            Swal.fire({ icon: 'error', title: 'Failed to save client group' });
        }
    };

    return (
        <div className="panel">
            <div className="flex items-center justify-between mb-5">
                <h5 className="font-semibold text-lg dark:text-white-light">
                    {isEditMode ? 'Edit Client Group' : 'Add Client Group'}
                </h5>
            </div>
            <form onSubmit={e => { e.preventDefault(); saveClientGroup(); }}>
                <div className="mb-5">
                    <label htmlFor="name">Name</label>
                    <input 
                        id="name" 
                        name="name" 
                        type="text" 
                        placeholder="Enter Name" 
                        className="form-input" 
                        value={selectedGroup.name} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                <div className="flex justify-end items-center mt-8">
                    <button 
                        type="button" 
                        className="btn btn-outline-danger" 
                        onClick={() => navigate('/apps/client-database')}
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        className="btn btn-primary ltr:ml-4 rtl:mr-4"
                    >
                        {isEditMode ? 'Update' : 'Create'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddClientGroup; 