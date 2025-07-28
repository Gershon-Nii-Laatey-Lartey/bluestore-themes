
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Search, Star, Shield } from "lucide-react";
import { storefrontService } from "@/services/storefrontService";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const StorefrontSearch = () => {
  const { storefrontUrl } = useParams<{ storefrontUrl: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priceSort, setPriceSort] = useState("default");

  const { data: storefront, isLoading: storefrontLoading } = useQuery({
    queryKey: ['storefront', storefrontUrl],
    queryFn: () => storefrontService.getStorefrontByUrl(storefrontUrl!),
    enabled: !!storefrontUrl
  });

  const { data: products } = useQuery({
    queryKey: ['storefront-products', storefront?.user_id],
    queryFn: () => storefrontService.getStorefrontProducts(storefront.user_id),
    enabled: !!storefront?.user_id
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const query = urlParams.get('q') || '';
    const category = urlParams.get('category') || 'all';
    setSearchQuery(query);
    setCategoryFilter(category);
  }, [location.search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (categoryFilter !== 'all') params.set('category', categoryFilter);
    navigate(`/store/${storefrontUrl}/search?${params.toString()}`);
  };

  const handleBackToStorefront = () => {
    navigate(`/store/${storefrontUrl}`);
  };

  // Filter and sort products
  const filteredProducts = products?.filter(product => {
    const matchesSearch = !searchQuery || product.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (priceSort === "low-high") return parseFloat(a.price) - parseFloat(b.price);
    if (priceSort === "high-low") return parseFloat(b.price) - parseFloat(a.price);
    return 0;
  });

  // Get unique categories from products
  const categories = [...new Set(products?.map(p => p.category) || [])];

  if (storefrontLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
        <div className="animate-pulse">
          <div className="h-20 bg-primary/10"></div>
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-64 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!storefront) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center">
        <Card className="max-w-md mx-auto shadow-lg">
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">Storefront Not Found</h2>
            <Button asChild>
              <Link to="/">Browse Products</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost" 
                size="sm"
                onClick={handleBackToStorefront}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Store
              </Button>
              <Avatar className="h-10 w-10 border-2 border-primary/20">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="text-sm bg-primary/10 text-primary">
                  {storefront.business_name?.charAt(0) || 'S'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-lg font-bold text-foreground">
                  {storefront.business_name}
                </h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span>4.8</span>
                  <Badge variant="secondary" className="text-xs">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/60 backdrop-blur-sm border-white/30 shadow-sm focus:bg-white/80 transition-all"
                />
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priceSort} onValueChange={setPriceSort}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by Price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="low-high">Price: Low to High</SelectItem>
                <SelectItem value="high-low">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredProducts?.length || 0} products found
            {searchQuery && ` for "${searchQuery}"`}
            {categoryFilter !== 'all' && ` in ${categoryFilter}`}
          </div>
        </div>

        {/* Results */}
        {filteredProducts && filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredProducts.map((product) => (
              <Link
                key={product.id}
                to={`/store/${storefrontUrl}/product/${product.id}`}
                className="group"
              >
                <Card className="hover:shadow-lg transition-all duration-200 group-hover:scale-105 border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="aspect-square bg-muted rounded-lg mb-3 overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full flex items-center justify-center text-4xl ${product.images && product.images.length > 0 ? 'hidden' : ''}`}>
                        📱
                      </div>
                    </div>
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {product.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">
                        GHS {parseFloat(product.price?.toString() || '0').toFixed(2)}
                      </span>
                      <Badge variant="outline" className="text-xs capitalize">
                        {product.condition}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="shadow-sm">
            <CardContent className="text-center py-16">
              <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or filters.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StorefrontSearch;
