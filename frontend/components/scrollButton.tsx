import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';

function ScrollButton() {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled upto given distance
  const toggleVisibility = () => {
    if (window.pageYOffset > 0) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Set the top cordinate to 0
  // make scrolling smooth
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
  }, []);

  return (
        <div className={`fixed right-2 bottom-4 transition-all duration-500 ease-in-out ${isVisible ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
            <Button
            variant="outline"
            onClick={scrollToTop}
            aria-label="Go to top"
            className="p-2 rounded-fulltransition duration-200 ease-in-out transform hover:-translate-y-1 hover:scale-110"
            >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 mx-auto">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
            </svg>
            </Button>
        </div>
  );
}

export default ScrollButton;