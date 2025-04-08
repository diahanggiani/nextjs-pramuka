// api untuk menghapus akun user (role: kwarcab, kwaran)

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Role } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    try {
        const userIdToDelete = params.id;

        // ambil user dari database
        const targetUser = await prisma.user.findUnique({
            where: { id: userIdToDelete },
            include: {
                gugusDepan: true,
                kwaran: true,
                kwarcab: true,
            },
        });

        if (!targetUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // cek apakah role user lebih rendah & dalam naungan wilayah
        const canDelete =
        (session.user.role === Role.USER_KWARCAB &&
            targetUser.role === Role.USER_KWARAN &&
            targetUser.kwaran?.kwarcabKode === session.user.kode_kwarcab) ||

        (session.user.role === Role.USER_KWARAN &&
            targetUser.role === Role.USER_GUSDEP &&
            targetUser.gugusDepan?.kwaranKode === session.user.kode_kwaran);

        if (!canDelete) {
        return NextResponse.json({ message: 'You are not authorized to delete this user' }, { status: 403 });
        }

        // hapus user dan entitas terkait
        await prisma.$transaction(async () => {
        if (targetUser.role === Role.USER_GUSDEP) {
            await prisma.gugusDepan.deleteMany({ where: { userId: targetUser.id } });
        } else if (targetUser.role === Role.USER_KWARAN) {
            await prisma.kwaran.deleteMany({ where: { userId: targetUser.id } });
        } else if (targetUser.role === Role.USER_KWARCAB) {
            await prisma.kwarcab.deleteMany({ where: { userId: targetUser.id } });
        }

        await prisma.user.delete({ where: { id: targetUser.id } });
        });

        return NextResponse.json({ message: 'User deleted successfully' });

    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
