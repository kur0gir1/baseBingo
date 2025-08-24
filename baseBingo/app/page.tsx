"use client";

import Bingo from "./src/components/bingoCard/bingoCard";

export default function App() {
  return (
    <div className="flex flex-col min-h-screen w-full font-sans dark:bg-background dark:text-white bg-white text-black">
      <header className="pt-4 pr-4 w-full">
        <div className="flex justify-end w-full">
          <div className="w-full">
            <Bingo />
          </div>
        </div>
      </header>
    </div>
  );
}
