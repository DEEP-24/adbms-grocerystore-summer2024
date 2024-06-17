import { PlusIcon } from "@heroicons/react/24/solid";
import { Button, Modal, TextInput, clsx } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import type { Product } from "@prisma/client";
import type { ActionFunction, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { ObjectId } from "bson";
import * as React from "react";
import { z } from "zod";
import { db } from "~/lib/prisma.server";
import { getAllCategories } from "~/lib/product.server";
import { requireUser } from "~/lib/session.server";
import { badRequest } from "~/utils/misc.server";
import type { inferErrors } from "~/utils/validation";
import { validateAction } from "~/utils/validation";

enum MODE {
  edit = 0,
  add = 1,
}

const ManageCategorySchema = z.object({
  categoryId: z.string().optional(),
  name: z.string().min(1, "Name is required"),
});

export const loader = async ({ request }: LoaderArgs) => {
  await requireUser(request);

  const categories = await getAllCategories();

  return json({
    categories,
  });
};

interface ActionData {
  success: boolean;
  fieldErrors?: inferErrors<typeof ManageCategorySchema>;
}

export const action: ActionFunction = async ({ request }) => {
  const { fields, fieldErrors } = await validateAction(
    request,
    ManageCategorySchema,
  );

  if (fieldErrors) {
    return badRequest<ActionData>({ success: false, fieldErrors });
  }

  const { categoryId, name } = fields;
  const id = new ObjectId();

  await db.category.upsert({
    where: {
      id: categoryId || id.toString(),
    },
    update: {
      name,
    },
    create: {
      id: categoryId || id.toString(),
      name,
    },
  });

  return json({
    success: true,
  });
};

export default function ManageProducts() {
  const fetcher = useFetcher<ActionData>();
  const imageUploadFetcher = useFetcher();
  const { categories } = useLoaderData<typeof loader>();

  const [selectedCategoryId, setSelectedCategoryId] = React.useState<
    Product["id"] | null
  >(null);

  const [selectedCategory, setSelectedCategory] = React.useState<
    (typeof categories)[number] | null
  >(null);
  const [mode, setMode] = React.useState<MODE>(MODE.edit);
  const [isModalOpen, handleModal] = useDisclosure(false);

  const isSubmitting = fetcher.state !== "idle";

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  React.useEffect(() => {
    if (fetcher.state !== "idle" && fetcher.submission === undefined) {
      return;
    }

    if (fetcher.data?.success) {
      setSelectedCategoryId(null);
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

    // handleModal is not meemoized, so we don't need to add it to the dependency array
  }, [
    imageUploadFetcher.data?.success,
    imageUploadFetcher.state,
    imageUploadFetcher.submission,
  ]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  React.useEffect(() => {
    if (!selectedCategoryId) {
      setSelectedCategory(null);
      return;
    }

    const category = categories.find(
      (category) => category.id === selectedCategoryId,
    );
    if (!category) {
      return;
    }

    setSelectedCategory(category);
    handleModal.open();
    // handleModal is not meemoized, so we don't need to add it to the dependency array
  }, [categories, selectedCategoryId]);

  React.useEffect(() => {
    if (mode === MODE.add) {
      setSelectedCategoryId(null);
      setSelectedCategory(null);
    }
  }, [mode]);

  return (
    <>
      <div className="sm:px-6 lg:px-8 overflow-hidden">
        <div className="sm:flex sm:flex-auto sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">
              Manage Categories
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
              <span className="ml-2">Add category</span>
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
                      className="relative py-3.5 pl-3 pr-4 sm:pr-6 md:pr-0"
                    >
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 md:pl-0">
                        {category.name}
                      </td>

                      <td className="relative space-x-4 whitespace-nowrap py-4 pl-3 pr-4 text-left text-sm font-medium sm:pr-6 md:pr-0">
                        <div className="flex items-center gap-6">
                          <Button
                            loading={isSubmitting}
                            variant="subtle"
                            loaderPosition="right"
                            onClick={() => {
                              setSelectedCategoryId(category.id);
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
          setSelectedCategoryId(null);
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
            <input
              type="hidden"
              name="categoryId"
              value={selectedCategory?.id}
            />

            <TextInput
              name="name"
              label="Name"
              defaultValue={selectedCategory?.name}
              error={fetcher.data?.fieldErrors?.name}
              required={true}
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
