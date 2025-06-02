import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setPageTitle } from '../../store/themeConfigSlice';
import Swal from 'sweetalert2';
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

const AddLinkType = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [link, setLink] = useState({ ...defaultLink });

    useEffect(() => {
        dispatch(setPageTitle('Add Link Type'));
    }, []);

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
            await fetch(`${API_BASE_URL}/api/links`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(link),
            });
            Swal.fire({ icon: 'success', title: 'Link created!' });
            navigate('/apps/new-link-types');
        } catch (error) {
            console.error(error);
            Swal.fire({ icon: 'error', title: 'Failed to create link' });
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl">Add Link Type</h2>
            </div>
            <div className="panel mt-5">
                <form onSubmit={e => { e.preventDefault(); saveLink(); }}>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="mb-5">
                            <label htmlFor="entity">Entity</label>
                            <input id="entity" name="entity" type="text" placeholder="Enter Entity" className="form-input" value={link.entity} onChange={handleChange} required />
                        </div>
                        <div className="mb-5">
                            <label htmlFor="linkType">Link Type</label>
                            <input id="linkType" name="linkType" type="text" placeholder="Enter Link Type" className="form-input" value={link.linkType} onChange={handleChange} required />
                        </div>
                        <div className="mb-5">
                            <label htmlFor="url">URL</label>
                            <input id="url" name="url" type="url" placeholder="Enter URL" className="form-input" value={link.url} onChange={handleChange} required />
                        </div>
                        <div className="mb-5">
                            <label htmlFor="showToClient">Show To Client</label>
                            <input id="showToClient" name="showToClient" type="checkbox" className="form-checkbox" checked={link.showToClient} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="flex justify-end items-center mt-8">
                        <button type="button" className="btn btn-outline-danger" onClick={() => navigate('/apps/new-link-types')}>
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

export default AddLinkType; 