import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import useStore from '@/lib/store';
const renameSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty.').max(100, 'Title is too long.'),
});
type RenameFormValues = z.infer<typeof renameSchema>;
interface RenameSessionDialogProps {
  sessionId?: string;
  currentTitle?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export function RenameSessionDialog({ sessionId, currentTitle, open, onOpenChange }: RenameSessionDialogProps) {
  const renameSession = useStore(s => s.renameSession);
  const form = useForm<RenameFormValues>({
    resolver: zodResolver(renameSchema),
    defaultValues: {
      title: currentTitle || '',
    },
  });
  useEffect(() => {
    if (open) {
      form.reset({ title: currentTitle || '' });
    }
  }, [open, currentTitle, form]);
  const onSubmit = (data: RenameFormValues) => {
    if (sessionId && data.title.trim() !== currentTitle) {
      renameSession(sessionId, data.title.trim());
    }
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Rename Chat</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Name</FormLabel>
                    <FormControl className="col-span-3">
                      <Input {...field} autoFocus />
                    </FormControl>
                    <FormMessage className="col-span-3 col-start-2" />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}