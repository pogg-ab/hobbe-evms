import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/stores/auth";
import { Button } from "@/components/ui/button";

export default function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xl font-bold">
            LiveStream
          </Link>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {user?.isStreamer && (
                  <Link to="/create-stream">
                    <Button variant="outline">Start Streaming</Button>
                  </Link>
                )}
                <Button variant="ghost" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Login</Button>
                </Link>

              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
