import { Outlet } from "@remix-run/react";
import { CartProvider } from "~/context/CartContext";

export default function DashboardLayout() {
  return (
    <CartProvider>
      <Outlet />
    </CartProvider>
  );
}

// export const unstable_shouldReload : ShouldReloadFunction
//  ({ submission, prevUrl, url }) => {
//   if (!submission && prevUrl.pathname === url.pathname) {
//     return false;
//   }

//   return true;
// };
