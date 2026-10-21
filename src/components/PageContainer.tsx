import type { ReactNode } from 'react';
import './PageContainer.css';

interface PageContainerProps {
    title: string;
    subtitle?: string;
    children: ReactNode;
}

export default function PageContainer({ title, subtitle, children }: PageContainerProps) {
    return (
        <div className="page-container">
            <div className="page-heading">
                <h1>{title}</h1>
                {subtitle && (
                    <p>{subtitle}</p>
                )}
            </div>
            <div className="page-surface">{children}</div>
        </div>
    );
}
