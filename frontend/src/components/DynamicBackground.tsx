"use client";

import React, { useState, useEffect } from "react";

const businessImages = [
  "/images/business-bg.jpg",     // Modern Supermarket & Retail shelves
  "/images/bg-boutique.jpg",      // Fashion & Clothing Boutique store
  "/images/bg-restaurant.jpg",    // Commercial Restaurant & Dining Cafe
  "/images/bg-cosmetics.jpg",     // Modern Pharmacy & Beauty Store
  "/images/bg-warehouse.jpg",     // Logistics & Storage Warehouse
];

export const DynamicBackground: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Automatically transition to next business image every 7 seconds
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % businessImages.length);
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Background carousel with smooth crossfade */}
      {businessImages.map((src, idx) => (
        <div
          key={src}
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out ${
            idx === currentIndex ? "opacity-100 scale-100" : "opacity-0 scale-105"
          }`}
          style={{
            backgroundImage: `url('${src}')`,
            transitionProperty: "opacity, transform",
            transitionDuration: "1200ms",
          }}
        />
      ))}

      {/* Crisp clear overlay tint allowing high image visibility while maintaining perfect text readability */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "rgba(225, 255, 172, 0.45)",
          backdropFilter: "contrast(105%) brightness(102%)",
        }}
      />
    </div>
  );
};
