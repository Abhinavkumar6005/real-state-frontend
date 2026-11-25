'use client';
import { useEffect, useState } from 'react';
import { API } from '@/lib/api';

const today = () => new Date(Date.now() - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10);

function FormField({ id, label, type = 'text', req, placeholder, errorMsg, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-dusk">
        {label}{req && <span className="text-red-600" aria-hidden="true"> *</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required={req}
        placeholder={placeholder}
        aria-invalid={!!errorMsg}
        aria-describedby={errorMsg ? id + '-e' : undefined}
        className="input"
        {...props}
      />
      {errorMsg && <p id={id + '-e'} className="mt-1 text-sm text-red-700">{errorMsg}</p>}
    </div>
  );
}

export default function BookingForm({ plotId: initialPlotId = '', plots = [], success, error }) {
  const [errs, setErrs] = useState({});
  const [state, setState] = useState('idle'); // idle | sending | done | failed
  const [selectedPlot, setSelectedPlot] = useState(initialPlotId || '');
  const [enquiryType, setEnquiryType] = useState('Site Visit');

  useEffect(() => {
    if (initialPlotId) setSelectedPlot(initialPlotId);
  }, [initialPlotId]);

  useEffect(() => {
    const onSelect = (e) => {
      if (e.detail?.plotId) {
        setSelectedPlot(e.detail.plotId);
        setEnquiryType('Plot Booking');
        setState('idle');
      }
    };
    window.addEventListener('vistara:select-plot', onSelect);
    return () => window.removeEventListener('vistara:select-plot', onSelect);
  }, []);

  async function submit(e) {
    e.preventDefault();
    const f = e.currentTarget;
    const d = Object.fromEntries(new FormData(f));
    const local = {};
    if ((d.name || '').trim().length < 2) local.name = 'Enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email || '')) local.email = 'Enter a valid email address.';
    if (!/^[+]?[0-9\s\-()]{7,20}$/.test(d.phone || '')) local.phone = 'Enter a valid phone number.';
    if (!d.visitDate || d.visitDate < today()) local.visitDate = 'Choose today or a future date.';
    setErrs(local);
    if (Object.keys(local).length) { setState('failed'); return; }

    setState('sending');
    try {
      const r = await fetch(API + '/api/public/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...d,
          plotId: selectedPlot || '',
          enquiryType,
        }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { setErrs(j.errors || {}); setState('failed'); return; }
      f.reset();
      setState('done');
    } catch {
      setState('failed');
    }
  }

  if (state === 'done') {
    return (
      <div role="status" className="mt-8 rounded-2xl border border-field/20 bg-field p-7 text-white shadow-lg">
        <p className="font-display text-2xl font-bold">Request Confirmed</p>
        <p className="mt-2 text-white/90">{success}</p>
        <button type="button" onClick={() => setState('idle')} className="mt-5 rounded-full bg-white px-5 py-2 text-sm font-semibold text-dusk hover:bg-marigold">
          Submit another enquiry
        </button>
      </div>
    );
  }

  const activePlot = plots.find((p) => p._id === selectedPlot);

  return (
    <form onSubmit={submit} noValidate className="mt-7 grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <span className="mb-2 block text-sm font-semibold text-dusk">Enquiry Type</span>
        <div className="inline-flex rounded-xl border border-fog bg-chalk p-1">
          {['Site Visit', 'Plot Booking'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setEnquiryType(t)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${enquiryType === t ? 'bg-dusk text-white shadow-sm' : 'text-dusk/70 hover:text-dusk'}`}
            >
              {t === 'Site Visit' ? 'Schedule a Site Visit' : 'Book / Reserve a Plot'}
            </button>
          ))}
        </div>
      </div>

      <FormField id="name" label="Full Name" req autoComplete="name" placeholder="e.g. Aarav Sharma" errorMsg={errs.name} />
      <FormField id="email" label="Email Address" type="email" req autoComplete="email" placeholder="you@example.com" errorMsg={errs.email} />
      <FormField id="phone" label="Phone Number" type="tel" req autoComplete="tel" placeholder="+91 98765 43210" errorMsg={errs.phone} />
      <FormField id="visitDate" label="Preferred Booking or Visit Date" type="date" req min={today()} errorMsg={errs.visitDate} />

      <div className="sm:col-span-2">
        <label htmlFor="plotId" className="mb-1.5 block text-sm font-semibold text-dusk">
          Selected Plot <span className="font-normal text-dusk/50">(optional)</span>
        </label>
        <select
          id="plotId"
          name="plotId"
          value={selectedPlot}
          onChange={(e) => setSelectedPlot(e.target.value)}
          className="input"
        >
          <option value="">General enquiry / Help me choose on site</option>
          {plots.map((p) => {
            const label = [
              p.plotNumber ? `Plot ${p.plotNumber}` : null,
              p.title,
              p.area,
              p.price,
              `(${p.availability === 'Booked' ? 'Reserved' : p.availability})`,
            ].filter(Boolean).join(' · ');
            return (
              <option key={p._id} value={p._id} disabled={p.availability === 'Sold'}>
                {label}
              </option>
            );
          })}
        </select>
        {activePlot && (
          <p className="mt-2 rounded-lg bg-chalk px-3 py-2 text-xs text-dusk/80">
            Selected: <strong>{activePlot.title}</strong>
            {activePlot.dimensions ? ` · ${activePlot.dimensions}` : ''}
            {activePlot.location ? ` · ${activePlot.location}` : ''}
          </p>
        )}
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="message" className="mb-1.5 block text-sm font-semibold text-dusk">Additional Message or Enquiry</label>
        <textarea
          id="message"
          name="message"
          rows={4}
          maxLength={2000}
          placeholder="Preferred time slot, questions about corner plots, financing, or dimensions..."
          className="input"
          aria-invalid={!!errs.message}
        />
        {errs.message && <p className="mt-1 text-sm text-red-700">{errs.message}</p>}
      </div>

      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px]" />

      <div className="sm:col-span-2">
        <button disabled={state === 'sending'} className="btn btn-dark w-full sm:w-auto disabled:opacity-60">
          {state === 'sending' ? 'Submitting...' : enquiryType === 'Plot Booking' ? 'Submit Plot Booking Request' : 'Schedule Site Visit'}
        </button>
        {state === 'failed' && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
      </div>
    </form>
  );
}
