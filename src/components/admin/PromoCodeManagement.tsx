import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Calendar, 
  Users, 
  Tag,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { promoCodeService, PromoCode } from "@/services/promoCodeService";
import { format } from "date-fns";

export const PromoCodeManagement = () => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPromoCode, setEditingPromoCode] = useState<PromoCode | null>(null);
  const [usageData, setUsageData] = useState<any[]>([]);
  const [selectedPromoCode, setSelectedPromoCode] = useState<string | null>(null);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    discount_type: "free" as 'free', // Only allow 100% discounts
    discount_value: 100, // Always 100 for free
    max_uses: "",
    valid_from: "",
    valid_until: "",
    is_active: true
  });

  useEffect(() => {
    loadPromoCodes();
  }, []);

  const loadPromoCodes = async () => {
    try {
      setLoading(true);
      const data = await promoCodeService.getAllPromoCodes();
      setPromoCodes(data);
    } catch (error) {
      console.error('Error loading promo codes:', error);
      toast({
        title: "Error",
        description: "Failed to load promo codes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePromoCode = async () => {
    try {
      const promoCodeData = {
        ...formData,
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        valid_from: formData.valid_from || new Date().toISOString(),
        valid_until: formData.valid_until || null
      };

      await promoCodeService.createPromoCode(promoCodeData);
      toast({
        title: "Success",
        description: "Promo code created successfully"
      });
      setShowCreateDialog(false);
      resetForm();
      loadPromoCodes();
    } catch (error) {
      console.error('Error creating promo code:', error);
      toast({
        title: "Error",
        description: "Failed to create promo code",
        variant: "destructive"
      });
    }
  };

  const handleUpdatePromoCode = async () => {
    if (!editingPromoCode) return;

    try {
      const updateData = {
        ...formData,
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        valid_from: formData.valid_from || new Date().toISOString(),
        valid_until: formData.valid_until || null
      };

      await promoCodeService.updatePromoCode(editingPromoCode.id, updateData);
      toast({
        title: "Success",
        description: "Promo code updated successfully"
      });
      setEditingPromoCode(null);
      resetForm();
      loadPromoCodes();
    } catch (error) {
      console.error('Error updating promo code:', error);
      toast({
        title: "Error",
        description: "Failed to update promo code",
        variant: "destructive"
      });
    }
  };

  const handleDeletePromoCode = async (id: string) => {
    try {
      await promoCodeService.deletePromoCode(id);
      toast({
        title: "Success",
        description: "Promo code deleted successfully"
      });
      loadPromoCodes();
    } catch (error) {
      console.error('Error deleting promo code:', error);
      toast({
        title: "Error",
        description: "Failed to delete promo code",
        variant: "destructive"
      });
    }
  };

  const handleEditPromoCode = (promoCode: PromoCode) => {
    setEditingPromoCode(promoCode);
    setFormData({
      code: promoCode.code,
      name: promoCode.name,
      description: promoCode.description || "",
      discount_type: promoCode.discount_type,
      discount_value: promoCode.discount_value,
      max_uses: promoCode.max_uses?.toString() || "",
      valid_from: promoCode.valid_from,
      valid_until: promoCode.valid_until || "",
      is_active: promoCode.is_active
    });
  };

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      description: "",
      discount_type: "free",
      discount_value: 100,
      max_uses: "",
      valid_from: "",
      valid_until: "",
      is_active: true
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Promo code copied to clipboard"
    });
  };

  const getDiscountDisplay = (promoCode: PromoCode) => {
    return '100% off'; // Only 100% discounts
  };

  const getStatusBadge = (promoCode: PromoCode) => {
    const now = new Date();
    const validFrom = new Date(promoCode.valid_from);
    const validUntil = promoCode.valid_until ? new Date(promoCode.valid_until) : null;

    if (!promoCode.is_active) {
      return <Badge variant="secondary">Inactive</Badge>;
    }

    if (now < validFrom) {
      return <Badge variant="outline">Pending</Badge>;
    }

    if (validUntil && now > validUntil) {
      return <Badge variant="destructive">Expired</Badge>;
    }

    if (promoCode.max_uses && promoCode.used_count >= promoCode.max_uses) {
      return <Badge variant="destructive">Limit Reached</Badge>;
    }

    return <Badge variant="default">Active</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Promo Code Management</h2>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Create Promo Code
          </Button>
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Promo Code Management</h2>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Promo Code
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Promo Code</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="WELCOME50"
                />
              </div>
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Welcome Discount"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discount_type">Discount Type</Label>
                  <Select
                    value={formData.discount_type}
                    onValueChange={(value: 'free') => 
                      setFormData({ ...formData, discount_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free (100%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="discount_value">Value</Label>
                  <Input
                    id="discount_value"
                    type="number"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })}
                    placeholder="100"
                    disabled={true}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="max_uses">Max Uses (Optional)</Label>
                <Input
                  id="max_uses"
                  type="number"
                  value={formData.max_uses}
                  onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                  placeholder="100"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="valid_from">Valid From</Label>
                  <Input
                    id="valid_from"
                    type="datetime-local"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="valid_until">Valid Until (Optional)</Label>
                  <Input
                    id="valid_until"
                    type="datetime-local"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePromoCode}>
                  Create Promo Code
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="promo-codes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="promo-codes">Promo Codes</TabsTrigger>
          <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="promo-codes">
          <div className="grid gap-4">
            {promoCodes.map((promoCode) => (
              <Card key={promoCode.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Tag className="h-5 w-5 text-blue-600" />
                        <div>
                          <h3 className="font-semibold">{promoCode.name}</h3>
                          <p className="text-sm text-gray-500">{promoCode.description}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(promoCode)}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(promoCode.code)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditPromoCode(promoCode)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Promo Code</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{promoCode.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeletePromoCode(promoCode.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Code:</span>
                      <p className="font-mono font-semibold">{promoCode.code}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Discount:</span>
                      <p className="font-semibold">{getDiscountDisplay(promoCode)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Usage:</span>
                      <p className="font-semibold">
                        {promoCode.used_count}
                        {promoCode.max_uses && ` / ${promoCode.max_uses}`}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Valid Until:</span>
                      <p className="font-semibold">
                        {promoCode.valid_until 
                          ? format(new Date(promoCode.valid_until), 'MMM dd, yyyy')
                          : 'No expiry'
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="usage">
          <div className="space-y-4">
            <div>
              <Label htmlFor="promo-code-select">Select Promo Code</Label>
              <Select onValueChange={setSelectedPromoCode}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a promo code" />
                </SelectTrigger>
                <SelectContent>
                  {promoCodes.map((promoCode) => (
                    <SelectItem key={promoCode.id} value={promoCode.id}>
                      {promoCode.name} ({promoCode.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedPromoCode && (
              <Card>
                <CardHeader>
                  <CardTitle>Usage Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {usageData.map((usage, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-semibold">{usage.users?.full_name || 'Unknown User'}</p>
                          <p className="text-sm text-gray-500">{usage.users?.email}</p>
                          {usage.products?.title && (
                            <p className="text-sm text-gray-500">Product: {usage.products.title}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">GHS {usage.discount_amount}</p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(usage.used_at), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={!!editingPromoCode} onOpenChange={() => setEditingPromoCode(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Promo Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-code">Code</Label>
              <Input
                id="edit-code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="WELCOME50"
              />
            </div>
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Welcome Discount"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-discount_type">Discount Type</Label>
                <Select
                  value={formData.discount_type}
                  onValueChange={(value: 'free') => 
                    setFormData({ ...formData, discount_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free (100%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-discount_value">Value</Label>
                <Input
                  id="edit-discount_value"
                  type="number"
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })}
                  placeholder="100"
                  disabled={true}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-max_uses">Max Uses (Optional)</Label>
              <Input
                id="edit-max_uses"
                type="number"
                value={formData.max_uses}
                onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                placeholder="100"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-valid_from">Valid From</Label>
                <Input
                  id="edit-valid_from"
                  type="datetime-local"
                  value={formData.valid_from}
                  onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-valid_until">Valid Until (Optional)</Label>
                <Input
                  id="edit-valid_until"
                  type="datetime-local"
                  value={formData.valid_until}
                  onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              <Label htmlFor="edit-is_active">Active</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditingPromoCode(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdatePromoCode}>
                Update Promo Code
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 