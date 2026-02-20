import { createBrowserRouter } from "react-router";
import { Root } from "./Root";
import { Home } from "./features/home/components";
import { PostDetail, PostList } from "./features/posts/components";
import { Guestbook } from "./features/guestbook/components";
import { About } from "./features/about/components";
import { NotFound } from "./features/not-found/components";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "posts/:category", Component: PostList },
      { path: "post/:id", Component: PostDetail },
      { path: "guestbook", Component: Guestbook },
      { path: "profile", Component: About },
      { path: "*", Component: NotFound },
    ],
  },
]);
