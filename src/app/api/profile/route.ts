// api untuk lihat & edit profil (all roles)

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";


export async function GET() {
    const session = await getServerSession(authOptions);
    
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    try {
        let profile;

        // cek role dan pastikan kode yang sesuai ada dalam token
        if (session.user.role === 'USER_GUSDEP') {
            if (!session.user.kode_gusdep) {
                return NextResponse.json({ message: 'Gugus depan code not found in token' }, { status: 400 });
            }
            profile = await prisma.gugusDepan.findUnique({
                where: { kode_gusdep: session.user.kode_gusdep },
            });

        } else if (session.user.role === 'USER_KWARAN') {
            if (!session.user.kode_kwaran) {
                return NextResponse.json({ message: 'Kwaran code not found in token' }, { status: 400 });
            }
            profile = await prisma.kwaran.findUnique({
                where: { kode_kwaran: session.user.kode_kwaran },
            });

        } else if (session.user.role === 'USER_KWARCAB') {
            if (!session.user.kode_kwarcab) {
                return NextResponse.json({ message: 'Kwarcab code not found in token' }, { status: 400 });
            }
            profile = await prisma.kwarcab.findUnique({
                where: { kode_kwarcab: session.user.kode_kwarcab },
            });

        } else {
            return NextResponse.json({ message: 'Role not recognized' }, { status: 403 });
        }

        if (!profile) {
            return NextResponse.json({ message: 'Profile not found' }, { status: 404 });
        }
        return NextResponse.json(profile, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error', error }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);
    
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    try {
        const body = await req.json();

        let updateData;
        let updatedProfile;
        
        if (session.user.role === 'USER_GUSDEP') {
        updateData = {
            npsn: body.npsn?.trim(),
            nama_sekolah: body.nama_sekolah?.trim(),
            alamat: body.alamat?.trim(),
            kepala_sekolah: body.kepala_sekolah?.trim(),
            foto_gusdep: body.foto_gusdep?.trim(),
        };
        updatedProfile = await prisma.gugusDepan.update({
            where: { kode_gusdep: session.user.kode_gusdep },
            data: updateData,
        });
        } else if (session.user.role === 'USER_KWARAN') {
        updateData = {
            alamat: body.alamat?.trim(),
            kepala_kwaran: body.kepala_kwaran?.trim(),
            foto_kwaran: body.foto_kwaran?.trim(),
        };
        updatedProfile = await prisma.kwaran.update({
            where: { kode_kwaran: session.user.kode_kwaran },
            data: updateData,
        });
        } else if (session.user.role === 'USER_KWARCAB') {
        updateData = {
            alamat: body.alamat?.trim(),
            kepala_kwarcab: body.kepala_kwarcab?.trim(),
            foto_kwarcab: body.foto_kwarcab?.trim(),
        };
        updatedProfile = await prisma.kwarcab.update({
            where: { kode_kwarcab: session.user.kode_kwarcab },
            data: updateData,
        });
        } else {
        return NextResponse.json({ message: 'Role not recognized' }, { status: 403 });
        }

        return NextResponse.json({
        message: 'Profile updated successfully',
        profile: updatedProfile,
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error', error }, { status: 500 });
    }
}
