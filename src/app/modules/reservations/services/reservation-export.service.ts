import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Reservation } from '../../../core/models/reservation.model';

@Injectable({ providedIn: 'root' })
export class ReservationExportService {

  // ---------- CSV (admin schedule export) ----------

  exportCsv(reservations: Reservation[], filename = 'reservations.csv'): void {
    const headers = ['Demandeur', 'Piscine', 'Ville', 'Date', 'Début', 'Fin', 'Type', 'Club', 'Couloirs', 'Statut', 'Notes'];

    const rows = reservations.map(r => [
      r.reserveePar,
      r.poolNom,
      r.poolVille,
      this.formatDate(r.date),
      r.heureDebut?.substring(0, 5) ?? '',
      r.heureFin?.substring(0, 5) ?? '',
      r.typeReservation === 'CLUB' ? 'Club' : 'Athlète',
      r.nomClub ?? '',
      this.laneLabel(r),
      this.statusLabel(r.statut),
      r.notes ?? ''
    ]);

    const escape = (val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`;
    const csv = [headers, ...rows].map(row => row.map(escape).join(',')).join('\r\n');

    // \ufeff = UTF-8 BOM, otherwise Excel mangles accented characters (é, à, ç...)
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    this.triggerDownload(blob, filename);
  }

  // ---------- PDF schedule (admin, multi-row table) ----------

  exportSchedulePdf(reservations: Reservation[], title: string, filename = 'planning.pdf'): void {
    const doc = new jsPDF({ orientation: 'landscape' });

    doc.setFontSize(16);
    doc.text(title, 14, 15);
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} — ${reservations.length} réservation(s)`, 14, 21);

    autoTable(doc, {
      startY: 27,
      head: [['Demandeur', 'Piscine', 'Date', 'Horaire', 'Type', 'Club', 'Couloirs', 'Statut']],
      body: reservations.map(r => [
        r.reserveePar,
        `${r.poolNom ?? ''}${r.poolVille ? ' (' + r.poolVille + ')' : ''}`,
        this.formatDate(r.date),
        `${r.heureDebut?.substring(0, 5) ?? ''} → ${r.heureFin?.substring(0, 5) ?? ''}`,
        r.typeReservation === 'CLUB' ? 'Club' : 'Athlète',
        r.nomClub ?? '—',
        this.laneLabel(r),
        this.statusLabel(r.statut)
      ]),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [200, 16, 46] }, // matches the app's accent red
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    doc.save(filename);
  }

  // ---------- PDF receipt (single reservation, for the person who booked) ----------

  downloadReceipt(r: Reservation): void {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Reçu de réservation', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`Réservation N° ${r.id}`, 14, 27);
    doc.text(`Émis le ${new Date().toLocaleDateString('fr-FR')}`, 14, 32);

    doc.setDrawColor(200, 16, 46);
    doc.line(14, 36, 196, 36);

    autoTable(doc, {
      startY: 42,
      theme: 'plain',
      styles: { fontSize: 11, cellPadding: 4 },
      body: [
        ['Statut', this.statusLabel(r.statut)],
        ['Demandeur', r.reserveePar],
        ['Type', r.typeReservation === 'CLUB' ? `Club — ${r.nomClub ?? ''}` : 'Athlète'],
        ['Piscine', `${r.poolNom ?? ''} (${r.poolVille ?? ''})`],
        ['Date', this.formatDate(r.date)],
        ['Horaire', `${r.heureDebut?.substring(0, 5) ?? ''} → ${r.heureFin?.substring(0, 5) ?? ''}`],
        ['Couloir(s)', this.laneLabel(r)],
        ...(r.notes ? [['Notes', r.notes]] : [])
      ],
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 45 } }
    });

    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(
      'Ce reçu confirme votre créneau réservé. Présentez-le si demandé sur place.',
      14,
      doc.internal.pageSize.height - 15
    );

    doc.save(`recu-reservation-${r.id}.pdf`);
  }

  // ---------- helpers ----------

  private statusLabel(s: string): string {
    return ({ EN_ATTENTE: 'En attente', CONFIRMEE: 'Confirmée', ANNULEE: 'Refusée' } as any)[s] ?? s;
  }

  private laneLabel(r: Reservation): string {
    if (r.numerosCouloirs?.length) return r.numerosCouloirs.join(', ');
    if (r.numeroCouloir) return String(r.numeroCouloir);
    return `${r.nbCouloirs ?? '—'} demandé(s)`;
  }

  private formatDate(date: string): string {
    if (!date) return '—';
    const [y, m, d] = date.split('-');
    return `${d}/${m}/${y}`;
  }

  private triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}