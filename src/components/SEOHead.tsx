import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  structuredData?: object;
  canonical?: string;
}

export const SEOHead = ({
  title = "BlueStore - Ghana's Online Marketplace",
  description = "BlueStore is Ghana's leading online marketplace. Buy and sell smartphones, laptops, electronics, fashion, automotive parts, and more. Safe, secure, and trusted platform for Ghanaians.",
  keywords = "Ghana marketplace, online shopping Ghana, buy sell Ghana, electronics Ghana, smartphones Ghana, laptops Ghana, fashion Ghana, automotive Ghana",
  image = "https://bluestoregh.web.app/og-image.jpg",
  url = "https://bluestoregh.web.app",
  type = "website",
  structuredData,
  canonical
}: SEOHeadProps) => {
  const fullTitle = title.includes('BlueStore') ? title : `${title} | BlueStore Ghana`;
  
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="BlueStore Ghana" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

// Predefined structured data for common pages
export const getProductStructuredData = (product: any) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": product.title,
  "description": product.description,
  "image": product.images?.[0] || "",
  "offers": {
    "@type": "Offer",
    "price": product.price,
    "priceCurrency": "GHS",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": product.vendor?.business_name || "BlueStore Vendor"
    }
  },
  "category": product.category,
  "condition": product.condition
});

export const getBreadcrumbStructuredData = (breadcrumbs: Array<{name: string, url: string}>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": breadcrumbs.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});

export const getFAQStructuredData = (faqs: Array<{question: string, answer: string}>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
}); 