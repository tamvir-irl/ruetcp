"use client"

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardBody, Button } from '@nextui-org/react';
import { siteConfig } from '@/config/site';
import { Link } from '@nextui-org/link';
interface User {
    username: string;
    groupRating: number;
  }
const RatingPage = () => {
  const [users, setUsers] = useState<User[] | []>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${siteConfig.links.api}/users`);
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        
        const data = await response.json();
        // Sort users by their groupRating in descending order
        const sortedUsers = data.sort((a : User, b : User) => b.groupRating - a.groupRating);
        setUsers(sortedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center mt-12">
        <h1 >Loading...</h1>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">Top Users by Rating</h1>
       <Card className="mb-4 shadow-lg rounded-lg">
            <CardBody className='flex flex-row justify-between'>
            <span ><span className={`text-black p-2 bg-violet-300 px-8 mr-4 rounded-xl -translate-x-4`}>#</span> Username</span> <span>Rating</span>
            </CardBody>
        </Card>
      {users.length > 0 ? (
        users.map((user, index) => (
          <Card key={index} className="mb-4 shadow-lg rounded-lg">
            <CardBody className='flex flex-row justify-between'>
            <span ><span className={`text-black p-2 px-8 mr-4 ${index == 0 ? "bg-yellow-200" : index == 1 ? "bg-gray-300" : index == 2 ? "bg-yellow-600" : "bg-blue-300"} rounded-xl -translate-x-4`}>{index + 1}</span> <Link color='foreground' href={`/profile/${user.username}`}>{user.username}</Link></span> <span>{user.groupRating}</span>
            </CardBody>
          </Card>
        ))
      ) : (
        <h4>No users found.</h4>
      )}
    </div>
  );
};

export default RatingPage;
