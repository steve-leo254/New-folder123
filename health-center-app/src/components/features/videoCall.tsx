import React, { useEffect, useRef, useState } from 'react';
import { Video, VideoOff, Mic, MicOff, Phone, Monitor } from 'lucide-react';
import Button from '../ui/Button';

interface VideoCallProps {
  roomId: string;
  onEnd: () => void;
}

const VideoCall: React.FC<VideoCallProps> = ({ roomId, onEnd }) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  useEffect(() => {
    // Initialize WebRTC connection
    const initializeCall = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    };

    initializeCall();

    return () => {
      // Cleanup
    };
  }, []);

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    // Toggle video track
  };

  const toggleMic = () => {
    setIsMicOn(!isMicOn);
    // Toggle audio track
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    // Toggle screen sharing
  };

  return (
    <div className="relative w-full h-full bg-gray-900">
      {/* Remote Video */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
      
      {/* Local Video */}
      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        className="absolute top-4 right-4 w-48 h-36 object-cover rounded-lg shadow-lg"
      />
      
      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant="outline"
            size="lg"
            className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            onClick={toggleVideo}
          >
            {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            onClick={toggleMic}
          >
            {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            onClick={toggleScreenShare}
          >
            <Monitor className="w-5 h-5" />
          </Button>

          <Button
            size="lg"
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={onEnd}
          >
            <Phone className="w-5 h-5 transform rotate-135" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;