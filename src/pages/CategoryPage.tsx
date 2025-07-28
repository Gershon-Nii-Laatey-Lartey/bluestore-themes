
import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { useParams } from "react-router-dom";
import { Filter, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/ProductGrid";
import { useState, useEffect } from "react";
import { productService } from "@/services/productService";
import { ProductSubmission } from "@/types/product";
import { SEOHead } from "@/components/SEOHead";

const CategoryPage = () => {
  const { category } = useParams();
  const [products, setProducts] = useState<ProductSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const categoryName = category?.replace('-', ' ') || 'Category';
  const formattedCategory = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
  
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
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <Filter className="h-4 w-4" />
                <span className="hidden md:inline">Filter</span>
              </Button>
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden md:inline">Sort</span>
              </Button>
            </div>
          </div>

          {/* Products Grid */}
          {error ? (
            <div className="text-center py-12 text-red-500">
              {error}
            </div>
          ) : (
            <ProductGrid products={products} loading={loading} />
          )}
        </div>
      </Layout>
    </>
  );
};

export default CategoryPage;
