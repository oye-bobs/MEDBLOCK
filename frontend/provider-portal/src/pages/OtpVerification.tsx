import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyOtpAndCreateProvider } from '../services/api';
import { Mail, ShieldCheck, RefreshCcw, ArrowLeft } from 'lucide-react';
import BackgroundLayer from '@/components/BackgroundLayer';
import { AuthContext } from '../App';
import { addRecentProvider } from '../utils/storage';

interface LocationState {
    email: string;
    devOtp?: string;
    registrationData: any;
}

const OtpVerification: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useContext(AuthContext);
    const { email, registrationData, devOtp } = (location.state as LocationState) || {};

    const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
    const [resending, setResending] = useState(false);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Redirect if no email in state
    useEffect(() => {
        if (!email) {
            navigate('/signup');
        }
    }, [email, navigate]);

    // Countdown timer
    useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleChange = (index: number, value: string) => {
        // Only allow digits
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all digits are entered
        if (index === 5 && value) {
            const fullOtp = newOtp.join('');
            if (fullOtp.length === 6) {
                handleVerify(fullOtp);
            }
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        
        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
        setOtp(newOtp);

        // Focus the next empty input or last input
        const nextIndex = Math.min(pastedData.length, 5);
        inputRefs.current[nextIndex]?.focus();

        // Auto-submit if complete
        if (pastedData.length === 6) {
            handleVerify(pastedData);
        }
    };

    const handleVerify = async (otpCode?: string) => {
        const code = otpCode || otp.join('');
        
        if (code.length !== 6) {
            setError('Please enter all 6 digits');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await verifyOtpAndCreateProvider(email, code);
            
            // Store credentials locally via AuthContext
            login(result.name || email, result.did, result.accessToken);
            
            // Add to recent providers (device specific)
            addRecentProvider({
                name: result.name || email,
                email: email,
                did: result.did,
                hospitalName: registrationData?.hospitalName || result.hospitalName
            });

            // Navigate to dashboard
            navigate('/dashboard', { replace: true });
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Invalid OTP. Please try again.');
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        setError('');

        try {
            // Re-request OTP with the same registration data
            const { requestProviderOtp } = await import('../services/api');
            await requestProviderOtp(registrationData);
            
            setTimeLeft(300); // Reset timer
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setResending(false);
        }
    };

    if (!email) {
        return null;
    }

    return (
        <div className="min-h-screen relative overflow-hidden py-10 px-4 flex items-center justify-center">
            <BackgroundLayer />
            <div className="max-w-2xl w-full z-10">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
                            <Mail size={32} className="text-white" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Verify Your Email</h1>
                    <p className="text-gray-600 mt-2">
                        We sent a 6-digit code to <span className="font-semibold text-blue-700">{email}</span>
                    </p>
                </div>

                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">
                    <div className="flex items-center gap-2 mb-6">
                        <ShieldCheck className="w-5 h-5 text-green-600" />
                        <p className="text-sm text-gray-600">Secure identity verification</p>
                    </div>

                    <div className="flex items-center justify-center gap-3 mb-6" onPaste={handlePaste}>
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className={`w-12 h-14 text-center text-xl font-semibold rounded-xl border ${error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
                                disabled={loading}
                                autoFocus={index === 0}
                            />
                        ))}
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                            <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    <button
                        onClick={() => handleVerify()}
                        disabled={loading || otp.join('').length !== 6}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3.5 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                    >
                        {loading ? 'Verifying...' : 'Verify & Continue'}
                    </button>

                    <div className="text-center mt-6">
                        <p className="text-gray-600 mb-4">
                            Didn't receive the code?
                        </p>
                        <button
                            onClick={handleResend}
                            disabled={timeLeft > 0 || resending}
                            className={`flex items-center justify-center space-x-2 mx-auto ${
                                timeLeft > 0 || resending
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-blue-600 hover:text-blue-700'
                            }`}
                        >
                            <RefreshCcw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
                            <span>
                                {resending
                                    ? 'Resending...'
                                    : timeLeft > 0
                                    ? `Resend in ${formatTime(timeLeft)}`
                                    : 'Resend Code'}
                            </span>
                        </button>
                    </div>

                    {devOtp && (
                        <div className="mt-4 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
                            <p className="font-semibold">Developer Mode</p>
                            <p>Your temporary OTP is <span className="font-mono font-bold">{devOtp}</span>. This appears because email delivery is not configured.</p>
                        </div>
                    )}

                    <button
                        onClick={() => navigate('/signup')}
                        className="mt-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Sign Up
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OtpVerification;
