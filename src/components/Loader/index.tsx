import { AnimatePresence, motion } from "framer-motion";

const loaderVariant = {
    
  initial: { opacity: 1, backgroundColor: "rgba(0, 0, 0, 1)" },
  animate: {
    opacity: 1,
    transition: { ease: "easeIn", duration: 0.2 },
  },
  exit: {
    opacity: 0,
    transition: { ease: "easeOut", duration: 1, delay: 1 },
  },
};

const PageLoader = ({ showLoader }: { showLoader: boolean }) => {
  return (
    <AnimatePresence>
      {showLoader && (
        <motion.div
          key="animation-on-state"
          className="flex justify-center items-center m-0 h-full w-screen bg-primary-default fixed z-50"
          variants={loaderVariant}
          initial="initial"
          animate={showLoader ? "animate" : "initial"}
          exit="exit"
        >
          <div
            className="inline-block border-white h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
            role="status"
          >
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Loading...
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PageLoader;
