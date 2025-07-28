import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Bell } from "lucide-react";
import { dataService, ProductSubmission, KYCSubmission } from "@/services/dataService";
import { notificationService } from "@/services/notificationService";
import { ProductReviewTab } from "@/components/admin/ProductReviewTab";
import { PackageStatsCard } from "@/components/admin/PackageStatsCard";
import { KYCVerificationTab } from "@/components/admin/KYCVerificationTab";
import { PaymentAnalytics } from "@/components/admin/PaymentAnalytics";
import { UserManagement } from "@/components/admin/UserManagement";
import { KYCHistory } from "@/components/admin/KYCHistory";
import LocationManagement from "@/components/admin/LocationManagement";
import CategoryManagement from "@/components/admin/CategoryManagement";
import { PackageManagement } from "@/components/admin/PackageManagement";
import { CSWorkerManagement } from "@/components/admin/CSWorkerManagement";
import { ManagementTools } from "@/components/admin/ManagementTools";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ReportsManagement } from "@/components/admin/ReportsManagement";
import { SupportChatsManagement } from "@/components/admin/SupportChatsManagement";
import { TransferredCasesManagement } from "@/components/admin/TransferredCasesManagement";
import { CaseUpdatesManagement } from "@/components/admin/CaseUpdatesManagement";
import { TermsManagement } from "@/components/admin/TermsManagement";
import { SupportChat } from "@/components/admin/SupportChat";
import { PromoCodeManagement } from "@/components/admin/PromoCodeManagement";
import { useAdminSidebar } from "@/hooks/useAdminSidebar";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("products");
  const [pendingSubmissions, setPendingSubmissions] = useState<ProductSubmission[]>([]);
  const [approvedProducts, setApprovedProducts] = useState<ProductSubmission[]>([]);
  const [rejectedProducts, setRejectedProducts] = useState<ProductSubmission[]>([]);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [pendingKyc, setPendingKyc] = useState<KYCSubmission[]>([]);
  const [approvedKyc, setApprovedKyc] = useState<KYCSubmission[]>([]);
  const [rejectedKyc, setRejectedKyc] = useState<KYCSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const { toast } = useToast();
  const { collapsed } = useAdminSidebar();

  useEffect(() => {
    loadData();
    // Seed default packages if needed
    seedDefaultPackagesIfEmpty();
    // Check notification permission
    checkNotificationPermission();
  }, []);

  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  };

  const requestNotificationPermission = async () => {
    try {
      const granted = await notificationService.requestNotificationPermission();
      setNotificationPermission(granted ? 'granted' : 'denied');
      
      if (granted) {
        toast({
          title: "Notifications Enabled",
          description: "You'll now receive notifications for user activities.",
        });
      } else {
        toast({
          title: "Notifications Disabled",
          description: "You can enable notifications later in your browser settings.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast({
        title: "Error",
        description: "Failed to request notification permission",
        variant: "destructive"
      });
    }
  };

  const seedDefaultPackagesIfEmpty = async () => {
    try {
      const { seedDefaultPackages } = await import('@/services/seedPackages');
      await seedDefaultPackages();
    } catch (error) {
      console.error('Error seeding packages:', error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Loading admin data...');
      
      const [submissions, kycSubmissions] = await Promise.all([
        dataService.getProductSubmissions(),
        dataService.getAllKYCSubmissions()
      ]);

      console.log('Loaded submissions:', submissions.length);
      console.log('Loaded KYC submissions:', kycSubmissions.length);

      const pending = submissions.filter(s => s.status === 'pending');
      const approved = submissions.filter(s => s.status === 'approved');
      const rejected = submissions.filter(s => s.status === 'rejected');

      setPendingSubmissions(pending);
      setApprovedProducts(approved);
      setRejectedProducts(rejected);
      setTotalSubmissions(submissions.length);

      const pendingKycList = kycSubmissions.filter(k => k.status === 'pending');
      const approvedKycList = kycSubmissions.filter(k => k.status === 'approved');
      const rejectedKycList = kycSubmissions.filter(k => k.status === 'rejected');

      setPendingKyc(pendingKycList);
      setApprovedKyc(approvedKycList);
      setRejectedKyc(rejectedKycList);

      console.log('Admin data loaded successfully');
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (submissionId: string, approved: boolean, rejectionReason?: string, suggestions?: string) => {
    try {
      if (approved) {
        await dataService.approveProductSubmission(submissionId, suggestions);
        toast({
          title: "Product Approved",
          description: suggestions ? "Product approved with suggestions sent to vendor." : "Product has been approved successfully."
        });
      } else {
        await dataService.rejectProductSubmission(submissionId, rejectionReason || "");
        toast({
          title: "Product Rejected",
          description: "Product has been rejected with feedback sent to vendor.",
          variant: "destructive"
        });
      }
      
      await loadData(); // Refresh data
    } catch (error) {
      console.error('Error updating product status:', error);
      toast({
        title: "Error",
        description: "Failed to update product status",
        variant: "destructive"
      });
    }
  };

  const handleKycApproval = async (kycId: string, approved: boolean, rejectionReason?: string) => {
    try {
      if (approved) {
        await dataService.approveKYCSubmission(kycId);
        toast({
          title: "KYC Approved",
          description: "KYC has been approved successfully."
        });
      } else {
        await dataService.rejectKYCSubmission(kycId, rejectionReason || "");
        toast({
          title: "KYC Rejected",
          description: "KYC has been rejected."
        });
      }
      
      await loadData(); // Refresh data
    } catch (error) {
      console.error('Error updating KYC status:', error);
      toast({
        title: "Error",
        description: "Failed to update KYC status",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="animate-fade-in space-y-8">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "products":
        return (
          <ProductReviewTab
            pendingSubmissions={pendingSubmissions}
            approvedProducts={approvedProducts}
            rejectedProducts={rejectedProducts}
            totalSubmissions={totalSubmissions}
            onApproval={handleApproval}
          />
        );
      case "kyc":
        return (
          <div className="space-y-6">
            <KYCVerificationTab
              pendingKyc={pendingKyc}
              approvedKyc={approvedKyc}
              rejectedKyc={rejectedKyc}
              onApproval={handleKycApproval}
            />
            <KYCHistory 
              approvedKyc={approvedKyc}
              rejectedKyc={rejectedKyc}
            />
          </div>
        );
      case "users":
        return <UserManagement />;
      case "cs-workers":
        return <CSWorkerManagement />;
      case "reports":
        return <ReportsManagement />;
      case "support-chats":
        return <SupportChat />;
      case "transferred-cases":
        return <TransferredCasesManagement />;
      case "case-updates":
        return <CaseUpdatesManagement />;
      case "locations":
        return <LocationManagement />;
      case "categories":
        return <CategoryManagement />;
      case "packages":
        return <PackageManagement />;
      case "terms":
        return <TermsManagement />;
      case "analytics":
        return <PaymentAnalytics />;
      case "tools":
        return <ManagementTools />;
      case "promo-codes":
        return <PromoCodeManagement />;
      default:
        return null;
    }
  };

  return (
    <AdminLayout>
      <div className="animate-fade-in flex h-full">
        <AdminSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          pendingSubmissions={pendingSubmissions.length}
          pendingKyc={pendingKyc.length}
        />
        
        <div className={`flex-1 overflow-y-auto transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'}`}>
          <div className="p-6">
            <div className="bg-white rounded-lg border p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-gray-600 mt-1">Manage products, users, and platform settings</p>
                </div>
                <div className="flex items-center space-x-2">
                  {notificationPermission !== 'granted' && (
                    <Button 
                      onClick={requestNotificationPermission} 
                      variant="outline" 
                      size="sm"
                      className="flex items-center"
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      Enable Notifications
                    </Button>
                  )}
                  <Button onClick={loadData} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </div>

            {/* Package Stats for Pending Submissions */}
            {pendingSubmissions.length > 0 && activeTab === "products" && (
              <div className="mb-6">
                <PackageStatsCard pendingSubmissions={pendingSubmissions} />
              </div>
            )}

            {renderTabContent()}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Admin;
