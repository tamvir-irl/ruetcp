"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
} from "@nextui-org/navbar";

import { Kbd } from "@nextui-org/kbd";
import { Link } from "@nextui-org/link";
import { Input } from "@nextui-org/input";
import { link as linkStyles } from "@nextui-org/theme";
import NextLink from "next/link";
import clsx from "clsx";
import { Avatar, Button } from "@nextui-org/react";
import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import {
  DiscordIcon,
  SearchIcon,
  CodeForcesIcon
} from "@/components/icons";

interface User {
  handle: string;
  avatarUrl: string;
  groupRating: number;
  type: string;
}

export const NavBar2 = () => {
  const [user, setUser] = useState<User | null>(null); // user can be either a User object or null
  const [searchQuery, setSearchQuery] = useState(""); // State to hold the search query
  const [suggestions, setSuggestions] = useState<string[]>([]); // State to hold the search suggestions
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
          console.log("Fetched userData:", userData);
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
    window.location.href = "/"; // Redirect to homepage after logout
  };

  const searchInput = (
    <Input
      aria-label="Search"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)} // Update the query on input change
      classNames={{
        inputWrapper: "bg-default-100",
        input: "text-sm",
      }}
      endContent={
        <Kbd className="hidden lg:inline-block" keys={["command"]}>
          K
        </Kbd>
      }
      labelPlacement="outside"
      placeholder="Search..."
      startContent={
        <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
      }
      type="search"
    />
  );

  useEffect(() => {
    if (searchQuery.length > 0) {
      const fetchSuggestions = async () => {
        try {
          const response = await fetch(`${siteConfig.links.api}/searchUser?q=${searchQuery}`);
          if (response.ok) {
            const data = await response.json();
            setSuggestions(data.map((user: { username: string }) => user.username));
            console.log(suggestions) // Set the top 5 suggestions
          } else {
            console.error("Failed to fetch search suggestions.");
          }
        } catch (error) {
          console.error("Error fetching search suggestions:", error);
        }
      };

      fetchSuggestions();
    } else {
      setSuggestions([]); // Clear suggestions if the search query is empty
    }
  }, [searchQuery]); // Fetch suggestions whenever the search query changes

  const handleSuggestionClick = (username: string) => {
    router.push(`/profile/${username}`); // Redirect to the user's profile
    setSearchQuery(""); // Clear the search query
    setSuggestions([]); // Clear suggestions
  };

  return (
    <NextUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="hidden sm:flex basis-1/5 sm:basis-full" justify="start">
        <ul className="hidden lg:flex gap-4 justify-start ml-2">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium"
                )}
                color="foreground"
                href={item.href}
              >
                {item.label}
              </NextLink>
            </NavbarItem>
            
          ))}
          {(user && (user.type === "MANAGER" || user.type === "ADMIN")) ? (
            <NavbarItem key="/post">
              <NextLink
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium"
                )}
                color="foreground"
                href="/post"
              >
                Post
              </NextLink>
            </NavbarItem>
          ) : (
            ""
          )}
          <Link
            isExternal
            aria-label="Discord"
            href={siteConfig.links.discord}
          >
            <DiscordIcon size={22} className="text-default-500" />
          </Link>
          <Link
            isExternal
            aria-label="Discord"
            href={siteConfig.links.codeforces}
          >
            <CodeForcesIcon size={22} className="text-default-500" />
          </Link>
          <ThemeSwitch />
        </ul>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex basis-1/5 sm:basis-full" justify="end">
        <NavbarItem className="hidden lg:flex lg:flex-col lg:justify-end">
          {searchInput}
          {suggestions.length > 0 && (
            <div className="mx-4 mt-2 flex flex-col gap-2">
              {suggestions.slice(0, 5).map((username, index) => (
                <div key={username + index}>
                  <Link
                    color={"foreground"}
                    onClick={() => handleSuggestionClick(username)}
                    size="lg"
                  >
                    {username}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="sm:hidden flex basis-1 pl-4" justify="start">
          <NextLink className="flex sm:hidden justify-start items-center gap-1" href="/">
            <span className="text-2xl text-green-300 font-black">{"<"}</span>
            <span className="text-2xl text-violet-500 font-black">{" / "}</span>
            <span className="text-2xl text-orange-300 font-black">{">"}</span>
            <span className="text-2xl">RUET CP PEOPLE</span>
          </NextLink>
      </NavbarContent>
      <NavbarContent className="sm:hidden flex basis-1 pl-4" justify="end">
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>
      <NavbarMenu >
        <NavbarItem className="flex flex-col">
          {searchInput}
          {suggestions.length > 0 && (
            <div className="mx-4 mt-2 flex flex-col gap-2">
              {suggestions.slice(0, 5).map((username, index) => (
                <div key={username + index}>
                  <Link
                    color={"foreground"}
                    onClick={() => handleSuggestionClick(username)}
                    size="lg"
                  >
                    {username}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </NavbarItem>
        <NavbarItem className="flex flex-col">
        <ul className="flex-col sm:hidden gap-4 justify-start ml-2">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <Button
                className={`text-xl my-2 py-6 w-full`}
                variant="flat"
                color="secondary"
                onPress={()=> {window.location.href = item.href}} // close navmenu on click
              >
                {item.label}
              </Button>
            </NavbarItem>
            
          ))}
          {(user && (user.type === "MANAGER" || user.type === "ADMIN")) ? (
            <NavbarItem key="/post">
              <Button
                className={`text-xl my-2 py-6 w-full`}
                variant="flat"
                color="secondary"
                onPress={()=> {window.location.href = "/post"}} // close navmenu on click
              >
                Post
              </Button>
            </NavbarItem>
          ) : (
            ""
          )}
        </ul>
        </NavbarItem>
        <NavbarItem className="flex justify-around my-8 gap-2">

          <Link
            isExternal
            aria-label="Discord"
            href={siteConfig.links.discord}
            className="w-1/2 bg-[#5865F245] flex justify-center items-center p-3 rounded"
          >
            <DiscordIcon size={32} className="text-default-500" />
          </Link>
          <Link
            isExternal
            aria-label="Discord"
            href={siteConfig.links.codeforces}
            className="w-1/2 bg-[#3e3e3e45] flex justify-center items-center p-3 rounded"
          >
            <CodeForcesIcon size={32} className="text-default-500" />
          </Link>
        </NavbarItem>
        <NavbarContent className="flex sm:hidden" justify="end">
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
      </NavbarMenu>
    </NextUINavbar>
  );
};
