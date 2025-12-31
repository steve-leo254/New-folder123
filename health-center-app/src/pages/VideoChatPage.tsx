import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  MessageSquare, 
  Settings,
  Monitor,
  Volume2,
  VolumeX
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useWebRTC } from '../hooks/useWebRTC';

const VideoChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { id: appointmentId } = useParams<{ id: string }>();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Array<{id: string, sender: 'user' | 'remote', text: string, time: string}>>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);

  const {
    localStream,
    remoteStream,
    isConnecting,
    isConnected,
    error,
    startCall,
    endCall,
    toggleVideo,
    toggleAudio,
    isVideoEnabled,
    isAudioEnabled
  } = useWebRTC();

  // Set video streams to refs
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Handle call duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isConnected) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  // Start call automatically when component mounts
  useEffect(() => {
    if (appointmentId) {
      // For demo, start as initiator
      startCall(true);
    }
  }, [appointmentId, startCall]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    endCall();
    setTimeout(() => {
      navigate('/dashboard');
    }, 1000);
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now().toString(),
        sender: 'user' as const,
        text: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Simulate response
      setTimeout(() => {
        const response = {
          id: (Date.now() + 1).toString(),
          sender: 'remote' as const,
          text: 'Thank you for your message. I can see you clearly.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, response]);
      }, 1000);
    }
  };

  const toggleSpeaker = () => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = !isSpeakerOn;
      setIsSpeakerOn(!isSpeakerOn);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Connection Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Button onClick={() => window.location.reload()} className="w-full">
              Try Again
            </Button>
            <Button variant="outline" onClick={() => navigate('/dashboard')} className="w-full">
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!isConnected && !isConnecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Call Ended</h2>
          <p className="text-gray-600 mb-6">Thank you for your consultation</p>
          <Button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="flex h-screen">
        {/* Main Video Area */}
        <div className="flex-1 relative">
          {isConnecting ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white text-lg">Connecting to doctor...</p>
                <p className="text-gray-400 text-sm mt-2">Please allow camera and microphone access</p>
              </div>
            </div>
          ) : (
            <>
              {/* Remote Video */}
              <div className="absolute inset-0 bg-gray-800">
                {remoteStream ? (
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Video className="w-16 h-16 text-gray-500" />
                      </div>
                      <p className="text-white text-lg">Waiting for remote video...</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Local Video */}
              <div className="absolute top-4 right-4 w-48 h-36 bg-gray-700 rounded-lg overflow-hidden shadow-lg">
                {localStream ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform scale-x-[-1]"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <VideoOff className="w-8 h-8 text-gray-500" />
                  </div>
                )}
              </div>

              {/* Call Info */}
              <div className="absolute top-4 left-4 text-white bg-black/50 p-3 rounded-lg">
                <h2 className="text-xl font-semibold">Dr. Sarah Johnson</h2>
                <p className="text-sm opacity-90">Cardiologist</p>
                <div className="flex items-center mt-2 space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span className="text-sm">{formatTime(callDuration)}</span>
                </div>
              </div>
            </>
          )}

          {/* Control Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="flex items-center justify-center space-x-4">
              <Button
                variant="outline"
                size="lg"
                className={`bg-white/10 border-white/30 text-white hover:bg-white/20 ${
                  !isVideoEnabled ? 'bg-red-600/20 border-red-600' : ''
                }`}
                onClick={toggleVideo}
                disabled={!localStream}
              >
                {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className={`bg-white/10 border-white/30 text-white hover:bg-white/20 ${
                  !isAudioEnabled ? 'bg-red-600/20 border-red-600' : ''
                }`}
                onClick={toggleAudio}
                disabled={!localStream}
              >
                {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </Button>

              <Button
                variant="outline"
                size="lg"
                className={`bg-white/10 border-white/30 text-white hover:bg-white/20 ${
                  !isSpeakerOn ? 'bg-red-600/20 border-red-600' : ''
                }`}
                onClick={toggleSpeaker}
                disabled={!remoteStream}
              >
                {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </Button>

              <Button
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleEndCall}
              >
                <Phone className="w-5 h-5 transform rotate-135" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                onClick={() => setShowChat(!showChat)}
              >
                <MessageSquare className="w-5 h-5" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 400, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="bg-gray-800 border-l border-gray-700 flex flex-col"
          >
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-white font-semibold">Chat</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-white'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">{message.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  id="chat-message"
                  name="chat-message"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button size="sm" onClick={sendMessage}>
                  Send
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default VideoChatPage;
