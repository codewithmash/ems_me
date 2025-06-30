
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Shield, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const { t } = useLanguage();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
        <div className="flex justify-center mb-4">
          <Shield className="h-16 w-16 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('accessDenied')}
        </h1>
        <p className="text-gray-600 mb-6">
          {t('adminAccessRequiredMessage')}
        </p>
        {user && (
          <p className="text-sm text-gray-500 mb-6">
            {t('loggedInAs')}: {user.email}
          </p>
        )}
        <Button 
          onClick={handleLogout}
          className="inline-flex items-center"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {t('logout')}
        </Button>
      </div>
    </div>
  );
};

export default Unauthorized;
