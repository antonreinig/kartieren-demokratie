import { getAllTopics } from "@/actions/get-topic";
import { SlugSelectionClient } from "@/components/layout/slug-selection-client";

export default async function Home() {
  const topics = await getAllTopics();

  return (
    <SlugSelectionClient topics={topics} />
  );
}
