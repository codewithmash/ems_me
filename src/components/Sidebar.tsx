
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Building2,
  Users,
  Lock,
  LogOut,
  Calendar,
  FileText,
  Building,
  LayoutDashboard,
  ClipboardCheck,Clock
} from 'lucide-react';

const Sidebar: React.FC<{ className?: string }> = ({ className }) => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const getSidebarItems = () => {
    if (user?.role === 'superadmin') {
      return [
        // { icon: Building2, text: t('companySetup'), path: '/company-setup' },
        { icon: Users, text: t('userList'), path: '/user-list' },
        { icon: Building, text: t('departments'), path: '/departments' },
        { icon: Building2, text: t('projects'), path: '/projects' }, 
        { icon: Lock, text: t('changePassword'), path: '/change-password' },
        { icon: LogOut, text: t('logout'), path: '/logout' },
      ];
    } else if (user?.role === 'admin') {
      return [
        { icon: LayoutDashboard, text: t('dashboard'), path: '/dashboard' },
        { icon: Users, text: t('employees'), path: '/employees' },
        { icon: ClipboardCheck, text: t('attendanceReport'), path: '/attendance-report' },
        { icon: Calendar, text: t('leaveManagement'), path: '/leaves' },
        { icon: FileText, text: t('notices'), path: '/notices' },
        { icon: Building, text: t('departments'), path: '/departments' },
        { icon: Building2, text: t('projects'), path: '/projects' }, 
        { icon: Clock, text: t('shifts'), path: '/shifts' },
        { icon: Lock, text: t('changePassword'), path: '/change-password' },
        { icon: LogOut, text: t('logout'), path: '/logout' },
      ];
    }
    
    // No menu items for normal users as they shouldn't have access
    return [];
  };

  const menuItems = getSidebarItems();
  
  return (
    <div className={`bg-ems-blue text-white min-h-screen w-60 flex flex-col ${className || ''}`}>
      <div className="p-4 border-b border-gray-700 flex items-center">
        {/* <h1 className="text-xl font-bold text-white">
          EMS - {user?.role || ''}
        </h1> */}

        <h1 className="text-xl font-bold text-white">
          {t('ems')} - {t(user?.role || '')}
        </h1>
      </div>
      
      <nav className="flex flex-col mt-4 overflow-y-auto">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center py-3 px-4 hover:bg-blue-900 transition-colors ${
                isActive ? 'bg-blue-900 border-l-4 border-ems-gold' : ''
              }`
            }
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.text}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
