import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  MessageSquare, 
  Settings,
  Monitor
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const VideoChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');

  useEffect(() => {
    // Simulate connection
    const timer = setTimeout(() => {
      setCallStatus('connected');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleEndCall = () => {
    setCallStatus('ended');
    setTimeout(() => {
      navigate('/dashboard');
    }, 1000);
  };

  const messages = [
    { id: 1, sender: 'doctor', text: 'Hello! How are you feeling today?', time: '10:00 AM' },
    { id: 2, sender: 'patient', text: 'I have been experiencing some chest pain', time: '10:01 AM' },
    { id: 3, sender: 'doctor', text: 'Can you describe the pain? Is it sharp or dull?', time: '10:02 AM' }
  ];

  if (callStatus === 'ended') {
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
          {callStatus === 'connecting' ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white text-lg">Connecting to doctor...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="absolute inset-0 bg-gray-800">
                <img
                  src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1280&h=720&q=80"
                  alt="Doctor"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Self Video */}
              <div className="absolute top-4 right-4 w-48 h-36 bg-gray-700 rounded-lg overflow-hidden shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=300&q=80"
                  alt="You"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Call Info */}
              <div className="absolute top-4 left-4 text-white">
                <h2 className="text-xl font-semibold">Dr. Sarah Johnson</h2>
                <p className="text-sm opacity-90">Cardiologist</p>
                <div className="flex items-center mt-2 space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">00:12:45</span>
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
                  !isVideoOn ? 'bg-red-600/20 border-red-600' : ''
                }`}
                onClick={() => setIsVideoOn(!isVideoOn)}
              >
                {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className={`bg-white/10 border-white/30 text-white hover:bg-white/20 ${
                  !isMicOn ? 'bg-red-600/20 border-red-600' : ''
                }`}
                onClick={() => setIsMicOn(!isMicOn)}
              >
                {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </Button>

              <Button
                variant="outline"
                size="lg"
                className={`bg-white/10 border-white/30 text-white hover:bg-white/20 ${
                  isScreenSharing ? 'bg-blue-600/20 border-blue-600' : ''
                }`}
                onClick={() => setIsScreenSharing(!isScreenSharing)}
              >
                <Monitor className="w-5 h-5" />
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
                  className={`flex ${message.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.sender === 'patient'
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
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <Button size="sm">Send</Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default VideoChatPage;