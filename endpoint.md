# user management

### register superadmin

- endpoint: POST api/auth/register
- body request: application/json

```
{
    "username": "superadmin_c",
    "password": "Superadmin3"
}
```

- response

```
{
    "user": {
        "id": "38bda1b2-a178-443a-a2fa-278f72776f1e",
        "username": "superadmin_c",
        "role": "USER_SUPERADMIN",
        "createdAt": "2025-04-13T03:02:47.433Z"
    },
    "message": "User created succesfully"
}
```

### buat akun oleh superadmin

- endpoint: POST api/user/admin
- body request: application/json (NextAuth Session)

```
# contoh buat akun kwarcab

{
    "username": "kwarcab_a",
    "password": "Kwartircabang1",
    "role": "USER_KWARCAB",
    "nama": "Kwartir Cabang Kota A",
    "kode": "12.34.56"
}

# contoh buat akun kwaran

{
    "username": "kwaran_a",
    "password": "Kwartirranting1",
    "role": "USER_KWARAN",
    "nama": "Kwartir Ranting Kec A",
    "kode": "23.45.67",
    "kode_kwarcab": "12.34.56"
}

# contoh buat akun gugus depan
tinggal tambah field lagi -> kode_kwarcab & kode_kwaran
```

- response

```
{
    "user": {
        "id": "e12cd296-82ae-47ae-a16e-c44aec85871e",
        "username": "kwarcab_a",
        "role": "USER_KWARCAB",
        "createdAt": "2025-04-13T03:25:33.126Z"
    },
    "message": "User created successfully"
}
```

### lihat akun yang dibuat oleh superadmin

- endpoint: GET api/user/admin
- body request: application/json (NextAuth Session)

- response

```
{
    "users": [
        {
            "id": "5086c25a-8a77-42dd-a166-8808dd7a6a8b",
            "username": "kwaran_a",
            "role": "USER_KWARAN",
            "createdAt": "2025-04-13T03:27:43.213Z",
            "kwarcab": null,
            "kwaran": {
                "nama_kwaran": "Kwartir Ranting Kec A",
                "kode_kwaran": "23.45.67",
                "kwarcab": {
                    "kode_kwarcab": "12.34.56"
                }
            },
            "gugusDepan": null
        },
        {
            "id": "e12cd296-82ae-47ae-a16e-c44aec85871e",
            "username": "kwarcab_a",
            "role": "USER_KWARCAB",
            "createdAt": "2025-04-13T03:25:33.126Z",
            "kwarcab": {
                "nama_kwarcab": "Kwartir Cabang Kota A",
                "kode_kwarcab": "12.34.56"
            },
            "kwaran": null,
            "gugusDepan": null
        }
    ]
}
```

### hapus akun yang dibuat oleh superadmin

- endpoint: DELETE api/admin/[id]
- body request: application/json (NextAuth Session)

- response

```
{
    "message": "User deleted successfully"
}
```

### buat akun oleh kwarcab/kwaran/gusdep

- endpoint: POST api/user/account
- body request: application/json (NextAuth Session)

```
{
    "username": "kwaran_a",
    "password": "Kwartirranting2",
    "nama": "Kwartir Ranting Kec A",
    "kode": "23.45.67"
}
```

- response

```
{
    "user": {
        "id": "9647c460-3e73-410c-845e-fed05d5d4f11",
        "username": "kwaran_a",
        "password": "$2b$10$xbimhv/CYiWFWgSuW3ei7OyOKP0kuevlmIHYuEge4/Lj.NG6fGyaa",
        "role": "USER_KWARAN",
        "createdAt": "2025-04-13T03:37:25.980Z",
        "updatedAt": "2025-04-13T03:37:25.980Z",
        "createdById": "e12cd296-82ae-47ae-a16e-c44aec85871e"
    },
    "message": "User created successfully"
}
```

### lihat akun yang dibuat oleh kwarcab/kwaran/gusdep

- endpoint: GET api/user/account
- body request: application/json (NextAuth Session)

- response

```
{
    "accounts": [
        {
            "id": "9647c460-3e73-410c-845e-fed05d5d4f11",
            "username": "kwaran_a",
            "role": "USER_KWARAN",
            "kwaran": {
                "kode_kwaran": "23.45.67",
                "nama_kwaran": "Kwartir Ranting Kec A"
            }
        }
    ]
}
```

### hapus akun yang dibuat oleh kwarcab/kwaran/gusdep

- endpoint: DELETE api/user/account/[id]
- body request: application/json (NextAuth Session)

- response

```
{
    "message": "User deleted successfully"
}
```

# profile

### lihat profil user

- endpoint: GET api/profile
- body request: application/json (NextAuth Session)

- response

```
{
    "kode_kwarcab": "12.34.56",
    "nama_kwarcab": "Kwartir Cabang Kota A",
    "alamat": null,
    "kepala_kwarcab": null,
    "foto_kwarcab": null,
    "userId": "e12cd296-82ae-47ae-a16e-c44aec85871e",
    "createdById": null
}
```

### edit profil user

- endpoint: PATCH api/profile
- body request: multipart/form-data (NextAuth Session)

```
alamat (text): Jl. Ahmad Yani No.10
kepala_kwarcab (text): Baiq Laila
foto (file): xxxxxxx.png
```

- response

```
{
    "message": "Profile updated successfully",
    "profile": {
        "kode_kwarcab": "12.34.56",
        "nama_kwarcab": "Kwartir Cabang Kota A",
        "alamat": "Jl. Ahmad Yani No.10",
        "kepala_kwarcab": "Baiq Laila",
        "foto_kwarcab": "https://vryhkwvwaitpygwkssjv.supabase.co/storage/v1/object/public/image-bucket-nextjs/foto-profil/0ebfa73f-1ef9-4fa2-b2b8-0f17b9b0b0e5.png",
        "userId": "e12cd296-82ae-47ae-a16e-c44aec85871e",
        "createdById": null
    }
}
```

# anggota

### lihat seluruh anggota

- endpoint: GET api/anggota
- body request: application/json (NextAuth Session)

- response

```
[
    {
        "id_anggota": "20f55236-faa1-4890-90fc-bff9196f6708",
        "nta": "4567.89.012.34567",
        "nama_agt": "Anggota D",
        "tgl_lahir": "2002-01-17T00:00:00.000Z",
        "tahun_gabung": 2010,
        "gender": "PEREMPUAN",
        "agama": "HINDU",
        "alamat": "Cakra",
        "status_agt": "AKTIF",
        "jenjang_agt": "PENGGALANG_RAKIT",
        "gusdepKode": "67.89.01",
        "gugusDepan": {
            "nama_gusdep": "Gugus Depan Sekolah B"
        }
    },
    {
        "id_anggota": "f8a54f44-16b6-46f1-a04a-0b229579ca06",
        "nta": "5678.90.123.45678",
        "nama_agt": "Anggota E",
        "tgl_lahir": "2003-05-04T00:00:00.000Z",
        "tahun_gabung": 2007,
        "gender": "LAKI_LAKI",
        "agama": "HINDU",
        "alamat": "Jempong",
        "status_agt": "NON_AKTIF",
        "jenjang_agt": "PENEGAK_BANTARA",
        "gusdepKode": "67.89.01",
        "gugusDepan": {
            "nama_gusdep": "Gugus Depan Sekolah B"
        }
    }
]
```

### tambah anggota

- endpoint: POST api/anggota
- body request: application/json (NextAuth Session)

```
{
    "nama_agt": "Anggota E",
    "nta": "5678.90.123.45678",
    "tgl_lahir": "2003-05-04",
    "alamat": "Jempong",
    "gender": "LAKI_LAKI",
    "agama": "HINDU",
    "jenjang_agt": "PENEGAK_BANTARA",
    "status_agt": "NON_AKTIF",
    "tahun_gabung": "2007"
}
```

- response

```
{
    "message": "Member successfully added",
    "anggota": {
        "id_anggota": "f8a54f44-16b6-46f1-a04a-0b229579ca06",
        "nta": "5678.90.123.45678",
        "nama_agt": "Anggota E",
        "tgl_lahir": "2003-05-04T00:00:00.000Z",
        "tahun_gabung": 2007,
        "gender": "LAKI_LAKI",
        "agama": "HINDU",
        "alamat": "Jempong",
        "status_agt": "NON_AKTIF",
        "jenjang_agt": "PENEGAK_BANTARA",
        "gusdepKode": "67.89.01"
    }
}
```

### edit anggota

- endpoint: PATCH api/anggota/[id]
- body request: application/json (NextAuth Session)

```
{
  "alamat": "bedugul"
}
```

- response

```
{
    "message": "Member successfully updated",
    "data": {
        "id_anggota": "f8a54f44-16b6-46f1-a04a-0b229579ca06",
        "nta": "5678.90.123.45678",
        "nama_agt": "Anggota E",
        "tgl_lahir": "2003-05-04T00:00:00.000Z",
        "tahun_gabung": 2007,
        "gender": "LAKI_LAKI",
        "agama": "HINDU",
        "alamat": "bedugul",
        "status_agt": "NON_AKTIF",
        "jenjang_agt": "PENEGAK_BANTARA",
        "gusdepKode": "67.89.01"
    }
}
```

### hapus anggota

- endpoint: DELETE api/anggota/[id]
- body request: application/json (NextAuth Session)

- response

```
{
    "message": "Member successfully deleted"
}
```

# pembina

### lihat seluruh pembina

- endpoint: GET api/pembina
- body request: application/json (NextAuth Session)

request dan respon sama seperti api anggota

### tambah pembina

- endpoint: POST api/pembina
- body request: application/json (NextAuth Session)

request dan respon sama seperti api anggota

### edit pembina

- endpoint: PATCH api/pembina/[id]
- body request: application/json (NextAuth Session)

request dan respon sama seperti api anggota

### hapus pembina

- endpoint: DELETE api/pembina/[id]
- body request: application/json (NextAuth Session)

request dan respon sama seperti api anggota

# kegiatan

### lihat seluruh kegiatan

- endpoint: GET api/kegiatan
- body request: application/json (NextAuth Session)

### lihat kegiatan

- endpoint: banyak opsi url tergantung cara fetch api di frontend

  - /api/kegiatan?kode_gusdep=56.789-01.234?detail=f5721f3b-d772-4bd3-b872-a1bc9a6a2b30
  - /api/kegiatan?kode_kwaran=45.678-90.123?detail=dcc4ba0b-d8ff-479f-90d5-ea37708da296

- body request: application/json (NextAuth Session)

### lihat detail kegiatan

- endpoint: GET api/kegiatan/[id]
- body request: application/json (NextAuth Session)

### tambah kegiatan

- endpoint: POST api/kegiatan
- body request: multipart/form-data (NextAuth Session)

```
nama_kegiatan (text): Kemah Ceria
deskripsi (text): blablablabla
lokasi (text): blablablabla
tingkat_kegiatan (text): SIAGA
tanggal (text): 2024-12-02
laporan (file) : xxxx.pdf
pesertaIds (text) : ["id_peserta_1", "id_peserta_2"]
```

- response

```
{
    "message": "Activity data successfully added",
    "kegiatan": {
        "id_kegiatan": "2c9820fd-0252-4296-8443-bec2dfe0dba5",
        "nama_kegiatan": "Kemah Ceria",
        "deskripsi": "Kegiatan yang diselenggarakan guna mempererat tali persaudaraan.",
        "lokasi": "BSA, Gunung Sari",
        "tingkat_kegiatan": "SIAGA",
        "laporan": "https://vryhkwvwaitpygwkssjv.supabase.co/storage/v1/object/public/file-bucket-nextjs/laporan-kegiatan/521e5f98-7962-4056-9127-1d8699374302.pdf",
        "tanggal": "2024-12-02T00:00:00.000Z",
        "gusdepKode": "56.78.90",
        "kwaranKode": null,
        "kwarcabKode": null
    }
}
```

### edit kegiatan

- endpoint: PATCH api/kegiatan
- body request: multipart/form-data (NextAuth Session)

request dan respon sama seperti PATCH api anggota (mengedit field yang hanya ingin diedit)

### hapus kegiatan

- endpoint: DELETE api/kegiatan/[id]
- body request: application/json (NextAuth Session)

# ajuan nta

### lihat seluruh ajuan

- endpoint: GET api/ajuan
- body request: application/json (NextAuth Session)

### tambah ajuan

- endpoint: POST api/ajuan
- body request: multipart/form-data (NextAuth Session)

yang bisa tambah ajuan hanya USER_GUSDEP (isi nama ajuan, tingkat, file)

```
nama_ajuan (text): Nama Anggota Yang Ngajuin (ga perlu underscore)
tingkat (text): PENGGALANG
formulir (file): XXXX.pdf
```

- response

```
{
    "message": "Ajuan successfully added",
    "newAjuan": {
        "id_ajuan": "4bc20889-dcb6-4022-b040-2d003ab6bbbb",
        "nama_ajuan": "Anggota Z",
        "tingkat": "PENGGALANG",
        "formulir": "https://vryhkwvwaitpygwkssjv.supabase.co/storage/v1/object/public/file-bucket-nextjs/formulir-ajuan/57a1134a-6140-4f92-8395-ff6f25f0023c.pdf",
        "status": null,
        "nta": null,
        "gusdepKode": "56.78.90",
        "kwarcabKode": "12.34.56",
        "createdAt": "2025-04-13T05:10:07.548Z"
    }
}
```

### edit ajuan

- endpoint: PATCH api/ajuan/[id]
- body request: application/json (NextAuth Session)

yang bisa edit hanya USER_KWARCAB (ganti status sama isi nta) -> saat status diubah jadi 'DITERIMA' && field nta terisi maka formulir akan terhapus otomatis dari database (krn ga dipake lagi dan mengurangi beban database)

```
{
  "status": "DITERIMA",
  "nta": "0000.00.000.00000"
}
```

- response

```
{
    "message": "Ajuan successfully updated",
    "updated": {
        "id_ajuan": "4bc20889-dcb6-4022-b040-2d003ab6bbbb",
        "nama_ajuan": "Anggota Z",
        "tingkat": "PENGGALANG",
        "formulir": "",
        "status": "DITERIMA",
        "nta": "0000.00.000.00000",
        "gusdepKode": "56.78.90",
        "kwarcabKode": "12.34.56",
        "createdAt": "2025-04-13T05:10:07.548Z"
    }
}
```

### hapus ajuan

- endpoint: DELETE api/ajuan
- body request: application/json (NextAuth Session)

# dashboard

### jumlah anggota per jenjang (termasuk total anggota) => (bisa dipake kwarcab, kwaran, gusdep)

- endpoint: GET api/dashboard/anggotaByJenjang
- body request: application/json (NextAuth Session)

- response

```
{
    "siaga": 2,
    "penggalang": 2,
    "penegak": 1,
    "pandega": 0,
    "total": 5
}
```

### jumlah anggota per gender => (bisa dipake kwarcab, kwaran, gusdep)

- endpoint: GET api/dashboard/anggotaByGender
- body request: application/json (NextAuth Session)

- response

```
[
    {
        "gender": "LAKI_LAKI",
        "jumlah": 3
    },
    {
        "gender": "PEREMPUAN",
        "jumlah": 2
    }
]
```

### jumlah anggota per tahun => (bisa dipake kwarcab, kwaran, gusdep)

- endpoint: GET api/dashboard/anggotaByYear
- body request: application/json (NextAuth Session)

- response

```
[
    {
        "tahun": 2007,
        "jumlah": 1
    },
    {
        "tahun": 2009,
        "jumlah": 1
    },
    {
        "tahun": 2010,
        "jumlah": 3
    }
]
```

### jumlah gusdep per kwaran => (bisa dipake kwarcab)

- endpoint: GET api/dashboard/gusdepByKwaran
- body request: application/json (NextAuth Session)

- response

```
[
    {
        "kwaranKode": "23.45.67",
        "jumlahGudep": 2
    }
]
```

# filter & searchbar

### filter status keaktifan anggota dan cari data berdasarkan nama

- body request: application/json (NextAuth Session)

```
contoh url:

http://localhost:3000/api/anggota?kode_gusdep=GUSDEP001&status=AKTIF&search=Anggo

- query parameter kode_gusdep untuk menyaring anggota berdasarkan kode gugus depan
- query parameter status untuk menyaring berdasarkan status anggota (AKTIF atau NON_AKTIF).
- query parameter search untuk mencari anggota berdasarkan kata kunci tertentu
```

### filter status ajuan dan cari data berdasarkan nama ajuan

- endpoint: api/
- body request: application/json (NextAuth Session)

```
contoh url:

http://localhost:3000/api/ajuan?status=DITERIMA&search=John

- query parameter status untuk menyaring ajuan berdasarkan status
- query parameter search untuk mencari ajuan berdasarkan kata kunci tertentu
- bisa mengkombinasikan beberapa parameter sekaligus. misal cari yang statusnya 'DITERIMA' dan kata kunci 'Anggo dalam nama ajuan
```
