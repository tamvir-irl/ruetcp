"use client";

import { useState, useEffect, useRef } from "react";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";
import { Button, Card, CardHeader, CardBody, CardFooter, Link as NextUILink } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import ChatIcon from "@mui/icons-material/Chat";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { siteConfig } from "@/config/site";

interface User {
  handle: string;
  avatarUrl: string;
  groupRating: number;
  type: string;
}

interface BlogProps {
  blog: {
    _id: string;
    title: string;
    content: string;
    author: string;
    createdAt: string;
    initialUpvotes: number;
    initialDownvotes: number;
    upvotedBy: string[];
    downvotedBy: string[];
    edited: boolean;
    editedAt: string;
  };
}

const Blog = ({ blog }: BlogProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [upvotes, setUpvotes] = useState(blog.initialUpvotes);
  const [downvotes, setDownvotes] = useState(blog.initialDownvotes);
  const [upvoted, setUpvoted] = useState(false);
  const [downvoted, setDownvoted] = useState(false);
  const [showModal, setShowModal] = useState(false); // Modal visibility state
  const [commentCount, setCommentCount] = useState(0); // State to store comment count
  const modalRef = useRef<HTMLDivElement | null>(null); // Reference to modal element
  const router = useRouter(); // Next.js router to navigate to login page

  useEffect(() => {
    const fetchUser = async () => {
      const sessionID = localStorage.getItem("sessionID");
      if (!sessionID) return;

      try {
        const response = await fetch(`${siteConfig.links.api}/user?sessionID=${sessionID}`);
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          console.error("Failed to fetch user data.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    const fetchCommentCount = async () => {
      try {
        const response = await fetch(`${siteConfig.links.api}/comments/count/${blog._id}`);
        if (response.ok) {
          const data = await response.json();
          setCommentCount(data.total);
        } else {
          console.error("Failed to fetch comment count.");
        }
      } catch (error) {
        console.error("Error fetching comment count:", error);
      }
    };
    fetchCommentCount();
    fetchUser();
  }, []);

  useEffect(() => {
    if (user?.handle) {
      setUpvoted(blog.upvotedBy.includes(user.handle));
      setDownvoted(blog.downvotedBy.includes(user.handle));
    }
  }, [user, blog]);

  const handleVote = async (id: string, type: "upvote" | "downvote") => {
    if (!user?.handle) {
      setShowModal(true);
      return;
    }

    try {
      const res = await fetch(`${siteConfig.links.api}/blogs/${id}/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.handle }),
      });

      if (res.ok) {
        const updatedBlog = await res.json();
        setUpvotes(updatedBlog.blog.initialUpvotes);
        setDownvotes(updatedBlog.blog.initialDownvotes);
        setUpvoted(updatedBlog.blog.upvotedBy.includes(user.handle));
        setDownvoted(updatedBlog.blog.downvotedBy.includes(user.handle));
      } else {
        console.error("Failed to update vote.");
      }
    } catch (error) {
      console.error("Error updating vote:", error);
    }
  };

  const handleEdit = () => {
    router.push(`/blog/edit/${blog._id}`);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this blog?")) return;

    try {
      const res = await fetch(`${siteConfig.links.api}/blogs/delete/${blog._id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Blog deleted successfully.");
        window.location.reload(); // Redirect to homepage after deletion
      } else {
        console.error("Failed to delete blog.");
      }
    } catch (error) {
      console.error("Error deleting blog:", error);
    }
  };

  const formatContent = (content: string) => {
    let tempContent = content;

    tempContent = tempContent.replace(/\*\*(.*?)\*\*/g, `<span class="font-extrabold">$1</span>`);
    tempContent = tempContent.replace(/\*(.*?)\*/g, `<span class="italic">$1</span>`);
    tempContent = tempContent.replace(/\_(.*?)\_/g, `<span class="underline">$1</span>`);
    tempContent = tempContent.replace(/\[(.*?)\]\((.*?)\)/g, `<a href="$2" class="text-blue-400">$1</a>`);
    tempContent = tempContent.replace(/@(\w+)/g, `<a href="/profile/$1" class="text-violet-500">@$1</a>`);
    tempContent = tempContent.replace(/\n/g, "<br />");

    return tempContent;
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      setShowModal(false);
    }
  };

  useEffect(() => {
    if (showModal) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showModal]);

  return (
    <Card className="p-4 mb-4">
      <CardHeader className="flex flex-col items-start">
        <NextUILink href={`/blog/${blog._id}`} className="text-xl font-semibold">
          {blog.title}&nbsp;{blog.edited && <span className="text-xs text-gray-500">(edited)</span>}
        </NextUILink>
        <p className="text-sm text-gray-500">
          By{" "}
          <NextUILink href={`/profile/${blog.author}`} className="text-violet-400">
            {blog.author}
          </NextUILink>{" "}
          on {blog.edited ? new Date(blog.createdAt).toLocaleDateString() : new Date(blog.editedAt).toLocaleDateString()}
        </p>
      </CardHeader>
      <CardBody>
        <p
          className="mt-2"
          dangerouslySetInnerHTML={{ __html: formatContent(blog.content) }}
        />
      </CardBody>
      <CardFooter className="flex justify-between gap-2">    
        <div className="flex items-center gap-2">
        <NextUILink href={`/blog/${blog._id}`}>
          <Button size="sm" color="secondary" variant="flat">
            <ChatIcon />&nbsp;{commentCount}
          </Button>
        </NextUILink>
        {user?.handle === blog.author && (
            <>
              <Button
                size="sm"
                color="primary"
                onPress={handleEdit}
                isIconOnly
                variant="flat"
                endContent={<EditIcon />}
              >
              </Button>
              <Button
                size="sm"
                color="danger"
                isIconOnly
                variant="flat"
                onPress={handleDelete}
                endContent={<DeleteIcon />}
              >
              </Button>
            </>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={upvoted ? "solid" : "flat"}
            color={"success"}
            onPress={() => handleVote(blog._id, "upvote")}
            endContent={<ThumbUpAltIcon />}
            disabled={!user}
          >
            {upvotes}
          </Button>
          <Button
            size="sm"
            variant={downvoted ? "solid" : "flat"}
            color={"danger"}
            onPress={() => handleVote(blog._id, "downvote")}
            endContent={<ThumbDownAltIcon />}
            disabled={!user}
          >
            {downvotes}
          </Button>
          
        </div>
      </CardFooter>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50 z-50">
          <div ref={modalRef} className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-semibold mb-4">You need to log in</h2>
            <p className="mb-4">Please log in to upvote or downvote.</p>
            <Button
              color="primary"
              onPress={() => {
                router.push("/auth/login");
                setShowModal(false);
              }}
            >
              Go to Login
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default Blog;
