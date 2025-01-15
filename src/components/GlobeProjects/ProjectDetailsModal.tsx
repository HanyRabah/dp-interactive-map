import { AnimatePresence, motion } from 'framer-motion';
import Image from "next/image";
import { ProjectDetailsModalProps } from "@/types/map";
import { Play, Image as ImageIcon } from 'lucide-react'; // Import icons from lucide-react

const ProjectDetailsModal = ({ isOpen, onClose, project }: ProjectDetailsModalProps) => {
  if (!project?.polygon.popupDetails) return null;

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
              {project.polygon.popupDetails.image.length > 0 && (
                <div className="relative h-64 w-full">
                  <Image
                    src={project.polygon.popupDetails.image}
                    alt={project.polygon.popupDetails.title}
                    unoptimized
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
                      {project.polygon.popupDetails.title}
                    </motion.h2>

                    {project.polygon.popupDetails.description && (
                      <motion.p
                        className="text-gray-600"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        {project.polygon.popupDetails.description}
                      </motion.p>
                    )}
                  </div>

                  {/* Animated Arrow */}
                  {project.polygon.popupDetails.link && 
                    <motion.div
                      className="text-gray-400"
                      onClick={() => {
                        window.open(project.polygon.popupDetails.link, "_blank");
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
                  }
                </motion.div>
              </motion.div>

              {/* Icons Section */}
              <div className="flex justify-around items-center p-4 border-t border-gray-200">
                { project.polygon.popupDetails.videoLink && 
                <button
                  className="flex flex-col items-center text-gray-600 hover:text-black transition-colors"
                  onClick={() => {
                    window.open(project.polygon.popupDetails.ariealLink, "_blank");
                  }}
                >
                  <svg fill="#000000" height="24px" width="24px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 480 480">
                    <g>
                      <g>
                        <g>
                          <path d="M391.502,210.725c-5.311-1.52-10.846,1.555-12.364,6.865c-1.519,5.31,1.555,10.846,6.864,12.364
                            C431.646,243.008,460,261.942,460,279.367c0,12.752-15.51,26.749-42.552,38.402c-29.752,12.82-71.958,22.2-118.891,26.425
                            l-40.963-0.555c-0.047,0-0.093-0.001-0.139-0.001c-5.46,0-9.922,4.389-9.996,9.865c-0.075,5.522,4.342,10.06,9.863,10.134
                            l41.479,0.562c0.046,0,0.091,0.001,0.136,0.001c0.297,0,0.593-0.013,0.888-0.039c49.196-4.386,93.779-14.339,125.538-28.024
                            C470.521,316.676,480,294.524,480,279.367C480,251.424,448.57,227.046,391.502,210.725z"/>
                          <path d="M96.879,199.333c-5.522,0-10,4.477-10,10c0,5.523,4.478,10,10,10H138v41.333H96.879c-5.522,0-10,4.477-10,10
                            s4.478,10,10,10H148c5.523,0,10-4.477,10-10V148c0-5.523-4.477-10-10-10H96.879c-5.522,0-10,4.477-10,10s4.478,10,10,10H138
                            v41.333H96.879z"/>
                          <path d="M188.879,280.667h61.334c5.522,0,10-4.477,10-10v-61.333c0-5.523-4.477-10-10-10h-51.334V158H240c5.523,0,10-4.477,10-10
                            s-4.477-10-10-10h-51.121c-5.523,0-10,4.477-10,10v122.667C178.879,276.19,183.356,280.667,188.879,280.667z M198.879,219.333
                            h41.334v41.333h-41.334V219.333z"/>
                          <path d="M291.121,280.667h61.334c5.522,0,10-4.477,10-10V148c0-5.523-4.478-10-10-10h-61.334c-5.522,0-10,4.477-10,10v122.667
                            C281.121,276.19,285.599,280.667,291.121,280.667z M301.121,158h41.334v102.667h-41.334V158z"/>
                          <path d="M182.857,305.537c-3.567-4.216-9.877-4.743-14.093-1.176c-4.217,3.567-4.743,9.876-1.177,14.093l22.366,26.44
                            c-47.196-3.599-89.941-12.249-121.37-24.65C37.708,308.06,20,293.162,20,279.367c0-16.018,23.736-33.28,63.493-46.176
                            c5.254-1.704,8.131-7.344,6.427-12.598c-1.703-5.253-7.345-8.13-12.597-6.427c-23.129,7.502-41.47,16.427-54.515,26.526
                            C7.674,252.412,0,265.423,0,279.367c0,23.104,21.178,43.671,61.242,59.48c32.564,12.849,76.227,21.869,124.226,25.758
                            l-19.944,22.104c-3.7,4.1-3.376,10.424,0.725,14.123c1.912,1.726,4.308,2.576,6.696,2.576c2.731,0,5.453-1.113,7.427-3.301
                            l36.387-40.325c1.658-1.837,2.576-4.224,2.576-6.699v-0.764c0-2.365-0.838-4.653-2.365-6.458L182.857,305.537z"/>
                          <path d="M381.414,137.486h40.879c5.522,0,10-4.477,10-10V86.592c0-5.523-4.478-10-10-10h-40.879c-5.522,0-10,4.477-10,10v40.894
                            C371.414,133.009,375.892,137.486,381.414,137.486z M391.414,96.592h20.879v20.894h-20.879V96.592z"/>
                        </g>
                      </g>
                    </g>
                  </svg>
                  <span className="text-xs mt-1">360 View</span>
                </button>
                }
                {project.polygon.popupDetails.videoLink && 
                  <button
                    className="flex flex-col items-center text-gray-600 hover:text-black transition-colors"
                    onClick={() => {
                      window.open(project.polygon.popupDetails.videoLink, "_blank");
                    }}
                  >
                    <Play size={24} />
                    <span className="text-xs mt-1">Watch Video</span>
                  </button>
                }
                {project.polygon.popupDetails.imagesLink &&
                  <button
                    className="flex flex-col items-center text-gray-600 hover:text-black transition-colors"
                    onClick={() => {
                      window.open(project.polygon.popupDetails.imagesLink, "_blank");
                    }}
                  >
                    <ImageIcon size={24} />
                    <span className="text-xs mt-1">Go to Images</span>
                  </button>
                }
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProjectDetailsModal;