
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tag, Plus, ChevronRight, ChevronDown, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { categoryService, Category } from "@/services/categoryService";
import { CategoryFormModal } from "./CategoryFormModal";

const CategoryManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());
  const [categoryChildren, setCategoryChildren] = useState<Record<string, Category[]>>({});
  const [subcategoryChildren, setSubcategoryChildren] = useState<Record<string, Category[]>>({});
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const allCategories = await categoryService.getAllCategories();
      
      // Separate categories by type
      const rootCategories = allCategories.filter(cat => cat.type === 'category');
      const subcategories = allCategories.filter(cat => cat.type === 'subcategory');
      const subsubcategories = allCategories.filter(cat => cat.type === 'subsubcategory');
      
      setCategories(rootCategories);
      
      // Group subcategories by parent category
      const categorySubcategoriesMap: Record<string, Category[]> = {};
      subcategories.forEach(subcat => {
        if (subcat.parent_id) {
          if (!categorySubcategoriesMap[subcat.parent_id]) {
            categorySubcategoriesMap[subcat.parent_id] = [];
          }
          categorySubcategoriesMap[subcat.parent_id].push(subcat);
        }
      });
      setCategoryChildren(categorySubcategoriesMap);
      
      // Group sub-subcategories by parent subcategory
      const subcategorySubsubcategoriesMap: Record<string, Category[]> = {};
      subsubcategories.forEach(subsubcat => {
        if (subsubcat.parent_id) {
          if (!subcategorySubsubcategoriesMap[subsubcat.parent_id]) {
            subcategorySubsubcategoriesMap[subsubcat.parent_id] = [];
          }
          subcategorySubsubcategoriesMap[subsubcat.parent_id].push(subsubcat);
        }
      });
      setSubcategoryChildren(subcategorySubsubcategoriesMap);
      
    } catch (error) {
      console.error('Error loading categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleSubcategory = (subcategoryId: string) => {
    const newExpanded = new Set(expandedSubcategories);
    if (newExpanded.has(subcategoryId)) {
      newExpanded.delete(subcategoryId);
    } else {
      newExpanded.add(subcategoryId);
    }
    setExpandedSubcategories(newExpanded);
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleDeleteCategory = async (category: Category) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"? This will also delete all child categories.`)) {
      return;
    }

    try {
      await categoryService.deleteCategory(category.id);
      toast({
        title: "Success",
        description: `${category.name} has been deleted successfully.`
      });
      await loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive"
      });
    }
  };

  const handleToggleActive = async (category: Category) => {
    try {
      await categoryService.toggleCategoryActive(category.id, !category.active);
      toast({
        title: "Success",
        description: `${category.name} has been ${!category.active ? 'activated' : 'deactivated'}.`
      });
      await loadCategories();
    } catch (error) {
      console.error('Error toggling category status:', error);
      toast({
        title: "Error",
        description: "Failed to update category status",
        variant: "destructive"
      });
    }
  };

  const handleFormSubmit = async () => {
    setIsFormOpen(false);
    await loadCategories();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Tag className="h-5 w-5" />
                <span>Category Management</span>
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Manage categories, subcategories, and sub-subcategories hierarchically
              </p>
            </div>
            <Button onClick={handleAddCategory}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="border rounded-lg">
                <div className="flex items-center justify-between p-4 hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCategory(category.id)}
                      className="p-1"
                    >
                      {expandedCategories.has(category.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{category.name}</span>
                        <Badge variant="outline">Category</Badge>
                        {!category.active && <Badge variant="destructive">Inactive</Badge>}
                      </div>
                      <div className="text-sm text-gray-500">
                        {categoryChildren[category.id]?.length || 0} subcategories
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(category)}
                    >
                      {category.active ? (
                        <ToggleRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ToggleLeft className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditCategory(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCategory(category)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {expandedCategories.has(category.id) && categoryChildren[category.id] && (
                  <div className="border-t bg-gray-50">
                    {categoryChildren[category.id].map((subcategory) => (
                      <div key={subcategory.id} className="ml-8 border-b last:border-b-0">
                        <div className="flex items-center justify-between p-3 hover:bg-gray-100">
                          <div className="flex items-center space-x-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleSubcategory(subcategory.id)}
                              className="p-1"
                            >
                              {expandedSubcategories.has(subcategory.id) ? (
                                <ChevronDown className="h-3 w-3" />
                              ) : (
                                <ChevronRight className="h-3 w-3" />
                              )}
                            </Button>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-sm">{subcategory.name}</span>
                                <Badge variant="secondary" className="text-xs">Subcategory</Badge>
                                {!subcategory.active && <Badge variant="destructive" className="text-xs">Inactive</Badge>}
                              </div>
                              <div className="text-xs text-gray-500">
                                {subcategoryChildren[subcategory.id]?.length || 0} sub-subcategories
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleActive(subcategory)}
                              className="p-1"
                            >
                              {subcategory.active ? (
                                <ToggleRight className="h-3 w-3 text-green-600" />
                              ) : (
                                <ToggleLeft className="h-3 w-3 text-gray-400" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditCategory(subcategory)}
                              className="p-1"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCategory(subcategory)}
                              className="text-red-600 hover:text-red-700 p-1"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {expandedSubcategories.has(subcategory.id) && subcategoryChildren[subcategory.id] && (
                          <div className="ml-8 bg-gray-100">
                            {subcategoryChildren[subcategory.id].map((subsubcategory) => (
                              <div key={subsubcategory.id} className="flex items-center justify-between p-2 border-b last:border-b-0 hover:bg-gray-200">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm">{subsubcategory.name}</span>
                                  <Badge variant="outline" className="text-xs">Sub-subcategory</Badge>
                                  {!subsubcategory.active && <Badge variant="destructive" className="text-xs">Inactive</Badge>}
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleToggleActive(subsubcategory)}
                                    className="p-1"
                                  >
                                    {subsubcategory.active ? (
                                      <ToggleRight className="h-3 w-3 text-green-600" />
                                    ) : (
                                      <ToggleLeft className="h-3 w-3 text-gray-400" />
                                    )}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditCategory(subsubcategory)}
                                    className="p-1"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteCategory(subsubcategory)}
                                    className="text-red-600 hover:text-red-700 p-1"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <CategoryFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        editingCategory={editingCategory}
      />
    </div>
  );
};

export default CategoryManagement;
