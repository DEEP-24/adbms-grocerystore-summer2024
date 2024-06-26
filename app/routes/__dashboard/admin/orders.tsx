import { Badge, Button, Modal, NativeSelect } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { type Order, OrderStatus, OrderType } from "@prisma/client";
import { type ActionArgs, type LoaderArgs, json } from "@remix-run/node";
import { useLoaderData, useSubmit, useTransition } from "@remix-run/react";
import { ShoppingCartIcon } from "lucide-react";
import React from "react";
import invariant from "tiny-invariant";
import { getAllOrders } from "~/lib/order.server";
import { db } from "~/lib/prisma.server";
import { requireUser } from "~/lib/session.server";
import { titleCase } from "~/utils/misc";

export const loader = async ({ request }: LoaderArgs) => {
  await requireUser(request);

  const orders = await getAllOrders();
  return json({ orders });
};

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();

  const intent = formData.get("intent")?.toString();
  invariant(intent, "Invalid intent");

  const orderId = formData.get("orderId")?.toString();
  invariant(orderId, "Invalid order id");
  switch (intent) {
    case "update-order-status": {
      const status = formData.get("status")?.toString();
      invariant(status, "Invalid status");

      await db.order.update({
        where: { id: orderId },
        data: { status: status as OrderStatus },
      });

      return json({ success: true });
    }

    default:
      return json(
        { success: false, message: "Invalid intent" },
        { status: 400 },
      );
  }
};

export default function Orders() {
  const { orders } = useLoaderData<typeof loader>();
  const transition = useTransition();
  const submit = useSubmit();

  const [selectedOrderId, setSelectedOrderId] = React.useState<
    Order["id"] | null
  >(null);

  const [selectedOrder, setSelectedOrder] = React.useState<
    (typeof orders)[number] | null
  >(null);

  const [isModalOpen, handleModal] = useDisclosure(false);

  const isSubmitting = transition.state !== "idle";

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  React.useEffect(() => {
    if (!selectedOrderId) {
      setSelectedOrder(null);
      return;
    }

    const order = orders.find((order) => order.id === selectedOrderId);
    if (!order) {
      return;
    }

    setSelectedOrder(order);
    handleModal.open();
    // handleModal is not meemoized, so we don't need to add it to the dependency array
  }, [orders, selectedOrderId]);

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
          </div>
        </div>
        <div className="mt-8 flex flex-col h-full">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                {orders.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                        >
                          Name
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Type
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          {""}
                        </th>
                        <th
                          scope="col"
                          className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                        >
                          Update status
                          <span className="sr-only">Edit</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-[rgb(129, 135, 80)] divide-y divide-gray-200">
                      {orders.map((order) => {
                        const statusOptions =
                          order.type === OrderType.PICKUP
                            ? ["ACCEPTED", "READY", "COMPLETED", "PROCESSING"]
                            : [
                                "ACCEPTED",
                                "PROCESSING",
                                "DELIVERED",
                                "ORDER_ASSIGNED",
                                "SHIPPED",
                                "OUT_FOR_DELIVERY",
                              ];

                        return (
                          <tr key={order.id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                              <div className="flex items-center">
                                <div className="ml-4">
                                  <div className="font-medium text-gray-900">
                                    {`${order.user.firstName} ${order.user.lastName}`}
                                  </div>
                                  <div className="text-gray-500">
                                    {order.user.email}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              <div className="text-gray-900">
                                {titleCase(order.type)}
                              </div>
                              <div className="text-gray-500">
                                ({titleCase(order.payment?.paymentMethod ?? "")}
                                )
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              <Badge
                                color={
                                  order.status === OrderStatus.PENDING
                                    ? "gray"
                                    : order.status === OrderStatus.CANCELLED
                                      ? "red"
                                      : "green"
                                }
                              >
                                {titleCase(order.status)}
                              </Badge>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              <Button
                                variant="light"
                                onClick={() => {
                                  setSelectedOrderId(order.id);
                                }}
                              >
                                View
                              </Button>
                            </td>
                            <td className="relative flex items-center justify-center whitespace-nowrap py-4 pl-3 pr-4 text-sm font-medium sm:pr-6">
                              <div className="flex items-center gap-2">
                                <NativeSelect
                                  className="w-48"
                                  defaultValue={order.status}
                                  data={statusOptions}
                                  disabled={
                                    isSubmitting ||
                                    order.status === OrderStatus.DELIVERED ||
                                    order.status === OrderStatus.CANCELLED ||
                                    order.status === OrderStatus.COMPLETED
                                  }
                                  onChange={(e) => {
                                    submit(
                                      {
                                        intent: "update-order-status",
                                        orderId: order.id,
                                        status: e.target.value,
                                      },
                                      {
                                        method: "post",
                                        replace: true,
                                      },
                                    );
                                  }}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="bg-[rgb(129, 135, 80)] relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                    <ShoppingCartIcon className="mx-auto h-9 w-9 text-gray-500" />
                    <span className="mt-4 block text-sm font-medium text-gray-500">
                      No orders placed yet. <br />
                      Come back later.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal
        opened={isModalOpen}
        onClose={() => {
          setSelectedOrderId(null);
          handleModal.close();
        }}
        title="View Order"
        size="lg"
        centered={true}
        overlayBlur={1}
        overlayOpacity={0.7}
        closeOnClickOutside={!isSubmitting}
        closeOnEscape={!isSubmitting}
      >
        <div>
          <table className="mt-4 w-full text-gray-500 sm:mt-6">
            <thead className="sr-only text-left text-sm text-gray-500 sm:not-sr-only">
              <tr>
                <th
                  scope="col"
                  className="py-3 pr-8 font-normal sm:w-2/5 lg:w-1/3"
                >
                  Product
                </th>
                <th
                  scope="col"
                  className="hidden w-1/5 py-3 pr-8 font-normal sm:table-cell"
                >
                  Barcode ID
                </th>
                <th
                  scope="col"
                  className="hidden w-1/5 py-3 pr-8 font-normal sm:table-cell"
                >
                  Quantity
                </th>
                <th
                  scope="col"
                  className="hidden py-3 pr-8 font-normal sm:table-cell"
                >
                  Price
                </th>

                <th scope="col" className="w-0 py-3 text-right font-normal" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 border-b border-gray-200 text-sm sm:border-t">
              {selectedOrder?.products.map((product) => {
                return (
                  <tr key={product.id}>
                    <td className="py-6 pr-8">
                      <div className="flex items-center">
                        <img
                          src={product.product.image}
                          alt={product.product.name}
                          className="mr-6 h-16 w-16 rounded object-cover object-center"
                        />
                        <div className="flex flex-col font-medium text-gray-900">
                          {product.product.name}
                        </div>
                      </div>
                    </td>

                    <td className="hidden py-6 pr-8 sm:table-cell">
                      {product.product.barcodeId}
                    </td>

                    <td className="hidden py-6 pr-8 sm:table-cell">
                      {product.quantity}
                    </td>

                    <td className="hidden py-6 pr-8 sm:table-cell">
                      ${product.amount}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Modal>
    </>
  );
}
