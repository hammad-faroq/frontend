import { Outlet } from "react-router-dom";
import InnerHeader from "../components/InnerHeader";
import InnerFooter from "../components/InnerFooter";

function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <InnerHeader />

      {/* PAGE CONTENT */}
      <main className="flex-1 bg-gray-50">
        <Outlet />
      </main>

      <InnerFooter />
    </div>
  );
}

export default MainLayout;