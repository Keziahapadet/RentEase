import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface InviteDialogData {
  type: string;
  propertyId: string;
  propertyName: string;
  availableUnits: any[];
}

export interface InviteFormData {
  email: string;
  message: string;
  propertyId: string;
  unitId?: string;
}

@Component({
  selector: 'app-invite-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './invite-dialog.component.html',
  styleUrls: ['./invite-dialog.component.scss']
})
export class InviteDialogComponent implements OnInit {
  inviteForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<InviteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: InviteDialogData
  ) {
    this.inviteForm = this.createForm();
  }

  ngOnInit() {
    if (this.data.type === 'tenant') {
      this.inviteForm.get('unitId')?.setValidators(Validators.required);
      this.inviteForm.get('unitId')?.updateValueAndValidity();
    }
  }

  private createForm(): FormGroup {
    const formConfig: any = {
      email: ['', [Validators.required, Validators.email]],
      message: ['']
    };

    if (this.data.type === 'tenant') {
      formConfig.unitId = ['', Validators.required];
    }

    return this.fb.group(formConfig);
  }

  onSend(): void {
    if (this.inviteForm.valid) {
      this.loading = true;
      
      const formData: InviteFormData = {
        ...this.inviteForm.value,
        propertyId: this.data.propertyId
      };
      
      this.dialogRef.close(formData);
    } else {
      this.markFormGroupTouched(this.inviteForm);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  getUnitTypeDisplay(type: string): string {
    const typeMap: { [key: string]: string } = {
      'SINGLE': 'Single Room',
      'BEDSITTER': 'Bedsitter',
      '1BR': '1 Bedroom',
      '2BR': '2 Bedroom',
      '3BR': '3 Bedroom',
      'STUDIO': 'Studio',
      'OFFICE': 'Office Space',
      'RETAIL': 'Retail Shop',
      'APARTMENT': 'Apartment',
      'ONE_BEDROOM': '1 Bedroom',
      'TWO_BEDROOM': '2 Bedroom',
      'THREE_BEDROOM': '3 Bedroom',
      'COMMERCIAL': 'Commercial',
      'PENTHOUSE': 'Penthouse',
      'SINGLE_ROOM': 'Single Room'
    };
    return typeMap[type] || type || 'Unit';
  }

  formatCurrency(amount: number): string {
    if (!amount && amount !== 0) return 'KES 0';
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0
    }).format(amount);
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.inviteForm.get(controlName);
    return control ? control.hasError(errorName) && control.touched : false;
  }
}