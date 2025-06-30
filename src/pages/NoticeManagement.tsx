
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { noticeApi } from '@/services/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Trash2, Edit, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';

const NoticeManagement = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch notices
  const { data: notices = [], isLoading } = useQuery({
    queryKey: ['notices'],
    queryFn: noticeApi.getAll,
  });

  // Create notice mutation
  const createNoticeMutation = useMutation({
    mutationFn: (noticeData: any) => noticeApi.create(noticeData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      setTitle('');
      setContent('');
      toast({
        title: 'Success',
        description: 'Notice has been posted successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to post notice: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Update notice mutation
  const updateNoticeMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => noticeApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      resetForm();
      toast({
        title: 'Success',
        description: 'Notice has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update notice: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Delete notice mutation
  const deleteNoticeMutation = useMutation({
    mutationFn: (id: number) => noticeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      toast({
        title: 'Success',
        description: 'Notice has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to delete notice: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !content) {
      toast({
        title: 'Warning',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    const noticeData = {
      title,
      content,
      postedAt: new Date().toISOString(),
    };

    if (isEditing && editingId) {
      updateNoticeMutation.mutate({ id: editingId, data: noticeData });
    } else {
      createNoticeMutation.mutate(noticeData);
    }
  };

  const handleEdit = (notice: any) => {
    setTitle(notice.title);
    setContent(notice.description);
    setEditingId(notice.id);
    setIsEditing(true);
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setEditingId(null);
    setIsEditing(false);
  };

  return (
    <div className="p-6 space-y-6">
    <h1 className="text-2xl font-bold">{t('noticeManagement')}</h1>
  
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? t('updateNotice') : t('postNewNotice')}</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">{t('title')}</Label>
                <Input
                  id="title"
                  placeholder={t('enterNoticeTitle')}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">{t('content')}</Label>
                <Textarea
                  id="content"
                  placeholder={t('enterNoticeContent')}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={5}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={resetForm} type="button">
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={createNoticeMutation.isPending || updateNoticeMutation.isPending}>
                {(createNoticeMutation.isPending || updateNoticeMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditing ? t('updateNotice') : t('postNotice')}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
  
      <div>
        <h2 className="text-xl font-semibold mb-4">{t('recentNotices')}</h2>
        {isLoading ? (
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : notices.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-md">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <h3 className="text-lg font-medium text-gray-500">{t('noNoticesPostedYet')}</h3>
            <p className="text-gray-400">{t('noticesAppearHere')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notices.map((notice: any) => (
              <Card key={notice.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{notice.title}</CardTitle>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(notice)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteNoticeMutation.mutate(notice.id)}
                        disabled={deleteNoticeMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {format(new Date(notice.created_at), 'PPP')}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line">{notice.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
  
  );
};

export default NoticeManagement;
