"use client"
import React, { useState, useEffect } from "react";
import { Form, Input, Button, Alert } from "@nextui-org/react";
import { useRouter } from "next/navigation"; // use the correct import for client-side routing
import { siteConfig } from "@/config/site";

export default function Register() {
  const [handle, setHandle] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // State for handling errors
  const [success, setSuccess] = useState(""); // State for handling success messages
  const [isMounted, setIsMounted] = useState(false); // State to track if component is mounted
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true); // Set to true after the component has mounted on the client
  }, []);

  // Function to handle form submission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
  
    try {
      const response = await fetch(`${siteConfig.links.api}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ handle, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        if (data.redirect) {
          // User is already registered but not verified
          setSuccess("Redirecting to verification page...");
          setTimeout(() => {
            router.push(`/auth/verify?handle=${data.handle}`);
          }, 2000);
        } else {
          // New registration, proceed to verification
          setSuccess("Registration successful! Redirecting to verification...");
          setTimeout(() => {
            router.push(`/auth/verify?handle=${handle}`);
          }, 2000);
        }
      } else {
        setError(data.message || "Something went wrong during registration.");
      }
    } catch (error) {
      setError("An error occurred while trying to register.");
    }
  };
  

  if (!isMounted) return null; // Render nothing until the component is mounted on the client

  return (
    <div className="w-full flex justify-center items-center">
      <div className="bg-[#eeeeee45] p-8 border border-gray-300 rounded">
        <Form className="w-full max-w-xs flex flex-col gap-3 items-center" onSubmit={handleRegister}>
          <h1 className="text-2xl font-bold">Register Your Account</h1>
          
          {error && (
            <Alert color="danger" className="w-full mb-4" description={error} />
          )}
          
          {success && (
            <Alert color="success" className="w-full mb-4" description={success} />
          )}
          
          <Input
            label="Handle"
            labelPlacement="outside"
            name="username"
            placeholder="Enter your Codeforces handle"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
          />
          <Input
            label="Password"
            labelPlacement="outside"
            type="password"
            name="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" color="success" variant="flat">
            Register
          </Button>
        </Form>
      </div>
    </div>
  );
}
