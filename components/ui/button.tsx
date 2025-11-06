import * as React from 'react';
export function Button({ className = '', children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) { return (<button className={`inline-flex items-center justify-center rounded-2xl px-3 py-2 border bg-white hover:bg-slate-50 shadow-sm text-sm ${className}`} {...props}>{children}</button>); }
export default Button;
