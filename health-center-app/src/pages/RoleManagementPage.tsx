import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Users, Settings, Search } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Alert from '../components/ui/Alert';
import Modal from '../components/ui/Modal';
import AddRoleModal from '../components/modals/AddRoleModal';
import Input from '../components/ui/Input';
import { useStaffRoles } from '../services/useStaffRoles';
import { formatCurrency } from '../services/formatCurrency';
import { StaffRole } from '../types';

const RoleManagementPage: React.FC = () => {
  const { roles, loading, error, createRole, updateRole, deleteRole } = useStaffRoles();
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<StaffRole | undefined>();
  const [deletingRole, setDeletingRole] = useState<StaffRole | undefined>();
  const [actionError, setActionError] = useState<string | null>(null);

  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = showInactive || role.isActive;
    return matchesSearch && matchesStatus;
  });

  const handleAddRole = async (roleData: Omit<StaffRole, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createRole(roleData);
      setIsAddModalOpen(false);
    } catch (err: any) {
      setActionError(err.message || 'Failed to create role');
    }
  };

  const handleEditRole = async (roleData: Omit<StaffRole, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingRole) return;
    
    try {
      await updateRole(editingRole.id, roleData);
      setIsAddModalOpen(false);
      setEditingRole(undefined);
    } catch (err: any) {
      setActionError(err.message || 'Failed to update role');
    }
  };

  const handleDeleteRole = async () => {
    if (!deletingRole) return;
    
    try {
      await deleteRole(deletingRole.id);
      setIsDeleteModalOpen(false);
      setDeletingRole(undefined);
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete role');
    }
  };

  const openEditModal = (role: StaffRole) => {
    setEditingRole(role);
    setIsAddModalOpen(true);
  };

  const openDeleteModal = (role: StaffRole) => {
    setDeletingRole(role);
    setIsDeleteModalOpen(true);
  };

  const getPermissionBadge = (permissionId: string) => {
    const permissionLabels: Record<string, string> = {
      'view_patients': 'View Patients',
      'create_appointments': 'Create Appointments',
      'manage_schedule': 'Manage Schedule',
      'prescribe_medication': 'Prescribe',
      'view_medical_records': 'Medical Records',
      'update_vitals': 'Update Vitals',
      'assist_procedures': 'Assist Procedures',
      'view_test_requests': 'View Tests',
      'conduct_tests': 'Conduct Tests',
      'update_results': 'Update Results',
      'view_prescriptions': 'View Prescriptions',
      'dispense_medication': 'Dispense',
      'manage_inventory': 'Inventory',
      'patient_registration': 'Registration',
      'billing_management': 'Billing',
      'staff_management': 'Staff Mgmt',
      'system_administration': 'System Admin'
    };
    
    return permissionLabels[permissionId] || permissionId;
  };

  if (loading && roles.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading roles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
          <p className="text-gray-600 mt-1">Manage staff roles and their permissions</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Role
        </Button>
      </div>

      {/* Alerts */}
      {actionError && (
        <Alert
          type="error"
          message={actionError}
          onClose={() => setActionError(null)}
        />
      )}

      {error && (
        <Alert
          type="error"
          message={`Failed to load roles: ${error}`}
        />
      )}

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showInactive"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="showInactive" className="text-sm text-gray-700">
              Show inactive roles
            </label>
          </div>
        </div>
      </Card>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoles.map((role) => (
          <Card key={role.id} className="hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{role.name}</h3>
                    <Badge variant={role.isActive ? 'success' : 'secondary'}>
                      {role.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(role)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDeleteModal(role)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 line-clamp-2">{role.description}</p>

              {/* Requirements */}
              <div className="flex flex-wrap gap-2">
                {role.requiresSpecialization && (
                  <Badge variant="secondary">Specialization Required</Badge>
                )}
                {role.requiresLicense && (
                  <Badge variant="secondary">License Required</Badge>
                )}
                {role.defaultConsultationFee && (
                  <Badge variant="secondary">
                    Default Fee: {formatCurrency(role.defaultConsultationFee)}
                  </Badge>
                )}
              </div>

              {/* Permissions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Permissions</span>
                  <span className="text-xs text-gray-500">{role.permissions.length}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.slice(0, 3).map((permission) => (
                    <Badge variant="secondary">
                      {getPermissionBadge(permission)}
                    </Badge>
                  ))}
                  {role.permissions.length > 3 && (
                    <Badge variant="secondary">
                      +{role.permissions.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredRoles.length === 0 && !loading && (
        <Card className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No roles found' : 'No roles configured'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? 'Try adjusting your search terms or filters.'
              : 'Get started by creating your first staff role.'
            }
          </p>
          {!searchTerm && (
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Role
            </Button>
          )}
        </Card>
      )}

      {/* Add/Edit Role Modal */}
      <AddRoleModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingRole(undefined);
        }}
        onSubmit={editingRole ? handleEditRole : handleAddRole}
        editingRole={editingRole}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingRole(undefined);
        }}
        title="Delete Role"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete the role <strong>{deletingRole?.name}</strong>? 
            This action cannot be undone.
          </p>
          
          {deletingRole && (
            <Alert type="warning" message="Staff members with this role may need to be reassigned." />
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeletingRole(undefined);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleDeleteRole}
            >
              Delete Role
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RoleManagementPage;
