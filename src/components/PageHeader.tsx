import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface PageHeaderProps {
    title: string;
    description: string;
    icon: LucideIcon;
    action?: ReactNode;
}

export const PageHeader = ({ title, description, icon: Icon, action }: PageHeaderProps) => {
    return (
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-neutral-200/60">
            <div>
                <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-2xl font-bold text-neutral-900 flex items-center gap-3"
                >
                    <div className="p-2 bg-white rounded-xl shadow-sm border border-neutral-100">
                        <Icon className="w-5 h-5 text-zinc-900" />
                    </div>
                    {title}
                </motion.h2>
                <p className="text-neutral-500 text-sm mt-2 ml-1">
                    {description}
                </p>
            </div>
            {action && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center"
                >
                    {action}
                </motion.div>
            )}
        </header>
    );
};
