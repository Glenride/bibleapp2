import { Head, Link } from '@inertiajs/react';
import { FileQuestion, AlertTriangle, ServerCrash, ShieldAlert } from 'lucide-react';

interface Props {
    status: number;
}

export default function Error({ status }: Props) {
    const title = {
        503: '503: Service Unavailable',
        500: '500: Server Error',
        404: '404: Page Not Found',
        403: '403: Forbidden',
    }[status] || 'An Error Occurred';

    const description = {
        503: 'Sorry, we are doing some maintenance. Please check back soon.',
        500: 'Whoops, something went wrong on our servers.',
        404: 'Sorry, the page you are looking for could not be found.',
        403: 'Sorry, you are not authorized to access this page.',
    }[status] || 'Sorry, something went wrong.';

    const Icon = {
        503: AlertTriangle,
        500: ServerCrash,
        404: FileQuestion,
        403: ShieldAlert,
    }[status] || AlertTriangle;

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4 text-foreground font-sans">
            <Head title={title} />
            <div className="text-center max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="p-4 rounded-full bg-muted">
                        <Icon className="h-12 w-12 text-muted-foreground" />
                    </div>
                </div>
                <h1 className="text-4xl font-serif font-bold mb-4">{status}</h1>
                <h2 className="text-xl font-medium mb-2">{title.split(': ')[1] || title}</h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                    {description}
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 uppercase tracking-widest"
                >
                    Go Home
                </Link>
            </div>
        </div>
    );
}
