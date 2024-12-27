"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@nextui-org/navbar";

import NextLink from "next/link";

import { Avatar, Button } from "@nextui-org/react";
import { siteConfig } from "@/config/site";



// Define the User type interface
interface User {
  handle: string;
  avatarUrl: string;
  groupRating: number;
  type: string;
}

export const Navbar = () => {
  const [user, setUser] = useState<User | null>(null); // user can be either a User object or null
  const router = useRouter();

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

  const handleLogout = () => {
    localStorage.removeItem("sessionID");
    setUser(null);
    window.location.href = "/" // Redirect to homepage after logout
  };

  return (
    <NextUINavbar className="hidden sm:flex" maxWidth="xl" position="sticky">
      <NavbarContent className="hidden sm:flex basis-1/5 sm:basis-full " justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="hidden sm:flex justify-start items-center gap-1" href="/">
            <span className="text-2xl text-green-300 font-black">{"<"}</span>
            <span className="text-2xl text-violet-500 font-black">{" / "}</span>
            <span className="text-2xl text-orange-300 font-black">{">"}</span>
            <span className="text-2xl">RUET CP PEOPLE</span>
          </NextLink>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        {user ? (
          <>
            <NextLink href={`/profile/${user.handle}`} className="flex items-center gap-2">
              <span>{user.handle}</span>
              <Avatar size="md" src={user.avatarUrl} />
            </NextLink>
            <Button color="warning" onPress={handleLogout}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <NextLink href="/auth/login">
              <Button size="sm" color="success" variant="flat">
                Login
              </Button>
            </NextLink>
            <NextLink href="/auth/register">
              <Button size="sm" color="primary" variant="flat">
                Register
              </Button>
            </NextLink>
          </>
        )}
      </NavbarContent>
    </NextUINavbar>
  );
};
