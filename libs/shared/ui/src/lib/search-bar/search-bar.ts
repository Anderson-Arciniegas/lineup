import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Button } from '../button/button';

@Component({
  selector: 'lib-search-bar',
  imports: [
    CommonModule,
    IconField,
    InputIcon,
    Button,
    TranslateModule,
    FormsModule,
  ],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.scss',
})
export class SearchBar implements OnInit {
  @Output() searchSubmit = new EventEmitter<string>();
  @Input() shrink = false;
  searchQuery = '';

  ngOnInit(): void {
    if (this.shrink) {
      window.addEventListener('scroll', function () {
        const searchBar = document.querySelector('.search');

        if (window.scrollY > 100) {
          searchBar.classList.add('shrink');
        } else {
          searchBar.classList.remove('shrink');
        }
      });
    }
  }

  onSearchSubmit() {
    this.searchSubmit.emit(this.searchQuery.trim());
  }
}
