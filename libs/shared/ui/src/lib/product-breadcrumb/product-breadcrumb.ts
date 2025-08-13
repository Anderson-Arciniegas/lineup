import {
  CommonModule,
  Location
} from '@angular/common';
import {
  Component,
  inject,
  Input
} from '@angular/core';
import { Button } from "../button/button";

@Component({
    selector: 'lib-product-breadcrumb',
    imports: [CommonModule, Button],
    templateUrl: './product-breadcrumb.html',
    styleUrl: './product-breadcrumb.scss',
})
export class ProductBreadcrumb {
    @Input() business: {
        name: string;image: string
    };

    private location = inject(Location);

    goBack(): void {
        this.location.back();
    }

}