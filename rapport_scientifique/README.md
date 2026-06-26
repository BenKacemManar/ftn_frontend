# Rapport Scientifique — Athletix Governance (FTN)

4 files, IEEE conference-paper format:

- `rapport_scientifique_FR.tex` / `rapport_scientifique_EN.tex` — LaTeX (IEEEtran class)
- `rapport_scientifique_FR.docx` / `rapport_scientifique_EN.docx` — Word, two-column IEEE layout

## Compiling the LaTeX files

No LaTeX toolchain is installed on this machine. To get a PDF:

**Overleaf (easiest, no install):**
1. Create a new blank project on overleaf.com
2. Upload the `.tex` file
3. Click "Recompile" (Overleaf has IEEEtran built in)

**Local TeX distribution (MiKTeX / TeX Live):**
```
pdflatex rapport_scientifique_FR.tex
pdflatex rapport_scientifique_FR.tex   # run twice for references/numbering
```

## Notes

- Author block lists all 5 students (1ALINFO1). Tutor name is a placeholder (`[Tuteur à compléter]` / `[Tutor TBD]`) — fill in before final submission.
- Content is synthesized from `rapport_complet_FTN.docx` (étude de l'existant) plus the actual implemented stack (Spring Boot + Liquibase + JWT backend, Angular signals frontend) explored in the codebase.
