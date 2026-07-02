import { Pipe, PipeTransform } from '@angular/core';
import { TranslationService } from './translation.service';

@Pipe({ name: 'translate', pure: false })
export class TranslatePipe implements PipeTransform {
  constructor(private i18n: TranslationService) {}

  transform(key: string | null | undefined, params?: Record<string, string | number>): string {
    if (!key) return '';
    return this.i18n.t(key, params);
  }
}
