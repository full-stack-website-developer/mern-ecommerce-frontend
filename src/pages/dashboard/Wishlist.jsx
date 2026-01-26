import DashboardLayout from '../../components/layout/DashboardLayout';
import ProductList from '../../components/product/ProductList';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';

const Wishlist = () => {
  const hasItems = true; // Placeholder

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Wishlist</h1>
          <Button variant="outline">Clear All</Button>
        </div>

        {hasItems ? (
          <>
            <div className="mb-4 text-gray-600">
              You have 12 items in your wishlist
            </div>
            <ProductList />
          </>
        ) : (
          <Card>
            <EmptyState
              icon="❤️"
              title="Your wishlist is empty"
              description="Start adding products you love to your wishlist!"
            />
            <div className="text-center mt-6">
              <Button variant="primary">Continue Shopping</Button>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Wishlist;
