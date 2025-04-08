/**
extend typing bawaan NextAuth, supaya session.user dan token bisa menyimpan properti tambahan seperti:
- username
- nanti bisa ditambah role, kodeKwarcab, dsb.
*/

// deklarasi tipe next-auth
import NextAuth from "next-auth"

declare module "next-auth" {
    // data yang direturn dari authorize() (di credentials provider)
    interface User {
        username: string
        role: string
        kode_kwarcab?: string
        kode_kwaran?: string
        kode_gusdep?: string
    }
    // data yang tersedia di client & server (via getServerSession()), yang biasanya berasal dari isi token pada tahap JWT
    interface Session {
        user: User & {
            username: string
        }
        token: {
            username: string
    }
  }
}