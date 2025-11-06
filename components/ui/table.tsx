import * as React from 'react';
export function Table({ children }: { children: React.ReactNode }) { return <table className='w-full text-sm'>{children}</table>; }
export function TableHeader({ children }: { children: React.ReactNode }) { return <thead className='bg-slate-100'>{children}</thead>; }
export function TableBody({ children }: { children: React.ReactNode }) { return <tbody>{children}</tbody>; }
export function TableRow({ children }: { children: React.ReactNode }) { return <tr className='border-b last:border-0'>{children}</tr>; }
export function TableHead({ children }: { children: React.ReactNode }) { return <th className='text-left font-medium px-3 py-2'>{children}</th>; }
export function TableCell({ children }: { children: React.ReactNode }) { return <td className='px-3 py-2'>{children}</td>; }
