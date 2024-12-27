"use client";
import React, { useState, useEffect } from "react";
import { Form, Button, Alert, Code } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/config/site";

export default function Register() {
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [handle, setHandle] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const fetchVerificationCode = async () => {
      const params = new URLSearchParams(window.location.search);
      const userHandle = params.get("handle");
      if (!userHandle) {
        setError("Handle is missing from the URL.");
        return;
      }
      setHandle(userHandle);

      try {
        const response = await fetch(`${siteConfig.links.api}/verify?handle=${userHandle}`);
        const data = await response.json();
        if (response.ok) {
          setVerificationCode(data.verificationCode);
        } else {
          setError(data.message || "Failed to fetch verification code.");
        }
      } catch (err) {
        setError("An error occurred while fetching the verification code.");
      }
    };

    fetchVerificationCode();
  }, []);

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      // Send verification request to the server
      const response = await fetch(`${siteConfig.links.api}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ handle }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess("Verification successful! Redirecting to login page...");
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      } else {
        setError(data.message || "Verification failed.");
      }
    } catch (err) {
      setError("An error occurred during verification.");
    }
  };

  return (
    <div className="w-full flex justify-center items-center">
      <div className="bg-[#eeeeee45] p-8 border border-gray-300 rounded">
        <Form className="w-full max-w-xs flex flex-col gap-3 items-center" onSubmit={handleVerification}>
          <h1 className="text-2xl font-bold">Verify Your Account</h1>

          {error && (
            <Alert color="danger" className="w-full mb-4" description={error} />
          )}

          {success && (
            <Alert color="success" className="w-full mb-4" description={success} />
          )}

          {verificationCode ? (
            <Code size="lg" color="secondary">{verificationCode}</Code>
          ) : (
            <span>Loading verification code...</span>
          )}

          <span className="text-gray-400 text-sm text-center">
            Copy this code and paste it in your organization field on Codeforces
          </span>

          <Button type="submit" color="success" variant="flat" disabled={!verificationCode}>
            Verify
          </Button>
        </Form>
      </div>
    </div>
  );
}
