import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PenLine, Trash2, Plus } from 'lucide-react';
import { departmentApi, locationApi, employeeApi,shiftApi } from '@/services/api';

interface Shift {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
}

const ShiftManagement = () => {
  const { t } = useLanguage();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const response = await shiftApi.getAll();
      //console.log("response",response)
      setShifts(response);
    } catch (error) {
      console.error('Failed to fetch shifts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddShift = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const newShift = {
      name: formData.get('name') as string,
      startTime: formData.get('startTime') as string,
      endTime: formData.get('endTime') as string,
    };

    try {
      await shiftApi.create(newShift)
      fetchShifts();
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Failed to add shift:', error);
    }
  };

  const handleUpdateShift = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedShift) return;

    const formData = new FormData(e.currentTarget);

    const updatedShift = {
      name: formData.get('name') as string,
      startTime: formData.get('startTime') as string,
      endTime: formData.get('endTime') as string,
    };

    try {
      // await apiRequest(`/shifts/${selectedShift.id}`, {
      //   method: 'PUT',
      //   body: JSON.stringify(updatedShift),
      // });
      await shiftApi.update(selectedShift.id,updatedShift)
      fetchShifts();
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Failed to update shift:', error);
    }
  };

  const handleDeleteShift = async () => {
    if (!selectedShift) return;
    try {
      await shiftApi.delete(selectedShift.id);
      fetchShifts();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete shift:', error);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">{t('shifts')}</h1>

      <div className="flex justify-end mb-6">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1">
              <Plus className="h-4 w-4" />
              {t('addShift')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('addShift')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddShift} className="space-y-4 py-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">{t('shiftName')}</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="startTime">{t('startTime')}</Label>
                  <Input id="startTime" name="startTime" type="time" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endTime">{t('endTime')}</Label>
                  <Input id="endTime" name="endTime" type="time" required />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  {t('cancel')}
                </Button>
                <Button type="submit">{t('save')}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('shiftName')}</TableHead>
              <TableHead>{t('startTime')}</TableHead>
              <TableHead>{t('endTime')}</TableHead>
              <TableHead>{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10">
                  Loading...
                </TableCell>
              </TableRow>
            ) : shifts.length > 0 ? (
              shifts.map(shift => (
                <TableRow key={shift.id}>
                  <TableCell>{shift.name}</TableCell>
                  <TableCell>{shift.startTime}</TableCell>
                  <TableCell>{shift.endTime}</TableCell>
                  <TableCell className="space-x-2">
                    <Dialog open={isEditDialogOpen && selectedShift?.id === shift.id} onOpenChange={(open) => {
                      setIsEditDialogOpen(open);
                      if (open) setSelectedShift(shift);
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedShift(shift)}>
                          <PenLine className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{t('updateShift')}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleUpdateShift} className="space-y-4 py-4">
                          <div className="grid gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="edit-name">{t('shiftName')}</Label>
                              <Input 
                                id="edit-name" 
                                name="name" 
                                defaultValue={selectedShift?.name} 
                                required 
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="edit-startTime">{t('startTime')}</Label>
                              <Input 
                                id="edit-startTime" 
                                name="startTime" 
                                type="time" 
                                defaultValue={selectedShift?.startTime} 
                                required 
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="edit-endTime">{t('endTime')}</Label>
                              <Input 
                                id="edit-endTime" 
                                name="endTime" 
                                type="time" 
                                defaultValue={selectedShift?.endTime} 
                                required 
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                              {t('cancel')}
                            </Button>
                            <Button type="submit">{t('save')}</Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={isDeleteDialogOpen && selectedShift?.id === shift.id} onOpenChange={(open) => {
                      setIsDeleteDialogOpen(open);
                      if (open) setSelectedShift(shift);
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedShift(shift)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{t('deleteShift')}</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                          <p>{t('confirmDelete', { name: shift.name })}</p>
                        </div>
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            {t('cancel')}
                          </Button>
                          <Button type="button" variant="destructive" onClick={handleDeleteShift}>
                            {t('delete')}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10">
                  No shifts available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ShiftManagement;
