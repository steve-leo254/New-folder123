import React, { useState } from 'react';
import { Search, Star, Eye, Edit, Trash2, UserPlus, MapPin, Calendar, Video } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { StaffMember } from '../../types';

interface StaffMembersProps {
  staff: StaffMember[];
  viewMode?: 'table' | 'cards';
  showActions?: boolean;
  showFilters?: boolean;
  showSearch?: boolean;
  title?: string;
  onStaffClick?: (staff: StaffMember) => void;
  onEdit?: (staff: StaffMember) => void;
  onDelete?: (staff: StaffMember) => void;
  onView?: (staff: StaffMember) => void;
  onBookAppointment?: (staff: StaffMember) => void;
  className?: string;
}

const StaffMembers: React.FC<StaffMembersProps> = ({
  staff = [],
  viewMode = 'table',
  showActions = true,
  showFilters = true,
  showSearch = true,
  title = 'Staff Members',
  onStaffClick,
  onEdit,
  onDelete,
  onView,
  onBookAppointment,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Get unique roles and specializations for filters
  const roles = Array.from(new Set(staff.map(member => member.role).filter(Boolean)));
  const specializations = Array.from(new Set(staff.map(member => member.specialization).filter(Boolean)));

  const filteredStaff = staff.filter(member => {
    const searchFields = [
      member.name,
      member.firstName,
      member.lastName,
      member.role,
      member.specialization
    ].filter(Boolean).join(' ').toLowerCase();

    const matchesSearch = searchFields.includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || member.role.toLowerCase().includes(selectedRole.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || member.status === selectedStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getFullName = (member: StaffMember) => {
    if (member.name) return member.name;
    if (member.firstName && member.lastName) return `${member.firstName} ${member.lastName}`;
    return member.firstName || member.lastName || 'Unknown';
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'on-leave':
        return <Badge variant="warning">On Leave</Badge>;
      case 'inactive':
        return <Badge variant="error">Inactive</Badge>;
      default:
        return <Badge variant="default">Unknown</Badge>;
    }
  };

  const handleAction = (action: string, member: StaffMember, e: React.MouseEvent) => {
    e.stopPropagation();
    switch (action) {
      case 'view':
        onView?.(member);
        break;
      case 'edit':
        onEdit?.(member);
        break;
      case 'delete':
        onDelete?.(member);
        break;
    }
  };

  if (viewMode === 'cards') {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Header and Filters */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            {showActions && (
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Staff
              </Button>
            )}
          </div>

          {(showSearch || showFilters) && (
            <Card className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                {showSearch && (
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search staff members..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                )}
                
                {showFilters && (
                  <>
                    <select
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                    >
                      <option value="all">All Roles</option>
                      {roles.map(role => (
                        <option key={role} value={role.toLowerCase()}>
                          {role}
                        </option>
                      ))}
                    </select>

                    <select
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="on-leave">On Leave</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Staff Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.map((member) => (
            <div 
              key={member.id} 
              className="cursor-pointer"
              onClick={() => onStaffClick?.(member)}
            >
              <Card className="overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative">
                  <img
                    src={member.avatar || '/images/default-avatar.jpg'}
                    alt={getFullName(member)}
                    className="w-full h-48 object-cover"
                  />
                  {member.specialization && (
                    <Badge variant="primary" className="absolute top-4 right-4">
                      {member.specialization}
                    </Badge>
                  )}
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {member.role === 'Doctor' ? 'Dr. ' : ''}{getFullName(member)}
                  </h3>
                  {member.bio && (
                    <p className="text-gray-600 mb-4">{member.bio}</p>
                  )}
                  
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            member.rating && i < Math.floor(member.rating) ? 'fill-current' : ''
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">{member.rating || '0.0'}</span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      Nairobi, Kenya
                    </div>
                    {member.experience && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {member.experience} years experience
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-600">
                      <Video className="w-4 h-4 mr-2" />
                      Available for video consultation
                    </div>
                  </div>
                  
                  {member.consultationFee && member.consultationFee > 0 && (
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-primary-600">
                        KSH {member.consultationFee.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-600">per consultation</span>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    {onBookAppointment && (
                      <Button 
                        className="flex-1"
                        onClick={() => onBookAppointment(member)}
                      >
                        Book Appointment
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onView?.(member)}
                    >
                      View Profile
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>

        {filteredStaff.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No staff members found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    );
  }

  // Table view
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header and Filters */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {showActions && (
          <Button>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Staff
          </Button>
        )}
      </div>

      {(showSearch || showFilters) && (
        <Card className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {showSearch && (
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search staff members..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            )}
            
            {showFilters && (
              <>
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  {roles.map(role => (
                    <option key={role} value={role.toLowerCase()}>
                      {role}
                    </option>
                  ))}
                </select>

                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="on-leave">On Leave</option>
                  <option value="inactive">Inactive</option>
                </select>
              </>
            )}
          </div>
        </Card>
      )}

      {/* Staff Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                {specializations.length > 0 && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patients</th>
                {showActions && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStaff.map((member) => (
                <tr 
                  key={member.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onStaffClick?.(member)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img 
                        className="h-10 w-10 rounded-full" 
                        src={member.avatar || '/images/default-avatar.jpg'} 
                        alt={getFullName(member)} 
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{getFullName(member)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{member.role}</div>
                  </td>
                  {specializations.length > 0 && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.specialization || '-'}</div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(member.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {member.rating && (
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-sm text-gray-900">{member.rating}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {member.patients !== undefined ? member.patients : '-'}
                  </td>
                  {showActions && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={(e) => handleAction('view', member, e)}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={(e) => handleAction('edit', member, e)}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900"
                          onClick={(e) => handleAction('delete', member, e)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {filteredStaff.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No staff members found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default StaffMembers;
