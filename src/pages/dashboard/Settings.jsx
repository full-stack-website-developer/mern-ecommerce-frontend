import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { ChangePasswordForm } from '../../features/profile/components';

const Settings = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Account Settings</h1>

        <Card>
          <h2 className="text-xl font-bold mb-2">Preferences</h2>
          <p className="text-gray-600 mb-4">
            Manage your account-level preferences and security from one place.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/notifications">
              <Button variant="outline">Notification Center</Button>
            </Link>
            <Link to="/support-tickets">
              <Button variant="outline">Support Tickets</Button>
            </Link>
          </div>
        </Card>

        <ChangePasswordForm />
      </div>
    </DashboardLayout>
  );
};

export default Settings;
