import { useParams } from "react-router";
import { DevPostList } from "./DevPostList";
import { DailyPostList } from "./DailyPostList";
import { GroupThumbnailList } from "./GroupGridList";

export const PostList = () => {
  const { category } = useParams<{ category: string }>();

  switch (category) {
    case "개발":
      return <DevPostList />;
    case "일상":
      return <DailyPostList />;
    case "책":
    case "프로젝트":
      return <GroupThumbnailList category={category} />;
    default:
      return <DevPostList />;
  }
};
