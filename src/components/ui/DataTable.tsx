import { ReactNode } from "react";

interface Column<T> {
  key: string;
  header: string;
  icon?: ReactNode;
  render: (item: T, index: number) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  emptyState?: {
    icon?: ReactNode;
    title: string;
    description: string;
    action?: ReactNode;
  };
}

export function DataTable<T>({ columns, data, keyExtractor, emptyState }: DataTableProps<T>) {
  if (data.length === 0 && emptyState) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
          {emptyState.icon || (
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          )}
        </div>
        <p className="text-gray-400 text-lg">{emptyState.title}</p>
        <p className="text-gray-500 text-sm mt-1">{emptyState.description}</p>
        {emptyState.action && <div className="mt-4">{emptyState.action}</div>}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-background-light/80 to-background-light/40 backdrop-blur-sm rounded-2xl border border-gray-700/30 overflow-hidden shadow-2xl shadow-black/20">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-gray-800/80 to-gray-700/80 border-b border-gray-600/50">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="text-right pl-6 pr-6 py-4 text-gray-300 font-semibold text-sm uppercase tracking-wider"
                >
                  <div className="flex items-center gap-2">
                    {column.icon}
                    {column.header}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={keyExtractor(item)}
                className={`group border-b border-gray-700/30 hover:bg-gradient-to-r hover:from-gray-800/30 hover:to-gray-700/20 transition-all duration-300 ${
                  index % 2 === 0 ? "bg-gray-800/10" : "bg-gray-800/5"
                }`}
              >
                {columns.map((column) => (
                  <td key={column.key} className="pl-6 pr-6 py-6">
                    {column.render(item, index)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

