"use client";

import Link from "next/link";
import Image from "next/image";

const Header = () => {
  return (
    <div className=" top-0 inset-x-0 z-30 group  bg-gradient-to-b from-black to-transparent">
      <header className="relative h-40 px-8 mx-auto duration-200 bg-transparent">
        <nav className="txt-xsmall-plus text-ui-fg-subtle flex items-center justify-between w-full h-full text-small-regular">
          <div className="flex items-center h-full">
            <Link
              href="https://dpproductions.net/"
              target="blank"
              className="txt-compact-xlarge-plus hover:text-ui-fg-base "
            >
                <div className="absolute top-6 left-8 z-10 shadow-md">
                  <Image 
                    src="/dp-logo.png" 
                    alt="logo" 
                    width={60} 
                    height={60} 
                    priority
                  />
              </div>
            </Link>
          </div>
        </nav>
      </header>
    </div>
  );
};

export default Header;
