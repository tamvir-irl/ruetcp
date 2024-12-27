"use client"
import Blogs from "@/components/blogs";
import {Card, CardHeader, CardBody, CardFooter} from "@nextui-org/card";
import { Image, Divider } from "@nextui-org/react";
import { Link } from "@nextui-org/link";
import { useEffect, useState } from "react";
import { siteConfig } from "@/config/site";

interface User {
  handle: string;
  avatarUrl: string;
  groupRating: number;
  type: string;
}
interface CfUser {
  lastName: string;
  country: string;
  lastOnlineTimeSeconds: number;
  city: string;
  rating: number;
  friendOfCount: number;
  titlePhoto: string;
  handle: string;
  avatar: string;
  firstName: string;
  contribution: number;
  organization: string;
  rank: string;
  maxRating: number;
  registrationTimeSeconds: number;
  maxRank: string;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [cfUser, setcfUser] = useState<CfUser | null>(null);

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
          setUser(userData);
          try {
            const cfres = await fetch(`https://codeforces.com/api/user.info?handles=${userData.handle}`);
            if (cfres.ok) {
              const cfData = await cfres.json();
              setcfUser(cfData.result[0]);
            } else {
              console.error("Failed to fetch user data.");
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
          }
        } else {
          console.error("Failed to fetch user data.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
      
    };

    fetchUser();
  }, []);
  return (
    <section className="flex w-full">
      {/* Blogs Section */}
      <div className="w-full sm:w-3/4 p-4">
        <Blogs />
      </div>

      {/* Other Section */}
      <div className="w-1/4 p-4 hidden sm:block">
      {/**
       * <Card className="mb-4">
        <CardHeader>
          <h1>Upcomming Contest</h1>
        </CardHeader>
        <Divider />
        <CardBody>
          <p>Recent Blogs</p>
        </CardBody>
        <Divider />
        <CardFooter>
          <Link isExternal showAnchorIcon href={`/blogs`}>
            View All
          </Link>
        </CardFooter>
      </Card>
       */}
        {
          user && cfUser ?
          <Card className="max-w-[400px]">
      <CardHeader className="flex gap-3">
        <Image
          alt="nextui logo"
          height={80}
          radius="sm"
          src={cfUser?.titlePhoto}
          width={80}
        />
        <div className="flex flex-col">
          <p className="text-md">{cfUser?.firstName} {cfUser?.lastName}</p>
          <p className="text-small text-default-500">{cfUser?.handle}</p>
        </div>
      </CardHeader>
      <Divider />
      <CardBody>
        <p>Rating: {user?.groupRating}</p>
      </CardBody>
      <Divider />
      <CardFooter>
        <Link isExternal showAnchorIcon href={`/profile/${user?.handle}`}>
          Profile
        </Link>
      </CardFooter>
    </Card>
    : ""
        }
      </div>
    </section>
  );
}
