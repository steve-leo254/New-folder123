import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Clock, Users, Send } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const ChatPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <Card className="p-8 text-center">
          {/* Chat Icon */}
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="w-10 h-10 text-blue-600" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Chat Feature
          </h1>
          
          {/* Coming Soon Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium mb-6">
            <Clock className="w-4 h-4 mr-2" />
            Coming Soon
          </div>

          {/* Description */}
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            We're working on a secure and intuitive chat system that will allow you to communicate directly with healthcare providers. Stay tuned for updates!
          </p>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">Direct Messaging</h3>
              <p className="text-sm text-gray-600">Chat with your healthcare providers</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Send className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">Quick Responses</h3>
              <p className="text-sm text-gray-600">Fast and secure communication</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <MessageCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">Group Chats</h3>
              <p className="text-sm text-gray-600">Connect with care teams</p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
            
            <div className="text-sm text-gray-500">
              In the meantime, you can use the{' '}
              <a href="/appointments" className="text-blue-600 hover:text-blue-700 font-medium">
                appointment system
              </a>
              {' '}to schedule consultations.
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mt-8">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <span>Development Progress:</span>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              </div>
              <span>60%</span>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default ChatPage;
