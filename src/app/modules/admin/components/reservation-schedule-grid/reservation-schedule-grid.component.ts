import { Component, ElementRef, HostListener, OnDestroy, OnInit } from '@angular/core';import { ApiService } from '../../../../core/services/api.service';
import { ReservationService } from '../../../reservations/services/reservation.service';
import { Reservation } from '../../../../core/models/reservation.model';

interface ScheduleBlock {
  reservation: Reservation;
  startMinutes: number;
  durationMinutes: number;
}

interface PendingRow {
  blocks: ScheduleBlock[];
}

interface HourMark {
  hour: number;
  leftPx: number;
}

@Component({
  selector: 'app-reservation-schedule-grid',
  templateUrl: './reservation-schedule-grid.component.html',
  styleUrls: ['./reservation-schedule-grid.component.scss']
})
export class ReservationScheduleGridComponent implements OnInit, OnDestroy {

  // Day window shown on the grid. No opening-hours field exists on Pool yet,
  // so this is a fixed assumption — change these two if pools open earlier/later.
  readonly DAY_START_HOUR = 6;
  readonly DAY_END_HOUR = 22;
  readonly PX_PER_MINUTE = 1.5; // 90px per hour column

  pools: any[] = [];
  selectedPoolId: number | null = null;
  selectedDate: string = new Date().toISOString().split('T')[0];
    poolDropdownOpen = false;
  loading = false;
  error = '';

  laneNumbers: number[] = [];
  laneBlocks: Record<number, ScheduleBlock | null> = {};
  pendingRows: PendingRow[] = [];
  hourMarks: HourMark[] = [];
  timelineWidthPx = 0;
  nowLinePx: number | null = null;

  private nowInterval?: ReturnType<typeof setInterval>;

 constructor(
    private api: ApiService,
    private reservationService: ReservationService,
    private elRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.buildHourMarks();
    this.updateNowLine();
    this.nowInterval = setInterval(() => this.updateNowLine(), 60000);
    this.loadPools();
  }

  ngOnDestroy(): void {
    if (this.nowInterval) clearInterval(this.nowInterval);
  }

  get selectedPool(): any {
    return this.pools.find(p => p.id === Number(this.selectedPoolId));
  }

  get formattedSelectedDate(): string {
    const d = new Date(this.selectedDate + 'T00:00:00');
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  }

  private buildHourMarks(): void {
    this.hourMarks = [];
    for (let h = this.DAY_START_HOUR; h <= this.DAY_END_HOUR; h++) {
      this.hourMarks.push({ hour: h, leftPx: (h - this.DAY_START_HOUR) * 60 * this.PX_PER_MINUTE });
    }
    this.timelineWidthPx = (this.DAY_END_HOUR - this.DAY_START_HOUR) * 60 * this.PX_PER_MINUTE;
  }

  private loadPools(): void {
    this.api.get<any>('/pools/actives').subscribe({
      next: (res) => {
        this.pools = res;
        if (this.pools.length) {
          this.selectedPoolId = this.pools[0].id;
          this.load();
        }
      },
      error: () => this.error = 'Impossible de charger les piscines.'
    });
  }

  onPoolChange(): void { this.load(); }
  onDateChange(): void { this.load(); }

togglePoolDropdown(): void {
    this.poolDropdownOpen = !this.poolDropdownOpen;
  }

  selectPool(id: number): void {
    this.selectedPoolId = id;
    this.poolDropdownOpen = false;
    this.onPoolChange();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.poolDropdownOpen && !this.elRef.nativeElement.contains(event.target)) {
      this.poolDropdownOpen = false;
    }
  }

  shiftDate(deltaDays: number): void {
    const d = new Date(this.selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + deltaDays);
    this.selectedDate = d.toISOString().split('T')[0];
    this.load();
  }

  goToday(): void {
    this.selectedDate = new Date().toISOString().split('T')[0];
    this.load();
  }

  load(): void {
    if (!this.selectedPoolId) return;
    this.loading = true;
    this.error = '';

    const pool = this.selectedPool;
    const laneCount = pool?.nbCouloirs ?? pool?.nb_couloirs ?? 0;
    this.laneNumbers = Array.from({ length: laneCount }, (_, i) => i + 1);

    this.reservationService.getByPool(this.selectedPoolId).subscribe({
      next: (all) => {
        const dayReservations = all.filter(r => r.date === this.selectedDate && r.statut !== 'ANNULEE');
        this.buildGrid(dayReservations);
        this.updateNowLine();
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger les réservations.';
        this.loading = false;
      }
    });
  }

  private laneNumbersFor(r: Reservation): number[] {
    if (r.numerosCouloirs?.length) return r.numerosCouloirs;
    if (r.numeroCouloir) return [r.numeroCouloir];
    return [];
  }

  private toBlock(r: Reservation): ScheduleBlock {
    const dayStart = this.DAY_START_HOUR * 60;
    const dayEnd = this.DAY_END_HOUR * 60;

    const start = Math.max(this.toMinutes(r.heureDebut), dayStart);
    const end = Math.min(this.toMinutes(r.heureFin), dayEnd);

    return {
      reservation: r,
      startMinutes: start,
      durationMinutes: Math.max(end - start, 15) // floor so very short slots stay visible/clickable
    };
  }

  private toMinutes(time: string): number {
    if (!time) return 0;
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  private buildGrid(reservations: Reservation[]): void {
    this.laneBlocks = {};
    this.laneNumbers.forEach(n => this.laneBlocks[n] = null);

    const pending: Reservation[] = [];

    for (const r of reservations) {
      const lanes = this.laneNumbersFor(r);
      if (r.statut === 'CONFIRMEE' && lanes.length) {
        const block = this.toBlock(r);
        lanes.forEach(lane => {
          if (this.laneBlocks.hasOwnProperty(lane)) this.laneBlocks[lane] = block;
        });
      } else {
        // EN_ATTENTE — no lane assigned yet, can't place on a specific row
        pending.push(r);
      }
    }

    this.pendingRows = this.packIntoRows(pending);
  }

  // Greedy interval partitioning: pack overlapping pending requests into the
  // minimum number of stacked rows so nothing overlaps visually.
  private packIntoRows(reservations: Reservation[]): PendingRow[] {
    const blocks = reservations
      .map(r => this.toBlock(r))
      .sort((a, b) => a.startMinutes - b.startMinutes);

    const rows: PendingRow[] = [];

    for (const block of blocks) {
      const row = rows.find(row => {
        const last = row.blocks[row.blocks.length - 1];
        return last.startMinutes + last.durationMinutes <= block.startMinutes;
      });
      if (row) {
        row.blocks.push(block);
      } else {
        rows.push({ blocks: [block] });
      }
    }

    return rows;
  }

  private updateNowLine(): void {
    const isToday = this.selectedDate === new Date().toISOString().split('T')[0];
    if (!isToday) { this.nowLinePx = null; return; }

    const now = new Date();
    const minutesNow = now.getHours() * 60 + now.getMinutes();
    const dayStart = this.DAY_START_HOUR * 60;
    const dayEnd = this.DAY_END_HOUR * 60;

    this.nowLinePx = (minutesNow < dayStart || minutesNow > dayEnd)
      ? null
      : (minutesNow - dayStart) * this.PX_PER_MINUTE;
  }

  leftFor(block: ScheduleBlock): number {
    return (block.startMinutes - this.DAY_START_HOUR * 60) * this.PX_PER_MINUTE;
  }

  widthFor(block: ScheduleBlock): number {
    return block.durationMinutes * this.PX_PER_MINUTE;
  }

  formatTime(time: string): string {
    return time ? time.substring(0, 5) : '—';
  }

  statusLabel(s: string): string {
    return ({ EN_ATTENTE: 'En attente', CONFIRMEE: 'Confirmée', ANNULEE: 'Refusée' } as any)[s] ?? s;
  }

  whoLabel(r: Reservation): string {
    return r.typeReservation === 'CLUB' ? (r.nomClub || 'Club') : r.reserveePar;
  }

  tooltipFor(r: Reservation): string {
    return `${this.whoLabel(r)}\n${this.formatTime(r.heureDebut)} → ${this.formatTime(r.heureFin)}\n${this.statusLabel(r.statut)}`;
  }
}