import DashboardLayout from '../../components/layout/DashboardLayout';
import { AddressForm, ChangePasswordForm, ProfileInfoForm, ProfilePicture } from '../../features/profile/components';

const Profile = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">My Profile</h1>

        {/* Profile Picture */}
        <ProfilePicture />

        {/* Personal Information */}
        <ProfileInfoForm />

        {/* Address */}
        <AddressForm />

        {/* Change Password */}
        <ChangePasswordForm />
      </div>
    </DashboardLayout>
  );
};

export default Profile;
