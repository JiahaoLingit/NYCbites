'use client'

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { firebaseAuth } from '@/app/firebase';
import { useAuth, useAuthDispatch } from '@/app/_components/auth_provider';
import SigninModal from '@/app/_components/signin_modal';

export default function Navbar() {
    const router          = useRouter();
    const isAuthenticated = useAuth();
    const dispatch        = useAuthDispatch();

    async function handleSignOut() {
        try {
            await firebaseAuth.signOut();
            dispatch?.({ type: 'sign_out' });
            router.push('/');
        } catch (err) {
            console.error('Unable to sign user out:', err);
        }
    }

    return (
        <nav style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 28px', height: '56px',
            background: 'rgba(12,7,0,0.85)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>🍽️</span>
                <span style={{
                    fontSize: '15px', fontWeight: 700, color: '#fb923c',
                    letterSpacing: '-0.3px', fontFamily: 'Georgia, serif',
                }}>
                    NYC Bites
                </span>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link href="/about-us" style={{
                    fontSize: '13px', 
                    color: 'rgba(255,248,240,0.6)', 
                    textDecoration: 'none', 
                    padding: '0 14px',
                    borderRadius: '999px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    fontFamily: 'system-ui',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '32px',
                    boxSizing: 'border-box'
                }}>
                    About
                </Link>

                {isAuthenticated ? (
                    <button onClick={handleSignOut} style={{
                        fontSize: '13px', color: 'rgba(255,248,240,0.45)',
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.1)',
                        padding: '6px 14px', borderRadius: '8px',
                        cursor: 'pointer', fontFamily: 'system-ui',
                    }}>
                        Sign Out
                    </button>
                ) : (
                    <SigninModal />
                )}

                <Link href="/prefer" style={{
                    fontSize: '13px', 
                    fontWeight: 600, 
                    color: 'white',
                    textDecoration: 'none', 
                    padding: '0 16px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #c2410c, #ea580c)',
                    fontFamily: 'system-ui',
                    boxShadow: '0 2px 8px rgba(234,88,12,0.3)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '32px',
                    minWidth: '80px',
                    lineHeight: '1',
                    boxSizing: 'border-box'
                }}>
                    Find Restaurants
                </Link>
            </div>
        </nav>
    );
}
