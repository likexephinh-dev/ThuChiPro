import { LayoutGrid, ArrowRightLeft, PieChart, User } from 'lucide-react';
import { cn } from '../lib/utils';
import type { ReactNode } from 'react';

interface LayoutProps {
    children: ReactNode;
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export function Layout({ children, activeTab, onTabChange }: LayoutProps) {
    const tabs = [
        { id: 'dashboard', icon: LayoutGrid, label: 'Dashboard' },
        { id: 'transactions', icon: ArrowRightLeft, label: 'Transactions' },
        { id: 'reports', icon: PieChart, label: 'Reports' },
        { id: 'profile', icon: User, label: 'Profile' },
    ];

    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
            <main className="max-w-md mx-auto min-h-screen bg-black relative">
                {children}

                <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-lg border-t border-white/5 pb-safe">
                    <div className="max-w-md mx-auto flex justify-around items-center h-16 px-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => onTabChange(tab.id)}
                                    className={cn(
                                        "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
                                        isActive ? "text-primary" : "text-gray-500 hover:text-gray-300"
                                    )}
                                >
                                    <Icon className={cn("w-6 h-6", isActive && "fill-current/20")} />
                                    <span className="text-[10px] font-medium">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
}
