import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import Card from '../ui/Card';

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name: 'Sarah Mwangi',
      role: 'Patient',
      content: 'The doctors at Kiangombe Health Center are exceptional. They took time to understand my condition and provided the best treatment.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&h=150&q=80'
    },
    {
      name: 'John Kamau',
      role: 'Patient',
      content: 'Excellent healthcare services! The online appointment booking system is so convenient and the staff is very professional.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&h=150&q=80'
    },
    {
      name: 'Grace Wanjiru',
      role: 'Patient',
      content: 'I had a video consultation with Dr. Johnson and it was just as good as an in-person visit. Great technology and care!',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&h=150&q=80'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Patients Say</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real stories from real patients who have experienced our exceptional healthcare services
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-xl transition-shadow">
                <Quote className="w-8 h-8 text-primary-200 mb-4" />
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">{testimonial.content}</p>
                <div className="flex items-center">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;