import { useState } from 'react';
import { Mail, Lock, Shield, Eye, EyeOff } from 'lucide-react';
import { authApi } from '@/services/api';

const ForgotPasswordForm = ({ onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  
  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Error states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Validate step 1 form
  const validateStep1 = () => {
    let isValid = true;
    
    // Reset errors
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setFormError('');
    
    // Validate email
    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Invalid email address');
      isValid = false;
    }
    
    // Validate password
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }
    
    // Validate confirm password
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    }
    
    return isValid;
  };
  
  // Validate step 2 form
  const validateStep2 = () => {
    let isValid = true;
    
    // Reset errors
    setOtpError('');
    setFormError('');
    
    // Validate OTP
    if (!otp) {
      setOtpError('OTP is required');
      isValid = false;
    } else if (otp.length !== 6) {
      setOtpError('OTP must be 6 digits');
      isValid = false;
    }
    
    return isValid;
  };
  
  // Handle step 1 submission (send OTP)
  const handleStep1Submit = async (e) => {
    e.preventDefault();
    
    if (!validateStep1()) {
      return;
    }
    
    setLoading(true);
    try {
      // console.log("email",email)
      // Send OTP to the user's email
      await authApi.sendOtp(email);
      
      // Move to step 2
      setStep(2);
      
      // Clear OTP field when moving to step 2
      setOtp('');
      
      setFormSuccess(`A 6-digit OTP has been sent to ${email}`);
      setTimeout(() => setFormSuccess(''), 5000);
    } catch (error) {
      setFormError("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  // Handle step 2 submission (verify OTP and reset password)
  const handleStep2Submit = async (e) => {
    e.preventDefault();
    
    if (!validateStep2()) {
      return;
    }
    
    setLoading(true);
    try {
      // First validate the OTP
      const otpValidation = await authApi.validateOtp(email, otp);
      
      if (otpValidation?.otp_validate_status !== "success") {
        setOtpError("Invalid OTP");
        return;
      }
      
      // If OTP is valid, change the password
      await authApi.changePassword({
        email,
        password,
      });
      
      setFormSuccess("Your password has been updated successfully.");
      setTimeout(() => onCancel(), 2000);
    } catch (error) {
      setFormError("Invalid OTP or failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-blue-800">
          {step === 1 ? "Reset Password" : "Verify OTP"}
        </h2>
        <p className="text-gray-600">
          {step === 1
            ? "Enter your email and new password"
            : `Enter the OTP sent to ${email}`}
        </p>
      </div>
      
      {formError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {formError}
        </div>
      )}
      
      {formSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {formSuccess}
        </div>
      )}
      
      {step === 1 ? (
        // Step 1: Email and new password form
        <form onSubmit={handleStep1Submit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 h-4 w-4" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full rounded-md border border-gray-300 pl-10 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
          </div>
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 h-4 w-4" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                className="w-full rounded-md border border-gray-300 pl-10 pr-10 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-500"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
          </div>
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 h-4 w-4" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full rounded-md border border-gray-300 pl-10 pr-10 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-500"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {confirmPasswordError && <p className="text-red-500 text-sm">{confirmPasswordError}</p>}
          </div>
          
          <div className="flex gap-3">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
            <button
              type="button"
              className="w-full border border-gray-300 hover:bg-gray-100 py-2 rounded-md font-medium"
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        // Step 2: OTP verification form
        <form onSubmit={handleStep2Submit} className="space-y-4">
          <div className="bg-gray-100 p-3 rounded-md">
            <div className="flex items-center gap-2">
              <Mail className="text-blue-500 h-4 w-4" />
              <span className="text-sm font-medium">{email}</span>
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Verification Code</label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 h-4 w-4" />
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                className="w-full rounded-md border border-gray-300 pl-10 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={6}
              />
            </div>
            {otpError && <p className="text-red-500 text-sm">{otpError}</p>}
          </div>
          
          <div className="flex gap-3">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Reset Password"}
            </button>
            <button
              type="button"
              className="w-full border border-gray-300 hover:bg-gray-100 py-2 rounded-md font-medium"
              onClick={() => setStep(1)}
              disabled={loading}
            >
              Back
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ForgotPasswordForm;