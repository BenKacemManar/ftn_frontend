import { Injectable } from '@angular/core';
import { Reservation } from '../../../core/models/reservation.model';

@Injectable({ providedIn: 'root' })
export class ReservationExportService {

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
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    this.triggerDownload(blob, filename);
  }

  exportPdf(reservations: Reservation[], title = 'Planning des réservations', subtitle = ''): void {
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;

    const rows = reservations.map(r => `
      <tr>
        <td>${this.formatDate(r.date)}</td>
        <td>${r.heureDebut?.substring(0, 5) ?? '—'} → ${r.heureFin?.substring(0, 5) ?? '—'}</td>
        <td>${r.reserveePar ?? '—'}</td>
        <td>${r.typeReservation === 'CLUB' ? `Club — ${r.nomClub ?? ''}` : 'Athlète'}</td>
        <td>${r.poolNom ?? '—'} (${r.poolVille ?? ''})</td>
        <td>${this.laneLabel(r)}</td>
        <td class="status-${r.statut}">${this.statusLabel(r.statut)}</td>
      </tr>`).join('');

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; color: #111; padding: 32px; font-size: 13px; }
    .header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
    .logo-block h1 { font-size: 20px; font-weight: bold; }
    .logo-block p { color: #777; font-size: 12px; margin-top: 4px; }
    .meta { text-align: right; font-size: 11px; color: #999; }
    .bar { height: 3px; background: linear-gradient(90deg, #E10600 50%, #D4AF37 50%); margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; }
    thead tr { background: #1a1a1a; color: #fff; }
    thead th { padding: 9px 10px; text-align: left; font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; font-weight: 600; }
    tbody tr:nth-child(even) { background: #f9f9f9; }
    tbody td { padding: 8px 10px; border-bottom: 1px solid #eee; }
    .status-CONFIRMEE { color: #059669; font-weight: 600; }
    .status-EN_ATTENTE { color: #d97706; font-weight: 600; }
    .status-ANNULEE { color: #dc2626; }
    .footer { margin-top: 24px; font-size: 11px; color: #aaa; display: flex; justify-content: space-between; }
    .total { margin-top: 16px; font-size: 12px; color: #555; }
    @media print {
      .no-print { display: none !important; }
      body { padding: 16px; }
    }
    .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 18px; background: #E10600;
      color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; margin-bottom: 20px; }
    .btn:hover { background: #b30000; }
  </style>
</head>
<body>
  <button class="btn no-print" onclick="window.print()">⬇ Télécharger PDF</button>
  <div class="header">
    <div class="logo-block">
      <h1>Espérance Sportive de Tunis — Natation</h1>
      <p>${title}${subtitle ? ' · ' + subtitle : ''}</p>
    </div>
    <div class="meta">
      Édité le ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}<br>
      ${reservations.length} réservation(s)
    </div>
  </div>
  <div class="bar"></div>
  <table>
    <thead>
      <tr>
        <th>Date</th><th>Horaire</th><th>Demandeur</th><th>Type</th><th>Piscine</th><th>Couloir(s)</th><th>Statut</th>
      </tr>
    </thead>
    <tbody>${rows || '<tr><td colspan="7" style="text-align:center;padding:20px;color:#999">Aucune réservation</td></tr>'}</tbody>
  </table>
  <div class="total">Total : ${reservations.length} réservation(s) — ${reservations.filter(r => r.statut === 'CONFIRMEE').length} confirmée(s) · ${reservations.filter(r => r.statut === 'EN_ATTENTE').length} en attente</div>
  <div class="footer">
    <span>Fédération Tunisienne de Natation · Section EST</span>
    <span>Document généré automatiquement</span>
  </div>
</body>
</html>`;

    win.document.write(html);
    win.document.close();
    win.onload = () => win.print();
  }

  downloadReceipt(r: Reservation): void {
    const win = window.open('', '_blank', 'width=600,height=700');
    if (!win) return;
    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Reçu de réservation #${r.id}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #111; }
    h1 { font-size: 22px; margin-bottom: 4px; }
    .sub { color: #777; font-size: 13px; margin-bottom: 24px; }
    hr { border: none; border-top: 2px solid #C8102E; margin: 16px 0 24px; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 10px 8px; border-bottom: 1px solid #eee; font-size: 14px; }
    td:first-child { font-weight: bold; width: 140px; color: #444; }
    .footer { margin-top: 32px; color: #999; font-size: 12px; }
    @media print { button { display: none; } }
  </style>
</head>
<body>
  <h1>Reçu de réservation</h1>
  <div class="sub">Réservation N° ${r.id} &mdash; Émis le ${new Date().toLocaleDateString('fr-FR')}</div>
  <hr>
  <table>
    <tr><td>Statut</td><td>${this.statusLabel(r.statut)}</td></tr>
    <tr><td>Demandeur</td><td>${r.reserveePar}</td></tr>
    <tr><td>Type</td><td>${r.typeReservation === 'CLUB' ? `Club — ${r.nomClub ?? ''}` : 'Athlète'}</td></tr>
    <tr><td>Piscine</td><td>${r.poolNom ?? ''} (${r.poolVille ?? ''})</td></tr>
    <tr><td>Date</td><td>${this.formatDate(r.date)}</td></tr>
    <tr><td>Horaire</td><td>${r.heureDebut?.substring(0, 5) ?? ''} → ${r.heureFin?.substring(0, 5) ?? ''}</td></tr>
    <tr><td>Couloir(s)</td><td>${this.laneLabel(r)}</td></tr>
    ${r.notes ? `<tr><td>Notes</td><td>${r.notes}</td></tr>` : ''}
  </table>
  <div class="footer">Ce reçu confirme votre créneau réservé. Présentez-le si demandé sur place.</div>
  <br>
  <button onclick="window.print()">Imprimer</button>
</body>
</html>`;
    win.document.write(html);
    win.document.close();
  }

  private statusLabel(s: string): string {
    return ({ EN_ATTENTE: 'En attente', CONFIRMEE: 'Confirmée', ANNULEE: 'Refusée' } as any)[s] ?? s;
  }

  laneLabel(r: Reservation): string {
    if (r.numerosCouloirs?.length) return 'Couloirs ' + r.numerosCouloirs.join(', ');
    if (r.numeroCouloir) return 'Couloir ' + r.numeroCouloir;
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
