import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconArrowLeft from '../../components/Icon/IconArrowLeft';
import { FaTag, FaCalendarAlt, FaInfoCircle } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { API_ENDPOINTS } from '../../constants';

interface ServiceType {
    id: string;
    name: string;
    comments: string;
    createdAt: string;
    updatedAt: string;
}

const defaultServiceType = {
    id: '',
    name: '',
    comments: '',
    createdAt: '',
    updatedAt: '',
};

const labelClass = 'text-gray-500 font-semibold flex items-center gap-2';
const valueClass = 'mt-1 text-lg text-gray-900 dark:text-white-dark break-words';
const sectionClass = 'rounded-lg bg-white dark:bg-[#181f2c] shadow p-6 mb-6 border border-gray-100 dark:border-gray-800';
const dividerClass = 'col-span-full border-b border-dashed border-gray-200 my-2';

const ServiceTypeView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [serviceType, setServiceType] = useState<ServiceType>(defaultServiceType);
    const [loading, setLoading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        dispatch(setPageTitle('Service Type Details'));
        fetchServiceType();
    }, [id]);

    const fetchServiceType = async () => {
        if (!id) return;
        
        try {
            setLoading(true);
            const res = await fetch(API_ENDPOINTS.SERVICE.TYPE_BY_ID(id));
            const data = await res.json();
            if (data) {
                setServiceType(data);
            }
        } catch (error) {
            console.error('Error fetching service type:', error);
            Swal.fire({
                icon: 'error',
                title: 'Failed to fetch service type details'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setServiceType((prev: ServiceType) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDelete = async () => {
        if (!id) return;

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
                await fetch(API_ENDPOINTS.SERVICE.TYPE_BY_ID(id), {
                    method: 'DELETE',
                });
                Swal.fire({ icon: 'success', title: 'Service Type deleted!' });
                navigate('/apps/service-types');
            } catch (error) {
                console.error('Error deleting service type:', error);
                Swal.fire({ icon: 'error', title: 'Failed to delete service type' });
            }
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        if (!id) return;
        
        e.preventDefault();
        setIsUpdating(true);
        try {
            const response = await fetch(API_ENDPOINTS.SERVICE.TYPE_BY_ID(id), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(serviceType),
            });
            if (response.ok) {
                Swal.fire({ icon: 'success', title: 'Service Type updated!' });
                fetchServiceType();
            } else {
                Swal.fire({ icon: 'error', title: 'Failed to update service type' });
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Failed to update service type' });
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto mt-8">
            <div className="flex items-center justify-between mb-8">
                <button type="button" className="btn btn-outline-primary flex items-center gap-2" onClick={() => navigate('/apps/client-database')}>
                    <IconArrowLeft className="w-5 h-5" />
                    <span>Back to List</span>
                </button>
                <div className="flex gap-3">
                    <button type="button" className="btn btn-outline-danger" onClick={handleDelete}>
                        Delete
                    </button>
                </div>
            </div>

            <form className={sectionClass} onSubmit={handleUpdate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {/* General Info */}
                    <div>
                        <span className={labelClass}>
                            <div className="text-primary">{FaTag as unknown as JSX.Element}</div>
                            Name
                        </span>
                        <input
                            name="name"
                            type="text"
                            className="form-input mt-1 w-full"
                            value={serviceType.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <span className={labelClass}>
                            <div className="text-blue-500">{FaInfoCircle as unknown as JSX.Element }</div>
                            Comments
                        </span>
                        <textarea
                            name="comments"
                            className="form-textarea mt-1 w-full"
                            value={serviceType.comments}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={dividerClass}></div>

                    {/* Meta Info */}
                    <div>
                        <span className={labelClass}>
                            <div className="text-blue-500">{FaCalendarAlt as unknown as JSX.Element }</div>
                            Created At
                        </span>
                        <div className={valueClass}>
                            {serviceType.createdAt ? new Date(serviceType.createdAt).toLocaleString() : 'N/A'}
                        </div>
                    </div>
                    <div>
                        <span className={labelClass}>
                            <div className="text-blue-500">{FaCalendarAlt as unknown as JSX.Element }</div>
                            Updated At
                        </span>
                        <div className={valueClass}>
                            {serviceType.updatedAt ? new Date(serviceType.updatedAt).toLocaleString() : 'N/A'}
                        </div>
                    </div>
                </div>
                <div className="flex justify-end mt-8">
                    <button type="submit" className="btn btn-primary" disabled={isUpdating}>
                        {isUpdating ? 'Updating...' : 'Update'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ServiceTypeView; 