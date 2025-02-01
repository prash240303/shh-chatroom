import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {  isAuthTokenValid } from "@/lib/authUtils";
const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  

  useEffect(() => {
    const token = getCookie("token");
    if (token) {
      if (isAuthTokenValid(token)) {
        console.log("")
        const params = new URLSearchParams(window.location.search);
        const room_id = params.get("room_id");
        if (room_id) {
          axios
            .post(`${BASE_URL}room/join/`, { room_id: room_id }, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .catch(() => {
              toast.error("Failed to join the room.");
            });
        }
      } 
      else {
        console.log("hi")
      }
    }
    else{
      navigate("/login")
    }
  }, [location]);


  function getCookie(name: string) {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? match[2] : null;
  }


  async function handleFormSubmission(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      const response = await fetch(`${BASE_URL}login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data?.detail || "Invalid email or password. Please try again.");
      } else {
        // store the email  for chat purposes 
        localStorage.setItem('userEmailKey', formData.email);
        
        const token = data.token;
        document.cookie = `token=${token}; path=/`;
        console.log("token ", token)
        toast.success("Login successful!");
        
        const roomId = searchParams.get("room_id");
        console.log("checking if room id is present",roomId)
        if (roomId) {
          try {
            await fetch(`${BASE_URL}room/join/`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ room_id: roomId }),
            });
            toast.success("Joined the room successfully!");
          } catch (error) {
            console.error("Error joining room:", error);
            toast.error("Failed to join the room.");
          }
        }
        navigate("/");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again later.");
      console.error("Error:", error);
    }
  }


  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex min-h-screen">
        <div className="hidden lg:flex lg:w-1/2 p-12 justify-center flex-col bg-neutral-900 items-center">
          <span className="w-[64px] h-[64px] bg-neutral-600 rounded-[15px] border border-fill flex items-center justify-center mx-auto text-foreground mb-4">
            <svg
              height="34"
              viewBox="0 0 90 73"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
            </svg>
          </span>
          <div className="space-y-4 pt-4 max-w-72 text-center">
            <blockquote className="text-3xl font-bold leading-normal">
              Welcome back to your private chat
            </blockquote>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
          <a
            href="/register"
            className="text-sm absolute right-10 top-10 text-gray-400 hover:text-white transition-colors"
          >
            Register
          </a>

          <div className="w-full max-w-sm space-y-8">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
              <p className="text-sm text-gray-400">
                Enter your email and password to access your account
              </p>
            </div>

            <form
              onSubmit={handleFormSubmission}
              className="space-y-6 p-4 bg-neutral-800 rounded-lg shadow-md"
            >
              <div className="space-y-4">
                <div className="flex flex-col">
                  <label htmlFor="email" className="text-sm text-gray-400 mb-1">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="bg-neutral-900 border border-gray-800 text-white placeholder:text-gray-500 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-700"
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="password" className="text-sm text-gray-400 mb-1">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="bg-neutral-900 border border-gray-800 text-white placeholder:text-gray-500 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-700"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-white text-black font-medium py-2 rounded-md hover:bg-gray-200"
              >
                Login
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
