import type { SOPStepPermission, SOPConfig } from '../types/auth';
import { getPermissionProvider } from './permission-provider';
import { hasAll } from './permission-checker';

export function getSOPStepPermission(sop: string, step: string): SOPStepPermission {
  const provider = getPermissionProvider();
  return provider.getSOPStepPermission(sop, step);
}

export function canExecuteSOPStep(sop: string, step: string): boolean {
  const sopPermission = getSOPStepPermission(sop, step);
  return sopPermission.canExecute;
}

export function canViewSOPStep(sop: string, step: string): boolean {
  const sopPermission = getSOPStepPermission(sop, step);
  return sopPermission.canView;
}

export function getAvailableFields(sop: string, step: string): string[] {
  const sopPermission = getSOPStepPermission(sop, step);
  return sopPermission.availableFields;
}

export function validateSOPStepPermissions(sopConfig: SOPConfig, stepId: string): boolean {
  const step = sopConfig.steps[stepId];
  if (!step) return false;
  if (!step.permissions || step.permissions.length === 0) return true;
  return hasAll(step.permissions);
}

export function getNextAvailableSteps(
  sopConfig: SOPConfig,
  currentStepId: string
): string[] {
  const currentStep = sopConfig.steps[currentStepId];
  if (!currentStep || !currentStep.nextSteps) return [];
  return currentStep.nextSteps.filter(stepId => {
    const step = sopConfig.steps[stepId];
    if (!step) return false;
    if (!step.permissions || step.permissions.length === 0) return true;
    return hasAll(step.permissions);
  });
}