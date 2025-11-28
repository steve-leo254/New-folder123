import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Stethoscope, Clock, Shield } from 'lucide-react';
import Card from '../ui/Card';

const Services: React.FC = () => {
  const services = [
    {
      icon: Heart,
      title: 'Comprehensive Care',
      description: 'Complete healthcare solutions under one roof with specialized departments for all medical needs.'
    },
    {
      icon: Stethoscope,
      title: 'Expert Doctors',
      description: 'Highly qualified and experienced medical professionals dedicated to your health and well-being.'
    },
    {
      icon: Clock,
      title: '24/7 Emergency',
      description: 'Round-the-clock emergency services with rapid response teams and critical care facilities.'
    },
    {
      icon: Shield,
      title: 'Advanced Technology',
      description: 'State-of-the-art medical equipment and cutting-edge technology for accurate diagnosis and treatment.'
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Services</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We provide comprehensive healthcare services with modern facilities and experienced medical professionals
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 text-center hover:shadow-xl transition-shadow">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {service.title}
                  </h3>
                  <p className="text-gray-600">{service.description}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;