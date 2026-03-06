import {
  Shield,
  Lock,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Checkbox from '../../components/common/Checkbox';
import Button from '../../components/common/Button';

// UI-ONLY:
// - No state, no handlers, no API
// - Visual representation of admin invite acceptance flow

const AdminAcceptInvite = () => {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-950 py-16">
        <div className="flex items-center justify-center px-4">
          <Card className="w-full max-w-xl border border-gray-800 bg-gray-900/90 text-gray-100 shadow-xl">
            {/* Header */}
            <header className="mb-8 text-center space-y-3">
              <div className="flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-800 text-indigo-400">
                  <Shield className="h-6 w-6" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  Join the Admin Team
                </h1>
                <p className="mt-1 text-sm text-gray-400">
                  You&apos;ve been invited to access the administration console. Review the details below and
                  set a secure password to activate your account.
                </p>
              </div>
            </header>

            {/* Invitation details */}
            <section className="mb-6 rounded-lg border border-gray-800 bg-gray-900/80 px-4 py-4 text-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Invitation Details
                </p>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Pending Activation
                </span>
              </div>
              <dl className="space-y-1.5 text-xs sm:text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-400">Invited by</dt>
                  <dd className="font-medium text-gray-100">John Doe (Super Admin)</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-400">Your email</dt>
                  <dd className="font-medium text-gray-100">newadmin@company.com</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-400">Role</dt>
                  <dd className="font-medium text-gray-100">Administrator</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-400">Invite sent</dt>
                  <dd className="text-gray-200">Jan 15, 2024</dd>
                </div>
              </dl>

              <div className="mt-3 pt-3 border-t border-gray-800">
                <p className="mb-1 text-xs font-medium text-gray-300">
                  Permissions granted
                </p>
                <ul className="grid grid-cols-1 gap-1 text-xs text-gray-400 sm:grid-cols-2">
                  <li className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    Manage users &amp; roles
                  </li>
                  <li className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    View and moderate sellers
                  </li>
                  <li className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    Access platform orders &amp; payments
                  </li>
                  <li className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    Update categories &amp; content
                  </li>
                </ul>
              </div>
            </section>

            {/* Set Password */}
            <section className="mb-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-100">
                  Set your admin password
                </p>
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-800 px-2 py-0.5 text-[11px] text-gray-300">
                  <Lock className="h-3.5 w-3.5" />
                  Secure Setup
                </span>
              </div>

              {/* Password fields (show/hide is visual only) */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-300">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      type="password"
                      placeholder="Create a strong password"
                      required
                      className="pr-10 bg-gray-900 border border-gray-800 text-gray-100 placeholder:text-gray-500 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-300"
                      aria-label="Toggle password visibility (UI only)"
                    >
                      <EyeOff className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-300">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Input
                      type="password"
                      placeholder="Re-enter password"
                      required
                      className="pr-10 bg-gray-900 border border-gray-800 text-gray-100 placeholder:text-gray-500 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-300"
                      aria-label="Toggle password visibility (UI only)"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Password strength indicator (static visual) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-300">Password strength</span>
                  <span className="font-medium text-emerald-400">Strong</span>
                </div>
                <div className="flex h-1.5 overflow-hidden rounded-full bg-gray-800">
                  <div className="w-1/3 bg-red-500" />
                  <div className="w-1/3 bg-yellow-400" />
                  <div className="w-1/3 bg-emerald-500" />
                </div>
                <p className="text-[11px] text-gray-500">
                  Indicator is for visual reference only. Real-time strength validation will be applied later.
                </p>
              </div>

              {/* Password requirements checklist */}
              <div className="rounded-lg border border-gray-800 bg-gray-900/80 px-3 py-3">
                <p className="mb-2 text-xs font-medium text-gray-300">
                  Password must meet all of the following:
                </p>
                <ul className="space-y-1.5 text-xs text-gray-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    Minimum 8 characters
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    At least one uppercase letter
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    At least one number
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    At least one special character
                  </li>
                </ul>
              </div>
            </section>

            {/* Security acknowledgments */}
            <section className="mb-6 space-y-2">
              <Checkbox
                label="I understand that all admin activities are logged"
                className="text-xs text-gray-200"
              />
              <Checkbox
                label="I agree to the Admin Code of Conduct"
                className="text-xs text-gray-200"
              />
            </section>

            {/* Action button */}
            <Button
              type="button"
              variant="primary"
              className="w-full border border-indigo-500/70 bg-indigo-600 text-white hover:bg-indigo-500 hover:border-indigo-400"
            >
              Accept Invitation &amp; Set Password
            </Button>

            {/* Security badges */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-[11px] text-gray-400">
              <span className="inline-flex items-center gap-1 rounded-full border border-gray-700 px-2 py-0.5">
                <span role="img" aria-label="shield">
                  🛡️
                </span>
                End-to-End Encrypted
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-gray-700 px-2 py-0.5">
                <span role="img" aria-label="lock">
                  🔒
                </span>
                Secure Setup
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-gray-700 px-2 py-0.5">
                <span role="img" aria-label="eye">
                  👁️
                </span>
                Activity Monitored
              </span>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminAcceptInvite;

