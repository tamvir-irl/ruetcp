"use client"

import React, { useState } from "react";
import { Form, Input, Button, Alert } from "@nextui-org/react";
import { useRouter } from "next/navigation"; // For client-side routing
import { siteConfig } from "@/config/site";

export default function Login() {
  const [handle, setHandle] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // State for handling errors
  const [success, setSuccess] = useState(""); // State for handling success messages
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${siteConfig.links.api}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ handle, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save sessionID in local storage
        localStorage.setItem("sessionID", data.sessionID);

        // Show success message and reload the page after 2 seconds
        setSuccess("Login successful! Redirecting...");
        setTimeout(() => {
          window.location.href = "/" // Refresh the page and it will redirect to the homepage
        }, 2000);
      } else {
        setError(data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      setError("An error occurred while trying to log in.");
    }
  };

  return (
    <div className="w-full flex justify-center items-center">
      <div className="bg-[#eeeeee45] p-8 border border-gray-300 rounded">
        <Form className="w-full max-w-xs flex flex-col gap-3 items-center" onSubmit={handleLogin}>
          <h1 className="text-2xl font-bold">Login</h1>

          {error && (
            <Alert color="danger" className="w-full mb-4" description={error} />
          )}

          {success && (
            <Alert color="success" className="w-full mb-4" description={success} />
          )}

          <Input
            label="Handle"
            labelPlacement="outside"
            name="handle"
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
            Login
          </Button>
        </Form>
      </div>
    </div>
  );
}
