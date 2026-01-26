import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Textarea from '../../components/common/Textarea';

const Profile = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">My Profile</h1>

        {/* Profile Picture */}
        <Card>
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-4xl">
              👤
            </div>
            <div>
              <h2 className="text-xl font-bold">John Doe</h2>
              <p className="text-gray-600">john.doe@example.com</p>
              <Button variant="outline" className="mt-2">Change Photo</Button>
            </div>
          </div>
        </Card>

        {/* Personal Information */}
        <Card>
          <h2 className="text-xl font-bold mb-6">Personal Information</h2>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="First Name" defaultValue="John" />
              <Input label="Last Name" defaultValue="Doe" />
            </div>
            <Input label="Email" type="email" defaultValue="john.doe@example.com" />
            <Input label="Phone" type="tel" defaultValue="+1 234 567 8900" />
            <Textarea label="Bio" rows={4} placeholder="Tell us about yourself..." />
            <Button variant="primary">Save Changes</Button>
          </form>
        </Card>

        {/* Address */}
        <Card>
          <h2 className="text-xl font-bold mb-6">Address</h2>
          <form className="space-y-4">
            <Input label="Street Address" defaultValue="123 Main St" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="City" defaultValue="New York" />
              <Input label="State" defaultValue="NY" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="ZIP Code" defaultValue="10001" />
              <Input label="Country" defaultValue="United States" />
            </div>
            <Button variant="primary">Save Address</Button>
          </form>
        </Card>

        {/* Change Password */}
        <Card>
          <h2 className="text-xl font-bold mb-6">Change Password</h2>
          <form className="space-y-4">
            <Input label="Current Password" type="password" />
            <Input label="New Password" type="password" />
            <Input label="Confirm New Password" type="password" />
            <Button variant="primary">Update Password</Button>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
