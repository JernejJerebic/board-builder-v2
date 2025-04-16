import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchColors, updateColorStatus, createColor, updateColor, deleteColor } from '@/services/api';
import { Color } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Search, Plus, Edit, Trash, Power, Loader2, Save } from 'lucide-react';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const colorSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Ime barve je obvezno"),
  htmlColor: z.string().min(1, "HTML barva je obvezna"),
  thickness: z.number().min(1, "Debelina mora biti večja od 0"),
  priceWithoutVat: z.number().min(0, "Cena ne more biti negativna"),
  priceWithVat: z.number().min(0, "Cena ne more biti negativna"),
  active: z.boolean().default(true),
  imageUrl: z.string().optional(),
});

type ColorFormValues = z.infer<typeof colorSchema>;

const ColorsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState<Color | null>(null);
  const [colorToDelete, setColorToDelete] = useState<Color | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const queryClient = useQueryClient();
  
  const form = useForm<ColorFormValues>({
    resolver: zodResolver(colorSchema),
    defaultValues: {
      title: '',
      htmlColor: '#d2b48c',
      thickness: 18,
      priceWithoutVat: 0,
      priceWithVat: 0,
      active: true,
    },
  });
  
  const { data: colors, isLoading } = useQuery({
    queryKey: ['colors'],
    queryFn: fetchColors
  });
  
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => 
      updateColorStatus(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colors'] });
      toast.success('Status barve posodobljen');
    },
    onError: () => {
      toast.error('Napaka pri posodobitvi statusa barve');
    }
  });
  
  const saveMutation = useMutation({
    mutationFn: (data: ColorFormValues) => {
      // Calculate VAT price if not provided
      if (data.priceWithoutVat && !data.priceWithVat) {
        data.priceWithVat = data.priceWithoutVat * 1.22;
      }

      if (data.id) {
        return updateColor(data.id, {
          name: data.title,
          title: data.title,
          htmlColor: data.htmlColor,
          thickness: data.thickness,
          priceWithoutVat: data.priceWithoutVat,
          priceWithVat: data.priceWithVat,
          imageUrl: data.imageUrl
        });
      } else {
        return createColor({
          name: data.title,
          title: data.title,
          htmlColor: data.htmlColor,
          thickness: data.thickness,
          priceWithoutVat: data.priceWithoutVat,
          priceWithVat: data.priceWithVat,
          imageUrl: data.imageUrl
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colors'] });
      setIsEditDialogOpen(false);
      toast.success(currentColor ? 'Barva posodobljena' : 'Barva dodana');
    },
    onError: (error) => {
      console.error('Error saving color:', error);
      toast.error('Napaka pri shranjevanju barve');
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteColor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colors'] });
      setIsDeleteDialogOpen(false);
      toast.success('Barva je bila izbrisana');
    },
    onError: () => {
      toast.error('Napaka pri brisanju barve');
    }
  });
  
  const handleToggleActive = (id: string, currentStatus: boolean) => {
    updateStatusMutation.mutate({ id, active: !currentStatus });
  };
  
  const handleEditColor = (color: Color) => {
    setCurrentColor(color);
    form.reset({
      id: color.id,
      title: color.title,
      htmlColor: color.htmlColor || '#d2b48c',
      thickness: color.thickness,
      priceWithoutVat: color.priceWithoutVat,
      priceWithVat: color.priceWithVat,
      active: color.active,
      imageUrl: color.imageUrl || '',
    });
    setIsEditDialogOpen(true);
  };
  
  const handleNewColor = () => {
    setCurrentColor(null);
    form.reset({
      title: '',
      htmlColor: '#d2b48c',
      thickness: 18,
      priceWithoutVat: 0,
      priceWithVat: 0,
      active: true,
      imageUrl: '',
    });
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteClick = (color: Color) => {
    setColorToDelete(color);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = () => {
    if (colorToDelete) {
      deleteMutation.mutate(colorToDelete.id);
    }
  };
  
  const onSubmit = (data: ColorFormValues) => {
    saveMutation.mutate(data);
  };
  
  const filteredColors = colors?.filter(color =>
    color.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Barve in materiali</h1>
          <p className="text-gray-500">Upravljajte materiale in barve vaših plošč</p>
        </div>
        
        <Button onClick={handleNewColor}>
          <Plus className="mr-2 h-4 w-4" /> Dodaj barvo
        </Button>
      </div>
      
      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input
          placeholder="Iskanje barv..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
        <Button type="submit" size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border">
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Barva/Material</TableHead>
                <TableHead>Predogled</TableHead>
                <TableHead>Debelina</TableHead>
                <TableHead>Cena (brez DDV)</TableHead>
                <TableHead>Cena (z DDV)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dejanja</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredColors && filteredColors.length > 0 ? (
                filteredColors.map((color) => (
                  <TableRow key={color.id} className={!color.active ? 'opacity-60' : ''}>
                    <TableCell>{color.id}</TableCell>
                    <TableCell>{color.title}</TableCell>
                    <TableCell>
                      <div
                        className="w-10 h-10 rounded border border-gray-300"
                        style={{ backgroundColor: color.htmlColor || '#d2b48c' }}
                      />
                    </TableCell>
                    <TableCell>{color.thickness}mm</TableCell>
                    <TableCell>€{color.priceWithoutVat.toFixed(2)}</TableCell>
                    <TableCell>€{color.priceWithVat.toFixed(2)}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          color.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {color.active ? 'Aktivna' : 'Neaktivna'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditColor(color)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleToggleActive(color.id, color.active)}
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500"
                          onClick={() => handleDeleteClick(color)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    Ni najdenih barv
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{currentColor ? 'Uredi barvo' : 'Dodaj novo barvo'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ime barve</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="htmlColor"
                  render={({ field }) => (
                    <FormItem className="flex flex-col space-y-1.5">
                      <FormLabel>Barva</FormLabel>
                      <div className="flex items-center gap-3">
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <div
                          className="w-10 h-10 rounded border border-gray-300"
                          style={{ backgroundColor: field.value || '#d2b48c' }}
                        />
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="thickness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Debelina (mm)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="priceWithoutVat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cena brez DDV (€)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            {...field} 
                            onChange={(e) => {
                              const value = Number(e.target.value);
                              field.onChange(value);
                              // Update price with VAT
                              form.setValue('priceWithVat', Number((value * 1.22).toFixed(2)));
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="priceWithVat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cena z DDV (€)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            {...field} 
                            onChange={(e) => {
                              const value = Number(e.target.value);
                              field.onChange(value);
                              // Update price without VAT
                              form.setValue('priceWithoutVat', Number((value / 1.22).toFixed(2)));
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL slike (neobvezno)</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Shrani
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ali ste prepričani?</AlertDialogTitle>
            <AlertDialogDescription>
              To dejanje bo trajno izbrisalo barvo "{colorToDelete?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Prekliči</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteMutation.isPending ? 
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
                <Trash className="mr-2 h-4 w-4" />
              }
              Izbriši
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ColorsPage;
