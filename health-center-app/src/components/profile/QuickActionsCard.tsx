import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Download, FileText } from 'lucide-react';
import Card from '../ui/Card';

interface QuickActionsCardProps {
  onChangePassword: () => void;
  onDownloadRecords: () => void;
  onExportData: () => void;
}

export const QuickActionsCard: React.FC<QuickActionsCardProps> = ({
  onChangePassword,
  onDownloadRecords,
  onExportData,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <button
            onClick={onChangePassword}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 flex items-center justify-start transition-colors"
          >
            <Lock className="h-4 w-4 mr-2" />
            Change Password
          </button>
          <button
            onClick={onDownloadRecords}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 flex items-center justify-start transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Records
          </button>
          <button
            onClick={onExportData}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 flex items-center justify-start transition-colors"
          >
            <FileText className="h-4 w-4 mr-2" />
            Export Data
          </button>
        </div>
      </Card>
    </motion.div>
  );
};
