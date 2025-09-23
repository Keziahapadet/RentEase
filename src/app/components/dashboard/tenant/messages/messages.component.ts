import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent {
  messages = [
    { from: 'Landlord', text: 'Your rent payment was received.', time: '2h ago' },
    { from: 'System', text: 'Maintenance request updated.', time: '1d ago' }
  ];
}
