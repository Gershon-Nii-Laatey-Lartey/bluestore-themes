
import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { PaymentHistory } from "@/components/payment/PaymentHistory";
import { SubscriptionManager } from "@/components/payment/SubscriptionManager";

const ActivePackages = () => {
  return (
    <Layout>
      <div className="md:hidden -m-4 mb-4">
        <MobileHeader />
      </div>
      
      <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            My Subscriptions & Payments
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your active subscriptions and view payment history
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-1">
          <SubscriptionManager />
          <PaymentHistory />
        </div>
      </div>
    </Layout>
  );
};

export default ActivePackages;
