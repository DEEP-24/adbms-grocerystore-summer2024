import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { Button, NumberInput } from "@mantine/core";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import * as React from "react";
import { useCart } from "~/context/CartContext";
import { useProduct } from "~/utils/hooks";

export const loader = async ({ params }: LoaderArgs) => {
  const { slug } = params;

  if (!slug) {
    throw new Response("No slug provided", { status: 404 });
  }

  return json({ slug });
};

export default function Item() {
  const { slug } = useLoaderData<typeof loader>();
  const product = useProduct(slug);
  const { addItemToCart } = useCart();

  const [quantity, setQuantity] = React.useState(1);

  // This scenario is unlikely
  // as the slug is checked in the loader
  if (!product) {
    return null;
  }

  const isOutOfStock = product.quantity === 0;
  const totalPrice = quantity ? product.price * quantity : product.price;

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="mx-auto max-w-screen sm:px-6 lg:grid lg:max-w-screen lg:grid-cols-3 lg:gap-x-10">
          <div className="sm:mt-10 lg:col-span-1 lg:mt-0 lg:self-center">
            <div className="mb-12">
              <Button
                leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
                variant="white"
                size="md"
                component={Link}
                to=".."
                pl={0}
              >
                Back
              </Button>
            </div>
            <div className="lg:col-span-2 lg:self-end">
              <div className="mt-4">
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                  {product.name}
                </h1>
              </div>

              <section aria-labelledby="information-heading" className="mt-4">
                <p className="text-lg text-gray-900 sm:text-xl">
                  ${totalPrice}
                </p>

                <div className="mt-4 space-y-6">
                  <p className="text-base text-gray-500">
                    {product.description}
                  </p>
                </div>

                {isOutOfStock ? null : (
                  <>
                    <div className="mt-4 space-y-6">
                      <span>Available Quantity: </span>
                      <span className="text-base text-gray-500">
                        {product.quantity} {product.quantityUnit}
                      </span>
                    </div>

                    <div className="mt-1 space-y-6">
                      <span>Barcode ID: </span>
                      <span className="text-base text-gray-500">
                        {product.barcodeId}
                      </span>
                    </div>

                    <NumberInput
                      mt={12}
                      required={true}
                      label="Quantity"
                      value={quantity}
                      max={product.quantity}
                      onChange={(val) => setQuantity(Number(val))}
                      min={1}
                      defaultValue={1}
                      className="w-full"
                    />
                  </>
                )}
                <div className="flex items-center justify-center mt-4">
                  {product.isReturnable ? (
                    <span className="text-green-500">
                      product can be returned
                    </span>
                  ) : (
                    <span className="text-red-500">
                      product cannot be returned
                    </span>
                  )}
                </div>
              </section>
            </div>
            <div className="mt-6 lg:col-span-2 lg:row-start-2 lg:max-w-lg lg:self-start">
              <Button
                fullWidth={true}
                mt="2.5rem"
                disabled={
                  !quantity || isOutOfStock || quantity > product.quantity
                }
                onClick={() =>
                  addItemToCart({
                    ...product,
                    quantity,
                    basePrice: product.price,
                  })
                }
              >
                {isOutOfStock ? "Out of stock" : "Add to cart"}
              </Button>
            </div>
          </div>
          <div className="overflow-hidden rounded-xl shadow-md lg:col-span-2">
            <img
              src={product.image}
              alt={product.name}
              className="aspect-square w-full object-cover"
            />
          </div>
        </div>
      </div>
    </>
  );
}
