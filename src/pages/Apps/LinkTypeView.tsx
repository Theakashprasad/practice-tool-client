import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconArrowLeft from '../../components/Icon/IconArrowLeft';
import { FaLink, FaCalendarAlt, FaInfoCircle, FaEye } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../../constants';

interface LinkType {
    id: string;
    entity: string;
    linkType: string;
    url: string;
    showToClient: boolean;
    createdAt: string;
    updatedAt: string;
}

const defaultLinkType = {
    id: '',
    entity: '',
    linkType: '',
    url: '',
    showToClient: false,
    createdAt: '',
    updatedAt: '',
};

const labelClass = 'text-gray-500 font-semibold flex items-center gap-2';
const valueClass = 'mt-1 text-lg text-gray-900 dark:text-white-dark break-words';
const sectionClass = 'rounded-lg bg-white dark:bg-[#181f2c] shadow p-6 mb-6 border border-gray-100 dark:border-gray-800';
const dividerClass = 'col-span-full border-b border-dashed border-gray-200 my-2';

const LinkTypeView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [linkType, setLinkType] = useState<LinkType>(defaultLinkType);
    const [loading, setLoading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        dispatch(setPageTitle('Link Type Details'));
        fetchLinkType();
    }, [id]);

    const fetchLinkType = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/api/links/${id}`);
            const data = await res.json();
            if (data) {
                setLinkType(data);
            }
        } catch (error) {
            console.error('Error fetching link type:', error);
            Swal.fire({
                icon: 'error',
                title: 'Failed to fetch link type details'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            setLinkType((prev: LinkType) => ({
                ...prev,
                [name]: (e.target as HTMLInputElement).checked
            }));
        } else {
            setLinkType((prev: LinkType) => ({
                ...prev,
                [name]: value
            }));
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
                await fetch(`${API_BASE_URL}/api/links/${id}`, {
                    method: 'DELETE',
                });
                Swal.fire({ icon: 'success', title: 'Link Type deleted!' });
                navigate('/apps/new-link-types');
            } catch (error) {
                console.error('Error deleting link type:', error);
                Swal.fire({ icon: 'error', title: 'Failed to delete link type' });
            }
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/links/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(linkType),
            });
            if (response.ok) {
                Swal.fire({ icon: 'success', title: 'Link Type updated!' });
                fetchLinkType();
            } else {
                Swal.fire({ icon: 'error', title: 'Failed to update link type' });
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Failed to update link type' });
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
                <button type="button" className="btn btn-outline-primary flex items-center gap-2" onClick={() => navigate('/apps/new-link-types')}>
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
                            <div className="text-primary">{FaLink as unknown as JSX.Element}</div>
                            Entity
                        </span>
                        <input
                            name="entity"
                            type="text"
                            className="form-input mt-1 w-full"
                            value={linkType.entity}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <span className={labelClass}>
                            <div className="text-primary">{FaLink as unknown as JSX.Element }</div>
                            Link Type
                        </span>
                        <input
                            name="linkType"
                            type="text"
                            className="form-input mt-1 w-full"
                            value={linkType.linkType}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <span className={labelClass}>
                            <div className="text-primary">{FaLink as unknown as JSX.Element }</div>
                            URL
                        </span>
                        <input
                            name="url"
                            type="url"
                            className="form-input mt-1 w-full"
                            value={linkType.url}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <span className={labelClass}>
                            <div className="text-primary">{FaEye as unknown as JSX.Element}</div>
                            Show To Client
                        </span>
                        <input
                            name="showToClient"
                            type="checkbox"
                            className="form-checkbox mt-1"
                            checked={linkType.showToClient}
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
                            {linkType.createdAt ? new Date(linkType.createdAt).toLocaleString() : 'N/A'}
                        </div>
                    </div>
                    <div>
                        <span className={labelClass}>
                            <div className="text-blue-500">{FaCalendarAlt as unknown as JSX.Element}</div>
                            Updated At
                        </span>
                        <div className={valueClass}>
                            {linkType.updatedAt ? new Date(linkType.updatedAt).toLocaleString() : 'N/A'}
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

export default LinkTypeView; 