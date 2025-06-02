import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { setPageTitle, toggleRTL } from '../../store/themeConfigSlice';
import { useEffect, useState } from 'react';
import Dropdown from '../../components/Dropdown';
import i18next from 'i18next';
import IconCaretDown from '../../components/Icon/IconCaretDown';
import IconUser from '../../components/Icon/IconUser';
import IconMail from '../../components/Icon/IconMail';
import IconLockDots from '../../components/Icon/IconLockDots';
import IconInstagram from '../../components/Icon/IconInstagram';
import IconFacebookCircle from '../../components/Icon/IconFacebookCircle';
import IconTwitter from '../../components/Icon/IconTwitter';
import IconGoogle from '../../components/Icon/IconGoogle';
import axios from 'axios';
import { API_BASE_URL } from '../../constants';

const RegisterBoxed = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    
    useEffect(() => {
        dispatch(setPageTitle('Register Boxed'));
        // Only validate token if it exists
        if (token) {
            validateToken();
        }
    }, [token, dispatch]);

    const [tokenValid, setTokenValid] = useState<boolean | null>(null);
    const [tokenMessage, setTokenMessage] = useState('');

    const validateToken = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/invitation/validate/token?token=${token}`);
            if (response.data.valid) {
                setTokenValid(true);
                setTokenMessage(response.data.message);
                setFormData(prev => ({
                    ...prev,
                    email: response.data.invitation.email,
                    first_name: response.data.invitation.first_name || '',
                    last_name: response.data.invitation.last_name || ''
                }));
                setLevel(response.data.invitation.level);
            } else {
                setTokenValid(false);
                setTokenMessage(response.data.message);
                navigate('/auth/boxed-signin');
            }
        } catch (err: any) {
            setTokenValid(false);
            setTokenMessage(err.response?.data?.message || 'Error validating token');
            navigate('/auth/boxed-signin');
        }
    };

    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const [level, setLevel] = useState('client');
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirm_password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const setLocale = (flag: string) => {
        setFlag(flag);
        if (flag.toLowerCase() === 'ae') {
            dispatch(toggleRTL('rtl'));
        } else {
            dispatch(toggleRTL('ltr'));
        }
    };
    const [flag, setFlag] = useState(themeConfig.locale);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        // Only validate password fields since email is pre-filled from token
        if (!formData.password || !formData.confirm_password) {
            setError('Please enter and confirm your password');
            return false;
        }
        if (formData.password !== formData.confirm_password) {
            setError('Passwords do not match');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }
        return true;
    };

    const submitForm = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                password_hash: formData.password,
                level: level,
                ...(token && { token }) // Only include token if it exists
            });

            if (response.status === 201) {
                navigate('/auth/boxed-signin');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const levelOptions = [
        { value: 'admin', label: 'Admin' },
        { value: 'staff', label: 'Staff' },
        { value: 'client', label: 'Client' }
    ];

    return (
        <div className="min-h-screen relative bg-[#060818] flex items-center justify-center">
            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <img src="/assets/images/auth/bg-gradient.png" alt="background" className="absolute w-full h-full object-cover" />
                <div className="absolute inset-0 bg-[url(/assets/images/auth/map.png)] bg-center bg-cover bg-no-repeat opacity-20"></div>
                <img src="/assets/images/auth/coming-soon-object1.png" alt="decoration" className="absolute left-0 top-1/2 h-full max-h-[893px] -translate-y-1/2 opacity-20" />
                <img src="/assets/images/auth/coming-soon-object2.png" alt="decoration" className="absolute left-24 top-0 h-40 md:left-[30%] opacity-20" />
                <img src="/assets/images/auth/coming-soon-object3.png" alt="decoration" className="absolute right-0 top-0 h-[300px] opacity-20" />
                <img src="/assets/images/auth/polygon-object.svg" alt="decoration" className="absolute bottom-0 end-[28%] opacity-20" />
            </div>

            {/* Form Container */}
            <div className="container relative z-10">
                <div className="flex items-center justify-center min-h-screen">
                    <div className="panel sm:w-[600px] m-6 w-full">
                        <div className="w-full p-5 bg-white rounded-lg shadow-lg dark:bg-navy-700">
                            {token && (
                                <div className={`mb-4 p-4 rounded-lg shadow-sm ${
                                    tokenValid === true ? 'bg-green-50 border border-green-200 text-green-500' :
                                    tokenValid === false ? 'bg-red-50 border border-red-200 text-red-500' :
                                    'bg-yellow-50 border border-yellow-200 text-yellow-500'
                                }`}>
                                    {tokenMessage}
                                </div>
                            )}
                            <div className="mb-10">
                                <h1 className="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl">
                                    {token ? 'Set Up Your Account' : 'Create Account'}
                                </h1>
                                <p className="text-base font-bold leading-normal text-white-dark">
                                    {token ? 'Create your password to complete account setup' : 'Sign up to get started'}
                                </p>
                            </div>
                            {error && (
                                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-500 rounded-lg shadow-sm">
                                    {error}
                                </div>
                            )}
                            <form className="space-y-5 dark:text-white" onSubmit={submitForm}>
                                {!token && (
                                    <>
                                        <div>
                                            <label htmlFor="FirstName">First Name</label>
                                            <div className="relative text-white-dark">
                                                <input 
                                                    id="FirstName" 
                                                    type="text" 
                                                    name="first_name"
                                                    placeholder="Enter First Name" 
                                                    className="form-input ps-10 placeholder:text-white-dark"
                                                    value={formData.first_name}
                                                    onChange={handleChange}
                                                    required
                                                />
                                                <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                                    {/* <IconUser fill={true} /> */}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="LastName">Last Name</label>
                                            <div className="relative text-white-dark">
                                                <input 
                                                    id="LastName" 
                                                    type="text" 
                                                    name="last_name"
                                                    placeholder="Enter Last Name" 
                                                    className="form-input ps-10 placeholder:text-white-dark"
                                                    value={formData.last_name}
                                                    onChange={handleChange}
                                                    required
                                                />
                                                <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                                    {/* <IconUser fill={true} /> */}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="Email">Email</label>
                                            <div className="relative text-white-dark">
                                                <input 
                                                    id="Email" 
                                                    type="email" 
                                                    name="email"
                                                    placeholder="Enter Email" 
                                                    className="form-input ps-10 placeholder:text-white-dark"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    required
                                                />
                                                <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                                    {/* <IconMail fill={true} /> */}
                                                </span>
                                            </div>
                                        </div>
                                    </>
                                )}
                                <div>
                                    <label htmlFor="Password">Password</label>
                                    <div className="relative text-white-dark">
                                        <input 
                                            id="Password" 
                                            type="password" 
                                            name="password"
                                            placeholder="Enter Password" 
                                            className="form-input ps-10 placeholder:text-white-dark"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                        />
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                            {/* <IconLockDots fill={true} /> */}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="ConfirmPassword">Confirm Password</label>
                                    <div className="relative text-white-dark">
                                        <input 
                                            id="ConfirmPassword" 
                                            type="password" 
                                            name="confirm_password"
                                            placeholder="Confirm Password" 
                                            className="form-input ps-10 placeholder:text-white-dark"
                                            value={formData.confirm_password}
                                            onChange={handleChange}
                                            required
                                        />
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                            {/* <IconLockDots fill={true} /> */}
                                        </span>
                                    </div>
                                </div>
                                <button 
                                    type="submit" 
                                    className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]"
                                    disabled={loading || (token !== null && tokenValid === false)}
                                >
                                    {loading ? 'Signing up...' : 'Sign up'}
                                </button>
                            </form>
                            <div className="relative my-7 text-center md:mb-9">
                                <span className="absolute inset-x-0 top-1/2 h-px w-full -translate-y-1/2 bg-white-light dark:bg-white-dark"></span>
                                <span className="relative bg-white px-2 font-bold uppercase text-white-dark dark:bg-dark dark:text-white-light">or</span>
                            </div>
                            <div className="mb-10 md:mb-[60px]">
                                <ul className="flex justify-center gap-3.5">
                                    <li>
                                        <Link
                                            to="#"
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-full p-0 transition hover:scale-110"
                                            style={{ background: 'linear-gradient(135deg, rgba(239, 18, 98, 1) 0%, rgba(67, 97, 238, 1) 100%)' }}
                                        >
                                            <IconGoogle />
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div className="text-center">
                                Already have an account ?&nbsp;
                                <Link to="/auth/boxed-signin" className="uppercase text-primary underline transition hover:text-black dark:hover:text-white">
                                    SIGN IN
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterBoxed;
