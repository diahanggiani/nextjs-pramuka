import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";

// keperluan testing (nanti dihapus)
import { getSessionOrToken } from "@/lib/getSessionOrToken";

const jenjangGroups = {
  siaga: ["SIAGA_MULA", "SIAGA_BANTU", "SIAGA_TATA"],
  penggalang: ["PENGGALANG_RAMU", "PENGGALANG_RAKIT", "PENGGALANG_TERAP"],
  penegak: ["PENEGAK_BANTARA", "PENEGAK_LAKSANA"],
  pandega: ["PANDEGA"],
};

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
    const whereClause: Prisma.AnggotaWhereInput = {};

    // batasi wilayah berdasarkan role
    if (session.user.role === "USER_GUSDEP") {
      whereClause.gusdepKode = session.user.kode_gusdep;
    } else if (session.user.role === "USER_KWARAN") {
      whereClause.gugusDepan = { kwaranKode: session.user.kode_kwaran };
    } else if (session.user.role === "USER_KWARCAB") {
      whereClause.gugusDepan = { kwaran: { kwarcabKode: session.user.kode_kwarcab } };
    }

    // Ambil daftar anggota dengan riwayat jenjang
    const anggotaList = await prisma.anggota.findMany({
      where: whereClause,
      select: {
        id_anggota: true,
        RiwayatJenjang: {
          orderBy: { tgl_perubahan: "desc" },
          take: 1,
          select: { jenjang_agt: true },
        },
      },
    });

    // hasil yang akan dikembalikan
    const result: Record<string, number> = {
      siaga: 0,
      penggalang: 0,
      penegak: 0,
      pandega: 0,
      total: 0,
    };

    // Looping melalui anggota dan menghitung berdasarkan jenjang terbaru
    for (const anggota of anggotaList) {
      const latestJenjang = anggota.RiwayatJenjang[0]?.jenjang_agt;
      if (!latestJenjang) continue; // Skip anggota tanpa jenjang terbaru

      // Kelompokkan anggota berdasarkan jenjang mereka
      for (const [group, values] of Object.entries(jenjangGroups)) {
        if (values.includes(latestJenjang)) {
          result[group]++;
          result.total++;
          break; // Jika sudah ditemukan, keluar dari loop
        }
      }
    }

    // Kembalikan hasil
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching chart data:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// import { JenjangAnggota, Prisma } from "@prisma/client";

// export async function GET(req: NextRequest) {
//   // keperluan testing (nanti dihapus)
//   const session = await getSessionOrToken(req);
//   console.log("SESSION DEBUG:", session);

//   // session yang asli (nanti uncomment)
//     // const session = await getServerSession(authOptions);

//   if (!session || session.user.role === "USER_SUPERADMIN") {
//     return NextResponse.json({ message: "Unauthorized: Only 'Kwarcab/Kwaran/Gusdep' users can retrieve data" }, { status: 403 });
//   }

//   try {
//     const whereClause: Prisma.AnggotaWhereInput = {};

//     // batasi wilayah berdasarkan role
//     if (session.user.role === "USER_GUSDEP") {
//       whereClause.gusdepKode = session.user.kode_gusdep;
//     } else if (session.user.role === "USER_KWARAN") {
//       whereClause.gugusDepan = { kwaranKode: session.user.kode_kwaran };
//     } else if (session.user.role === "USER_KWARCAB") {
//       whereClause.gugusDepan = { kwaran: { kwarcabKode: session.user.kode_kwarcab } };
//     }

//     // data per kelompok jenjang
//     const result = {} as Record<string, number>;
//     let total = 0;

//     // total per jenjang
//     for (const [groupName, values] of Object.entries(jenjangGroups)) {
//       const count = await prisma.anggota.count({
//         where: {
//           ...whereClause,
//           jenjang_agt: { in: values as JenjangAnggota[] },
//         },
//       });

//       result[groupName] = count;
//       total += count;
//     }

//     // total keseluruhan
//     result["total"] = total;

//     return NextResponse.json(result);
//   } catch (error) {
//     console.error("Error fetching chart data:", error);
//     return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
//   }
// }
