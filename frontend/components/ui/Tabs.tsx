'use client';

import React, { useState } from 'react';

export interface Tab {
  id: string;
  label: string;
  content?: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
  variant?: 'default' | 'pills';
}

export function Tabs({
  tabs,
  defaultTab,
  onChange,
  className = '',
  variant = 'default',
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };
  
  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;
  
  const baseTabStyles = 'px-4 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[44px] flex items-center justify-center gap-2';
  
  const variantStyles = {
    default: {
      container: 'border-b border-gray-200',
      tab: 'border-b-2 -mb-px',
      active: 'border-blue-600 text-blue-600',
      inactive: 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300',
    },
    pills: {
      container: 'bg-gray-100 p-1 rounded-lg inline-flex gap-1',
      tab: 'rounded-md',
      active: 'bg-white text-blue-600 shadow-sm',
      inactive: 'text-gray-600 hover:text-gray-900 hover:bg-gray-200',
    },
  };
  
  const styles = variantStyles[variant];
  
  return (
    <div className={`w-full ${className}`}>
      {/* Tab Navigation */}
      <div className={styles.container} role="tablist">
        <div className={variant === 'pills' ? 'flex flex-wrap gap-1' : 'flex flex-wrap gap-0'}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.id}`}
                id={`tab-${tab.id}`}
                disabled={tab.disabled}
                onClick={() => handleTabChange(tab.id)}
                className={`${baseTabStyles} ${styles.tab} ${
                  isActive ? styles.active : styles.inactive
                }`}
              >
                {tab.icon && <span aria-hidden="true">{tab.icon}</span>}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Tab Content */}
      <div
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className="mt-4"
      >
        {activeTabContent}
      </div>
    </div>
  );
}

// Controlled Tabs Component (for external state management)
export interface ControlledTabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  variant?: 'default' | 'pills';
}

export function ControlledTabs({
  tabs,
  activeTab,
  onChange,
  className = '',
  variant = 'default',
}: ControlledTabsProps) {
  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;
  
  const baseTabStyles = 'px-4 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[44px] flex items-center justify-center gap-2';
  
  const variantStyles = {
    default: {
      container: 'border-b border-gray-200',
      tab: 'border-b-2 -mb-px',
      active: 'border-blue-600 text-blue-600',
      inactive: 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300',
    },
    pills: {
      container: 'bg-gray-100 p-1 rounded-lg inline-flex gap-1',
      tab: 'rounded-md',
      active: 'bg-white text-blue-600 shadow-sm',
      inactive: 'text-gray-600 hover:text-gray-900 hover:bg-gray-200',
    },
  };
  
  const styles = variantStyles[variant];
  
  return (
    <div className={`w-full ${className}`}>
      {/* Tab Navigation */}
      <div className={styles.container} role="tablist">
        <div className={variant === 'pills' ? 'flex flex-wrap gap-1' : 'flex flex-wrap gap-0'}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.id}`}
                id={`tab-${tab.id}`}
                disabled={tab.disabled}
                onClick={() => onChange(tab.id)}
                className={`${baseTabStyles} ${styles.tab} ${
                  isActive ? styles.active : styles.inactive
                }`}
              >
                {tab.icon && <span aria-hidden="true">{tab.icon}</span>}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Tab Content */}
      {activeTabContent && (
        <div
          role="tabpanel"
          id={`tabpanel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          className="mt-4"
        >
          {activeTabContent}
        </div>
      )}
    </div>
  );
}
