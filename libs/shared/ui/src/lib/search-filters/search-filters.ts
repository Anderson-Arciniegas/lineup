import {
    CommonModule
} from '@angular/common';
import {
    Component,
    OnInit
} from '@angular/core';
import {
    TreeNode
} from 'primeng/api';
import { InputNumberModule } from 'primeng/inputnumber';
import {
    TreeModule
} from 'primeng/tree';
import { Button } from "../button/button";

@Component({
    selector: 'lib-search-filters',
    imports: [CommonModule, TreeModule, InputNumberModule, Button],
    templateUrl: './search-filters.html',
    styleUrl: './search-filters.scss',
})
export class SearchFilters implements OnInit {
    files!: TreeNode[];
    selectedFile!: TreeNode[];

    ngOnInit() {
        this.files = [{

                label: 'Ubicacion',
                icon: 'pi pi-fw pi-map-marker',
                styleClass: 'search-filter-head',
                selectable: false,
                data: 0,
                children: [{
                        label: 'Distrito Capital',
                        styleClass: 'search-filter'
                    },
                    {
                        label: 'Cababobo',
                        styleClass: 'search-filter'
                    },
                    {
                        label: 'Maracay',
                        styleClass: 'search-filter'
                    },
                    {
                        label: 'Lara',
                        styleClass: 'search-filter'
                    }
                ]
            },
            {
                label: 'Entrega',
                icon: 'pi pi-fw pi-box',
                selectable: false,
                data: 1,
                
                styleClass: 'search-filter-head',
                 children: [{
                        label: 'Tienda fisica',
                        styleClass: 'search-filter'
                    },
                    {
                        label: 'Personal',
                        styleClass: 'search-filter'
                    },
                    {
                        label: 'Delivery',
                        styleClass: 'search-filter'
                    },
                    {
                        label: 'Envio nacional',
                        styleClass: 'search-filter'
                    },
                ]
            },
        ];
    }

    select(event: any) {
        console.log('Selected File: ', event);
    }
    
    onNodeExpand(event: any){
        console.log('Node Expanded: ', event);
        console.log(this.selectedFile)
        
        this.files.map((filter) => {
          if (filter.data !== event.node.data) {
              filter.expanded = false;
          }
        })
    }
}