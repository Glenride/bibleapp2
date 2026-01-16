import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import { SharedData } from '@/types';
import { cn } from '@/lib/utils';
import { FlashToaster } from '@/components/flash-toaster';

interface BibleLayoutProps extends PropsWithChildren {
    zenMode?: boolean;
}

export default function BibleLayout({ children, zenMode = false }: BibleLayoutProps) {
    const { auth } = usePage<SharedData>().props;

    return (
        <div className="min-h-screen bg-background text-foreground font-sans flex flex-col transition-colors duration-500">
            <FlashToaster />
            <header className={cn(
                "py-6 px-4 md:px-12 flex flex-col md:flex-row justify-between items-center border-b border-border/50 transition-all duration-500 overflow-hidden",
                zenMode ? "h-0 py-0 opacity-0 border-none" : "h-auto opacity-100"
            )}>
                <div className="mb-4 md:mb-0">
                    <Link href="/" className="font-serif text-2xl tracking-widest uppercase font-bold">
                        Glenride holy Bible
                    </Link>
                </div>

                <nav className="flex items-center space-x-6 text-sm tracking-widest uppercase">
                    <Link href="/" className="hover:text-primary/70 transition-colors">Home</Link>
                    <Link href={route('about')} className="hover:text-primary/70 transition-colors">About</Link>
                    <Link href={route('pricing')} className="hover:text-primary/70 transition-colors">Pricing</Link>
                    <Link href="#" className="hover:text-primary/70 transition-colors">Old Testament</Link>
                    <Link href="#" className="hover:text-primary/70 transition-colors">New Testament</Link>

                    {auth.user ? (
                        <Link href="/dashboard" className="hover:text-primary/70 transition-colors font-bold text-primary">
                            My Journal
                        </Link>
                    ) : (
                        <>
                            <Link href="/login" className="hover:text-primary/70 transition-colors">
                                Log in
                            </Link>
                            <Link href="/register" className="bg-primary text-primary-foreground px-4 py-2 text-xs hover:opacity-90 transition-opacity">
                                Register
                            </Link>
                        </>
                    )}
                </nav>
            </header>

            <main className="flex-grow">
                {children}
            </main>

            <footer className={cn(
                "bg-[#F5F2EA] dark:bg-card border-t border-border/50 px-4 md:px-12 transition-all duration-500 overflow-hidden",
                zenMode ? "max-h-0 py-0 opacity-0 border-none" : "max-h-[1000px] py-12 opacity-100 mt-auto"
            )}>
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-1">
                        <h3 className="font-serif text-lg uppercase tracking-widest mb-4">Glenride Holy Bible</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            The Word of God, accessible to everyone. Read, study, and share the Bible in multiple languages and versions.
                        </p>
                    </div>

                    <div className="col-span-1">
                        <h4 className="font-serif text-sm uppercase tracking-widest mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/" className="hover:text-primary">Home</Link></li>
                            <li><Link href={route('about')} className="hover:text-primary">About</Link></li>
                            <li><Link href={route('pricing')} className="hover:text-primary">Pricing</Link></li>
                            <li><Link href="#" className="hover:text-primary">Contact</Link></li>
                        </ul>
                    </div>

                    <div className="col-span-1">
                        <h4 className="font-serif text-sm uppercase tracking-widest mb-4">Connect</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><a href="#" className="hover:text-primary">Twitter</a></li>
                            <li><a href="#" className="hover:text-primary">Facebook</a></li>
                            <li><a href="#" className="hover:text-primary">Instagram</a></li>
                        </ul>
                    </div>

                    <div className="col-span-1 md:col-span-1">
                        <h4 className="font-serif text-sm uppercase tracking-widest mb-4">Subscribe</h4>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Your email"
                                className="bg-white dark:bg-zinc-900 border border-border px-3 py-2 text-sm w-full focus:outline-none focus:border-primary"
                            />
                            <button className="bg-primary text-primary-foreground px-4 py-2 text-xs uppercase tracking-widest hover:opacity-90">
                                Join
                            </button>
                        </div>
                    </div>
                </div>
                <div className="border-t border-border/30 mt-12 pt-6 text-center text-xs text-muted-foreground uppercase tracking-widest">
                    &copy; {new Date().getFullYear()} Glenride Holy Bible and Journal. All Rights Reserved. v1.1
                </div>
            </footer>
        </div>
    );
}
