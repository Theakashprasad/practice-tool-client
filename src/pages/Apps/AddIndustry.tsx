import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { setPageTitle } from '../../store/themeConfigSlice';
import Swal from 'sweetalert2';
import { API_ENDPOINTS } from '../../constants';

const defaultIndustry = {
    id: '',
    name: '',
    description: '',
    isActive: true,
    createdAt: '',
    updatedAt: '',
};

const AddIndustry = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    useEffect(() => {
        dispatch(setPageTitle(isEditMode ? 'Edit Industry' : 'Add Industry'));
        if (isEditMode) {
            fetchIndustry();
        }
    }, []);

    const [industry, setIndustry] = useState({ ...defaultIndustry });

    const fetchIndustry = async () => {
        try {
            if (!id) return;
            const res = await fetch(API_ENDPOINTS.INDUSTRY.BY_ID(id));
            const data = await res.json();
            setIndustry(data);
        } catch (error) {
            console.error(error);
            Swal.fire({ icon: 'error', title: 'Failed to fetch industry details' });
        }
    };

    const handleChange = (e: any) => {
        const { name, value, type, checked } = e.target;
        setIndustry((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const saveIndustry = async () => {
        try {
            if (isEditMode && !id) return;
            if (isEditMode) {
                await fetch(API_ENDPOINTS.INDUSTRY.BY_ID(id), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(industry),
                });
                Swal.fire({ icon: 'success', title: 'Industry updated!' });
            } else {
                await fetch(API_ENDPOINTS.INDUSTRY.BASE, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(industry),
                });
                Swal.fire({ icon: 'success', title: 'Industry created!' });
            }
            navigate('/apps/industry');
        } catch (error) {
            console.error(error);
            Swal.fire({ icon: 'error', title: 'Failed to save industry' });
        }
    };

    const deleteIndustry = async () => {
        if (!id) return;
        const confirm = await Swal.fire({
            title: 'Are you sure?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it',
            cancelButtonText: 'No, cancel',
            padding: '2em',
        });

        if (confirm.isConfirmed) {
            try {
                await fetch(API_ENDPOINTS.INDUSTRY.BY_ID(id), { method: 'DELETE' });
                Swal.fire({ icon: 'success', title: 'Industry deleted!' });
                navigate('/apps/industry');
            } catch (error) {
                console.error(error);
                Swal.fire({ icon: 'error', title: 'Failed to delete industry' });
            }
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl">{isEditMode ? 'Edit Industry' : 'Add Industry'}</h2>
            </div>
            <div className="mt-5 panel">
                <form onSubmit={e => { e.preventDefault(); saveIndustry(); }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="mb-5 md:col-span-2">
                            <label htmlFor="name">Name</label>
                            <input id="name" name="name" type="text" placeholder="Enter Name" className="form-input" value={industry.name} onChange={handleChange} required />
                        </div>
                        <div className="mb-5 md:col-span-2">
                            <label htmlFor="description">Description</label>
                            <textarea id="description" name="description" className="form-input" value={industry.description} onChange={handleChange} />
                        </div>
                        <div className="mb-5">
                            <label htmlFor="isActive">Active</label>
                            <input id="isActive" name="isActive" type="checkbox" className="form-checkbox" checked={industry.isActive} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="flex justify-end items-center mt-8">
                        <button type="button" className="btn btn-outline-danger" onClick={() => navigate('/apps/industry')}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                            {isEditMode ? 'Update' : 'Create'}
                        </button>
                        {isEditMode && (
                            <button type="button" className="btn btn-danger ltr:ml-4 rtl:mr-4" onClick={deleteIndustry}>
                                Delete
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddIndustry; 