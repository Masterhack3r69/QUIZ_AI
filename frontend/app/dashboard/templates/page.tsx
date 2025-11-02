'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { TemplateCard } from '@/components/quiz/TemplateCard';
import { TemplateForm } from '@/components/quiz/TemplateForm';
import { apiClient } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import type { QuizTemplate, QuizDistribution } from '@/types';

// Predefined templates
const PREDEFINED_TEMPLATES: Omit<QuizTemplate, '_id' | 'teacher' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Short Quiz',
    type: 'short',
    questionCount: 10,
    duration: 15,
    questionDistribution: {
      multipleChoice: 100,
      trueFalse: 0,
      fillInBlank: 0,
      matching: 0,
    },
    expirationPeriod: 7,
    subjects: [],
  },
  {
    name: 'Long Quiz',
    type: 'long',
    questionCount: 25,
    duration: 45,
    questionDistribution: {
      multipleChoice: 70,
      trueFalse: 20,
      fillInBlank: 10,
      matching: 0,
    },
    expirationPeriod: 14,
    subjects: [],
  },
  {
    name: 'Exam',
    type: 'exam',
    questionCount: 50,
    duration: 90,
    questionDistribution: {
      multipleChoice: 60,
      trueFalse: 20,
      fillInBlank: 15,
      matching: 5,
    },
    expirationPeriod: 30,
    subjects: [],
  },
];

export default function TemplatesPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [templates, setTemplates] = useState<QuizTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<QuizTemplate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getMyTemplates();
      // Filter out predefined templates (they're shown separately)
      const customOnly = data.filter((t: any) => !t.isPredefined && !t._id.startsWith('predefined-'));
      setTemplates(customOnly);
    } catch (error: any) {
      showToast('error', error.message || 'Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTemplate = async (
    data: Omit<QuizTemplate, '_id' | 'teacher' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      setIsSubmitting(true);
      await apiClient.createTemplate(data);
      showToast('success', 'Template created successfully');
      setShowCreateModal(false);
      loadTemplates();
    } catch (error: any) {
      showToast('error', error.message || 'Failed to create template');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTemplate = async (
    data: Omit<QuizTemplate, '_id' | 'teacher' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!selectedTemplate) return;

    try {
      setIsSubmitting(true);
      await apiClient.updateTemplate(selectedTemplate._id, data);
      showToast('success', 'Template updated successfully');
      setShowEditModal(false);
      setSelectedTemplate(null);
      loadTemplates();
    } catch (error: any) {
      showToast('error', error.message || 'Failed to update template');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      setIsSubmitting(true);
      await apiClient.deleteTemplate(selectedTemplate._id);
      showToast('success', 'Template deleted successfully');
      setShowDeleteModal(false);
      setSelectedTemplate(null);
      loadTemplates();
    } catch (error: any) {
      showToast('error', error.message || 'Failed to delete template');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDuplicateTemplate = async (template: QuizTemplate) => {
    try {
      setIsSubmitting(true);
      const duplicateData = {
        name: `${template.name} (Copy)`,
        type: 'custom' as const, // Always use 'custom' type for duplicated templates
        questionCount: template.questionCount,
        duration: template.duration,
        questionDistribution: template.questionDistribution,
        expirationPeriod: template.expirationPeriod,
        subjects: template.subjects,
      };
      await apiClient.createTemplate(duplicateData);
      showToast('success', 'Template duplicated successfully');
      loadTemplates();
    } catch (error: any) {
      showToast('error', error.message || 'Failed to duplicate template');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (template: QuizTemplate) => {
    setSelectedTemplate(template);
    setShowEditModal(true);
  };

  const openDeleteModal = (template: QuizTemplate) => {
    setSelectedTemplate(template);
    setShowDeleteModal(true);
  };

  return (
    <main id="main-content">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quiz Templates</h1>
            <p className="mt-2 text-gray-600">
              Create and manage reusable quiz templates
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={() => setShowCreateModal(true)}
            aria-label="Create new template"
          >
            <Icon name="plus" className="mr-2" />
            Create New Template
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Content */}
      {!isLoading && (
        <>
          {/* Predefined Templates */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Predefined Templates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {PREDEFINED_TEMPLATES.map((template, index) => (
                <TemplateCard
                  key={`predefined-${index}`}
                  template={{
                    ...template,
                    _id: `predefined-${index}`,
                    teacher: '',
                    createdAt: '',
                    updatedAt: '',
                  }}
                  isPredefined={true}
                />
              ))}
            </div>
          </section>

          {/* Custom Templates */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Custom Templates
            </h2>
            {templates.length === 0 ? (
              <Card className="text-center py-12">
                <div className="flex justify-center mb-4">
                  <Icon name="document" className="w-16 h-16 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Custom Templates Yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Create your first custom template to get started
                </p>
                <Button
                  variant="primary"
                  onClick={() => setShowCreateModal(true)}
                >
                  <Icon name="plus" className="mr-2" />
                  Create Template
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {templates.map((template) => (
                  <TemplateCard
                    key={template._id}
                    template={template}
                    onEdit={openEditModal}
                    onDelete={openDeleteModal}
                    onDuplicate={handleDuplicateTemplate}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* Create Template Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Template"
        size="lg"
      >
        <TemplateForm
          onSubmit={handleCreateTemplate}
          onCancel={() => setShowCreateModal(false)}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Edit Template Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTemplate(null);
        }}
        title="Edit Template"
        size="lg"
      >
        {selectedTemplate && (
          <TemplateForm
            template={selectedTemplate}
            onSubmit={handleEditTemplate}
            onCancel={() => {
              setShowEditModal(false);
              setSelectedTemplate(null);
            }}
            isLoading={isSubmitting}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedTemplate(null);
        }}
        title="Delete Template"
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedTemplate(null);
              }}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteTemplate}
              loading={isSubmitting}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Delete Template
            </Button>
          </>
        }
      >
        <p className="text-gray-700">
          Are you sure you want to delete the template{' '}
          <strong>{selectedTemplate?.name}</strong>? This action cannot be undone.
        </p>
      </Modal>
    </main>
  );
}
