import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const FAQ = () => {
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  
  const faqItems = [
    {
      question: "How do I publish an ad?",
      answer: "Click on the 'Publish Ad' button in your profile or use the main navigation. Fill in all required details about your product including photos, description, and price."
    },
    {
      question: "How can I contact a seller?",
      answer: "Click on the 'Contact Vendor' button on any product page or vendor profile to reveal their contact information including phone and email."
    },
    {
      question: "What payment methods are accepted?",
      answer: "Payment methods vary by seller. Most accept mobile money, bank transfers, and cash on delivery. Check with the seller for their preferred payment options."
    },
    {
      question: "How do I edit my profile?",
      answer: "Go to your profile page and click the 'Edit' button. You can update your personal information, contact details, and profile picture."
    },
    {
      question: "Is my personal information safe?",
      answer: "Yes, we take privacy seriously. Your contact information is only shared when you choose to contact a seller or when someone contacts you about your ads."
    },
    {
      question: "How do I report a problem?",
      answer: "You can report issues through our support chat, email, or phone. For urgent matters, use the live chat for immediate assistance."
    },
    {
      question: "What if I receive a damaged item?",
      answer: "Contact the seller immediately and document the damage with photos. Most sellers offer refunds or replacements for damaged items."
    },
    {
      question: "How do I become a verified seller?",
      answer: "Complete your KYC verification through your profile settings. This helps build trust with buyers and unlocks additional features."
    },
    {
      question: "How do I search for products?",
      answer: "Use the search bar at the top of the page to find specific products. You can also browse by category or use filters to narrow down your search."
    },
    {
      question: "Can I negotiate prices with sellers?",
      answer: "Yes, most sellers are open to negotiation. Contact them directly to discuss pricing and payment terms."
    },
    {
      question: "What should I do if a seller doesn't respond?",
      answer: "If a seller doesn't respond within 24-48 hours, you can report them through our support system. We'll investigate and take appropriate action."
    },
    {
      question: "How do I know if a seller is trustworthy?",
      answer: "Look for verified seller badges, read reviews, and check their response time. Verified sellers have completed KYC verification."
    }
  ];

  const toggleItem = (index: number) => {
    setExpandedItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <Layout>
      <div className="md:hidden">
        <MobileHeader />
      </div>
      
      <div className="animate-fade-in max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Frequently Asked Questions</h1>
          <p className="text-gray-600 mt-1">Find answers to common questions about using BlueStore</p>
        </div>

        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleItem(index)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium text-gray-900">
                    {item.question}
                  </CardTitle>
                  {expandedItems.includes(index) ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </CardHeader>
              {expandedItems.includes(index) && (
                <CardContent className="pt-0">
                  <p className="text-gray-700 leading-relaxed">
                    {item.answer}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default FAQ; 