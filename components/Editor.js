'use client';
import ImageField from './ImageField';

const label = (k) => k.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
const blank = (s) => (s && typeof s === 'object' ? Object.fromEntries(Object.keys(s).map((k) => [k, ''])) : '');
const VIDEO = new Set(['videoUrl']);
const IMAGE = new Set(['poster', 'image', 'logo']);
const LONG = /text|description|story|message|success|error|address|quote/i;

// Generic editor for the site-content JSON: strings, nested objects and lists of objects.
export default function Editor({ value, onChange }) {
  if (Array.isArray(value)) {
    return (
      <div className="space-y-3">
        {value.map((item, i) => (
          <div key={i} className="rounded-lg border border-fog bg-chalk p-4">
            <Editor value={item} onChange={(nv) => onChange(value.map((x, j) => (j === i ? nv : x)))} />
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="mt-3 text-sm text-red-700 underline">Remove this item</button>
          </div>
        ))}
        <button type="button" onClick={() => onChange([...value, blank(value[0] || { label: '', url: '' })])} className="rounded-lg border border-dusk px-3 py-1.5 text-sm hover:bg-dusk hover:text-white">Add item</button>
      </div>
    );
  }
  if (value && typeof value === 'object') {
    return (
      <div className="space-y-4">
        {Object.entries(value).map(([k, v]) => {
          const set = (nv) => onChange({ ...value, [k]: nv });
          if (v && typeof v === 'object') {
            return (
              <fieldset key={k} className="rounded-lg border border-fog p-4">
                <legend className="px-2 font-semibold">{label(k)}</legend>
                <Editor value={v} onChange={set} />
              </fieldset>
            );
          }
          return (
            <div key={k}>
              <label className="mb-1 block text-sm font-semibold">{label(k)}</label>
              {VIDEO.has(k) ? (
                <>
                  <input className="input mb-2" autoComplete="off" placeholder="Paste a YouTube link, or upload a file below" value={v} onChange={(e) => set(e.target.value)} />
                  <ImageField value={/^https?:/.test(v) ? '' : v} onChange={set} accept="video/mp4,video/webm" label="Upload video" />
                </>
              ) : IMAGE.has(k) ? (
                <ImageField value={v} onChange={set} />
              ) : LONG.test(k) ? (
                <textarea rows={4} className="input" autoComplete="off" value={v} onChange={(e) => set(e.target.value)} />
              ) : (
                <input className="input" autoComplete="off" value={v} onChange={(e) => set(e.target.value)} />
              )}
            </div>
          );
        })}
      </div>
    );
  }
  return null;
}
