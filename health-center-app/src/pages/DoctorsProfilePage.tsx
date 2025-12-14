  // DoctorProfilePage.tsx
  import { useState, useRef, useEffect } from 'react';
  import { useParams, useNavigate } from 'react-router-dom';
  import {
    User,
    Calendar,
    Clock,
    Star,
    MapPin,
    Phone,
    Mail,
    Award,
    CheckCircle,
    Video,
    MessageSquare,
    Send,
    Paperclip,
    FileText,
    Pill,
    Plus,
    X,
    ChevronLeft,
    Shield,
    Heart,
    Activity,
    Stethoscope,
    GraduationCap,
    Building,
    Languages,
    DollarSign,
    Image,
    Mic,
    MoreVertical,
    Download,
    Printer,
  } from 'lucide-react';
  import { motion, AnimatePresence } from 'framer-motion';
  import type { Doctor } from '../types';
  import { formatCurrency } from '../services/formatCurrency';

  interface Message {
    id: string;
    senderId: string;
    senderName: string;
    senderType: 'doctor' | 'patient';
    content: string;
    timestamp: Date;
    type: 'text' | 'image' | 'file' | 'prescription';
    attachments?: { name: string; url: string; type: string }[];
    prescription?: Prescription;
    read: boolean;
  }

  interface Prescription {
    id: string;
    medications: PrescriptionMedication[];
    diagnosis: string;
    instructions: string;
    followUpDate?: string;
    createdAt: Date;
    doctorName: string;
    patientName: string;
  }

  interface PrescriptionMedication {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }

  interface Appointment {
    id: string;
    date: string;
    time: string;
    type: 'in-person' | 'video' | 'phone';
    status: 'scheduled' | 'completed' | 'cancelled';
    reason: string;
  }

  interface DoctorProfilePageProps {
    doctors: Doctor[];
    currentUserId?: string;
    currentUserName?: string;
    userType?: 'doctor' | 'patient';
  }

  export const DoctorProfilePage = ({
    doctors,
    currentUserId = 'patient-1',
    currentUserName = 'John Doe',
    userType = 'patient',
  }: DoctorProfilePageProps) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [activeTab, setActiveTab] = useState<'about' | 'chat' | 'appointments' | 'prescriptions'>('about');
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

    // Prescription form state
    const [prescriptionForm, setPrescriptionForm] = useState<{
      diagnosis: string;
      instructions: string;
      followUpDate: string;
      medications: PrescriptionMedication[];
    }>({
      diagnosis: '',
      instructions: '',
      followUpDate: '',
      medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    });

    // Find the doctor - handle case where no doctors are available
    const doctor = doctors.find((d) => d.id === id);

    if (!doctor || doctors.length === 0) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {doctors.length === 0 ? 'No Doctors Available' : 'Doctor Not Found'}
            </h2>
            <p className="text-gray-600 mb-6">
              {doctors.length === 0
                ? 'There are currently no doctors available in the system.'
                : 'The doctor you\'re looking for doesn\'t exist.'
              }
            </p>
            <button
              onClick={() => navigate('/doctors')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Doctors
            </button>
          </div>
        </div>
      );
    }

    // Mock appointments
    const [appointments] = useState<Appointment[]>([
      {
        id: '1',
        date: '2024-12-20',
        time: '10:00 AM',
        type: 'video',
        status: 'scheduled',
        reason: 'Follow-up consultation',
      },
      {
        id: '2',
        date: '2024-12-15',
        time: '2:00 PM',
        type: 'in-person',
        status: 'completed',
        reason: 'General checkup',
      },
    ]);

    // Initialize mock messages
    useEffect(() => {
      if (doctor) {
        setMessages([
          {
            id: '1',
            senderId: doctor.id,
            senderName: doctor.name,
            senderType: 'doctor',
            content: `Hello! I'm ${doctor.name}. How can I help you today?`,
            timestamp: new Date(Date.now() - 3600000),
            type: 'text',
            read: true,
          },
          {
            id: '2',
            senderId: currentUserId,
            senderName: currentUserName,
            senderType: 'patient',
            content: 'Hi Doctor, I have been experiencing some headaches lately.',
            timestamp: new Date(Date.now() - 3000000),
            type: 'text',
            read: true,
          },
          {
            id: '3',
            senderId: doctor.id,
            senderName: doctor.name,
            senderType: 'doctor',
            content:
              'I understand. Can you tell me more about the frequency and intensity of these headaches? Also, are you experiencing any other symptoms?',
            timestamp: new Date(Date.now() - 2400000),
            type: 'text',
            read: true,
          },
        ]);

        // Mock prescriptions
        setPrescriptions([
          {
            id: 'rx-1',
            medications: [
              {
                name: 'Ibuprofen',
                dosage: '400mg',
                frequency: 'Twice daily',
                duration: '7 days',
                instructions: 'Take with food',
              },
            ],
            diagnosis: 'Tension headache',
            instructions: 'Get adequate rest, stay hydrated, and avoid screen time before bed.',
            followUpDate: '2024-12-25',
            createdAt: new Date(Date.now() - 86400000),
            doctorName: doctor.name,
            patientName: currentUserName,
          },
        ]);
      }
    }, [doctor, currentUserId, currentUserName]);

    // Scroll to bottom of messages
    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = () => {
      if (!newMessage.trim() || !doctor) return;

      const message: Message = {
        id: Date.now().toString(),
        senderId: currentUserId,
        senderName: currentUserName,
        senderType: userType,
        content: newMessage,
        timestamp: new Date(),
        type: 'text',
        read: false,
      };

      setMessages((prev) => [...prev, message]);
      setNewMessage('');

      // Simulate doctor typing and response
      if (userType === 'patient') {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          const responses = [
            'Thank you for sharing that information. Based on what you\'ve described, I recommend we schedule a follow-up appointment.',
            'I understand your concerns. Let me review your symptoms and get back to you with some recommendations.',
            'That\'s helpful to know. Have you noticed any patterns or triggers for these symptoms?',
          ];
          const randomResponse = responses[Math.floor(Math.random() * responses.length)];
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              senderId: doctor.id,
              senderName: doctor.name,
              senderType: 'doctor',
              content: randomResponse,
              timestamp: new Date(),
              type: 'text',
              read: false,
            },
          ]);
        }, 2000);
      }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    };

    const addMedication = () => {
      setPrescriptionForm((prev) => ({
        ...prev,
        medications: [
          ...prev.medications,
          { name: '', dosage: '', frequency: '', duration: '', instructions: '' },
        ],
      }));
    };

    const removeMedication = (index: number) => {
      setPrescriptionForm((prev) => ({
        ...prev,
        medications: prev.medications.filter((_, i) => i !== index),
      }));
    };

    const updateMedication = (index: number, field: keyof PrescriptionMedication, value: string) => {
      setPrescriptionForm((prev) => ({
        ...prev,
        medications: prev.medications.map((med, i) =>
          i === index ? { ...med, [field]: value } : med
        ),
      }));
    };

    const handleCreatePrescription = () => {
      if (!doctor) return;

      const prescription: Prescription = {
        id: `rx-${Date.now()}`,
        medications: prescriptionForm.medications,
        diagnosis: prescriptionForm.diagnosis,
        instructions: prescriptionForm.instructions,
        followUpDate: prescriptionForm.followUpDate,
        createdAt: new Date(),
        doctorName: doctor.name,
        patientName: currentUserName,
      };

      setPrescriptions((prev) => [...prev, prescription]);

      // Add prescription message to chat
      const prescriptionMessage: Message = {
        id: Date.now().toString(),
        senderId: doctor.id,
        senderName: doctor.name,
        senderType: 'doctor',
        content: 'I have created a new prescription for you.',
        timestamp: new Date(),
        type: 'prescription',
        prescription,
        read: false,
      };

      setMessages((prev) => [...prev, prescriptionMessage]);
      setShowPrescriptionModal(false);
      setPrescriptionForm({
        diagnosis: '',
        instructions: '',
        followUpDate: '',
        medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
      });
    };

    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    if (!doctor) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Doctor Not Found</h2>
            <p className="text-gray-600 mb-6">The doctor you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate('/doctors')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Doctors
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/doctors')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Doctors
          </motion.button>

          {/* Doctor Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8"
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="relative">
                  <img
                    src={doctor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&size=128&background=4F46E5&color=fff`}
                    alt={doctor.name}
                    className="w-32 h-32 rounded-full border-4 border-white object-cover"
                  />
                  {doctor.available && (
                    <div className="absolute bottom-2 right-2 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold">{doctor.name}</h1>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                      {doctor.specialty}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-white/90 mb-4">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                      <span className="font-semibold">{doctor.rating}</span>
                      <span className="ml-1">({doctor.reviewCount ?? 0} reviews)</span>
                    </div>
                    <div className="flex items-center">
                      <Award className="h-5 w-5 mr-1" />
                      <span>{doctor.experience} experience</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 mr-1" />
                      <span>{formatCurrency(doctor.consultationFee)} consultation</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => navigate(`/appointments?doctor=${doctor.id}`)}
                      className="px-6 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 flex items-center"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Appointment
                    </button>
                    <button
                      onClick={() => setActiveTab('chat')}
                      className="px-6 py-2 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 flex items-center"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Start Chat
                    </button>
                    <button className="px-6 py-2 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 flex items-center">
                      <Video className="h-4 w-4 mr-2" />
                      Video Call
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b">
              <div className="flex">
                {[
                  { id: 'about', label: 'About', icon: User },
                  { id: 'chat', label: 'Chat', icon: MessageSquare },
                  { id: 'appointments', label: 'Appointments', icon: Calendar },
                  { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`flex-1 py-4 px-6 flex items-center justify-center gap-2 font-medium transition-colors ${activeTab === tab.id
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'about' && (
              <motion.div
                key="about"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid md:grid-cols-3 gap-6"
              >
                {/* Main Info */}
                <div className="md:col-span-2 space-y-6">
                  {/* About */}
                  <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
                    <p className="text-gray-600 leading-relaxed">
                      {doctor.bio ||
                        `Dr. ${doctor.name} is a highly experienced ${doctor.specialty} with ${doctor.experience} of practice. Known for providing compassionate and comprehensive care to patients of all ages.`}
                    </p>
                  </div>

                  {/* Education & Certifications */}
                  <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      Education & Certifications
                    </h2>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <GraduationCap className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Medical Degree</h3>
                          <p className="text-sm text-gray-600">
                            {doctor.education || 'Harvard Medical School'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <Award className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Board Certified</h3>
                          <p className="text-sm text-gray-600">{doctor.specialty}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Shield className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Licensed Practitioner</h3>
                          <p className="text-sm text-gray-600">State Medical License #12345</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Specializations */}
                  <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Specializations</h2>
                    <div className="flex flex-wrap gap-2">
                      {(doctor.specializations ?? [doctor.specialty, 'General Medicine', 'Preventive Care']).map(
                        (spec, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                          >
                            {spec}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Contact Info */}
                  <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Building className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Hospital</p>
                          <p className="font-medium text-gray-900">
                            {doctor.hospital || 'City Medical Center'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Location</p>
                          <p className="font-medium text-gray-900">
                            {doctor.location || '123 Medical Drive'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Phone className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium text-gray-900">{doctor.phone || '+1 234 567 890'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Mail className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium text-gray-900">
                            {doctor.email || 'doctor@hospital.com'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Languages className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Languages</p>
                          <p className="font-medium text-gray-900">
                            {(doctor.languages || ['English', 'Spanish']).join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Availability</h2>
                    <div className="space-y-3">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                        <div key={day} className="flex justify-between items-center">
                          <span className="text-gray-600">{day}</span>
                          <span className="font-medium text-gray-900">9:00 AM - 5:00 PM</span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center text-gray-400">
                        <span>Saturday</span>
                        <span>Closed</span>
                      </div>
                      <div className="flex justify-between items-center text-gray-400">
                        <span>Sunday</span>
                        <span>Closed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'chat' && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-xl shadow overflow-hidden"
                style={{ height: '600px' }}
              >
                <div className="flex flex-col h-full">
                  {/* Chat Header */}
                  <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={doctor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&size=60&background=4F46E5&color=fff`}
                        alt={doctor.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                        <p className="text-sm text-emerald-600 flex items-center">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                          Online
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-200 rounded-lg">
                        <Video className="h-5 w-5 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-200 rounded-lg">
                        <Phone className="h-5 w-5 text-gray-600" />
                      </button>
                      {userType === 'doctor' && (
                        <button
                          onClick={() => setShowPrescriptionModal(true)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center"
                        >
                          <Pill className="h-4 w-4 mr-2" />
                          Write Prescription
                        </button>
                      )}
                      <button className="p-2 hover:bg-gray-200 rounded-lg">
                        <MoreVertical className="h-5 w-5 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'
                          }`}
                      >
                        <div
                          className={`max-w-[70%] ${message.senderId === currentUserId
                              ? 'order-2'
                              : 'order-1'
                            }`}
                        >
                          {message.type === 'prescription' && message.prescription ? (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <Pill className="h-5 w-5 text-blue-600" />
                                <span className="font-semibold text-blue-900">
                                  New Prescription
                                </span>
                              </div>
                              <div className="bg-white rounded-lg p-3 mb-3">
                                <p className="text-sm text-gray-500 mb-1">Diagnosis</p>
                                <p className="font-medium text-gray-900">
                                  {message.prescription.diagnosis}
                                </p>
                              </div>
                              <div className="bg-white rounded-lg p-3 mb-3">
                                <p className="text-sm text-gray-500 mb-2">Medications</p>
                                {message.prescription.medications.map((med, idx) => (
                                  <div key={idx} className="text-sm mb-2 last:mb-0">
                                    <span className="font-medium text-gray-900">{med.name}</span>
                                    <span className="text-gray-600">
                                      {' '}
                                      - {med.dosage}, {med.frequency} for {med.duration}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              <button className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center justify-center">
                                <Download className="h-4 w-4 mr-2" />
                                Download Prescription
                              </button>
                            </div>
                          ) : (
                            <div
                              className={`px-4 py-3 rounded-2xl ${message.senderId === currentUserId
                                  ? 'bg-blue-600 text-white rounded-br-md'
                                  : 'bg-gray-100 text-gray-900 rounded-bl-md'
                                }`}
                            >
                              <p>{message.content}</p>
                            </div>
                          )}
                          <p
                            className={`text-xs text-gray-400 mt-1 ${message.senderId === currentUserId ? 'text-right' : 'text-left'
                              }`}
                          >
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}

                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-md">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                            <span
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: '0.1s' }}
                            ></span>
                            <span
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: '0.2s' }}
                            ></span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="px-6 py-4 border-t bg-gray-50">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 hover:bg-gray-200 rounded-lg"
                      >
                        <Paperclip className="h-5 w-5 text-gray-600" />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx"
                      />
                      <button className="p-2 hover:bg-gray-200 rounded-lg">
                        <Image className="h-5 w-5 text-gray-600" />
                      </button>
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Type your message..."
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <button className="p-2 hover:bg-gray-200 rounded-lg">
                        <Mic className="h-5 w-5 text-gray-600" />
                      </button>
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'appointments' && (
              <motion.div
                key="appointments"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">Your Appointments</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className={`bg-white rounded-xl shadow p-6 border-l-4 ${appointment.status === 'scheduled'
                          ? 'border-blue-500'
                          : appointment.status === 'completed'
                            ? 'border-emerald-500'
                            : 'border-red-500'
                        }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${appointment.status === 'scheduled'
                                ? 'bg-blue-100 text-blue-800'
                                : appointment.status === 'completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                          >
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                        </div>
                        <div
                          className={`p-2 rounded-lg ${appointment.type === 'video'
                              ? 'bg-purple-100'
                              : appointment.type === 'phone'
                                ? 'bg-amber-100'
                                : 'bg-blue-100'
                            }`}
                        >
                          {appointment.type === 'video' ? (
                            <Video className="h-5 w-5 text-purple-600" />
                          ) : appointment.type === 'phone' ? (
                            <Phone className="h-5 w-5 text-amber-600" />
                          ) : (
                            <MapPin className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                      </div>

                      <h3 className="font-semibold text-gray-900 mb-2">{appointment.reason}</h3>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {appointment.date}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {appointment.time}
                        </div>
                      </div>

                      {appointment.status === 'scheduled' && (
                        <div className="flex gap-2">
                          <button className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                            {appointment.type === 'video' ? 'Join Call' : 'View Details'}
                          </button>
                          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                            Reschedule
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'prescriptions' && (
              <motion.div
                key="prescriptions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">Your Prescriptions</h2>
                  <button
                    onClick={() => navigate('/lab-results')}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    View Lab Results
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {prescriptions.map((prescription) => (
                    <div key={prescription.id} className="bg-white rounded-xl shadow p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Pill className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">Prescription</h3>
                            <p className="text-sm text-gray-500">{formatDate(prescription.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 hover:bg-gray-100 rounded-lg">
                            <Download className="h-4 w-4 text-gray-600" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded-lg">
                            <Printer className="h-4 w-4 text-gray-600" />
                          </button>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-1">Diagnosis</p>
                        <p className="font-medium text-gray-900">{prescription.diagnosis}</p>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-2">Medications</p>
                        <div className="space-y-2">
                          {prescription.medications.map((med, idx) => (
                            <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium text-gray-900">{med.name}</p>
                                  <p className="text-sm text-gray-600">
                                    {med.dosage} • {med.frequency} • {med.duration}
                                  </p>
                                </div>
                              </div>
                              {med.instructions && (
                                <p className="text-sm text-amber-600 mt-2">⚠️ {med.instructions}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {prescription.instructions && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800">{prescription.instructions}</p>
                        </div>
                      )}

                      {prescription.followUpDate && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>Follow-up: {prescription.followUpDate}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Prescription Modal */}
          <AnimatePresence>
            {showPrescriptionModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={() => setShowPrescriptionModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                >
                  <div className="p-6 border-b sticky top-0 bg-white z-10">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-bold text-gray-900">Write Prescription</h2>
                      <button
                        onClick={() => setShowPrescriptionModal(false)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Diagnosis */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Diagnosis *
                      </label>
                      <input
                        type="text"
                        value={prescriptionForm.diagnosis}
                        onChange={(e) =>
                          setPrescriptionForm((prev) => ({ ...prev, diagnosis: e.target.value }))
                        }
                        placeholder="Enter diagnosis"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Medications */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <label className="block text-sm font-medium text-gray-700">
                          Medications *
                        </label>
                        <button
                          onClick={addMedication}
                          className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Medication
                        </button>
                      </div>

                      <div className="space-y-4">
                        {prescriptionForm.medications.map((med, index) => (
                          <div key={index} className="p-4 bg-gray-50 rounded-lg relative">
                            {prescriptionForm.medications.length > 1 && (
                              <button
                                onClick={() => removeMedication(index)}
                                className="absolute top-2 right-2 p-1 hover:bg-gray-200 rounded"
                              >
                                <X className="h-4 w-4 text-gray-400" />
                              </button>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">
                                  Medication Name
                                </label>
                                <input
                                  type="text"
                                  value={med.name}
                                  onChange={(e) => updateMedication(index, 'name', e.target.value)}
                                  placeholder="e.g., Amoxicillin"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Dosage</label>
                                <input
                                  type="text"
                                  value={med.dosage}
                                  onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                                  placeholder="e.g., 500mg"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Frequency</label>
                                <select
                                  value={med.frequency}
                                  onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                >
                                  <option value="">Select frequency</option>
                                  <option value="Once daily">Once daily</option>
                                  <option value="Twice daily">Twice daily</option>
                                  <option value="Three times daily">Three times daily</option>
                                  <option value="Four times daily">Four times daily</option>
                                  <option value="As needed">As needed</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Duration</label>
                                <select
                                  value={med.duration}
                                  onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                >
                                  <option value="">Select duration</option>
                                  <option value="3 days">3 days</option>
                                  <option value="5 days">5 days</option>
                                  <option value="7 days">7 days</option>
                                  <option value="10 days">10 days</option>
                                  <option value="14 days">14 days</option>
                                  <option value="30 days">30 days</option>
                                  <option value="Ongoing">Ongoing</option>
                                </select>
                              </div>
                              <div className="col-span-2">
                                <label className="block text-xs text-gray-500 mb-1">
                                  Special Instructions
                                </label>
                                <input
                                  type="text"
                                  value={med.instructions}
                                  onChange={(e) =>
                                    updateMedication(index, 'instructions', e.target.value)
                                  }
                                  placeholder="e.g., Take with food"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* General Instructions */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        General Instructions
                      </label>
                      <textarea
                        value={prescriptionForm.instructions}
                        onChange={(e) =>
                          setPrescriptionForm((prev) => ({ ...prev, instructions: e.target.value }))
                        }
                        placeholder="Enter any additional instructions for the patient"
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Follow-up Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Follow-up Date
                      </label>
                      <input
                        type="date"
                        value={prescriptionForm.followUpDate}
                        onChange={(e) =>
                          setPrescriptionForm((prev) => ({ ...prev, followUpDate: e.target.value }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="p-6 border-t bg-gray-50 flex gap-4">
                    <button
                      onClick={() => setShowPrescriptionModal(false)}
                      className="flex-1 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreatePrescription}
                      disabled={
                        !prescriptionForm.diagnosis ||
                        !prescriptionForm.medications[0].name
                      }
                      className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Create Prescription
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    );
  };

  export default DoctorProfilePage;