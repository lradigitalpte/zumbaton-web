export type BlogAuthor = {
  name: string;
  image: string;
  designation: string;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  image: string;
  author: BlogAuthor;
  tags: string[];
  publishDate: string;
  publishedAt: string | null;
  isFeatured: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImage: string | null;
};

/** @deprecated Use BlogPost */
export type Blog = BlogPost & {
  paragraph: string;
};
