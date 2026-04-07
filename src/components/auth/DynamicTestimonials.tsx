"use client";

import React, { useState, useEffect } from 'react';

const testimonials = [
  {
    quote: "In God we trust; all others must bring data",
    author: "W. Edwards Deming",
    title: ""
  },
  {
    quote: "Outstanding leaders go out of their way to boost the self-esteem of their personnel",
    author: "Sam Walton",
    title: "Founder, Walmart"
  }
];

export const DynamicTestimonials = () => {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % testimonials.length);
        setFade(true);
      }, 500); // Transition time
    }, 5000); // Interval between quotes

    return () => clearInterval(interval);
  }, []);

  const current = testimonials[index];

  return (
    <div className={`transition-opacity duration-1000 ${fade ? 'opacity-100' : 'opacity-0'} min-h-[180px]`}>
      <blockquote className="text-lg md:text-xl mb-8 opacity-90 leading-relaxed text-white italic">
        &ldquo;{current.quote}&rdquo;
      </blockquote>

      <div className="flex items-center space-x-4">
        <div className="text-left">
          <div className="font-semibold text-white">{current.author}</div>
          {current.title && <div className="text-white/70 text-sm">{current.title}</div>}
        </div>
      </div>
    </div>
  );
};
