'use client';

import { Card } from '@/components/ui/Card';

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Settings</h1>
      
      <Card className="text-center py-12">
        <div className="text-6xl mb-4">⚙️</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Settings Page
        </h3>
        <p className="text-gray-600">
          Account settings will be implemented in a future task
        </p>
      </Card>
    </div>
  );
}
