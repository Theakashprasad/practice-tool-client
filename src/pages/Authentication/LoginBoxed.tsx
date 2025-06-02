import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { useEffect, useState } from 'react';
import { setPageTitle, toggleRTL } from '../../store/themeConfigSlice';
import Dropdown from '../../components/Dropdown';
import i18next from 'i18next';
import IconCaretDown from '../../components/Icon/IconCaretDown';
import IconMail from '../../components/Icon/IconMail';
import IconLockDots from '../../components/Icon/IconLockDots';
import IconInstagram from '../../components/Icon/IconInstagram';
import IconFacebookCircle from '../../components/Icon/IconFacebookCircle';
import IconTwitter from '../../components/Icon/IconTwitter';
import IconGoogle from '../../components/Icon/IconGoogle';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { API_BASE_URL } from '../../constants';

// Two Factor Authentication (2FA) is required in 3 cases:
// 1. New users logging in for the first time (reset_required)
// 2. Existing users who haven't set up 2FA yet (mfaSetup)
// 3. Existing users who have 2FA enabled (mfaRequired)

const LoginBoxed = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Login Boxed'));
    });
    const navigate = useNavigate();
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const [flag, setFlag] = useState(themeConfig.locale);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mfaToken, setMfaToken] = useState('');
    const [rememberDevice, setRememberDevice] = useState(false);
    const [showMfa, setShowMfa] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [mfaSetupData, setMfaSetupData] = useState<{
        secret: string;
        otpauth_url: string;
    } | null>(null);

    const setLocale = (flag: string) => {
        setFlag(flag);
        if (flag.toLowerCase() === 'ae') {
            dispatch(toggleRTL('rtl'));
        } else {
            dispatch(toggleRTL('ltr'));
        }
    };

    const submitForm = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
                email,
                password_hash: password,
                mfaToken: showMfa ? mfaToken : undefined,
                rememberDevice
            });

            // Case 1: New user's first login - must set up 2FA
            if (response.data.reset_required) {
                setMfaSetupData({
                    secret: response.data.secret,
                    otpauth_url: response.data.otpauth_url
                });
                setShowMfa(true);
            } 
            // Case 2: Existing user who hasn't set up 2FA yet
            else if (response.data.mfaSetup) {
                setMfaSetupData({
                    secret: response.data.secret,
                    otpauth_url: response.data.otpauth_url
                });
                setShowMfa(true);
            }
            // Case 3: User has 2FA enabled - needs to enter token
            else if (response.data.mfaRequired) {
                setMfaSetupData({
                    secret: response.data.secret,
                    otpauth_url: response.data.otpauth_url
                });
                setShowMfa(true);
            }
            // Success case - user authenticated successfully
            else if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                if (response.data.user) {
                    localStorage.setItem('userData', JSON.stringify({
                        id: response.data.user.id,
                        name: response.data.user.name,
                        email: response.data.user.email,
                        level: response.data.user.level
                    }));
                }
                navigate('/apps/staff');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    // Renders the 2FA setup UI with QR code and manual entry option
    const renderMfaSetup = () => {
        if (!mfaSetupData) return null;

        return (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Two-Factor Authentication</h3>
                <div className="flex flex-col items-center space-y-4">
                    <div className="p-4 bg-white rounded-lg">
                        <QRCodeSVG 
                            value={mfaSetupData.otpauth_url}
                            size={200}
                            level="H"
                            includeMargin={true}
                        />
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                        <p className="mb-2">Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)</p>
                        <p>Or enter this secret key manually:</p>
                        <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded font-mono text-center">
                            {mfaSetupData.secret}
                        </div>
                    </div>
                    <div className="w-full">
                        <label htmlFor="MfaToken" className="block text-sm font-medium mb-2">Enter the 6-digit code from your authenticator app</label>
                        <input 
                            id="MfaToken" 
                            type="text" 
                            placeholder="Enter MFA Token" 
                            className="form-input w-full"
                            value={mfaToken}
                            onChange={(e) => setMfaToken(e.target.value)}
                            required
                        />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div>
            <div className="absolute inset-0">
                <img src="/assets/images/auth/bg-gradient.png" alt="image" className="h-full w-full object-cover" />
            </div>

            <div className="relative flex min-h-screen items-center justify-center bg-[url(/assets/images/auth/map.png)] bg-cover bg-center bg-no-repeat px-6 py-10 dark:bg-[#060818] sm:px-16">
                <img src="/assets/images/auth/coming-soon-object1.png" alt="image" className="absolute left-0 top-1/2 h-full max-h-[893px] -translate-y-1/2" />
                <img src="/assets/images/auth/coming-soon-object2.png" alt="image" className="absolute left-24 top-0 h-40 md:left-[30%]" />
                <img src="/assets/images/auth/coming-soon-object3.png" alt="image" className="absolute right-0 top-0 h-[300px]" />
                <img src="/assets/images/auth/polygon-object.svg" alt="image" className="absolute bottom-0 end-[28%]" />
                <div className="relative w-full max-w-[870px] rounded-md bg-[linear-gradient(45deg,#fff9f9_0%,rgba(255,255,255,0)_25%,rgba(255,255,255,0)_75%,_#fff9f9_100%)] p-2 dark:bg-[linear-gradient(52.22deg,#0E1726_0%,rgba(14,23,38,0)_18.66%,rgba(14,23,38,0)_51.04%,rgba(14,23,38,0)_80.07%,#0E1726_100%)]">
                    <div className="relative flex flex-col justify-center rounded-md bg-white/60 backdrop-blur-lg dark:bg-black/50 px-6 lg:min-h-[758px] py-20">
                        <div className="absolute top-6 end-6">
                            <div className="dropdown">
                                <Dropdown
                                    offset={[0, 8]}
                                    placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                    btnClassName="flex items-center gap-2.5 rounded-lg border border-white-dark/30 bg-white px-2 py-1.5 text-white-dark hover:border-primary hover:text-primary dark:bg-black"
                                    button={
                                        <>
                                            <div>
                                                <img src={`/assets/images/flags/${flag.toUpperCase()}.svg`} alt="image" className="h-5 w-5 rounded-full object-cover" />
                                            </div>
                                            <div className="text-base font-bold uppercase">{flag}</div>
                                            <span className="shrink-0">
                                                <IconCaretDown />
                                            </span>
                                        </>
                                    }
                                >
                                    <ul className="!px-2 text-dark dark:text-white-dark grid grid-cols-2 gap-2 font-semibold dark:text-white-light/90 w-[280px]">
                                        {themeConfig.languageList.map((item: any) => {
                                            return (
                                                <li key={item.code}>
                                                    <button
                                                        type="button"
                                                        className={`flex w-full hover:text-primary rounded-lg ${flag === item.code ? 'bg-primary/10 text-primary' : ''}`}
                                                        onClick={() => {
                                                            i18next.changeLanguage(item.code);
                                                            setLocale(item.code);
                                                        }}
                                                    >
                                                        <img src={`/assets/images/flags/${item.code.toUpperCase()}.svg`} alt="flag" className="w-5 h-5 object-cover rounded-full" />
                                                        <span className="ltr:ml-3 rtl:mr-3">{item.name}</span>
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </Dropdown>
                            </div>
                        </div>
                        <div className="mx-auto w-full max-w-[440px]">
                            <div className="mb-10">
                                <h1 className="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl">Sign in</h1>
                                <p className="text-base font-bold leading-normal text-white-dark">Enter your email and password to login</p>
                            </div>
                            {error && (
                                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                                    {error}
                                </div>
                            )}
                            <form className="space-y-5 dark:text-white" onSubmit={submitForm}>
                                <div>
                                    <label htmlFor="Email">Email</label>
                                    <div className="relative text-white-dark">
                                        <input 
                                            id="Email" 
                                            type="email" 
                                            placeholder="Enter Email" 
                                            className="form-input ps-10 placeholder:text-white-dark"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                            {/* <IconMail fill={true} /> */}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="Password">Password</label>
                                    <div className="relative text-white-dark">
                                        <input 
                                            id="Password" 
                                            type="password" 
                                            placeholder="Enter Password" 
                                            className="form-input ps-10 placeholder:text-white-dark"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                            {/* <IconLockDots fill={true} /> */}
                                        </span>
                                    </div>
                                </div>
                                {/* Show MFA token input if user has 2FA enabled but hasn't completed setup */}
                                {showMfa && !mfaSetupData && (
                                    <div>
                                        <label htmlFor="MfaToken">MFA Token</label>
                                        <div className="relative text-white-dark">
                                            <input 
                                                id="MfaToken" 
                                                type="text" 
                                                placeholder="Enter MFA Token" 
                                                className="form-input ps-10 placeholder:text-white-dark"
                                                value={mfaToken}
                                                onChange={(e) => setMfaToken(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                )}
                                {/* Show QR code and setup UI if user needs to set up 2FA */}
                                {mfaSetupData && renderMfaSetup()}
                                <div>
                                    <label className="flex cursor-pointer items-center">
                                        <input 
                                            type="checkbox" 
                                            className="form-checkbox bg-white dark:bg-black"
                                            checked={rememberDevice}
                                            onChange={(e) => setRememberDevice(e.target.checked)}
                                        />
                                        <span className="text-white-dark">Remember this device for 30 days</span>
                                    </label>
                                </div>
                                <button 
                                    type="submit" 
                                    className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]"
                                    disabled={loading}
                                >
                                    {loading ? 'Signing in...' : 'Sign in'}
                                </button>
                            </form>
                            <div className="relative my-7 text-center md:mb-9">
                                <span className="absolute inset-x-0 top-1/2 h-px w-full -translate-y-1/2 bg-white-light dark:bg-white-dark"></span>
                                <span className="relative bg-white px-2 font-bold uppercase text-white-dark dark:bg-dark dark:text-white-light">or</span>
                            </div>
                            <div className="mb-10 md:mb-[60px]">
                                <ul className="flex justify-center gap-3.5 text-white">
                                    <li>
                                        <Link
                                            to="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                window.location.href = `${API_BASE_URL}/api/auth/google`;
                                            }}
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-full p-0 transition hover:scale-110"
                                            style={{ background: 'linear-gradient(135deg, rgba(239, 18, 98, 1) 0%, rgba(67, 97, 238, 1) 100%)' }}
                                        >
                                            <IconGoogle />
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginBoxed;
