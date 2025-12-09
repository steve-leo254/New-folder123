import { useState } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Star, 
  MapPin, 
  Users, 
  Phone, 
  Mail,
  Award,
  CheckCircle,
  Video,
  Heart,
  Activity,
  Shield,
  TrendingUp,
  FilterX
} from 'lucide-react';
import DoctorCard from '../components/features/DoctorCard';
import type { Doctor } from '../types';
import { motion } from 'framer-motion';

interface DoctorsPageProps {
  doctors: Doctor[];
  onSelectDoctor: (doctor: Doctor) => void;
}

export const DoctorsPage1 = ({ doctors, onSelectDoctor }: DoctorsPageProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const specialties = ['all', ...Array.from(new Set(doctors.map(doc => doc.specialty)))];
  const availabilityOptions = ['all', 'available', 'unavailable'];

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.experience.toString().toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialty = selectedSpecialty === 'all' || doctor.specialty === selectedSpecialty;
    const matchesAvailability = selectedAvailability === 'all' || 
      (selectedAvailability === 'available' && doctor.available) ||
      (selectedAvailability === 'unavailable' && !doctor.available);
    
    return matchesSearch && matchesSpecialty && matchesAvailability;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'experience':
        return (typeof b.experience === 'number' ? b.experience : parseInt(b.experience)) - 
               (typeof a.experience === 'number' ? a.experience : parseInt(a.experience));
      case 'name':
        return a.name.localeCompare(b.name);
      case 'price-low':
        return a.consultationFee - b.consultationFee;
      default:
        return 0;
    }
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSpecialty('all');
    setSelectedAvailability('all');
  };

  const activeFiltersCount = [
    searchTerm !== '',
    selectedSpecialty !== 'all',
    selectedAvailability !== 'all'
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen gradient-medical">
      <div className="container-medical py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="heading-1 text-secondary-900 mb-2">
                Find Your Perfect Doctor
              </h1>
              <p className="text-body text-secondary-600">
                {filteredDoctors.length} qualified doctors available for consultation
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-secondary-500">
                {activeFiltersCount > 0 && (
                  <span className="flex items-center">
                    <FilterX className="h-4 w-4 mr-2" />
                    {activeFiltersCount} active filter{activeFiltersCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <button
                onClick={clearFilters}
                className="btn-secondary text-sm"
              >
                Clear All
              </button>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <div className="card-elevated p-6 mb-8">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Search Bar */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-secondary-700 mb-3">
                Search Doctors
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search by name, specialty, or condition..."
                  className="input pl-12 pr-4"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                  >
                    <FilterX className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Specialty Filter */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-3">
                Specialty
              </label>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="input appearance-none"
              >
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty}>
                    {specialty === 'all' ? 'All Specialties' : specialty}
                  </option>
                ))}
              </select>
            </div>

            {/* Availability Filter */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-3">
                Availability
              </label>
              <select
                value={selectedAvailability}
                onChange={(e) => setSelectedAvailability(e.target.value)}
                className="input appearance-none"
              >
                <option value="all">All Doctors</option>
                <option value="available">Available Now</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-3">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input appearance-none"
              >
                <option value="rating">Highest Rated</option>
                <option value="experience">Most Experienced</option>
                <option value="name">Name A-Z</option>
                <option value="price-low">Lowest Price</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-3">
                View
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 py-2 px-3 rounded-lg border-2 transition-colors ${
                    viewMode === 'grid'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-secondary-200 bg-white text-secondary-600 hover:border-secondary-300'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <div className="grid grid-cols-3 gap-1 w-4 h-4">
                      <div className="w-2 h-2 bg-current rounded-sm"></div>
                      <div className="w-2 h-2 bg-current rounded-sm"></div>
                      <div className="w-2 h-2 bg-current rounded-sm"></div>
                    </div>
                  </div>
                  <span className="ml-2 text-sm">Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 py-2 px-3 rounded-lg border-2 transition-colors ${
                    viewMode === 'list'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-secondary-200 bg-white text-secondary-600 hover:border-secondary-300'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <div className="space-y-1 w-4">
                      <div className="w-full h-0.5 bg-current rounded-sm"></div>
                      <div className="w-full h-0.5 bg-current rounded-sm"></div>
                      <div className="w-full h-0.5 bg-current rounded-sm"></div>
                    </div>
                  </div>
                  <span className="ml-2 text-sm">List</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Stats */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center px-4 py-2 bg-blue-50 rounded-lg">
            <Users className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <div className="text-lg font-bold text-blue-900">{filteredDoctors.length}</div>
              <div className="text-sm text-blue-700">Doctors Found</div>
            </div>
          </div>
          <div className="flex items-center px-4 py-2 bg-emerald-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-emerald-600 mr-2" />
            <div>
              <div className="text-lg font-bold text-emerald-900">
                {doctors.filter(d => d.available).length}
              </div>
              <div className="text-sm text-emerald-700">Available Now</div>
            </div>
          </div>
          <div className="flex items-center px-4 py-2 bg-amber-50 rounded-lg">
            <TrendingUp className="h-5 w-5 text-amber-600 mr-2" />
            <div>
              <div className="text-lg font-bold text-amber-900">
                {Math.round(doctors.reduce((acc, doc) => acc + doc.rating, 0) / doctors.length)}
              </div>
              <div className="text-sm text-amber-700">Avg Rating</div>
            </div>
          </div>
        </div>

        {/* Doctors Display */}
        {filteredDoctors.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={
              viewMode === 'grid'
                ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {filteredDoctors.map((doctor, index) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <DoctorCard doctor={doctor} onSelect={onSelectDoctor} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="heading-2 text-secondary-900 mb-4">
                No Doctors Found
              </h3>
              <p className="text-body text-secondary-600 mb-8">
                {searchTerm || selectedSpecialty !== 'all' || selectedAvailability !== 'all'
                  ? 'Try adjusting your search criteria or filters'
                  : 'No doctors match your current criteria. Please check back later.'
                }
              </p>
              <button
                onClick={clearFilters}
                className="btn-primary"
              >
                Clear Filters
              </button>
            </div>
          </motion.div>
        )}

        {/* Quick Stats Section */}
        <div className="grid md:grid-cols-4 gap-6 mt-12">
          {[
            {
              icon: Award,
              label: 'Board Certified',
              value: doctors.filter(d => typeof d.experience === 'string' && d.experience.includes('15+')).length,
              color: 'blue'
            },
            {
              icon: Star,
              label: 'Top Rated',
              value: doctors.filter(d => d.rating >= 4.8).length,
              color: 'amber'
            },
            {
              icon: Video,
              label: 'Video Consult',
              value: doctors.filter(d => d.available).length,
              color: 'emerald'
            },
            {
              icon: Shield,
              label: '24/7 Available',
              value: doctors.filter(d => d.available).length,
              color: 'purple'
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
              className="text-center"
            >
              <div className={`w-16 h-16 bg-${stat.color}-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`h-8 w-8 text-${stat.color}-600`} />
              </div>
              <div className="text-2xl font-bold text-secondary-900 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-secondary-600">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DoctorsPage1;