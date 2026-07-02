import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { LucideAngularModule } from 'lucide-angular';
import { SiteNavComponent } from './components/site-nav/site-nav.component';
import { SiteFooterComponent } from './components/site-footer/site-footer.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { StatusBadgeComponent } from './components/status-badge/status-badge.component';
import { PageLayoutComponent } from './components/page-layout/page-layout.component';
import { FilterBarComponent } from './components/filter-bar/filter-bar.component';
import { ModalComponent } from './components/modal/modal.component';
import { EmojiPickerComponent } from './components/emoji-picker/emoji-picker.component';
import { LanguageSwitcherComponent } from './components/language-switcher/language-switcher.component';
import { LanguageSplashComponent } from './components/language-splash/language-splash.component';
import { TranslatePipe } from '../core/i18n/translate.pipe';

@NgModule({
  declarations: [
    SiteNavComponent,
    SiteFooterComponent,
    PaginationComponent,
    StatusBadgeComponent,
    PageLayoutComponent,
    FilterBarComponent,
    ModalComponent,
    EmojiPickerComponent,
    LanguageSwitcherComponent,
    LanguageSplashComponent,
    TranslatePipe,
  ],
  imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule],
  exports: [
    SiteNavComponent,
    SiteFooterComponent,
    PaginationComponent,
    StatusBadgeComponent,
    PageLayoutComponent,
    FilterBarComponent,
    ModalComponent,
    EmojiPickerComponent,
    LanguageSwitcherComponent,
    LanguageSplashComponent,
    TranslatePipe,
    CommonModule,
    RouterModule,
    FormsModule,
    LucideAngularModule,
  ],
})
export class SharedModule {}
