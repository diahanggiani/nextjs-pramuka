// import { authOptions } from "@/lib/auth";
// import { getServerSession } from "next-auth";

'use client';
import { Button } from '@/components/ui/button';
import { signOut } from "next-auth/react";

const page = async () => {
    // const session = await getServerSession(authOptions);
    // console.log(session);
    return <div>
    <Button className='w-full mt-6' type='submit'  onClick={() => signOut({ callbackUrl: '/login' })}>
          Log out
        </Button>
    
    </div>
    
}

export default page;