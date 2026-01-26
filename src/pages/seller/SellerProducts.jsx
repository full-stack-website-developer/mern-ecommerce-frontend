import SellerLayout from '../../components/layout/SellerLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';

const SellerProducts = () => {
  const products = [
    { id: 1, name: 'Product 1', category: 'Electronics', price: 99.99, stock: 50, status: 'Active', sales: 120 },
    { id: 2, name: 'Product 2', category: 'Clothing', price: 49.99, stock: 0, status: 'Out of Stock', sales: 85 },
    { id: 3, name: 'Product 3', category: 'Home', price: 149.99, stock: 25, status: 'Active', sales: 200 },
    { id: 4, name: 'Product 4', category: 'Sports', price: 79.99, stock: 100, status: 'Active', sales: 150 },
    { id: 5, name: 'Product 5', category: 'Books', price: 19.99, stock: 200, status: 'Active', sales: 300 },
  ];

  return (
    <SellerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Products</h1>
          <Button variant="primary">Add New Product</Button>
        </div>

        <Card>
          <div className="mb-6 flex items-center justify-between">
            <SearchBar placeholder="Search products..." className="max-w-md" />
            <div className="flex space-x-2">
              <select className="input-field w-48">
                <option>All Categories</option>
                <option>Electronics</option>
                <option>Clothing</option>
                <option>Home</option>
              </select>
              <select className="input-field w-48">
                <option>All Status</option>
                <option>Active</option>
                <option>Inactive</option>
                <option>Out of Stock</option>
              </select>
            </div>
          </div>

          <Table
            headers={['ID', 'Name', 'Category', 'Price', 'Stock', 'Sales', 'Status', 'Actions']}
          >
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{product.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">${product.price.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{product.stock}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{product.sales}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={product.status === 'Active' ? 'success' : 'danger'}>
                    {product.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <Button variant="ghost" className="text-sm">Edit</Button>
                    <Button variant="ghost" className="text-sm text-red-600">Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>

          <Pagination currentPage={1} totalPages={10} />
        </Card>
      </div>
    </SellerLayout>
  );
};

export default SellerProducts;
