import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-4xl w-full bg-white shadow-xl rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Illustration */}
        <div className="bg-primary-600 flex items-center justify-center p-10">
          <div className="text-center text-white space-y-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-40 w-40" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="11" width="18" height="10" rx="2" strokeWidth="1.5" className="opacity-30" />
              <path d="M7 11V8a5 5 0 0110 0v3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 16v1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h2 className="text-3xl font-extrabold">Access Denied</h2>
            <p className="max-w-xs mx-auto text-sm opacity-90">You don’t have permission to view this page. If you believe this is an error, contact an administrator or sign in with an account that has access.</p>
            <div className="flex items-center justify-center space-x-3">
              <Link to="/login">
                <Button className="w-36">Sign In</Button>
              </Link>
              <a href="mailto:support@example.com" className="inline-block">
                <Button variant="outline" className="w-36">Contact Support</Button>
              </a>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h1 className="text-4xl font-extrabold text-gray-900">Unauthorized</h1>
            <p className="mt-2 text-gray-600">Looks like you tried to access a page that requires special permissions.</p>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 border border-gray-100 p-5 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800">What happened?</h3>
              <p className="mt-2 text-sm text-gray-600">The page you tried to reach is restricted. This can happen when your session expires, your role doesn't allow access, or you followed a protected link.</p>
            </div>

            <div className="bg-gray-50 border border-gray-100 p-5 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800">Quick actions</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li>• Make sure you're signed in with the correct account.</li>
                <li>• Request access from your administrator.</li>
                <li>• Try returning to the home page or dashboard.</li>
              </ul>
            </div>

            <div className="flex space-x-3">
              <Link to="/">
                <Button variant="ghost">Back to Home</Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="secondary">Go to Dashboard</Button>
              </Link>
            </div>
          </div>

          <p className="mt-8 text-xs text-gray-400">If you continue to see this page after signing in, please contact support with the URL and time of the error.</p>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
