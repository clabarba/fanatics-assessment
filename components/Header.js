// components/Header
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useAuth, UserButton } from "@clerk/nextjs";


export default function Header() {
  const { isSignedIn } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur py-3 bg-gray-800/10 shadow-2xl">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" aria-label="Go to homepage" className='cursor-pointer animate-pulse'>
          <Image
            src="/assets/fanatics-logo.svg"
            alt="Fanatics"
            width={80}
            height={100}
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8 items-center">
          <Link href="/" className="text-black transition-colors text-lg font-medium text-shadow-DEFAULT hover:animate-pulse">Home</Link>
          <Link href={isSignedIn ? "/auction" : "/sign-up"}>
            <Button variant="lb-default" className="text-gray-800 hover:bg-[#A9E9FC] rounded-full px-6 py-2 text-base font-semibold shadow-md hover:animate-pulse cursor-pointer"> {/* */}
              {isSignedIn ? "Auction" : "Sign Up"}
            </Button>
          </Link>


          {/* Login Button - Border only, transparent background */}
          {!isSignedIn && (
            <Link href="/auction">
              <Button variant="outline" className="border-white text-black hover:bg-white hover:text-primary rounded-full px-6 py-2 text-base font-semibold hover:animate-pulse cursor-pointer"> {/* */}
                Login
              </Button>
            </Link>
          )}
          {isSignedIn && (
            <UserButton  />
          )}
        </nav>

        {/* Mobile Menu Button (Hamburger) */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-black hover:bg-gray-700/50"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </Button>
      </div>

      {/* Mobile Navigation - Styled to overlay and look clean */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-800/20 backdrop-blur-sm shadow-lg pb-6 pt-4">
          <nav className="flex flex-col items-center space-y-4">
            <Link href="/" className="text-white hover:text-gray-200 transition-colors text-lg font-medium" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link href={isSignedIn ? "/auction" : "/sign-up"}>
              <Button className="bg-gray-300 text-gray-800 hover:bg-[#A9E9FC] rounded-full px-8 py-3 text-base font-semibold w-4/5 mt-4" onClick={() => setIsMenuOpen(false)}>
                {isSignedIn ? "Auction" : "Sign Up"}
              </Button>
            </Link>
            {!isSignedIn && (
              <Link href="/sign-in">
                <Button variant="outline" className="border-white text-black hover:bg-white hover:text-primary rounded-full px-8 py-3 text-base font-semibold w-4/5" onClick={() => setIsMenuOpen(false)}>
                  Login
                </Button>
              </Link>
            )}
            {isSignedIn && (
              <UserButton afterSignOutUrl="/" />
            )}
          </nav>
        </div>
      )}
    </header>
  );
}