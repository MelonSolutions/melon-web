'use client';

import React from 'react';
import { Globe, Mail, Repeat } from 'lucide-react';

interface Settings {
  category?: string;
  isPublic?: boolean;
  allowMultipleResponses?: boolean;
  collectEmail?: boolean;
}

/** Who can answer and how: shown on the create page so nobody publishes a link that won't open. */
export function ReportSettingsCard({
  value,
  onChange,
  categories,
}: {
  value: Settings;
  onChange: (updates: Settings) => void;
  categories: Array<{ value: string; label: string }>;
}) {
  const rows: Array<{ key: keyof Settings; icon: React.ElementType; title: string; detail: string }> = [
    {
      key: 'isPublic',
      icon: Globe,
      title: 'Anyone with the link can respond',
      detail: 'Turn off to keep the form closed even after publishing.',
    },
    {
      key: 'allowMultipleResponses',
      icon: Repeat,
      title: 'Offer “Submit another response”',
      detail: 'Shown after each response; useful when one agent fills the form for many people.',
    },
    {
      key: 'collectEmail',
      icon: Mail,
      title: 'Ask respondents for their email',
      detail: 'Makes email a required field on the form.',
    },
  ];

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-gray-900">Response settings</h2>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          Category
          <select
            value={value.category}
            onChange={(e) => onChange({ category: e.target.value })}
            className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-4 divide-y divide-gray-100">
        {rows.map(({ key, icon: Icon, title, detail }) => (
          <label key={key} className="flex cursor-pointer items-center gap-3 py-3 first:pt-0 last:pb-0">
            <Icon className="h-4 w-4 shrink-0 text-gray-400" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-gray-800">{title}</span>
              <span className="block text-xs text-gray-500">{detail}</span>
            </span>
            <input
              type="checkbox"
              checked={!!value[key]}
              onChange={(e) => onChange({ [key]: e.target.checked })}
              className="peer sr-only"
            />
            <span
              aria-hidden
              className="relative h-5 w-9 shrink-0 rounded-full bg-gray-200 transition-colors peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-4"
            />
          </label>
        ))}
      </div>
    </section>
  );
}
