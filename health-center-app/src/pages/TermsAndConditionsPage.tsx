// pages/TermsAndConditionsPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FileText,
  Shield,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  ChevronUp,
  Printer,
  Download,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Scale,
  UserCheck,
  CreditCard,
  Lock,
  Ban,
  RefreshCw,
  MessageCircle,
  ExternalLink,
  BookOpen,
  Gavel,
  Heart,
  Stethoscope,
  Video,
  Pill,
  ClipboardList,
  AlertCircle,
  Info,
  HelpCircle,
  ArrowUp,
  Search,
  Menu,
  X,
} from 'lucide-react';

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
}

const TermsAndConditionsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('introduction');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const location = useLocation();
  const contentRef = useRef<HTMLDivElement>(null);

  const lastUpdated = 'January 15, 2026';
  const effectiveDate = 'January 20, 2026';
  const version = '2.1';

  const sections: Section[] = [
    { id: 'introduction', title: 'Introduction', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'definitions', title: 'Definitions', icon: <FileText className="w-5 h-5" /> },
    { id: 'eligibility', title: 'Eligibility', icon: <UserCheck className="w-5 h-5" /> },
    { id: 'services', title: 'Telemedicine Services', icon: <Stethoscope className="w-5 h-5" /> },
    { id: 'consultations', title: 'Medical Consultations', icon: <Video className="w-5 h-5" /> },
    { id: 'prescriptions', title: 'Prescriptions & Pharmacy', icon: <Pill className="w-5 h-5" /> },
    { id: 'accounts', title: 'User Accounts', icon: <Lock className="w-5 h-5" /> },
    { id: 'payments', title: 'Payments & Billing', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'privacy', title: 'Privacy & HIPAA', icon: <Shield className="w-5 h-5" /> },
    { id: 'intellectual', title: 'Intellectual Property', icon: <Scale className="w-5 h-5" /> },
    { id: 'prohibited', title: 'Prohibited Activities', icon: <Ban className="w-5 h-5" /> },
    { id: 'disclaimers', title: 'Disclaimers', icon: <AlertTriangle className="w-5 h-5" /> },
    { id: 'liability', title: 'Limitation of Liability', icon: <Gavel className="w-5 h-5" /> },
    { id: 'termination', title: 'Termination', icon: <RefreshCw className="w-5 h-5" /> },
    { id: 'governing', title: 'Governing Law', icon: <Scale className="w-5 h-5" /> },
    { id: 'changes', title: 'Changes to Terms', icon: <ClipboardList className="w-5 h-5" /> },
    { id: 'contact', title: 'Contact Us', icon: <MessageCircle className="w-5 h-5" /> },
  ];

  // Handle scroll to show/hide scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);

      // Update active section based on scroll position
      const sectionElements = sections.map((section) =>
        document.getElementById(section.id)
      );

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const element = sectionElements[i];
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150) {
            setActiveSection(sections[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to section from URL hash
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash) {
      const element = document.getElementById(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [location]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
    setShowMobileNav(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a real app, this would generate and download a PDF
    alert('Downloading Terms & Conditions as PDF...');
  };

  const filteredSections = sections.filter((section) =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold">Terms & Conditions</h1>
              <p className="text-blue-100 mt-1">Kiangombe Health Center</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <Calendar className="w-4 h-4" />
              <span>Last Updated: {lastUpdated}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <Clock className="w-4 h-4" />
              <span>Effective: {effectiveDate}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <FileText className="w-4 h-4" />
              <span>Version {version}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Toggle */}
      <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
        <button
          onClick={() => setShowMobileNav(!showMobileNav)}
          className="flex items-center gap-2 text-gray-700 font-medium"
        >
          {showMobileNav ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          Table of Contents
        </button>
      </div>

      {/* Mobile Navigation */}
      {showMobileNav && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setShowMobileNav(false)}>
          <div
            className="absolute left-0 top-0 bottom-0 w-80 bg-white overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search sections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <nav className="space-y-1">
                {filteredSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {section.icon}
                    <span className="text-sm font-medium">{section.title}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar Navigation */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="font-semibold text-gray-900 mb-4">Table of Contents</h2>
              
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search sections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <nav className="space-y-1 max-h-[60vh] overflow-y-auto">
                {filteredSections.map((section, index) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${
                      activeSection === section.id
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-xs text-gray-400 w-5">{index + 1}.</span>
                    <span className="text-sm font-medium truncate">{section.title}</span>
                  </button>
                ))}
              </nav>

              {/* Quick Links */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Quick Links
                </h3>
                <div className="space-y-2">
                  <Link
                    to="/privacy-policy"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Shield className="w-4 h-4" />
                    Privacy Policy
                  </Link>
                  <Link
                    to="/help"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <HelpCircle className="w-4 h-4" />
                    Help Center
                  </Link>
                  <Link
                    to="/contact"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Contact Support
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0" ref={contentRef}>
            {/* Important Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
              <div className="flex gap-4">
                <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-amber-800 mb-2">Important Notice</h3>
                  <p className="text-amber-700 text-sm">
                    Please read these Terms and Conditions carefully before using our telemedicine services. 
                    By accessing or using Kiangombe Health Center, you agree to be bound by these terms. If you disagree 
                    with any part of these terms, you may not access our services.
                  </p>
                </div>
              </div>
            </div>

            {/* Content Sections */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-8 lg:p-12 space-y-12">
                {/* Section 1: Introduction */}
                <section id="introduction" className="scroll-mt-32">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">1. Introduction</h2>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <p>
                      Welcome to Kiangombe Health Center . These Terms and Conditions that 
                      govern your access to and use of our telemedicine platform  and other  
                      related services .
                    </p>
                    <p>
                      Kiangombe Health Center is a telemedicine platform that connects patients with licensed healthcare 
                      providers for virtual medical consultations, prescription services, and health management 
                      tools. Our mission is to make quality healthcare accessible, convenient, and affordable.
                    </p>
                    <p>
                      By creating an account, accessing our platform, or using any of our Services, you acknowledge 
                      that you have read, understood, and agree to be bound by these Terms, our Privacy Policy, 
                      and any additional terms applicable to specific services you use.
                    </p>
                  </div>
                </section>

                {/* Section 2: Definitions */}
                <section id="definitions" className="scroll-mt-32">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">2. Definitions</h2>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <p>For the purposes of these Terms:</p>
                    <ul className="space-y-3">
                      <li>
                        <strong>"Platform"</strong> refers to the Kiangombe Health Center website, mobile applications, 
                        and all related software and services.
                      </li>
                      <li>
                        <strong>"User" or "You"</strong> refers to any individual who accesses or uses our 
                        Services, including patients and their authorized representatives.
                      </li>
                      <li>
                        <strong>"Healthcare Provider"</strong> refers to licensed physicians, nurse practitioners, 
                        physician assistants, and other medical professionals who provide services through our Platform.
                      </li>
                      <li>
                        <strong>"Consultation"</strong> refers to a virtual medical appointment conducted via 
                        video, audio, or text-based communication through our Platform.
                      </li>
                      <li>
                        <strong>"Sensitive Personal Data (SPD)"</strong> refers to any individually 
                        identifiable health information as defined by DPA.
                      </li>
                      <li>
                        <strong>"Prescription"</strong> refers to an order for medication issued by a licensed 
                        Healthcare Provider through our Platform.
                      </li>
                    </ul>
                  </div>
                </section>

                {/* Section 3: Eligibility */}
                <section id="eligibility" className="scroll-mt-32">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <UserCheck className="w-5 h-5 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">3. Eligibility Requirements</h2>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <p>To use our Services, you must meet the following eligibility requirements:</p>
                    
                    <div className="bg-gray-50 rounded-xl p-6 my-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Age Requirements</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>You must be at least 18 years of age to create an account</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>Minors may use Services only with parental or guardian consent and supervision</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>Parents/guardians are responsible for minor's account activity</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 my-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Geographic Requirements</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>You must be physically located in a state/jurisdiction where we operate</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>Healthcare Providers are licensed in the state where you're located during consultation</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>Services may not be available in all locations</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 my-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Technical Requirements</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>Stable internet connection for video consultations</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>Compatible device with camera and microphone</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>Updated browser or mobile application</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Section 4: Telemedicine Services */}
                <section id="services" className="scroll-mt-32">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Stethoscope className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">4. Telemedicine Services</h2>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <p>
                      Kiangombe Health Center provides a platform for telemedicine services. It is important to understand 
                      the nature and limitations of these services:
                    </p>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 my-6">
                      <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                        <Info className="w-5 h-5" />
                        Nature of Telemedicine
                      </h4>
                      <p className="text-blue-800 text-sm">
                        Telemedicine involves the delivery of healthcare services using electronic communications. 
                        While telemedicine can be an effective way to receive certain types of medical care, it 
                        has limitations compared to in-person visits. Not all medical conditions can be 
                        appropriately diagnosed or treated via telemedicine.
                      </p>
                    </div>

                    <h4 className="font-semibold mt-6">Services We Provide:</h4>
                    <ul className="space-y-2">
                      <li>Virtual consultations with licensed healthcare providers</li>
                      <li>Prescription services (where appropriate and legally permitted)</li>
                      <li>Referrals to specialists and in-person care when needed</li>
                      <li>Digital health records and medical history management</li>
                      <li>Secure messaging with healthcare providers</li>
                      <li>Health monitoring and wellness programs</li>
                      <li>Medical appointments</li>
                      <li>Health Checkups</li>
                      {/* <li></li> */}
                    </ul>

                    <h4 className="font-semibold mt-6">Services We Do NOT Provide:</h4>
                    <ul className="space-y-2">
                      <li>Emergency medical services or crisis intervention</li>
                      <li>Controlled substances (Schedule I-V medications) except where legally permitted</li>
                      <li>Physical examinations or laboratory testing unless recommended by your healthcare provider</li>
                      <li>Medical procedures or surgeries</li>
                      <li>Ongoing treatment for complex chronic conditions without appropriate in-person care</li>
                    </ul>
                  </div>
                </section>

                {/* Section 5: Medical Consultations */}
                <section id="consultations" className="scroll-mt-32">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-pink-100 rounded-lg">
                      <Video className="w-5 h-5 text-pink-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">5. Medical Consultations</h2>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <h4 className="font-semibold">Before Your Consultation:</h4>
                    <ul className="space-y-2">
                      <li>Provide accurate and complete medical history and current symptoms</li>
                      <li>List all current medications, allergies, and relevant health conditions</li>
                      <li>Have valid identification ready for verification</li>
                      <li>Ensure you are in a private location with stable internet connection</li>
                    </ul>

                    <h4 className="font-semibold mt-6">During Your Consultation:</h4>
                    <ul className="space-y-2">
                      <li>Be honest and thorough in describing your symptoms and medical history</li>
                      <li>Ask questions about your diagnosis, treatment options, and any concerns</li>
                      <li>Follow the healthcare provider's instructions for treatment</li>
                      <li>Inform the provider if you experience technical difficulties</li>
                    </ul>

                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 my-6">
                      <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        Emergency Situations
                      </h4>
                      <p className="text-red-800 text-sm">
                        <strong>Our Services are NOT for emergencies.</strong> If you are experiencing a medical 
                        emergency, call 911 or go to your nearest emergency room immediately. Signs of a medical 
                        emergency include: chest pain, difficulty breathing, severe bleeding, signs of stroke, 
                        severe allergic reactions, or thoughts of self-harm.
                      </p>
                    </div>

                    <h4 className="font-semibold mt-6">After Your Consultation:</h4>
                    <ul className="space-y-2">
                      <li>Follow the treatment plan provided by your healthcare provider</li>
                      <li>Take all medications as prescribed</li>
                      <li>Schedule follow-up appointments as recommended</li>
                      <li>Seek in-person care if your condition worsens or doesn't improve</li>
                      <li>Contact us or your healthcare provider with any questions or concerns</li>
                    </ul>
                  </div>
                </section>

                {/* Section 6: Prescriptions & Pharmacy */}
                <section id="prescriptions" className="scroll-mt-32">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-cyan-100 rounded-lg">
                      <Pill className="w-5 h-5 text-cyan-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">6. Prescriptions & Pharmacy Services</h2>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <p>
                      When medically appropriate, our Healthcare Providers may prescribe medications. Please 
                      understand the following regarding prescription services:
                    </p>

                    <h4 className="font-semibold mt-6">Prescription Policies:</h4>
                    <ul className="space-y-2">
                      <li>
                        Prescriptions are issued at the sole discretion of the Healthcare Provider based on 
                        their medical judgment
                      </li>
                      <li>
                        Not all medications can be prescribed via telemedicine due to legal and medical 
                        restrictions
                      </li>
                      <li>
                        Controlled substances may have additional restrictions based on state and federal laws
                      </li>
                      <li>
                        Prescriptions are sent electronically to your preferred pharmacy
                      </li>
                      <li>
                        Refills require appropriate follow-up consultations as determined by your provider
                      </li>
                    </ul>

                    <h4 className="font-semibold mt-6">Pharmacy Services:</h4>
                    <ul className="space-y-2">
                      <li>You may choose any pharmacy that accepts electronic prescriptions</li>
                      <li>
                        We offer an integrated pharmacy service for convenience (optional)
                      </li>
                      <li>Medication pricing varies by pharmacy and insurance coverage</li>
                      <li>
                        We are not responsible for pharmacy errors, delays, or medication availability
                      </li>
                    </ul>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 my-6">
                      <h4 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Medication Safety
                      </h4>
                      <p className="text-yellow-800 text-sm">
                        Always inform your Healthcare Provider of all medications you are currently taking, 
                        including over-the-counter drugs, supplements, and herbal remedies. Report any adverse 
                        reactions or side effects immediately. Do not share prescription medications with others.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 7: User Accounts */}
                <section id="accounts" className="scroll-mt-32">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Lock className="w-5 h-5 text-gray-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">7. User Accounts</h2>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <h4 className="font-semibold">Account Creation:</h4>
                    <ul className="space-y-2">
                      <li>You must provide accurate, current, and complete information during registration</li>
                      <li>You are responsible for maintaining the accuracy of your account information</li>
                      <li>One account per person; multiple accounts are prohibited</li>
                      <li>Account is non-transferable and may not be shared with others</li>
                    </ul>

                    <h4 className="font-semibold mt-6">Account Security:</h4>
                    <ul className="space-y-2">
                      <li>You are responsible for maintaining the confidentiality of your login credentials</li>
                      <li>Use strong, unique passwords and enable two-factor authentication</li>
                      <li>Notify us immediately of any unauthorized access to your account</li>
                      <li>You are responsible for all activities that occur under your account</li>
                    </ul>

                    <h4 className="font-semibold mt-6">Identity Verification:</h4>
                    <ul className="space-y-2">
                      <li>We may require identity verification for certain services</li>
                      <li>Providing false identity information is grounds for account termination</li>
                      <li>Healthcare Providers may verify your identity before consultations</li>
                    </ul>
                  </div>
                </section>

                {/* Section 8: Payments & Billing */}
                <section id="payments" className="scroll-mt-32">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <CreditCard className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">8. Payments & Billing</h2>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <h4 className="font-semibold">Payment Terms:</h4>
                    <ul className="space-y-2">
                      <li>Payment is due at the time of service unless otherwise arranged</li>
                      <li>We accept major credit cards, debit cards, and other approved payment methods</li>
                      <li>All fees are displayed before service confirmation</li>
                      <li>Prices are subject to change with reasonable notice</li>
                    </ul>

                    <h4 className="font-semibold mt-6">Insurance:</h4>
                    <ul className="space-y-2">
                      <li>We accept certain insurance plans; check our website for accepted insurers</li>
                      <li>You are responsible for verifying your insurance coverage before using services</li>
                      <li>Copays, deductibles, and non-covered services are your responsibility</li>
                      <li>We may bill your insurance on your behalf where applicable</li>
                    </ul>

                    <h4 className="font-semibold mt-6">Refund Policy:</h4>
                    <ul className="space-y-2">
                      <li>Consultation fees may be refundable if service is not provided</li>
                      <li>Refunds are processed within 5-10 business days</li>
                      <li>Prescription medications are non-refundable once dispensed</li>
                      <li>Contact customer support for refund requests</li>
                    </ul>

                    <h4 className="font-semibold mt-6">Cancellation Policy:</h4>
                    <ul className="space-y-2">
                      <li>Appointments may be cancelled up to 2 hours before the scheduled time</li>
                      <li>Late cancellations may incur a fee</li>
                      <li>No-shows may be charged the full consultation fee</li>
                      <li>Repeated cancellations may affect your ability to book future appointments</li>
                    </ul>
                  </div>
                </section>

                {/* Section 9: Privacy & HIPAA */}
                <section id="privacy" className="scroll-mt-32">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Shield className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">9. Privacy & DPA Compliance</h2>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <p>
                      Your privacy is critically important to us. As a healthcare provider, we are committed 
                      to protecting your Sensitive Personal Data (SPD) in accordance with the Data Protection Principles Act (DPA) and other applicable privacy laws.
                    </p>

                    <div className="bg-green-50 border border-green-200 rounded-xl p-6 my-6">
                      <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        DPA Compliance
                      </h4>
                      <p className="text-green-800 text-sm">
                        Kiangombe Health Center is fully DPA compliant. We implement administrative, physical, and 
                        technical safeguards to protect your health information. All data is encrypted in 
                        transit and at rest using industry-standard encryption protocols.
                      </p>
                    </div>

                    <h4 className="font-semibold mt-6">Your Rights Under DPA:</h4>
                    <ul className="space-y-2">
                      <li>Right to access your medical records</li>
                      <li>Right to request amendments to your records</li>
                      <li>Right to an accounting of disclosures</li>
                      <li>Right to request restrictions on uses and disclosures</li>
                      <li>Right to receive confidential communications</li>
                      <li>Right to file a complaint if you believe your rights have been violated</li>
                    </ul>

                    <p className="mt-6">
                      For complete details on how we collect, use, and protect your information, please 
                      review our{' '}
                      <Link to="/privacy-policy" className="text-blue-600 hover:text-blue-700 font-medium">
                        Privacy Policy
                      </Link>
                      .
                    </p>
                  </div>
                </section>

                {/* Section 10: Intellectual Property */}
                <section id="intellectual" className="scroll-mt-32">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-violet-100 rounded-lg">
                      <Scale className="w-5 h-5 text-violet-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">10. Intellectual Property</h2>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <p>
                      All content, features, and functionality on our Platform, including but not limited to 
                      text, graphics, logos, icons, images, audio clips, software, and the compilation thereof, 
                      are the exclusive property of Kiangombe Health Center or our licensors and are protected by 
                      copyright, trademark, and other intellectual property laws.
                    </p>

                    <h4 className="font-semibold mt-6">You May NOT:</h4>
                    <ul className="space-y-2">
                      <li>Copy, reproduce, or distribute our content without permission</li>
                      <li>Modify, create derivative works, or reverse engineer our Platform</li>
                      <li>Use our trademarks without written consent</li>
                      <li>Remove or alter any proprietary notices or labels</li>
                      <li>Use automated systems to access or scrape our Platform</li>
                    </ul>

                    <h4 className="font-semibold mt-6">User-Generated Content:</h4>
                    <p>
                      Any content you submit to our Platform (reviews, feedback, etc.) grants us a 
                      non-exclusive, royalty-free, worldwide license to use, reproduce, and display 
                      such content for our business purposes.
                    </p>
                  </div>
                </section>

                {/* Section 11: Prohibited Activities */}
                <section id="prohibited" className="scroll-mt-32">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Ban className="w-5 h-5 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">11. Prohibited Activities</h2>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <p>You agree NOT to engage in any of the following prohibited activities:</p>

                    <div className="grid md:grid-cols-2 gap-4 my-6">
                      {[
                        'Providing false or misleading information',
                        'Impersonating another person or entity',
                        'Using the Platform for illegal purposes',
                        'Attempting to access other users\' accounts',
                        'Interfering with the Platform\'s operation',
                        'Uploading malware or harmful code',
                        'Harassing healthcare providers or staff',
                        'Seeking prescriptions under false pretenses',
                        'Sharing or selling prescription medications',
                        'Recording consultations without consent',
                        'Using the Platform while under the influence',
                        'Violating any applicable laws or regulations',
                      ].map((item, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2 p-3 bg-red-50 rounded-lg"
                        >
                          <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-red-800">{item}</span>
                        </div>
                      ))}
                    </div>

                    <p>
                      Violation of these prohibitions may result in immediate account termination, 
                      reporting to appropriate authorities, and potential legal action.
                    </p>
                  </div>
                </section>

                {/* Section 12: Disclaimers */}
                <section id="disclaimers" className="scroll-mt-32">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">12. Disclaimers</h2>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <div className="bg-gray-100 rounded-xl p-6 my-6 text-sm">
                      <p className="font-semibold mb-4">IMPORTANT DISCLAIMERS:</p>
                      
                      <p className="mb-4">
                        <strong>NO EMERGENCY SERVICES:</strong> Kiangombe Health Center does not provide emergency 
                        medical services. If you have a medical emergency, call 911 or go to your nearest 
                        emergency room.
                      </p>

                      <p className="mb-4">
                        <strong>NOT A REPLACEMENT FOR IN-PERSON CARE:</strong> Telemedicine services are 
                        not intended to replace your relationship with your primary care physician or 
                        specialist. Some conditions require in-person evaluation and treatment.
                      </p>

                      <p className="mb-4">
                        <strong>NO GUARANTEES:</strong> We do not guarantee that our Services will meet 
                        your requirements, that the Services will be uninterrupted, timely, secure, or 
                        error-free, or that any medical advice or treatment will be effective.
                      </p>

                      <p className="mb-4">
                        <strong>"AS IS" BASIS:</strong> The Platform is provided on an "as is" and 
                        "as available" basis without warranties of any kind, either express or implied.
                      </p>

                      <p>
                        <strong>MEDICAL DECISIONS:</strong> All medical decisions are made by licensed 
                        Healthcare Providers exercising independent medical judgment. Kiangombe Health Center does 
                        not practice medicine or provide medical advice.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 13: Limitation of Liability */}
                <section id="liability" className="scroll-mt-32">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Gavel className="w-5 h-5 text-orange-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">13. Limitation of Liability</h2>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <div className="bg-gray-100 rounded-xl p-6 my-6 text-sm">
                      <p className="mb-4">
                        TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL Kiangombe Health Center, ITS 
                        OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, 
                        INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT 
                        LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
                      </p>

                      <p className="mb-4">
                        OUR TOTAL LIABILITY FOR ANY CLAIMS ARISING FROM YOUR USE OF THE SERVICES SHALL 
                        NOT EXCEED THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS PRIOR TO THE CLAIM 
                        OR ONE HUNDRED DOLLARS ($100), WHICHEVER IS GREATER.
                      </p>

                      <p>
                        SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF CERTAIN WARRANTIES OR LIMITATION 
                        OF LIABILITY FOR CERTAIN TYPES OF DAMAGES. IN SUCH JURISDICTIONS, OUR LIABILITY 
                        SHALL BE LIMITED TO THE MAXIMUM EXTENT PERMITTED BY LAW.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 14: Termination */}
                <section id="termination" className="scroll-mt-32">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <RefreshCw className="w-5 h-5 text-gray-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">14. Termination</h2>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <h4 className="font-semibold">Termination by You:</h4>
                    <p>
                      You may terminate your account at any time by contacting us or using the account 
                      settings. Upon termination, you will no longer have access to your account, but 
                      we will retain your medical records as required by law.
                    </p>

                    <h4 className="font-semibold mt-6">Termination by Us:</h4>
                    <p>
                      We may suspend or terminate your account immediately, without prior notice, if:
                    </p>
                    <ul className="space-y-2">
                      <li>You violate any provision of these Terms</li>
                      <li>We are required to do so by law</li>
                      <li>We discontinue the Services</li>
                      <li>We reasonably believe your account has been compromised</li>
                      <li>You engage in fraudulent or abusive behavior</li>
                    </ul>

                    <h4 className="font-semibold mt-6">Effect of Termination:</h4>
                    <ul className="space-y-2">
                      <li>All licenses granted to you will terminate</li>
                      <li>You must cease all use of the Platform</li>
                      <li>Outstanding payments remain due</li>
                      <li>Provisions that should survive termination will remain in effect</li>
                    </ul>
                  </div>
                </section>

                {/* Section 15: Governing Law */}
                <section id="governing" className="scroll-mt-32">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Scale className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">15. Governing Law & Disputes</h2>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <p>
                      These Terms shall be governed by and construed in accordance with the laws of Kenya, without regard to its conflict of law provisions.
                    </p>

                    <h4 className="font-semibold mt-6">Dispute Resolution:</h4>
                    <p>
                      Any dispute arising from these Terms or your use of the Services shall be resolved 
                      through the following process:
                    </p>
                    <ol className="space-y-2">
                      <li>
                        <strong>Informal Resolution:</strong> Contact us first to attempt to resolve the 
                        dispute informally.
                      </li>
                      <li>
                        <strong>Mediation:</strong> If informal resolution fails, the parties agree to 
                        attempt mediation before a mutually agreed-upon mediator.
                      </li>
                      <li>
                        <strong>Arbitration:</strong> If mediation is unsuccessful, disputes shall be 
                        resolved through binding arbitration in Kiangombe , Kirinyaga-Kenya in accordance 
                        with the rules of the Kenya Arbitration Association.
                      </li>
                    </ol>

                    <p className="mt-6">
                      <strong>Class Action Waiver:</strong> You agree that any dispute resolution 
                      proceedings will be conducted on an individual basis and not as a class action, 
                      consolidated action, or representative action.
                    </p>
                  </div>
                </section>

                {/* Section 16: Changes to Terms */}
                <section id="changes" className="scroll-mt-32">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-teal-100 rounded-lg">
                      <ClipboardList className="w-5 h-5 text-teal-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">16. Changes to These Terms</h2>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <p>
                      We reserve the right to modify these Terms at any time. When we make changes, we will:
                    </p>
                    <ul className="space-y-2">
                      <li>Update the "Last Updated" date at the top of these Terms</li>
                      <li>Notify you via email or through the Platform for material changes</li>
                      <li>Post the revised Terms on our website</li>
                    </ul>

                    <p className="mt-6">
                      Your continued use of the Services after the effective date of the revised Terms 
                      constitutes your acceptance of the changes. If you do not agree to the new Terms, 
                      you must stop using the Services.
                    </p>

                    <p>
                      We encourage you to review these Terms periodically to stay informed about our 
                      requirements and any changes.
                    </p>
                  </div>
                </section>

                {/* Section 17: Contact Us */}
                <section id="contact" className="scroll-mt-32">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <MessageCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">17. Contact Us</h2>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <p>
                      If you have any questions about these Terms and Conditions, please contact us:
                    </p>

                    <div className="grid md:grid-cols-2 gap-6 my-6">
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h4 className="font-semibold text-gray-900 mb-4">General Inquiries</h4>
                        <div className="space-y-3">
                          <a
                            href="mailto:legal@Kiangombe Health Center.com"
                            className="flex items-center gap-3 text-blue-600 hover:text-blue-700"
                          >
                            <Mail className="w-5 h-5" />
                            legal@Kiangombe Health Center.com
                          </a>
                          <a
                            href="tel:1-800-HEALTH"
                            className="flex items-center gap-3 text-blue-600 hover:text-blue-700"
                          >
                            <Phone className="w-5 h-5" />
                            +254 758 991 776
                          </a>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-6">
                        <h4 className="font-semibold text-gray-900 mb-4">Mailing Address</h4>
                        <div className="flex items-start gap-3 text-gray-600">
                          <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                          <address className="not-italic">
                            Kiangombe Health Center, Inc.<br />
                            Legal Department<br />
                            Opposite Capital sacco<br />
                            Kirinyaga Town , Kenya 
                          </address>
                        </div>
                      </div>
                    </div>

                    <p>
                      For DPA-related inquiries or to file a privacy complaint, please contact our 
                      Privacy Officer at{' '}
                      <a href="mailto:privacy@Kiangombe Health Center.com" className="text-blue-600 hover:text-blue-700">
                        privacy@Kiangombe Health Center.com
                      </a>
                      .
                    </p>
                  </div>
                </section>

                {/* Acceptance Section */}
                <section className="border-t border-gray-200 pt-8 mt-12">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Acceptance of Terms
                    </h3>
                    <p className="text-gray-600 mb-6">
                      By using Kiangombe Health Center, you acknowledge that you have read, understood, and agree 
                      to be bound by these Terms and Conditions. If you are using our Services on behalf 
                      of an organization, you represent that you have the authority to bind that 
                      organization to these Terms.
                    </p>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">
                        I have read and agree to the Terms and Conditions and{' '}
                        <Link to="/privacy-policy" className="text-blue-600 hover:text-blue-700 font-medium">
                          Privacy Policy
                        </Link>
                        .
                      </span>
                    </label>

                    {acceptedTerms && (
                      <div className="mt-6 flex items-center gap-3 text-green-600">
                        <CheckCircle className="w-6 h-6" />
                        <span className="font-medium">Thank you for accepting our Terms.</span>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </div>

            {/* Related Links */}
            <div className="mt-8 grid md:grid-cols-3 gap-4">
              <Link
                to="/privacy-policy"
                className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow flex items-center gap-4"
              >
                <div className="p-3 bg-green-100 rounded-xl">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Privacy Policy</h3>
                  <p className="text-sm text-gray-500">Learn how we protect your data</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
              </Link>

              <Link
                to="/help"
                className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow flex items-center gap-4"
              >
                <div className="p-3 bg-blue-100 rounded-xl">
                  <HelpCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Help Center</h3>
                  <p className="text-sm text-gray-500">Get answers to common questions</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
              </Link>

              <Link
                to="/contact"
                className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow flex items-center gap-4"
              >
                <div className="p-3 bg-purple-100 rounded-xl">
                  <MessageCircle className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Contact Us</h3>
                  <p className="text-sm text-gray-500">Reach our support team</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
              </Link>
            </div>
          </main>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all z-50 animate-bounce"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default TermsAndConditionsPage;