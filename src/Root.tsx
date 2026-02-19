import { Outlet } from "react-router";
import { Layout } from "./features/layout/components";
import { PostsProvider } from "./contexts/PostsContext";
import { AdminProvider } from "./contexts/AdminContext";
import { BGMProvider } from "./contexts/BGMContext";

export const Root = () => {
  return (
    <AdminProvider>
      <BGMProvider>
        <PostsProvider>
          <Layout>
            <Outlet />
          </Layout>
        </PostsProvider>
      </BGMProvider>
    </AdminProvider>
  );
};
