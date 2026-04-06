import type { ReactNode } from 'react';

interface PageContainerProps {
    title: string;
    subtitle?: string;
    children: ReactNode;
}

export default function PageContainer({ title, subtitle, children }: PageContainerProps) {
    return (
        <div style={{ padding: 32, flex: 1 }}>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ color: '#fff', margin: 0, fontSize: '1.75rem', fontWeight: 600 }}>{title}</h1>
                {subtitle && (
                    <p style={{ color: 'rgba(255,255,255,0.6)', margin: '8px 0 0', fontSize: '0.875rem' }}>{subtitle}</p>
                )}
            </div>
            <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 16,
                padding: 24,
            }}>
                {children}
            </div>
        </div>
    );
}
