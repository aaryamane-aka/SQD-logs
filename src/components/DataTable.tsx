import type { ReactNode } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

export interface DataTableRow {
  id: string;
  cells: ReactNode[];
  canEdit: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

interface Props {
  columns: string[];
  rows: DataTableRow[];
  emptyMessage: string;
}

export function DataTable({ columns, rows, emptyMessage }: Props) {
  if (rows.length === 0) {
    return <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">{emptyMessage}</div>;
  }

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((c) => (
              <TableHead key={c}>{c}</TableHead>
            ))}
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              {row.cells.map((cell, i) => (
                <TableCell key={i} className="max-w-[220px] overflow-hidden text-ellipsis">
                  {cell}
                </TableCell>
              ))}
              <TableCell className="text-right">
                {row.canEdit && (
                  <Button variant="link" size="sm" className="h-auto p-0 mr-3" onClick={row.onEdit}>
                    Edit
                  </Button>
                )}
                {row.canDelete && (
                  <Button variant="link" size="sm" className="h-auto p-0 text-destructive" onClick={row.onDelete}>
                    Delete
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
