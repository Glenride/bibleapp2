import { Link } from '@inertiajs/react';
import { about, pricing } from '@/routes';
import { cn } from '@/lib/utils';

interface SiteFooterProps {
    zenMode?: boolean;
}

export function SiteFooter({ zenMode = false }: SiteFooterProps) {
    return (
        <footer className={cn(
            "bg-[#1a1a1a] text-white transition-all duration-500 overflow-hidden",
            zenMode ? "max-h-0 py-0 opacity-0 border-none" : "max-h-[1000px] py-16 opacity-100 mt-auto"
        )}>
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-5 gap-12 mb-12">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <h3 className="text-2xl tracking-[0.3em] mb-4" style={{ fontFamily: 'DM Serif Display, serif' }}>INSPIREWRITE.</h3>
                        <p className="text-gray-400 leading-relaxed max-w-md">
                            A spiritual writing companion by Glenride. Read scripture, journal your thoughts, and create meaningful lessons with AI-powered assistance.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-4">Quick Links</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/" className="hover:text-yellow-500 transition-colors">Home</Link></li>
                            <li><Link href={about.url()} className="hover:text-yellow-500 transition-colors">About</Link></li>
                            <li><Link href={pricing.url()} className="hover:text-yellow-500 transition-colors">Pricing</Link></li>
                            <li><Link href="/faq" className="hover:text-yellow-500 transition-colors">FAQ</Link></li>
                            <li><Link href="/bible/gn/1" className="hover:text-yellow-500 transition-colors">Start Reading</Link></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-4">Resources</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/guides/how-to-read-the-bible" className="hover:text-yellow-500 transition-colors">How to Read the Bible</Link></li>
                            <li><Link href="/guides/how-to-pray-when-you-feel-stuck" className="hover:text-yellow-500 transition-colors">How to Pray</Link></li>
                            <li><Link href="/resources/best-bible-reading-plans" className="hover:text-yellow-500 transition-colors">Reading Plans</Link></li>
                            <li><Link href="/resources/journaling-prompts-for-spiritual-growth" className="hover:text-yellow-500 transition-colors">Journaling Prompts</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-4">Legal</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/contact" className="hover:text-yellow-500 transition-colors">Contact</Link></li>
                            <li><Link href="/privacy" className="hover:text-yellow-500 transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-yellow-500 transition-colors">Terms of Use</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-gray-500 uppercase tracking-widest">
                        © {new Date().getFullYear()} InspireWrite by Glenride. All Rights Reserved.
                    </p>
                    <p className="text-xs text-gray-500">
                        <a href="https://inspirewrite.online" className="hover:text-yellow-500 transition-colors">inspirewrite.online</a>
                    </p>
                </div>
            </div>
        </footer>
    );
}
