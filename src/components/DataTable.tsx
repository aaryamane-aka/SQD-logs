export interface DataTableRow {
  id: string;
  cells: (string | number)[];
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
    return <div className="empty-state">{emptyMessage}</div>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c}>{c}</th>
            ))}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {row.cells.map((cell, i) => (
                <td key={i}>{cell}</td>
              ))}
              <td style={{ textAlign: 'right' }}>
                {row.canEdit && (
                  <button className="btn-link" style={{ marginRight: 8 }} onClick={row.onEdit}>
                    Edit
                  </button>
                )}
                {row.canDelete && (
                  <button className="btn-link danger" onClick={row.onDelete}>
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
