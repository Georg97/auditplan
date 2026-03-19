import { z } from 'zod';

// ============================================================
// Shared enums — ALL use English internal keys
// ============================================================

export const auditStatusValues = ['planned', 'in_progress', 'completed', 'cancelled'] as const;
export type AuditStatus = (typeof auditStatusValues)[number];
export const auditStatusSchema = z.enum(auditStatusValues);

export const auditTypeValues = ['internal', 'external', 'certification', 'surveillance', 'recertification'] as const;
export type AuditType = (typeof auditTypeValues)[number];
export const auditTypeSchema = z.enum(auditTypeValues);

export const findingTypeValues = ['major_nonconformity', 'minor_nonconformity', 'recommendation', 'improvement_potential', 'positive_finding', 'observation', 'note'] as const;
export type FindingType = (typeof findingTypeValues)[number];
export const findingTypeSchema = z.enum(findingTypeValues);

export const actionStatusValues = ['open', 'in_progress', 'implemented', 'verified', 'completed'] as const;
export type ActionStatus = (typeof actionStatusValues)[number];
export const actionStatusSchema = z.enum(actionStatusValues);

export const priorityValues = ['high', 'medium', 'low'] as const;
export type Priority = (typeof priorityValues)[number];
export const prioritySchema = z.enum(priorityValues);

export const isoStandardValues = ['iso9001', 'iso14001', 'iso45001', 'iso27001', 'iso50001'] as const;
export type IsoStandard = (typeof isoStandardValues)[number];
export const isoStandardSchema = z.enum(isoStandardValues);
