import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss']
})
export class ReviewComponent {
  reviews = [
    { reviewer: 'Tenant A', rating: 4, text: 'Good property, responsive landlord.' },
    { reviewer: 'Tenant B', rating: 5, text: 'Very clean and safe environment.' }
  ];
}
