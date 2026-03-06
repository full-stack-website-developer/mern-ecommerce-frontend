import SellerLayout from '../../components/layout/SellerLayout';
import ProductForm from '../../features/product/components/ProductForm'; 

const SellerAddProduct = () => {
  return (
    <SellerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Add Product</h1>
        </div>

        <ProductForm successPath="/seller/products" cancelPath="/seller/products" />
      </div>
    </SellerLayout>
  );
};

export default SellerAddProduct;
