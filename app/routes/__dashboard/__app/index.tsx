import ProductCarousel from "~/components/product-carousel";
import { useAppData } from "~/utils/hooks";

export default function Items() {
  const { categories } = useAppData();

  return (
    <div className="flex flex-col gap-4">
      <div className="px-4 sm:px-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Products
          </h2>
        </div>

        {categories.map((category) => {
          return (
            category.products.length > 0 && (
              <div key={category.id}>
                <h3 className="mt-3 text-lg font-semibold text-gray-900 bg-gray-100 rounded-xl text-center p-2">
                  {category.name}
                </h3>
                <ProductCarousel products={category.products} />
              </div>
            )
          );
        })}
      </div>
    </div>
  );
}
