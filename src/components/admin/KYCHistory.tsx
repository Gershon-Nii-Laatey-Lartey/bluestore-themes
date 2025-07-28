
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, Calendar, User } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { KYCDetailModal } from "./KYCDetailModal";

interface KYCHistoryProps {
  approvedKyc: any[];
  rejectedKyc: any[];
}

export const KYCHistory = ({ approvedKyc, rejectedKyc }: KYCHistoryProps) => {
  const allProcessedKyc = [...approvedKyc, ...rejectedKyc].sort((a, b) => 
    new Date(b.reviewed_at || b.submitted_at).getTime() - new Date(a.reviewed_at || a.submitted_at).getTime()
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>KYC Verification History</span>
          <Badge variant="secondary">{allProcessedKyc.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {allProcessedKyc.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Store Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reviewed Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allProcessedKyc.map((kyc) => (
                  <TableRow key={kyc.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{kyc.full_name}</p>
                          <p className="text-sm text-gray-500">{kyc.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{kyc.store_name}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm capitalize">{kyc.product_category}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(kyc.status)} flex items-center space-x-1`}>
                        {getStatusIcon(kyc.status)}
                        <span className="capitalize">{kyc.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          {kyc.reviewed_at ? formatDate(kyc.reviewed_at) : formatDate(kyc.submitted_at)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </DialogTrigger>
                        <KYCDetailModal kyc={kyc} onApproval={() => {}} />
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No KYC History</p>
            <p className="text-sm">Processed KYC verifications will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
