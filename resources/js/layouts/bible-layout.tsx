import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import { SharedData } from '@/types';
import { cn } from '@/lib/utils';
import { FlashToaster } from '@/components/flash-toaster';
import { SiteFooter } from '@/components/site-footer';
import { about, pricing } from '@/routes';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

interface BibleLayoutProps extends PropsWithChildren {
    zenMode?: boolean;
}

export default function BibleLayout({ children, zenMode = false }: BibleLayoutProps) {
    const { auth } = usePage<SharedData>().props;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#F5F2EA] text-[#1a1a1a] flex flex-col transition-colors duration-500" style={{ fontFamily: 'Inter, sans-serif' }}>
            <FlashToaster />

            {/* Header */}
            <header className={cn(
                "py-4 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center border-b border-black/10 bg-[#F5F2EA]/95 backdrop-blur-sm transition-all duration-500 overflow-hidden sticky top-0 z-50",
                zenMode ? "h-0 py-0 opacity-0 border-none" : "h-auto opacity-100"
            )}>
                <div className="flex items-center justify-between w-full md:w-auto mb-0">
                    <Link href="/" className="text-xl tracking-[0.2em] uppercase font-bold" style={{ fontFamily: 'DM Serif Display, serif' }}>
                        INSPIREWRITE.
                    </Link>
                    <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-6 text-xs tracking-widest uppercase">
                    <Link href="/" className="hover:text-yellow-600 transition-colors">Home</Link>
                    <Link href={about.url()} className="hover:text-yellow-600 transition-colors">About</Link>
                    <Link href={pricing.url()} className="hover:text-yellow-600 transition-colors">Pricing</Link>
                    <Link href="/bible/gn/1" className="hover:text-yellow-600 transition-colors">Scripture</Link>

                    {auth.user ? (
                        <Link href="/dashboard" className="bg-yellow-500 text-white px-4 py-2 hover:bg-yellow-600 transition-colors">
                            My Studio
                        </Link>
                    ) : (
                        <>
                            <Link href="/login" className="hover:text-yellow-600 transition-colors">
                                Log in
                            </Link>
                            <Link href="/register" className="bg-yellow-500 text-white px-4 py-2 hover:bg-yellow-600 transition-colors">
                                Get Started
                            </Link>
                        </>
                    )}
                </nav>

                {/* Mobile Nav */}
                {mobileMenuOpen && (
                    <div className="md:hidden w-full pt-4 border-t border-black/5 mt-4">
                        <nav className="flex flex-col gap-3 text-xs tracking-widest uppercase">
                            <Link href="/" className="hover:text-yellow-600 transition-colors py-2">Home</Link>
                            <Link href={about.url()} className="hover:text-yellow-600 transition-colors py-2">About</Link>
                            <Link href={pricing.url()} className="hover:text-yellow-600 transition-colors py-2">Pricing</Link>
                            <Link href="/bible/gn/1" className="hover:text-yellow-600 transition-colors py-2">Scripture</Link>
                            {auth.user ? (
                                <Link href="/dashboard" className="bg-yellow-500 text-white px-4 py-2 text-center hover:bg-yellow-600 transition-colors">
                                    My Studio
                                </Link>
                            ) : (
                                <>
                                    <Link href="/login" className="hover:text-yellow-600 transition-colors py-2">Log in</Link>
                                    <Link href="/register" className="bg-yellow-500 text-white px-4 py-2 text-center hover:bg-yellow-600 transition-colors">
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                )}
            </header>

            <main className="flex-grow">
                {children}
            </main>

            <SiteFooter zenMode={zenMode} />
        </div>
    );
}
