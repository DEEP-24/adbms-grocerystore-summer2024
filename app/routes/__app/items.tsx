import { Anchor, Button } from "@mantine/core";
import { Link } from "@remix-run/react";
import { useAppData } from "~/utils/hooks";

export default function Items() {
  const { products, categories } = useAppData();

  console.log("Categories", categories);

  return (
    <div className="flex flex-col gap-4">
      <div className="px-4 sm:px-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Products
          </h2>
        </div>

        {categories.map((category) => (
          <div key={category.id}>
            <h3 className="mt-3 text-lg font-semibold text-gray-900 bg-gray-100 w-full rounded-xl text-center p-2">
              {category.name}
            </h3>
            <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
              {category.products.map((product) => {
                return (
                  <div key={product.id} className="mx-auto sm:mx-[unset]">
                    <div className="h-48 overflow-hidden rounded-md bg-gray-200 shadow lg:h-64">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>

                    <h3 className="mt-4 text-sm text-gray-700">
                      <Anchor
                        to={`/product/${product.slug}`}
                        prefetch="intent"
                        component={Link}
                      >
                        {product.name}
                      </Anchor>
                    </h3>

                    <p className="mt-1 text-sm font-medium text-gray-900">
                      Price: ${product.price}
                    </p>

                    <p className="mt-1 text-sm font-medium text-gray-900">
                      Barcode ID: {product.barcodeId}
                    </p>

                    <Button
                      to={`/product/${product.slug}`}
                      component={Link}
                      variant="light"
                      fullWidth={true}
                      mt="md"
                    >
                      View
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
