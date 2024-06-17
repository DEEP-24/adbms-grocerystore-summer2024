import { PlusIcon } from "@heroicons/react/24/solid";
import {
  Button,
  Modal,
  NumberInput,
  Select,
  TextInput,
  Textarea,
  clsx,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import type { Product } from "@prisma/client";
import type { ActionFunction, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { ObjectId } from "bson";
import * as React from "react";
import slugify from "slugify";
import { z } from "zod";
import { db } from "~/lib/prisma.server";
import { getAllCategories, getAllProducts } from "~/lib/product.server";
import { requireUser } from "~/lib/session.server";
import { QuantityUnit } from "~/quantity-units";
import { badRequest } from "~/utils/misc.server";
import type { inferErrors } from "~/utils/validation";
import { validateAction } from "~/utils/validation";

enum MODE {
  edit = 0,
  add = 1,
}

const ManageProductSchema = z.object({
  productId: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  quantity: z.preprocess(
    Number,
    z.number().min(0, "Quantity must be at least 0"),
  ),
  price: z.preprocess(
    Number,
    z.number().min(0, "Price must be greater than 0"),
  ),
  image: z.string().min(1, "Image is required"),
  quantityUnit: z.string().min(1, "Quantity Unit is required"),
  category: z.string().min(1, "Category is required"),
  barcodeId: z.string().min(1, "Barcode ID is required"),
  isReturnable: z.string().min(1, "Returnable is required"),
});

export const loader = async ({ request }: LoaderArgs) => {
  await requireUser(request);

  const products = await getAllProducts();
  const categories = await getAllCategories();

  return json({
    products,
    categories,
  });
};

interface ActionData {
  success: boolean;
  fieldErrors?: inferErrors<typeof ManageProductSchema>;
}

export const action: ActionFunction = async ({ request }) => {
  const { fields, fieldErrors } = await validateAction(
    request,
    ManageProductSchema,
  );

  if (fieldErrors) {
    return badRequest<ActionData>({ success: false, fieldErrors });
  }

  const { productId, ...rest } = fields;
  const id = new ObjectId();

  await db.product.upsert({
    where: {
      id: productId || id.toString(),
    },
    update: {
      ...rest,
      isReturnable: rest.isReturnable === "true",
      slug: slugify(rest.name, { lower: true }),
      category: { connect: { id: rest.category } },
    },
    create: {
      ...rest,
      isReturnable: rest.isReturnable === "true",
      slug: slugify(rest.name, { lower: true }),
      category: { connect: { id: rest.category } },
      quantityUnit: rest.quantityUnit as string,
    },
  });

  return json({
    success: true,
  });
};

export default function ManageProducts() {
  const fetcher = useFetcher<ActionData>();
  const imageUploadFetcher = useFetcher();
  const { products, categories } = useLoaderData<typeof loader>();

  const [selectedProductId, setSelectedProductId] = React.useState<
    Product["id"] | null
  >(null);

  const [selectedProduct, setSelectedProduct] = React.useState<
    (typeof products)[number] | null
  >(null);
  const [mode, setMode] = React.useState<MODE>(MODE.edit);
  const [isModalOpen, handleModal] = useDisclosure(false);
  const [imageUrl, setImageUrl] = React.useState<string>();

  const isSubmitting = fetcher.state !== "idle";

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  React.useEffect(() => {
    if (fetcher.state !== "idle" && fetcher.submission === undefined) {
      return;
    }

    if (fetcher.data?.success) {
      setSelectedProductId(null);
      handleModal.close();
    }
    // handleModal is not meemoized, so we don't need to add it to the dependency array
  }, [fetcher.data?.success, fetcher.state, fetcher.submission]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  React.useEffect(() => {
    if (
      imageUploadFetcher.state !== "idle" &&
      imageUploadFetcher.submission === undefined
    ) {
      return;
    }

    if (imageUploadFetcher.data?.success) {
      setImageUrl(imageUploadFetcher.data?.imgSrc);
    }
    // handleModal is not meemoized, so we don't need to add it to the dependency array
  }, [
    imageUploadFetcher.data?.success,
    imageUploadFetcher.state,
    imageUploadFetcher.submission,
  ]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  React.useEffect(() => {
    if (!selectedProductId) {
      setSelectedProduct(null);
      return;
    }

    const product = products.find(
      (product) => product.id === selectedProductId,
    );
    if (!product) {
      return;
    }

    setSelectedProduct(product);
    setImageUrl(product.image);
    handleModal.open();
    // handleModal is not meemoized, so we don't need to add it to the dependency array
  }, [products, selectedProductId]);

  React.useEffect(() => {
    if (mode === MODE.add) {
      setSelectedProductId(null);
      setSelectedProduct(null);
      setImageUrl(undefined);
    }
  }, [mode]);

  return (
    <>
      <div className="sm:px-6 lg:px-8 overflow-hidden">
        <div className="sm:flex sm:flex-auto sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">
              Manage Products
            </h1>
          </div>
          <div>
            <Button
              loading={isSubmitting}
              loaderPosition="left"
              onClick={() => {
                setMode(MODE.add);
                handleModal.open();
              }}
            >
              <PlusIcon className="h-4 w-4" />
              <span className="ml-2">Add product</span>
            </Button>
          </div>
        </div>
        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300 overflow-hidden">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 md:pl-0"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="hidden py-3.5 px-3 text-left text-sm font-semibold text-gray-900 sm:table-cell"
                    >
                      Barcode ID
                    </th>
                    <th
                      scope="col"
                      className="hidden py-3.5 px-3 text-left text-sm font-semibold text-gray-900 sm:table-cell"
                    >
                      Price
                    </th>
                    <th
                      scope="col"
                      className="hidden py-3.5 px-3 text-left text-sm font-semibold text-gray-900 sm:table-cell"
                    >
                      Quantity
                    </th>
                    <th
                      scope="col"
                      className="hidden py-3.5 px-3 text-left text-sm font-semibold text-gray-900 sm:table-cell"
                    >
                      Unit
                    </th>
                    <th
                      scope="col"
                      className="hidden py-3.5 px-3 text-left text-sm font-semibold text-gray-900 sm:table-cell"
                    >
                      Category
                    </th>
                    <th
                      scope="col"
                      className="hidden py-3.5 px-3 text-left text-sm font-semibold text-gray-900 sm:table-cell"
                    >
                      Is Returnable
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-6 md:pr-0"
                    >
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 md:pl-0">
                        {product.name}
                      </td>
                      <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">
                        {product.barcodeId}
                      </td>
                      <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">
                        {product.quantity}
                      </td>
                      <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">
                        {product.quantityUnit}
                      </td>
                      <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">
                        {product.category.name}
                      </td>

                      <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">
                        {product.isReturnable ? "Yes" : "No"}
                      </td>

                      <td className="relative space-x-4 whitespace-nowrap py-4 pl-3 pr-4 text-left text-sm font-medium sm:pr-6 md:pr-0">
                        <div className="flex items-center gap-6">
                          <Button
                            loading={isSubmitting}
                            variant="subtle"
                            loaderPosition="right"
                            onClick={() => {
                              setSelectedProductId(product.id);
                              setMode(MODE.edit);
                            }}
                          >
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Modal
        opened={isModalOpen}
        onClose={() => {
          setSelectedProductId(null);
          handleModal.close();
        }}
        title={clsx({
          "Edit product": mode === MODE.edit,
          "Add product": mode === MODE.add,
        })}
        centered={true}
        overlayBlur={1}
        overlayOpacity={0.7}
        closeOnClickOutside={!isSubmitting}
        closeOnEscape={!isSubmitting}
      >
        <fetcher.Form method="post" replace={true}>
          <fieldset disabled={isSubmitting} className="flex flex-col gap-4">
            <input type="hidden" name="productId" value={selectedProduct?.id} />

            <div className="flex items-center justify-center gap-2 w-full">
              <TextInput
                name="name"
                label="Name"
                defaultValue={selectedProduct?.name}
                error={fetcher.data?.fieldErrors?.name}
                required={true}
                className="w-full"
              />
              <TextInput
                name="barcodeId"
                label="Barcode ID"
                defaultValue={selectedProduct?.barcodeId}
                error={fetcher.data?.fieldErrors?.barcodeId}
                required={true}
                className="w-full"
              />
            </div>

            <Textarea
              name="description"
              label="Description"
              defaultValue={selectedProduct?.description}
              error={fetcher.data?.fieldErrors?.description}
              required={true}
            />

            <div className="flex items-center justify-center gap-2 w-full">
              <NumberInput
                name="price"
                label="Price"
                min={0}
                defaultValue={selectedProduct?.price}
                error={fetcher.data?.fieldErrors?.price}
                precision={2}
                required={true}
              />
              <Select
                name="isReturnable"
                label="Is returnable"
                defaultValue={selectedProduct?.isReturnable.toString()}
                error={fetcher.data?.fieldErrors?.isReturnable}
                data={[
                  { label: "Yes", value: "true" },
                  { label: "No", value: "false" },
                ]}
                required={true}
              />
            </div>

            <div className="flex items-center justify-center gap-2 w-full">
              <NumberInput
                name="quantity"
                label="Quantity"
                defaultValue={selectedProduct?.quantity}
                min={0}
                error={fetcher.data?.fieldErrors?.quantity}
                required={true}
              />
              <Select
                name="quantityUnit"
                label="Unit"
                defaultValue={selectedProduct?.quantityUnit}
                error={fetcher.data?.fieldErrors?.quantityUnit}
                data={Object.values(QuantityUnit).map((unit) => ({
                  label: unit,
                  value: unit,
                }))}
                placeholder="Select Unit"
                searchable={true}
                required={true}
              />
            </div>

            <TextInput
              name="image"
              label="Image"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              error={fetcher.data?.fieldErrors?.image}
              required={true}
            />

            <Select
              name="category"
              label="Category"
              required={true}
              data={Object.values(categories).map((category) => ({
                label: category.name,
                value: category.id,
              }))}
              defaultValue={selectedProduct?.category.id}
              placeholder="Select category"
              searchable={true}
              error={fetcher.data?.fieldErrors?.category}
            />

            <div className="mt-1 flex items-center justify-end gap-4">
              <Button
                variant="subtle"
                type="button"
                disabled={isSubmitting}
                onClick={() => handleModal.close()}
                color="red"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={isSubmitting}
                loaderPosition="right"
              >
                {mode === MODE.edit ? "Save changes" : "Add product"}
              </Button>
            </div>
          </fieldset>
        </fetcher.Form>
      </Modal>
    </>
  );
}
