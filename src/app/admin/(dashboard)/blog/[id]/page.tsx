import { BlogEditor } from "@/components/lisaan/blog-editor";

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BlogEditor postId={id} />;
}
