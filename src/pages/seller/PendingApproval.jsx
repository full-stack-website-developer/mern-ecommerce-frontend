import { Link, Navigate } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  Mail,
  Shield,
  FileText,
  LogOut,
  Edit,
  HelpCircle,
} from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import useUserContext from '../../hooks/useUserContext';

const PendingApproval = () => {
  const { user } = useUserContext();

  if (!user) {
    return <Navigate to="/login" replace/>
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header Section */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-blue-100 mb-6">
              <Clock className="h-12 w-12 text-blue-600 animate-pulse" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Your seller account is under review
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We&apos;re carefully reviewing your application to ensure the best experience for both sellers and customers.
            </p>
          </div>

          {/* Timeline Section */}
          <Card className="mb-8 border border-blue-100 bg-white shadow-sm">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Application Status
              </h2>
              
              <div className="space-y-6">
                {/* Step 1: Application Submitted */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-sm font-semibold text-gray-900">
                      Application Submitted
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Your seller registration was received on Jan 15, 2024
                    </p>
                  </div>
                </div>

                {/* Connector Line */}
                <div className="ml-5 h-6 w-0.5 bg-blue-200" />

                {/* Step 2: Under Review (Current) */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg ring-4 ring-blue-100">
                      <Clock className="h-5 w-5 animate-pulse" />
                    </div>
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-gray-900">
                        Under Review
                      </p>
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                        Current Step
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Our team is verifying your business details and documents
                    </p>
                  </div>
                </div>

                {/* Connector Line */}
                <div className="ml-5 h-6 w-0.5 bg-gray-200" />

                {/* Step 3: Decision Notification */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                      <Mail className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-sm font-semibold text-gray-400">
                      Decision Notification
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      You&apos;ll receive an email once a decision is made
                    </p>
                  </div>
                </div>

                {/* Connector Line */}
                <div className="ml-5 h-6 w-0.5 bg-gray-200" />

                {/* Step 4: Account Activation */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                      <Shield className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-sm font-semibold text-gray-400">
                      Account Activation
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Start managing your store and listing products
                    </p>
                  </div>
                </div>
              </div>

              {/* Estimated Time */}
              <div className="mt-8 rounded-lg bg-blue-50 border border-blue-100 px-4 py-3">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">Estimated review time:</span>{' '}
                  Usually takes 1-3 business days
                </p>
              </div>
            </div>
          </Card>

          {/* What Happens Next Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              What happens next?
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border border-purple-100 bg-purple-50/50">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                      <FileText className="h-5 w-5" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">
                      Document Verification
                    </h3>
                    <p className="text-xs text-gray-600">
                      We&apos;re verifying your business license, tax ID, and other submitted documents.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="border border-indigo-100 bg-indigo-50/50">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                      <Shield className="h-5 w-5" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">
                      Account Security Check
                    </h3>
                    <p className="text-xs text-gray-600">
                      Ensuring your account meets our security standards and compliance requirements.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="border border-blue-100 bg-blue-50/50">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                      <Mail className="h-5 w-5" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">
                      Email Notification
                    </h3>
                    <p className="text-xs text-gray-600">
                      You&apos;ll receive an email notification as soon as your account is approved or if we need additional information.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="border border-emerald-100 bg-emerald-50/50">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">
                      Quick Access
                    </h3>
                    <p className="text-xs text-gray-600">
                      Once approved, you can immediately start listing products and managing your store dashboard.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Action Buttons */}
          <Card className="border border-gray-200 bg-white">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                <div className="space-y-2">
                  <Button
                    variant="primary"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Link to="/help" className="inline-flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      Contact Support
                    </Link>
                  </Button>
                </div>
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Link to="/" className="inline-flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    Home
                  </Link>
                </Button>
              </div>
            </div>
          </Card>

          {/* Helpful Note */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Need help? Our support team is available 24/7 to assist you with any questions about your seller application.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PendingApproval;
