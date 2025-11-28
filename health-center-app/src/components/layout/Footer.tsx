import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Heart
} from 'lucide-react';
import logoImage from '@/assets/kiangombe.jpg';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src={logoImage} 
                alt="Kiangombe Health" 
                className="w-14 h-14 rounded-lg object-cover"
              />
             <span className="text-2xl font-bold text-white">Kiangombe Health</span>
            </div>
            <p className="text-gray-400 mb-4">
              Your trusted partner in healthcare, providing quality medical services with compassion and excellence.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/doctors" className="text-gray-400 hover:text-white transition-colors">Find a Doctor</Link></li>
              <li><Link to="/appointments" className="text-gray-400 hover:text-white transition-colors">Book Appointment</Link></li>
              <li><Link to="/medications" className="text-gray-400 hover:text-white transition-colors">Order Medications</Link></li>
              <li><Link to="/video-chat" className="text-gray-400 hover:text-white transition-colors">Video Consultation</Link></li>
              <li><Link to="/prescriptions" className="text-gray-400 hover:text-white transition-colors">Prescriptions</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Our Services</h3>
            <ul className="space-y-2">
              <li><span className="text-gray-400">General Practice</span></li>
              <li><span className="text-gray-400">Emergency Care</span></li>
              <li><span className="text-gray-400">Specialized Treatments</span></li>
              <li><span className="text-gray-400">Health Checkups</span></li>
              <li><span className="text-gray-400">Mental Health</span></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-primary-500" />
                <span className="text-gray-400">Opposite Capital sacco, Kirinyaga Town </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary-500" />
                <span className="text-gray-400">+254 758 510 206</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary-500" />
                <span className="text-gray-400">info@kiangombehealth.com</span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-400">24/7 Emergency Hotline</p>
              <p className="text-lg font-semibold text-primary-500">+254 758 991 776</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} Kiangombe Health Center. All rights reserved.
            </p>
            <div className="flex items-center space-x-1 mt-4 md:mt-0">
              <span className="text-gray-400 text-sm">Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span className="text-gray-400 text-sm">for better healthcare</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;