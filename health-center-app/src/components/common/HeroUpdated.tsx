import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play, ArrowRight, Stethoscope, Heart, Shield } from 'lucide-react';
import Button from '../ui/Button';
import VideoModal from '../modals/VideoModal';
import heroImage from '@/assets/kiangombe.jpg';

const Hero: React.FC = () => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const openVideoModal = () => {
    setIsVideoModalOpen(true);
  };

  const closeVideoModal = () => {
    setIsVideoModalOpen(false);
  };

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-secondary-600">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
                Your Health is Our
                <span className="block text-yellow-300">Top Priority</span>
              </h1>
              <p className="text-xl text-white/90 mb-8">
                Experience world-class healthcare with Kiangombe Health Center. 
                Book appointments, consult doctors online, and manage your health seamlessly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/appointments">
                  <Button size="lg" className="bg-black text-primary-600 hover:bg-gray-100 ">
                    Book Appointment
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <button 
                  onClick={openVideoModal}
                  className="flex items-center justify-center px-6 py-3 border-2 border-white text-white rounded-lg hover:bg-white hover:text-primary-600 transition-colors"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-6 mt-12">
                {[
                  { icon: Stethoscope, label: 'Expert Doctors', value: '35+' },
                  { icon: Heart, label: 'Happy Patients', value: '5.2K+' },
                  { icon: Shield, label: 'Years of Trust', value: '11+' }
                ].map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="text-center">
                      <Icon className="w-8 h-8 text-yellow-300 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">{stat.value}</div>
                      <div className="text-sm text-white/80">{stat.label}</div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10">
                <img
                  src={heroImage}
                  alt="Kiangombe Health"
                  className="rounded-2xl shadow-2xl w-full h-auto object-cover"
                />
                <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 hidden lg:block">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Heart className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">24/7 Support</p>
                      <p className="text-sm text-gray-600">Always here for you</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <VideoModal 
        isOpen={isVideoModalOpen} 
        onClose={closeVideoModal}
        videoUrl="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
      />
    </>
  );
};

export default Hero;
