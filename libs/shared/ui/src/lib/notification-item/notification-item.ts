import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import type { NotificationSchema } from '@lineup/core';

@Component({
  selector: 'lib-notification-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-item.html',
  styleUrl: './notification-item.scss',
})
export class NotificationItem {
  @Input({ required: true }) notification!: NotificationSchema;
  @Output() markRead = new EventEmitter<number>();

  protected onActivate(): void {
    if (!this.notification.readAt) {
      this.markRead.emit(this.notification.id);
    }
  }
}
