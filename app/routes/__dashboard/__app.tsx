import type { LoaderArgs, SerializeFrom } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useSubmit } from "@remix-run/react";
import {
  CircleUserIcon,
  HistoryIcon,
  HomeIcon,
  ShoppingCartIcon,
} from "lucide-react";
import { Footer } from "~/components/Footer";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useCart } from "~/context/CartContext";
import {
  getAllCategoriesWithProducts,
  getAllProducts,
} from "~/lib/product.server";
import { isAdmin, isCustomer, requireUserId } from "~/lib/session.server";
import { cn } from "~/lib/utils";
import { useOptionalUser, useUser } from "~/utils/hooks";

export type AppLoaderData = SerializeFrom<typeof loader>;
export const loader = async ({ request }: LoaderArgs) => {
  await requireUserId(request);

  if (await isAdmin(request)) {
    return redirect("/admin");
  }

  const products = await getAllProducts();
  const categories = await getAllCategoriesWithProducts();

  return json({
    products,
    categories,
    isCustomer: await isCustomer(request),
  });
};

export default function AppLayout() {
  const user = useUser();
  const { clearCart } = useCart();
  const submit = useSubmit();

  return (
    <div className="grid h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block h-screen overflow-hidden">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <img src="/logo.png" alt="Logo" className="h-10 w-10" />
              <span className="">Grocery Store</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-gray-100",
                    isActive &&
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-gray-300 bg-gray-300",
                  )
                }
              >
                <HomeIcon className="h-4 w-4" />
                Home
              </NavLink>
              <NavLink
                to="/cart"
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-gray-100",
                    isActive &&
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-gray-300 bg-gray-300",
                  )
                }
              >
                <ShoppingCartIcon className="h-4 w-4" />
                Cart
              </NavLink>
              <NavLink
                to="order-history"
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-gray-100",
                    isActive &&
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-gray-300 bg-gray-300",
                  )
                }
              >
                <HistoryIcon className="h-4 w-4" />
                Order History
              </NavLink>
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col h-full overflow-hidden">
        <header className="flex flex-shrink-0 h-14 items-center justify-end gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <div className="flex flex-col items-center justify-center">
            <span>{`${user?.firstName}${user?.lastName}`}</span>
            <span>{user?.email}</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild={true}>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUserIcon className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white">
              <DropdownMenuItem>
                <Form
                  replace={true}
                  method="post"
                  id="logout-form"
                  action="/api/auth/logout"
                  onSubmit={(e) => {
                    e.preventDefault();

                    clearCart();
                    submit(null, {
                      method: "post",
                      action: "/api/auth/logout",
                    });
                  }}
                />
                <button type="submit" form="logout-form">
                  Logout
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <div className="flex-1 overflow-y-auto p-5">
          <main>
            <Outlet />
          </main>
        </div>
        <Footer />
      </div>
    </div>
  );
}

// export const unstable_shouldReload : ShouldReloadFunction
//  ({ submission, prevUrl, url }) => {
//   if (!submission && prevUrl.pathname === url.pathname) {
//     return false;
//   }

//   return true;
// };
