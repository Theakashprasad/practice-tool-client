import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconArrowLeft from '../../components/Icon/IconArrowLeft';
import { FaTag, FaCalendarAlt, FaInfoCircle } from 'react-icons/fa';
import type { IconType } from 'react-icons';
import Swal from 'sweetalert2';
import { API_ENDPOINTS } from '../../constants';

interface Industry {
    id: string;
    name: string;
    description: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

const defaultIndustry = {
    id: '',
    name: '',
    description: '',
    active: true,
    createdAt: '',
    updatedAt: '',
};

const labelClass = 'text-gray-500 font-semibold flex items-center gap-2';
const valueClass = 'mt-1 text-lg text-gray-900 dark:text-white-dark break-words';
const sectionClass = 'rounded-lg bg-white dark:bg-[#181f2c] shadow p-6 mb-6 border border-gray-100 dark:border-gray-800';
const dividerClass = 'col-span-full border-b border-dashed border-gray-200 my-2';

const IndustryView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [industry, setIndustry] = useState<Industry>(defaultIndustry);
    const [loading, setLoading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        dispatch(setPageTitle('Industry Details'));
        fetchIndustry();
    }, [id]);

    const fetchIndustry = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const res = await fetch(API_ENDPOINTS.INDUSTRY.BY_ID(id));
            const data = await res.json();
            if (data) {
                setIndustry(data);
            }
        } catch (error) {
            console.error('Error fetching industry:', error);
            Swal.fire({
                icon: 'error',
                title: 'Failed to fetch industry details'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setIndustry((prev: Industry) => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
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
                await fetch(API_ENDPOINTS.INDUSTRY.BY_ID(id), {
                    method: 'DELETE',
                });
                Swal.fire({ icon: 'success', title: 'Industry deleted!' });
                navigate('/apps/industry');
            } catch (error) {
                console.error('Error deleting industry:', error);
                Swal.fire({ icon: 'error', title: 'Failed to delete industry' });
            }
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        if (!id) return;
        e.preventDefault();
        setIsUpdating(true);
        try {
            const response = await fetch(API_ENDPOINTS.INDUSTRY.BY_ID(id), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(industry),
            });
            if (response.ok) {
                Swal.fire({ icon: 'success', title: 'Industry updated!' });
                fetchIndustry();
            } else {
                Swal.fire({ icon: 'error', title: 'Failed to update industry' });
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Failed to update industry' });
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
                <button type="button" className="btn btn-outline-primary flex items-center gap-2" onClick={() => navigate('/apps/industry')}>
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
                            {FaTag && <FaTag className="text-primary" />}
                            Name
                        </span>
                        <input
                            name="name"
                            type="text"
                            className="form-input mt-1 w-full"
                            value={industry.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <span className={labelClass}>
                            {FaInfoCircle && <FaInfoCircle className="text-blue-500" />}
                            Description
                        </span>
                        <textarea
                            name="description"
                            className="form-textarea mt-1 w-full"
                            value={industry.description}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <span className={labelClass}>
                            {FaInfoCircle && <FaInfoCircle className="text-blue-500" />}
                            Status
                        </span>
                        <label className="inline-flex items-center mt-1">
                            <input
                                type="checkbox"
                                name="active"
                                className="form-checkbox"
                                checked={industry.active}
                                onChange={handleChange}
                            />
                            <span className="ml-2">Active</span>
                        </label>
                    </div>

                    <div className={dividerClass}></div>

                    {/* Meta Info */}
                    <div>
                        <span className={labelClass}>
                            {FaCalendarAlt && <FaCalendarAlt className="text-blue-500" />}
                            Created At
                        </span>
                        <div className={valueClass}>
                            {industry.createdAt ? new Date(industry.createdAt).toLocaleString() : 'N/A'}
                        </div>
                    </div>
                    <div>
                        <span className={labelClass}>
                            {FaCalendarAlt && <FaCalendarAlt className="text-blue-500" />}
                            Updated At
                        </span>
                        <div className={valueClass}>
                            {industry.updatedAt ? new Date(industry.updatedAt).toLocaleString() : 'N/A'}
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

export default IndustryView; 