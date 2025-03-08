
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchColors, updateColorStatus } from '@/services/api';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Search, Plus, Edit, Trash, Power, Loader2 } from 'lucide-react';

const ColorsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const queryClient = useQueryClient();
  
  const { data: colors, isLoading } = useQuery({
    queryKey: ['colors'],
    queryFn: fetchColors
  });
  
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => 
      updateColorStatus(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colors'] });
      toast.success('Color status updated');
    },
    onError: () => {
      toast.error('Failed to update color status');
    }
  });
  
  const handleToggleActive = (id: string, currentStatus: boolean) => {
    updateStatusMutation.mutate({ id, active: !currentStatus });
  };
  
  const filteredColors = colors?.filter(color =>
    color.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Colors & Materials</h1>
          <p className="text-gray-500">Manage your available board materials and colors</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Color
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Color/Material</DialogTitle>
            </DialogHeader>
            {/* Color form would go here in a real implementation */}
            <div className="space-y-4 py-4">
              <p className="text-sm text-gray-500">Color form implementation is out of scope for this prototype</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input
          placeholder="Search colors..."
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
                <TableHead>Color/Material</TableHead>
                <TableHead>Preview</TableHead>
                <TableHead>Thickness</TableHead>
                <TableHead>Price (w/o VAT)</TableHead>
                <TableHead>Price (with VAT)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
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
                        {color.active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleToggleActive(color.id, color.active)}
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    No colors found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default ColorsPage;
