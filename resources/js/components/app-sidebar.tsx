import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Search, Sparkles, Users, Shield } from 'lucide-react';
import AppLogo from './app-logo';
import { useActiveUrl } from '@/hooks/use-active-url';

const mainNavItems: NavItem[] = [
    {
        title: 'My Journal',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Search',
        href: '/search',
        icon: Search,
    },
    {
        title: 'Read Bible',
        href: '/bible/gn/1',
        icon: BookOpen,
    },
    {
        title: 'The Assistant',
        href: '/lessons',
        icon: Sparkles,
    },
    {
        title: 'Shared With Me',
        href: '/shared-with-me',
        icon: Users,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'FAQ',
        href: '/faq',
        icon: BookOpen,
    },
];

const adminNavItems: NavItem[] = [
    {
        title: 'User Management',
        href: '/admin/users',
        icon: Users,
    },
];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const isAdmin = auth.user?.is_admin;
    const { urlIsActive } = useActiveUrl();

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />

                {isAdmin && (
                    <SidebarGroup className="px-2 py-0">
                        <SidebarGroupLabel>Admin</SidebarGroupLabel>
                        <SidebarMenu>
                            {adminNavItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={urlIsActive(item.href)}
                                        tooltip={{ children: item.title }}
                                    >
                                        <Link href={item.href} prefetch>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
