"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface TypewriterEffectProps {
  phrases: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  delayBetweenPhrases?: number;
}

const TypewriterEffect: React.FC<TypewriterEffectProps> = ({
  phrases,
  typingSpeed = 150,
  deletingSpeed = 100,
  delayBetweenPhrases = 1500,
}) => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") {
      // Stop the typewriter effect if not on the home page
      setCurrentText(phrases[0]); // Optionally set to the first phrase
      return;
    }

    const handleTyping = () => {
      const currentFullPhrase = phrases[currentPhraseIndex];
      if (isDeleting) {
        setCurrentText((prev) => currentFullPhrase.substring(0, prev.length - 1));
      } else {
        setCurrentText((prev) => currentFullPhrase.substring(0, prev.length + 1));
      }
    };

    let timeout: NodeJS.Timeout;
    const currentFullPhrase = phrases[currentPhraseIndex];

    if (!isDeleting && currentText.length === currentFullPhrase.length) {
      timeout = setTimeout(() => setIsDeleting(true), delayBetweenPhrases);
    } else if (isDeleting && currentText.length === 0) {
      setIsDeleting(false);
      setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
    } else {
      timeout = setTimeout(
        handleTyping,
        isDeleting ? deletingSpeed : typingSpeed
      );
    }

    return () => clearTimeout(timeout);
  }, [
    currentText,
    isDeleting,
    currentPhraseIndex,
    phrases,
    typingSpeed,
    deletingSpeed,
    delayBetweenPhrases,
    pathname,
  ]);

  return <span className="typewriter-text">{currentText}</span>;
};

export default TypewriterEffect;
