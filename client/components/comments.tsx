"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Input,
  Textarea,
  Card,
  CardBody,
  Avatar,
  CardHeader,
  CardFooter,
  Image,
} from "@nextui-org/react";
import ShortcutIcon from "@mui/icons-material/Shortcut";
import Replt from "@mui/icons-material/Reply";
import { Link } from "@nextui-org/link";
import { siteConfig } from "@/config/site";

interface Comment {
  _id: string;
  author: string;
  blog: string;
  content: string;
  createdAt: string;
  parentComment: {
    _id: string;
    content: string;
  } | null;
  updatedAt: string;
  __v: number;
}

const CommentSection = ({ _id }: { _id?: string }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState<string>("");
  const [user, setUser] = useState<{
    handle: string;
    avatarUrl: string;
  } | null>(null);
  const [avatars, setAvatars] = useState<Record<string, string>>({});

  // Fetch comments and user data
  useEffect(() => {
    if (!_id) return;

    const fetchComments = async () => {
      try {
        const response = await fetch(
          `${siteConfig.links.api}/comments/${_id}`
        );
        if (!response.ok) throw new Error("Failed to fetch comments");

        const data = await response.json();
        setComments(data.comments || []);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

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
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchComments();
    fetchUser();
  }, [_id]);

  const fetchAuthorPfp = async (handle: string) => {
    if (!handle || avatars[handle]) return;

    try {
      const response = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
      if (!response.ok) throw new Error("Failed to fetch user");

      const data = await response.json();
      const avatarUrl = data.result[0]?.titlePhoto;
      console.log(avatarUrl)
      
      setAvatars(prev => ({
        ...prev,
        [handle]: avatarUrl || "/default-avatar.png"
      }));
    } catch (error) {
      console.error("Error fetching user:", error);
      setAvatars(prev => ({
        ...prev,
        [handle]: "/default-avatar.png"
      }));
    }
  };

  // Fetch avatars for all comments
  useEffect(() => {
    comments.forEach(comment => {
      if (comment.author && !avatars[comment.author]) {
        fetchAuthorPfp(comment.author);
      }
    });
  }, [comments]);

  const handlePostComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`${siteConfig.links.api}/comments/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newComment,
          blog: _id,
          author: user?.handle,
        }),
      });

      if (response.ok) {
        const updatedComment = await response.json();
        setComments(prev => [updatedComment.comment, ...prev]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  const handlePostReply = async () => {
    if (!replyContent.trim()) return;

    try {
      const response = await fetch(
        `${siteConfig.links.api}/comments/reply/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: replyContent,
            blog: _id,
            author: user?.handle,
            parentCommentId: replyingTo,
          }),
        }
      );

      if (response.ok) {
        const updatedComment = await response.json();
        setComments(prev => [updatedComment.comment, ...prev]);
        setReplyContent("");
        setReplyingTo(null);
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  return (
    <div>
      
      <Card>
        {user && 
        (<CardBody>
        <Textarea
          className="w-full mb-4"
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handlePostComment();
            }
          }}
        />
        <Button
          className="w-6"
          color="primary"
          variant="flat"
          onClick={handlePostComment}
        >
          Post
        </Button>
      </CardBody>)
      }
      
      </Card>
      <h1 className="text-3xl my-4">Comments ({comments.length})</h1>
      {comments.map((comment) => (
        <Card key={comment._id} className="my-2 p-4">
          <CardHeader className="flex flex-col items-start">
            {comment.parentComment && (
              <div className="bg-[#3e3e3e35] flex w-full p-4 mb-2 rounded-xl ">
                <ShortcutIcon />
                <p>{comment.parentComment.content}</p>
              </div>
            )}
            <div className="flex justify-center items-center">
              <Image
                src={avatars[comment.author] || "/default-avatar.png"}
                height={60}
                width={60}
                className="rounded-full"
                alt={`${comment.author}'s avatar`}
              />
              <div className="flex flex-col mx-2 gap-2">
                <Link className="text-xl" href={`/profile/${comment.author}`}>
                  @{comment.author}
                </Link>
                <span className="text-xs">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <span className="h-[1px] bg-gray-300 w-full mt-1">&nbsp;</span>
          </CardHeader>
          <CardBody>{comment.content}</CardBody>
          {
            user && (
                <CardFooter className="flex flex-col items-end">
            <Button
              className="mb-2"
              color={"primary"}
              variant="flat"
              size="sm"
              onClick={() => {
                setReplyingTo(replyingTo === null ? comment._id : null);
              }}
            >
              {replyingTo === comment._id ? (
                <span className="text-2xl">&times;</span>
              ) : (
                <Replt fontSize="small" />
              )}
            </Button>
            {replyingTo === comment._id && (
              <div className="flex flex-col w-full">
                <Textarea
                  className="w-full mb-4"
                  placeholder="Write a comment..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handlePostReply();
                    }
                  }}
                />
                <Button
                  className="w-6"
                  color="primary"
                  variant="flat"
                  onClick={() => handlePostReply()}
                >
                  Reply
                </Button>
              </div>
            )}
          </CardFooter>
            )
          }
        </Card>
      ))}
    </div>
  );
};

export default CommentSection;