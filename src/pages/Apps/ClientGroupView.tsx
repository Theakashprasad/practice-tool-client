import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../constants';
import IconArrowLeft from '../../components/Icon/IconArrowLeft';
import { FaUser, FaUsers, FaCalendarAlt, FaBuilding, FaInfoCircle, FaAddressBook } from 'react-icons/fa';
import Swal from 'sweetalert2';

interface Email {
    address: string;
    isDefault?: boolean;
    description?: string;
}

interface Phone {
    number: string;
    isDefault?: boolean;
    description?: string;
    isSmsDefault?: boolean;
}

interface Contact {
    id: string;
    firstName: string;
    lastName: string;
    title?: string;
    emails?: Email[];
    phones?: Phone[];
    dob?: string;
    clientGroupIds?: string[];
    permissions?: string[];
    comments?: string;
    createdAt: string;
    updatedAt: string;
}

const labelClass = 'text-gray-500 font-semibold flex items-center gap-2';
const valueClass = 'mt-1 text-lg text-gray-900 dark:text-white-dark break-words';
const sectionClass = 'rounded-lg bg-white dark:bg-[#181f2c] shadow p-6 mb-6 border border-gray-100 dark:border-gray-800';
const dividerClass = 'col-span-full border-b border-dashed border-gray-200 my-2';

const ClientGroupView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [clientGroup, setClientGroup] = useState<any>(null);
    const [associatedEntities, setAssociatedEntities] = useState<any[]>([]);
    const [associatedContacts, setAssociatedContacts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [practiceName, setPracticeName] = useState<string>('');

    useEffect(() => {
        fetchClientGroup();
    }, [id]);

    const fetchClientGroup = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/api/client-groups/${id}`);
            const data = await res.json();
            setClientGroup(data);
            if (data.practice_id) {
                fetchPracticeName(data.practice_id);
            }
            fetchAssociatedEntities(data.id);
            fetchAssociatedContacts(data.id);
        } catch (error) {
            console.error('Error fetching client group:', error);
            Swal.fire({ icon: 'error', title: 'Failed to fetch client group details' });
        } finally {
            setLoading(false);
        }
    };

    const fetchPracticeName = async (practiceId: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/practices/${practiceId}`);
            const data = await res.json();
            setPracticeName(data.name);
        } catch (error) {
            console.error('Error fetching practice name:', error);
        }
    };

    const fetchAssociatedEntities = async (clientGroupId: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/clients?clientGroupId=${clientGroupId}`);
            const data = await res.json();
            console.log("associated entities",data);
            
            if (Array.isArray(data)) {
                setAssociatedEntities(data);
            }
        } catch (error) {
            console.error('Error fetching associated entities:', error);
        }
    };

    const fetchAssociatedContacts = async (clientGroupId: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/contacts?clientGroupId=${clientGroupId}`);
            const data = await res.json();
            console.log("associated contacts",data);
            
            if (Array.isArray(data)) {
                setAssociatedContacts(data);
            }
        } catch (error) {
            console.error('Error fetching associated contacts:', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setClientGroup((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/client-groups/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(clientGroup),
            });
            if (response.ok) {
                Swal.fire({ icon: 'success', title: 'Client Group updated!' });
                fetchClientGroup();
            } else {
                Swal.fire({ icon: 'error', title: 'Failed to update client group' });
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Failed to update client group' });
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
                await fetch(`${API_BASE_URL}/api/client-groups/${id}`, {
                    method: 'DELETE',
                });
                Swal.fire({ icon: 'success', title: 'Client Group deleted!' });
                navigate('/apps/client-database');
            } catch (error) {
                console.error('Error deleting client group:', error);
                Swal.fire({ icon: 'error', title: 'Failed to delete client group' });
            }
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    if (!clientGroup) {
        return <div className="flex items-center justify-center h-screen">Client Group not found</div>;
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
                            <div className="text-primary"><FaUser /></div>
                            Name
                        </span>
                        <input name="name" className="form-input mt-1 w-full" value={clientGroup.name || ''} onChange={handleChange} required />
                    </div>
                    <div>
                        <span className={labelClass}>
                            <div className="text-green-600"><FaBuilding /></div>
                            Practice
                        </span>
                        <div className={valueClass}>{practiceName || 'Not assigned'}</div>
                    </div>

                    <div className={dividerClass}></div>

                    {/* Meta Info */}
                    <div>
                        <span className={labelClass}>
                            <div className="text-blue-500"><FaCalendarAlt /></div>
                            Created At
                        </span>
                        <div className={valueClass}>{new Date(clientGroup.createdAt).toLocaleString()}</div>
                    </div>
                    <div>
                        <span className={labelClass}>
                            <div className="text-blue-500"><FaCalendarAlt /></div>
                            Updated At
                        </span>
                        <div className={valueClass}>{new Date(clientGroup.updatedAt).toLocaleString()}</div>
                    </div>
                </div>
                <div className="flex justify-end mt-8">
                    <button type="submit" className="btn btn-primary" disabled={isUpdating}>{isUpdating ? 'Updating...' : 'Update'}</button>
                </div>
            </form>

            {/* Associated Entities Section */}
            <div className={sectionClass + ' p-0'}>
                <div className="flex items-center gap-2 px-6 pt-6 pb-2 border-b border-gray-100 dark:border-gray-800">
                    <div className="text-primary text-xl"><FaUsers /></div>
                    <h3 className="text-xl font-semibold text-primary">Associated Entities</h3>
                </div>
                {associatedEntities.length > 0 ? (
                    <div className="overflow-x-auto p-6">
                        <table className="min-w-full bg-white dark:bg-[#181f2c] rounded-lg shadow divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-[#232b3b]">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase">Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase">Structure</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase">Jurisdiction</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {associatedEntities.map((entity) => (
                                    <tr key={entity.id} className="transition hover:bg-primary/10">
                                        <td className="px-4 py-3 font-medium text-primary cursor-pointer flex items-center gap-2 hover:underline" onClick={() => navigate(`/apps/client-entity/${entity.id}`)}>
                                            <span>{entity.name}</span>
                                            <svg className="w-4 h-4 text-primary group-hover:text-primary-dark" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                        </td>
                                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{entity.structure}</td>
                                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{entity.jurisdiction}</td>
                                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{entity.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-gray-500 p-6">No entities associated with this client group.</div>
                )}
            </div>

            {/* Associated Contacts Section */}
            <div className={sectionClass + ' p-0'}>
                <div className="flex items-center gap-2 px-6 pt-6 pb-2 border-b border-gray-100 dark:border-gray-800">
                    <div className="text-primary text-xl"><FaAddressBook /></div>
                    <h3 className="text-xl font-semibold text-primary">Associated Contacts</h3>
                </div>
                {associatedContacts.length > 0 ? (
                    <div className="overflow-x-auto p-6">
                        <table className="min-w-full bg-white dark:bg-[#181f2c] rounded-lg shadow divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-[#232b3b]">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase">Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase">Email</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase">Phone</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase">Title</th>
                                </tr>
                            </thead>
                            <tbody>
                                {associatedContacts.map((contact) => (
                                    <tr key={contact.id} className="transition hover:bg-primary/10">
                                        <td className="px-4 py-3 font-medium text-primary cursor-pointer flex items-center gap-2 hover:underline" onClick={() => navigate(`/apps/contacts/view/${contact.id}`)}>
                                            <span>{`${contact.firstName} ${contact.lastName}`}</span>
                                            <svg className="w-4 h-4 text-primary group-hover:text-primary-dark" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                        </td>
                                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                            {contact.emails?.find((email: Email) => email.isDefault)?.address || contact.emails?.[0]?.address || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                            {contact.phones?.find((phone: Phone) => phone.isDefault)?.number || contact.phones?.[0]?.number || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{contact.title || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-gray-500 p-6">No contacts associated with this client group.</div>
                )}
            </div>
        </div>
    );
};

export default ClientGroupView; 