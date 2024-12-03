const Button = ({
  children,
  prefixIcon,
  onClick,
}: {
  children?: any;
  prefixIcon?: any;
  onClick: () => void;
}) => {
  return (
    <div
      className=" min-w-[80px] relative inline-flex items-center justify-center p-4 overflow-hidden font-mono font-medium tracking-tighter text-white bg-primary-default cursor-pointer group"
      onClick={onClick}
    >
      <span className="absolute w-full h-full scale-0 transition-all duration-300 ease-out bg-white group-hover:scale-100"></span>
      <span className="relative transition-all w-auto flex justify-center items-center  group-hover:text-primary-default overflow-hidden">
        {prefixIcon && prefixIcon}
        {children && (
          <span className="w-0 duration-300 transition-all translate-x-full group-hover:translate-x-0 group-hover:w-auto group-hover:ml-5 ">
            {children}
          </span>
        )}
      </span>
    </div>
  );
};
export default Button;
