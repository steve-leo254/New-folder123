import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useLogout } from "../hooks/useLogout";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Calendar,
  Pill,
  Video,
  DollarSign,
  Activity,
  AlertCircle,
  Clock,
  UserPlus,
  UserCheck,
  Settings,
  Download,
  Filter,
  Database,
  Bell,
  Shield,
} from "lucide-react";
import DropdownMenu from "../components/ui/DropdownMenu";
import Card from "../components/ui/Card";
import { formatCurrency } from "@/services/formatCurrency";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import StaffMembers from "../components/features/StaffMembers";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { StaffMember } from "../types";
import { useStaff } from "../services/useStaff";
import { useDashboardSummary } from "../services/useDashboardSummary";
import { useAppointments } from "../services/useAppointment";
import { useMedications } from "../services/useMedication";
import { useBilling } from "../services/useBilling";
import AddUserModal from "../components/modals/AddUserModal";
import AddStaffModal from "../components/modals/AddStaffModal";
import BookAppointmentModal from "../components/modals/BookAppointmentModal";
import AddMedicationModal from "../components/modals/AddMedicationModal";
import RoleManagementPage from "./RoleManagementPage";
import Alert from "../components/ui/Alert";
import { apiService } from "../services/api";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
  Area,
  AreaChart,
} from "recharts";

const SuperDashboardPage: React.FC = () => {
  const handleLogout = useLogout();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isBookAppointmentOpen, setIsBookAppointmentOpen] = useState(false);
  const [isMedicationModalOpen, setIsMedicationModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const {
    summary,
    loading: summaryLoading,
    error: summaryError,
    refreshSummary,
  } = useDashboardSummary();
  const { staff, loading: staffLoading, fetchStaff } = useStaff();
  const {
    appointments,
    isLoading: appointmentsLoading,
    fetchAppointments,
    createAppointment,
  } = useAppointments();

  // Debug: Log appointments for SuperAdmin
  console.log('SuperAdmin appointments:', appointments);
  console.log('SuperAdmin appointmentsLoading:', appointmentsLoading);
  const {
    medications,
    isLoading: medicationsLoading,
    fetchMedications,
  } = useMedications();
  const {
    billings,
    isLoading: billingsLoading,
    fetchBillings,
    calculateStats,
  } = useBilling();

  const revenueData = [
    { name: "Jan", revenue: 12500, appointments: 120, patients: 45 },
    { name: "Feb", revenue: 15200, appointments: 145, patients: 52 },
    { name: "Mar", revenue: 18500, appointments: 165, patients: 61 },
    { name: "Apr", revenue: 17200, appointments: 158, patients: 58 },
    { name: "May", revenue: 21400, appointments: 189, patients: 72 },
    { name: "Jun", revenue: 23800, appointments: 210, patients: 85 },
  ];

  // Dynamic department data based on staff specializations
  const departmentData = useMemo(() => {
    const departmentCounts: { [key: string]: number } = {};
    
    // Count doctors by specialization
    staff.forEach(staffMember => {
      if (staffMember.role === 'doctor' && staffMember.doctor?.specialization) {
        const specialization = staffMember.doctor.specialization;
        departmentCounts[specialization] = (departmentCounts[specialization] || 0) + 1;
      }
    });

    // Convert to array format and add colors
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];
    const departments = Object.entries(departmentCounts).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    }));

    // If no departments found, show default data
    if (departments.length === 0) {
      return [
        { name: "Cardiology", value: 35, color: "#3b82f6" },
        { name: "Pediatrics", value: 25, color: "#10b981" },
        { name: "Dermatology", value: 20, color: "#f59e0b" },
        { name: "Orthopedics", value: 15, color: "#ef4444" },
        { name: "Other", value: 5, color: "#8b5cf6" },
      ];
    }

    return departments;
  }, [staff]);

  const userActivityData = [
    { time: "00:00", activeUsers: 12 },
    { time: "04:00", activeUsers: 8 },
    { time: "08:00", activeUsers: 45 },
    { time: "12:00", activeUsers: 78 },
    { time: "16:00", activeUsers: 65 },
    { time: "20:00", activeUsers: 32 },
    { time: "23:59", activeUsers: 18 },
  ];

  const systemHealth = {
    serverUptime: "99.9%",
    responseTime: "124ms",
    errorRate: "0.1%",
    activeConnections: 342,
    databaseStatus: "healthy",
    apiStatus: "operational",
  };

  const recentActivities = [
    {
      id: 1,
      user: "Dr. Sarah Johnson",
      action: "Completed video consultation",
      time: "2 minutes ago",
      type: "appointment",
    },
    {
      id: 2,
      user: "John Doe",
      action: "Registered new account",
      time: "15 minutes ago",
      type: "user",
    },
    {
      id: 3,
      user: "System",
      action: "Automated backup completed",
      time: "1 hour ago",
      type: "system",
    },
    {
      id: 4,
      user: "Dr. Michael Chen",
      action: "Updated availability schedule",
      time: "2 hours ago",
      type: "doctor",
    },
    {
      id: 5,
      user: "Grace Wanjiru",
      action: "Ordered prescription medication",
      time: "3 hours ago",
      type: "medication",
    },
  ];

  const topMedications = [
    {
      id: 1,
      name: "Amoxicillin",
      category: "Antibiotics",
      sales: 342,
      revenue: 8550,
      stock: 245,
    },
    {
      id: 2,
      name: "Ibuprofen",
      category: "Pain Relief",
      sales: 287,
      revenue: 4305,
      stock: 182,
    },
    {
      id: 3,
      name: "Vitamin D3",
      category: "Supplements",
      sales: 198,
      revenue: 3960,
      stock: 156,
    },
    {
      id: 4,
      name: "Lisinopril",
      category: "Heart Health",
      sales: 176,
      revenue: 5280,
      stock: 89,
    },
    {
      id: 5,
      name: "Omeprazole",
      category: "Digestive Health",
      sales: 143,
      revenue: 2860,
      stock: 67,
    },
  ];

  const userRoles = [
    {
      id: 1,
      role: "Super Admin",
      count: 2,
      permissions: [
        "Full System Access",
        "User Management",
        "Billing",
        "Reports",
      ],
    },
    {
      id: 2,
      role: "Admin",
      count: 5,
      permissions: ["User Management", "Appointment Management", "Reports"],
    },
    {
      id: 3,
      role: "Doctor",
      count: 25,
      permissions: ["Patient Records", "Prescriptions", "Appointments"],
    },
    {
      id: 4,
      role: "Nurse",
      count: 18,
      permissions: ["Patient Records", "Vitals", "Medication Administration"],
    },
    {
      id: 5,
      role: "Pharmacist",
      count: 6,
      permissions: ["Medication Dispensing", "Inventory Management"],
    },
    {
      id: 6,
      role: "Patient",
      count: 1250,
      permissions: ["Book Appointments", "View Records", "Order Medications"],
    },
  ];

  useEffect(() => {
    refreshSummary();
    fetchAppointments();
    fetchMedications();
    fetchBillings();
  }, [refreshSummary, fetchAppointments, fetchMedications, fetchBillings]);

  useEffect(() => {
    fetchStaff();
  }, []);

  // Real-time update for department data - refresh staff data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStaff();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [fetchStaff]);

  const staffMembers: StaffMember[] = useMemo(
    () =>
      staff.map((staffMember) => ({
        id: staffMember.id,
        name: staffMember.fullName,
        role: staffMember.role,
        specialization: staffMember.doctor?.specialization || '',
        status: staffMember.doctor?.isAvailable ? "active" : "inactive",
        rating: staffMember.doctor?.rating || 0,
        patients: staffMember.patientsCount,
        avatar: staffMember.avatar ? `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${staffMember.avatar}` : "/images/doctor1.jpg",
        bio: staffMember.doctor?.bio || '',
        consultationFee: staffMember.doctor?.consultationFee || 0,
      })),
    [staff]
  );

  const overviewStats = [
    {
      label: "Registered Users",
      value: summary?.users ?? 0,
      icon: Users,
      color: "bg-blue-100",
      iconColor: "text-blue-600",
      helper: "Total platform users",
    },
    {
      label: "Appointments",
      value: summary?.appointments ?? 0,
      icon: Calendar,
      color: "bg-purple-100",
      iconColor: "text-purple-600",
      helper: "All recorded appointments",
    },
    {
      label: "Prescriptions",
      value: summary?.prescriptions ?? 0,
      icon: Pill,
      color: "bg-green-100",
      iconColor: "text-green-600",
      helper: "Total prescriptions issued",
    },
    {
      label: "Upcoming Visits",
      value: summary?.upcoming ?? 0,
      icon: Clock,
      color: "bg-orange-100",
      iconColor: "text-orange-600",
      helper: "Scheduled appointments",
    },
  ];

  const formatNumber = (value: number | null | undefined) =>
    new Intl.NumberFormat().format(value ?? 0);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "appointment":
        return <Calendar className="w-4 h-4" />;
      case "user":
        return <UserPlus className="w-4 h-4" />;
      case "system":
        return <Database className="w-4 h-4" />;
      case "doctor":
        return <UserCheck className="w-4 h-4" />;
      case "medication":
        return <Pill className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "appointment":
        return "bg-blue-100 text-blue-600";
      case "user":
        return "bg-green-100 text-green-600";
      case "system":
        return "bg-purple-100 text-purple-600";
      case "doctor":
        return "bg-yellow-100 text-yellow-600";
      case "medication":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <Alert
            type={toast.type === "success" ? "info" : "error"}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        </div>
      )}
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Super Admin Dashboard
              </h1>
              <p className="text-sm text-gray-500">
                Kiangombe Health Center Management System
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <div className="relative">
                <Bell className="w-6 h-6 text-gray-600 cursor-pointer" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </div>
              <div className="flex items-center space-x-4">
                <DropdownMenu
                  userName="Admin User"
                  userRole="Super Admin"
                  onProfileClick={() => navigate("/profile")}
                  onLogoutClick={handleLogout}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              "overview",
              "users",
              "appointments",
              "medications",
              "billing",
              "roles",
              "system",
            ].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* KPI Cards */}
            {summaryLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {overviewStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * (index + 1) }}
                    >
                      <Card className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">
                              {stat.label}
                            </p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                              {formatNumber(stat.value)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {stat.helper}
                            </p>
                          </div>
                          <div
                            className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}
                          >
                            <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
            {summaryError && (
              <p className="text-sm text-red-600">
                Unable to load live metrics: {summaryError}
              </p>
            )}

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Revenue & Appointments
                  </h2>
                  <select
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                  >
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                    <option value="year">Last Year</option>
                  </select>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                      name="Revenue ($)"
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="appointments"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.6}
                      name="Appointments"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Department Distribution
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <RePieChart>
                    <Pie
                      data={departmentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent = 0 }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {departmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* User Activity Chart */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                User Activity
              </h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={userActivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="activeUsers"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* System Health & Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  System Health
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Server Uptime</span>
                    <Badge variant="success">{systemHealth.serverUptime}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Response Time</span>
                    <span className="text-sm font-medium">
                      {systemHealth.responseTime}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Error Rate</span>
                    <span className="text-sm font-medium">
                      {systemHealth.errorRate}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Active Connections
                    </span>
                    <span className="text-sm font-medium">
                      {systemHealth.activeConnections}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Database Status
                    </span>
                    <Badge variant="success">
                      {systemHealth.databaseStatus}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">API Status</span>
                    <Badge variant="success">{systemHealth.apiStatus}</Badge>
                  </div>
                </div>
              </Card>

              <Card className="p-6 lg:col-span-2">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Activities
                </h2>
                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-3"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(
                          activity.type
                        )}`}
                      >
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{activity.user}</span>{" "}
                          {activity.action}
                        </p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                User Management
              </h2>
              <Button onClick={() => setIsStaffModalOpen(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>

            {/* User Roles Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userRoles.map((role) => (
                <Card key={role.id} className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-gray-900">{role.role}</h3>
                    <Badge variant="secondary">{role.count}</Badge>
                  </div>
                  <div className="space-y-1">
                    {role.permissions.slice(0, 2).map((permission, index) => (
                      <p key={index} className="text-xs text-gray-600">
                        • {permission}
                      </p>
                    ))}
                    {role.permissions.length > 2 && (
                      <p className="text-xs text-gray-500">
                        +{role.permissions.length - 2} more
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Staff Members
              </h3>
            </div>
            {staffLoading ? (
              <Card className="p-6 flex items-center justify-center">
                <LoadingSpinner />
              </Card>
            ) : staffMembers.length ? (
              <StaffMembers
                staff={staffMembers}
                viewMode="table"
                showActions={false}
                showFilters
                showSearch
                title=""
                className="space-y-6"
              />
            ) : (
              <Card className="p-6">
                <p className="text-sm text-gray-500 text-center">
                  No staff members available yet. Add a staff account to get
                  started.
                </p>
              </Card>
            )}
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === "appointments" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Appointment Management
              </h2>
              <div className="flex space-x-2">
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button onClick={() => setIsBookAppointmentOpen(true)}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Appointment
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">
                    Total Appointments
                  </h3>
                  <Calendar className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {appointments.length}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  All recorded appointments
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">
                    Scheduled
                  </h3>
                  <Clock className="w-5 h-5 text-yellow-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {appointments.filter((a) => a.status === "scheduled").length}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Upcoming appointments
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">
                    Completed
                  </h3>
                  <Video className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {appointments.filter((a) => a.status === "completed").length}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Finished consultations
                </p>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Appointments
              </h3>
              {appointmentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : appointments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Patient
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Doctor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Payment
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {appointments.slice(0, 10).map((appointment) => (
                        <tr key={appointment.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {appointment.patientName || "Patient"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {appointment.doctorName || "Doctor"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {appointment.date}
                            </div>
                            <div className="text-sm text-gray-500">
                              {appointment.time}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                              variant={
                                appointment.type === "video"
                                  ? "primary"
                                  : "default"
                              }
                            >
                              {appointment.type === "video"
                                ? "Video"
                                : "In-Person"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                              variant={
                                appointment.status === "completed"
                                  ? "success"
                                  : appointment.status === "cancelled"
                                  ? "error"
                                  : "warning"
                              }
                            >
                              {appointment.status.charAt(0).toUpperCase() +
                                appointment.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                              variant={
                                appointment.paymentStatus === "paid"
                                  ? "success"
                                  : "warning"
                              }
                            >
                              {appointment.paymentStatus
                                .charAt(0)
                                .toUpperCase() +
                                appointment.paymentStatus.slice(1)}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">
                  No appointments found
                </p>
              )}
            </Card>
          </div>
        )}

        {/* Medications Tab */}
        {activeTab === "medications" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Medication Management
              </h2>
              <Button onClick={() => setIsMedicationModalOpen(true)}>
                <Pill className="w-4 h-4 mr-2" />
                Add Medication
              </Button>
            </div>

            {medicationsLoading ? (
              <Card className="p-12 flex items-center justify-center">
                <LoadingSpinner />
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-600">
                        Total Medications
                      </h3>
                      <Pill className="w-5 h-5 text-blue-500" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {medications.length}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      +{Math.floor(medications.length * 0.035)} new this month
                    </p>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-600">
                        Low Stock Items
                      </h3>
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {medications.filter((m) => m.stock < 100).length}
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">
                      Requires reorder
                    </p>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-600">
                        Expiring Soon
                      </h3>
                      <Clock className="w-5 h-5 text-red-500" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {
                        medications.filter((m) => {
                          if (!m.expiryDate) return false;
                          const expiry = new Date(m.expiryDate);
                          const today = new Date();
                          const daysUntilExpiry =
                            (expiry.getTime() - today.getTime()) /
                            (1000 * 60 * 60 * 24);
                          return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
                        }).length
                      }
                    </p>
                    <p className="text-xs text-red-600 mt-1">Within 30 days</p>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-600">
                        Monthly Sales
                      </h3>
                      <DollarSign className="w-5 h-5 text-green-500" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(
                        Number(
                          medications
                            .reduce(
                              (sum, m) => sum + (Number(m.price) * Math.max(1, Math.floor(m.stock * 0.15))), // Estimate 15% of stock sold
                              0
                            )
                            .toFixed(0)
                        )
                      )}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      +{Math.floor(Math.random() * 20 + 5)}% from last month
                    </p>
                  </Card>
                </div>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Top Medications
                  </h3>
                  {medications.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Medication
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Category
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Stock
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {medications.slice(0, 5).map((medication) => (
                            <tr key={medication.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {medication.name}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {medication.category}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {formatCurrency(Number(medication.price))}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {medication.stock}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge
                                  variant={
                                    medication.stock < 100
                                      ? "warning"
                                      : "success"
                                  }
                                >
                                  {medication.stock < 100
                                    ? "Low Stock"
                                    : "In Stock"}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">
                      No medications available
                    </p>
                  )}
                </Card>
              </>
            )}
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === "billing" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Billing & Revenue
              </h2>
              <div className="flex space-x-2">
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
                <Button>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Generate Invoice
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">
                    Total Revenue
                  </h3>
                  <DollarSign className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">Ksh 108,600</p>
                <p className="text-xs text-green-600 mt-1">
                  +12% from last month
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">
                    Pending Payments
                  </h3>
                  <Clock className="w-5 h-5 text-yellow-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">Ksh 8,450</p>
                <p className="text-xs text-yellow-600 mt-1">12 invoices</p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">
                    Overdue Payments
                  </h3>
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">Ksh 2,350</p>
                <p className="text-xs text-red-600 mt-1">5 invoices</p>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Transactions
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          #INV001234
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">John Doe</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          Cardiology Consultation
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Ksh 150</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          Jan 15, 2024
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="success">Paid</Badge>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          #INV001235
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Jane Smith</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          Prescription Medication
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Ksh 85</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          Jan 14, 2024
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="warning">Pending</Badge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Roles Tab */}
        {activeTab === "roles" && (
          <div className="space-y-6">
            <RoleManagementPage />
          </div>
        )}

        {/* System Tab */}
        {activeTab === "system" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                System Administration
              </h2>
              <Button>
                <Settings className="w-4 h-4 mr-2" />
                System Settings
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  System Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      System Version
                    </span>
                    <span className="text-sm font-medium">v2.4.1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Last Updated</span>
                    <span className="text-sm font-medium">Dec 17, 2025</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Database Version
                    </span>
                    <span className="text-sm font-medium">MySQL </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">API Version</span>
                    <span className="text-sm font-medium">v1.3.2</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">License</span>
                    <span className="text-sm font-medium">Steve-oh</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  System Health
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">CPU Usage</span>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: "35%" }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">35%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Memory Usage</span>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{ width: "68%" }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">68%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Disk Usage</span>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: "42%" }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">42%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Network</span>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: "15%" }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">15%</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                System Logs
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      Database backup completed successfully
                    </p>
                    <p className="text-xs text-gray-500">2025-12-15 03:00:12</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      High memory usage detected on server-02
                    </p>
                    <p className="text-xs text-gray-500">2025-12-15 02:45:33</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      System update available: v2.4.2
                    </p>
                    <p className="text-xs text-gray-500">2025-12-14 18:20:15</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      Failed login attempt from IP 192.168.1.105
                    </p>
                    <p className="text-xs text-gray-500">2025-12-14 15:12:08</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      <AddUserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSubmit={async (payload) => {
          await apiService.createPatientUser(payload);
          setToast({ type: "success", message: "User created successfully" });
          refreshSummary();
        }}
      />
      <AddStaffModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        onSubmit={async ({ account, profile }) => {
          const token = localStorage.getItem('token');
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/staff`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              account,
              profile,
            }),
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || 'Failed to create staff member');
          }
          
          setToast({
            type: "success",
            message: "Staff member created successfully",
          });
          fetchStaff();
          refreshSummary();
        }}
      />
      <BookAppointmentModal
        isOpen={isBookAppointmentOpen}
        onClose={() => {
          setIsBookAppointmentOpen(false);
          setSelectedDoctor(null);
        }}
        doctor={
          selectedDoctor || (staffMembers.length > 0 ? staffMembers[0] : null)
        }
        onSubmit={async (appointmentData) => {
          try {
            // Map old field names to new expected field names
            const mappedData = {
              patient_id: appointmentData.patient_id,
              clinician_id: appointmentData.doctor_id,
              visit_type: appointmentData.type,
              scheduled_at: `${appointmentData.date}T${appointmentData.time}:00`,
              triage_notes: appointmentData.notes,
            };
            await createAppointment(mappedData);
            setToast({
              type: "success",
              message: "Appointment booked successfully",
            });
            fetchAppointments();
            refreshSummary();
            setIsBookAppointmentOpen(false);
            setSelectedDoctor(null);
          } catch (error: any) {
            setToast({
              type: "error",
              message:
                error.response?.data?.detail || "Failed to book appointment",
            });
          }
        }}
      />
      <AddMedicationModal
        isOpen={isMedicationModalOpen}
        onClose={() => setIsMedicationModalOpen(false)}
        onSubmit={async (medicationData) => {
          try {
            await apiService.createMedication(medicationData);
            setToast({
              type: "success",
              message: "Medication added successfully",
            });
            fetchMedications();
            refreshSummary();
            setIsMedicationModalOpen(false);
          } catch (error: any) {
            setToast({
              type: "error",
              message:
                error.response?.data?.detail || "Failed to add medication",
            });
          }
        }}
      />
    </div>
  );
};

export default SuperDashboardPage;
