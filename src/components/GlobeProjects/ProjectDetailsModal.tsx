import { AnimatePresence, motion } from 'framer-motion';
import Image from "next/image";
import {  ProjectDetailsModalProps } from "@/types/map";

const ProjectDetailsModal = ({ isOpen, onClose, project }: ProjectDetailsModalProps) => {
    if (!project) return null;
  
    return (
      <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            className="fixed inset-0 bg-black/50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
  
          {/* Modal Content */}
          <motion.div 
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div 
              className="relative w-full max-w-2xl bg-white rounded-t-2xl sm:rounded-2xl overflow-hidden"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300
              }}
            >
          {/* Header Image */}
          {project.image && (
            <div className="relative h-64 w-full">
              <Image 
                src={project.image} 
                alt={project.name}
                width={500} 
                height={300} 
                priority
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent" />
            </div>
          )}
  
          {/* Close Button */}
          <motion.button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/30 transition-colors"
            initial={{ opacity: 0, rotate: -180 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 180 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 text-white" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
  
           {/* Content */}
           <motion.div 
              className="p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div 
                className="flex justify-between items-center group cursor-pointer"
                whileHover="hover"
              >
                <div>
                  <motion.h2 
                    className="text-2xl font-bold"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {project.name}
                  </motion.h2>
  
                  {project.description && (
                    <motion.p 
                      className="text-gray-600"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      {project.description}
                    </motion.p>
                  )}
                </div>
  
                {/* Animated Arrow */}
                <motion.div
                  className="text-gray-400"
                  onClick={() =>{
                    window.open(project.url, "_blank");
                  }}
                  variants={{
                    hover: {
                      x: 10,
                      transition: {
                        duration: 0.3,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatType: "reverse"
                      }
                    }
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
          </>
        )}
      </AnimatePresence>
    );
};
  
export default ProjectDetailsModal;