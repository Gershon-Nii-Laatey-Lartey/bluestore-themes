
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { categoryService, Category } from "@/services/categoryService";

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  editingCategory: Category | null;
}

export const CategoryFormModal = ({ isOpen, onClose, onSubmit, editingCategory }: CategoryFormModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'category' as 'category' | 'subcategory' | 'subsubcategory',
    parent_id: '',
    active: true
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadParentOptions();
      if (editingCategory) {
        setFormData({
          name: editingCategory.name,
          type: editingCategory.type,
          parent_id: editingCategory.parent_id || '',
          active: editingCategory.active
        });
      } else {
        setFormData({
          name: '',
          type: 'category',
          parent_id: '',
          active: true
        });
      }
    }
  }, [isOpen, editingCategory]);

  const loadParentOptions = async () => {
    try {
      const [categoriesData, subcategoriesData] = await Promise.all([
        categoryService.getCategoriesByType('category'),
        categoryService.getCategoriesByType('subcategory')
      ]);
      setCategories(categoriesData);
      setSubcategories(subcategoriesData);
    } catch (error) {
      console.error('Error loading parent options:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const categoryData = {
        name: formData.name.trim(),
        type: formData.type,
        parent_id: formData.parent_id || null,
        active: formData.active
      };

      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, categoryData);
        toast({
          title: "Success",
          description: "Category updated successfully"
        });
      } else {
        await categoryService.createCategory(categoryData);
        toast({
          title: "Success",
          description: "Category created successfully"
        });
      }

      onSubmit();
      onClose();
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: "Error",
        description: "Failed to save category",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getParentOptions = () => {
    switch (formData.type) {
      case 'subcategory':
        return categories;
      case 'subsubcategory':
        return subcategories;
      default:
        return [];
    }
  };

  const getParentLabel = () => {
    switch (formData.type) {
      case 'subcategory':
        return 'Select Category';
      case 'subsubcategory':
        return 'Select Subcategory';
      default:
        return 'No parent required';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter category name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: 'category' | 'subcategory' | 'subsubcategory') => 
                setFormData({ ...formData, type: value, parent_id: '' })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="category">Category</SelectItem>
                <SelectItem value="subcategory">Subcategory</SelectItem>
                <SelectItem value="subsubcategory">Sub-subcategory</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.type !== 'category' && (
            <div className="space-y-2">
              <Label htmlFor="parent">Parent Category</Label>
              <Select
                value={formData.parent_id}
                onValueChange={(value) => setFormData({ ...formData, parent_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={getParentLabel()} />
                </SelectTrigger>
                <SelectContent>
                  {getParentOptions().map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
            />
            <Label htmlFor="active">Active</Label>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : (editingCategory ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
