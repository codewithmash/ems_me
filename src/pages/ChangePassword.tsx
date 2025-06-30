import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { employeeApi,emailApi } from '@/services/api';

const formSchema = z.object({
  userId: z.string().min(1, 'Please select a user'),
  oldPassword: z.string().min(6, 'Password must be at least 6 characters'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const ChangePassword = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [employees, setEmployees] = useState<[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: '',
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

const usersOptions = Array.isArray(employees) 
    ? employees.map(emp => ({
        value: emp.id,
        label: emp.name,
      }))
    : [];

   function getUserDetailsById(userId, usersArray) {
    if (!Array.isArray(usersArray)) return { name: 'Unknown', email: '' };
    
    const user = usersArray.find(user => user.id === Number(userId));
    return {
      name: user?.name || 'Unknown',
      email: user?.email || ''
    };
  }

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await employeeApi.getAll();
      
      // Handle different response formats
      const employeesData = Array.isArray(response) 
        ? response 
        : response?.employees || response?.data || [];
        
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: t('error'),
        description: t('errorFetchingData'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const payload = {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      };
      //console.log("payload",payload)
      const response = await employeeApi.changePassword(values.userId, payload);
      const user_details = getUserDetailsById(values.userId,employees)
      //console.log("user_details",user_details,values.userId)
      emailApi.sendUpdateCredentialsEmail(user_details.email,user_details.name,payload.newPassword)
      toast({
        title: "Success",
        description: "Password has been changed successfully.",
      });
      form.reset();
    } catch (error) {
      console.error('Password change error:', error);
      toast({
        title: "Error",
        description: "Failed to change password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('changePassword')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

              {/* User Selection Field */}
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('selectUser')}</FormLabel><br />
                    <FormControl>
                      <select
                        id="user"
                        className="border rounded p-2 w-full"
                        value={field.value}
                        onChange={field.onChange}
                      >
                        <option value="">{t('select')} {t('user')}</option>
                        {usersOptions?.map((user) => (
                          <option key={user.value} value={user.value}>
                            {user.label}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Old Password Field */}
              <FormField
                control={form.control}
                name="oldPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('oldPassword')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showOldPassword ? "text" : "password"}
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowOldPassword(!showOldPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          {showOldPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* New Password Field */}
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('newPassword')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirm Password Field */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('confirmNewPassword')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>
                    {t('changingPassword')}...
                  </>
                ) : (
                  t('changePassword')
                )}
              </Button>

            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
// This component allows users to change their password.
// It includes a form with fields for the old password, new password, and confirmation of the new password.
// The form validates the input and ensures that the new password and confirmation match.
// It also includes a dropdown to select the user whose password is being changed.  
export default ChangePassword;
