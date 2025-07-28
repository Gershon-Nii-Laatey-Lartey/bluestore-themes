import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { FileText } from "lucide-react";

const Terms = () => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTermsContent();
  }, []);

  const loadTermsContent = async () => {
    try {
      const { data, error } = await supabase
        .from('terms_content')
        .select('content')
        .eq('is_active', true)
        .order('version', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      setContent(data?.content || 'Terms and conditions not available.');
    } catch (error) {
      console.error('Error loading terms:', error);
      setContent('Terms and conditions not available.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="md:hidden">
          <MobileHeader />
        </div>
        <div className="animate-fade-in max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="md:hidden">
        <MobileHeader />
      </div>
      
      <div className="animate-fade-in max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Terms and Conditions
          </h1>
          <p className="text-gray-600 mt-1">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
        
        <Card>
          <CardContent className="p-8">
            <div 
              className="prose max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br>') }}
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Terms;