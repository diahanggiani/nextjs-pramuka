## setup nextjs project

**automatic installation**

- npx create-next-app@latest

## setup prisma

**install prisma**

- npm install prisma --save-dev
- npm install @prisma/client

**atur format prisma**

- atur di settings.json (ctrl + shift + p) lalu open user settings (json)
- mengatur formatter default untuk file dengan ekstensi .prisma (memastikan kode prisma jadi rapi dan enak dibaca), tambahkan penggalan code berikut:

```
"[prisma]": {
    "editor.defaultFormatter": "Prisma.prisma"
}
```

**inisialisasi prisma**

- npx prisma init

**migrate database**

- npx prisma migrate dev --name init

**jika mengubah skema (misal: hapus tabel) harus generate ulang (bukan migrate)**

- hapus seluruh folder migrations(?)
- npx prisma migrate reset
- npx prisma generate
- npx prisma migrate dev --name init-migration
- npx tsx prisma/seed.ts

**format penulisan skema**

- Bytes? = opsional
- Bytes = wajib
- @id = untuk menandai sebuah kolom sebagai primary key (kunci utama) dalam tabel database
- @unique = tidak boleh ada duplikasi dalam tabel database

**menjalankan file seed**

- npx tsx prisma/seed.ts

## what is needed?

**install package**

- npm install jsonwebtoken bcrypt uuid
- npm install @types/jsonwebtoken @types/bcrypt --save-dev

## what's next?

- setup .env
- build prisma/schema.prisma

## notes

**📌 alasan npm run dev lebih lambat:**

- hot reloading: setiap kali file berubah, nextjs membuild ulang sebagian aplikasi.
- type checking: jika menggunakan typescript, nextjs mengecek kesalahan di setiap perubahan.
- source map & debugging: mode development menyertakan source map untuk memudahkan debugging.
- no optimization: dode tidak dioptimalkan seperti pada npm run build.

**📌 solusi jika ingin mode development lebih cepat:**

- gunakan next start untuk menjalankan produksi tanpa build ulang.
- gunakan NODE_ENV=production meskipun sedang development.
- nonaktifkan hot-reloading sementara jika tidak butuh (NEXT_DISABLE_HOT_RELOAD=1).

**🚀 kesimpulan:**

- npm run dev lebih lambat karena banyak fitur debugging yang berjalan.
- npm run build && npm start lebih cepat karena sudah dioptimalkan untuk production.

**kenapa PATCH bukan PUT?**

- PUT → mengganti seluruh data (biasanya perlu kirim semua field, termasuk yang tidak diubah).
- PATCH → mengupdate sebagian data (hanya field yang berubah).

**perbedaan kode error**

- 401 Unauthorized → user belum login atau token tidak ada.
- 403 Forbidden → user sudah login, tapi tidak punya izin untuk akses sesuatu.

kenapa di sini pakai 403?

- dalam kasus ini, middleware sudah mengecek token dan berhasil memverifikasi usernya. jika user ternyata tidak punya izin untuk fitur tertentu, maka itu bukan masalah autentikasi (401), tapi masalah izin akses (403).

**fungsi trim()**

trim() adalah method javascript yang menghapus spasi kosong di awal dan akhir string.

```
"  Ahmad  ".trim() // hasilnya "Ahmad"
```

fungsinya:

- membersihkan input dari typo atau ketidaksengajaan user.
- menghindari data kotor di database.
- menjamin validasi bekerja dengan baik (contoh " " dianggap kosong).

**onDelete: SetNull or Cascade??**

- ⚠️ Cascade: semua entitas relasi ikut terhapus
- (default/tidak menulis onDelete/hanya menulis onUpdate): restrict → gagal hapus kalau masih dipakai (error)
- ✅ SetNull: aman → relasi jadi null, entitas tetap aman

**apa itu (!!) dalam javascript dan typescript?**

- !! adalah shorthand untuk mengubah nilai apa pun menjadi tipe boolean (true atau false)

```
!!"hello"         // true, karena string non-kosong
!!""              // false, karena string kosong
!!0               // false
!!1               // true
!!null            // false
!!undefined       // false
!![]              // true (array dianggap truthy)
!!{}              // true (object juga truthy)
```
