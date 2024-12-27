"use client"

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardBody, CardFooter, Image, Button, Divider, Spinner} from '@nextui-org/react';
import Blog from '@/components/blog';
import { siteConfig } from '@/config/site';

interface User {
    firstName: string;
    lastName: string;
    rating: number;
    maxRating: number;
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
  }
const Profile = () => {
  const { id } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [blogs, setBlogs] = useState<Blog[] | []>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${siteConfig.links.api}/profile/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setUser(data.user);
        setBlogs(data.blogs);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <Card className='bg-none shadow-none h-full flex flex-col justify-center items-center'>
        <CardBody className="h-full flex flex-col justify-center items-center">
          <Spinner size="lg"></Spinner>
        </CardBody>
      </Card>
    );
  }

  if (!user) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h3 style={{ color: 'red' }}>User not found.</h3>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      {/* Profile Header */}
      <Card style={{ padding: '24px', marginBottom: '40px' }}>
        <CardHeader style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Image src={user.avatarUrl} width={80} height={80} alt={user.handle} className='rounded-full'/>
          <div>
            <h2>{user.firstName + " " + user.lastName === "undefined undefined" ? user.handle : user.firstName + " " + user.lastName} | {user.type}</h2>
            <p>@{user.handle}</p>
          </div>
        </CardHeader>
        <CardBody>
          <ul className='flex justify-around'>
          <span>Rating (CF): {user.rating}</span>
          <span className='bg-slate-600 w-[1px] h-full'>&nbsp;</span>
          <span>Max Rating (CF): {user.maxRating}</span>
          </ul>
        </CardBody>
      </Card>


      {/* Blogs Section */}
      <h2 style={{ marginBottom: '20px' }}>Blogs by {user.handle}</h2>
      {blogs.length > 0 ? (
        blogs.map((blog) => (
          <Blog key={blog._id} blog={blog} />
        ))
      ) : (
        <p>No blogs posted yet.</p>
      )}
    </div>
  );
};

export default Profile;
