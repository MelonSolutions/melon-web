import React from 'react';

interface MatrixStats {
  row: string;
  counts: Array<{ column: string; count: number }>;
}

export default function MatrixAnalytics({ stats }: { stats: MatrixStats[] }) {
  // Collect all unique columns
  const columnSet = new Set<string>();
  stats.forEach(row => {
    row.counts.forEach(col => columnSet.add(col.column));
  });
  const columns = Array.from(columnSet);

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Question
            </th>
            {columns.map(col => (
              <th key={col} scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {stats.map((row, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {row.row}
              </td>
              {columns.map(col => {
                const count = row.counts.find(c => c.column === col)?.count || 0;
                return (
                  <td key={col} className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                    {count > 0 ? (
                      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {count}
                      </span>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
