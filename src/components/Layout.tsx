
import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import LanguageSelector from './LanguageSelector';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b h-16 flex items-center justify-end px-6">
          <LanguageSelector />
        </header>
        <main className="flex-1 p-6 bg-gray-50 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
