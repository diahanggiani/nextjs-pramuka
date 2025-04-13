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

    // session asli (nanti aktifkan kalau sudah siap)
    // const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "USER_KWARCAB") {
        return NextResponse.json(
            { message: "Unauthorized: Only 'USER_KWARCAB' can access this data" },
            { status: 403 }
        );
    }
    
    try {
    const kwarcabKode = session.user.kode_kwarcab;

    const grouped = await prisma.gugusDepan.groupBy({
        by: ["kwaranKode"],
        _count: { kode_gusdep: true },
        orderBy: { kwaranKode: "asc" },
        where: {
            kwaran: {
            kwarcabKode: kwarcabKode,
            },
        },
    });

    const result = grouped.map((item) => ({
        kwaranKode: item.kwaranKode,
        jumlahGudep: item._count.kode_gusdep,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Gagal ambil data jumlah naungan:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
