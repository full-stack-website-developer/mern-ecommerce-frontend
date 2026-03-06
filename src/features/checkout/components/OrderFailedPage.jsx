import { Link } from 'react-router-dom';
import MainLayout from '../../../components/layout/MainLayout';

// ─────────────────────────────────────────────────────────────────────────────
//  OrderFailedPage
//  Shown when JazzCash/Easypaisa gateway reports a failed payment.
//  The gateway redirects to /order-failed?code=XXX
// ─────────────────────────────────────────────────────────────────────────────

const OrderFailedPage = () => {
    return (
        <MainLayout>
            <div className="max-w-lg mx-auto py-12 px-4 text-center">
                <div className="text-7xl mb-4">❌</div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h1>
                <p className="text-gray-500 mb-8">
                    Your payment could not be processed. Your order has NOT been confirmed.
                    No money has been charged.
                </p>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-700 mb-8 text-left">
                    <p className="font-semibold mb-1">What to do next:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Check your JazzCash/Easypaisa balance</li>
                        <li>Make sure your mobile account is active</li>
                        <li>Try again with a different payment method</li>
                        <li>Contact support if the issue persists</li>
                    </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        to="/checkout"
                        className="bg-blue-600 hover:bg-blue-700 text-white
                                   font-semibold py-3 px-6 rounded-lg transition"
                    >
                        Try Again
                    </Link>
                    <Link
                        to="/cart"
                        className="border border-gray-300 hover:bg-gray-50 text-gray-700
                                   font-semibold py-3 px-6 rounded-lg transition"
                    >
                        Back to Cart
                    </Link>
                </div>
            </div>
        </MainLayout>
    );
};

export default OrderFailedPage;