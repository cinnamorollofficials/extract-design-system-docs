# TODO — AI Skill: Extract Design System Docs

Target: membuat AI agent skill yang menganalisis 3–5 halaman dari satu situs/produk lalu menghasilkan satu `index.html` mandiri berisi dokumentasi design system, live preview komponen, dan contoh kode.

## Definition of Done — MVP

- [ ] Skill menerima 3–5 URL publik dari satu situs/produk.
- [ ] Skill memeriksa halaman pada viewport desktop dan mobile.
- [ ] Skill mengumpulkan DOM ter-render, computed styles, CSS variables, font metadata, state yang dapat diamati, dan screenshot evidence.
- [ ] Skill menghasilkan primitive tokens dan semantic tokens dengan provenance serta confidence.
- [ ] Skill mengidentifikasi komponen yang berulang lintas halaman beserta variant dan state yang teramati.
- [ ] Skill menghasilkan satu `index.html` yang dapat dibuka tanpa build process atau server.
- [ ] Dokumentasi menampilkan foundations, live preview, variants, contoh HTML/CSS/JS, accessibility notes, provenance, dan confidence.
- [ ] Contoh kode yang ditampilkan sama dengan implementasi yang dirender pada preview.
- [ ] HTML output lolos validasi struktur, tidak memiliki asset path lokal yang rusak, dan dapat digunakan dengan keyboard.
- [ ] Skill folder lolos `quick_validate.py` dan forward-test pada sedikitnya tiga karakteristik situs yang berbeda.

## S0 — Scope dan kontrak

- [ ] `S0.a` Tetapkan nama skill; kandidat awal: `extract-design-system-docs`.
- [ ] `S0.b` Tetapkan lokasi development skill di repository ini.
- [ ] `S0.c` Definisikan prompt yang harus memicu skill.
- [ ] `S0.d` Definisikan prompt yang tidak seharusnya memicu skill.
- [ ] `S0.e` Definisikan input wajib: 3–5 URL dalam satu domain/produk.
- [ ] `S0.f` Definisikan input opsional: viewport, theme, halaman prioritas, output directory, dan kebijakan aset.
- [ ] `S0.g` Tetapkan default viewport: desktop `1440×900` dan mobile `390×844`.
- [ ] `S0.h` Tetapkan output utama: `<output-directory>/index.html`.
- [ ] `S0.i` Tetapkan bahwa CSS, JavaScript, dan data dokumentasi di-inline secara default.
- [ ] `S0.j` Definisikan perilaku untuk login wall, CAPTCHA, rate limit, halaman gagal, dan URL lintas domain.
- [ ] `S0.k` Definisikan aturan aset, font, logo, kode proprietary, dan attribution.
- [ ] `S0.l` Tetapkan non-goals MVP: canvas, WebGL, video UI, rekonstruksi aplikasi penuh, dan state yang tidak dapat diamati.

Exit criteria:

- [ ] Kontrak input/output dan batasan MVP tidak ambigu.
- [ ] Tersedia sedikitnya lima contoh prompt positif dan tiga prompt negatif.

## S1 — Scaffold skill

- [ ] `S1.a` Baca aturan `agents/openai.yaml` dari skill-creator.
- [ ] `S1.b` Jalankan `init_skill.py` dengan resources `scripts,references,assets`.
- [ ] `S1.c` Buat metadata `display_name`, `short_description`, dan `default_prompt`.
- [ ] `S1.d` Tulis description frontmatter yang mencakup aksi dan trigger skill.
- [ ] `S1.e` Jaga `SKILL.md` tetap ringkas, prosedural, dan di bawah 500 baris.
- [ ] `S1.f` Letakkan algoritme, schema, dan aturan rinci di `references/`.
- [ ] `S1.g` Jangan masukkan README, changelog, installation guide, atau TODO ini ke paket skill final.

Struktur target:

```text
extract-design-system-docs/
├── SKILL.md
├── agents/
│   └── openai.yaml
├── scripts/
│   ├── capture-pages.mjs
│   ├── normalize-tokens.mjs
│   ├── infer-components.mjs
│   ├── generate-docs.mjs
│   └── validate-output.mjs
├── references/
│   ├── evidence-schema.md
│   ├── capture-workflow.md
│   ├── token-inference.md
│   ├── component-inference.md
│   ├── confidence-and-provenance.md
│   └── html-output-contract.md
└── assets/
    └── documentation-shell/
```

Exit criteria:

- [ ] Struktur skill dibuat menggunakan `init_skill.py`.
- [ ] Tidak ada placeholder atau resource kosong yang tidak dibutuhkan.

## S2 — Schema dan intermediate evidence

- [ ] `S2.a` Definisikan job configuration schema.
- [ ] `S2.b` Definisikan page evidence schema.
- [ ] `S2.c` Definisikan raw style observation schema.
- [ ] `S2.d` Definisikan primitive token schema.
- [ ] `S2.e` Definisikan semantic token dan alias schema.
- [ ] `S2.f` Definisikan component, anatomy, variant, size, dan state schema.
- [ ] `S2.g` Definisikan source provenance sampai level URL, viewport, selector/node, property, dan observed value.
- [ ] `S2.h` Definisikan confidence enum: `confirmed`, `inferred`, `speculative`.
- [ ] `S2.i` Definisikan conflict schema untuk perbedaan nilai antarhalaman.
- [ ] `S2.j` Definisikan exclusion schema untuk data yang sengaja tidak digunakan.
- [ ] `S2.k` Buat fixture JSON kecil untuk setiap schema.
- [ ] `S2.l` Tambahkan schema validation pada boundary setiap script.

Exit criteria:

- [ ] Semua hasil inferensi dapat dilacak kembali ke evidence sumber.
- [ ] Script menolak input intermediate yang tidak valid dengan error yang jelas.

## S3 — Pemilihan dan capture halaman

- [ ] `S3.a` Validasi jumlah URL antara 3 dan 5.
- [ ] `S3.b` Pastikan URL berasal dari situs/produk yang sama, kecuali pengguna mengizinkan sebaliknya.
- [ ] `S3.c` Nilai coverage kandidat halaman: landing, listing, detail, form/checkout, dan account/dashboard.
- [ ] `S3.d` Berikan rekomendasi jika halaman yang dipilih terlalu mirip.
- [ ] `S3.e` Buka halaman dan tunggu DOM, font, serta network idle secara wajar.
- [ ] `S3.f` Tangani cookie banner dan dialog penghalang tanpa menyetujui tindakan sensitif.
- [ ] `S3.g` Capture screenshot penuh pada setiap viewport.
- [ ] `S3.h` Ambil DOM ter-render dan computed style elemen relevan.
- [ ] `S3.i` Ambil CSS custom properties yang aktif.
- [ ] `S3.j` Ambil metadata font, ikon, gambar, SVG, dan breakpoint.
- [ ] `S3.k` Observasi state default, hover, focus, active, disabled, error, selected, expanded, dan loading jika tersedia.
- [ ] `S3.l` Tandai state yang tidak ditemukan; jangan merekonstruksinya sebagai fakta.
- [ ] `S3.m` Ambil evidence desktop dan mobile secara terpisah.
- [ ] `S3.n` Simpan timestamp, URL final setelah redirect, title, dan status capture.
- [ ] `S3.o` Redact data pribadi atau session-specific dari evidence dan output.
- [ ] `S3.p` Hentikan atau laporkan secara eksplisit jika login, CAPTCHA, atau izin menghalangi capture.

Exit criteria:

- [ ] Setiap halaman memiliki screenshot, DOM/style evidence, viewport metadata, dan status capture.
- [ ] Kegagalan parsial tidak diam-diam diabaikan.

## S4 — Token extraction dan normalisasi

- [ ] `S4.a` Inventarisasi warna solid, gradient, opacity, border, dan shadow.
- [ ] `S4.b` Inventarisasi font family, size, weight, line-height, letter-spacing, dan text transform.
- [ ] `S4.c` Inventarisasi spacing, dimension, radius, stroke width, dan layout gap.
- [ ] `S4.d` Pisahkan nilai dekoratif satu kali dari kandidat token reusable.
- [ ] `S4.e` Cluster exact duplicates.
- [ ] `S4.f` Cluster near-duplicates dengan threshold yang dapat dijelaskan.
- [ ] `S4.g` Jangan otomatis menyatukan nilai dekat tanpa menyimpan nilai asli dan alasan konsolidasi.
- [ ] `S4.h` Bentuk primitive scales untuk color, spacing, radius, size, dan opacity.
- [ ] `S4.i` Infer semantic roles dari konteks penggunaan, bukan dari nilai saja.
- [ ] `S4.j` Alias semantic tokens ke primitives.
- [ ] `S4.k` Deteksi light/dark mode hanya jika terdapat evidence.
- [ ] `S4.l` Hasilkan CSS custom property names yang deterministik.
- [ ] `S4.m` Catat usage count dan source pages per token.
- [ ] `S4.n` Beri confidence pada setiap semantic inference.
- [ ] `S4.o` Buat report konflik token antarhalaman.

Exit criteria:

- [ ] Tidak ada semantic token yang kehilangan primitive alias atau provenance.
- [ ] Near-duplicate merge dapat diaudit dan dibatalkan.

## S5 — Component inference

- [ ] `S5.a` Identifikasi subtree DOM dan pola visual berulang.
- [ ] `S5.b` Gabungkan evidence berbasis struktur, style signature, role, dan penggunaan lintas halaman.
- [ ] `S5.c` Pisahkan komponen reusable dari section atau layout satu kali.
- [ ] `S5.d` Tentukan nama komponen yang deterministik dan generik.
- [ ] `S5.e` Infer anatomy dan slot konten.
- [ ] `S5.f` Infer variant axes seperti style, size, emphasis, dan theme.
- [ ] `S5.g` Catat hanya state yang benar-benar teramati.
- [ ] `S5.h` Tandai state rekonstruksi sebagai `speculative`.
- [ ] `S5.i` Deteksi nested components.
- [ ] `S5.j` Hindari variant explosion; pecah matrix di atas 30 kombinasi.
- [ ] `S5.k` Hitung usage count, source pages, dan confidence setiap komponen.
- [ ] `S5.l` Buat component inventory dan gap report.
- [ ] `S5.m` Kunci daftar komponen MVP sebelum generator dokumentasi berjalan.

Exit criteria:

- [ ] Setiap komponen memiliki evidence, anatomy, variant/state coverage, dan confidence.
- [ ] Pola satu kali tidak disajikan sebagai komponen inti tanpa penandaan.

## S6 — Documentation shell

- [ ] `S6.a` Buat template `index.html` semantik dan responsif.
- [ ] `S6.b` Tambahkan sidebar navigation.
- [ ] `S6.c` Tambahkan pencarian client-side.
- [ ] `S6.d` Tambahkan overview, metadata, URL sumber, coverage, dan confidence summary.
- [ ] `S6.e` Tambahkan halaman/section Colors.
- [ ] `S6.f` Tambahkan Typography.
- [ ] `S6.g` Tambahkan Spacing & Sizing.
- [ ] `S6.h` Tambahkan Radius, Border, dan Elevation.
- [ ] `S6.i` Tambahkan Breakpoints dan responsive notes.
- [ ] `S6.j` Tambahkan audit report, conflicts, exclusions, dan limitations.
- [ ] `S6.k` Gunakan design tokens dokumentasi sendiri agar shell tidak bentrok dengan design system hasil ekstraksi.
- [ ] `S6.l` Pastikan halaman tetap usable tanpa JavaScript untuk konten inti.

Exit criteria:

- [ ] Shell dapat dibuka langsung dari filesystem.
- [ ] Navigasi dan foundations tetap terbaca di desktop serta mobile.

## S7 — Live component previews

- [ ] `S7.a` Pilih mekanisme isolasi preview: Shadow DOM atau `iframe srcdoc`.
- [ ] `S7.b` Pastikan CSS preview tidak bocor ke documentation shell.
- [ ] `S7.c` Render satu preview canonical per komponen.
- [ ] `S7.d` Render variant gallery.
- [ ] `S7.e` Tambahkan size controls jika relevan.
- [ ] `S7.f` Tambahkan state controls tanpa mengklaim state yang tidak teramati.
- [ ] `S7.g` Tambahkan viewport/responsive controls.
- [ ] `S7.h` Tambahkan theme toggle hanya jika evidence mendukung.
- [ ] `S7.i` Gunakan semantic tokens pada seluruh preview.
- [ ] `S7.j` Pastikan preview tidak memuat script situs sumber.
- [ ] `S7.k` Pastikan interaksi aman dan tidak mengirim network request.

Exit criteria:

- [ ] Preview terisolasi, interaktif, dan tidak merusak halaman dokumentasi.
- [ ] Semua control dapat digunakan dengan keyboard.

## S8 — Contoh kode

- [ ] `S8.a` Hasilkan contoh HTML semantik untuk setiap komponen.
- [ ] `S8.b` Hasilkan CSS berbasis custom properties.
- [ ] `S8.c` Hasilkan JavaScript vanilla hanya untuk interaksi yang diperlukan.
- [ ] `S8.d` Gunakan source template yang sama untuk preview dan code block agar tidak drift.
- [ ] `S8.e` Tambahkan syntax highlighting tanpa dependency runtime eksternal, jika memungkinkan.
- [ ] `S8.f` Tambahkan tombol copy untuk setiap snippet.
- [ ] `S8.g` Tambahkan feedback setelah copy.
- [ ] `S8.h` Escape code dengan aman untuk mencegah HTML/script injection.
- [ ] `S8.i` Jangan menyalin source JavaScript proprietary dari situs.
- [ ] `S8.j` Tambahkan usage guidance dan accessibility notes.

Exit criteria:

- [ ] Snippet dapat ditempel ke halaman kosong dan menghasilkan komponen yang setara dengan preview.
- [ ] Preview dan snippet berasal dari satu model sumber.

## S9 — Single-file generator

- [ ] `S9.a` Implementasikan `generate-docs.mjs`.
- [ ] `S9.b` Inline documentation CSS.
- [ ] `S9.c` Inline component CSS dan token data.
- [ ] `S9.d` Inline documentation JavaScript.
- [ ] `S9.e` Embed aset kecil sebagai data URI bila diizinkan.
- [ ] `S9.f` Gunakan safe placeholder untuk aset yang tidak boleh disertakan.
- [ ] `S9.g` Hilangkan asset path lokal dan temporary URL.
- [ ] `S9.h` Tambahkan deterministic ordering untuk tokens dan components.
- [ ] `S9.i` Tambahkan build metadata tanpa menyertakan data sensitif.
- [ ] `S9.j` Pastikan generator menghasilkan byte-identical output untuk input identik, kecuali timestamp dinonaktifkan.
- [ ] `S9.k` Tambahkan opsi `--output <path>` dengan default `./output/index.html`.

Exit criteria:

- [ ] `index.html` dapat dipindahkan dan dibuka di mesin lain tanpa file pendamping.
- [ ] Tidak ada request jaringan kecuali aset eksternal yang secara eksplisit diizinkan.

## S10 — Validation dan accessibility

- [ ] `S10.a` Implementasikan `validate-output.mjs`.
- [ ] `S10.b` Validasi HTML structure.
- [ ] `S10.c` Periksa duplicate IDs.
- [ ] `S10.d` Periksa broken internal anchors.
- [ ] `S10.e` Periksa missing accessible names.
- [ ] `S10.f` Periksa heading hierarchy.
- [ ] `S10.g` Periksa keyboard operability untuk navigation, tabs, controls, dan copy buttons.
- [ ] `S10.h` Audit color contrast pada documentation shell dan previews.
- [ ] `S10.i` Periksa focus visibility.
- [ ] `S10.j` Periksa responsive overflow.
- [ ] `S10.k` Periksa asset references dan network dependency.
- [ ] `S10.l` Verifikasi bahwa semua code block memiliki preview yang sesuai.
- [ ] `S10.m` Jalankan screenshot comparison pada komponen prioritas.
- [ ] `S10.n` Tampilkan warning untuk mismatch, bukan menyembunyikannya.

Exit criteria:

- [ ] Tidak ada error validasi kritis.
- [ ] Warning tersisa tercantum di audit report output.

## S11 — Testing

- [ ] `S11.a` Buat fixture situs statis sederhana dengan known tokens/components.
- [ ] `S11.b` Buat fixture responsive dengan desktop/mobile differences.
- [ ] `S11.c` Buat fixture CSS variables dan light/dark mode.
- [ ] `S11.d` Buat fixture CSS-in-JS yang hanya terlihat lewat computed styles.
- [ ] `S11.e` Buat fixture dengan near-duplicate values dan inkonsistensi antarhalaman.
- [ ] `S11.f` Buat fixture dengan lazy-loaded content.
- [ ] `S11.g` Buat fixture gagal: login wall, redirect, missing page, dan blocked assets.
- [ ] `S11.h` Tambahkan unit tests untuk token clustering.
- [ ] `S11.i` Tambahkan unit tests untuk semantic aliasing.
- [ ] `S11.j` Tambahkan unit tests untuk component grouping.
- [ ] `S11.k` Tambahkan snapshot tests untuk `index.html`.
- [ ] `S11.l` Tambahkan test bahwa preview dan snippets tidak drift.
- [ ] `S11.m` Tambahkan test offline portability.

Exit criteria:

- [ ] Seluruh fixture MVP menghasilkan output valid dan dapat diaudit.
- [ ] Failure fixtures menghasilkan laporan eksplisit dan tidak membuat output menyesatkan.

## S12 — Skill validation dan forward-test

- [ ] `S12.a` Jalankan seluruh script secara langsung pada fixture representatif.
- [ ] `S12.b` Jalankan `quick_validate.py` pada folder skill.
- [ ] `S12.c` Perbaiki frontmatter, naming, atau struktur yang gagal.
- [ ] `S12.d` Regenerasi `agents/openai.yaml` jika tidak sinkron dengan `SKILL.md`.
- [ ] `S12.e` Forward-test prompt publik sederhana.
- [ ] `S12.f` Forward-test situs React/CSS-in-JS.
- [ ] `S12.g` Forward-test kasus partial failure.
- [ ] `S12.h` Berikan hanya skill dan task kepada evaluator; jangan bocorkan expected answer.
- [ ] `S12.i` Review artefak mentah, log, `index.html`, dan warning.
- [ ] `S12.j` Iterasi instruksi atau script berdasarkan kegagalan yang nyata.
- [ ] `S12.k` Jalankan ulang validation setelah setiap perubahan substansial.

Exit criteria:

- [ ] Skill lolos validation struktural.
- [ ] Skill menghasilkan output yang usable pada sedikitnya tiga karakteristik situs.
- [ ] Hasil forward-test tidak bergantung pada konteks yang bocor.

## S13 — Handoff MVP

- [ ] `S13.a` Bersihkan placeholder dan file development yang tidak diperlukan dari paket skill.
- [ ] `S13.b` Pastikan semua references ditautkan langsung dari `SKILL.md`.
- [ ] `S13.c` Pastikan scripts memiliki usage/error message yang jelas.
- [ ] `S13.d` Pastikan default prompt mencerminkan kontrak 3–5 URL dan output HTML.
- [ ] `S13.e` Verifikasi tidak ada credential, cookie, session data, atau absolute local path.
- [ ] `S13.f` Catat keputusan MVP yang perlu dipertahankan dalam tests/references, bukan README tambahan.
- [ ] `S13.g` Siapkan instalasi skill setelah lokasi final disetujui.

## Backlog v2

- [ ] Analisis halaman authenticated melalui browser session yang sudah login.
- [ ] Dukungan Shadow DOM lintas komponen sumber.
- [ ] Deteksi design tokens dari stylesheet source selain computed styles.
- [ ] Interaction recorder untuk modal, menu, tooltip, accordion, dan multi-step forms.
- [ ] Visual clustering berbasis screenshot selain DOM structure.
- [ ] Export tambahan ke DTCG `tokens.json`.
- [ ] Export tambahan ke CSS package dan Tailwind theme.
- [ ] Export React/Vue/Web Components.
- [ ] Figma Variables dan component-library handoff.
- [ ] Multi-brand dan multi-theme modes.
- [ ] High-contrast mode.
- [ ] Incremental re-scan dan diff antarversi situs.
- [ ] CI mode untuk mendeteksi design-system drift.
- [ ] Publish documentation ke hosting statis.

## Open decisions

- [ ] Pilih runtime utama: Node.js ESM direkomendasikan.
- [ ] Pilih capture adapter utama: browser connector atau Playwright CLI.
- [ ] Pilih Shadow DOM atau `iframe srcdoc` untuk preview isolation.
- [ ] Tentukan apakah output harus benar-benar tanpa network request.
- [ ] Tentukan batas ukuran maksimal `index.html` untuk aset embedded.
- [ ] Tentukan apakah pengguna harus menyetujui component scope sebelum generator berjalan.
- [ ] Tentukan threshold clustering untuk warna dan ukuran.
- [ ] Tentukan lokasi instalasi final skill setelah MVP selesai.
