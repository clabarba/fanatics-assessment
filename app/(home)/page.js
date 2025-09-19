'use client';

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import Loader from '@/components/loader/Loader';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const linesRef = useRef([]); // will hold refs to each animated line

  // Step 1: Set loader to run for 3s
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Step 2: Reset refs each time loading finishes
  useEffect(() => {
    if (!loading) {
      linesRef.current = [];
    }
  }, [loading]);

  // Step 3: Safely trigger animation when content is mounted and loading is false
  useLayoutEffect(() => {
    if (loading) return;

    const observers = [];

    linesRef.current.forEach((el, idx) => {
      if (!el) return;

      el.classList.remove('opacity-100', 'translate-x-0');
      el.classList.add('opacity-0', '-translate-x-24');

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              el.classList.remove('opacity-0', '-translate-x-24');
              el.classList.add('opacity-100', 'translate-x-0');
            }, idx * 500);
            observer.unobserve(el);
          }
        },
        { threshold: 0.1 }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [loading]);

  // Step 4: Helper to populate refs
  const addToRefs = (el) => {
    if (el && !linesRef.current.includes(el)) {
      linesRef.current.push(el);
    }
  };

  // Loader view
  if (loading) return <Loader />;

  // Main content
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 bg-white">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1
          ref={addToRefs}
          className={clsx(
            'text-4xl sm:text-5xl font-bold text-center sm:text-left',
            'transition-all duration-[1000ms] ease-out'
          )}
        >
          Welcome to Chris La Barba&apos;s Fanatics Assessment!
        </h1>

        <p
          ref={addToRefs}
          className={clsx(
            'text-lg text-center sm:text-left max-w-3xl',
            'transition-all duration-[1000ms] ease-out'
          )}
        >
          This project showcases my skills in full stack development, featuring
          user authentication, profile management, and a personalized dashboard.
          Built with Next.js, Tailwind CSS, ShadCn, and Clerk for seamless user
          experiences.  Hosted on Vercel to ensure optimal performance and scalability.
        </p>

        <p
          ref={addToRefs}
          className="transition-all duration-[1000ms] ease-out"
        >
          Click <strong>Sign Up</strong> or <strong>Login</strong> to begin.
        </p>

        <div
          ref={addToRefs}
          className="flex flex-col sm:flex-row gap-4 transition-all duration-[1000ms] ease-out"
        >
          Enjoy the auction!
          {/* <a href="/sign-up">
            <button className="bg-[#A9E9FC] text-gray-800 rounded-full px-6 py-3 text-lg font-semibold shadow-md hover:animate-pulse cursor-pointer">
              Get Started
            </button>
          </a>
          <a href="/sign-in">
            <button className="border border-white text-black hover:bg-white hover:text-primary rounded-full px-6 py-3 text-lg font-semibold hover:animate-pulse cursor-pointer">
              Login
            </button>
          </a> */}
        </div>
      </main>

      <footer
        ref={addToRefs}
        className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center transition-all duration-[1000ms] ease-out"
      >
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://quantumprecision.tech/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Who am I? →
        </a>
      </footer>
    </div>
  );
}
