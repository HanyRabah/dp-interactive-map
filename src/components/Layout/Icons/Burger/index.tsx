import React from "react";

const BurgerIcon = ({
  isOpened,
  setMenuOpened,
}: {
  isOpened: boolean;
  setMenuOpened: (value: boolean) => void;
}) => {
  const handleClick = () => {
    setMenuOpened(!isOpened);
  };

  return (
    <div
      onClick={handleClick}
      className={`group/item flex flex-col h-5 justify-center items-center transition ease-in-out cursor-pointer`}
    >
      <span
        className={`bg-white block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm  ${
          isOpened
            ? "rotate-45 translate-y-1"
            : "-translate-y-0.5 group-hover/item:rotate-45 group-hover/item:w-4 group-hover/item:translate-x-1.5"
        }`}
      ></span>
      <span
        className={`bg-white block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${
          isOpened ? "opacity-0" : "opacity-100"
        }`}
      ></span>
      <span
        className={`bg-white block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm   ${
          isOpened
            ? "-rotate-45 -translate-y-1"
            : "translate-y-0.5 group-hover/item:-rotate-45 group-hover/item:w-4 group-hover/item:translate-x-1.5 "
        }`}
      ></span>
    </div>
  );
};
export default BurgerIcon;
