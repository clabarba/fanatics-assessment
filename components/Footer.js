'use client';

import Image from 'next/image';

export default function Footer() {
  return (
    <footer
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
  );
}
