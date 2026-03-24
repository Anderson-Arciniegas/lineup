import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';

import type { ProductSchema } from '../../schemas';

@Component({
  selector: 'lib-product-expanded-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './product-expanded-item.html',
  styleUrl: './product-expanded-item.scss',
  host: { class: 'product-expanded-item' },
})
export class ProductExpandedItem {
  @Input({ required: true }) product!: ProductSchema;

  /** Si es false, no se muestra la descripción. */
  @Input() showDescription = true;
}
