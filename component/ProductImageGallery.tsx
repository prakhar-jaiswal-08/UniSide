"use client";

import Image from "next/image";
import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Package,
} from "lucide-react";

type ProductImageGalleryProps = {
  images: string[];
  productName: string;
};

export default function ProductImageGallery({
  images,
  productName,
}: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex h-[360px] w-full items-center justify-center bg-gray-100 text-gray-400 sm:h-[450px] md:h-full md:min-h-[560px]">
        <div className="text-center">
          <Package
            size={42}
            className="mx-auto text-gray-300"
          />

          <p className="mt-3 text-sm font-medium">
            No image available
          </p>
        </div>
      </div>
    );
  }

  const previousImage = () => {
    setActiveIndex((current) =>
      current === 0 ? images.length - 1 : current - 1
    );
  };

  const nextImage = () => {
    setActiveIndex((current) =>
      current === images.length - 1 ? 0 : current + 1
    );
  };

  return (
    <div className="bg-gray-50">

      {/* Main Image */}
      <div className="relative h-[360px] w-full sm:h-[450px] md:h-[500px]">
        <Image
          src={images[activeIndex]}
          alt={`${productName} photo ${activeIndex + 1}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain bg-white"
        />

        {images.length > 1 && (
          <>
            {/* Previous */}
            <button
              type="button"
              onClick={previousImage}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-gray-900 shadow-md transition hover:bg-white"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Next */}
            <button
              type="button"
              onClick={nextImage}
              aria-label="Next image"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-gray-900 shadow-md transition hover:bg-white"
            >
              <ChevronRight size={20} />
            </button>

            {/* Counter */}
            <div className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white">
              {activeIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="border-t border-gray-200 bg-white px-3 py-3">
          <div className="flex gap-3 overflow-x-auto pb-1">
            {images.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`View photo ${index + 1}`}
                className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                  activeIndex === index
                    ? "border-gray-900"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <Image
                  src={image}
                  alt={`${productName} thumbnail ${index + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}