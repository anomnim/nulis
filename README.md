# ✏️ Tulis Yuk! — Game Belajar Menulis Anak

Webapp mobile game untuk anak-anak belajar menulis huruf, kata, dan kalimat dengan cara menggambar di layar HP.

## 🌟 Fitur

- ✍️ **Tulis di layar** — bukan ketik, tapi menulis dengan jari di layar sentuh
- 📚 **150+ kata** dalam 5 kategori (Huruf, Angka, Kata Mudah, Kata Sedang, Kalimat)
- 🔤 **Huruf besar & kecil** — belajar keduanya secara natural
- 🖊️ **Panduan tulisan** — ada garis putus-putus sebagai contoh
- 🎨 **Pilih warna & ukuran kuas** — anak bisa bebas bereksperesi
- ⭐ **Sistem bintang & skor** — motivasi belajar
- 📱 **PWA** — bisa diinstall di HP seperti aplikasi
- 🔌 **Offline** — bisa dimainkan tanpa internet setelah dibuka pertama kali

## 📁 Struktur File

```
tulis-yuk/
├── index.html          # Halaman utama (UI & HTML)
├── style.css           # Styling child-friendly
├── app.js              # Logic game & canvas drawing
├── words.js            # 📝 PERBENDAHARAAN KATA — edit di sini!
├── manifest.json       # PWA manifest
├── sw.js               # Service Worker (offline support)
├── generate_icons.py   # Script buat icon (jalankan sekali)
├── icons/
│   ├── icon-192.png
│   └── icon-512.png
└── .github/
    └── workflows/
        └── deploy.yml  # Auto-deploy ke GitHub Pages
```

## 🚀 Deploy ke GitHub Pages

### Langkah 1 — Buat Repository
```bash
git init
git add .
git commit -m "🎉 Initial commit - Tulis Yuk!"
```

### Langkah 2 — Push ke GitHub
```bash
# Buat repo baru di github.com, lalu:
git remote add origin https://github.com/USERNAME/tulis-yuk.git
git branch -M main
git push -u origin main
```

### Langkah 3 — Aktifkan GitHub Pages
1. Buka repo di GitHub
2. Klik **Settings** → **Pages**
3. Source: pilih **GitHub Actions**
4. GitHub Actions akan otomatis deploy setiap push ke `main`

### Langkah 4 — Akses App
App akan tersedia di: `https://USERNAME.github.io/tulis-yuk/`

---

## ✏️ Cara Menambah Kata Baru

Edit file **`words.js`**, cari kategori yang sesuai, lalu tambahkan:

```js
{ teks: "kata baru", petunjuk: "keterangan kata ini", emoji: "🎯" },
```

Atau buat kategori baru di bagian bawah file:

```js
WORD_BANK.nama_kategori = {
  label: "Nama Tampil",
  icon: "🎯",
  color: "#FF6B9D",
  items: [
    { teks: "kata", petunjuk: "keterangannya", emoji: "🎯" },
  ],
};
```

---

## 🛠️ Jalankan Lokal (tanpa server)

Cukup buka `index.html` di browser mobile atau gunakan:
```bash
npx serve .
# atau
python3 -m http.server 3000
```

Lalu buka `http://localhost:3000` di HP (sambungkan ke WiFi yang sama).

---

## 📝 Cara Bermain

1. Pilih kategori (Huruf / Angka / Kata / Kalimat)
2. Lihat contoh tulisan (garis putus-putus)
3. Tulis mengikuti contoh dengan jari di kotak putih
4. Tekan ✅ **Selesai** setelah menulis
5. Kumpulkan ⭐ bintang sebanyak-banyaknya!

---

Made with ❤️ untuk anak-anak Indonesia 🇮🇩
