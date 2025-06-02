import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setPageTitle } from '../../store/themeConfigSlice';
import Swal from 'sweetalert2';
import IconArrowLeft from '../../components/Icon/IconArrowLeft';
import { API_ENDPOINTS } from '../../constants';

const defaultServiceSubscribed = {
    id: '',
    type: { id: '', name: '' },
    frequency: '',
    reportingDate: '',
    dueDate: '',
    nonBillable: false,
    packageBilled: false,
    mrr: '',
    serviceStartDate: '',
    serviceEndDate: '',
    createdAt: '',
    updatedAt: '',
};

const AddServiceSubscribed = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [serviceTypes, setServiceTypes] = useState<any[]>([]);
    const [serviceSubscribed, setServiceSubscribed] = useState({ ...defaultServiceSubscribed });

    useEffect(() => {
        dispatch(setPageTitle('Add Service Subscribed'));
        fetchServiceTypes();
    }, []);

    const frequencyOptions = [
        'Weekly',
        'Bi-weekly',
        'Semi-Monthly',
        'Monthly',
        'Quarterly',
        'Semi-Annual',
        'Annual',
        'Casual',
    ];

    const fetchServiceTypes = async () => {
        try {
            const res = await fetch(API_ENDPOINTS.SERVICE.TYPES);
            const data = await res.json();
            if (Array.isArray(data)) {
                setServiceTypes(data);
            }
        } catch (error) {
            console.error('Error fetching service types:', error);
        }
    };

    const handleChange = (e: any) => {
        const { name, value, type, checked } = e.target;
        if (name === 'type') {
            const selected = serviceTypes.find(st => st.id === value);
            setServiceSubscribed((prev) => ({ ...prev, type: selected ? { id: selected.id, name: selected.name } : { id: '', name: '' } }));
        } else if (type === 'checkbox') {
            setServiceSubscribed((prev) => ({ ...prev, [name]: checked }));
        } else {
            setServiceSubscribed((prev) => ({ ...prev, [name]: value }));
        }
    };

    const saveServiceSubscribed = async () => {
        try {
            await fetch(API_ENDPOINTS.SERVICE.SUBSCRIBED, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(serviceSubscribed),
            });
            Swal.fire({ icon: 'success', title: 'Service Subscribed created!' });
            navigate('/apps/services-subscribed');
        } catch (error) {
            console.error(error);
            Swal.fire({ icon: 'error', title: 'Failed to create service subscribed' });
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl">Add Service Subscribed</h2>
                <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                    <button type="button" className="btn btn-primary" onClick={() => navigate('/apps/services-subscribed')}>
                        <IconArrowLeft className="ltr:mr-2 rtl:ml-2" />
                        Back
                    </button>
                </div>
            </div>
            <div className="mt-5 panel">
                <form onSubmit={e => { e.preventDefault(); saveServiceSubscribed(); }}>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="mb-5">
                            <label htmlFor="type">Type</label>
                            <select
                                id="type"
                                name="type"
                                className="form-input"
                                value={serviceSubscribed.type?.id}
                                onChange={e => {
                                    const selected = serviceTypes.find(st => st.id === e.target.value);
                                    setServiceSubscribed(prev => ({ ...prev, type: selected ? { id: selected.id, name: selected.name } : { id: '', name: '' } }));
                                }}
                                required
                            >
                                <option value="">Select Service Type</option>
                                {serviceTypes.map(st => (
                                    <option key={st.id} value={st.id}>{st.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-5">
                            <label htmlFor="frequency">Frequency</label>
                            <select
                                id="frequency"
                                name="frequency"
                                className="form-input"
                                value={serviceSubscribed.frequency}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Frequency</option>
                                {frequencyOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-5">
                            <label htmlFor="reportingDate">Reporting Date</label>
                            <input id="reportingDate" name="reportingDate" type="date" className="form-input" value={serviceSubscribed.reportingDate} onChange={handleChange} />
                        </div>
                        <div className="mb-5">
                            <label htmlFor="dueDate">Due Date</label>
                            <input id="dueDate" name="dueDate" type="date" className="form-input" value={serviceSubscribed.dueDate} onChange={handleChange} />
                        </div>
                        <div className="mb-5">
                            <label htmlFor="nonBillable">Non-Billable</label>
                            <input id="nonBillable" name="nonBillable" type="checkbox" className="form-checkbox" checked={serviceSubscribed.nonBillable} onChange={handleChange} />
                        </div>
                        <div className="mb-5">
                            <label htmlFor="packageBilled">Package Billed</label>
                            <input id="packageBilled" name="packageBilled" type="checkbox" className="form-checkbox" checked={serviceSubscribed.packageBilled} onChange={handleChange} />
                        </div>
                        <div className="mb-5">
                            <label htmlFor="mrr">MRR</label>
                            <input id="mrr" name="mrr" type="number" placeholder="Enter MRR" className="form-input" value={serviceSubscribed.mrr} onChange={handleChange} />
                        </div>
                        <div className="mb-5">
                            <label htmlFor="serviceStartDate">Service Start Date</label>
                            <input id="serviceStartDate" name="serviceStartDate" type="date" className="form-input" value={serviceSubscribed.serviceStartDate} onChange={handleChange} />
                        </div>
                        <div className="mb-5">
                            <label htmlFor="serviceEndDate">Service End Date</label>
                            <input id="serviceEndDate" name="serviceEndDate" type="date" className="form-input" value={serviceSubscribed.serviceEndDate} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="flex justify-end items-center mt-8">
                        <button type="button" className="btn btn-outline-danger" onClick={() => navigate('/apps/services-subscribed')}>
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

export default AddServiceSubscribed; 