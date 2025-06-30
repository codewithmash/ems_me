
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { PenLine, Trash2, Plus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import db from '@/utils/db';

interface Company {
  id: number;
  name: string;
  contactNo: string;
  adminName: string;
  adminEmail: string;
  adminLoginId: string;
  multipleDeviceAllowed: boolean;
}

const CompanySetup = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState<Omit<Company, 'id'>>({
    name: '',
    contactNo: '',
    adminName: '',
    adminEmail: '',
    adminLoginId: '',
    multipleDeviceAllowed: false,
  });
  
  // Fetch companies
  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      try {
        return await db.companyQueries.getAllCompanies() as Company[];
      } catch (error) {
        console.error('Failed to fetch companies:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch companies. Please try again.',
          variant: 'destructive',
        });
        return [];
      }
    }
  });
  
  // Add company mutation
  const addCompanyMutation = useMutation({
    mutationFn: async (data: Omit<Company, 'id'>) => {
      return await db.companyQueries.createCompany(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast({
        title: 'Success',
        description: 'Company added successfully',
      });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      console.error('Failed to add company:', error);
      toast({
        title: 'Error',
        description: 'Failed to add company. Please try again.',
        variant: 'destructive',
      });
    }
  });
  
  // Update company mutation
  const updateCompanyMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Omit<Company, 'id'> }) => {
      return await db.companyQueries.updateCompany(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast({
        title: 'Success',
        description: 'Company updated successfully',
      });
      setIsEditDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      console.error('Failed to update company:', error);
      toast({
        title: 'Error',
        description: 'Failed to update company. Please try again.',
        variant: 'destructive',
      });
    }
  });
  
  // Delete company mutation
  const deleteCompanyMutation = useMutation({
    mutationFn: async (id: number) => {
      return await db.companyQueries.deleteCompany(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast({
        title: 'Success',
        description: 'Company deleted successfully',
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      console.error('Failed to delete company:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete company. Please try again.',
        variant: 'destructive',
      });
    }
  });
  
  // Initialize DB schema
  useEffect(() => {
    const initDb = async () => {
      try {
        await db.initDbSchema();
      } catch (error) {
        console.error('Failed to initialize database schema:', error);
      }
    };
    
    initDb();
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  
  const handleSwitchChange = (checked: boolean) => {
    setFormData({
      ...formData,
      multipleDeviceAllowed: checked,
    });
  };
  
  const handleAddSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addCompanyMutation.mutate(formData);
  };
  
  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedCompany) {
      updateCompanyMutation.mutate({
        id: selectedCompany.id,
        data: formData,
      });
    }
  };
  
  const handleDelete = () => {
    if (selectedCompany) {
      deleteCompanyMutation.mutate(selectedCompany.id);
    }
  };
  
  const openEditDialog = (company: Company) => {
    setSelectedCompany(company);
    setFormData({
      name: company.name,
      contactNo: company.contactNo,
      adminName: company.adminName,
      adminEmail: company.adminEmail,
      adminLoginId: company.adminLoginId,
      multipleDeviceAllowed: company.multipleDeviceAllowed,
    });
    setIsEditDialogOpen(true);
  };
  
  const openDeleteDialog = (company: Company) => {
    setSelectedCompany(company);
    setIsDeleteDialogOpen(true);
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      contactNo: '',
      adminName: '',
      adminEmail: '',
      adminLoginId: '',
      multipleDeviceAllowed: false,
    });
    setSelectedCompany(null);
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">
          {t('companySetup')}
          <span className="text-yellow-500 text-lg ml-2">
            ({t('multipleDeviceAllow')})
          </span>
        </h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              {t('new')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('addCompany')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSubmit} className="space-y-4 py-2">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">{t('companyName')}</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={formData.name}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contactNo">{t('contactNo')}</Label>
                  <Input 
                    id="contactNo" 
                    name="contactNo" 
                    value={formData.contactNo}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="adminName">{t('companyAdminName')}</Label>
                  <Input 
                    id="adminName" 
                    name="adminName" 
                    value={formData.adminName}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="adminEmail">{t('adminEmail')}</Label>
                  <Input 
                    id="adminEmail" 
                    name="adminEmail" 
                    type="email"
                    value={formData.adminEmail}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="adminLoginId">{t('adminLoginID')}</Label>
                  <Input 
                    id="adminLoginId" 
                    name="adminLoginId" 
                    value={formData.adminLoginId}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="multipleDeviceAllowed"
                    name="multipleDeviceAllowed"
                    checked={formData.multipleDeviceAllowed}
                    onCheckedChange={handleSwitchChange}
                  />
                  <Label htmlFor="multipleDeviceAllowed">
                    {t('multipleDeviceAllowQ')}
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  {t('cancel')}
                </Button>
                <Button type="submit" disabled={addCompanyMutation.isPending}>
                  {addCompanyMutation.isPending ? t('saving') : t('save')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 p-3 mb-6 rounded-md">
        <p>{t('multipleDeviceAllow')}</p>
      </div>
      
      <div className="bg-white rounded-md shadow overflow-hidden">
        <Table>
          <TableHeader className="bg-cyan-100">
            <TableRow>
              <TableHead className="w-[30px]">#</TableHead>
              <TableHead>{t('companyName')}</TableHead>
              <TableHead>{t('contactNo')}</TableHead>
              <TableHead>{t('companyAdminName')}</TableHead>
              <TableHead>{t('adminEmail')}</TableHead>
              <TableHead>{t('adminLoginID')}</TableHead>
              <TableHead>{t('multipleDeviceAllowQ')}</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  {t('loading')}...
                </TableCell>
              </TableRow>
            ) : companies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  {t('noData')}
                </TableCell>
              </TableRow>
            ) : (
              companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>{company.id}</TableCell>
                  <TableCell>{company.name}</TableCell>
                  <TableCell>{company.contactNo}</TableCell>
                  <TableCell>{company.adminName}</TableCell>
                  <TableCell>{company.adminEmail}</TableCell>
                  <TableCell>{company.adminLoginId}</TableCell>
                  <TableCell>{company.multipleDeviceAllowed ? t('yes') : t('no')}</TableCell>
                  <TableCell className="flex justify-end space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => openEditDialog(company)}
                    >
                      <PenLine className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => openDeleteDialog(company)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between px-4 py-2 border-t">
          <div className="flex items-center">
            <span>{t('page')} </span>
            <Input 
              className="w-12 mx-2 h-8" 
              value="1" 
            />
            <span> {t('of')} 1</span>
          </div>
          <div>
            <span>{t('view')} 1-{companies.length} {t('of')} {companies.length}</span>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('editCompany')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">{t('companyName')}</Label>
                <Input 
                  id="edit-name" 
                  name="name" 
                  value={formData.name}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-contactNo">{t('contactNo')}</Label>
                <Input 
                  id="edit-contactNo" 
                  name="contactNo" 
                  value={formData.contactNo}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-adminName">{t('companyAdminName')}</Label>
                <Input 
                  id="edit-adminName" 
                  name="adminName" 
                  value={formData.adminName}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-adminEmail">{t('adminEmail')}</Label>
                <Input 
                  id="edit-adminEmail" 
                  name="adminEmail" 
                  type="email"
                  value={formData.adminEmail}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-adminLoginId">{t('adminLoginID')}</Label>
                <Input 
                  id="edit-adminLoginId" 
                  name="adminLoginId" 
                  value={formData.adminLoginId}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="edit-multipleDeviceAllowed"
                  name="multipleDeviceAllowed"
                  checked={formData.multipleDeviceAllowed}
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="edit-multipleDeviceAllowed">
                  {t('multipleDeviceAllowQ')}
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={updateCompanyMutation.isPending}>
                {updateCompanyMutation.isPending ? t('saving') : t('save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deleteCompany')}</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            {t('deleteConfirmation')} "{selectedCompany?.name}"?
          </DialogDescription>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleteCompanyMutation.isPending}
            >
              {deleteCompanyMutation.isPending ? t('deleting') : t('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanySetup;
