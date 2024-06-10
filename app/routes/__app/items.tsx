import { Anchor } from "@mantine/core";
import { Link } from "@remix-run/react";
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

        {categories.map((category) => (
          <div key={category.id}>
            <h3 className="mt-3 text-lg font-semibold text-gray-900 bg-gray-100 w-full rounded-xl text-center p-2">
              {category.name}
            </h3>
            <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
              {category.products.map((product) => {
                return (
                  <Link to={`/product/${product.slug}`} key={product.id}>
                    <div className="mx-auto sm:mx-[unset] border-2 p-2 rounded-xl shadow-lg">
                      <div className="h-48 overflow-hidden rounded-xl bg-gray-200 shadow lg:h-64">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>

                      <p className="mt-1 text-sm font-medium text-gray-900 bg-slate-100 rounded-xl text-center p-1">
                        Barcode ID: {product.barcodeId}
                      </p>

                      <div className="flex justify-between mt-1 p-2">
                        <h3 className="text-sm text-gray-700">
                          <Anchor
                            to={`/product/${product.slug}`}
                            prefetch="intent"
                            component={Link}
                          >
                            {product.name}
                          </Anchor>
                        </h3>
                        <p className="text-sm font-medium text-gray-900">
                          Price: ${product.price}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
