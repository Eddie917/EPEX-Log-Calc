import * as React from 'react';
export function Card({ className = '', children }: { className?: string; children: React.ReactNode }) { return <div className={`rounded-2xl border bg-white ${className}`}>{children}</div>; }
export function CardHeader({ children }: { children: React.ReactNode }) { return <div className='px-4 py-3 border-b'>{children}</div>; }
export function CardTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) { return <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>; }
export function CardContent({ children, className = '' }: { children: React.ReactNode; className?: string }) { return <div className={`px-4 py-4 ${className}`}>{children}</div>; }
