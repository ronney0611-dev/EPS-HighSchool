import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import ManageProfileClient from './ManageProfileClient'

export default async function ProfilePage() {
    const session = await getServerSession(authOptions)
    if (!session) redirect('/login')
    return <ManageProfileClient />
}