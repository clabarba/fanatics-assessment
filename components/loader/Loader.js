'use client';
import { useEffect, useState } from 'react';
import './loader.css'; // Import styles separately for custom animation

export default function Loader() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 3000; // 3 seconds
    const steps = 100;
    const intervalTime = duration / steps;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center bg-gray-500 ">
      <div className="dank-ass-loader">
        {/* Row 1 */}
        <div className="row">
          <div className="arrow up outer outer-18"></div>
          <div className="arrow down outer outer-17"></div>
          <div className="arrow up outer outer-16"></div>
          <div className="arrow down outer outer-15"></div>
          <div className="arrow up outer outer-14"></div>
        </div>
        {/* Row 2 */}
        <div className="row">
          <div className="arrow up outer outer-1"></div>
          <div className="arrow down outer outer-2"></div>
          <div className="arrow up inner inner-6"></div>
          <div className="arrow down inner inner-5"></div>
          <div className="arrow up inner inner-4"></div>
          <div className="arrow down outer outer-13"></div>
          <div className="arrow up outer outer-12"></div>
        </div>
        {/* Row 3 */}
        <div className="row">
          <div className="arrow down outer outer-3"></div>
          <div className="arrow up outer outer-4"></div>
          <div className="arrow down inner inner-1"></div>
          <div className="arrow up inner inner-2"></div>
          <div className="arrow down inner inner-3"></div>
          <div className="arrow up outer outer-11"></div>
          <div className="arrow down outer outer-10"></div>
        </div>
        {/* Row 4 */}
        <div className="row">
          <div className="arrow down outer outer-5"></div>
          <div className="arrow up outer outer-6"></div>
          <div className="arrow down outer outer-7"></div>
          <div className="arrow up outer outer-8"></div>
          <div className="arrow down outer outer-9"></div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-64 h-3 rounded-full bg-gray-100 overflow-hidden mt-6">
        <div
          className="h-full bg-slate-900 transition-all duration-[30ms]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
