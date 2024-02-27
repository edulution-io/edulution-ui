import {
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { NotFoundPage } from "@/pages/NotFound/NotFoundPage";
import { HomePage } from "@/pages/Home";
import { FileSharing } from "../pages/FileSharing/FileSharing";
import { ConferencePage } from "@/pages/ConferencePage";
import { MainLayout } from "@/components/layout/MainLayout";
import { BlankLayout } from "@/components/layout/BlankLayout";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={<MainLayout showLogo={false} children={undefined} />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/conferences" element={<ConferencePage />} />
        <Route path="/file-sharing" element={<FileSharing />} />
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
