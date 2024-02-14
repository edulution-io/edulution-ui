import {
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { NotFoundPage } from "@/pages/NotFound/NotFoundPage";
import { HomePage } from "../pages/Home/HomePage";
import { ConferencePage } from "../pages/ConferencePage";
import { MainLayout } from "@/components/layout/MainLayout";
import { BlankLayout } from "@/components/layout/BlankLayout";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/conferences" element={<ConferencePage />} />
      </Route>

      <Route element={<BlankLayout />}>
        <Route path={"*"} element={<NotFoundPage />} />
      </Route>
    </>,
  ),
);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
