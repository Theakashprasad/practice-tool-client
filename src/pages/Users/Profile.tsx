import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import Dropdown from '../../components/Dropdown';
import { setPageTitle } from '../../store/themeConfigSlice';
import { useEffect } from 'react';
import IconPencilPaper from '../../components/Icon/IconPencilPaper';
import IconCoffee from '../../components/Icon/IconCoffee';
import IconCalendar from '../../components/Icon/IconCalendar';
import IconMapPin from '../../components/Icon/IconMapPin';
import IconMail from '../../components/Icon/IconMail';
import IconPhone from '../../components/Icon/IconPhone';
import IconTwitter from '../../components/Icon/IconTwitter';
import IconDribbble from '../../components/Icon/IconDribbble';
import IconGithub from '../../components/Icon/IconGithub';
import IconShoppingBag from '../../components/Icon/IconShoppingBag';
import IconTag from '../../components/Icon/IconTag';
import IconCreditCard from '../../components/Icon/IconCreditCard';
import IconClock from '../../components/Icon/IconClock';
import IconHorizontalDots from '../../components/Icon/IconHorizontalDots';
import IconUser from '../../components/Icon/IconUser';
// import IconShieldCheck from '../../components/Icon/IconShieldCheck';
// import IconKey from '../../components/Icon/IconKey';
import IconGoogle from '../../components/Icon/IconGoogle';
// import IconShieldCheck from '../../components/Icon/IconShieldCheck';

const Profile = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Profile'));
    });
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
    return (
        <div>
            <ul className="flex space-x-2 rtl:space-x-reverse">
                <li>
                    <Link to="#" className="text-primary hover:underline">
                        Users
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>Profile</span>
                </li>
            </ul>
            <div className="pt-5">
                <div className="grid grid-cols-1 gap-5 mb-5">
                    <div className="panel">
                        <div className="flex items-center justify-between mb-5">
                            <h5 className="font-semibold text-lg dark:text-white-light">Profile</h5>
                            <Link to="/users/user-account-settings" className="ltr:ml-auto rtl:mr-auto btn btn-primary p-2 rounded-full">
                                <IconPencilPaper />
                            </Link>
                        </div>
                        <div className="mb-5">
                            <div className="flex flex-col justify-center items-center mb-10">
                                <img src="/assets/images/profile-35.png" alt="img" className="w-32 h-32 rounded-full object-cover mb-5" />
                                <p className="font-semibold text-primary text-2xl mb-1">
                                    <span className="first-name">Steven</span> <span className="last-name">Mendoza</span>
                                </p>
                                <span className={`badge ${true ? 'bg-success' : 'bg-danger'} text-white px-4 py-1.5 rounded-full`}>
                                    {true ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <IconUser className="w-5 h-5 text-primary shrink-0" />
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
                                            <p className="font-semibold">HR</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <IconMail className="w-5 h-5 text-primary shrink-0" />
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                                            <p className="font-semibold">sokol@verizon.net</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <IconPhone className="w-5 h-5 text-primary shrink-0" />
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                                            <p className="font-semibold">+1 202 555 0100</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <IconMapPin className="w-5 h-5 text-primary shrink-0" />
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                                            <p className="font-semibold">Monrovia, US</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <IconMapPin className="w-5 h-5 text-primary shrink-0" />
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Password Reset</p>
                                            <p className="font-semibold">{false ? 'Required' : 'Not Required'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <IconClock className="w-5 h-5 text-primary shrink-0" />
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">MFA Status</p>
                                            <p className="font-semibold">{'' ? 'Enabled' : 'Not Enabled'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <IconGoogle className="w-5 h-5 text-primary shrink-0" />
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Google ID</p>
                                            <p className="font-semibold">steven456</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <IconClock className="w-5 h-5 text-primary shrink-0" />
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Member Since</p>
                                            <p className="font-semibold">Oct 13, 2023</p>
                                            <p className="text-xs text-gray-500">Last updated: Oct 13, 2023</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
