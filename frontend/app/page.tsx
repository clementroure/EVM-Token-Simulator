"use client"

import { Layers, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SettingsPage } from '@/components/pages/settings/settingsPage';
import { useTheme } from 'next-themes';
import { PasswordDialog } from '@/components/passwordDialog';
import { useEffect, useRef, useState } from 'react';
import ScrollButton from "@/components/scrollButton";
import { useStore } from "./store";

export default function IndexPage() {
  const { theme } = useTheme();
  const [selectedPage, setSelectedPage] = useState('settings');
  
  const isLogged = useStore(state => state.isLogged);
  const setIsLogged = useStore(state => state.setIsLogged);
  const isPWA = useStore(state => state.isPWA);

  useEffect(() => {
   setIsLogged(false)
  },[])
  // check mouse activity
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  // Set up a new timeout whenever a mouse or keyboard event occurs
  const resetTimeout = () => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }

    timeoutIdRef.current = setTimeout(() => {
      // Timeout completed, log the user out
      setIsLogged(false);
    }, 5 * 60 * 1000); // 5 minutes
  };

   // Add event listeners to mouse and keyboard events
   let firstLoading = true;
   useEffect(() => {
    if(firstLoading)
    firstLoading = false;

    window.addEventListener('mousemove', resetTimeout);
    window.addEventListener('keydown', resetTimeout);

    // Run the function once initially
    resetTimeout();

    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }

      window.removeEventListener('mousemove', resetTimeout);
      window.removeEventListener('keydown', resetTimeout);
    };
  }, []);

  const buttonStyles = (buttonName:string) => (selectedPage) === buttonName 
    ? "secondary" 
    : "outline";

  return (
    <>
    {typeof window !== 'undefined' ?
    <>
    <section className={`md:container px-1 md:px-0 grid items-center gap-6 pt-6 md:pt-8 md:pb-4 w-full ${isPWA ? "mt-8" : ""}`}>
      <div className="flex flex-row items-start gap-2 w-full">
        {/* Left section */}
        {/* <div className="flex-col items-start gap-2 hidden md:flex">
          <Button 
            variant={buttonStyles('settings')} 
            onClick={() => setSelectedPage('settings')} 
            className="w-36 shadow-sm"
            disabled={selectedPage == 'settings' ? true : false}
          >
          <Settings color={theme == 'dark' ? (selectedPage == 'settings' ? 'gray' : 'white') : (selectedPage == 'settings' ? 'gray' : 'black')} className="h-5 w-5 text-muted-foreground mr-2" />
            Settings
          </Button>
          <Button 
            variant={buttonStyles('results')} 
            onClick={() => setSelectedPage('results')} 
            className="w-36 shadow-sm"
            disabled={selectedPage == 'results' ? true : false}
          >
          <Layers color={theme == 'dark' ? (selectedPage == 'results' ? 'gray' : 'white') : (selectedPage == 'results' ? 'gray' : 'black')} className="h-5 w-5 text-muted-foreground mr-2" />
            Results
          </Button>
        </div> */}
        {/* Pages */}
        <div className="w-full md:mr-10">
          <SettingsPage />
        </div>
      </div>
    </section>
    <ScrollButton />
    <PasswordDialog open={!isLogged} onLogin={setIsLogged}/>
    </>
    :
    <></>
    }
    </>
  );
}