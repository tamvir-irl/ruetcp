"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Link as NextUILink,
} from "@nextui-org/react";
import CommentSection from "@/components/comments";
import { siteConfig } from "@/config/site";
//console.log
interface User {
  handle: string;
  avatarUrl: string;
  groupRating: number;
  type: string;
}

interface Blog {
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
}

const Blog = () => {
  const { id } = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [upvotes, setUpvotes] = useState(0);
  const [downvotes, setDownvotes] = useState(0);
  const [upvoted, setUpvoted] = useState(false);
  const [downvoted, setDownvoted] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchBlog = async () => {
      try {
        const response = await fetch(`${siteConfig.links.api}/blogs/${id}`);
        if (!response.ok) throw new Error("Failed to fetch blog");

        const data = await response.json();
        setBlog(data.blog);
        setUpvotes(data.blog.initialUpvotes);
        setDownvotes(data.blog.initialDownvotes);
      } catch (error) {
        console.error("Error fetching blog:", error);
      }
    };

    fetchBlog();
  }, [id]);

  useEffect(() => {
    const fetchUser = async () => {
      const sessionID = localStorage.getItem("sessionID");
      if (!sessionID) return;

      try {
        const response = await fetch(
          `${siteConfig.links.api}/user?sessionID=${sessionID}`
        );
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

    fetchUser();
  }, []);

  useEffect(() => {
    if (user?.handle && blog) {
      setUpvoted(blog.upvotedBy.includes(user.handle));
      setDownvoted(blog.downvotedBy.includes(user.handle));
    }
  }, [user, blog]);

  const handleVote = async (id: string, type: "upvote" | "downvote") => {
    if (!user?.handle) return;

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
        const error = await res.json(); // Parse error details
        console.error("API Error:", error);
        console.error("Failed to update vote.");
      }
    } catch (error) {
      console.error("Error updating vote:", error);
    }
  };
  const handleEdit = () => {
    router.push(`/blog/edit/${blog?._id}`);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this blog?")) return;

    try {
      const res = await fetch(
        `${siteConfig.links.api}/blogs/delete/${blog?._id}`,
        {
          method: "DELETE",
        }
      );

      if (res.ok) {
        alert("Blog deleted successfully.");
        window.history.back(); // Redirect to homepage after deletion
      } else {
        console.error("Failed to delete blog.");
      }
    } catch (error) {
      console.error("Error deleting blog:", error);
    }
  };
  const formatContent = (content: string) => {
    let tempContent = content;

    tempContent = tempContent.replace(
      /\*\*(.*?)\*\*/g,
      `<span class="font-extrabold">$1</span>`
    );
    tempContent = tempContent.replace(
      /\*(.*?)\*/g,
      `<span class="italic">$1</span>`
    );
    tempContent = tempContent.replace(
      /\_(.*?)\_/g,
      `<span class="underline">$1</span>`
    );
    tempContent = tempContent.replace(
      /\[(.*?)\]\((.*?)\)/g,
      `<a href="$2" class="text-blue-400">$1</a>`
    );
    tempContent = tempContent.replace(
      /@(\w+)/g,
      `<a href="/profile/$1" class="text-violet-500">@$1</a>`
    );
    tempContent = tempContent.replace(/\n/g, "<br />");

    return tempContent;
  };

  return blog ? (
    <>
      <Card className="p-4 mb-4">
        <CardHeader className="flex flex-col items-start">
          <NextUILink
            href={`/blog/${blog?._id}`}
            className="text-xl font-semibold"
          >
            {blog?.title}&nbsp;{blog?.edited ? <span className="text-xs text-gray-500">(edited)</span> : ""}
          </NextUILink>
          <p className="text-sm text-gray-500">
            By{" "}
            <NextUILink
              href={`/profile/${blog?.author}`}
              className="text-violet-400"
            >
              {blog?.author}
            </NextUILink>{" "}
            on {blog && (blog.edited ? new Date(blog.createdAt).toLocaleDateString() : new Date(blog.editedAt).toLocaleDateString())}
          </p>
        </CardHeader>
        <CardBody>
          <p
            className="mt-2"
            dangerouslySetInnerHTML={{ __html: formatContent(blog!.content) }}
          />
        </CardBody>
        <CardFooter className="flex justify-between gap-2">
        <div className="flex items-center gap-2">

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
          <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={upvoted ? "solid" : "flat"}
            color={"success"}
            onPress={() => handleVote(blog!._id, "upvote")}
            endContent={<ThumbUpAltIcon />}
            disabled={!user} // Disabled if not logged in
          >
            {upvotes}
          </Button>
          <Button
            size="sm"
            variant={downvoted ? "solid" : "flat"}
            color={"danger"}
            onPress={() => handleVote(blog!._id, "downvote")}
            endContent={<ThumbDownAltIcon />}
            disabled={!user} // Disabled if not logged in
          >
            {downvotes}
          </Button>
          </div>
        </CardFooter>
      </Card>
      <CommentSection _id={blog?._id} />
    </>
  ) : (
    <p>Blog Not Found...</p>
  );
};

export default Blog;
