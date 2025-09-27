import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PropertyService } from '../../../../../../services/property.service';
import { AuthService } from '../../../../../../services/auth.service';
import { PropertyRequest } from '../../../../../../services/auth-interfaces';
import { Subscription } from 'rxjs';

interface UnitTypeSummary {
  type: string;
  count: number;
}

@Component({
  selector: 'app-property-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './property-create.html',
  styleUrls: ['./property-create.scss']
})
export class PropertyCreateComponent implements OnInit, OnDestroy {
  @ViewChild('unitsSection') unitsSection!: ElementRef;

  propertyForm!: FormGroup;
  isSubmitting = false;
  monthlyRevenue = 0;
  totalDeposit = 0;
  private subscriptions = new Subscription();

  selectedRows: boolean[] = [];
  allUnitsSelected = false;

  bulkDefaults = {
    unitNumber: '', 
    unitType: '',
    quantity: 1,
    rentAmount: 25000,
    deposit: 25000
  };

  batchOperation: {
    target: 'all' | 'selected',
    field: 'rentAmount' | 'deposit' | 'unitDescription', 
    value: string | number
  } = {
    target: 'all',
    field: 'rentAmount',
    value: ''
  };

  propertyTypes = [
    { value: 'APARTMENT', label: 'Apartment' },
    { value: 'HOUSE', label: 'House' },
    { value: 'BUNGALOW', label: 'Bungalow' },
    { value: 'COMMERCIAL', label: 'Commercial' },
    { value: 'CONDO', label: 'Condominium' },
    { value: 'TOWNHOUSE', label: 'Townhouse' }
  ];

  unitTypes = [
    { value: 'SINGLE', label: 'Single Room' },
    { value: 'BEDSITTER', label: 'Bedsitter' },
    { value: '1BR', label: '1 Bedroom' },
    { value: '2BR', label: '2 Bedroom' },
    { value: '3BR', label: '3 Bedroom' },
    { value: 'OFFICE', label: 'Office' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    public propertyService: PropertyService,
    public authService: AuthService,
    private snackBar: MatSnackBar,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.checkPermissions();
    this.subscriptions.add(
      this.propertyForm.get('units')?.valueChanges.subscribe(() => this.calculateStats())!
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private initializeForm() {
    this.propertyForm = this.fb.group({
      name: ['', [Validators.required, this.notBlankValidator]],
      location: ['', [Validators.required, this.notBlankValidator]],
      propertyType: ['', Validators.required],
      totalUnits: [1, [Validators.required, Validators.min(1), Validators.max(1000)]],
      description: ['', [Validators.maxLength(1000)]],
      units: this.fb.array([])
    });
  }

  get units(): FormArray {
    return this.propertyForm.get('units') as FormArray;
  }

  private createUnit(unitNumber: string, unitType: string, rentAmount: number, deposit: number): FormGroup {
    return this.fb.group({
      unitNumber: [unitNumber, [Validators.required, this.notBlankValidator]],
      unitType: [unitType, Validators.required],
      rentAmount: [rentAmount, [Validators.required, Validators.min(1)]],
      deposit: [deposit, [Validators.required, Validators.min(0)]],
      unitDescription: ['', [Validators.maxLength(500)]]
    });
  }

 
  getRemainingUnits(): number {
    const totalUnits = Number(this.propertyForm.get('totalUnits')?.value) || 0;
    const currentUnits = this.units.length;
    return Math.max(0, totalUnits - currentUnits);
  }
  isMaxUnitsReached(): boolean {
    return this.getRemainingUnits() === 0;
  }

 
  generateSequentialUnitNumbers(baseUnitNumber: string, quantity: number): string[] {
    const unitNumbers: string[] = [];
  
    const match = baseUnitNumber.match(/^(\d+)([A-Za-z]*)$/);
    
    if (match) {
      const numberPart = match[1];
      const letterPart = match[2] || '';
      
      if (letterPart) {

        let startingCharCode = letterPart.toUpperCase().charCodeAt(0);
        
        for (let i = 0; i < quantity; i++) {
          const currentLetter = String.fromCharCode(startingCharCode + i);
          unitNumbers.push(`${numberPart}${currentLetter}`);
        }
      } else {

        for (let i = 0; i < quantity; i++) {
          const letter = String.fromCharCode(65 + i); 
          unitNumbers.push(`${numberPart}${letter}`);
        }
      }
    } else {
      for (let i = 0; i < quantity; i++) {
        unitNumbers.push(`${baseUnitNumber}${i + 1}`);
      }
    }
    
    return unitNumbers;
  }

  addBulkUnits() {
    const baseUnitNumber = this.bulkDefaults.unitNumber.trim();
    const type = this.bulkDefaults.unitType;
    const quantity = Number(this.bulkDefaults.quantity) || 0;
    const rent = Number(this.bulkDefaults.rentAmount) || 25000;
    const deposit = Number(this.bulkDefaults.deposit) || 25000;

    if (!baseUnitNumber) {
      this.snackBar.open('Please enter a starting unit number', 'Close', { duration: 2000 });
      return;
    }

    if (!type) {
      this.snackBar.open('Please select a unit type', 'Close', { duration: 2000 });
      return;
    }

    if (quantity < 1) {
      this.snackBar.open('Please enter a valid quantity', 'Close', { duration: 2000 });
      return;
    }

    const remainingUnits = this.getRemainingUnits();
    if (quantity > remainingUnits) {
      this.snackBar.open(`Only ${remainingUnits} units remaining. Cannot add ${quantity} units.`, 'Close', { duration: 3000 });
      return;
    }
    const unitNumbers = this.generateSequentialUnitNumbers(baseUnitNumber, quantity);

    unitNumbers.forEach(unitNumber => {
      const newUnit = this.createUnit(unitNumber, type, rent, deposit);
      this.units.push(newUnit);
      this.selectedRows.push(false);
    });

    this.snackBar.open(`Added ${quantity} ${this.getUnitTypeLabel(type)} unit(s) successfully`, 'Close', { duration: 2000 });
    this.calculateStats();
    this.scrollToUnits();
    

    this.bulkDefaults.quantity = 1;
  }

  addSingleUnit() {
    if (this.isMaxUnitsReached()) {
      this.snackBar.open('Maximum units reached', 'Close', { duration: 2000 });
      return;
    }


    const unitNumber = `Unit ${this.units.length + 1}`;
    const newUnit = this.createUnit(
      unitNumber,
      this.bulkDefaults.unitType || 'SINGLE',
      this.bulkDefaults.rentAmount,
      this.bulkDefaults.deposit
    );
    this.units.push(newUnit);
    this.selectedRows.push(false);
    this.calculateStats();
    this.scrollToUnits();
    this.snackBar.open('Unit added successfully', 'Close', { duration: 1500 });
  }

  autoGenerateUnits() {
    const totalUnits = Number(this.propertyForm.get('totalUnits')?.value) || 0;
    if (totalUnits <= 0) {
      this.snackBar.open('Please set total units first', 'Close', { duration: 2000 });
      return;
    }

    this.units.clear();
    this.selectedRows = [];

    
    const unitTypes = ['SINGLE', 'BEDSITTER', '1BR', '2BR'];
    const distribution = [0.4, 0.3, 0.2, 0.1]; 

    let unitsCreated = 0;
    let unitCounter = 1;

    unitTypes.forEach((type, index) => {
      const count = Math.floor(totalUnits * distribution[index]);
      for (let i = 0; i < count && unitsCreated < totalUnits; i++) {
        const unitNumber = this.generateUnitNumber(unitCounter);
        const rent = this.getDefaultRentForType(type);
        const deposit = rent; 
        const newUnit = this.createUnit(unitNumber, type, rent, deposit);
        this.units.push(newUnit);
        this.selectedRows.push(false);
        unitsCreated++;
        unitCounter++;
      }
    });
    while (unitsCreated < totalUnits) {
      const unitNumber = this.generateUnitNumber(unitCounter);
      const newUnit = this.createUnit(unitNumber, 'SINGLE', 15000, 15000);
      this.units.push(newUnit);
      this.selectedRows.push(false);
      unitsCreated++;
      unitCounter++;
    }

    this.snackBar.open(`Auto-generated ${totalUnits} units`, 'Close', { duration: 2000 });
    this.calculateStats();
    this.scrollToUnits();
  }

  private generateUnitNumber(counter: number): string {
    const propertyType = this.propertyForm.value.propertyType;
    
    if (propertyType === 'APARTMENT') {
      const unitsPerFloor = 4;
      const floor = Math.floor((counter - 1) / unitsPerFloor) + 1;
      const onFloor = ((counter - 1) % unitsPerFloor) + 1;
      return `${floor}${onFloor.toString().padStart(2, '0')}`;
    } else if (propertyType === 'COMMERCIAL' || propertyType === 'OFFICE') {
      return `Unit ${String.fromCharCode(64 + counter)}`; 
    } else {
      return `Unit ${counter}`;
    }
  }

  private getDefaultRentForType(type: string): number {
    const defaults: { [key: string]: number } = {
      'SINGLE': 15000,
      'BEDSITTER': 25000,
      '1BR': 35000,
      '2BR': 50000,
      '3BR': 70000,
      'OFFICE': 40000
    };
    return defaults[type] || 25000;
  }

  removeUnit(index: number) {
    this.units.removeAt(index);
    this.selectedRows.splice(index, 1);
    this.calculateStats();
    this.snackBar.open('Unit removed', 'Close', { duration: 1500 });
  }

  scrollToUnits() {
    if (this.unitsSection) {
      this.unitsSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  toggleSelectAll(event: any) {
    this.allUnitsSelected = event.target.checked;
    this.selectedRows = this.selectedRows.map(() => this.allUnitsSelected);
  }

  toggleUnitSelection(index: number, event: any) {
    this.selectedRows[index] = event.target.checked;
    this.allUnitsSelected = this.selectedRows.every(selected => selected);
  }

  isUnitSelected(index: number): boolean {
    return this.selectedRows[index] || false;
  }

  getSelectedUnitsCount(): number {
    return this.selectedRows.filter(selected => selected).length;
  }


  getUnitTypeSummary(): UnitTypeSummary[] {
    const summary: { [key: string]: number } = {};
    
    this.units.controls.forEach(unit => {
      const type = unit.get('unitType')?.value;
      if (type) {
        summary[type] = (summary[type] || 0) + 1;
      }
    });

    return Object.keys(summary).map(type => ({
      type: this.getUnitTypeLabel(type),
      count: summary[type]
    }));
  }

  getUnitTypeLabel(unitTypeValue: string): string {
    const unitType = this.unitTypes.find(type => type.value === unitTypeValue);
    return unitType ? unitType.label : unitTypeValue;
  }


  applyBatchOperation() {
    const targetUnits = this.batchOperation.target === 'selected'
      ? this.units.controls.filter((_, i) => this.selectedRows[i])
      : this.units.controls;

    if (this.batchOperation.target === 'selected' && targetUnits.length === 0) {
      this.snackBar.open('No units selected for batch operation.', 'Close', { duration: 2000 });
      return;
    }

    if (this.batchOperation.value === '' || this.batchOperation.value === null || this.batchOperation.value === undefined) {
      this.snackBar.open('Please enter a value for the batch operation.', 'Close', { duration: 2000 });
      return;
    }

    targetUnits.forEach(unit => {
      let value: string | number = this.batchOperation.value;
      const field = this.batchOperation.field;
      
      if (field === 'rentAmount' || field === 'deposit') {
        value = Number(value) || 0;
        if (value < 0) value = 0;
      }
      
      unit.get(field)?.setValue(value);
    });

    const affectedCount = targetUnits.length;
    this.snackBar.open(`Batch operation applied to ${affectedCount} units!`, 'Close', { duration: 1500 });
    this.calculateStats();
  }

  clearAllUnits() {
    if (this.units.length === 0) {
      this.snackBar.open('No units to clear', 'Close', { duration: 1500 });
      return;
    }

    if (confirm('Are you sure you want to clear all units? This action cannot be undone.')) {
      this.units.clear();
      this.selectedRows = [];
      this.calculateStats();
      this.snackBar.open('All units cleared.', 'Close', { duration: 1500 });
    }
  }

  private notBlankValidator(control: any) {
    if (control?.value && typeof control.value === 'string' && control.value.trim() === '') {
      return { notBlank: true };
    }
    return null;
  }

  hasFieldError(field: string): boolean {
    const control = this.propertyForm.get(field);
    return !!(control?.invalid && (control?.dirty || control?.touched));
  }

  getErrorMessage(field: string): string {
    const control = this.propertyForm.get(field);
    if (!control) return '';
    
    if (control.hasError('required')) {
      return `${this.formatFieldName(field)} is required`;
    }
    if (control.hasError('notBlank')) {
      return `${this.formatFieldName(field)} cannot be empty or contain only spaces`;
    }
    if (control.hasError('min')) {
      const min = control.errors?.['min']?.min;
      return `${this.formatFieldName(field)} must be at least ${min}`;
    }
    if (control.hasError('max')) {
      const max = control.errors?.['max']?.max;
      return `${this.formatFieldName(field)} cannot exceed ${max}`;
    }
    if (control.hasError('maxlength')) {
      const requiredLength = control.errors?.['maxlength']?.requiredLength;
      return `Maximum ${requiredLength} characters allowed`;
    }
    return 'Invalid value';
  }

  private formatFieldName(field: string): string {
    const fieldNames: { [key: string]: string } = {
      'name': 'Property name',
      'location': 'Location',
      'propertyType': 'Property type',
      'totalUnits': 'Total units',
      'description': 'Description'
    };
    return fieldNames[field] || field.charAt(0).toUpperCase() + field.slice(1);
  }

  private calculateStats() {
    this.monthlyRevenue = this.units.controls.reduce((sum, unit) => {
      return sum + (Number(unit.get('rentAmount')?.value) || 0);
    }, 0);
    this.totalDeposit = this.units.controls.reduce((sum, unit) => {
      return sum + (Number(unit.get('deposit')?.value) || 0);
    }, 0);
  }

  onSubmit() {
    if (this.propertyForm.invalid) {
      this.propertyForm.markAllAsTouched();
      this.snackBar.open('Please fix all errors before submitting', 'Close', { duration: 3000 });
      return;
    }

    if (this.units.length === 0) {
      this.snackBar.open('Please add at least one unit before submitting', 'Close', { duration: 3000 });
      return;
    }

   
    

    const invalidUnits = this.units.controls.filter(unit => unit.invalid);
    if (invalidUnits.length > 0) {
      this.snackBar.open('Please fix errors in unit configurations', 'Close', { duration: 3000 });
      return;
    }

    this.isSubmitting = true;
    const formData: PropertyRequest = {
      name: this.propertyForm.value.name.trim(),
      location: this.propertyForm.value.location.trim(),
      propertyType: this.propertyForm.value.propertyType,
      totalUnits: Number(this.propertyForm.value.totalUnits),
      description: this.propertyForm.value.description?.trim() || '',
      units: this.propertyForm.value.units.map((u: any) => ({
        unitNumber: u.unitNumber.trim(),
        unitType: u.unitType,
        rentAmount: Number(u.rentAmount),
        deposit: Number(u.deposit),
        unitDescription: u.unitDescription?.trim() || ''
      }))
    };

    console.log('Submitting property data:', formData); 

    this.propertyService.createProperty(formData).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        console.log('Property creation response:', res); 
        
        if (res.success) {
          this.snackBar.open('Property created successfully!', 'Close', { duration: 3000 });
          setTimeout(() => this.router.navigate(['/landlord-dashboard/property']), 2000);
        } else {
          this.snackBar.open(res.message || 'Failed to create property.', 'Close', { duration: 3000 });
        }
      },
      error: (err: any) => {
        this.isSubmitting = false;
        console.error('Property creation error:', err); 
        this.handlePropertyCreationError(err);
      }
    });
  }

  onCancel() {
    if (this.propertyForm.dirty) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        this.router.navigate(['/landlord-dashboard/property']);
      }
    } else {
      this.router.navigate(['/landlord-dashboard/property']);
    }
  }

  private checkPermissions() {
    if (!this.authService.isAuthenticated()) {
      this.snackBar.open('You are not logged in. Redirecting...', 'Close', { duration: 2000 });
      setTimeout(() => this.router.navigate(['/login']), 2000);
      return;
    }
  }

  private handlePropertyCreationError(error: any) {
    console.error('Property creation error details:', error); 
    
    if ([401, 403].includes(error.status)) {
      this.snackBar.open('Not authorized. Logging out...', 'Close', { duration: 2000 });
      setTimeout(() => {
        this.authService.logout();
        this.router.navigate(['/login']);
      }, 2000);
    } else if (error.status === 400) {
      this.snackBar.open(error.error?.message || 'Invalid property data.', 'Close', { duration: 3000 });
    } else if (error.status === 409) {
      this.snackBar.open('A property with this name already exists at this location.', 'Close', { duration: 3000 });
    } else if (error.status === 500) {
      this.snackBar.open('Server error. Please try again later.', 'Close', { duration: 3000 });
    } else if (error.status === 0) {
      this.snackBar.open('Network error. Please check your connection.', 'Close', { duration: 3000 });
    } else {
      this.snackBar.open(error.message || 'Failed to create property.', 'Close', { duration: 3000 });
    }
  }

  getBatchInputType(): 'number' | 'text' {
    switch (this.batchOperation.field) {
      case 'rentAmount':
      case 'deposit': return 'number';
      case 'unitDescription': return 'text';
      default: return 'text';
    }
  }
}