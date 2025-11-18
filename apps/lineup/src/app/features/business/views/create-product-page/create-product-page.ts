import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  generateRandomProducts,
  IVariation,
  IVariationOption,
  Product,
} from '@lineup/core';
import { Button, ImageCropper, ProductBreadcrumb } from '@lineup/ui';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { DialogModule } from 'primeng/dialog';
import { EditorModule } from 'primeng/editor';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { OrderListModule } from 'primeng/orderlist';
import { PanelModule } from 'primeng/panel';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-create-product-page',
  imports: [
    CommonModule,
    SkeletonModule,
    ProductBreadcrumb,
    InputTextModule,
    FormsModule,
    TranslateModule,
    ButtonModule,
    TextareaModule,
    InputNumberModule,
    SelectModule,
    Button,
    PanelModule,
    MenuModule,
    ChipModule,
    EditorModule,
    ImageCropper,
    DialogModule,
    OrderListModule,
  ],
  templateUrl: './create-product-page.html',
  styleUrl: './create-product-page.scss',
})
export class CreateProductPage implements OnInit {
  private _cdr = Inject(ChangeDetectorRef);
  business = {
    name: 'Tu Punto vShop',
    image: 'assets/images/vShop.jpg',
  };
  product: Product | undefined;
  value = 'Baltimore Ravens Jerseys';
  isDragging = false;
  urls: string[] = [];
  price = 0;
  prices: { label: string; icon: string; value: number }[] = [
    { label: 'general.noPrice', icon: 'pi pi-ban', value: 1 },
    { label: 'Euro', icon: 'pi pi-euro', value: 2 },
    { label: 'Dollar', icon: 'pi pi-dollar', value: 3 },
    { label: 'Bolivares', icon: 'pi pi-money-bill', value: 4 },
  ];
  selectedPrice = this.prices[2];
  variationName = '';
  variationValue = '';
  variations: IVariation[] = [];
  cropperVisible = false;

  ngOnInit() {
    this.product = generateRandomProducts(1)[0];
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
      input.value = '';
    }
  }

  onCropped($event) {
    console.log($event);
    this.urls = [...this.urls, $event as string];
    this.cropperVisible = false;
    this._cdr.detectChanges();
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  removeImage(index: number) {
    this.urls.splice(index, 1);
  }

  handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten imágenes');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const previewUrl = reader.result as string;
      this.urls.push(previewUrl);
    };
    reader.readAsDataURL(file);
  }

  addVariation() {
    const variation: IVariation = {
      name: this.variationName,
      variations: [],
    };
    this.variations.push(variation);
  }

  addVariationValue(variation: IVariation) {
    variation.variations.push({ name: 'aqui', primary: false });
  }

  removeVariation(index: number) {
    this.variations.splice(index, 1);
  }

  removeVariationValue(variation: IVariationOption[], valueIndex: number) {
    variation.splice(valueIndex, 1);
  }

  onImageReorder($event) {
    console.log($event);
  }
}
