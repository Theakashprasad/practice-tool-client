import { useState, Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Swal from 'sweetalert2';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconUserPlus from '../../components/Icon/IconUserPlus';
import IconListCheck from '../../components/Icon/IconListCheck';
import IconLayoutGrid from '../../components/Icon/IconLayoutGrid';
import IconSearch from '../../components/Icon/IconSearch';
import IconUser from '../../components/Icon/IconUser';
import IconFacebook from '../../components/Icon/IconFacebook';
import IconInstagram from '../../components/Icon/IconInstagram';
import IconLinkedin from '../../components/Icon/IconLinkedin';
import IconTwitter from '../../components/Icon/IconTwitter';
import IconX from '../../components/Icon/IconX';
import { isAdmin } from '../../utils/authUtils';

const InviteStaff = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Contacts'));
    });
    const [addContactModal, setAddContactModal] = useState<any>(false);

    const [value, setValue] = useState<any>('list');
    const [defaultParams] = useState({
        id: null,
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        role: '',
        location: '',
        level: 'client',
        password_hash: '',
        reset_required: false,
        mfa_token: '',
        mfa_remember_until: null,
        google_id: null,
        active: true,
        created_at: new Date(),
        updated_at: new Date(),
    });
    const [params, setParams] = useState<any>(JSON.parse(JSON.stringify(defaultParams)));

    const changeValue = (e: any) => {
        const { value, id } = e.target;
        setParams({ ...params, [id]: value });
    };

    const [search, setSearch] = useState<any>('');
    const [contactList] = useState<any>([
        {
            id: 1,
            path: 'profile-35.png',
            first_name: 'Alan',
            last_name: 'Green',
            role: 'Web Developer',
            email: 'alan@mail.com',
            location: 'Boston, USA',
            phone: '+1 202 555 0197',
            level: 'client',
            password_hash: '*****',
            reset_required: false,
            mfa_token: '',
            mfa_remember_until: null,
            google_id: null,
            active: true,
            created_at: '2023-10-05 09:00:00',
            updated_at: '2023-10-05 09:00:00',
            posts: 25,
            followers: '5K',
            following: 500,
        },
        {
            id: 2,
            path: 'profile-35.png',
            first_name: 'Linda',
            last_name: 'Nelson',
            role: 'Web Designer',
            email: 'linda@mail.com',
            location: 'Sydney, Australia',
            phone: '+1 202 555 0170',
            level: 'staff',
            password_hash: '*****',
            reset_required: false,
            mfa_token: '',
            mfa_remember_until: null,
            google_id: null,
            active: true,
            created_at: '2023-10-06 10:30:00',
            updated_at: '2023-10-06 10:30:00',
            posts: 25,
            followers: '21.5K',
            following: 350,
        },
        {
            id: 3,
            path: 'profile-35.png',
            first_name: 'Lila',
            last_name: 'Perry',
            role: 'UX/UI Designer',
            email: 'lila@mail.com',
            location: 'Miami, USA',
            phone: '+1 202 555 0105',
            level: 'client',
            password_hash: '*****',
            reset_required: true,
            mfa_token: '',
            mfa_remember_until: null,
            google_id: null,
            active: true,
            created_at: '2023-10-07 11:45:00',
            updated_at: '2023-10-07 11:45:00',
            posts: 20,
            followers: '21.5K',
            following: 350,
        },
        {
            id: 4,
            path: 'profile-35.png',
            first_name: 'Andy',
            last_name: 'King',
            role: 'Project Lead',
            email: 'andy@mail.com',
            location: 'Tokyo, Japan',
            phone: '+1 202 555 0194',
            level: 'admin',
            password_hash: '*****',
            reset_required: false,
            mfa_token: '*****',
            mfa_remember_until: '2023-11-07',
            google_id: null,
            active: true,
            created_at: '2023-10-08 12:15:00',
            updated_at: '2023-10-08 12:15:00',
            posts: 25,
            followers: '21.5K',
            following: 300,
        },
        {
            id: 5,
            path: 'profile-35.png',
            first_name: 'Jesse',
            last_name: 'Cory',
            role: 'Web Developer',
            email: 'jesse@mail.com',
            location: 'Edinburgh, UK',
            phone: '+1 202 555 0161',
            level: 'staff',
            password_hash: '*****',
            reset_required: false,
            mfa_token: '',
            mfa_remember_until: null,
            google_id: 'jesse123',
            active: true,
            created_at: '2023-10-09 13:00:00',
            updated_at: '2023-10-09 13:00:00',
            posts: 30,
            followers: '20K',
            following: 350,
        },
        {
            id: 6,
            path: 'profile-35.png',
            first_name: 'Xavier',
            last_name: 'Smith',
            role: 'UX/UI Designer',
            email: 'xavier@mail.com',
            location: 'New York, USA',
            phone: '+1 202 555 0155',
            level: 'client',
            password_hash: '*****',
            reset_required: false,
            mfa_token: '',
            mfa_remember_until: null,
            google_id: null,
            active: false,
            created_at: '2023-10-10 14:30:00',
            updated_at: '2023-10-10 14:30:00',
            posts: 25,
            followers: '21.5K',
            following: 350,
        },
        {
            id: 7,
            path: 'profile-35.png',
            first_name: 'Susan',
            last_name: 'Johnson',
            role: 'Project Manager',
            email: 'susan@mail.com',
            location: 'Miami, USA',
            phone: '+1 202 555 0118',
            level: 'admin',
            password_hash: '*****',
            reset_required: false,
            mfa_token: '*****',
            mfa_remember_until: '2023-11-10',
            google_id: null,
            active: true,
            created_at: '2023-10-11 15:45:00',
            updated_at: '2023-10-11 15:45:00',
            posts: 40,
            followers: '21.5K',
            following: 350,
        },
        {
            id: 8,
            path: 'profile-35.png',
            first_name: 'Raci',
            last_name: 'Lopez',
            role: 'Web Developer',
            email: 'traci@mail.com',
            location: 'Edinburgh, UK',
            phone: '+1 202 555 0135',
            level: 'staff',
            password_hash: '*****',
            reset_required: true,
            mfa_token: '',
            mfa_remember_until: null,
            google_id: null,
            active: true,
            created_at: '2023-10-12 16:00:00',
            updated_at: '2023-10-12 16:00:00',
            posts: 25,
            followers: '21.5K',
            following: 350,
        },
        {
            id: 9,
            path: 'profile-35.png',
            first_name: 'Steven',
            last_name: 'Mendoza',
            role: 'HR',
            email: 'sokol@verizon.net',
            location: 'Monrovia, US',
            phone: '+1 202 555 0100',
            level: 'client',
            password_hash: '*****',
            reset_required: false,
            mfa_token: '',
            mfa_remember_until: null,
            google_id: 'steven456',
            active: true,
            created_at: '2023-10-13 17:15:00',
            updated_at: '2023-10-13 17:15:00',
            posts: 40,
            followers: '21.8K',
            following: 300,
        },
        {
            id: 10,
            path: 'profile-35.png',
            first_name: 'James',
            last_name: 'Cantrell',
            role: 'Web Developer',
            email: 'sravani@comcast.net',
            location: 'Michigan, US',
            phone: '+1 202 555 0134',
            level: 'staff',
            password_hash: '*****',
            reset_required: false,
            mfa_token: '',
            mfa_remember_until: null,
            google_id: null,
            active: true,
            created_at: '2023-10-14 18:30:00',
            updated_at: '2023-10-14 18:30:00',
            posts: 100,
            followers: '28K',
            following: 520,
        },
        {
            id: 11,
            path: 'profile-35.png',
            first_name: 'Reginald',
            last_name: 'Brown',
            role: 'Web Designer',
            email: 'drhyde@gmail.com',
            location: 'Entrimo, Spain',
            phone: '+1 202 555 0153',
            level: 'client',
            password_hash: '*****',
            reset_required: false,
            mfa_token: '',
            mfa_remember_until: null,
            google_id: null,
            active: false,
            created_at: '2023-10-15 19:45:00',
            updated_at: '2023-10-15 19:45:00',
            posts: 35,
            followers: '25K',
            following: 500,
        },
        {
            id: 12,
            path: 'profile-35.png',
            first_name: 'Stacey',
            last_name: 'Smith',
            role: 'Chief technology officer',
            email: 'maikelnai@optonline.net',
            location: 'Lublin, Poland',
            phone: '+1 202 555 0115',
            level: 'admin',
            password_hash: '*****',
            reset_required: false,
            mfa_token: '*****',
            mfa_remember_until: '2023-11-15',
            google_id: null,
            active: true,
            created_at: '2023-10-16 20:00:00',
            updated_at: '2023-10-16 20:00:00',
            posts: 21,
            followers: '5K',
            following: 200,
        },
    ]);


    const [filteredItems, setFilteredItems] = useState<any>(contactList);

    // useEffect(() => {
    //     setFilteredItems(() => {
    //         return contactList.filter((item: any) => {
    //             return item.name.toLowerCase().includes(search.toLowerCase());
    //         });
    //     });
    // }, [search, contactList]);

    const saveUser = () => {
        if (!params.name) {
            showMessage('Name is required.', 'error');
            return true;
        }
        if (!params.email) {
            showMessage('Email is required.', 'error');
            return true;
        }
        if (!params.phone) {
            showMessage('Phone is required.', 'error');
            return true;
        }
        if (!params.role) {
            showMessage('Occupation is required.', 'error');
            return true;
        }

        if (params.id) {
            //update user
            let user: any = filteredItems.find((d: any) => d.id === params.id);
            user.name = params.name;
            user.email = params.email;
            user.phone = params.phone;
            user.role = params.role;
            user.location = params.location;
        } else {
            //add user
            let maxUserId = filteredItems.length ? filteredItems.reduce((max: any, character: any) => (character.id > max ? character.id : max), filteredItems[0].id) : 0;

            let user = {
                id: maxUserId + 1,
                path: 'profile-35.png',
                name: params.name,
                email: params.email,
                phone: params.phone,
                role: params.role,
                location: params.location,
                posts: 20,
                followers: '5K',
                following: 500,
            };
            filteredItems.splice(0, 0, user);
            //   searchContacts();
        }

        showMessage('User has been saved successfully.');
        setAddContactModal(false);
    };

    const editUser = (user: any = null) => {
        const json = JSON.parse(JSON.stringify(defaultParams));
        setParams(json);
        if (user) {
            let json1 = JSON.parse(JSON.stringify(user));
            setParams(json1);
        }
        setAddContactModal(true);
    };

    const deleteUser = (user: any = null) => {
        setFilteredItems(filteredItems.filter((d: any) => d.id !== user.id));
        showMessage('User has been deleted successfully.');
    };

    const showMessage = (msg = '', type = 'success') => {
        const toast: any = Swal.mixin({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
            customClass: { container: 'toast' },
        });
        toast.fire({
            icon: type,
            title: msg,
            padding: '10px 20px',
        });
    };

    return (
        <div>
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl">Contacts</h2>
                <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                    <div className="flex gap-3">
                        {isAdmin() && (
                            <div>
                                <button type="button" className="btn btn-primary" onClick={() => editUser()}>
                                    <IconUserPlus className="ltr:mr-2 rtl:ml-2" />
                                    Add Contact
                                </button>
                            </div>
                        )}
                        <div>
                            <button type="button" className={`btn btn-outline-primary p-2 ${value === 'list' && 'bg-primary text-white'}`} onClick={() => setValue('list')}>
                                <IconListCheck />
                            </button>
                        </div>
                        <div>
                            <button type="button" className={`btn btn-outline-primary p-2 ${value === 'grid' && 'bg-primary text-white'}`} onClick={() => setValue('grid')}>
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
            {value === 'list' && (
                <div className="mt-5 panel p-0 border-0 overflow-hidden">
                    <div className="table-responsive">
                        <table className="table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Role</th>
                                    <th>Location</th>
                                    {isAdmin() && <th className="!text-center">Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.map((contact: any) => {
                                    return (
                                        <tr key={contact.id}>
                                            <td>{contact.name}</td>
                                            <td>{contact.email}</td>
                                            <td>{contact.phone}</td>
                                            <td>{contact.role}</td>
                                            <td>{contact.location}</td>
                                            {isAdmin() && (
                                                <td>
                                                    <div className="flex gap-4 items-center justify-center">
                                                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => editUser(contact)}>
                                                            Edit
                                                        </button>
                                                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => deleteUser(contact)}>
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {value === 'grid' && (
                <div className="grid 2xl:grid-cols-4 xl:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6 mt-5 w-full">
                    {filteredItems.map((contact: any) => {
                        return (
                            <div className="bg-white dark:bg-[#1c232f] rounded-md overflow-hidden text-center shadow relative" key={contact.id}>
                                <div className="bg-white/40 rounded-t-md bg-[#f1f2f3] dark:bg-[#1b2e4b] p-6">
                                    <img className="object-cover w-24 h-24 mx-auto rounded-full shadow-[0_4px_9px_0_rgba(0,0,0,0.02)_0_2px_4px_0_rgba(0,0,0,0.02)] ring-2 ring-[#ebedf2] dark:ring-white-dark m-auto" src={`/assets/images/${contact.path}`} alt="contact_image" />
                                    <div className="mt-6">
                                        <div className="text-primary font-semibold text-lg">{contact.name}</div>
                                        <div className="text-white-dark">{contact.role}</div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="mt-6 grid grid-cols-1 gap-4 ltr:text-left rtl:text-right">
                                        <div className="flex items-center">
                                            <div className="flex-none ltr:mr-2 rtl:ml-2">Email :</div>
                                            <div className="truncate text-white-dark">{contact.email}</div>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="flex-none ltr:mr-2 rtl:ml-2">Phone :</div>
                                            <div className="text-white-dark">{contact.phone}</div>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="flex-none ltr:mr-2 rtl:ml-2">Address :</div>
                                            <div className="text-white-dark">{contact.location}</div>
                                        </div>
                                    </div>
                                    {isAdmin() && (
                                        <div className="mt-6 flex gap-4 absolute bottom-0 w-full ltr:left-0 rtl:right-0 p-6">
                                            <button type="button" className="btn btn-outline-primary w-1/2" onClick={() => editUser(contact)}>
                                                Edit
                                            </button>
                                            <button type="button" className="btn btn-outline-danger w-1/2" onClick={() => deleteUser(contact)}>
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <Transition appear show={addContactModal} as={Fragment}>
                <Dialog as="div" open={addContactModal} onClose={() => setAddContactModal(false)} className="relative z-[51]">
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
                                        onClick={() => setAddContactModal(false)}
                                        className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                                    >
                                        <IconX />
                                    </button>
                                    <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                                        {params.id ? 'Edit Contact' : 'Add Contact'}
                                    </div>
                                    <div className="p-5">
                                        <form>
                                            <div className="mb-5">
                                                <label htmlFor="name">Name</label>
                                                <input id="name" type="text" placeholder="Enter Name" className="form-input" value={params.name} onChange={(e) => changeValue(e)} />
                                            </div>
                                            <div className="mb-5">
                                                <label htmlFor="email">Email</label>
                                                <input id="email" type="email" placeholder="Enter Email" className="form-input" value={params.email} onChange={(e) => changeValue(e)} />
                                            </div>
                                            <div className="mb-5">
                                                <label htmlFor="number">Phone Number</label>
                                                <input id="phone" type="text" placeholder="Enter Phone Number" className="form-input" value={params.phone} onChange={(e) => changeValue(e)} />
                                            </div>
                                            <div className="mb-5">
                                                <label htmlFor="occupation">Occupation</label>
                                                <input id="role" type="text" placeholder="Enter Occupation" className="form-input" value={params.role} onChange={(e) => changeValue(e)} />
                                            </div>
                                            <div className="mb-5">
                                                <label htmlFor="address">Address</label>
                                                <textarea
                                                    id="location"
                                                    rows={3}
                                                    placeholder="Enter Address"
                                                    className="form-textarea resize-none min-h-[130px]"
                                                    value={params.location}
                                                    onChange={(e) => changeValue(e)}
                                                ></textarea>
                                            </div>
                                            <div className="flex justify-end items-center mt-8">
                                                <button type="button" className="btn btn-outline-danger" onClick={() => setAddContactModal(false)}>
                                                    Cancel
                                                </button>
                                                <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={saveUser}>
                                                    {params.id ? 'Update' : 'Add'}
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

export default InviteStaff;
