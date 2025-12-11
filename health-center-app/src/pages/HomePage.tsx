import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Stethoscope, 
  Video, 
  Pill, 
  ChevronRight,
  Users,
  Award
} from 'lucide-react';
import Hero from '../components/common/Hero';
import Services from '../components/common/Services';
import Testimonials from '../components/common/Testimonials';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const HomePage: React.FC = () => {
  const features = [
    {
      icon: Calendar,
      title: 'Easy Appointment Booking',
      description: 'Schedule appointments with our expert doctors in just a few clicks',
      link: '/appointments'
    },
    {
      icon: Video,
      title: 'Video Consultations',
      description: 'Connect with doctors remotely from the comfort of your home',
      link: '/video-chat'
    },
    {
      icon: Pill,
      title: 'Medication Delivery',
      description: 'Order prescribed medicines and get them delivered to your doorstep',
      link: '/pharmacy'
    },
    {
      icon: Stethoscope,
      title: 'Expert Doctors',
      description: 'Access to qualified and experienced medical professionals',
      link: '/doctors'
    }
  ];

  const stats = [
    { icon: Users, label: 'Happy Patients', value: '5.2k+' },
    { icon: Stethoscope, label: 'Expert Doctors', value: '35+' },
    { icon: Calendar, label: 'Appointments', value: '5.4+' },
    { icon: Award, label: 'Years of Service', value: '11+' }
  ];

  return (
    <div className="space-y-16">
      <Hero />
      
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Our Comprehensive Healthcare Services
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience modern healthcare with our range of digital and in-person services
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 text-center hover:shadow-2xl">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <Link to={feature.link}>
                    <Button variant="outline" size="sm">
                      Learn More
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="bg-primary-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-gray-600">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <Services />
      <Testimonials />

      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Take Control of Your Health?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of satisfied patients who trust Kiangombe Health Center
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/appointments">
                <Button size="lg" className="bg-blue  text-primary-600 hover:bg-gray-100">
                  Book Appointment
                </Button>
              </Link>
              <Link to="/doctors">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary-600">
                  Find a Doctor
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;