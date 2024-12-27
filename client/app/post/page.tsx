"use client";
import React, { useState, useEffect } from 'react';
import {
  Button,
  Textarea,
  Input,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  ButtonGroup,
  Selection
} from "@nextui-org/react";
import { Bold, Italic, Underline, Link2, AtSign } from 'lucide-react';
import { siteConfig } from '@/config/site';
//console.log
interface Users{
    username: string;
}
interface User {
    handle: string;
    avatarUrl: string;
    groupRating: number;
    type: string;
  }
const PostPage = () => {
  const [title, setTitle] = useState(''); // Title state
  const [content, setContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<Users[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      if (searchQuery.length > 0) {
        try {
          const response = await fetch(`${siteConfig.links.api}/searchUser?q=${searchQuery}`);
          if (response.ok) {
            const data = await response.json();
            setUsers(data);
          } else {
            console.error('Error fetching users:', response.statusText);
          }
        } catch (error) {
          console.error('Error:', error);
        }
      } else {
        setUsers([]);
      }
    };

    loadUsers();
  }, [searchQuery]);
  const handleFormatText = (command: 'bold' | 'italic' | 'underline' | 'link') => {
    const textarea = document.querySelector('textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    let newText = content;
    switch (command) {
      case 'bold':
        newText = content.substring(0, start) + `**${selectedText}**` + content.substring(end);
        break;
      case 'italic':
        newText = content.substring(0, start) + `*${selectedText}*` + content.substring(end);
        break;
      case 'underline':
        newText = content.substring(0, start) + `_${selectedText}_` + content.substring(end);
        break;
      case 'link':
        const url = prompt('Enter the URL:');
        if (url) {
          newText = content.substring(0, start) + `[${selectedText || url}](${url})` + content.substring(end);
        }
        break;
    }
    setContent(newText);
  };

  const handleUserMention = (username: string) => {
    setContent(content + ` @${username}`);
  };

  const filteredUsers = users
    .filter((user) => user.username.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, 5); // Only show top 5 results

  const handleSelectionChange = (key: Selection) => {
    if (key instanceof Set && key.size > 0) {
      const username = Array.from(key)[0].toString();
      handleUserMention(username);
    }
  };
  useEffect(() => {
    const fetchUser = async () => {
      const sessionID = localStorage.getItem("sessionID");

      if (!sessionID) {
        console.log("No sessionID found in localStorage.");
        return;
      }

      try {
        const response = await fetch(`${siteConfig.links.api}/user?sessionID=${sessionID}`);
        if (response.ok) {
          const userData = await response.json();
          setUser(userData); // This updates the user state
        } else {
          console.error("Failed to fetch user data.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUser();
  }, []);
  const handleSubmit = () => {
    const blogData = {
        title,
        description: content,
        author: user?.handle  
    }
    // 
    fetch(`${siteConfig.links.api}/blogs/post`, {
        method: 'POST', // Specify the HTTP method
        headers: {
          'Content-Type': 'application/json' // Tell the server we are sending JSON data
        },
        body: JSON.stringify(blogData) // Convert the JavaScript object to a JSON string
      })
        .then(response => response.json()) // Parse the JSON response
        .then(data => {
          console.log('Blog created');
        })
        .catch(error => {
          console.error('Error:', error);
        });
    alert('Post submitted!');
    window.location.href = "/";
    setIsModalOpen(false);
  };

  return (
    
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader className="flex flex-col gap-3">
          <h4 className="text-xl font-bold">Create Post</h4>

          {/* Title Input */}
          <Input
            label="Post Title"
            placeholder="Enter the title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
          />

          <ButtonGroup>
            <Button
              isIconOnly
              variant="flat"
              onPress={() => handleFormatText('bold')}
              aria-label="Bold"
            >
              <Bold size={18} />
            </Button>
            <Button
              isIconOnly
              variant="flat"
              onPress={() => handleFormatText('italic')}
              aria-label="Italic"
            >
              <Italic size={18} />
            </Button>
            <Button
              isIconOnly
              variant="flat"
              onPress={() => handleFormatText('underline')}
              aria-label="Underline"
            >
              <Underline size={18} />
            </Button>
            <Button
              isIconOnly
              variant="flat"
              onPress={() => handleFormatText('link')}
              aria-label="Add link"
            >
              <Link2 size={18} />
            </Button>
            <Dropdown>
              <DropdownTrigger>
                <Button
                  isIconOnly
                  variant="flat"
                  aria-label="Mention user"
                >
                  <AtSign size={18} />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="User mentions"
                className="w-56"
                selectionMode="single"
                items={filteredUsers}
              >
                <DropdownItem
                  key="search-input"
                  className="h-14 gap-2"
                  isReadOnly
                >
                  <Input
                    size="sm"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onClick={(e: React.MouseEvent) => e.stopPropagation()} //this onPress is showing error
                  />
                </DropdownItem>
                <DropdownItem key={"usernames"}>
                  <div className='w-full flex flex-col justify-center'>
                {filteredUsers.map((user) => (
                  <Button className="mb-2 rounded-xl ml-4" variant='flat' color="primary" key={user.username} onPress={()=>handleUserMention(user.username)}>@{user.username}</Button>
                ))}
                </div>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </ButtonGroup>
        </CardHeader>

        <CardBody>
          <Textarea
            placeholder="Write your post..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            minRows={8}
            size="lg"
          />
        </CardBody>

        <CardFooter className="flex justify-between">
          <p className="text-small text-default-500">
            Share your thoughts with the community
          </p>
          <Button
            color="primary"
            onPress={() => setIsModalOpen(true)}
          >
            Post
          </Button>
        </CardFooter>
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        size="lg"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Confirm your post
              </ModalHeader>
              <ModalBody>
                <div className="bg-default-100 p-4 rounded-lg">
                  {/* Display title in modal */}
                  <h3 className="text-lg font-bold">{title}</h3>
                  {(() => {
                    let tempContent = content;

                    // Replace **text** with <span className="font-extrabold">text</span>
                    tempContent = tempContent.replace(/\*\*(.*?)\*\*/g, (match, p1) => {
                      return `<span class="font-extrabold">${p1}</span>`;
                    });

                    // Replace *text* with <span className="italic">text</span>
                    tempContent = tempContent.replace(/\*(.*?)\*/g, (match, p1) => {
                      return `<span class="italic">${p1}</span>`;
                    });

                    // Replace _text_ with <span className="underline">text</span>
                    tempContent = tempContent.replace(/_(.*?)_/g, (match, p1) => {
                      return `<span class="underline">${p1}</span>`;
                    });

                    // Replace [text](url) with <a href="url">text</a>
                    tempContent = tempContent.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, p1, p2) => {
                      return `<a href="${p2}" class="text-blue-400">${p1}</a>`;
                    });

                    // Replace @username with <a href="/profile/username">@username</a>
                    tempContent = tempContent.replace(/@(\w+)/g, (match, username) => {
                      return `<a href="/profile/${username}" class="text-violet-500">${match}</a>`;
                    });

                    // Return the transformed content, and dangerously set it as innerHTML
                    return <p className="whitespace-pre-wrap max-h-[400px] overflow-y-scroll" dangerouslySetInnerHTML={{ __html: tempContent }} />;
                  })()}
                </div>
              </ModalBody>

              <ModalFooter>
                <Button
                  variant="light"
                  onPress={onClose}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleSubmit}
                >
                  Submit
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
    
  );
};

export default PostPage;
