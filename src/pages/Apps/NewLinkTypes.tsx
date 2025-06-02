import { useState, Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Swal from 'sweetalert2';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconUserPlus from '../../components/Icon/IconUserPlus';
import IconListCheck from '../../components/Icon/IconListCheck';
import IconLayoutGrid from '../../components/Icon/IconLayoutGrid';
import IconSearch from '../../components/Icon/IconSearch';
import IconX from '../../components/Icon/IconX';
import { API_BASE_URL } from '../../constants';

const defaultLink = {
    id: '',
    entity: '',
    linkType: '',
    url: '',
    showToClient: false,
    createdAt: '',
    updatedAt: '',
};

const dummyLink = {
    id: '1',
    entity: 'Practice',
    linkType: 'Website',
    url: 'https://example.com',
    showToClient: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

const NewLinkTypes = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    useEffect(() => {
        dispatch(setPageTitle('Link Types Management'));
        fetchLinks();
    }, []);

    const [viewMode, setViewMode] = useState('list');
    const [link, setLink] = useState({ ...defaultLink });
    const [links, setLinks] = useState<any[]>([dummyLink]);
    const [filteredItems, setFilteredItems] = useState<any[]>([dummyLink]);
    const [search, setSearch] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [isViewMode, setIsViewMode] = useState(false);
    const [editModal, setEditModal] = useState(false);

    useEffect(() => {
        setFilteredItems(
            links.filter((item) =>
                (item.entity || '').toLowerCase().includes(search.toLowerCase()) ||
                (item.linkType || '').toLowerCase().includes(search.toLowerCase()) ||
                (item.url || '').toLowerCase().includes(search.toLowerCase())
            )
        );
    }, [search, links]);

    const fetchLinks = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/links`);
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                setLinks(data);
                setFilteredItems(data);
            } else {
                setLinks([dummyLink]);
                setFilteredItems([dummyLink]);
            }
        } catch (error) {
            console.error(error);
            setLinks([dummyLink]);
            setFilteredItems([dummyLink]);
        }
    };

    const handleChange = (e: any) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setLink((prev) => ({ ...prev, [name]: checked }));
        } else {
            setLink((prev) => ({ ...prev, [name]: value }));
        }
    };

    const saveLink = async () => {
        try {
            await fetch(`${API_BASE_URL}/api/links/${link.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(link),
            });
            Swal.fire({ icon: 'success', title: 'Link updated!' });
            setEditModal(false);
            setLink({ ...defaultLink });
            setIsEditMode(false);
            fetchLinks();
        } catch (error) {
            console.error(error);
            Swal.fire({ icon: 'error', title: 'Failed to update link' });
        }
    };

    const editLink = (item: any) => {
        setLink({ ...item });
        setIsEditMode(true);
        setIsViewMode(false);
        setEditModal(true);
    };

    const viewLink = (item: any) => {
        setLink({ ...item });
        setIsEditMode(true);
        setIsViewMode(true);
        setEditModal(true);
    };

    const deleteLink = async (id: string) => {
        // First confirmation
        const firstConfirm = await Swal.fire({
            title: 'Are you sure?',
            text: 'You are about to delete this link',
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
            confirmButtonText: 'Yes, delete link',
            cancelButtonText: 'No, cancel',
            confirmButtonColor: '#dc2626',
            padding: '2em',
        });

        if (!secondConfirm.isConfirmed) {
            return;
        }

        try {
            await fetch(`${API_BASE_URL}/api/links/${id}`, { method: 'DELETE' });
            Swal.fire({ icon: 'success', title: 'Link deleted!' });
            setEditModal(false);
            setLink({ ...defaultLink });
            setIsEditMode(false);
            fetchLinks();
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Failed to delete link' });
            console.error(error);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl">Link Types Management</h2>
                <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                    <div className="flex gap-3">
                        <div>
                            <button type="button" className="btn btn-primary" onClick={() => navigate('/apps/new-link-types/add')}>
                                <IconUserPlus className="ltr:mr-2 rtl:ml-2" />
                                Add Link
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
                        <input type="text" placeholder="Search Links" className="form-input py-2 ltr:pr-11 rtl:pl-11 peer" value={search} onChange={(e) => setSearch(e.target.value)} />
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
                                    <th>Entity</th>
                                    <th>Link Type</th>
                                    <th>URL</th>
                                    <th>Show To Client</th>
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
                                                    onClick={() => navigate(`/apps/new-link-types/${item.id}`)}
                                                >
                                                    {item.entity}
                                                </button>
                                            </td>
                                            <td>{item.linkType}</td>
                                            <td><a href={item.url} target="_blank" rel="noopener noreferrer">{item.url}</a></td>
                                            <td>{item.showToClient ? 'Yes' : 'No'}</td>
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
                                    <button 
                                        type="button" 
                                        className="text-xl text-primary hover:underline" 
                                        onClick={() => navigate(`/apps/new-link-types/${item.id}`)}
                                    >
                                        {item.entity}
                                    </button>
                                    <div className="text-white-dark">{item.linkType}</div>
                                    <div className="mt-2"><a href={item.url} target="_blank" rel="noopener noreferrer">{item.url}</a></div>
                                    <div className="mt-2">Show To Client: {item.showToClient ? 'Yes' : 'No'}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
            <Transition appear show={editModal} as={Fragment}>
                <Dialog as="div" open={editModal} onClose={() => setEditModal(false)} className="relative z-[51]">
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
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
                                        onClick={() => setEditModal(false)}
                                        className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                                    >
                                        <IconX />
                                    </button>
                                    <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                                        {isViewMode ? 'View Link' : 'Edit Link'}
                                    </div>
                                    <div className="p-5">
                                        <form onSubmit={e => { e.preventDefault(); saveLink(); }}>
                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="mb-5">
                                                    <label htmlFor="entity">Entity</label>
                                                    <input id="entity" name="entity" type="text" placeholder="Enter Entity" className="form-input" value={link.entity} onChange={handleChange} required disabled={isViewMode} />
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="linkType">Link Type</label>
                                                    <input id="linkType" name="linkType" type="text" placeholder="Enter Link Type" className="form-input" value={link.linkType} onChange={handleChange} required disabled={isViewMode} />
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="url">URL</label>
                                                    <input id="url" name="url" type="url" placeholder="Enter URL" className="form-input" value={link.url} onChange={handleChange} required disabled={isViewMode} />
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="showToClient">Show To Client</label>
                                                    <input id="showToClient" name="showToClient" type="checkbox" className="form-checkbox" checked={link.showToClient} onChange={handleChange} disabled={isViewMode} />
                                                </div>
                                            </div>
                                            <div className="flex justify-end items-center mt-8">
                                                <button type="button" className="btn btn-outline-danger" onClick={() => setEditModal(false)}>
                                                    {isViewMode ? 'Close' : 'Cancel'}
                                                </button>
                                                {!isViewMode && (
                                                    <>
                                                        <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                                                            Update
                                                        </button>
                                                        <button type="button" className="btn btn-danger ltr:ml-4 rtl:mr-4" onClick={() => deleteLink(link.id)}>
                                                            Delete
                                                        </button>
                                                    </>
                                                )}
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

export default NewLinkTypes; 