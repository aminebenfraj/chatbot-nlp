// src/components/Typewriter.js
import React, { useState, useEffect } from "react";

const Typewriter = ({ text, speed = 30 }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let currentIndex = 0;
    const timer = setInterval(() => {
      setDisplayedText((prev) => prev + text[currentIndex]);
      currentIndex += 1;

      if (currentIndex === text.length) {
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return <span>{displayedText}</span>;
};

export default Typewriter;
