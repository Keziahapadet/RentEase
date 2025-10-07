export interface InviteDialogData {
  type: 'tenant' | 'caretaker';
  propertyId: string;
  propertyName?: string;
  availableUnits?: any[];
}

export interface InviteFormData {
  email: string;
  unitId?: string;
  message?: string;
  propertyId: string;
}

export interface InviteTenantRequest {
  email: string;
  unitId: string;
  propertyId: string;
  message?: string;
}

export interface InviteCaretakerRequest {
  email: string;
  propertyId: string;
  message?: string;
}