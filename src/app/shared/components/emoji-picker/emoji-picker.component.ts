import { Component, EventEmitter, Output, signal } from '@angular/core';

const EMOJIS = [
  '😀','😂','😍','😎','🤔','😢','😮','😡','👍','👏',
  '🙌','🔥','💪','🏊','🏆','🥇','⚡','💧','❤️','🎉',
];

@Component({
  selector: 'app-emoji-picker',
  template: `
    <div class="relative inline-block">
      <button type="button" (click)="open.set(!open())"
        class="px-3 py-2 rounded-full border border-white/20 hover:border-white/40 text-sm transition-colors">
        🙂
      </button>
      @if (open()) {
        <div class="absolute z-20 bottom-full mb-2 left-0 grid grid-cols-5 gap-1 p-3 rounded-lg bg-[#1a0000] border border-white/10 shadow-xl w-[220px]">
          @for (e of EMOJIS; track e) {
            <button type="button" (click)="select(e)" class="text-lg p-1.5 rounded hover:bg-white/10 transition-colors">{{ e }}</button>
          }
        </div>
      }
    </div>
  `
})
export class EmojiPickerComponent {
  @Output() picked = new EventEmitter<string>();
  readonly open = signal(false);
  readonly EMOJIS = EMOJIS;

  select(e: string): void {
    this.picked.emit(e);
    this.open.set(false);
  }
}
