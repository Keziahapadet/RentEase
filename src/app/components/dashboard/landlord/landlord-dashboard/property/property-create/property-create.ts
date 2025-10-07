import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { PropertyService } from '../../../../../../services/property.service';
import { AuthService } from '../../../../../../services/auth.service';
import { PropertyRequest, UnitRequest } from '../../../../../../services/dashboard-interface';
import { Subscription, from } from 'rxjs';
import { concatMap } from 'rxjs/operators';

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
    MatTooltipModule,
    MatCardModule
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

  propertyCreated = false;
  createdPropertyId: string | null = null;
  isAddUnitMode = false;

  newUnit = {
    unitNumber: '',
    unitType: '',
    rentAmount: '',
    deposit: '',
    description: ''
  };

  propertyTypes = [
    { value: 'APARTMENT', label: 'Apartment ' },
    { value: 'COMMERCIAL', label: 'Commercial Building' },
    { value: 'CONDO', label: 'Condominium' },
    { value: 'TOWNHOUSE', label: 'Townhouse' },
    { value: 'MIXED', label: 'Mixed Use' }
  ];

  unitTypes = [
    { value: 'SINGLE', label: 'Single Room'},
    { value: 'BEDSITTER', label: 'Bedsitter'},
    { value: '1BR', label: '1 Bedroom'},
    { value: '2BR', label: '2 Bedroom'},
    { value: '3BR', label: '3 Bedroom'},
    { value: 'STUDIO', label: 'Studio'},
    { value: 'OFFICE', label: 'Office Space'},
    { value: 'RETAIL', label: 'Retail Shop'}
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    public propertyService: PropertyService,
    public authService: AuthService,
    private snackBar: MatSnackBar,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    const propertyId = this.route.snapshot.paramMap.get('propertyId') || 
                     this.route.snapshot.paramMap.get('id') ||
                     this.route.parent?.snapshot.paramMap.get('propertyId');

    console.log('=== Property Units Component Init ===');
    console.log('Route params:', this.route.snapshot.params);
    console.log('PropertyId extracted:', propertyId);

    if (propertyId) {
      this.isAddUnitMode = true;
      this.propertyCreated = true;
      this.createdPropertyId = propertyId;
      console.log('✓ Add Unit Mode: ON');
      console.log('✓ Property ID:', this.createdPropertyId);
    } else {
      console.log('✗ Create Property Mode: ON (No property ID found)');
    }

    this.initializeForm();
    this.checkPermissions();
    this.setupFormSubscriptions();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private initializeForm() {
    this.propertyForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100), this.notBlankValidator]],
      location: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200), this.notBlankValidator]],
      propertyType: ['', [Validators.required]],
      totalUnits: [1, [Validators.required, Validators.min(1), Validators.max(500)]],
      description: ['', [Validators.maxLength(1000)]],
      units: this.fb.array([])
    });
  }

  private setupFormSubscriptions() {
    this.subscriptions.add(
      this.propertyForm.get('units')?.valueChanges.subscribe(() => {
        this.calculateStats();
      })!
    );
  }

  get units(): FormArray {
    return this.propertyForm.get('units') as FormArray;
  }

  private createUnit(unitNumber: string, unitType: string, rentAmount: number, deposit: number, description: string = ''): FormGroup {
    return this.fb.group({
      unitNumber: [unitNumber, [Validators.required, this.notBlankValidator, Validators.maxLength(20)]],
      unitType: [unitType, Validators.required],
      rentAmount: [rentAmount, [Validators.required, Validators.min(500), Validators.max(1000000)]],
      deposit: [deposit, [Validators.required, Validators.min(0), Validators.max(1000000)]],
      description: [description, [Validators.maxLength(500)]]
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

  canAddMoreUnits(): boolean {
    return this.getRemainingUnits() > 0;
  }

  createPropertyWithoutUnits() {
    this.propertyForm.markAllAsTouched();

    if (!this.propertyForm.valid) {
      this.snackBar.open('Please fill in all required fields correctly', 'Close', { duration: 3000 });
      this.scrollToFirstInvalidField();
      return;
    }

    this.isSubmitting = true;

    const propertyData: PropertyRequest = {
      name: this.propertyForm.value.name.trim(),
      location: this.propertyForm.value.location.trim(),
      propertyType: this.propertyForm.value.propertyType,
      totalUnits: Number(this.propertyForm.value.totalUnits),
      description: this.propertyForm.value.description?.trim() || '',
      units: []
    };

    this.propertyService.createProperty(propertyData).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        if (res.success || res.property || res.id) {
          this.propertyCreated = true;
          this.createdPropertyId = res.property?.id || res.id || res.data?.id;
          this.snackBar.open('Property created successfully! Now add units below.', 'Close', { duration: 4000 });
          setTimeout(() => {
            this.scrollToUnits();
          }, 500);
        } else {
          this.snackBar.open(res.message || 'Failed to create property', 'Close', { duration: 3000 });
        }
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.handlePropertyCreationError(err);
      }
    });
  }

  addUnit() {
    if (!this.newUnit.unitNumber || !this.newUnit.unitType || !this.newUnit.rentAmount || Number(this.newUnit.rentAmount) < 500) {
      this.snackBar.open('Please fill in all required unit fields with valid values', 'Close', { duration: 3000 });
      return;
    }

    if (!this.isAddUnitMode && this.isMaxUnitsReached()) {
      this.snackBar.open('Maximum units reached for this property', 'Close', { duration: 2000 });
      return;
    }

    const duplicateUnit = this.units.controls.find(
      (unit) => unit.get('unitNumber')?.value?.trim().toLowerCase() === this.newUnit.unitNumber.trim().toLowerCase()
    );

    if (duplicateUnit) {
      this.snackBar.open('Unit number already exists. Please use a different unit number.', 'Close', { duration: 3000 });
      return;
    }

    const unitFormGroup = this.createUnit(
      this.newUnit.unitNumber.trim(),
      this.newUnit.unitType,
      Number(this.newUnit.rentAmount),
      Number(this.newUnit.deposit),
      this.newUnit.description.trim()
    );

    this.units.push(unitFormGroup);
    this.calculateStats();

    this.snackBar.open(`Unit ${this.newUnit.unitNumber} added successfully!`, 'Close', { duration: 2000 });

    
    const keepType = this.newUnit.unitType;
    
    this.newUnit = {
      unitNumber: '',
      unitType: keepType,
      rentAmount: '',
      deposit: '',
      description: ''
    };
  }

  submitUnits() {
    if (this.units.length === 0) {
      this.snackBar.open('Please add at least one unit before saving', 'Close', { duration: 2000 });
      return;
    }

    if (!this.createdPropertyId) {
      console.error('Property ID is missing!');
      console.error('isAddUnitMode:', this.isAddUnitMode);
      console.error('propertyCreated:', this.propertyCreated);
      console.error('Route params:', this.route.snapshot.params);
      this.snackBar.open('Property ID not found. Please try again.', 'Close', { duration: 3000 });
      return;
    }

    console.log('Submitting units for property:', this.createdPropertyId);
    this.isSubmitting = true;

    const unitsData: UnitRequest[] = this.units.value.map((unit: any) => ({
      unitNumber: String(unit.unitNumber || '').trim(),
      unitType: String(unit.unitType || ''),
      rentAmount: Number(unit.rentAmount) || 0,
      deposit: Number(unit.deposit) || 0,
      description: unit.description ? String(unit.description).trim() : ''
    }));

    const hasInvalidData = unitsData.some(
      (unit) => !unit.unitNumber || !unit.unitType || isNaN(unit.rentAmount) || isNaN(unit.deposit) || unit.rentAmount <= 0 || unit.deposit < 0
    );

    if (hasInvalidData) {
      this.isSubmitting = false;
      this.snackBar.open('Invalid unit data detected. Please check your inputs.', 'Close', { duration: 3000 });
      return;
    }

    from(unitsData).pipe(
      concatMap(unit => this.propertyService.createUnit(this.createdPropertyId!, unit))
    ).subscribe({
      next: (res: any) => {
        console.log("Unit created:", res);
        this.snackBar.open(`Unit ${res.unit?.unitNumber || ''} created successfully`, 'Close', { duration: 2000 });
      },
      error: (err: any) => {
        this.isSubmitting = false;
        console.error("Failed to create unit", err);
        this.snackBar.open(err.error?.message || 'Failed to submit units', 'Close', { duration: 3000 });
      },
      complete: () => {
        this.isSubmitting = false;
        this.snackBar.open('All units submitted successfully!', 'Close', { duration: 3000 });
        
        if (this.isAddUnitMode) {
          this.router.navigate(['/landlord-dashboard/property', this.createdPropertyId, 'units']);
        } else {
          this.router.navigate(['/landlord-dashboard/property/list']);
        }
      }
    });
  }

  removeUnit(index: number) {
    const unitNumber = this.units.at(index).get('unitNumber')?.value;
    if (confirm(`Are you sure you want to remove unit ${unitNumber}?`)) {
      this.units.removeAt(index);
      this.calculateStats();
      this.snackBar.open(`Unit ${unitNumber} removed`, 'Close', { duration: 1500 });
    }
  }

  onUnitTypeChange() {
    
  }

  getPropertyTypeLabel(value: string): string {
    const propertyType = this.propertyTypes.find(type => type.value === value);
    return propertyType ? propertyType.label : value || '';
  }

  getUnitTypeLabel(value: string): string {
    const unitType = this.unitTypes.find(type => type.value === value);
    return unitType ? unitType.label : value || '';
  }

  scrollToUnits() {
    if (this.unitsSection) {
      this.unitsSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  scrollToFirstInvalidField() {
    const firstInvalidControl = document.querySelector('.ng-invalid');
    if (firstInvalidControl) {
      firstInvalidControl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  private notBlankValidator(control: any) {
    if (control?.value && typeof control.value === 'string' && control.value.trim() === '') {
      return { notBlank: true };
    }
    return null;
  }

  private calculateStats() {
    this.monthlyRevenue = this.units.controls.reduce((sum, unit) => sum + (Number(unit.get('rentAmount')?.value) || 0), 0);
    this.totalDeposit = this.units.controls.reduce((sum, unit) => sum + (Number(unit.get('deposit')?.value) || 0), 0);
  }

  formatCurrency(amount: number): string {
    if (amount == null) return 'KES 0';
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0
    }).format(amount);
  }

  onCancel() {
    if (this.isAddUnitMode) {
      this.router.navigate(['/landlord-dashboard/property', this.createdPropertyId, 'units']);
    } else if (this.propertyCreated || this.propertyForm.dirty || this.units.length > 0) {
      if (confirm('Are you sure you want to leave? Any unsaved changes will be lost.')) {
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
    if ([401, 403].includes(error.status)) {
      this.snackBar.open('Not authorized. Logging out...', 'Close', { duration: 2000 });
      setTimeout(() => {
        this.authService.logout();
        this.router.navigate(['/login']);
      }, 2000);
    } else if (error.status === 400) {
      this.snackBar.open(error.error?.message || 'Invalid property data. Please check your inputs.', 'Close', { duration: 4000 });
    } else if (error.status === 409) {
      this.snackBar.open('A property with this name already exists at this location.', 'Close', { duration: 4000 });
    } else if (error.status === 500) {
      this.snackBar.open('Server error. Please try again later.', 'Close', { duration: 3000 });
    } else if (error.status === 0) {
      this.snackBar.open('Network error. Please check your connection.', 'Close', { duration: 3000 });
    } else {
      this.snackBar.open(error.message || 'Failed to create property. Please try again.', 'Close', { duration: 3000 });
    }
  }


  isAddUnitDisabled(): boolean {
    return !this.newUnit.unitNumber || 
           !this.newUnit.unitType || 
           !this.newUnit.rentAmount || 
           Number(this.newUnit.rentAmount) < 500;
  }
}