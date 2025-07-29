
import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { Filter, SlidersHorizontal, X, ChevronDown, MapPin, DollarSign, Calendar, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { useState, useEffect, memo } from "react";
import { productService } from "@/services/productService";
import { ProductSubmission } from "@/types/product";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useSearchParams } from "react-router-dom";
import { searchService } from "@/services/searchService";
import { useUserLocation } from "@/hooks/useUserLocation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
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
  categories: string[];
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
            Filter and sort search results to find exactly what you're looking for.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
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

const Search = () => {
  const [searchResults, setSearchResults] = useState<ProductSubmission[]>([]);
  const [filteredResults, setFilteredResults] = useState<ProductSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const { toast } = useToast();
  const location = useLocation();
  const { userLocation } = useUserLocation();
  const isMobile = useIsMobile();

  // Filter states
  const [filters, setFilters] = useState({
    category: "all",
    condition: "all",
    priceRange: [0, 1000000],
    location: "",
    negotiable: null as boolean | null,
    sortBy: "relevance",
    dateRange: "all"
  });

  const categories = [
    "Electronics", "Fashion", "Home & Garden", "Automotive", "Sports", 
    "Books", "Health & Beauty", "Toys & Games", "Pets", "Services",
    "Real Estate", "Jobs", "Education", "Entertainment", "Other"
  ];

  const conditions = ["New", "Like New", "Good", "Fair", "Used"];
  const sortOptions = [
    { value: "relevance", label: "Most Relevant" },
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "price_low", label: "Price: Low to High" },
    { value: "price_high", label: "Price: High to Low" },
    { value: "location", label: "Nearest First" }
  ];

  const dateRanges = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "year", label: "This Year" }
  ];

  useEffect(() => {
    loadSearchResults();
  }, [location.search]);

  useEffect(() => {
    applyFilters();
  }, [searchResults, filters]);

  const loadSearchResults = async () => {
    try {
      console.log('Search: Loading search results...');
      setLoading(true);
      
      // Get search query from URL parameters
      const urlParams = new URLSearchParams(location.search);
      const query = urlParams.get('q') || '';
      setSearchQuery(query);

      if (query) {
        // Add to search history with current location
        await searchService.addToHistory(query, userLocation);
        
        // For now, we'll filter featured products by the search query
        // In a real implementation, this would be a proper search API call
        const allProducts = await productService.getFeaturedProducts();
        let filteredProducts = allProducts.filter(product => 
          product.title.toLowerCase().includes(query.toLowerCase()) ||
          product.description.toLowerCase().includes(query.toLowerCase()) ||
          product.category.toLowerCase().includes(query.toLowerCase())
        );

        // Filter by location if user has set a specific location
        if (userLocation && userLocation !== "Accra, Greater Accra Region") {
          filteredProducts = filteredProducts.filter(product => 
            product.location && product.location.toLowerCase().includes(userLocation.toLowerCase())
          );
        }
        
        console.log(`Search: Found ${filteredProducts.length} products for query: "${query}" in location: "${userLocation}"`);
        setSearchResults(filteredProducts);
      } else {
        // Show all products if no search query
        const products = await productService.getFeaturedProducts();
        console.log('Search: Loaded all products:', products.length);
        setSearchResults(products);
      }
    } catch (error) {
      console.error('Search: Error loading search results:', error);
      toast({
        title: "Error",
        description: "Failed to load search results",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...searchResults];

    // Category filter
    if (filters.category && filters.category !== "all") {
      filtered = filtered.filter(product => 
        product.category.toLowerCase() === filters.category.toLowerCase()
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
      default:
        // Relevance sorting (default)
        break;
    }

    setFilteredResults(filtered);
    updateActiveFilters();
  };

  const updateActiveFilters = () => {
    const active: string[] = [];
    if (filters.category) active.push(`Category: ${filters.category}`);
    if (filters.condition) active.push(`Condition: ${filters.condition}`);
    if (filters.location) active.push(`Location: ${filters.location}`);
    if (filters.negotiable !== null) active.push(`Negotiable: ${filters.negotiable ? 'Yes' : 'No'}`);
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000000) {
      active.push(`Price: ₵${filters.priceRange[0].toLocaleString()} - ₵${filters.priceRange[1].toLocaleString()}`);
    }
    if (filters.dateRange !== "all") {
      const dateLabel = dateRanges.find(d => d.value === filters.dateRange)?.label;
      if (dateLabel) active.push(`Date: ${dateLabel}`);
    }
    if (filters.sortBy !== "relevance") {
      const sortLabel = sortOptions.find(s => s.value === filters.sortBy)?.label;
      if (sortLabel) active.push(`Sort: ${sortLabel}`);
    }
    setActiveFilters(active);
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      condition: "",
      priceRange: [0, 1000000],
      location: "",
      negotiable: null,
      sortBy: "relevance",
      dateRange: "all"
    });
  };

  const getLocationDisplayText = () => {
    if (userLocation && userLocation !== "Accra, Greater Accra Region") {
      return ` in ${userLocation}`;
    }
    return "";
  };

  return (
    <Layout>
      <div className="md:hidden">
        <MobileHeader />
      </div>
      
      <div className="animate-fade-in">
        {/* Mobile Filters */}
        <div className="md:hidden px-4 mb-4">
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
              dateRanges={dateRanges}
            />
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <SlidersHorizontal className="h-4 w-4" />
              <span>Sort</span>
            </Button>
          </div>
          
          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
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

        {/* Desktop Filters */}
        {!isMobile && (
          <div className="max-w-7xl mx-auto px-6 mb-6">
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
                  <div>
                    <Label className="text-sm font-medium">Price Range</Label>
                    <div className="mt-1 flex space-x-2">
                      <Input
                        placeholder="Min"
                        value={filters.priceRange[0]}
                        onChange={(e) => setFilters(prev => ({ 
                          ...prev, 
                          priceRange: [parseInt(e.target.value) || 0, prev.priceRange[1]] 
                        }))}
                        className="text-sm"
                      />
                      <Input
                        placeholder="Max"
                        value={filters.priceRange[1]}
                        onChange={(e) => setFilters(prev => ({ 
                          ...prev, 
                          priceRange: [prev.priceRange[0], parseInt(e.target.value) || 1000000] 
                        }))}
                        className="text-sm"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <Label className="text-sm font-medium">Location</Label>
                    <Input
                      placeholder="Location..."
                      value={filters.location}
                      onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                      className="mt-1"
                    />
                  </div>

                  {/* Date Range */}
                  <div>
                    <Label className="text-sm font-medium">Date Posted</Label>
                    <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
                      <SelectTrigger className="mt-1">
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
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search Results */}
        <div className="px-4 md:px-0">
          <div className="mb-4">
            {searchQuery ? (
              <div>
                <h2 className="text-lg font-semibold mb-2">
                  Search Results for "{searchQuery}"
                </h2>
                <p className="text-gray-600">
                  {filteredResults.length} products found{getLocationDisplayText()}
                </p>
              </div>
            ) : (
              <p className="text-gray-600">
                Showing all products ({filteredResults.length} found){getLocationDisplayText()}
              </p>
            )}
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : filteredResults.length > 0 ? (
            <FeaturedProducts products={filteredResults} />
          ) : searchQuery ? (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500">
                Try adjusting your search terms{getLocationDisplayText() ? ' or search in a different location' : ' or browse our categories'}.
              </p>
            </div>
          ) : (
            <FeaturedProducts products={filteredResults} />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Search;
