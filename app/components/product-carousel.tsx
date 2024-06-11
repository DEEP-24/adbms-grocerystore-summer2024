import { Anchor } from "@mantine/core";
import type { Product } from "@prisma/client";
import { Link } from "@remix-run/react";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";

interface ProductCarouselProps {
  products: Product[];
}

export default function ProductCarousel({ products }: ProductCarouselProps) {
  return (
    <ScrollArea>
      <div className="flex space-x-4 p-4">
        {products.map((product) => {
          return (
            <Link to={`/product/${product.slug}`} key={product.id}>
              <div className="sm:mx-[unset] p-1 rounded-xl flex flex-col">
                <div className="flex items-center justify-center rounded-xl w-full p-1">
                  <p className="text-sm font-medium text-gray-900 p-1">
                    {product.barcodeId}
                  </p>
                </div>
                <div className="h-56 w-64 overflow-hidden rounded-xl lg:h-72">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover object-center"
                  />
                </div>

                <div className="flex flex-col p-2">
                  <h3 className="text-sm text-black">
                    <Anchor
                      to={`/product/${product.slug}`}
                      prefetch="intent"
                      component={Link}
                    >
                      {product.name}
                    </Anchor>
                  </h3>
                  <p className="text-sm font-medium text-gray-500">
                    Price: ${product.price}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
