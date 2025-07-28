import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Search, Filter, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { dataService, ProductSubmission } from "@/services/dataService";
import { Link } from "react-router-dom";

const ProductCatalog = () => {
  const [products, setProducts] = useState<ProductSubmission[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, statusFilter, categoryFilter]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await dataService.getProductSubmissions();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(product => product.status === statusFilter);
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    setFilteredProducts(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatPrice = (price: number) => {
    return `GHS ${price.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const categories = [...new Set(products.map(p => p.category))];

  if (loading) {
    return (
      <Layout>
        <div className="animate-fade-in space-y-8">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="animate-fade-in space-y-8">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Product Catalog</h1>
              <p className="text-gray-600 mt-1">Browse and manage all products in the marketplace</p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="text-sm">
                Total Products: {products.length}
              </Badge>
              <Button onClick={loadProducts} variant="outline" size="sm">
                Refresh
              </Button>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>All Products</span>
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="border hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    {product.images && product.images.length > 0 && (
                      <div className="aspect-square rounded-lg bg-gray-100 mb-4 overflow-hidden">
                        <img 
                          src={product.images[product.main_image_index || 0]} 
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                          {product.title}
                        </h3>
                        <Badge className={`text-xs ${getStatusColor(product.status)}`}>
                          {product.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-lg text-green-600">
                          {formatPrice(product.price)}
                        </span>
                        <span className="text-xs text-gray-500">{product.category}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{formatDate(product.submittedAt)}</span>
                        <span>{product.location}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1" asChild>
                          <Link to={`/product/${product.id}`}>
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {filteredProducts.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No products found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ProductCatalog;
