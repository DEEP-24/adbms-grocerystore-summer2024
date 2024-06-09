import { ScrollArea } from "@mantine/core";
import type { LoaderArgs, SerializeFrom } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useLocation } from "@remix-run/react";
import {
  CircleUserIcon,
  HomeIcon,
  LineChartIcon,
  MenuIcon,
  Package2Icon,
  PackageIcon,
  ShoppingCartIcon,
  UsersIcon,
} from "lucide-react";
import { Footer } from "~/components/Footer";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { getAllProducts } from "~/lib/product.server";
import { isAdmin, isCustomer, requireUserId } from "~/lib/session.server";
import { useOptionalUser } from "~/utils/hooks";

export type AppLoaderData = SerializeFrom<typeof loader>;
export const loader = async ({ request }: LoaderArgs) => {
  await requireUserId(request);

  if (await isAdmin(request)) {
    return redirect("/admin");
  }

  const products = await getAllProducts();
  // geat all the unique categories
  const categories = Array.from(
    new Set(products.flatMap((product) => product.category)),
  );

  return json({
    products,
    categories,
    isCustomer: await isCustomer(request),
  });
};

export default function AppLayout() {
  return (
    <>
      <div className="flex h-full flex-col">
        <HeaderComponent />
        <ScrollArea classNames={{ root: "flex-1" }}>
          <main>
            <Outlet />
          </main>
        </ScrollArea>
        <Footer />
      </div>
    </>
  );
}

function HeaderComponent() {
  const location = useLocation();
  const { user } = useOptionalUser();
  const { isCustomer } = useLoaderData<typeof loader>();

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <img src="/logo.png" alt="Logo" className="h-10 w-10" />
              <span className="">Grocery Store</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <Link
                to="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <HomeIcon className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                to="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <ShoppingCartIcon className="h-4 w-4" />
                Orders
              </Link>
              <Link
                to="#"
                className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary"
              >
                <PackageIcon className="h-4 w-4" />
                Products{" "}
              </Link>
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center justify-end gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild={true}>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUserIcon className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
