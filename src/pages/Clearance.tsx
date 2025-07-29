import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { ProductGrid } from "@/components/ProductGrid";
import { useState, useEffect, memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductSubmission } from "@/types/product";
import { transformProductData } from "@/services/product/productTransforms";
import { useToast } from "@/hooks/use-toast";
import { Filter, SlidersHorizontal, X, Percent, DollarSign, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import React from "react";

// Memoized FilterDialog component to prevent re-renders
const FilterDialog = memo(({ 
  showFilters, 
  setShowFilters, 
  activeFilters, 
  filters, 
  setFilters, 
  clearFilters,
  sortOptions,
  dateRanges 
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
          <span>Clearance Filters</span>
          {activeFilters.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4" />
              Clear All
            </Button>
          )}
        </DialogTitle>
        <DialogDescription>
          Filter clearance items by price, discount percentage, and date to find the best deals.
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

        {/* Discount Range */}
        <div>
          <Label className="text-sm font-medium">Discount Range (%)</Label>
          <div className="mt-2 space-y-2">
            <Slider
              value={filters.discountRange}
              onValueChange={(value) => setFilters(prev => ({ ...prev, discountRange: value }))}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>{filters.discountRange[0]}%</span>
              <span>{filters.discountRange[1]}%</span>
            </div>
          </div>
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

const Clearance = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    priceRange: [0, 1000000],
    discountRange: [0, 100],
    sortBy: "discount_high",
    dateRange: "all",
    searchQuery: ""
  });

  const sortOptions = [
    { value: "discount_high", label: "Highest Discount" },
    { value: "discount_low", label: "Lowest Discount" },
    { value: "price_low", label: "Price: Low to High" },
    { value: "price_high", label: "Price: High to Low" },
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" }
  ];

  const dateRanges = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "year", label: "This Year" }
  ];

  const {
    data: clearanceProducts = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['clearance-products'],
    queryFn: async () => {
      console.log('Fetching clearance products...');
      
      // First, let's see what products exist in the database
      const { data: allProducts, error: debugError } = await supabase
        .from('product_submissions')
        .select('id, title, price, previous_price, edited, status, created_at')
        .eq('status', 'approved')
        .limit(10);

      if (!debugError) {
        console.log('Sample of approved products:', allProducts);
      }

      // Fetch products that have been edited with price reductions
      const { data, error } = await supabase
        .from('product_submissions')
        .select('*')
        .eq('status', 'approved')
        .eq('edited', true)
        .not('previous_price', 'is', null)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching clearance products:', error);
        throw error;
      }

      console.log('Raw clearance data:', data);

      // Filter products where previous_price > current_price (actual price reductions)
      const reducedPriceProducts = (data || []).filter(item => {
        const previousPrice = parseFloat(String(item.previous_price || '0'));
        const currentPrice = parseFloat(String(item.price || '0'));
        return previousPrice > currentPrice;
      });

      console.log('Filtered clearance products:', reducedPriceProducts.length);

      return reducedPriceProducts.map(transformProductData);
    }
  });

  // Refactored: applyFilters now returns the filtered array
  const applyFilters = () => {
    let filtered = [...clearanceProducts];

    // Search query filter
    if (filters.searchQuery) {
      filtered = filtered.filter(product => 
        product.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(filters.searchQuery.toLowerCase())
      );
    }

    // Price range filter
    filtered = filtered.filter(product => {
      const price = parseFloat(String(product.price || '0'));
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    // Discount range filter
    filtered = filtered.filter(product => {
      const previousPrice = parseFloat(String(product.previous_price || '0'));
      const currentPrice = parseFloat(String(product.price || '0'));
      if (previousPrice <= 0) return false;
      
      const discountPercentage = ((previousPrice - currentPrice) / previousPrice) * 100;
      return discountPercentage >= filters.discountRange[0] && discountPercentage <= filters.discountRange[1];
    });

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
      case "discount_high":
        filtered.sort((a, b) => {
          const aDiscount = getDiscountPercentage(a);
          const bDiscount = getDiscountPercentage(b);
          return bDiscount - aDiscount;
        });
        break;
      case "discount_low":
        filtered.sort((a, b) => {
          const aDiscount = getDiscountPercentage(a);
          const bDiscount = getDiscountPercentage(b);
          return aDiscount - bDiscount;
        });
        break;
      case "price_low":
        filtered.sort((a, b) => parseFloat(String(a.price || '0')) - parseFloat(String(b.price || '0')));
        break;
      case "price_high":
        filtered.sort((a, b) => parseFloat(String(b.price || '0')) - parseFloat(String(a.price || '0')));
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      default:
        // Default to highest discount
        filtered.sort((a, b) => {
          const aDiscount = getDiscountPercentage(a);
          const bDiscount = getDiscountPercentage(b);
          return bDiscount - aDiscount;
        });
    }

    return filtered;
  };

  const filteredProducts = React.useMemo(() => applyFilters(), [clearanceProducts, filters]);

  const activeFilters = React.useMemo(() => {
    const active: string[] = [];
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000000) active.push(`Price: ₵${filters.priceRange[0]} - ₵${filters.priceRange[1]}`);
    if (filters.discountRange[0] > 0 || filters.discountRange[1] < 100) active.push(`Discount: ${filters.discountRange[0]}% - ${filters.discountRange[1]}%`);
    if (filters.sortBy !== "discount_high") active.push(`Sort: ${sortOptions.find(s => s.value === filters.sortBy)?.label || filters.sortBy}`);
    if (filters.searchQuery) active.push(`Search: "${filters.searchQuery}"`);
    if (filters.dateRange !== "all") active.push(`Date: ${dateRanges.find(d => d.value === filters.dateRange)?.label || filters.dateRange}`);
    return active;
  }, [filters, sortOptions, dateRanges]);

  const getDiscountPercentage = (product: ProductSubmission) => {
    const previousPrice = parseFloat(String(product.previous_price || '0'));
    const currentPrice = parseFloat(String(product.price || '0'));
    if (previousPrice <= 0) return 0;
    return ((previousPrice - currentPrice) / previousPrice) * 100;
  };

  const clearFilters = () => {
    setFilters({
      priceRange: [0, 1000000],
      discountRange: [0, 100],
      sortBy: "discount_high",
      dateRange: "all",
      searchQuery: ""
    });
  };

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load clearance products",
        variant: "destructive"
      });
    }
  }, [error, toast]);

  return (
    <Layout>
      {/* Mobile Header - only show on mobile */}
      <div className="md:hidden w-full">
        <MobileHeader />
      </div>
      
      <div className="animate-fade-in space-y-6 w-full px-4 md:px-0">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Clearance Sale</h1>
            <p className="text-gray-600 mt-1">Amazing deals on discounted products</p>
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
                <span>Clearance Filters</span>
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

                {/* Discount Range */}
                <div className="lg:col-span-2">
                  <Label className="text-sm font-medium">Discount Range (%)</Label>
                  <div className="mt-1 space-y-2">
                    <Slider
                      value={filters.discountRange}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, discountRange: value }))}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{filters.discountRange[0]}%</span>
                      <span>{filters.discountRange[1]}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Products Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {filteredProducts.length} discounted products found
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
          
          {isLoading ? (
            <ProductGrid products={[]} loading={true} />
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Percent className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No clearance items found</h3>
              <p className="text-gray-500">Try adjusting your filters or check back later for new deals.</p>
            </div>
          ) : (
            <ProductGrid products={filteredProducts} loading={false} />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Clearance;
