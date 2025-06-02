import { useState, useEffect, Fragment } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import { API_BASE_URL } from '../../constants';
import IconArrowLeft from '../../components/Icon/IconArrowLeft';
import IconEdit from '../../components/Icon/IconEdit';
import IconTrash from '../../components/Icon/IconTrash';
import IconUserPlus from '../../components/Icon/IconUserPlus';
import IconX from '../../components/Icon/IconX';
import IconUser from '../../components/Icon/IconUser';
import IconCalendar from '../../components/Icon/IconCalendar';
import IconLink from '../../components/Icon/IconLink';
import IconSettings from '../../components/Icon/IconSettings';
import IconInfoCircle from '../../components/Icon/IconInfoCircle';
import { Dialog, Transition } from '@headlessui/react';
import Swal from 'sweetalert2';

const labelClass = 'text-gray-500 font-semibold flex items-center gap-2';
const valueClass = 'mt-1 text-lg text-gray-900 dark:text-white-dark break-words';
const sectionClass = 'rounded-lg bg-white dark:bg-[#181f2c] shadow p-6 mb-6 border border-gray-100 dark:border-gray-800';
const dividerClass = 'col-span-full border-b border-dashed border-gray-200 my-2';

const dummyClient = {
    id: '1',
    name: 'Demo Client',
    structure: 'Ind',
    clientGroupId: 'CG001',
    jurisdiction: 'USA',
    regId: 'REG123',
    yearEnd: '2024-12-31',
    taxIds: 'TIN:12345',
    status: 'Current',
    serviceStartDate: '2022-01-01',
    serviceEndDate: '',
    staffPartnerId: 'P001',
    staffManager1Id: 'M001',
    staffManager2Id: 'M002',
    staffAccountantIds: 'A001,A002',
    staffBookkeeper1Id: 'B001',
    staffBookkeeper2Id: 'B002',
    staffTaxSpecialistId: 'T001',
    staffOther1Id: 'O001',
    staffOther2Id: 'O002',
    staffOther3Id: '',
    staffOther4Id: '',
    staffOther5Id: '',
    staffAdmin1Id: 'AD001',
    staffAdmin2Id: 'AD002',
    industry: 'Tech',
    industryId: 'IND001',
    industryDescription: 'Technology and Software Development',
    industryActive: true,
    industryCreatedAt: new Date().toISOString(),
    industryUpdatedAt: new Date().toISOString(),
    accountingSystem: 'Xero',
    serviceLevel: 'Full Service',
    comments: 'Demo client',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

const dummyClientGroup = {
    id: 'CG001',
    name: 'Demo Client Group',
    practiceId: 'P001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

const defaultLink = {
    id: '',
    entity: '',
    linkType: '',
    url: '',
    showToClient: false,
    createdAt: '',
    updatedAt: '',
};

const ClientEntityView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [clientEntity, setClientEntity] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [activeTab, setActiveTab] = useState('details');
    const [links, setLinks] = useState<any[]>([]);
    const [addLinkModal, setAddLinkModal] = useState(false);
    const [selectedLink, setSelectedLink] = useState({ ...defaultLink });
    const [clientGroup, setClientGroup] = useState<any>(null);
    const [clientGroups, setClientGroups] = useState<any[]>([]);
    const [staffMembers, setStaffMembers] = useState<{ [key: string]: any }>({});
    const [associatedContacts, setAssociatedContacts] = useState<any[]>([]);
    const [serviceTypes, setServiceTypes] = useState<any[]>([]);
    const [industries, setIndustries] = useState<any[]>([]);
    const [staffUsers, setStaffUsers] = useState<any[]>([]);
    const [invitations, setInvitations] = useState<any[]>([]);
    const [contacts, setContacts] = useState<any[]>([]);
    const [linkTypes, setLinkTypes] = useState<any[]>([]);

    useEffect(() => {
        dispatch(setPageTitle('Client Entity Details'));
        fetchClientEntity();
        fetchServiceTypes();
        fetchIndustries();
        fetchStaffAndInvitations();
        fetchClientGroups();
        fetchContacts();
        fetchLinkTypes();
    }, [id]);

    const fetchClientEntity = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/api/clients/${id}`);
            const data = await res.json();
            setClientEntity(data);
            if (data) {
                if (data.clientGroupId) {
                    fetchClientGroup(data.clientGroupId);
                }
                fetchStaffMembers(data);
            }
            if (activeTab === 'links') {
                fetchLinks();
            }
        } catch (error) {
            console.error('Error fetching client entity:', error);
            Swal.fire({ icon: 'error', title: 'Failed to fetch client entity details' });
        } finally {
            setLoading(false);
        }
    };

    console.log("clientEntity",clientEntity);
    

    const fetchClientGroup = async (groupId: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/client-groups/${groupId}`);
            const data = await res.json();
            setClientGroup(data);
        } catch (error) {
            console.error('Error fetching client group:', error);
        }
    };

    const fetchClientGroups = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/client-groups`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setClientGroups(data);
            }
        } catch (error) {
            console.error('Error fetching client groups:', error);
            setClientGroups([]);
        }
    };

    const fetchStaffMembers = async (entity: any) => {
        const staffIds = [
            entity.staffPartnerId,
            entity.staffManager1Id,
            entity.staffManager2Id,
            entity.staffTaxSpecialistId,
            entity.staffBookkeeper1Id,
            entity.staffBookkeeper2Id,
            entity.staffAdmin1Id,
            entity.staffAdmin2Id,
            entity.staffOther1Id,
            entity.staffOther2Id,
            entity.staffOther3Id,
            entity.staffOther4Id,
            entity.staffOther5Id
        ].filter(id => id);

        try {
            // Fetch both users and invitations
            const [usersResponse, invitationsResponse] = await Promise.all([
                fetch(`${API_BASE_URL}/api/users`),
                fetch(`${API_BASE_URL}/api/invitation`)
            ]);

            const users = await usersResponse.json();
            const invitations = await invitationsResponse.json();

            console.log("users", users);
            console.log("invitations", invitations);
            
            const staffData: { [key: string]: any } = {};
            
            // Process each staff ID
            await Promise.all(
                staffIds.map(async (staffId) => {
                    // First check in users
                    const usersArray = Array.isArray(users) ? users : [];
                    const user = usersArray.find((u: any) => String(u.id) === String(staffId));
                    if (user) {
                        staffData[staffId] = {
                            id: user.id,
                            name: `${user.first_name} ${user.last_name}`,
                            email: user.email,
                            status: user.status || 'active'
                        };
                    } else {
                        // Then check in invitations
                        const invitationsArray = Array.isArray(invitations) ? invitations : [];
                        const invitation = invitationsArray.find((inv: any) => String(inv.id) === String(staffId));
                        if (invitation) {
                            staffData[staffId] = {
                                id: invitation.id,
                                name: `${invitation.email}`,
                                email: invitation.email,
                                status: 'pending'
                            };
                        }
                    }
                })
            );
            
            setStaffMembers(staffData);
        } catch (error) {
            console.error('Error fetching staff members:', error);
        }
    };

    const fetchStaffAndInvitations = async () => {
        try {
            // Fetch both users and invitations
            const [usersResponse, invitationsResponse] = await Promise.all([
                fetch(`${API_BASE_URL}/api/users`),
                fetch(`${API_BASE_URL}/api/invitation`)
            ]);

            const users = await usersResponse.json();
            const invitations = await invitationsResponse.json();

            setStaffUsers(Array.isArray(users) ? users : []);
            setInvitations(Array.isArray(invitations) ? invitations : []);
        } catch (error) {
            console.error('Error fetching staff users and invitations:', error);
            setStaffUsers([]);
            setInvitations([]);
        }
    };

    console.log("clientEntity",clientEntity);
    
    

    const fetchLinks = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/links`);
            const data = await res.json();
            if (Array.isArray(data)) {
                // Filter links based on the client entity's ID
                const filteredLinks = data.filter(link => 
                    link.entity === clientEntity.linkType
                );
                setLinks(filteredLinks);
            }
        } catch (error) {
            console.error('Error fetching links:', error);
        }
    };

    useEffect(() => {
        if (activeTab === 'links') {
            fetchLinks();
        }
    }, [activeTab]);

    const fetchServiceTypes = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/service-types`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setServiceTypes(data);
            }
        } catch (error) {
            console.error('Error fetching service types:', error);
        }
    };

    const fetchIndustries = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/industries`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setIndustries(data);
            }
        } catch (error) {
            console.error('Error fetching industries:', error);
        }
    };

    const fetchContacts = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/contacts`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setContacts(data);
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
        }
    };

    const fetchLinkTypes = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/links`);
            const data = await res.json();
            console.log("data link types",data);
            
            if (Array.isArray(data)) {
                setLinkTypes(data);
            }
        } catch (error) {
            console.error('Error fetching link types:', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'contactIds') {
            const select = e.target as HTMLSelectElement;
            const selectedOptions = Array.from(select.selectedOptions, option => option.value);
            setClientEntity((prev: any) => ({ ...prev, [name]: selectedOptions }));
        } else if (name === 'serviceTypes') {
            const select = e.target as HTMLSelectElement;
            const selectedOptions = Array.from(select.selectedOptions, option => option.value);
            setClientEntity((prev: any) => ({ ...prev, [name]: selectedOptions }));
        } else {
            setClientEntity((prev: any) => ({ ...prev, [name]: value }));
        }
    };

    const handleLinkChange = (e: any) => {
        const { name, value, type, checked } = e.target;
        setSelectedLink(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            // Ensure we're sending the industryId
            const updateData = {
                ...clientEntity,
                industryId: clientEntity.industryId || null
            };

            const response = await fetch(`${API_BASE_URL}/api/clients/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData),
            });
            if (response.ok) {
                Swal.fire({ icon: 'success', title: 'Client Entity updated!' });
                fetchClientEntity();
            } else {
                Swal.fire({ icon: 'error', title: 'Failed to update client entity' });
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Failed to update client entity' });
        } finally {
            setIsUpdating(false);
        }
    };

    const saveLink = async () => {
        try {
            const linkData = {
                ...selectedLink,
                entityId: id
            };

            if (selectedLink.id) {
                await fetch(`${API_BASE_URL}/api/links/${selectedLink.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(linkData),
                });
                Swal.fire({ icon: 'success', title: 'Link updated!' });
            } else {
                await fetch(`${API_BASE_URL}/api/links`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(linkData),
                });
                Swal.fire({ icon: 'success', title: 'Link created!' });
            }
            setAddLinkModal(false);
            setSelectedLink({ ...defaultLink });
            fetchLinks();
        } catch (error) {
            console.error(error);
            Swal.fire({ icon: 'error', title: 'Failed to save link' });
        }
    };

    const deleteLink = async (linkId: string) => {
        try {
            await fetch(`${API_BASE_URL}/api/links/${linkId}`, { method: 'DELETE' });
            Swal.fire({ icon: 'success', title: 'Link deleted!' });
            fetchLinks();
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Failed to delete link' });
            console.error(error);
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
                await fetch(`${API_BASE_URL}/api/clients/${id}`, {
                    method: 'DELETE',
                });
                Swal.fire({ icon: 'success', title: 'Client Entity deleted!' });
                navigate('/apps/client-database');
            } catch (error) {
                console.error('Error deleting client entity:', error);
                Swal.fire({ icon: 'error', title: 'Failed to delete client entity' });
            }
        }
    };

    const fetchAssociatedContacts = async () => {
        try {
            if (!clientEntity?.contactIds?.length) {
                setAssociatedContacts([]);
                return;
            }

            const contactPromises = clientEntity.contactIds.map(async (contactId: string) => {
                const res = await fetch(`${API_BASE_URL}/api/contacts/${contactId}`);
                if (res.ok) {
                    return res.json();
                }
                return null;
            });

            const contacts = await Promise.all(contactPromises);
            setAssociatedContacts(contacts.filter(contact => contact !== null));
        } catch (error) {
            console.error('Error fetching associated contacts:', error);
            setAssociatedContacts([]);
        }
    };

    useEffect(() => {
        if (activeTab === 'contacts') {
            fetchAssociatedContacts();
        }
    }, [activeTab]);

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    if (!clientEntity) {
        return <div className="flex items-center justify-center h-screen">Client Entity not found</div>;
    }

    return (
        <div className="max-w-4xl mx-auto mt-8">
            <div className="flex items-center justify-between mb-8">
                <button type="button" className="btn btn-outline-primary flex items-center gap-2" onClick={() => navigate('/apps/client-database')}>
                    <IconArrowLeft />
                    <span>Back to List</span>
                </button>
                <div className="flex gap-3">
                    {/* <button type="button" className="btn btn-outline-primary" onClick={() => navigate(`/apps/client-entity/${id}/edit`)}>
                        <IconEdit />
                        Edit
                    </button> */}
                    <button type="button" className="btn btn-outline-danger" onClick={handleDelete}>
                        <IconTrash />
                        Delete
                    </button>
                </div>
            </div>

            <div className="mb-5">
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <button
                        type="button"
                        className={`py-3 px-4 ${activeTab === 'details' ? 'border-b-2 border-primary' : ''}`}
                        onClick={() => setActiveTab('details')}
                    >
                        Details
                    </button>
                    <button
                        type="button"
                        className={`py-3 px-4 ${activeTab === 'services' ? 'border-b-2 border-primary' : ''}`}
                        onClick={() => setActiveTab('services')}
                    >
                        Service Subscribed
                    </button>
                    <button
                        type="button"
                        className={`py-3 px-4 ${activeTab === 'industry' ? 'border-b-2 border-primary' : ''}`}
                        onClick={() => setActiveTab('industry')}
                    >
                        Industry
                    </button>
                    <button
                        type="button"
                        className={`py-3 px-4 ${activeTab === 'contacts' ? 'border-b-2 border-primary' : ''}`}
                        onClick={() => setActiveTab('contacts')}
                    >
                        Contacts
                    </button>
                    <button
                        type="button"
                        className={`py-3 px-4 ${activeTab === 'links' ? 'border-b-2 border-primary' : ''}`}
                        onClick={() => setActiveTab('links')}
                    >
                        Links
                    </button>
                </div>
            </div>

            {activeTab === 'details' && (
                <form className={sectionClass} onSubmit={handleUpdate}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        {/* Basic Information */}
                        <div className="col-span-2">
                            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                <IconUser />
                                Basic Information
                            </h3>
                        </div>

                        <div>
                            <span className={labelClass}>Name</span>
                            <input 
                                name="name" 
                                className="form-input mt-1 w-full" 
                                value={clientEntity.name || ''} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>

                        <div>
                            <span className={labelClass}>Structure</span>
                            <select 
                                name="structure" 
                                className="form-select mt-1 w-full" 
                                value={clientEntity.structure || ''} 
                                onChange={handleChange} 
                                required 
                            >
                                <option value="">Select Structure</option>
                                <option value="Ind">Individual</option>
                                <option value="Corp">Corporation</option>
                                <option value="Charity">Charity</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <span className={labelClass}>Link Type</span>
                            <select 
                                name="linkType" 
                                className="form-select mt-1 w-full" 
                                value={clientEntity.linkType || ''} 
                                onChange={handleChange}
                            >
                                <option value="">Select Link Type</option>
                                {linkTypes.map((type) => (
                                    <option key={type.id} value={type.entity}>
                                        {type.entity}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <span className={labelClass}>Client Group</span>
                            <select
                                name="clientGroupId"
                                className="form-select mt-1 w-full"
                                value={clientEntity.clientGroupId || ''}
                                onChange={handleChange}
                            >
                                <option value="">Select Client Group</option>
                                {clientGroups.map(group => (
                                    <option key={group.id} value={group.id}>
                                        {group.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <span className={labelClass}>Jurisdiction</span>
                            <input 
                                name="jurisdiction" 
                                className="form-input mt-1 w-full" 
                                value={clientEntity.jurisdiction || ''} 
                                onChange={handleChange} 
                            />
                        </div>

                        <div>
                            <span className={labelClass}>Registration ID</span>
                            <input 
                                name="regId" 
                                className="form-input mt-1 w-full" 
                                value={clientEntity.regId || ''} 
                                onChange={handleChange} 
                            />
                        </div>

                        <div>
                            <span className={labelClass}>Year End</span>
                            <input 
                                name="yearEnd" 
                                type="date" 
                                className="form-input mt-1 w-full" 
                                value={clientEntity.yearEnd || ''} 
                                onChange={handleChange} 
                            />
                        </div>

                        <div>
                            <span className={labelClass}>Tax IDs</span>
                            <div className="mt-2 space-y-2">
                                {clientEntity.taxIds && clientEntity.taxIds.length > 0 ? (
                                    clientEntity.taxIds.map((taxId: any, index: number) => (
                                        <div key={taxId.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                            <div className="flex-1">
                                                <div className="text-sm font-medium">{taxId.type}</div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">{taxId.number}</div>
                                                {taxId.description && (
                                                    <div className="text-xs text-gray-500 dark:text-gray-500">{taxId.description}</div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-gray-500 dark:text-gray-400">No tax IDs added</div>
                                )}
                            </div>
                        </div>

                        <div>
                            <span className={labelClass}>Status</span>
                            <select 
                                name="status" 
                                className="form-select mt-1 w-full" 
                                value={clientEntity.status || ''} 
                                onChange={handleChange}
                            >
                                <option value="">Select Status</option>
                                <option value="Prospect">Prospect</option>
                                <option value="Current">Current</option>
                                <option value="Dormant">Dormant</option>
                                <option value="Ceased">Ceased</option>
                            </select>
                        </div>

                        <div className={dividerClass}></div>

                        {/* Service Information */}
                        <div className="col-span-2">
                            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                <IconSettings />
                                Service Information
                            </h3>
                        </div>

                        <div>
                            <span className={labelClass}>Service Start Date</span>
                            <input 
                                name="serviceStartDate" 
                                type="date" 
                                className="form-input mt-1 w-full" 
                                value={clientEntity.serviceStartDate || ''} 
                                onChange={handleChange} 
                            />
                        </div>

                        <div>
                            <span className={labelClass}>Service End Date</span>
                            <input 
                                name="serviceEndDate" 
                                type="date" 
                                className="form-input mt-1 w-full" 
                                value={clientEntity.serviceEndDate || ''} 
                                onChange={handleChange} 
                            />
                        </div>

                        <div>
                            <span className={labelClass}>Accounting System</span>
                            <select 
                                name="accountingSystem" 
                                className="form-select mt-1 w-full" 
                                value={clientEntity.accountingSystem || ''} 
                                onChange={handleChange}
                            >
                                <option value="">Select Accounting System</option>
                                <option value="Xero">Xero</option>
                                <option value="QBO">QBO</option>
                                <option value="None">None</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <span className={labelClass}>Service Level</span>
                            <select 
                                name="serviceLevel" 
                                className="form-select mt-1 w-full" 
                                value={clientEntity.serviceLevel || ''} 
                                onChange={handleChange}
                            >
                                <option value="">Select Service Level</option>
                                <option value="Premium">Premium</option>
                                <option value="Standard">Standard</option>
                                <option value="Basic">Basic</option>
                                <option value="Self-Service">Self-Service</option>
                            </select>
                        </div>

                        <div>
                            <span className={labelClass}>Service Types</span>
                            <div className="mt-2 space-y-2">
                                {clientEntity.serviceTypes && clientEntity.serviceTypes.length > 0 ? (
                                    clientEntity.serviceTypes.map((serviceTypeId: string) => {
                                        const serviceType = serviceTypes.find(st => st.id === serviceTypeId);
                                        return serviceType ? (
                                            <div key={serviceType.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium text-primary">{serviceType.name}</div>
                                                </div>
                                            </div>
                                        ) : null;
                                    })
                                ) : (
                                    <div className="text-gray-500 dark:text-gray-400">No service types selected</div>
                                )}
                            </div>
                            <select
                                name="serviceTypes"
                                className="form-select mt-2 w-full"
                                multiple
                                value={clientEntity.serviceTypes || []}
                                onChange={handleChange}
                            >
                                {serviceTypes.map(serviceType => (
                                    <option key={serviceType.id} value={serviceType.id}>
                                        {serviceType.name}
                                    </option>
                                ))}
                            </select>
                            <small className="text-gray-500">Hold Ctrl/Cmd to select multiple services</small>
                        </div>

                        <div className={dividerClass}></div>

                        {/* Staff Information */}
                        <div className="col-span-2">
                            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                <IconSettings />
                                Staff Information
                            </h3>
                        </div>

                        <div>
                            <span className={labelClass}>Partner</span>
                            <select
                                name="staffPartnerId"
                                className="form-select mt-1 w-full"
                                value={clientEntity.staffPartnerId || ''}
                                onChange={handleChange}
                            >
                                <option value="">Select Partner</option>
                                {staffUsers.map((user: any) => (
                                    <option key={user.id} value={user.id}>
                                        {`${user.first_name} ${user.last_name}`}
                                    </option>
                                ))}
                                {invitations.map((inv: any) => (
                                    <option key={inv.id} value={inv.id}>
                                        {inv.email} (Pending)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <span className={labelClass}>Manager 1</span>
                            <select
                                name="staffManager1Id"
                                className="form-select mt-1 w-full"
                                value={clientEntity.staffManager1Id || ''}
                                onChange={handleChange}
                            >
                                <option value="">Select Manager</option>
                                {staffUsers.map((user: any) => (
                                    <option key={user.id} value={user.id}>
                                        {`${user.first_name} ${user.last_name}`}
                                    </option>
                                ))}
                                {invitations.map((inv: any) => (
                                    <option key={inv.id} value={inv.id}>
                                        {inv.email} (Pending)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <span className={labelClass}>Manager 2</span>
                            <select
                                name="staffManager2Id"
                                className="form-select mt-1 w-full"
                                value={clientEntity.staffManager2Id || ''}
                                onChange={handleChange}
                            >
                                <option value="">Select Manager</option>
                                {staffUsers.map((user: any) => (
                                    <option key={user.id} value={user.id}>
                                        {`${user.first_name} ${user.last_name}`}
                                    </option>
                                ))}
                                {invitations.map((inv: any) => (
                                    <option key={inv.id} value={inv.id}>
                                        {inv.email} (Pending)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <span className={labelClass}>Tax Specialist</span>
                            <select
                                name="staffTaxSpecialistId"
                                className="form-select mt-1 w-full"
                                value={clientEntity.staffTaxSpecialistId || ''}
                                onChange={handleChange}
                            >
                                <option value="">Select Tax Specialist</option>
                                {staffUsers.map((user: any) => (
                                    <option key={user.id} value={user.id}>
                                        {`${user.first_name} ${user.last_name}`}
                                    </option>
                                ))}
                                {invitations.map((inv: any) => (
                                    <option key={inv.id} value={inv.id}>
                                        {inv.email} (Pending)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <span className={labelClass}>Bookkeeper 1</span>
                            <select
                                name="staffBookkeeper1Id"
                                className="form-select mt-1 w-full"
                                value={clientEntity.staffBookkeeper1Id || ''}
                                onChange={handleChange}
                            >
                                <option value="">Select Bookkeeper</option>
                                {staffUsers.map((user: any) => (
                                    <option key={user.id} value={user.id}>
                                        {`${user.first_name} ${user.last_name}`}
                                    </option>
                                ))}
                                {invitations.map((inv: any) => (
                                    <option key={inv.id} value={inv.id}>
                                        {inv.email} (Pending)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <span className={labelClass}>Bookkeeper 2</span>
                            <select
                                name="staffBookkeeper2Id"
                                className="form-select mt-1 w-full"
                                value={clientEntity.staffBookkeeper2Id || ''}
                                onChange={handleChange}
                            >
                                <option value="">Select Bookkeeper</option>
                                {staffUsers.map((user: any) => (
                                    <option key={user.id} value={user.id}>
                                        {`${user.first_name} ${user.last_name}`}
                                    </option>
                                ))}
                                {invitations.map((inv: any) => (
                                    <option key={inv.id} value={inv.id}>
                                        {inv.email} (Pending)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <span className={labelClass}>Admin 1</span>
                            <select
                                name="staffAdmin1Id"
                                className="form-select mt-1 w-full"
                                value={clientEntity.staffAdmin1Id || ''}
                                onChange={handleChange}
                            >
                                <option value="">Select Admin</option>
                                {staffUsers.map((user: any) => (
                                    <option key={user.id} value={user.id}>
                                        {`${user.first_name} ${user.last_name}`}
                                    </option>
                                ))}
                                {invitations.map((inv: any) => (
                                    <option key={inv.id} value={inv.id}>
                                        {inv.email} (Pending)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <span className={labelClass}>Admin 2</span>
                            <select
                                name="staffAdmin2Id"
                                className="form-select mt-1 w-full"
                                value={clientEntity.staffAdmin2Id || ''}
                                onChange={handleChange}
                            >
                                <option value="">Select Admin</option>
                                {staffUsers.map((user: any) => (
                                    <option key={user.id} value={user.id}>
                                        {`${user.first_name} ${user.last_name}`}
                                    </option>
                                ))}
                                {invitations.map((inv: any) => (
                                    <option key={inv.id} value={inv.id}>
                                        {inv.email} (Pending)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={dividerClass}></div>

                        {/* Industry Information */}
                        <div className="col-span-2">
                            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                <IconInfoCircle />
                                Industry Information
                            </h3>
                        </div>

                        <div>
                            <span className={labelClass}>Industry</span>
                            <select
                                name="industryId"
                                className="form-select mt-1 w-full"
                                value={clientEntity.industryId || ''}
                                onChange={handleChange}
                            >
                                <option value="">Select Industry</option>
                                {industries.map(industry => (
                                    <option key={industry.id} value={industry.id}>
                                        {industry.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <span className={labelClass}>Service Level</span>
                            <select 
                                name="serviceLevel" 
                                className="form-select mt-1 w-full" 
                                value={clientEntity.serviceLevel || ''} 
                                onChange={handleChange}
                            >
                                <option value="">Select Service Level</option>
                                <option value="Premium">Premium</option>
                                <option value="Standard">Standard</option>
                                <option value="Basic">Basic</option>
                                <option value="Self-Service">Self-Service</option>
                            </select>
                        </div>

                        <div className={dividerClass}></div>

                        {/* Additional Information */}
                        <div className="col-span-2">
                            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                <IconInfoCircle />
                                Additional Information
                            </h3>
                        </div>

                        <div className="col-span-2">
                            <span className={labelClass}>Comments</span>
                            <textarea 
                                name="comments" 
                                className="form-textarea mt-1 w-full" 
                                rows={4}
                                value={clientEntity.comments || ''} 
                                onChange={handleChange} 
                            />
                        </div>

                        <div>
                            <span className={labelClass}>Created At</span>
                            <div className={valueClass}>
                                {new Date(clientEntity.createdAt).toLocaleString()}
                            </div>
                        </div>

                        <div>
                            <span className={labelClass}>Updated At</span>
                            <div className={valueClass}>
                                {new Date(clientEntity.updatedAt).toLocaleString()}
                            </div>
                        </div>

                        <div className="mb-5">
                            <span className={labelClass}>Contacts</span>
                            <select
                                name="contactIds"
                                className="form-select mt-1 w-full"
                                multiple
                                value={clientEntity.contactIds || []}
                                onChange={handleChange}
                            >
                                {contacts.map(contact => (
                                    <option key={contact.id} value={contact.id}>
                                        {contact.firstName} {contact.lastName} ({contact.title})
                                    </option>
                                ))}
                            </select>
                            <small className="text-gray-500">Hold Ctrl/Cmd to select multiple contacts</small>
                        </div>
                    </div>

                    <div className="flex justify-end mt-8">
                        <button type="submit" className="btn btn-primary" disabled={isUpdating}>
                            {isUpdating ? 'Updating...' : 'Update'}
                        </button>
                    </div>
                </form>
            )}

            {activeTab === 'services' && (
                <div className={sectionClass + ' p-0'}>
                    <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                            <div className="text-primary text-xl"><IconSettings /></div>
                            <h3 className="text-xl font-semibold text-primary">Service Subscribed</h3>
                        </div>
                        {/* <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => navigate('/apps/services-subscribed/add')}
                        >
                            <IconUserPlus />
                            Add Service
                        </button> */}
                    </div>
                    <div className="overflow-x-auto p-6">
                        <table className="min-w-full bg-white dark:bg-[#181f2c] rounded-lg shadow divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-[#232b3b]">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase">Service Type</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase">Frequency</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase">Start Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clientEntity.subscribedServices && clientEntity.subscribedServices.length > 0 ? (
                                    clientEntity.subscribedServices.map((service: any) => (
                                        <tr 
                                            key={service.id} 
                                            className="transition hover:bg-primary/10 cursor-pointer"
                                            onClick={() => navigate(`/apps/services-subscribed/edit/${service.id}`)}
                                        >
                                            <td className="px-4 py-3 font-medium text-primary hover:underline">{service.type.name}</td>
                                            <td className="px-4 py-3">{service.frequency}</td>
                                            <td className="px-4 py-3">{service.serviceStartDate ? new Date(service.serviceStartDate).toLocaleDateString() : 'N/A'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="text-center py-8">No services assigned</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'industry' && (
                <div className={sectionClass + ' p-0'}>
                    <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                            <div className="text-primary text-xl"><IconInfoCircle /></div>
                            <h3 className="text-xl font-semibold text-primary">Industry Information</h3>
                        </div>
                        {/* <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => navigate('/apps/industry/add')}
                        >
                            <IconUserPlus />
                            Add Industry
                        </button> */}
                    </div>
                    <div className="p-6">
                        {clientEntity.industry ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <span className={labelClass}>Industry Name</span>
                                    <button
                                        type="button"
                                        onClick={() => navigate(`/apps/industry/${clientEntity.industryId}`)}
                                        className="block text-primary hover:underline cursor-pointer"
                                    >
                                        {clientEntity.industry.name}
                                    </button>
                                </div>
                                <div>
                                    <span className={labelClass}>Description</span>
                                    <p className={valueClass}>{clientEntity.industryDescription || 'N/A'}</p>
                                </div>
                                <div>
                                    <span className={labelClass}>Status</span>
                                    <p className={valueClass}>{clientEntity.industryActive ? 'Active' : 'Inactive'}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">No industry information available</div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'contacts' && (
                <div className={sectionClass + ' p-0'}>
                    <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                            <div className="text-primary text-xl"><IconUser /></div>
                            <h3 className="text-xl font-semibold text-primary">Associated Contacts</h3>
                        </div>
                    </div>
                    <div className="overflow-x-auto p-6">
                        <table className="min-w-full bg-white dark:bg-[#181f2c] rounded-lg shadow divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-[#232b3b]">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase">Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase">Title</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase">Email</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase">Phone</th>
                                </tr>
                            </thead>
                            <tbody>
                                {associatedContacts.length > 0 ? (
                                    associatedContacts.map((contact) => (
                                        <tr key={contact.id} className="transition hover:bg-primary/10">
                                            <td className="px-4 py-3">
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(`/apps/contacts/view/${contact.id}`)}
                                                    className="text-primary hover:underline"
                                                >
                                                    {contact.firstName} {contact.lastName}
                                                </button>
                                            </td>
                                            <td className="px-4 py-3">{contact.title || 'N/A'}</td>
                                            <td className="px-4 py-3">
                                                {contact.email || 'N/A'}
                                            </td>
                                            <td className="px-4 py-3">
                                                {contact.phone || 'N/A'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="text-center py-8">No contacts found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'links' && (
                <div className={sectionClass + ' p-0'}>
                    <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                            <div className="text-primary text-xl"><IconLink /></div>
                            <h3 className="text-xl font-semibold text-primary">Links</h3>
                        </div>
                    </div>
                    <div className="overflow-x-auto p-6">
                        <table className="min-w-full bg-white dark:bg-[#181f2c] rounded-lg shadow divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-[#232b3b]">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase">Entity</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase">Link Type</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase">URL</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase">Show To Client</th>
                                </tr>
                            </thead>
                            <tbody>
                                {links.length > 0 ? (
                                    links.map((link) => (
                                        <tr key={link.id} className="transition hover:bg-primary/10">
                                            <td className="px-4 py-3">{link.entity}</td>
                                            <td className="px-4 py-3">{link.linkType}</td>
                                            <td className="px-4 py-3">
                                                <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                                    {link.url}
                                                </a>
                                            </td>
                                            <td className="px-4 py-3">{link.showToClient ? 'Yes' : 'No'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="text-center py-8">No links found for this entity type</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add/Edit Link Modal */}
            <Transition appear show={addLinkModal} as={Fragment}>
                <Dialog as="div" open={addLinkModal} onClose={() => setAddLinkModal(false)} className="relative z-[51]">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-[black]/60" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center px-4 py-8">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg text-black dark:text-white-dark">
                                    <button
                                        type="button"
                                        onClick={() => setAddLinkModal(false)}
                                        className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                                    >
                                        <IconX />
                                    </button>
                                    <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                                        {selectedLink.id ? 'Edit Link' : 'Add Link'}
                                    </div>
                                    <div className="p-5">
                                        <form onSubmit={(e) => { e.preventDefault(); saveLink(); }}>
                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="mb-5">
                                                    <label htmlFor="entity">Entity</label>
                                                    <input
                                                        id="entity"
                                                        name="entity"
                                                        type="text"
                                                        placeholder="Enter Entity"
                                                        className="form-input"
                                                        value={selectedLink.entity}
                                                        onChange={handleLinkChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="linkType">Link Type</label>
                                                    <input
                                                        id="linkType"
                                                        name="linkType"
                                                        type="text"
                                                        placeholder="Enter Link Type"
                                                        className="form-input"
                                                        value={selectedLink.linkType}
                                                        onChange={handleLinkChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="url">URL</label>
                                                    <input
                                                        id="url"
                                                        name="url"
                                                        type="url"
                                                        placeholder="Enter URL"
                                                        className="form-input"
                                                        value={selectedLink.url}
                                                        onChange={handleLinkChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="mb-5">
                                                    <label className="inline-flex">
                                                        <input
                                                            type="checkbox"
                                                            name="showToClient"
                                                            className="form-checkbox"
                                                            checked={selectedLink.showToClient}
                                                            onChange={handleLinkChange}
                                                        />
                                                        <span className="text-white-dark">Show To Client</span>
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="flex justify-end items-center mt-8">
                                                <button type="button" className="btn btn-outline-danger" onClick={() => setAddLinkModal(false)}>
                                                    Cancel
                                                </button>
                                                <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                                                    {selectedLink.id ? 'Update' : 'Create'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default ClientEntityView; 