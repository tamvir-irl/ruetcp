"use client"

import { useState, useEffect } from "react";
import { Pagination, Card, CardBody, Spinner } from "@nextui-org/react";
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
  const [loading, setLoadig] = useState(true);
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
      finally{
        setLoadig(false)
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
  if(loading){
    return(
      <Card className='bg-none shadow-none h-full flex flex-col justify-center items-center'>
        <CardBody className="h-full flex flex-col justify-center items-center">
          <Spinner size="lg"></Spinner>
        </CardBody>
      </Card>
    )
  }

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
