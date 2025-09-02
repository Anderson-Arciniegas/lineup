import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';
import { Button, ProductBreadcrumb } from '@lineup/ui';
import { generateRandomProducts, IVariation, IVariationOption, Product } from '@lineup/core';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { PanelModule } from 'primeng/panel';
import { MenuModule } from 'primeng/menu';
import { ChipModule } from 'primeng/chip';
import { EditorModule } from 'primeng/editor';

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
        EditorModule
    ],
    templateUrl: './create-product-page.html',
    styleUrl: './create-product-page.scss',
})
export class CreateProductPage implements OnInit {
    business = {
        name: 'Tu Punto vShop',
        image: 'assets/images/vShop.jpg'
    };
    product: Product | undefined;
    value = 'Baltimore Ravens Jerseys';
    isDragging = false;
    urls: string[] = [];
    price = 0;
    prices: { label: string, icon: string, value: number }[] = [
        { label: 'general.noPrice', icon: 'pi pi-ban', value: 1 },
        { label: 'Euro', icon: 'pi pi-euro', value: 2 },
        { label: 'Dollar', icon: 'pi pi-dollar', value: 3 },
        { label: 'Bolivares', icon: 'pi pi-money-bill', value: 4 },
    ];
    selectedPrice = this.prices[2];
    variationName = '';
    variationValue = '';
    variations: IVariation[] = [];

    ngOnInit() { this.product = generateRandomProducts(1)[0]; }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.handleFile(input.files[0]);
            input.value = '';
        }
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
            variations: []
        };
        this.variations.push(variation);
    }

    addVariationValue(variation: IVariation) {
        variation.variations.push({ name: 'aqui', primary: false });
    }

    removeVariation(index: number) {
        this.variations.splice(index, 1);
    }

    removeVariationValue(
        variation: IVariationOption[],
        valueIndex: number
    ) {
        variation.splice(valueIndex, 1);
    }
}
