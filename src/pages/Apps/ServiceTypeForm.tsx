import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import IconX from '../../components/Icon/IconX';
import { API_ENDPOINTS } from '../../constants';

const defaultServiceType = {
    id: '',
    name: '',
    comments: '',
    createdAt: '',
    updatedAt: '',
};

const ServiceTypeForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [serviceType, setServiceType] = useState({ ...defaultServiceType });
    const isEditMode = !!id;

    useEffect(() => {
        if (isEditMode) {
            fetchServiceType();
        }
    }, [id]);

    const fetchServiceType = async () => {
        try {
            if (!id) return;
            const res = await fetch(API_ENDPOINTS.SERVICE.TYPE_BY_ID(id));
            const data = await res.json();
            setServiceType(data);
        } catch (error) {
            console.error(error);
            Swal.fire({ icon: 'error', title: 'Failed to fetch service type' });
        }
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setServiceType((prev) => ({ ...prev, [name]: value }));
    };

    const saveServiceType = async () => {
        try {
            if (isEditMode) {
                await fetch(API_ENDPOINTS.SERVICE.TYPE_BY_ID(serviceType.id), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(serviceType),
                });
                Swal.fire({ icon: 'success', title: 'Service Type updated!' });
            } else {
                await fetch(API_ENDPOINTS.SERVICE.TYPES, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(serviceType),
                });
                Swal.fire({ icon: 'success', title: 'Service Type created!' });
            }
            navigate('/apps/service-types');
        } catch (error) {
            console.error(error);
            Swal.fire({ icon: 'error', title: 'Failed to save service type' });
        }
    };

    const deleteServiceType = async () => {
        if (!isEditMode || !id) return;

        // First confirmation
        const firstConfirm = await Swal.fire({
            title: 'Are you sure?',
            text: 'You are about to delete this service type',
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
            confirmButtonText: 'Yes, delete service type',
            cancelButtonText: 'No, cancel',
            confirmButtonColor: '#dc2626',
            padding: '2em',
        });

        if (!secondConfirm.isConfirmed) {
            return;
        }

        try {
            await fetch(API_ENDPOINTS.SERVICE.TYPE_BY_ID(id), { method: 'DELETE' });
            Swal.fire({ icon: 'success', title: 'Service Type deleted!' });
            navigate('/apps/service-types');
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Failed to delete service type' });
            console.error(error);
        }
    };

    return (
        <div className="panel">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl">{isEditMode ? 'Edit Service Type' : 'Add Service Type'}</h2>
                <button type="button" className="btn btn-outline-danger" onClick={() => navigate('/apps/service-types')}>
                    <IconX className="ltr:mr-2 rtl:ml-2" />
                    Cancel
                </button>
            </div>
            <form onSubmit={e => { e.preventDefault(); saveServiceType(); }}>
                <div className="grid grid-cols-1 gap-4">
                    <div className="mb-5">
                        <label htmlFor="name">Name</label>
                        <input id="name" name="name" type="text" placeholder="Enter Name" className="form-input" value={serviceType.name} onChange={handleChange} required />
                    </div>
                    <div className="mb-5">
                        <label htmlFor="comments">Comments</label>
                        <textarea id="comments" name="comments" className="form-input" value={serviceType.comments} onChange={handleChange} />
                    </div>
                </div>
                <div className="flex justify-end items-center mt-8">
                    <button type="button" className="btn btn-primary" onClick={saveServiceType}>
                        {isEditMode ? 'Update' : 'Create'}
                    </button>
                    {isEditMode && (
                        <button type="button" className="btn btn-danger ltr:ml-4 rtl:mr-4" onClick={deleteServiceType}>
                            Delete
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default ServiceTypeForm; 