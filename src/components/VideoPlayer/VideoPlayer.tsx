import CloseIcon from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import React from "react";

interface VideoPlayerProps {
	isOpen: boolean;
	onClose: () => void;
	videoUrl: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ isOpen, onClose, videoUrl }) => {
	return (
		<Dialog open={isOpen} onClose={onClose} maxWidth="lg" fullWidth>
			<IconButton
				aria-label="close"
				onClick={onClose}
				sx={{
					position: "absolute",
					right: 8,
					top: 8,
					color: "white",
					zIndex: 1,
				}}>
				<CloseIcon />
			</IconButton>
			<DialogContent sx={{ p: 0, bgcolor: "black" }}>
				<video className="w-full aspect-video" controls autoPlay src={videoUrl} />
			</DialogContent>
		</Dialog>
	);
};
