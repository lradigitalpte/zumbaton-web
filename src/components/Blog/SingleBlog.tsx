import { BlogPost } from "@/types/blog";
import { BlogCard } from "./BlogCard";

/** @deprecated Use BlogCard directly */
const SingleBlog = ({ blog }: { blog: BlogPost }) => {
  return <BlogCard blog={blog} />;
};

export default SingleBlog;
