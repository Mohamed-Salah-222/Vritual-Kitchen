"use client";

import Link from "next/link";
import Image from "next/image";
import { UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { isSignedIn, isLoaded } = useUser();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-[#f0eae3] shadow-md border-b border-[#ded8c5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-all hover:scale-105">
            <Image src="/kitchenLogo.png" alt="Kitchen Logo" width={40} height={40} className="object-contain" />
            <Image src="/Virtual.png" alt="Virtual Kitchen" width={120} height={40} className="object-contain" />
          </Link>

          {/* Navigation Links - Only show when signed in */}
          {isSignedIn && (
            <div className="hidden md:flex items-center gap-6">
              <Link href="/upload">
                <Button variant="ghost" className="hover:bg-[#ded8c5] cursor-pointer transition-all">
                  Upload
                </Button>
              </Link>
              <Link href="/kitchen">
                <Button variant="ghost" className="hover:bg-[#ded8c5] cursor-pointer transition-all">
                  My Kitchen
                </Button>
              </Link>
              <Link href="/recipes">
                <Button variant="ghost" className="hover:bg-[#ded8c5] cursor-pointer transition-all">
                  Recipes
                </Button>
              </Link>
            </div>
          )}

          {/* Right side - Sign In button or User Button */}
          <div className="flex items-center">
            {isLoaded &&
              (isSignedIn ? (
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: {
                        width: "40px",
                        height: "40px",
                      },
                    },
                  }}
                />
              ) : (
                <Link href="/sign-in">
                  <Button className="cursor-pointer bg-[#372f29] hover:bg-[#211b16] text-white">Sign In</Button>
                </Link>
              ))}
          </div>
        </div>
      </div>

      {/* Mobile Navigation - Only show when signed in */}
      {isSignedIn && (
        <div className="md:hidden border-t border-[#ded8c5] px-4 py-3 flex gap-3">
          <Link href="/upload" className="flex-1">
            <Button variant="ghost" className="w-full hover:bg-[#ded8c5] cursor-pointer transition-all">
              Upload
            </Button>
          </Link>
          <Link href="/kitchen" className="flex-1">
            <Button variant="ghost" className="w-full hover:bg-[#ded8c5] cursor-pointer transition-all">
              Kitchen
            </Button>
          </Link>
          <Link href="/recipes" className="flex-1">
            <Button variant="ghost" className="w-full hover:bg-[#ded8c5] cursor-pointer transition-all">
              Recipes
            </Button>
          </Link>
        </div>
      )}
    </nav>
  );
}
