import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// keperluan testing (nanti dihapus)
import { getSessionOrToken } from "@/lib/getSessionOrToken";

export async function GET(req: NextRequest) {
    // keperluan testing (nanti dihapus)
    const session = await getSessionOrToken(req);
    console.log("SESSION DEBUG:", session);

    // session yang asli (nanti uncomment)
    // const session = await getServerSession(authOptions);

    if (!session || !["USER_KWARAN", "USER_KWARCAB"].includes(session.user.role)) {
        return NextResponse.json({ message: "Unauthorized: Only 'Kwaran' & 'Kwarcab' users can view data" }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const kode_kwaran = searchParams.get("kode_kwaran");

        if (!kode_kwaran) {
            return NextResponse.json({ message: "kode_kwaran query param is required" }, { status: 400 });
        }

        // validasi akses: hanya izinkan KWARCAB melihat kwaran di bawah naungannya
        if (session.user.role === "USER_KWARCAB" && session.user.kode_kwarcab) {
            const allowedKwaran = await prisma.kwaran.findMany({
                where: { kwarcabKode: session.user.kode_kwarcab },
                select: { kode_kwaran: true },
            });
            const allowedKode = allowedKwaran.map(k => k.kode_kwaran);
            if (!allowedKode.includes(kode_kwaran)) {
                return NextResponse.json({ message: "Forbidden: Bukan kwaran di bawah naungan Anda" }, { status: 403 });
            }
        }

        // validasi akses: hanya izinkan KWARAN melihat gusdep di bawah dirinya sendiri
        if (session.user.role === "USER_KWARAN" && session.user.kode_kwaran !== kode_kwaran) {
            return NextResponse.json({ message: "Forbidden: Bukan kwaran milik Anda" }, { status: 403 });
        }

        const gusdepList = await prisma.gugusDepan.findMany({
        where: { kwaranKode: kode_kwaran },
        select: {
            kode_gusdep: true,
            nama_gusdep: true,
        },
        });

    return NextResponse.json(gusdepList);
  } catch (error) {
    console.error("Error fetching gugus depan:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
