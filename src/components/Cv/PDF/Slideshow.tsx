/* eslint-disable @next/next/no-img-element */
"use client";

import { FC, useState } from "react";

interface SlideshowProps {
  images: string[];
}

export const Slideshow: FC<SlideshowProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1,
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1,
    );
  };

  return (
    <div className="relative h-48 w-full">
      <img
        src={images[currentIndex]}
        alt={`Slide ${currentIndex}`}
        className="h-full w-full rounded-lg object-cover"
      />
      <button
        onClick={handlePrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 transform rounded-full bg-gray-800 bg-opacity-50 p-2 text-white"
      >
        ‹
      </button>
      <button
        onClick={handleNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 transform rounded-full bg-gray-800 bg-opacity-50 p-2 text-white"
      >
        ›
      </button>
    </div>
  );
};
