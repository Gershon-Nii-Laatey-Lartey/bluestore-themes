
import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { useParams } from "react-router-dom";
import { Filter, SlidersHorizontal, X, ChevronDown, MapPin, DollarSign, Calendar, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/ProductGrid";
import { useState, useEffect, memo } from "react";
import { productService } from "@/services/productService";
import { ProductSubmission } from "@/types/product";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUserLocation } from "@/hooks/useUserLocation";

// Memoized FilterDialog component to prevent re-renders
const FilterDialog = memo(({ 
  showFilters, 
  setShowFilters, 
  activeFilters, 
  filters, 
  setFilters, 
  clearFilters,
  sortOptions,
  conditions,
  dateRanges 
}: {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  activeFilters: string[];
  filters: any;
  setFilters: (filters: any) => void;
  clearFilters: () => void;
  sortOptions: any[];
  conditions: string[];
  dateRanges: any[];
}) => {
  const isMobile = useIsMobile();
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
    <DialogContent
      className={
        isMobile
          ? "dialog-slide-in-up bg-background z-50 rounded-2xl mt-4 mb-4 mx-auto max-w-[calc(100vw-1rem)]"
          : "max-w-md max-h-[80vh] overflow-y-auto"
      }
    >
      <DialogHeader>
        <DialogTitle className="flex items-center justify-between">
          <span>Filters & Sort</span>
          {activeFilters.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4" />
              Clear All
            </Button>
          )}
        </DialogTitle>
        <DialogDescription>
          Filter and sort products in this category to find exactly what you're looking for.
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-6">
        {/* Search */}
        <div>
          <Label className="text-sm font-medium">Search</Label>
          <Input
            placeholder="Search in this category..."
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

        {/* Location Filter */}
        <div>
          <Label className="text-sm font-medium">Location</Label>
          <Input
            placeholder="Enter location..."
            value={filters.location}
            onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
            className="mt-2"
          />
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

        {/* Date Range */}
        <div>
          <Label className="text-sm font-medium">Date Posted</Label>
          <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dateRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </DialogContent>
  </Dialog>
  );
});

FilterDialog.displayName = 'FilterDialog';

const CategoryPage = () => {
  const { category } = useParams();
  const [products, setProducts] = useState<ProductSubmission[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const { userLocation } = useUserLocation();
  const isMobile = useIsMobile();
  
  const categoryName = category?.replace('-', ' ') || 'Category';
  const formattedCategory = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);

  // Filter states
  const [filters, setFilters] = useState({
    condition: "all",
    priceRange: [0, 1000000],
    location: "",
    negotiable: null as boolean | null,
    sortBy: "newest",
    dateRange: "all",
    searchQuery: ""
  });

  const conditions = ["New", "Like New", "Good", "Fair", "Used"];
  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "price_low", label: "Price: Low to High" },
    { value: "price_high", label: "Price: High to Low" },
    { value: "location", label: "Nearest First" },
    { value: "popular", label: "Most Popular" }
  ];

  const dateRanges = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "year", label: "This Year" }
  ];

  // Category-specific SEO data
  const getCategorySEOData = (category: string) => {
    const categoryData = {
      'smartphones': {
        title: 'Smartphones for Sale in Ghana | BlueStore',
        description: 'Buy and sell smartphones in Ghana. Find the latest iPhones, Samsung, Huawei, and other mobile phones at great prices on BlueStore.',
        keywords: 'smartphones Ghana, mobile phones Ghana, iPhone Ghana, Samsung Ghana, buy phones Ghana, sell phones Ghana'
      },
      'laptops': {
        title: 'Laptops for Sale in Ghana | BlueStore',
        description: 'Buy and sell laptops in Ghana. Find Dell, HP, Lenovo, MacBook, and other laptops at competitive prices on BlueStore.',
        keywords: 'laptops Ghana, computers Ghana, Dell Ghana, HP Ghana, MacBook Ghana, buy laptop Ghana'
      },
      'electronics': {
        title: 'Electronics for Sale in Ghana | BlueStore',
        description: 'Buy and sell electronics in Ghana. Find TVs, cameras, speakers, and other electronic devices at great prices on BlueStore.',
        keywords: 'electronics Ghana, gadgets Ghana, TVs Ghana, cameras Ghana, speakers Ghana'
      },
      'fashion': {
        title: 'Fashion & Clothing for Sale in Ghana | BlueStore',
        description: 'Buy and sell fashion items in Ghana. Find clothes, shoes, bags, and accessories at great prices on BlueStore.',
        keywords: 'fashion Ghana, clothes Ghana, shoes Ghana, bags Ghana, accessories Ghana'
      },
      'automotive': {
        title: 'Automotive Parts for Sale in Ghana | BlueStore',
        description: 'Buy and sell automotive parts in Ghana. Find car parts, motorcycle parts, and accessories at competitive prices on BlueStore.',
        keywords: 'automotive Ghana, car parts Ghana, motorcycle parts Ghana, auto accessories Ghana'
      },
      'gaming': {
        title: 'Gaming Equipment for Sale in Ghana | BlueStore',
        description: 'Buy and sell gaming equipment in Ghana. Find consoles, games, controllers, and gaming accessories at great prices on BlueStore.',
        keywords: 'gaming Ghana, consoles Ghana, games Ghana, controllers Ghana, gaming accessories Ghana'
      },
      'headphones': {
        title: 'Headphones & Audio for Sale in Ghana | BlueStore',
        description: 'Buy and sell headphones and audio equipment in Ghana. Find wireless headphones, speakers, and audio accessories at great prices on BlueStore.',
        keywords: 'headphones Ghana, audio Ghana, wireless headphones Ghana, speakers Ghana, audio accessories Ghana'
      },
      'home-garden': {
        title: 'Home & Garden Items for Sale in Ghana | BlueStore',
        description: 'Buy and sell home and garden items in Ghana. Find furniture, tools, plants, and home accessories at great prices on BlueStore.',
        keywords: 'home garden Ghana, furniture Ghana, tools Ghana, plants Ghana, home accessories Ghana'
      },
      'sports': {
        title: 'Sports Equipment for Sale in Ghana | BlueStore',
        description: 'Buy and sell sports equipment in Ghana. Find football gear, gym equipment, outdoor sports items at great prices on BlueStore.',
        keywords: 'sports Ghana, football Ghana, gym equipment Ghana, outdoor sports Ghana'
      },
      'clearance': {
        title: 'Clearance Sale Items in Ghana | BlueStore',
        description: 'Find amazing deals on clearance items in Ghana. Discounted electronics, fashion, and more at unbeatable prices on BlueStore.',
        keywords: 'clearance Ghana, deals Ghana, discounted items Ghana, sales Ghana'
      }
    };
    
    return categoryData[category as keyof typeof categoryData] || {
      title: `${formattedCategory} for Sale in Ghana | BlueStore`,
      description: `Buy and sell ${categoryName} in Ghana. Find great deals and competitive prices on BlueStore.`,
      keywords: `${categoryName} Ghana, buy ${categoryName} Ghana, sell ${categoryName} Ghana`
    };
  };
  
  const seoData = getCategorySEOData(category || '');
  
  // Structured data for category page
  const categoryStructuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${formattedCategory} for Sale in Ghana`,
    "description": seoData.description,
    "url": `https://bluestoregh.web.app/category/${category}`,
    "mainEntity": {
      "@type": "ItemList",
      "name": `${formattedCategory} Products`,
      "description": `Products in ${formattedCategory} category`,
      "numberOfItems": products.length,
      "itemListElement": products.slice(0, 10).map((product, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Product",
          "name": product.title,
          "description": product.description,
          "image": product.images?.[0] || "",
          "offers": {
            "@type": "Offer",
            "price": product.price,
            "priceCurrency": "GHS"
          }
        }
      }))
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      if (!category) return;
      
      try {
        setLoading(true);
        setError(null);
        const categoryProducts = await productService.getProductsByCategory(category);
        setProducts(categoryProducts);
      } catch (err) {
        console.error('Error fetching category products:', err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  useEffect(() => {
    applyFilters();
  }, [products, filters]);

  const applyFilters = () => {
    let filtered = [...products];

    // Search query filter
    if (filters.searchQuery) {
      filtered = filtered.filter(product => 
        product.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(filters.searchQuery.toLowerCase())
      );
    }

    // Condition filter
    if (filters.condition && filters.condition !== "all") {
      filtered = filtered.filter(product => 
        product.condition.toLowerCase() === filters.condition.toLowerCase()
      );
    }

    // Price range filter
    filtered = filtered.filter(product => 
      product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    );

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(product => 
        product.location && product.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Negotiable filter
    if (filters.negotiable !== null) {
      filtered = filtered.filter(product => product.negotiable === filters.negotiable);
    }

    // Date range filter
    if (filters.dateRange !== "all") {
      const now = new Date();
      let cutoffDate = new Date();
      
      switch (filters.dateRange) {
        case "today":
          cutoffDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case "month":
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case "year":
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(product => 
        new Date(product.created_at) >= cutoffDate
      );
    }

    // Sort results
    switch (filters.sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "price_low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price_high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "location":
        // Sort by location relevance (closest to user location first)
        if (userLocation) {
          filtered.sort((a, b) => {
            const aLocation = a.location?.toLowerCase() || "";
            const bLocation = b.location?.toLowerCase() || "";
            const userLoc = userLocation.toLowerCase();
            
            const aMatch = aLocation.includes(userLoc);
            const bMatch = bLocation.includes(userLoc);
            
            if (aMatch && !bMatch) return -1;
            if (!aMatch && bMatch) return 1;
            return 0;
          });
        }
        break;
      case "popular":
        // Sort by views or engagement (if available)
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      default:
        // Default to newest
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    setFilteredProducts(filtered);
    updateActiveFilters();
  };

  const updateActiveFilters = () => {
    const active: string[] = [];
    if (filters.condition && filters.condition !== "all") active.push(`Condition: ${filters.condition}`);
    if (filters.location) active.push(`Location: ${filters.location}`);
    if (filters.negotiable !== null) active.push(`Negotiable: ${filters.negotiable ? 'Yes' : 'No'}`);
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000000) {
      active.push(`Price: ₵${filters.priceRange[0].toLocaleString()} - ₵${filters.priceRange[1].toLocaleString()}`);
    }
    if (filters.dateRange !== "all") {
      const dateLabel = dateRanges.find(d => d.value === filters.dateRange)?.label;
      if (dateLabel) active.push(`Date: ${dateLabel}`);
    }
    if (filters.sortBy !== "newest") {
      const sortLabel = sortOptions.find(s => s.value === filters.sortBy)?.label;
      if (sortLabel) active.push(`Sort: ${sortLabel}`);
    }
    if (filters.searchQuery) active.push(`Search: "${filters.searchQuery}"`);
    setActiveFilters(active);
  };

  const clearFilters = () => {
    setFilters({
      condition: "all",
      priceRange: [0, 1000000],
      location: "",
      negotiable: null,
      sortBy: "newest",
      dateRange: "all",
      searchQuery: ""
    });
  };
  
  return (
    <>
      <SEOHead
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        url={`https://bluestoregh.web.app/category/${category}`}
        structuredData={categoryStructuredData}
      />
      <Layout>
        <div className="md:hidden -m-4 mb-4">
          <MobileHeader />
        </div>
        
        <div className="animate-fade-in space-y-6">
          {/* Category Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{formattedCategory}</h1>
              <p className="text-gray-600 mt-1">Discover the best {categoryName} products</p>
            </div>
            {/* Desktop filter/sort buttons */}
            {!isMobile && (
              <div className="flex items-center space-x-3">
                <FilterDialog 
                  showFilters={showFilters} 
                  setShowFilters={setShowFilters} 
                  activeFilters={activeFilters} 
                  filters={filters} 
                  setFilters={setFilters} 
                  clearFilters={clearFilters}
                  sortOptions={sortOptions}
                  conditions={conditions}
                  dateRanges={dateRanges}
                />
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="hidden md:inline">Sort</span>
                </Button>
              </div>
            )}
          </div>
          {/* Mobile Filters */}
          {isMobile && (
            <div className="md:hidden">
              <div className="flex items-center space-x-3 mb-4">
                <FilterDialog 
                  showFilters={showFilters} 
                  setShowFilters={setShowFilters} 
                  activeFilters={activeFilters} 
                  filters={filters} 
                  setFilters={setFilters} 
                  clearFilters={clearFilters}
                  sortOptions={sortOptions}
                  conditions={conditions}
                  dateRanges={dateRanges}
                />
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>Sort</span>
                </Button>
              </div>
              {/* Active Filters */}
              {activeFilters.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
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
            </div>
          )}

          {/* Desktop Filters */}
          {!isMobile && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Filters & Sort</span>
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
                      placeholder="Search in this category..."
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

                  {/* Condition */}
                  <div>
                    <Label className="text-sm font-medium">Condition</Label>
                    <Select value={filters.condition} onValueChange={(value) => setFilters(prev => ({ ...prev, condition: value }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="All" />
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

          {/* Products Grid */}
          {error ? (
            <div className="text-center py-12 text-red-500">
              {error}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {filteredProducts.length} products found
                  {filters.searchQuery && ` for "${filters.searchQuery}"`}
                </h2>
                {activeFilters.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {activeFilters.map((filter, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {filter}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <ProductGrid products={filteredProducts} loading={loading} />
            </div>
          )}
        </div>
      </Layout>
    </>
  );
};

export default CategoryPage;
