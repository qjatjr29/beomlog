import { useParams } from "react-router";
import { DailyPostList } from "./DailyPostList";
import { GroupGridList } from "./GroupGridList";

export const PostList = () => {
  const { category } = useParams<{ category: string }>();
  switch (category) {
    case "개발":
    case "책":
    case "프로젝트":
      return <GroupGridList category={category} />;
    case "일상":
      return <DailyPostList />;
    default:
      return <GroupGridList category="개발" />;
  }
};
