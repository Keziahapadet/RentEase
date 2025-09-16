import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

export interface Document {
  id: string;
  name: string;
  originalName: string;
  category: DocumentCategory;
  type: DocumentType;
  url: string;
  size: string;
  mimeType: string;
  uploadedBy: string;
  uploadedDate: string;
  description?: string;
  tags: string[];
  isPublic: boolean;
  expiryDate?: string;
  version: number;
  status: DocumentStatus;
  downloadCount: number;
  lastAccessed?: string;
}

export enum DocumentCategory {
  LEGAL = 'Legal',
  FINANCIAL = 'Financial',
  MAINTENANCE = 'Maintenance',
  INSPECTION = 'Inspection',
  INSURANCE = 'Insurance',
  IDENTITY = 'Identity',
  CORRESPONDENCE = 'Correspondence',
  OTHER = 'Other'
}

export enum DocumentType {
  LEASE_AGREEMENT = 'lease_agreement',
  ADDENDUM = 'addendum',
  RECEIPT = 'receipt',
  INVOICE = 'invoice',
  INSPECTION_REPORT = 'inspection_report',
  MAINTENANCE_REPORT = 'maintenance_report',
  INSURANCE_POLICY = 'insurance_policy',
  ID_COPY = 'id_copy',
  BANK_STATEMENT = 'bank_statement',
  EMPLOYMENT_LETTER = 'employment_letter',
  REFERENCE_LETTER = 'reference_letter',
  PHOTO = 'photo',
  OTHER = 'other'
}

export enum DocumentStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  EXPIRED = 'expired',
  PENDING_REVIEW = 'pending_review',
  REJECTED = 'rejected'
}

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule
  ],
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DocumentsComponent implements OnInit, OnDestroy {
  @Input() collapsedSections!: Set<string>;
  @Input() animatingSections!: Set<string>;
  
  @Output() backClick = new EventEmitter<void>();
  @Output() sectionToggle = new EventEmitter<string>();

  // Component state
  selectedCategory: string = '';
  searchQuery: string = '';
  viewMode: 'grid' | 'list' = 'grid';
  sortBy: 'name' | 'date' | 'category' | 'size' = 'date';
  sortOrder: 'asc' | 'desc' = 'desc';
  isLoading: boolean = false;
  selectedDocuments: Set<string> = new Set();
  showUploadModal: boolean = false;

  // File upload state
  dragOverActive: boolean = false;
  uploadProgress: number = 0;
  uploadingFiles: File[] = [];

  // Documents data
  documents: Document[] = [
    {
      id: '1',
      name: 'Lease Agreement - 2024',
      originalName: 'lease_agreement_2024.pdf',
      category: DocumentCategory.LEGAL,
      type: DocumentType.LEASE_AGREEMENT,
      url: '/assets/documents/lease_agreement_2024.pdf',
      size: '2.4 MB',
      mimeType: 'application/pdf',
      uploadedBy: 'Sarah Johnson (Landlord)',
      uploadedDate: 'Jan 15, 2024',
      description: 'Main lease agreement for the property at 123 Main Street',
      tags: ['lease', 'contract', '2024'],
      isPublic: false,
      version: 1,
      status: DocumentStatus.ACTIVE,
      downloadCount: 5,
      lastAccessed: 'Feb 10, 2024'
    },
    {
      id: '2',
      name: 'Security Deposit Receipt',
      originalName: 'deposit_receipt_001.pdf',
      category: DocumentCategory.FINANCIAL,
      type: DocumentType.RECEIPT,
      url: '/assets/documents/deposit_receipt.pdf',
      size: '856 KB',
      mimeType: 'application/pdf',
      uploadedBy: 'Property Management',
      uploadedDate: 'Jan 15, 2024',
      description: 'Receipt for security deposit payment',
      tags: ['deposit', 'receipt', 'payment'],
      isPublic: false,
      version: 1,
      status: DocumentStatus.ACTIVE,
      downloadCount: 3,
      lastAccessed: 'Jan 20, 2024'
    },
    {
      id: '3',
      name: 'Move-in Inspection Report',
      originalName: 'inspection_report_movein.pdf',
      category: DocumentCategory.INSPECTION,
      type: DocumentType.INSPECTION_REPORT,
      url: '/assets/documents/inspection_report.pdf',
      size: '1.2 MB',
      mimeType: 'application/pdf',
      uploadedBy: 'David Kamau (Inspector)',
      uploadedDate: 'Feb 1, 2024',
      description: 'Property condition report at move-in',
      tags: ['inspection', 'move-in', 'condition'],
      isPublic: false,
      version: 1,
      status: DocumentStatus.ACTIVE,
      downloadCount: 2,
      lastAccessed: 'Feb 5, 2024'
    },
    {
      id: '4',
      name: 'Property Insurance Policy',
      originalName: 'insurance_policy_2024.pdf',
      category: DocumentCategory.INSURANCE,
      type: DocumentType.INSURANCE_POLICY,
      url: '/assets/documents/insurance_policy.pdf',
      size: '950 KB',
      mimeType: 'application/pdf',
      uploadedBy: 'Insurance Company',
      uploadedDate: 'Jan 20, 2024',
      description: 'Property insurance coverage details',
      tags: ['insurance', 'policy', 'coverage'],
      isPublic: false,
      expiryDate: 'Jan 20, 2025',
      version: 1,
      status: DocumentStatus.ACTIVE,
      downloadCount: 1,
      lastAccessed: 'Jan 25, 2024'
    },
    {
      id: '5',
      name: 'Rent Payment - February 2024',
      originalName: 'rent_receipt_feb_2024.pdf',
      category: DocumentCategory.FINANCIAL,
      type: DocumentType.RECEIPT,
      url: '/assets/documents/rent_receipt_feb.pdf',
      size: '420 KB',
      mimeType: 'application/pdf',
      uploadedBy: 'Payment System',
      uploadedDate: 'Feb 15, 2024',
      description: 'Monthly rent payment receipt',
      tags: ['rent', 'receipt', 'february'],
      isPublic: false,
      version: 1,
      status: DocumentStatus.ACTIVE,
      downloadCount: 1
    },
    {
      id: '6',
      name: 'Maintenance Request Photos',
      originalName: 'maintenance_photos.zip',
      category: DocumentCategory.MAINTENANCE,
      type: DocumentType.PHOTO,
      url: '/assets/documents/maintenance_photos.zip',
      size: '3.1 MB',
      mimeType: 'application/zip',
      uploadedBy: 'John Doe (Tenant)',
      uploadedDate: 'Feb 8, 2024',
      description: 'Photos documenting plumbing issue in kitchen',
      tags: ['maintenance', 'photos', 'plumbing'],
      isPublic: false,
      version: 1,
      status: DocumentStatus.ACTIVE,
      downloadCount: 4,
      lastAccessed: 'Feb 12, 2024'
    }
  ];

  // Category options
  categoryOptions = Object.values(DocumentCategory);

  fileIcons: { [key: string]: string } = {
    'application/pdf': 'picture_as_pdf',
    'application/msword': 'description',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'description',
    'application/vnd.ms-excel': 'table_chart',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'table_chart',
    'image/jpeg': 'image',
    'image/png': 'image',
    'image/gif': 'image',
    'application/zip': 'folder_zip',
    'default': 'insert_drive_file'
  };

  ngOnInit(): void {
    this.loadDocuments();
  }

  ngOnDestroy(): void {
    // Clean up any subscriptions or timers
  }

  // Navigation methods
  goBack(): void {
    this.backClick.emit();
  }

  // Section management
  isSectionCollapsed(sectionId: string): boolean {
    return this.collapsedSections?.has(sectionId) || false;
  }

  isAnimating(sectionId: string): boolean {
    return this.animatingSections?.has(sectionId) || false;
  }

  toggleSection(sectionId: string): void {
    this.sectionToggle.emit(sectionId);
  }

  // Data loading
  private loadDocuments(): void {
    this.isLoading = true;
    
    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
  }

  // Filtering and searching
  get filteredDocuments(): Document[] {
    let filtered = [...this.documents];

    // Apply category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(doc => doc.category === this.selectedCategory);
    }

    // Apply search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(query) ||
        doc.description?.toLowerCase().includes(query) ||
        doc.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (this.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'date':
          aValue = new Date(a.uploadedDate);
          bValue = new Date(b.uploadedDate);
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        case 'size':
          aValue = this.parseSizeToBytes(a.size);
          bValue = this.parseSizeToBytes(b.size);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return this.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }

  private parseSizeToBytes(size: string): number {
    const units = { 'KB': 1024, 'MB': 1024 * 1024, 'GB': 1024 * 1024 * 1024 };
    const match = size.match(/^(\d+(?:\.\d+)?)\s*(KB|MB|GB)$/);
    if (match) {
      return parseFloat(match[1]) * units[match[2] as keyof typeof units];
    }
    return 0;
  }

  // Search and filter methods
  clearFilters(): void {
    this.selectedCategory = '';
    this.searchQuery = '';
  }

  onCategoryChange(): void {
    // Category filter is reactive through filteredDocuments getter
  }

  onSearchChange(): void {
    // Search is reactive through filteredDocuments getter
  }

  // View management
  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  setSortBy(sortBy: 'name' | 'date' | 'category' | 'size'): void {
    if (this.sortBy === sortBy) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = sortBy;
      this.sortOrder = 'desc';
    }
  }

  // Document actions
  downloadDocument(doc: Document): void {
    console.log('Downloading document:', doc.name);
    
    // Update download count
    doc.downloadCount++;
    doc.lastAccessed = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    // Create download link
    const link = document.createElement('a');
    link.href = doc.url;
    link.download = doc.originalName;
    link.click();
  }

  previewDocument(doc: Document): void {
    console.log('Previewing document:', doc.name);
    
    // Update last accessed
    doc.lastAccessed = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    // Open in new tab for preview
    window.open(doc.url, '_blank');
  }

  shareDocument(doc: Document): void {
    console.log('Sharing document:', doc.name);
    
    if (navigator.share) {
      navigator.share({
        title: doc.name,
        text: doc.description || 'Shared document from RentEase',
        url: doc.url
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(doc.url).then(() => {
        console.log('Document URL copied to clipboard');
        // You could show a toast notification here
      });
    }
  }

  deleteDocument(doc: Document): void {
    if (confirm(`Are you sure you want to delete "${doc.name}"?`)) {
      console.log('Deleting document:', doc.name);
      this.documents = this.documents.filter(d => d.id !== doc.id);
    }
  }

  // Selection methods
  toggleDocumentSelection(docId: string): void {
    if (this.selectedDocuments.has(docId)) {
      this.selectedDocuments.delete(docId);
    } else {
      this.selectedDocuments.add(docId);
    }
  }

  isDocumentSelected(docId: string): boolean {
    return this.selectedDocuments.has(docId);
  }

  selectAllDocuments(): void {
    const filtered = this.filteredDocuments;
    if (this.selectedDocuments.size === filtered.length) {
      this.selectedDocuments.clear();
    } else {
      this.selectedDocuments.clear();
      filtered.forEach(doc => this.selectedDocuments.add(doc.id));
    }
  }

  downloadSelected(): void {
    const selected = this.documents.filter(doc => this.selectedDocuments.has(doc.id));
    selected.forEach(doc => this.downloadDocument(doc));
    this.selectedDocuments.clear();
  }

  deleteSelected(): void {
    const count = this.selectedDocuments.size;
    if (confirm(`Are you sure you want to delete ${count} selected document${count > 1 ? 's' : ''}?`)) {
      this.documents = this.documents.filter(doc => !this.selectedDocuments.has(doc.id));
      this.selectedDocuments.clear();
    }
  }

  // File upload methods
  openUploadModal(): void {
    this.showUploadModal = true;
  }

  closeUploadModal(): void {
    this.showUploadModal = false;
    this.uploadingFiles = [];
    this.uploadProgress = 0;
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOverActive = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragOverActive = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOverActive = false;
    
    if (event.dataTransfer?.files) {
      this.handleFiles(Array.from(event.dataTransfer.files));
    }
  }

  private handleFiles(files: File[]): void {
    this.uploadingFiles = files;
    this.simulateUpload();
  }

  private simulateUpload(): void {
    this.uploadProgress = 0;
    
    const interval = setInterval(() => {
      this.uploadProgress += 10;
      
      if (this.uploadProgress >= 100) {
        clearInterval(interval);
        this.completeUpload();
      }
    }, 200);
  }

  private completeUpload(): void {
    // Add uploaded files to documents list
    this.uploadingFiles.forEach((file, index) => {
      const newDoc: Document = {
        id: Date.now().toString() + index,
        name: file.name.split('.')[0],
        originalName: file.name,
        category: DocumentCategory.OTHER,
        type: DocumentType.OTHER,
        url: URL.createObjectURL(file),
        size: this.formatFileSize(file.size),
        mimeType: file.type,
        uploadedBy: 'You',
        uploadedDate: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        tags: [],
        isPublic: false,
        version: 1,
        status: DocumentStatus.ACTIVE,
        downloadCount: 0
      };
      
      this.documents.unshift(newDoc);
    });
    
    this.closeUploadModal();
  }

  // CHANGED: Made this method public instead of private
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Utility methods
  getFileIcon(mimeType: string): string {
    return this.fileIcons[mimeType] || this.fileIcons['default'];
  }

  getStatusClass(status: DocumentStatus): string {
    const statusMap = {
      [DocumentStatus.ACTIVE]: 'status-success',
      [DocumentStatus.ARCHIVED]: 'status-info',
      [DocumentStatus.EXPIRED]: 'status-danger',
      [DocumentStatus.PENDING_REVIEW]: 'status-warning',
      [DocumentStatus.REJECTED]: 'status-danger'
    };
    return statusMap[status] || 'status-default';
  }

  getCategoryColor(category: DocumentCategory): string {
    const colorMap = {
      [DocumentCategory.LEGAL]: '#3b82f6',
      [DocumentCategory.FINANCIAL]: '#10b981',
      [DocumentCategory.MAINTENANCE]: '#f59e0b',
      [DocumentCategory.INSPECTION]: '#8b5cf6',
      [DocumentCategory.INSURANCE]: '#ef4444',
      [DocumentCategory.IDENTITY]: '#06b6d4',
      [DocumentCategory.CORRESPONDENCE]: '#84cc16',
      [DocumentCategory.OTHER]: '#64748b'
    };
    return colorMap[category] || '#64748b';
  }

  isExpiringSoon(doc: Document): boolean {
    if (!doc.expiryDate) return false;
    
    const expiryDate = new Date(doc.expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  }

  isExpired(doc: Document): boolean {
    if (!doc.expiryDate) return false;
    
    const expiryDate = new Date(doc.expiryDate);
    const today = new Date();
    
    return today > expiryDate;
  }

  // Analytics
  getTotalDocuments(): number {
    return this.documents.length;
  }

  getTotalSize(): string {
    const totalBytes = this.documents.reduce((total, doc) => {
      return total + this.parseSizeToBytes(doc.size);
    }, 0);
    
    return this.formatFileSize(totalBytes);
  }

  getDocumentsByCategory(): { category: string, count: number }[] {
    const categoryCount: { [key: string]: number } = {};
    
    this.documents.forEach(doc => {
      categoryCount[doc.category] = (categoryCount[doc.category] || 0) + 1;
    });
    
    return Object.entries(categoryCount).map(([category, count]) => ({
      category,
      count
    }));
  }

  // Error handling
  handleError(error: any, context: string): void {
    console.error(`Error in documents component - ${context}:`, error);
  }

  // Accessibility
  getAriaLabel(sectionId: string): string {
    const collapsed = this.isSectionCollapsed(sectionId);
    return `${collapsed ? 'Expand' : 'Collapse'} ${sectionId} section`;
  }

  // Track by functions for performance
  trackByDocumentId(index: number, doc: Document): string {
    return doc.id;
  }

  trackByCategoryId(index: number, category: string): string {
    return category;
  }
}