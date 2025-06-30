import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import ForgotPasswordForm from '@/components/ForgotPasswordForm';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { 
  Building, 
  Mail, 
  Lock, 
  EyeOff, 
  Eye,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { authApi } from '@/services/api';

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(4, { message: 'Password must be at least 4 characters' }),
  rememberMe: z.boolean().optional(),
  otp: z.string().optional(),
});

const Home = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOtpValidating, setIsOtpValidating] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
      otp: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setAuthError('');

    if (!otpSent) {
      try {
        setLoading(true);
        // console.log("values.email",values.email)
        await authApi.sendOtp(values.email);
        
        setOtpSent(true);
        toast({
          title: t('otpSent'),
          description: t('checkYourEmail'),
        });
      } catch (error) {
        console.error('OTP send error:', error);
        setAuthError('otpSendFailed');
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      setIsOtpValidating(true);

      await authApi.validateOtp(values.email, otp );

      const response = await authApi.login({
        email: values.email,
        password: values.password
      });

      const userData = {
        email: response.user.email,
        isAdmin: response.user.isAdmin,
        name: response.user.name,
        role: response.user.role
      };

      login(userData);

      toast({
        title: t('loginSuccessful'),
        description: t('welcomeBack'),
      });

      if (userData.role === 'superadmin') {
        navigate('/user-list');
      } else if (userData.role === 'admin') {
        navigate('/dashboard');
      } else {
        setAuthError('accessDenied');
      }
    } catch (error) {
      console.error('OTP validation/login error:', error);
      setAuthError('invalidOtpOrLogin');
    } finally {
      setIsOtpValidating(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-blue-900">Employee Management System</h1>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-6">
            <ForgotPasswordForm onCancel={() => setShowForgotPassword(false)} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Section */}
      <div className="hidden md:flex flex-col w-1/2 bg-blue-700 text-white p-8 justify-center items-center">
        <div className="max-w-md mx-auto text-center space-y-8">
          <div className="bg-blue-600/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
            <Building className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold mb-2">{t('employeeManagementSystem')}</h1>
          <p className="text-lg mb-8">{t('streamlineWorkforceManagement')}</p>
          <div className="space-y-4 text-left">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 mt-0.5" />
              <span>{t('completeEmployeeData')}</span>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 mt-0.5" />
              <span>{t('performanceTracking')}</span>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 mt-0.5" />
              <span>{t('secureControls')}</span>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 mt-0.5" />
              <span>{t('intuitiveUI')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-800">{t('welcomeBack')}</h2>
            <p className="text-gray-600 mt-1">{t('signInToDashboard')}</p>
          </div>

          {authError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {authError === 'invalidCredentials' ? t('invalidCredentials') :
                  authError === 'serverError' ? t('serverError') :
                  authError === 'accessDenied' ? t('adminAccessRequired') :
                  authError === 'otpSendFailed' ? t('otpSendFailed') :
                  authError === 'invalidOtpOrLogin' ? t('invalidOtpOrLogin') :
                  ''}
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">{t('email')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                          placeholder="admin@example.com"
                          className="pl-10 h-12 border-gray-300"
                          {...field}
                          disabled={otpSent}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <FormLabel className="text-gray-700">{t('password')}</FormLabel>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    {t('forgotPassword')}
                  </button>
                </div>

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••"
                            className="pl-10 pr-10 h-12 border-gray-300"
                            {...field}
                            disabled={otpSent}
                          />
                          <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={otpSent}
                      />
                    </FormControl>
                    <FormLabel className="text-gray-600 text-sm font-normal">
                      {t('rememberMe')}
                    </FormLabel>
                  </FormItem>
                )}
              />

              {otpSent && (
                <div>
                  <FormLabel className="text-gray-700">{t('otp')}</FormLabel>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Enter OTP"
                      className="h-12 border-gray-300"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 h-12 rounded-md"
                disabled={loading || isOtpValidating}
              >
                {(loading || isOtpValidating) ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>
                    {otpSent ? t('verifying') : t('sendingOtp')}
                  </>
                ) : (
                  otpSent ? t('verifyOtpAndLogin') : t('sendOtp')
                )}
              </Button>
            </form>
          </Form>

          <div className="text-center mt-6 flex items-center justify-center text-sm text-gray-500">
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
            <span>{t('secureLogin')}</span>
          </div>

          <div className="text-center text-xs text-gray-400 mt-6">
            © 2025 EMS. {t('allRightsReserved')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
