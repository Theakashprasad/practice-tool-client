import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import IconPlus from '../../components/Icon/IconPlus';
import IconMinus from '../../components/Icon/IconMinus';
import { API_BASE_URL } from '../../constants';

interface Email {
    address: string;
    description: string;
    isDefault: boolean;
}

interface Phone {
    number: string;
    description: string;
    isDefault: boolean;
    isSmsDefault: boolean;
}

interface Contact {
    id: string;
    firstName: string;
    lastName: string;
    title: string;
    emails: Email[];
    phones: Phone[];
    dob: string;
    permissions: string;
    comments: string;
    clientGroupIds: string[] | null;
    clientEntityIds: string[] | null;
    createdAt: string;
    updatedAt: string;
}

const defaultContact: Contact = {
    id: '',
    firstName: '',
    lastName: '',
    title: '',
    emails: [],
    phones: [],
    dob: '',
    permissions: '',
    comments: '',
    clientGroupIds: null,
    clientEntityIds: null,
    createdAt: '',
    updatedAt: '',
};

const AddContact = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    useEffect(() => {
        dispatch(setPageTitle(isEditMode ? 'Edit Contact' : 'Add Contact'));
        if (isEditMode) {
            fetchContact();
        }
        fetchClientGroups();
        fetchClientEntities();
    }, []);

    const [contact, setContact] = useState<Contact>({ ...defaultContact });
    const [clientGroups, setClientGroups] = useState<any[]>([]);
    const [clientEntities, setClientEntities] = useState<any[]>([]);

    const fetchClientGroups = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/client-groups`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setClientGroups(data);
            }
        } catch (error) {
            console.error('Error fetching client groups:', error);
        }
    };

    const fetchClientEntities = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/clients`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setClientEntities(data);
            }
        } catch (error) {
            console.error('Error fetching client entities:', error);
        }
    };

    const fetchContact = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/contacts/${id}`);
            const data = await res.json();
            setContact({
                ...data,
                emails: data.emails.map((e: any) => ({ ...e })),
                phones: data.phones.map((p: any) => ({ ...p })),
                permissions: Array.isArray(data.permissions) ? data.permissions.map((p: any) => (typeof p === 'string' ? p : p.permission)).join(',') : data.permissions,
            });
        } catch (error) {
            console.error(error);
            Swal.fire({ icon: 'error', title: 'Failed to fetch contact' });
            navigate('/apps/contacts');
        }
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setContact((prev) => ({ ...prev, [name]: value }));
    };

    const handleClientGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setContact(prev => ({
            ...prev,
            clientGroupIds: selectedOptions.length > 0 ? selectedOptions : null
        }));
    };

    const handleClientEntityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        console.log('Selected client entities:', selectedOptions);
        setContact(prev => {
            const updated = {
                ...prev,
                clientEntityIds: selectedOptions.length > 0 ? selectedOptions : null
            };
            console.log('Updated contact state:', updated);
            return updated;
        });
    };

    const saveContact = async () => {
        try {
            const payload = {
                ...contact,
                emails: contact.emails.map((e: any) => ({ ...e })),
                phones: contact.phones.map((p: any) => ({ ...p })),
                permissions: contact.permissions.split(',').map((s: string) => s.trim()).filter(Boolean),
                clientEntityIds: contact.clientEntityIds || null,
                clientGroupIds: contact.clientGroupIds || null
            };
            console.log('Saving contact with payload:', payload);

            if (isEditMode) {
                await fetch(`${API_BASE_URL}/api/contacts/${contact.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                Swal.fire({ icon: 'success', title: 'Contact updated!' });
            } else {
                await fetch(`${API_BASE_URL}/api/contacts`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                Swal.fire({ icon: 'success', title: 'Contact created!' });
            }
            navigate('/apps/contacts');
        } catch (error) {
            console.error('Error saving contact:', error);
            Swal.fire({ icon: 'error', title: 'Failed to save contact' });
        }
    };

    const deleteContact = async () => {
        const firstConfirm = await Swal.fire({
            title: 'Are you sure?',
            text: 'You are about to delete this contact',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, proceed',
            cancelButtonText: 'No, cancel',
            padding: '2em',
        });

        if (!firstConfirm.isConfirmed) {
            return;
        }

        const secondConfirm = await Swal.fire({
            title: 'Final Confirmation',
            text: 'This action cannot be undone. Are you absolutely sure?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete contact',
            cancelButtonText: 'No, cancel',
            confirmButtonColor: '#dc2626',
            padding: '2em',
        });

        if (!secondConfirm.isConfirmed) {
            return;
        }

        try {
            await fetch(`${API_BASE_URL}/api/contacts/${contact.id}`, { method: 'DELETE' });
            Swal.fire({ icon: 'success', title: 'Contact deleted!' });
            navigate('/apps/contacts');
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Failed to delete contact' });
            console.error(error);
        }
    };

    const addEmail = () => {
        setContact(prev => ({
            ...prev,
            emails: [...prev.emails, { address: '', description: '', isDefault: false }]
        }));
    };

    const removeEmail = (index: number) => {
        setContact(prev => ({
            ...prev,
            emails: prev.emails.filter((_, i) => i !== index)
        }));
    };

    const updateEmail = (index: number, field: keyof Email, value: string | boolean) => {
        setContact(prev => ({
            ...prev,
            emails: prev.emails.map((email, i) => 
                i === index ? { ...email, [field]: value } : email
            )
        }));
    };

    const setDefaultEmail = (index: number) => {
        setContact(prev => ({
            ...prev,
            emails: prev.emails.map((email, i) => ({
                ...email,
                isDefault: i === index
            }))
        }));
    };

    const addPhone = () => {
        setContact(prev => ({
            ...prev,
            phones: [...prev.phones, { number: '', description: '', isDefault: false, isSmsDefault: false }]
        }));
    };

    const removePhone = (index: number) => {
        setContact(prev => ({
            ...prev,
            phones: prev.phones.filter((_, i) => i !== index)
        }));
    };

    const updatePhone = (index: number, field: keyof Phone, value: string | boolean) => {
        setContact(prev => ({
            ...prev,
            phones: prev.phones.map((phone, i) => 
                i === index ? { ...phone, [field]: value } : phone
            )
        }));
    };

    const setDefaultPhone = (index: number) => {
        setContact(prev => ({
            ...prev,
            phones: prev.phones.map((phone, i) => ({
                ...phone,
                isDefault: i === index
            }))
        }));
    };

    const setDefaultSmsPhone = (index: number) => {
        setContact(prev => ({
            ...prev,
            phones: prev.phones.map((phone, i) => ({
                ...phone,
                isSmsDefault: i === index
            }))
        }));
    };

    return (
        <div>
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl">{isEditMode ? 'Edit Contact' : 'Add Contact'}</h2>
            </div>
            <div className="panel mt-5">
                <form onSubmit={e => { e.preventDefault(); saveContact(); }}>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="mb-5">
                            <label htmlFor="firstName">First Name</label>
                            <input id="firstName" name="firstName" type="text" placeholder="Enter First Name" className="form-input" value={contact.firstName} onChange={handleChange} required />
                        </div>
                        <div className="mb-5">
                            <label htmlFor="lastName">Last Name</label>
                            <input id="lastName" name="lastName" type="text" placeholder="Enter Last Name" className="form-input" value={contact.lastName} onChange={handleChange} required />
                        </div>
                        <div className="mb-5">
                            <label htmlFor="title">Title</label>
                            <input id="title" name="title" type="text" placeholder="Enter Title" className="form-input" value={contact.title} onChange={handleChange} />
                        </div>
                        <div className="mb-5">
                            <label htmlFor="clientGroups">Client Groups</label>
                            <select
                                id="clientGroups"
                                name="clientGroups"
                                multiple
                                className="form-multiselect"
                                value={contact.clientGroupIds || []}
                                onChange={handleClientGroupChange}
                            >
                                {clientGroups.map((group) => (
                                    <option key={group.id} value={group.id}>{group.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-5">
                            <label htmlFor="clientEntities">Client Entities</label>
                            <select
                                id="clientEntities"
                                name="clientEntities"
                                multiple
                                className="form-multiselect"
                                value={contact.clientEntityIds || []}
                                onChange={handleClientEntityChange}
                            >
                                {clientEntities.map((entity) => (
                                    <option key={entity.id} value={entity.id}>{entity.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-5">
                            <label>Emails</label>
                            <div className="space-y-3">
                                {contact.emails.map((email, index) => (
                                    <div key={index} className="flex gap-3 items-start">
                                        <div className="flex-1">
                                            <input
                                                type="email"
                                                placeholder="Email address"
                                                className="form-input"
                                                value={email.address}
                                                onChange={(e) => updateEmail(index, 'address', e.target.value)}
                                            />
                                        </div>
                                        <div className="w-32">
                                            <input
                                                type="text"
                                                placeholder="Label"
                                                className="form-input"
                                                value={email.description}
                                                onChange={(e) => updateEmail(index, 'description', e.target.value)}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <label className="inline-flex">
                                                <input
                                                    type="radio"
                                                    name="defaultEmail"
                                                    checked={email.isDefault}
                                                    onChange={() => setDefaultEmail(index)}
                                                    className="form-radio"
                                                />
                                                <span className="text-xs">Default</span>
                                            </label>
                                            <button
                                                type="button"
                                                className="btn btn-outline-danger p-1"
                                                onClick={() => removeEmail(index)}
                                            >
                                                <IconMinus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={addEmail}
                                >
                                    <IconPlus className="w-4 h-4 mr-1" />
                                    Add Email
                                </button>
                            </div>
                        </div>
                        <div className="mb-5">
                            <label>Phone Numbers</label>
                            <div className="space-y-3">
                                {contact.phones.map((phone, index) => (
                                    <div key={index} className="flex gap-3 items-start">
                                        <div className="flex-1">
                                            <input
                                                type="tel"
                                                placeholder="Phone number"
                                                className="form-input"
                                                value={phone.number}
                                                onChange={(e) => updatePhone(index, 'number', e.target.value)}
                                            />
                                        </div>
                                        <div className="w-32">
                                            <input
                                                type="text"
                                                placeholder="Label"
                                                className="form-input"
                                                value={phone.description}
                                                onChange={(e) => updatePhone(index, 'description', e.target.value)}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <label className="inline-flex">
                                                <input
                                                    type="radio"
                                                    name="defaultPhone"
                                                    checked={phone.isDefault}
                                                    onChange={() => setDefaultPhone(index)}
                                                    className="form-radio"
                                                />
                                                <span className="text-xs">Default</span>
                                            </label>
                                            <label className="inline-flex">
                                                <input
                                                    type="radio"
                                                    name="defaultSmsPhone"
                                                    checked={phone.isSmsDefault}
                                                    onChange={() => setDefaultSmsPhone(index)}
                                                    className="form-radio"
                                                />
                                                <span className="text-xs">SMS</span>
                                            </label>
                                            <button
                                                type="button"
                                                className="btn btn-outline-danger p-1"
                                                onClick={() => removePhone(index)}
                                            >
                                                <IconMinus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={addPhone}
                                >
                                    <IconPlus className="w-4 h-4 mr-1" />
                                    Add Phone
                                </button>
                            </div>
                        </div>
                        <div className="mb-5">
                            <label htmlFor="dob">Date of Birth</label>
                            <input id="dob" name="dob" type="date" className="form-input" value={contact.dob} onChange={handleChange} />
                        </div>
                        <div className="mb-5">
                            <label htmlFor="permissions">Permissions (comma separated)</label>
                            <input id="permissions" name="permissions" type="text" placeholder="Enter Permissions" className="form-input" value={contact.permissions} onChange={handleChange} />
                        </div>
                        <div className="mb-5">
                            <label htmlFor="comments">Comments</label>
                            <textarea id="comments" name="comments" placeholder="Enter Comments" className="form-input" value={contact.comments} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="flex justify-end items-center mt-8">
                        <button type="button" className="btn btn-outline-danger" onClick={() => navigate('/apps/contacts')}>
                            Cancel
                        </button>
                        <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={() => saveContact()}>
                            {isEditMode ? 'Update' : 'Create'}
                        </button>
                        {isEditMode && (
                            <button type="button" className="btn btn-danger ltr:ml-4 rtl:mr-4" onClick={() => deleteContact()}>
                                Delete
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddContact;
