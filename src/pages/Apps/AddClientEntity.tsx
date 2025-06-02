import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../../constants';
import { fetchStaffUsers, StaffUser } from '../../services/staffService';
import axios from 'axios';
import { userService } from '../../services/userService';

interface ClientEntity {
    id: string;
    name: string;
    structure: string;
    clientGroupId: string;
    jurisdiction: string;
    regId: string;
    yearEnd: string;
    taxIds: TaxId[];
    status: string;
    serviceStartDate: string;
    serviceEndDate: string;
    staffPartnerId: string;
    staffManager1Id: string;
    staffManager2Id: string;
    staffAccountantIds: string;
    staffBookkeeper1Id: string;
    staffBookkeeper2Id: string;
    staffTaxSpecialistId: string;
    staffOther1Id: string;
    staffOther2Id: string;
    staffOther3Id: string;
    staffOther4Id: string;
    staffOther5Id: string;
    staffAdmin1Id: string;
    staffAdmin2Id: string;
    industryId: string;
    accountingSystem: string;
    serviceLevel: string;
    comments: string;
    createdAt: string;
    updatedAt: string;
    linkType: string;
    entity: string;
}

interface TaxId {
    id: string;
    type: string;
    number: string;
    description: string;
}

interface Invitation {
    id: string;
    email: string;
    level?: 'admin' | 'staff' | 'client' | '';
    status: 'pending' | 'accepted' | 'cancelled';
    created_at: string;
    updated_at: string;
}

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
}

const defaultClient: ClientEntity = {
    id: '',
    name: '',
    structure: '',
    clientGroupId: '',
    jurisdiction: '',
    regId: '',
    yearEnd: '',
    taxIds: [],
    status: '',
    serviceStartDate: '',
    serviceEndDate: '',
    staffPartnerId: '',
    staffManager1Id: '',
    staffManager2Id: '',
    staffAccountantIds: '',
    staffBookkeeper1Id: '',
    staffBookkeeper2Id: '',
    staffTaxSpecialistId: '',
    staffOther1Id: '',
    staffOther2Id: '',
    staffOther3Id: '',
    staffOther4Id: '',
    staffOther5Id: '',
    staffAdmin1Id: '',
    staffAdmin2Id: '',
    industryId: '',
    accountingSystem: '',
    serviceLevel: '',
    comments: '',
    createdAt: '',
    updatedAt: '',
    linkType: '',
    entity: '',
};

const AddClientEntity = () => {
    const navigate = useNavigate();
    const [selectedEntity, setSelectedEntity] = useState<ClientEntity>({ ...defaultClient });
    const [clientGroups, setClientGroups] = useState<any[]>([]);
    const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [serviceTypes, setServiceTypes] = useState<any[]>([]);
    const [selectedServiceTypes, setSelectedServiceTypes] = useState<string[]>([]);
    const [industries, setIndustries] = useState<any[]>([]);
    const [newTaxId, setNewTaxId] = useState<TaxId>({ id: '', type: '', number: '', description: '' });
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
    const [linkTypes, setLinkTypes] = useState<any[]>([]);

    useEffect(() => {
        fetchClientGroups();
        fetchStaffAndInvitations();
        fetchServiceTypes();
        fetchIndustries();
        fetchContacts();
        fetchLinkTypes();
    }, []);

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

    const fetchStaffAndInvitations = async () => {
        try {
            // Fetch both users and invitations
            const [users, invitationsResponse] = await Promise.all([
                userService.getAllUsers(),
                axios.get(`${API_BASE_URL}/api/invitation`)
            ]);

            // Convert User[] to StaffUser[] by ensuring id is a valid UUID
            setStaffUsers(Array.isArray(users) ? users.map(user => ({
                ...user,
                id: user.id // No need to convert since it's already a string/UUID
            })) : []);
            setInvitations(Array.isArray(invitationsResponse.data) ? invitationsResponse.data : []);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching staff users and invitations:', error);
            setStaffUsers([]);
            setInvitations([]);
            setIsLoading(false);
        }
    };

    const fetchServiceTypes = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/service-types`);
            const data = await res.json();
            // console.log("service types",data);
            
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
            console.log("industries",data);
            
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
            if (Array.isArray(data)) {
                setLinkTypes(data);
            }
        } catch (error) {
            console.error('Error fetching link types:', error);
        }
    };

    const handleEntityChange = (e: any) => {
        const { name, value } = e.target;
        setSelectedEntity((prev) => ({ ...prev, [name]: value }));
    };

    const handleServiceTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setSelectedServiceTypes(selectedOptions);
    };

    const handleIndustryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedEntity((prev: ClientEntity) => ({
            ...prev,
            industryId: e.target.value
        }));
    };

    const handleTaxIdChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewTaxId(prev => ({ ...prev, [name]: value }));
    };

    const addTaxId = () => {
        if (newTaxId.type && newTaxId.number) {
            setSelectedEntity(prev => ({
                ...prev,
                taxIds: [...prev.taxIds, { ...newTaxId, id: crypto.randomUUID() }]
            }));
            setNewTaxId({ id: '', type: '', number: '', description: '' });
        }
    };

    const removeTaxId = (id: string) => {
        setSelectedEntity(prev => ({
            ...prev,
            taxIds: prev.taxIds.filter(taxId => taxId.id !== id)
        }));
    };

    const handleContactChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setSelectedContacts(selectedOptions);
    };

    const saveClientEntity = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Remove id, createdAt, and updatedAt fields
            const { id, createdAt, updatedAt, ...entityWithoutSystemFields } = selectedEntity;
            const cleanedEntity = Object.entries(entityWithoutSystemFields).reduce((acc: any, [key, value]) => {
                // Handle date fields
                if (['yearEnd', 'serviceStartDate', 'serviceEndDate'].includes(key) && typeof value === 'string') {
                    acc[key] = value ? new Date(value).toISOString() : null;
                }
                // Convert empty strings to null for UUID fields
                else if (value === '' && (
                    key === 'clientGroupId' ||
                    key === 'staffPartnerId' ||
                    key === 'staffManager1Id' ||
                    key === 'staffManager2Id' ||
                    key === 'staffBookkeeper1Id' ||
                    key === 'staffBookkeeper2Id' ||
                    key === 'staffTaxSpecialistId' ||
                    key === 'staffOther1Id' ||
                    key === 'staffOther2Id' ||
                    key === 'staffOther3Id' ||
                    key === 'staffOther4Id' ||
                    key === 'staffOther5Id' ||
                    key === 'staffAdmin1Id' ||
                    key === 'staffAdmin2Id'
                )) {
                    acc[key] = null;
                } else {
                    acc[key] = value;
                }
                return acc;
            }, {});

            const entityData = {
                ...cleanedEntity,
                serviceTypes: selectedServiceTypes,
                contactIds: selectedContacts
            };

            await fetch(`${API_BASE_URL}/api/clients`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entityData),
            });
            
            Swal.fire({ icon: 'success', title: 'Client Entity created!' });
            navigate('/apps/client-database');
        } catch (error) {
            console.error(error);
            Swal.fire({ icon: 'error', title: 'Failed to save client entity' });
        }
    };

    console.log("industries",industries);
    

    const renderStaffDropdown = (fieldName: string, value: string, label: string) => (
        <div className="mb-5">
            <label htmlFor={fieldName}>{label}</label>
            <select
                id={fieldName}
                name={fieldName}
                className="form-select"
                value={value}
                onChange={handleEntityChange}
                disabled={isLoading}
            >
                <option value="">Select {label}</option>
                {/* Render active users */}
                {Array.isArray(staffUsers) && staffUsers.map(staff => (
                    <option key={staff.id} value={staff.id}>
                        {staff.first_name} {staff.last_name} ({staff.email})
                    </option>
                ))}
                {/* Render pending invitations */}
                {Array.isArray(invitations) && invitations
                    .filter(inv => inv.status === 'pending')
                    .map(inv => (
                        <option key={`${inv.id}`} value={`${inv.id}`}>
                            {inv.email} (Pending Invitation)
                        </option>
                    ))
                }
            </select>
        </div>
    );

    return (
        <div>
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl">Add Client Entity</h2>
            </div>

            <div className="panel mt-5">
                <form onSubmit={saveClientEntity}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="mb-5">
                            <label htmlFor="name">Name</label>
                            <input id="name" name="name" type="text" placeholder="Enter Name" className="form-input" value={selectedEntity.name} onChange={handleEntityChange} required />
                        </div>
                        <div className="mb-5">
                            <label htmlFor="structure">Structure</label>
                            <select
                                id="structure"
                                name="structure"
                                className="form-input"
                                value={selectedEntity.structure}
                                onChange={handleEntityChange}
                                required
                            >
                                <option value="">Select Structure</option>
                                <option value="Ind">Individual</option>
                                <option value="Corp">Corporation</option>
                                <option value="Charity">Charity</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="mb-5">
                            <label htmlFor="linkType">Link Type</label>
                            <select
                                id="linkType"
                                name="linkType"
                                className="form-input"
                                value={selectedEntity.linkType}
                                onChange={handleEntityChange}
                            >
                                <option value="">Select Link Type</option>
                                {linkTypes.map((type) => (
                                    <option key={type.id} value={type.entity}>
                                        {type.entity}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-5">
                            <label htmlFor="clientGroupId">Client Group</label>
                            <select
                                id="clientGroupId"
                                name="clientGroupId"
                                className="form-input"
                                value={selectedEntity.clientGroupId}
                                onChange={handleEntityChange}
                                required
                            >
                                <option value="">Select Client Group</option>
                                {clientGroups.map(group => (
                                    <option key={group.id} value={group.id}>{group.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-5">
                            <label htmlFor="jurisdiction">Jurisdiction</label>
                            <input id="jurisdiction" name="jurisdiction" type="text" placeholder="Enter Jurisdiction" className="form-input" value={selectedEntity.jurisdiction} onChange={handleEntityChange} required />
                        </div>
                        <div className="mb-5">
                            <label htmlFor="regId">Reg ID</label>
                            <input id="regId" name="regId" type="text" placeholder="Enter Reg ID" className="form-input" value={selectedEntity.regId} onChange={handleEntityChange} />
                        </div>
                        <div className="mb-5">
                            <label htmlFor="yearEnd">Year End</label>
                            <input id="yearEnd" name="yearEnd" type="date" className="form-input" value={selectedEntity.yearEnd} onChange={handleEntityChange} />
                        </div>
                        <div className="mb-5">
                            <label htmlFor="taxIds">Tax IDs</label>
                            <div className="border rounded-lg p-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                    <div>
                                        <select
                                            name="type"
                                            className="form-select"
                                            value={newTaxId.type}
                                            onChange={handleTaxIdChange}
                                        >
                                            <option value="">Select Type</option>
                                            <option value="Business Number">Business Number</option>
                                            <option value="Tax Number">Tax Number</option>
                                            <option value="GST/HST Number">GST/HST Number</option>
                                            <option value="Payroll Number">Payroll Number</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            name="number"
                                            className="form-input"
                                            placeholder="Enter Number"
                                            value={newTaxId.number}
                                            onChange={handleTaxIdChange}
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            name="description"
                                            className="form-input"
                                            placeholder="Description (optional)"
                                            value={newTaxId.description}
                                            onChange={handleTaxIdChange}
                                        />
                                    </div>
                                    <div>
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={addTaxId}
                                        >
                                            Add Tax ID
                                        </button>
                                    </div>
                                </div>
                                {selectedEntity.taxIds.length > 0 && (
                                    <div className="overflow-x-auto">
                                        <table className="table-striped">
                                            <thead>
                                                <tr>
                                                    <th>Type</th>
                                                    <th>Number</th>
                                                    <th>Description</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedEntity.taxIds.map((taxId) => (
                                                    <tr key={taxId.id}>
                                                        <td>{taxId.type}</td>
                                                        <td>{taxId.number}</td>
                                                        <td>{taxId.description}</td>
                                                        <td>
                                                            <button
                                                                type="button"
                                                                className="btn btn-danger btn-sm"
                                                                onClick={() => removeTaxId(taxId.id)}
                                                            >
                                                                Remove
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="mb-5">
                            <label htmlFor="status">Status</label>
                            <select
                                id="status"
                                name="status"
                                className="form-input"
                                value={selectedEntity.status}
                                onChange={handleEntityChange}
                                required
                            >
                                <option value="">Select Status</option>
                                <option value="Prospect">Prospect</option>
                                <option value="Current">Current</option>
                                <option value="Dormant">Dormant</option>
                                <option value="Ceased">Ceased</option>
                            </select>
                        </div>
                        <div className="mb-5">
                            <label htmlFor="serviceStartDate">Service Start Date</label>
                            <input id="serviceStartDate" name="serviceStartDate" type="date" className="form-input" value={selectedEntity.serviceStartDate} onChange={handleEntityChange} />
                        </div>
                        <div className="mb-5">
                            <label htmlFor="serviceEndDate">Service End Date</label>
                            <input id="serviceEndDate" name="serviceEndDate" type="date" className="form-input" value={selectedEntity.serviceEndDate} onChange={handleEntityChange} />
                        </div>
                        {renderStaffDropdown('staffPartnerId', selectedEntity.staffPartnerId, 'Staff Partner')}
                        {renderStaffDropdown('staffManager1Id', selectedEntity.staffManager1Id, 'Staff Manager 1')}
                        {renderStaffDropdown('staffManager2Id', selectedEntity.staffManager2Id, 'Staff Manager 2')}
                        {renderStaffDropdown('staffBookkeeper1Id', selectedEntity.staffBookkeeper1Id, 'Staff Bookkeeper 1')}
                        {renderStaffDropdown('staffBookkeeper2Id', selectedEntity.staffBookkeeper2Id, 'Staff Bookkeeper 2')}
                        {renderStaffDropdown('staffTaxSpecialistId', selectedEntity.staffTaxSpecialistId, 'Staff Tax Specialist')}
                        {renderStaffDropdown('staffOther1Id', selectedEntity.staffOther1Id, 'Staff Other 1')}
                        {renderStaffDropdown('staffOther2Id', selectedEntity.staffOther2Id, 'Staff Other 2')}
                        {renderStaffDropdown('staffOther3Id', selectedEntity.staffOther3Id, 'Staff Other 3')}
                        {renderStaffDropdown('staffOther4Id', selectedEntity.staffOther4Id, 'Staff Other 4')}
                        {renderStaffDropdown('staffOther5Id', selectedEntity.staffOther5Id, 'Staff Other 5')}
                        {renderStaffDropdown('staffAdmin1Id', selectedEntity.staffAdmin1Id, 'Staff Admin 1')}
                        {renderStaffDropdown('staffAdmin2Id', selectedEntity.staffAdmin2Id, 'Staff Admin 2')}
                        <div className="mb-5">
                            <label htmlFor="staffAccountantIds">Staff Accountants</label>
                            <select
                                id="staffAccountantIds"
                                name="staffAccountantIds"
                                className="form-input"
                                value={selectedEntity.staffAccountantIds}
                                onChange={handleEntityChange}
                                multiple
                                disabled={isLoading}
                            >
                                {/* Render active users */}
                                {Array.isArray(staffUsers) && staffUsers.map(staff => (
                                    <option key={staff.id} value={staff.id}>
                                        {staff.first_name} {staff.last_name} ({staff.email})
                                    </option>
                                ))}
                                {/* Render pending invitations */}
                                {Array.isArray(invitations) && invitations
                                    .filter(inv => inv.status === 'pending')
                                    .map(inv => (
                                        <option key={`inv_${inv.id}`} value={`inv_${inv.id}`}>
                                            {inv.email} (Pending Invitation)
                                        </option>
                                    ))
                                }
                            </select>
                            <small className="text-gray-500">Hold Ctrl/Cmd to select multiple accountants</small>
                        </div>
                        <div className="mb-5">
                            <label htmlFor="industryId">Industry</label>
                            <select
                                id="industryId"
                                name="industryId"
                                className="form-input"
                                value={selectedEntity.industryId}
                                onChange={handleIndustryChange}
                            >
                                <option value="">Select Industry</option>
                                {industries.map(industry => (
                                    <option key={industry.id} value={industry.id}>{industry.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-5">
                            <label htmlFor="accountingSystem">Accounting System</label>
                            <select
                                id="accountingSystem"
                                name="accountingSystem"
                                className="form-input"
                                value={selectedEntity.accountingSystem}
                                onChange={handleEntityChange}
                            >
                                <option value="">Select Accounting System</option>
                                <option value="Xero">Xero</option>
                                <option value="QBO">QBO</option>
                                <option value="None">None</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="mb-5">
                            <label htmlFor="serviceLevel">Service Level</label>
                            <select
                                id="serviceLevel"
                                name="serviceLevel"
                                className="form-input"
                                value={selectedEntity.serviceLevel}
                                onChange={handleEntityChange}
                            >
                                <option value="">Select Service Level</option>
                                <option value="Premium">Premium</option>
                                <option value="Standard">Standard</option>
                                <option value="Basic">Basic</option>
                                <option value="Self-Service">Self-Service</option>
                            </select>
                        </div>
                        <div className="mb-5">
                            <label htmlFor="serviceTypes">Service Types</label>
                            <select
                                id="serviceTypes"
                                name="serviceTypes"
                                className="form-input"
                                multiple
                                value={selectedServiceTypes}
                                onChange={handleServiceTypeChange}
                            >
                                {serviceTypes.map(serviceType => (
                                    <option key={serviceType.id} value={serviceType.id}>
                                        {serviceType.name}
                                    </option>
                                ))}
                            </select>
                            <small className="text-gray-500">Hold Ctrl/Cmd to select multiple services</small>
                        </div>
                        <div className="mb-5">
                            <label htmlFor="contacts">Contacts</label>
                            <select
                                id="contacts"
                                name="contacts"
                                className="form-input"
                                multiple
                                value={selectedContacts}
                                onChange={handleContactChange}
                            >
                                {contacts.map(contact => (
                                    <option key={contact.id} value={contact.id}>
                                        {contact.firstName} {contact.lastName} ({contact.title})
                                    </option>
                                ))}
                            </select>
                            <small className="text-gray-500">Hold Ctrl/Cmd to select multiple contacts</small>
                        </div>
                        <div className="mb-5 md:col-span-2">
                            <label htmlFor="comments">Comments</label>
                            <textarea id="comments" name="comments" className="form-input" value={selectedEntity.comments} onChange={handleEntityChange} />
                        </div>
                    </div>
                    <div className="flex justify-end items-center mt-8">
                        <button type="button" className="btn btn-outline-danger" onClick={() => navigate('/apps/client-database')}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddClientEntity; 