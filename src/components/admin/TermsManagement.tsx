import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Save, Eye } from "lucide-react";

export const TermsManagement = () => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadCurrentTerms();
  }, []);

  const loadCurrentTerms = async () => {
    try {
      const { data, error } = await supabase
        .from('terms_content')
        .select('content')
        .eq('is_active', true)
        .order('version', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setContent(data?.content || '');
    } catch (error) {
      console.error('Error loading terms:', error);
      toast({
        title: "Error",
        description: "Failed to load current terms",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveTerms = async () => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Terms content cannot be empty",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);

      // Deactivate current terms
      await supabase
        .from('terms_content')
        .update({ is_active: false })
        .eq('is_active', true);

      // Get next version number
      const { data: lastVersion } = await supabase
        .from('terms_content')
        .select('version')
        .order('version', { ascending: false })
        .limit(1)
        .single();

      const nextVersion = (lastVersion?.version || 0) + 1;

      // Insert new version
      const { error } = await supabase
        .from('terms_content')
        .insert({
          content: content.trim(),
          version: nextVersion,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Terms Updated",
        description: `Terms and conditions updated to version ${nextVersion}`,
      });
    } catch (error) {
      console.error('Error saving terms:', error);
      toast({
        title: "Error",
        description: "Failed to save terms and conditions",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Terms & Conditions Management</h3>
        <p className="text-sm text-gray-600">Edit and manage the terms and conditions content</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Edit Terms Content
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreview(!preview)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {preview ? 'Edit' : 'Preview'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {preview ? (
            <div className="border rounded-lg p-4 bg-gray-50 min-h-[400px]">
              <div 
                className="prose max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br>') }}
              />
              {!content.trim() && (
                <p className="text-gray-500 italic">No content to preview</p>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="terms-content">Terms Content</Label>
                <Textarea
                  id="terms-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter the terms and conditions content..."
                  className="min-h-[400px] font-mono text-sm"
                />
                <p className="text-xs text-gray-500">
                  Use line breaks to separate paragraphs. HTML formatting is not supported.
                </p>
              </div>
              
              <Button onClick={saveTerms} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Terms"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};