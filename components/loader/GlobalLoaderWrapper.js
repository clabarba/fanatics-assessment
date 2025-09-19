// components/GlobalLoaderWrapper.js
'use client';

import { useState, useEffect } from 'react';
import Loader from './Loader'; // adjust if your loader path differs

export default function GlobalLoaderWrapper({ children }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000); // 3 seconds
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Loader />;

  return <>{children}</>;
}
