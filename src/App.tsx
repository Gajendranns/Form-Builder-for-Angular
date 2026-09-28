/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { SidebarCatalog } from './components/SidebarCatalog';
import { BuilderCanvas } from './components/BuilderCanvas';
import { FieldInspector } from './components/FieldInspector';
import { LiveFormRunner } from './components/LiveFormRunner';
import { SubmissionsTable } from './components/SubmissionsTable';
import { AngularProblemsGuide } from './components/AngularProblemsGuide';
import { CodeExportModal } from './components/CodeExportModal';
import { PRESET_FORMS, INITIAL_SUBMISSIONS } from './data/presets';
import { FormConfig, FormField, FormFieldType, FormSubmission } from './types/form';
import { generateProjectZip } from './utils/codeGenerators/projectZipGenerator';

export default function App() {
  const [formConfig, setFormConfig] = useState<FormConfig>(PRESET_FORMS.registration);
  const [submissions, setSubmissions] = useState<FormSubmission[]>(INITIAL_SUBMISSIONS);
  const [activeTab, setActiveTab] = useState<'builder' | 'runner' | 'table' | 'problems' | 'code'>('builder');
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isMobileCatalogOpen, setIsMobileCatalogOpen] = useState(false);
  const [isMobileInspectorOpen, setIsMobileInspectorOpen] = useState(false);

  // Helper to extract all flat fields (for validation dependency selection)
  const getAllFields = (config: FormConfig): FormField[] => {
    const list: FormField[] = [];
    if (config.layoutType === 'multi-step') {
      config.fields.forEach((s) => {
        if (s.children) list.push(...s.children);
      });
    } else {
      config.fields.forEach((f) => {
        list.push(f);
        if (f.children) list.push(...f.children);
      });
    }
    return list;
  };

  const allFields = getAllFields(formConfig);
  const selectedField = allFields.find((f) => f.id === selectedFieldId) || null;

  // Add Field Handler
  const handleAddField = (type: FormFieldType) => {
    const fieldId = `f_${Date.now()}`;
    const count = allFields.length + 1;

    let newField: FormField = {
      id: fieldId,
      name: `field_${count}`,
      label: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      type,
      colSpan: 12,
    };

    if (type === 'select' || type === 'radio' || type === 'multiselect') {
      newField.options = [
        { label: 'Option 1', value: 'opt_1' },
        { label: 'Option 2', value: 'opt_2' },
        { label: 'Option 3', value: 'opt_3' },
      ];
      newField.defaultValue = 'opt_1';
    } else if (type === 'formarray') {
      newField.name = `arrayItems_${count}`;
      newField.label = 'Dynamic Repeating Items';
      newField.arrayConfig = {
        minItems: 1,
        maxItems: 8,
        itemLabel: 'Entry',
        addButtonText: 'Add Entry',
        initialItemsCount: 1,
      };
      newField.children = [
        {
          id: `fa_${Date.now()}_1`,
          name: 'title',
          label: 'Item Title',
          type: 'text',
          colSpan: 6,
          validation: { required: true },
        },
        {
          id: `fa_${Date.now()}_2`,
          name: 'quantity',
          label: 'Quantity',
          type: 'number',
          colSpan: 6,
          defaultValue: 1,
        },
      ];
    } else if (type === 'step') {
      handleAddStep();
      return;
    }

    if (formConfig.layoutType === 'multi-step') {
      const steps = formConfig.fields.filter((f) => f.type === 'step');
      if (steps.length === 0) {
        // Create initial step
        const firstStep: FormField = {
          id: `step_${Date.now()}`,
          name: 'step1',
          label: 'Step 1',
          type: 'step',
          stepTitle: 'Step 1: General',
          children: [newField],
        };
        setFormConfig((prev) => ({ ...prev, fields: [firstStep] }));
      } else {
        const stepIdx = Math.min(activeStepIndex, steps.length - 1);
        const targetStep = steps[stepIdx];
        const updatedStep = {
          ...targetStep,
          children: [...(targetStep.children || []), newField],
        };
        setFormConfig((prev) => ({
          ...prev,
          fields: prev.fields.map((f) => (f.id === targetStep.id ? updatedStep : f)),
        }));
      }
    } else {
      setFormConfig((prev) => ({
        ...prev,
        fields: [...prev.fields, newField],
      }));
    }

    setSelectedFieldId(fieldId);
    setIsMobileCatalogOpen(false);
  };

  // Add Step for Multi-step
  const handleAddStep = () => {
    const steps = formConfig.fields.filter((f) => f.type === 'step');
    const nextNum = steps.length + 1;
    const newStep: FormField = {
      id: `step_${Date.now()}`,
      name: `step${nextNum}`,
      label: `Step ${nextNum}`,
      type: 'step',
      stepTitle: `Step ${nextNum}: Section Details`,
      stepDescription: `Configure inputs for step ${nextNum}`,
      children: [
        {
          id: `f_s${nextNum}_1`,
          name: `step${nextNum}_title`,
          label: 'Section Title',
          type: 'text',
          colSpan: 12,
          validation: { required: true },
        },
      ],
    };

    setFormConfig((prev) => ({
      ...prev,
      fields: [...prev.fields, newStep],
    }));
    setActiveStepIndex(steps.length);
  };

  const handleDeleteStep = (stepIndex: number) => {
    const steps = formConfig.fields.filter((f) => f.type === 'step');
    if (steps.length <= 1) return;

    const remainingSteps = steps.filter((_, idx) => idx !== stepIndex);
    setFormConfig((prev) => ({
      ...prev,
      fields: remainingSteps,
    }));
    setActiveStepIndex(Math.max(0, stepIndex - 1));
  };

  // Update Field Handler
  const handleUpdateField = (updatedField: FormField) => {
    if (formConfig.layoutType === 'multi-step') {
      setFormConfig((prev) => ({
        ...prev,
        fields: prev.fields.map((step) => {
          if (step.type === 'step' && step.children) {
            const hasField = step.children.some((c) => c.id === updatedField.id);
            if (hasField) {
              return {
                ...step,
                children: step.children.map((c) => (c.id === updatedField.id ? updatedField : c)),
              };
            }
          }
          return step;
        }),
      }));
    } else {
      setFormConfig((prev) => ({
        ...prev,
        fields: prev.fields.map((f) => {
          if (f.id === updatedField.id) return updatedField;
          // Check inside formarray children if any
          if (f.children) {
            return {
              ...f,
              children: f.children.map((c) => (c.id === updatedField.id ? updatedField : c)),
            };
          }
          return f;
        }),
      }));
    }
  };

  // Delete Field Handler
  const handleDeleteField = (fieldId: string) => {
    if (formConfig.layoutType === 'multi-step') {
      setFormConfig((prev) => ({
        ...prev,
        fields: prev.fields.map((step) => {
          if (step.type === 'step' && step.children) {
            return {
              ...step,
              children: step.children.filter((c) => c.id !== fieldId),
            };
          }
          return step;
        }),
      }));
    } else {
      setFormConfig((prev) => ({
        ...prev,
        fields: prev.fields.filter((f) => f.id !== fieldId),
      }));
    }

    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
    }
  };

  // Duplicate Field Handler
  const handleDuplicateField = (field: FormField) => {
    const clone: FormField = {
      ...field,
      id: `f_${Date.now()}`,
      name: `${field.name}_copy`,
      label: `${field.label} (Copy)`,
    };

    if (formConfig.layoutType === 'multi-step') {
      const steps = formConfig.fields.filter((f) => f.type === 'step');
      const stepIdx = Math.min(activeStepIndex, steps.length - 1);
      const targetStep = steps[stepIdx];
      const updatedStep = {
        ...targetStep,
        children: [...(targetStep.children || []), clone],
      };
      setFormConfig((prev) => ({
        ...prev,
        fields: prev.fields.map((f) => (f.id === targetStep.id ? updatedStep : f)),
      }));
    } else {
      setFormConfig((prev) => ({
        ...prev,
        fields: [...prev.fields, clone],
      }));
    }

    setSelectedFieldId(clone.id);
  };

  // Move Field Up/Down Handler
  const handleMoveField = (fieldId: string, direction: 'up' | 'down') => {
    if (formConfig.layoutType === 'multi-step') {
      const steps = formConfig.fields.filter((f) => f.type === 'step');
      const stepIdx = Math.min(activeStepIndex, steps.length - 1);
      const targetStep = steps[stepIdx];
      if (!targetStep || !targetStep.children) return;

      const idx = targetStep.children.findIndex((c) => c.id === fieldId);
      if (idx === -1) return;
      if (direction === 'up' && idx === 0) return;
      if (direction === 'down' && idx === targetStep.children.length - 1) return;

      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      const reordered = [...targetStep.children];
      const [moved] = reordered.splice(idx, 1);
      reordered.splice(targetIdx, 0, moved);

      const updatedStep = { ...targetStep, children: reordered };
      setFormConfig((prev) => ({
        ...prev,
        fields: prev.fields.map((f) => (f.id === targetStep.id ? updatedStep : f)),
      }));
    } else {
      const idx = formConfig.fields.findIndex((f) => f.id === fieldId);
      if (idx === -1) return;
      if (direction === 'up' && idx === 0) return;
      if (direction === 'down' && idx === formConfig.fields.length - 1) return;

      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      const reordered = [...formConfig.fields];
      const [moved] = reordered.splice(idx, 1);
      reordered.splice(targetIdx, 0, moved);

      setFormConfig((prev) => ({ ...prev, fields: reordered }));
    }
  };

  // Preset Selection
  const handleSelectPreset = (presetKey: string) => {
    const preset = PRESET_FORMS[presetKey];
    if (preset) {
      setFormConfig(preset);
      setSelectedFieldId(null);
      setActiveStepIndex(0);
    }
  };

  // Add Mock Submission
  const handleAddMockSubmission = () => {
    const sampleNames = ['Sora Aoi', 'Darius Walker', 'Maya Lin', 'Klaus Vance', 'Elena Rostova'];
    const sampleRoles = ['frontend', 'lead', 'designer', 'devops'];
    const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
    const randomUsername = randomName.toLowerCase().replace(/\s+/g, '_') + Math.floor(Math.random() * 89 + 10);

    const mockData: Record<string, any> = {
      fullName: randomName,
      username: randomUsername,
      email: `${randomUsername}@cloudfrontier.io`,
      role: sampleRoles[Math.floor(Math.random() * sampleRoles.length)],
      yearsExperience: Math.floor(Math.random() * 12) + 1,
      subscribeUpdates: Math.random() > 0.5,
      agreeTerms: true,
      issueTitle: 'Regression in change detection cycle',
      severity: 'p1',
      affectedUsers: 140,
      organizationName: 'Core Framework Platform',
      costCenter: 'CC-4001',
    };

    const newSub: FormSubmission = {
      id: `sub-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      data: mockData,
      status: 'submitted',
    };

    setSubmissions((prev) => [newSub, ...prev]);
  };

  const handleDeleteSubmission = (id: string) => {
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
  };

  const handleClearAllSubmissions = () => {
    setSubmissions([]);
  };

  const handleDownloadZip = async () => {
    try {
      const blob = await generateProjectZip(formConfig);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${formConfig.id}-angular-project.zip`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Download ZIP failed', e);
    }
  };

  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500/30 selection:text-rose-200 overflow-hidden">
      {/* Top Bar Header Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        formConfig={formConfig}
        onSelectPreset={handleSelectPreset}
        onOpenCodeModal={() => setIsCodeModalOpen(true)}
        onDownloadZip={handleDownloadZip}
        submissionsCount={submissions.length}
        onToggleMobileCatalog={() => setIsMobileCatalogOpen(!isMobileCatalogOpen)}
        onToggleMobileInspector={() => setIsMobileInspectorOpen(!isMobileInspectorOpen)}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 min-h-0 flex overflow-hidden relative">
        {activeTab === 'builder' && (
          <>
            {/* Desktop Left Palette */}
            <div className="hidden lg:flex shrink-0 h-full overflow-hidden">
              <SidebarCatalog
                onAddField={handleAddField}
                layoutType={formConfig.layoutType}
                onAddStep={handleAddStep}
              />
            </div>

            {/* Mobile Drawer Left Palette */}
            {isMobileCatalogOpen && (
              <div className="lg:hidden fixed inset-0 z-50 flex">
                <div
                  className="fixed inset-0 bg-black/75 backdrop-blur-sm"
                  onClick={() => setIsMobileCatalogOpen(false)}
                />
                <div className="relative z-10 w-4/5 max-w-xs h-full bg-slate-950 shadow-2xl animate-in slide-in-from-left duration-200">
                  <SidebarCatalog
                    onAddField={handleAddField}
                    layoutType={formConfig.layoutType}
                    onAddStep={handleAddStep}
                    onClose={() => setIsMobileCatalogOpen(false)}
                  />
                </div>
              </div>
            )}

            {/* Center Canvas */}
            <BuilderCanvas
              formConfig={formConfig}
              selectedFieldId={selectedFieldId}
              onSelectField={(f) => {
                setSelectedFieldId(f.id);
                // On mobile devices, open inspector drawer upon selecting a field
                if (window.innerWidth < 1024) {
                  setIsMobileInspectorOpen(true);
                }
              }}
              onMoveField={handleMoveField}
              onDeleteField={handleDeleteField}
              onDuplicateField={handleDuplicateField}
              onAddFieldToCurrentStep={handleAddField}
              activeStepIndex={activeStepIndex}
              setActiveStepIndex={setActiveStepIndex}
              onAddStep={handleAddStep}
              onDeleteStep={handleDeleteStep}
              onSelectFormLevel={() => {
                setSelectedFieldId(null);
                if (window.innerWidth < 1024) {
                  setIsMobileInspectorOpen(true);
                }
              }}
              onOpenMobileCatalog={() => setIsMobileCatalogOpen(true)}
              onOpenMobileInspector={() => setIsMobileInspectorOpen(true)}
            />

            {/* Desktop Right Inspector */}
            <div className="hidden lg:flex shrink-0 h-full overflow-hidden">
              <FieldInspector
                selectedField={selectedField}
                formConfig={formConfig}
                allFields={allFields}
                onUpdateField={handleUpdateField}
                onDeleteField={handleDeleteField}
                onDuplicateField={handleDuplicateField}
                onUpdateFormConfig={(partial) => setFormConfig((prev) => ({ ...prev, ...partial }))}
                onClose={() => setSelectedFieldId(null)}
              />
            </div>

            {/* Mobile Drawer Right Inspector */}
            {isMobileInspectorOpen && (
              <div className="lg:hidden fixed inset-0 z-50 flex justify-end">
                <div
                  className="fixed inset-0 bg-black/75 backdrop-blur-sm"
                  onClick={() => setIsMobileInspectorOpen(false)}
                />
                <div className="relative z-10 w-full sm:w-96 max-w-full h-full bg-slate-950 shadow-2xl animate-in slide-in-from-right duration-200">
                  <FieldInspector
                    selectedField={selectedField}
                    formConfig={formConfig}
                    allFields={allFields}
                    onUpdateField={handleUpdateField}
                    onDeleteField={handleDeleteField}
                    onDuplicateField={handleDuplicateField}
                    onUpdateFormConfig={(partial) => setFormConfig((prev) => ({ ...prev, ...partial }))}
                    onClose={() => setIsMobileInspectorOpen(false)}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'runner' && (
          <LiveFormRunner
            formConfig={formConfig}
            onSubmitSuccess={(sub) => setSubmissions((prev) => [sub, ...prev])}
            onGoToSubmissionsTable={() => setActiveTab('table')}
          />
        )}

        {activeTab === 'table' && (
          <SubmissionsTable
            submissions={submissions}
            formConfig={formConfig}
            onDeleteSubmission={handleDeleteSubmission}
            onAddMockSubmission={handleAddMockSubmission}
            onClearAllSubmissions={handleClearAllSubmissions}
          />
        )}

        {activeTab === 'problems' && <AngularProblemsGuide />}

        {activeTab === 'code' && (
          <CodeExportModal
            formConfig={formConfig}
            isInlineTab={true}
          />
        )}
      </div>

      {/* Export Code Modal (triggered from Header or action button) */}
      <CodeExportModal
        formConfig={formConfig}
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
      />
    </div>
  );
}
