import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Phone, Mail, Package, Shield, Store, Search, Star, MessageSquare, Filter, SlidersHorizontal, X } from "lucide-react";
import { storefrontService } from "@/services/storefrontService";
import { Link } from "react-router-dom";
import { useState, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";

// Memoized FilterDialog component to prevent re-renders
const FilterDialog = memo(({ 
  showFilters, 
  setShowFilters, 
  activeFilters, 
  filters, 
  setFilters, 
  clearFilters,
  sortOptions,
  categories,
  conditions
}: {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  activeFilters: string[];
  filters: any;
  setFilters: (filters: any) => void;
  clearFilters: () => void;
  sortOptions: any[];
  categories: string[];
  conditions: string[];
}) => {
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Ensure focus is properly managed when closing
      setTimeout(() => {
        setShowFilters(false);
      }, 0);
    } else {
      setShowFilters(true);
    }
  };

  return (
    <Dialog open={showFilters} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center space-x-2">
          <Filter className="h-4 w-4" />
          <span>Filter</span>
          {activeFilters.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFilters.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Store Filters</span>
            {activeFilters.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4" />
                Clear All
              </Button>
            )}
          </DialogTitle>
          <DialogDescription>
            Filter and sort products in this store to find exactly what you're looking for.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Search */}
          <div>
            <Label className="text-sm font-medium">Search</Label>
            <Input
              placeholder="Search in this store..."
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              className="mt-2"
            />
          </div>

          {/* Sort Options */}
          <div>
            <Label className="text-sm font-medium">Sort By</Label>
            <Select value={filters.sortBy} onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <div>
            <Label className="text-sm font-medium">Category</Label>
            <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="All Categories" />
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
          </div>

          {/* Condition Filter */}
          <div>
            <Label className="text-sm font-medium">Condition</Label>
            <Select value={filters.condition} onValueChange={(value) => setFilters(prev => ({ ...prev, condition: value }))}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="All Conditions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Conditions</SelectItem>
                {conditions.map((condition) => (
                  <SelectItem key={condition} value={condition}>
                    {condition}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div>
            <Label className="text-sm font-medium">Price Range</Label>
            <div className="mt-2 space-y-2">
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value }))}
                max={1000000}
                step={1000}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>₵{filters.priceRange[0].toLocaleString()}</span>
                <span>₵{filters.priceRange[1].toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Negotiable Filter */}
          <div>
            <Label className="text-sm font-medium">Negotiable</Label>
            <Select value={filters.negotiable === null ? "all" : filters.negotiable ? "yes" : "no"} onValueChange={(value) => {
              const negotiableValue = value === "all" ? null : value === "yes";
              setFilters(prev => ({ ...prev, negotiable: negotiableValue }));
            }}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="yes">Negotiable Only</SelectItem>
                <SelectItem value="no">Fixed Price Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

FilterDialog.displayName = 'FilterDialog';

const Storefront = () => {
  const { storefrontUrl } = useParams<{ storefrontUrl: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priceSort, setPriceSort] = useState("default");
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Enhanced filter states
  const [filters, setFilters] = useState({
    searchQuery: "",
    category: "all",
    condition: "all",
    priceRange: [0, 1000000],
    sortBy: "newest",
    negotiable: null as boolean | null
  });

  const conditions = ["New", "Like New", "Good", "Fair", "Used"];
  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "price_low", label: "Price: Low to High" },
    { value: "price_high", label: "Price: High to Low" },
    { value: "popular", label: "Most Popular" }
  ];

  const { data: storefront, isLoading, error } = useQuery({
    queryKey: ['storefront', storefrontUrl],
    queryFn: () => storefrontService.getStorefrontByUrl(storefrontUrl!),
    enabled: !!storefrontUrl
  });

  const { data: products } = useQuery({
    queryKey: ['storefront-products', storefront?.user_id],
    queryFn: () => storefrontService.getStorefrontProducts(storefront.user_id),
    enabled: !!storefront?.user_id
  });

  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);

  useEffect(() => {
    applyFilters();
  }, [products, filters]);

  const applyFilters = () => {
    if (!products) return;

    let filtered = [...products];

    // Search query filter
    if (filters.searchQuery) {
      filtered = filtered.filter(product => 
        product.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(filters.searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (filters.category && filters.category !== "all") {
      filtered = filtered.filter(product => 
        product.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Condition filter
    if (filters.condition && filters.condition !== "all") {
      filtered = filtered.filter(product => 
        product.condition && product.condition.toLowerCase() === filters.condition.toLowerCase()
      );
    }

    // Price range filter
    filtered = filtered.filter(product => {
      const price = parseFloat(product.price);
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    // Negotiable filter
    if (filters.negotiable !== null) {
      filtered = filtered.filter(product => product.negotiable === filters.negotiable);
    }

    // Sort results
    switch (filters.sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
        break;
      case "price_low":
        filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case "price_high":
        filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case "popular":
        // Sort by views or engagement (if available)
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      default:
        // Default to newest
        filtered.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    }

    setFilteredProducts(filtered);
    updateActiveFilters();
  };

  const updateActiveFilters = () => {
    const active: string[] = [];
    if (filters.searchQuery) active.push(`Search: "${filters.searchQuery}"`);
    if (filters.category && filters.category !== "all") active.push(`Category: ${filters.category}`);
    if (filters.condition && filters.condition !== "all") active.push(`Condition: ${filters.condition}`);
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000000) {
      active.push(`Price: ₵${filters.priceRange[0].toLocaleString()} - ₵${filters.priceRange[1].toLocaleString()}`);
    }
    if (filters.negotiable !== null) active.push(`Negotiable: ${filters.negotiable ? 'Yes' : 'No'}`);
    if (filters.sortBy !== "newest") {
      const sortLabel = sortOptions.find(s => s.value === filters.sortBy)?.label;
      if (sortLabel) active.push(`Sort: ${sortLabel}`);
    }
    setActiveFilters(active);
  };

  const clearFilters = () => {
    setFilters({
      searchQuery: "",
      category: "all",
      condition: "all",
      priceRange: [0, 1000000],
      sortBy: "newest",
      negotiable: null
    });
  };

  // Get unique categories from products
  const categories = [...new Set(products?.map(p => p.category) || [])];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
        <div className="animate-pulse">
          <div className="h-48 bg-primary/10"></div>
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

  if (error || !storefront) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center">
        <Card className="max-w-md mx-auto shadow-lg">
          <CardContent className="text-center py-8">
            <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Storefront Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The storefront you're looking for doesn't exist or is no longer available.
            </p>
            <Button asChild>
              <Link to="/">Browse Products</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const profileData = Array.isArray(storefront.profiles) ? storefront.profiles[0] : storefront.profiles;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/store/${storefrontUrl}/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleCategoryClick = (category: string) => {
    navigate(`/store/${storefrontUrl}/search?category=${encodeURIComponent(category)}`);
  };

  const handleContactClick = () => {
    // Navigate to chat instead of opening phone/email
    navigate(`/chat/${storefront.user_id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Storefront Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profileData?.avatar_url} alt={storefront.business_name} />
                <AvatarFallback className="text-lg font-semibold">
                  {storefront.business_name?.charAt(0) || 'S'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{storefront.business_name}</h1>
                <p className="text-gray-600 mt-1">{storefront.description}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  {storefront.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{storefront.location}</span>
                    </div>
                  )}
                  {profileData?.phone && (
                    <div className="flex items-center space-x-1">
                      <Phone className="h-4 w-4" />
                      <span>{profileData.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {storefront.verified && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <Shield className="h-3 w-3" />
                  <span>Verified</span>
                </Badge>
              )}
              <Button onClick={handleContactClick} className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span>Contact</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search in this store..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>
          
          <div className="flex items-center space-x-3">
            <FilterDialog 
              showFilters={showFilters} 
              setShowFilters={setShowFilters} 
              activeFilters={activeFilters} 
              filters={filters} 
              setFilters={setFilters} 
              clearFilters={clearFilters}
              sortOptions={sortOptions}
              categories={categories}
              conditions={conditions}
            />
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden md:inline">Sort</span>
            </Button>
          </div>
        </div>

        {/* Mobile Active Filters */}
        {isMobile && activeFilters.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {activeFilters.map((filter, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {filter}
              </Badge>
            ))}
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-red-600">
              Clear All
            </Button>
          </div>
        )}

        {/* Desktop Filters */}
        {!isMobile && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Store Filters</span>
                {activeFilters.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {/* Search */}
                <div className="lg:col-span-2">
                  <Label className="text-sm font-medium">Search</Label>
                  <Input
                    placeholder="Search in this store..."
                    value={filters.searchQuery}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                {/* Sort */}
                <div>
                  <Label className="text-sm font-medium">Sort</Label>
                  <Select value={filters.sortBy} onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Category */}
                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="All" />
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
                </div>

                {/* Price Range */}
                <div className="lg:col-span-2">
                  <Label className="text-sm font-medium">Price Range</Label>
                  <div className="mt-1 space-y-2">
                    <Slider
                      value={filters.priceRange}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value }))}
                      max={1000000}
                      step={1000}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>₵{filters.priceRange[0].toLocaleString()}</span>
                      <span>₵{filters.priceRange[1].toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Products Section */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Additional Filters */}
        <div className="mb-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Select value={filters.sortBy} onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by Price" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <span className="text-muted-foreground font-medium">
            {filteredProducts.length} products found
          </span>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                  <img
                    src={product.images?.[0] || '/placeholder.svg'}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">{product.title}</h3>
                  <p className="text-lg font-bold text-blue-600">₵{parseFloat(product.price).toLocaleString()}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{product.category}</span>
                    {product.negotiable && (
                      <Badge variant="outline" className="text-xs">Negotiable</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Storefront;
