import { useState, Fragment, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import { useNavigate } from 'react-router-dom';
import IconUserPlus from '../../components/Icon/IconUserPlus';
import IconListCheck from '../../components/Icon/IconListCheck';
import IconLayoutGrid from '../../components/Icon/IconLayoutGrid';
import IconSearch from '../../components/Icon/IconSearch';
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
    createdAt: string;
    updatedAt: string;
}

const dummyContact: Contact = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    title: 'Manager',
    emails: [
        { address: 'john@example.com', description: 'Work', isDefault: true },
        { address: 'jdoe@work.com', description: 'Personal', isDefault: false }
    ],
    phones: [
        { number: '+1234567890', description: 'Work', isDefault: true, isSmsDefault: true },
        { number: '+0987654321', description: 'Mobile', isDefault: false, isSmsDefault: false }
    ],
    dob: '1990-01-01',
    permissions: 'admin,edit',
    comments: 'Sample contact',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

const Contacts = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    useEffect(() => {
        dispatch(setPageTitle('Contacts Management'));
        fetchContacts();
    }, []);

    const [viewMode, setViewMode] = useState('list');
    const [contacts, setContacts] = useState<Contact[]>([dummyContact]);
    const [filteredItems, setFilteredItems] = useState<Contact[]>([dummyContact]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        setFilteredItems(
            contacts.filter((item) =>
                (item.firstName || '').toLowerCase().includes(search.toLowerCase()) ||
                (item.lastName || '').toLowerCase().includes(search.toLowerCase()) ||
                (item.title || '').toLowerCase().includes(search.toLowerCase()) ||
                item.emails.some(email => email.address.toLowerCase().includes(search.toLowerCase()))
            )
        );
    }, [search, contacts]);

    const fetchContacts = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/contacts`);
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                setContacts(data as Contact[]);
                setFilteredItems(data as Contact[]);
            } else {
                setContacts([dummyContact]);
                setFilteredItems([dummyContact]);
            }
        } catch (error) {
            console.error(error);
            setContacts([dummyContact]);
            setFilteredItems([dummyContact]);
        }
    };

    const editContact = (item: Contact) => {
        navigate(`/apps/contacts/edit/${item.id}`);
    };

    const viewContact = (item: Contact) => {
        navigate(`/apps/contacts/view/${item.id}`);
    };

    return (
        <div>
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl">Contacts Management</h2>
                <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                    <div className="flex gap-3">
                        <div>
                            <button type="button" className="btn btn-primary" onClick={() => navigate('/apps/contacts/add')}>
                                <IconUserPlus className="ltr:mr-2 rtl:ml-2" />
                                Add Contact
                            </button>
                        </div>
                        <div>
                            <button type="button" className={`btn btn-outline-primary p-2 ${viewMode === 'list' ? 'bg-primary text-white' : ''}`} onClick={() => setViewMode('list')}>
                                <IconListCheck />
                            </button>
                        </div>
                        <div>
                            <button type="button" className={`btn btn-outline-primary p-2 ${viewMode === 'grid' ? 'bg-primary text-white' : ''}`} onClick={() => setViewMode('grid')}>
                                <IconLayoutGrid />
                            </button>
                        </div>
                    </div>
                    <div className="relative">
                        <input type="text" placeholder="Search Contacts" className="form-input py-2 ltr:pr-11 rtl:pl-11 peer" value={search} onChange={(e) => setSearch(e.target.value)} />
                        <button type="button" className="absolute ltr:right-[11px] rtl:left-[11px] top-1/2 -translate-y-1/2 peer-focus:text-primary">
                            <IconSearch className="mx-auto" />
                        </button>
                    </div>
                </div>
            </div>
            {viewMode === 'list' && (
                <div className="mt-5 panel p-0 border-0 overflow-hidden">
                    <div className="table-responsive">
                        <table className="table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>First Name</th>
                                    <th>Last Name</th>
                                    <th>Title</th>
                                    <th>Emails</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-8">No Data found.</td>
                                    </tr>
                                ) : (
                                    filteredItems.map((item) => (
                                        <tr key={item.id}>
                                            <td>
                                                <button 
                                                    type="button" 
                                                    className="text-primary hover:underline" 
                                                    onClick={() => viewContact(item)}
                                                >
                                                    {item.firstName}
                                                </button>
                                            </td>
                                            <td>{item.lastName}</td>
                                            <td>{item.title}</td>
                                            <td>
                                                {item.emails.length > 0 ? (
                                                    <div className="space-y-1">
                                                        {item.emails.map((email, index) => (
                                                            <div key={index} className="flex items-center gap-2">
                                                                <span>{email.address}</span>
                                                                {email.description && (
                                                                    <span className="text-xs text-gray-500">({email.description})</span>
                                                                )}
                                                                {email.isDefault && (
                                                                    <span className="text-xs text-primary">[Default]</span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    'No emails'
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {viewMode === 'grid' && (
                <div className="grid 2xl:grid-cols-4 xl:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6 mt-5 w-full">
                    {filteredItems.length === 0 ? (
                        <div className="col-span-full text-center py-8 w-full">No Data found.</div>
                    ) : (
                        filteredItems.map((item) => (
                            <div className="bg-white dark:bg-[#1c232f] rounded-md overflow-hidden text-center shadow relative" key={item.id}>
                                <div className="p-6">
                                    <div className="text-xl">{item.firstName} {item.lastName}</div>
                                    <div className="text-white-dark">{item.title}</div>
                                    <div className="mt-2">
                                        <div className="font-semibold">Emails:</div>
                                        <div className="text-sm space-y-1">
                                            {item.emails.length > 0 ? (
                                                item.emails.map((email, index) => (
                                                    <div key={index} className="flex items-center justify-center gap-2">
                                                        <span>{email.address}</span>
                                                        {email.description && (
                                                            <span className="text-xs text-gray-500">({email.description})</span>
                                                        )}
                                                        {email.isDefault && (
                                                            <span className="text-xs text-primary">[Default]</span>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                'No emails'
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-6 flex gap-4">
                                        <button type="button" className="btn btn-outline-primary w-1/2" onClick={() => viewContact(item)}>
                                            View
                                        </button>
                                        <button type="button" className="btn btn-outline-secondary w-1/2" onClick={() => editContact(item)}>
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default Contacts;