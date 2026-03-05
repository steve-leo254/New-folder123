import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Users, Search } from 'lucide-react';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading staff roles...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert type="error" message={error} />
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Roles</h1>
          <p className="text-gray-600">Create and manage staff roles for your healthcare center</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Role
        </Button>
      </div>

      {/* Action Error */}
      {actionError && (
        <Alert type="error" message={actionError} onClose={() => setActionError(null)} />
      )}

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <Input
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="rounded text-primary-600 focus:ring-primary-500"
          />
          <span className="ml-2 text-sm text-gray-700">Show inactive roles</span>
        </label>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoles.map((role) => (
          <Card key={role.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary-600" />
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold text-gray-900">{role.name}</h3>
                  <Badge variant={role.isActive ? 'success' : 'secondary'}>
                    {role.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditModal(role)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openDeleteModal(role)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <p className="text-gray-600 text-sm mb-4">{role.description}</p>
            
            <div className="space-y-2">
              {role.requiresSpecialization && (
                <div className="text-xs text-gray-500">• Requires specialization</div>
              )}
              {role.requiresLicense && (
                <div className="text-xs text-gray-500">• Requires professional license</div>
              )}
              {role.defaultConsultationFee && role.defaultConsultationFee > 0 && (
                <div className="text-xs text-gray-500">
                  • Default fee: {formatCurrency(role.defaultConsultationFee)}
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                Created: {new Date(role.createdAt).toLocaleDateString()}
              </span>
              {role.customizable && (
                <Badge variant="primary">Customizable</Badge>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredRoles.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No roles found</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try adjusting your search terms.' : 'Create your first staff role to get started.'}
          </p>
        </div>
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
      >
        <div className="space-y-4">
          <Alert type="warning" message={`Are you sure you want to delete the role "${deletingRole?.name}"? This action cannot be undone.`} />
          
          {deletingRole && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">{deletingRole.name}</h4>
              <p className="text-sm text-gray-600">{deletingRole.description}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeletingRole(undefined);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
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
