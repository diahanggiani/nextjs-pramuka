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

    if (!session || session.user.role === "USER_SUPERADMIN") {
        return NextResponse.json({ message: "Unauthorized: Only 'Kwarcab/Kwaran/Gusdep' users can retrieve data" }, { status: 403 });
    }

    try { 
        let total = 0;

        if (session.user.role === "USER_GUSDEP") {
            // total anggota di gugus depan sendiri
            total = await prisma.anggota.count({
                where: { gusdepKode: session.user.kode_gusdep }
            })
    
        } else if (session.user.role === "USER_KWARAN") {
            // Hitung total anggota dari semua gugus depan di kwaran ini
            total = await prisma.anggota.count({
                where: {
                    gugusDepan: { kwaranKode: session.user.kode_kwaran }
                }
            })
    
        } else if (session.user.role === "USER_KWARCAB") {
            // Hitung total anggota dari semua gugus depan di bawah kwarcab
            total = await prisma.anggota.count({
                where: {
                    gugusDepan: {
                        kwaran: { kwarcabKode: session.user.kode_kwarcab },
                    }
                }
            })
        }
      
        return NextResponse.json([ { label: "Total Anggota", value: total } ]);
    } catch (error) {
        console.error("Error fetching chart data:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
