import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Phone, Mail, Package, Shield, Store, Search, Star, MessageSquare } from "lucide-react";
import { storefrontService } from "@/services/storefrontService";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Storefront = () => {
  const { storefrontUrl } = useParams<{ storefrontUrl: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priceSort, setPriceSort] = useState("default");
  const navigate = useNavigate();

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

  // Filter and sort products
  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (priceSort === "low-high") return parseFloat(a.price) - parseFloat(b.price);
    if (priceSort === "high-low") return parseFloat(b.price) - parseFloat(a.price);
    return 0;
  });

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
      {/* Glossy Header with Search */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 border-2 border-primary/20 shadow-md">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="text-lg bg-primary/10 text-primary">
                  {storefront.business_name?.charAt(0) || 'S'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  {storefront.business_name}
                </h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>4.8</span>
                  <Badge variant="secondary" className="text-xs">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Glossy Search Bar */}
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

            <div className="flex items-center gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[140px] bg-white/60 backdrop-blur-sm border-white/30">
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
              <Button
                variant="default"
                onClick={handleContactClick}
                className="bg-primary/90 hover:bg-primary shadow-md"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Storefront Banner */}
      <div className="bg-gradient-to-r from-primary via-primary to-primary/90 text-primary-foreground">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              {storefront.business_name}
            </h1>
            {storefront.description && (
              <p className="text-xl text-primary-foreground/90 mb-6 max-w-2xl mx-auto">
                {storefront.description}
              </p>
            )}
            <div className="flex items-center justify-center gap-6 text-primary-foreground/90">
              {storefront.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{storefront.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                <span>{filteredProducts?.length || 0} Products</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Business Info Bar with clickable categories */}
      <div className="bg-card border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-8">
              {storefront.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{storefront.phone}</span>
                </div>
              )}
              {storefront.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{storefront.email}</span>
                </div>
              )}
            </div>
            {storefront.categories && storefront.categories.length > 0 && (
              <div className="flex items-center gap-2">
                {storefront.categories.slice(0, 3).map((category: string, index: number) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleCategoryClick(category)}
                    className="text-xs hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Additional Filters */}
        <div className="mb-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
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
          <span className="text-muted-foreground font-medium">
            {filteredProducts?.length || 0} products found
          </span>
        </div>

        {/* Products Section */}
        <div className="mb-6">
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
                      {product.original_price && parseFloat(product.original_price.toString()) > parseFloat(product.price.toString()) && (
                        <span className="text-sm text-muted-foreground line-through">
                          GHS {parseFloat(product.original_price.toString()).toFixed(2)}
                        </span>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="shadow-sm">
              <CardContent className="text-center py-16">
                <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">
                  {searchQuery || categoryFilter !== "all" 
                    ? "No products match your search" 
                    : "No products available"
                  }
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery || categoryFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "This storefront doesn't have any products listed yet."
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Storefront;
