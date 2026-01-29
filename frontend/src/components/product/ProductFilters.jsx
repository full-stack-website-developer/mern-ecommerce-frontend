import Checkbox from '../common/Checkbox';
import Button from '../common/Button';

const ProductFilters = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Filters</h3>
      
      {/* Price Range */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Price Range</h4>
        <div className="space-y-2">
          <Checkbox label="$0 - $25" />
          <Checkbox label="$25 - $50" />
          <Checkbox label="$50 - $100" />
          <Checkbox label="$100 - $200" />
          <Checkbox label="$200+" />
        </div>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Categories</h4>
        <div className="space-y-2">
          <Checkbox label="Electronics" />
          <Checkbox label="Clothing" />
          <Checkbox label="Home & Garden" />
          <Checkbox label="Sports" />
          <Checkbox label="Books" />
        </div>
      </div>

      {/* Brand */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Brand</h4>
        <div className="space-y-2">
          <Checkbox label="Brand A" />
          <Checkbox label="Brand B" />
          <Checkbox label="Brand C" />
          <Checkbox label="Brand D" />
        </div>
      </div>

      {/* Rating */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Rating</h4>
        <div className="space-y-2">
          <Checkbox label="4+ Stars" />
          <Checkbox label="3+ Stars" />
          <Checkbox label="2+ Stars" />
          <Checkbox label="1+ Stars" />
        </div>
      </div>

      {/* Availability */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Availability</h4>
        <div className="space-y-2">
          <Checkbox label="In Stock" />
          <Checkbox label="Out of Stock" />
        </div>
      </div>

      <div className="flex space-x-2">
        <Button variant="primary" className="flex-1">Apply Filters</Button>
        <Button variant="secondary">Reset</Button>
      </div>
    </div>
  );
};

export default ProductFilters;
