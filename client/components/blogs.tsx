"use client"

import { useState, useEffect } from "react";
import { Pagination } from "@nextui-org/react";
import Blog from "./blog";
import { siteConfig } from "@/config/site";

interface BlogData {
  _id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  initialUpvotes: number;
  initialDownvotes: number;
  upvotedBy: string[];
  downvotedBy: string[];
}

const Blogs = () => {
  const [blogs, setBlogs] = useState<BlogData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 5;

  useEffect(() => {
    // Fetch blogs from the API
    const fetchBlogs = async () => {
      try {
        const response = await fetch(siteConfig.links.api + "/blogs/");
        const data = await response.json();
        if (data.success) {
          setBlogs(data.blogs);
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
      }
    };

    fetchBlogs();
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(blogs.length / blogsPerPage);
  const displayedBlogs = blogs.slice(
    (currentPage - 1) * blogsPerPage,
    currentPage * blogsPerPage
  );

  return (
    <div className="blogs-container">
      <div className="blogs-list">
        {displayedBlogs.map((blog) => (
          <Blog key={blog._id} blog={blog} />
        ))}
      </div>
      {blogs.length > blogsPerPage && (
        <Pagination
          total={totalPages}
          initialPage={1}
          onChange={(page) => setCurrentPage(page)}
        />
      )}
    </div>
  );
};

export default Blogs;
