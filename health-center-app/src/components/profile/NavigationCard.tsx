import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import Card from '../ui/Card';

interface Section {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavigationCardProps {
  sections: Section[];
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

export const NavigationCard: React.FC<NavigationCardProps> = ({
  sections,
  activeSection,
  onSectionChange,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="overflow-hidden">
        <nav className="divide-y divide-gray-100">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={`w-full px-4 py-3 flex items-center justify-between text-left transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex items-center">
                  <Icon
                    className={`h-5 w-5 mr-3 ${
                      activeSection === section.id ? 'text-blue-600' : 'text-gray-400'
                    }`}
                  />
                  <span className="font-medium">{section.label}</span>
                </div>
                <ChevronRight
                  className={`h-4 w-4 ${
                    activeSection === section.id ? 'text-blue-600' : 'text-gray-400'
                  }`}
                />
              </button>
            );
          })}
        </nav>
      </Card>
    </motion.div>
  );
};
