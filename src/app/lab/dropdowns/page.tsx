"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useActivity } from "@/context/ActivityContext";

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function DropdownsPage() {
    const { logAction, clearActivity } = useActivity();

    useEffect(() => { clearActivity(); }, []);

    const log = (msg: string) => logAction(msg, "Dropdowns");

    return (
        <>
            <DropdownsSideNav />
            <div className="container fade-in main-container" style={{ padding: "60px 40px", maxWidth: '1200px' }}>
                <div style={{ marginBottom: '3.75rem', textAlign: 'center' }}>
                    <h1 className="h1" style={{ marginBottom: '1rem' }}>Dropdowns & Selects</h1>
                    <p className="body-sm" style={{ maxWidth: '37.5rem', margin: '0 auto', fontSize: '1rem' }}>
                        Custom dropdowns, search selects, multi-selects, and advanced selection patterns.
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
                    <div id="section-native"><NativeSelects log={log} /></div>
                    <div id="section-searchable"><SearchableSelect log={log} /></div>
                    <div id="section-multi"><MultiSelect log={log} /></div>
                    <div id="section-cascading"><CascadingDropdown log={log} /></div>
                    <div id="section-autocomplete"><AutocompleteInput log={log} /></div>
                    <div id="section-tags"><TagInput log={log} /></div>
                    <div id="section-combobox"><ComboBox log={log} /></div>
                    <div id="section-grouped"><GroupedSelect log={log} /></div>
                </div>
            </div>
        </>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared Styles
// ─────────────────────────────────────────────────────────────────────────────
const sectionStyle: React.CSSProperties = {
    background: 'var(--bg-card)', borderRadius: '20px', padding: '32px',
    boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)',
};
const sectionHeader: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '24px', flexWrap: 'wrap', gap: '8px',
};
const badge = (color: string): React.CSSProperties => ({
    fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
    padding: '4px 10px', borderRadius: '99px', background: color,
    color: '#fff', letterSpacing: '0.05em',
});
const fieldLabel: React.CSSProperties = {
    fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)',
    marginBottom: '8px', display: 'block',
};
const nativeSelect: React.CSSProperties = {
    width: '100%', height: '44px', padding: '0 14px',
    borderRadius: '10px', border: 'none',
    boxShadow: 'inset 0 0 0 1px var(--border-strong)',
    background: 'var(--input-bg, var(--bg-secondary))',
    color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
    cursor: 'pointer', appearance: 'auto' as any,
};
const customDropdownBtn: React.CSSProperties = {
    width: '100%', height: '44px', padding: '0 14px',
    borderRadius: '10px', border: 'none',
    boxShadow: 'inset 0 0 0 1px var(--border-strong)',
    background: 'var(--input-bg, var(--bg-secondary))',
    color: 'var(--text-primary)', fontSize: '14px',
    cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', textAlign: 'left',
};
const dropdownPanel: React.CSSProperties = {
    position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
    background: 'var(--bg-card)', borderRadius: '12px',
    boxShadow: 'var(--shadow-lg), inset 0 0 0 1px var(--border-light)',
    padding: '6px', zIndex: 50, maxHeight: '250px', overflowY: 'auto',
};
const dropdownItem = (active: boolean): React.CSSProperties => ({
    padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
    fontSize: '14px', color: active ? 'var(--accent-primary)' : 'var(--text-primary)',
    background: active ? 'var(--accent-surface, var(--bg-secondary))' : 'transparent',
    fontWeight: active ? 600 : 400, transition: 'background 0.1s',
});
const searchInput: React.CSSProperties = {
    width: '100%', height: '36px', padding: '0 12px',
    borderRadius: '8px', border: 'none',
    boxShadow: 'inset 0 0 0 1px var(--border-light)',
    background: 'var(--bg-secondary)', color: 'var(--text-primary)',
    fontSize: '13px', outline: 'none', marginBottom: '6px',
};
const chevronSvg = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.5, flexShrink: 0 }}>
        <path d="M6 9l6 6 6-6" />
    </svg>
);
const resetBtnStyle: React.CSSProperties = {
    padding: '6px 14px', borderRadius: '8px', border: 'none',
    background: 'var(--bg-secondary)', color: 'var(--text-secondary)',
    fontSize: '12px', fontWeight: 600, cursor: 'pointer',
    boxShadow: 'inset 0 0 0 1px var(--border-light)',
    transition: 'all 0.2s',
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. Native Selects
// ─────────────────────────────────────────────────────────────────────────────
function NativeSelects({ log }: { log: (msg: string) => void }) {
    const [resetKey, setResetKey] = useState(0);
    const reset = () => { setResetKey(k => k + 1); log('Native Selects: Reset'); };

    return (
        <section style={sectionStyle} data-testid="native-section">
            <div style={sectionHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h2 className="h2">1. Native Selects</h2>
                    <div style={badge('#6366f1')}>Browser Default</div>
                </div>
                <button data-testid="native-reset" onClick={reset} style={resetBtnStyle}>Reset</button>
            </div>
            <p className="body-sm" style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
                Standard HTML select elements with different configurations.
            </p>
            <div key={resetKey} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {/* Basic Select */}
                <div>
                    <label style={fieldLabel}>Basic Select</label>
                    <select data-testid="native-basic" style={nativeSelect} onChange={(e) => log(`Native Basic: ${e.target.value}`)}>
                        <option value="">Choose a country...</option>
                        <option value="us">United States</option>
                        <option value="uk">United Kingdom</option>
                        <option value="ca">Canada</option>
                        <option value="de">Germany</option>
                        <option value="jp">Japan</option>
                        <option value="in">India</option>
                        <option value="au">Australia</option>
                    </select>
                </div>

                {/* Select with OptGroups */}
                <div>
                    <label style={fieldLabel}>Grouped Options (optgroup)</label>
                    <select data-testid="native-optgroup" style={nativeSelect} onChange={(e) => log(`Native Grouped: ${e.target.value}`)}>
                        <option value="">Select a vehicle...</option>
                        <optgroup label="Cars">
                            <option value="sedan">Sedan</option>
                            <option value="suv">SUV</option>
                            <option value="hatchback">Hatchback</option>
                        </optgroup>
                        <optgroup label="Bikes">
                            <option value="sport">Sport</option>
                            <option value="cruiser">Cruiser</option>
                        </optgroup>
                        <optgroup label="Trucks">
                            <option value="pickup">Pickup</option>
                            <option value="semi">Semi</option>
                        </optgroup>
                    </select>
                </div>

                {/* Multiple Native Select */}
                <div>
                    <label style={fieldLabel}>Native Multiple Select</label>
                    <select
                        data-testid="native-multiple"
                        multiple
                        style={{ ...nativeSelect, height: '140px', padding: '8px' }}
                        onChange={(e) => {
                            const selected = Array.from(e.target.selectedOptions).map(o => o.value);
                            log(`Native Multiple: [${selected.join(', ')}]`);
                        }}
                    >
                        <option value="react">React</option>
                        <option value="vue">Vue</option>
                        <option value="angular">Angular</option>
                        <option value="svelte">Svelte</option>
                        <option value="solid">SolidJS</option>
                        <option value="next">Next.js</option>
                    </select>
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px', display: 'block' }}>
                        Hold Ctrl/Cmd to select multiple
                    </span>
                </div>

                {/* Disabled Select */}
                <div>
                    <label style={fieldLabel}>Disabled Select</label>
                    <select data-testid="native-disabled" style={{ ...nativeSelect, opacity: 0.5, cursor: 'not-allowed' }} disabled>
                        <option>This select is disabled</option>
                    </select>
                </div>
            </div>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Searchable Select
// ─────────────────────────────────────────────────────────────────────────────
const COUNTRIES = [
    "Argentina", "Australia", "Austria", "Belgium", "Brazil", "Canada",
    "Chile", "China", "Colombia", "Denmark", "Egypt", "Finland", "France",
    "Germany", "Greece", "India", "Indonesia", "Ireland", "Israel", "Italy",
    "Japan", "Kenya", "Mexico", "Netherlands", "New Zealand", "Nigeria",
    "Norway", "Pakistan", "Peru", "Philippines", "Poland", "Portugal",
    "Russia", "Saudi Arabia", "Singapore", "South Africa", "South Korea",
    "Spain", "Sweden", "Switzerland", "Thailand", "Turkey", "UAE",
    "United Kingdom", "United States", "Vietnam",
];

function SearchableSelect({ log }: { log: (msg: string) => void }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState("");
    const ref = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const reset = () => { setOpen(false); setSearch(""); setSelected(""); log('Search Select: Reset'); };

    const filtered = COUNTRIES.filter(c => c.toLowerCase().includes(search.toLowerCase()));

    useClickOutside(ref, () => setOpen(false));

    useEffect(() => {
        if (open && inputRef.current) inputRef.current.focus();
    }, [open]);

    const select = (val: string) => {
        setSelected(val);
        setOpen(false);
        setSearch("");
        log(`Search Select: ${val}`);
    };

    return (
        <section style={sectionStyle} data-testid="searchable-section">
            <div style={sectionHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h2 className="h2">2. Searchable Select</h2>
                    <div style={badge('#0ea5e9')}>Type to Filter</div>
                </div>
                <button data-testid="searchable-reset" onClick={reset} style={resetBtnStyle}>Reset</button>
            </div>
            <p className="body-sm" style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
                Click to open, type to filter options. Tests keyboard interaction + search filtering.
            </p>
            <div style={{ maxWidth: '400px' }}>
                <label style={fieldLabel}>Select a Country</label>
                <div ref={ref} style={{ position: 'relative' }}>
                    <button
                        data-testid="searchable-trigger"
                        onClick={() => setOpen(o => !o)}
                        style={customDropdownBtn}
                    >
                        <span style={{ opacity: selected ? 1 : 0.5 }}>{selected || 'Search and select...'}</span>
                        {chevronSvg}
                    </button>
                    {open && (
                        <div style={dropdownPanel} data-testid="searchable-panel">
                            <input
                                ref={inputRef}
                                data-testid="searchable-input"
                                placeholder="Type to search..."
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); log(`Search Select: Typed "${e.target.value}"`); }}
                                style={searchInput}
                            />
                            {filtered.length === 0 && (
                                <div style={{ padding: '12px', fontSize: '13px', color: 'var(--text-tertiary)', textAlign: 'center' }}>No results found</div>
                            )}
                            {filtered.map(c => (
                                <div
                                    key={c}
                                    data-testid={`searchable-option-${c.toLowerCase().replace(/\s+/g, '-')}`}
                                    onClick={() => select(c)}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-secondary)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = selected === c ? 'var(--accent-surface, var(--bg-secondary))' : 'transparent')}
                                    style={dropdownItem(selected === c)}
                                >
                                    {c}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {selected && <div data-testid="searchable-value" style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-tertiary)' }}>Selected: {selected}</div>}
            </div>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Multi-Select with Checkboxes
// ─────────────────────────────────────────────────────────────────────────────
const SKILLS = [
    "JavaScript", "TypeScript", "Python", "Go", "Rust", "Java",
    "C#", "Ruby", "Swift", "Kotlin", "PHP", "Scala",
];

function MultiSelect({ log }: { log: (msg: string) => void }) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<string[]>([]);
    const ref = useRef<HTMLDivElement>(null);

    useClickOutside(ref, () => setOpen(false));

    const reset = () => { setOpen(false); setSelected([]); log('Multi-Select: Reset'); };

    const toggle = (skill: string) => {
        const next = selected.includes(skill) ? selected.filter(s => s !== skill) : [...selected, skill];
        setSelected(next);
        log(`Multi-Select: [${next.join(', ')}]`);
    };

    const clearAll = () => { setSelected([]); log('Multi-Select: Cleared all'); };

    return (
        <section style={sectionStyle} data-testid="multi-section">
            <div style={sectionHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h2 className="h2">3. Multi-Select</h2>
                    <div style={badge('#8b5cf6')}>Checkbox Dropdown</div>
                </div>
                <button data-testid="multi-reset" onClick={reset} style={resetBtnStyle}>Reset</button>
            </div>
            <p className="body-sm" style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
                Select multiple items with checkboxes. Tests multi-selection patterns.
            </p>
            <div style={{ maxWidth: '400px' }}>
                <label style={fieldLabel}>Select Skills</label>
                <div ref={ref} style={{ position: 'relative' }}>
                    <button data-testid="multi-trigger" onClick={() => setOpen(o => !o)} style={customDropdownBtn}>
                        <span style={{ opacity: selected.length ? 1 : 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {selected.length ? `${selected.length} selected` : 'Select skills...'}
                        </span>
                        {chevronSvg}
                    </button>
                    {open && (
                        <div style={dropdownPanel} data-testid="multi-panel">
                            {selected.length > 0 && (
                                <div style={{ padding: '6px 12px', marginBottom: '4px' }}>
                                    <button data-testid="multi-clear" onClick={clearAll} style={{ fontSize: '12px', color: 'var(--accent-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                                        Clear all ({selected.length})
                                    </button>
                                </div>
                            )}
                            {SKILLS.map(skill => (
                                <label
                                    key={skill}
                                    data-testid={`multi-option-${skill.toLowerCase()}`}
                                    style={{
                                        ...dropdownItem(selected.includes(skill)),
                                        display: 'flex', alignItems: 'center', gap: '10px',
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selected.includes(skill)}
                                        onChange={() => toggle(skill)}
                                        style={{ accentColor: 'var(--accent-primary)', width: '16px', height: '16px', cursor: 'pointer' }}
                                    />
                                    {skill}
                                </label>
                            ))}
                        </div>
                    )}
                </div>
                {selected.length > 0 && (
                    <div data-testid="multi-pills" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                        {selected.map(s => (
                            <span key={s} style={{
                                padding: '4px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 500,
                                background: 'var(--accent-surface, var(--bg-secondary))', color: 'var(--accent-primary)',
                                display: 'flex', alignItems: 'center', gap: '6px',
                            }}>
                                {s}
                                <button
                                    data-testid={`multi-remove-${s.toLowerCase()}`}
                                    onClick={() => toggle(s)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-primary)', fontSize: '14px', padding: 0, lineHeight: 1 }}
                                >×</button>
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Cascading (Dependent) Dropdowns
// ─────────────────────────────────────────────────────────────────────────────
const CASCADE_DATA: Record<string, Record<string, string[]>> = {
    "North America": { "United States": ["New York", "Los Angeles", "Chicago", "Houston"], "Canada": ["Toronto", "Vancouver", "Montreal"], "Mexico": ["Mexico City", "Guadalajara"] },
    "Europe": { "United Kingdom": ["London", "Manchester", "Edinburgh"], "Germany": ["Berlin", "Munich", "Hamburg"], "France": ["Paris", "Lyon", "Marseille"] },
    "Asia": { "Japan": ["Tokyo", "Osaka", "Kyoto"], "India": ["Mumbai", "Delhi", "Bangalore"], "South Korea": ["Seoul", "Busan"] },
};

function CascadingDropdown({ log }: { log: (msg: string) => void }) {
    const [continent, setContinent] = useState("");
    const [country, setCountry] = useState("");
    const [city, setCity] = useState("");

    const reset = () => { setContinent(""); setCountry(""); setCity(""); log('Cascading: Reset'); };

    const countries = continent ? Object.keys(CASCADE_DATA[continent] || {}) : [];
    const cities = continent && country ? CASCADE_DATA[continent]?.[country] || [] : [];

    return (
        <section style={sectionStyle} data-testid="cascading-section">
            <div style={sectionHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h2 className="h2">4. Cascading Dropdowns</h2>
                    <div style={badge('#f59e0b')}>Dependent Selects</div>
                </div>
                <button data-testid="cascading-reset" onClick={reset} style={resetBtnStyle}>Reset</button>
            </div>
            <p className="body-sm" style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
                Each dropdown depends on the previous selection. Tests sequential interaction flows.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', maxWidth: '700px' }}>
                <div>
                    <label style={fieldLabel}>Continent</label>
                    <select data-testid="cascade-continent" style={nativeSelect} value={continent} onChange={(e) => {
                        setContinent(e.target.value); setCountry(""); setCity("");
                        log(`Cascade Continent: ${e.target.value}`);
                    }}>
                        <option value="">Select continent...</option>
                        {Object.keys(CASCADE_DATA).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                    <label style={fieldLabel}>Country</label>
                    <select data-testid="cascade-country" style={{ ...nativeSelect, opacity: countries.length ? 1 : 0.5 }} value={country} disabled={!countries.length} onChange={(e) => {
                        setCountry(e.target.value); setCity("");
                        log(`Cascade Country: ${e.target.value}`);
                    }}>
                        <option value="">Select country...</option>
                        {countries.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                    <label style={fieldLabel}>City</label>
                    <select data-testid="cascade-city" style={{ ...nativeSelect, opacity: cities.length ? 1 : 0.5 }} value={city} disabled={!cities.length} onChange={(e) => {
                        setCity(e.target.value);
                        log(`Cascade City: ${e.target.value}`);
                    }}>
                        <option value="">Select city...</option>
                        {cities.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>
            {city && (
                <div data-testid="cascade-result" style={{ marginTop: '16px', padding: '14px 18px', background: 'var(--bg-secondary)', borderRadius: '10px', fontSize: '14px', color: 'var(--text-primary)' }}>
                    Selected: <strong>{city}</strong>, {country}, {continent}
                </div>
            )}
        </section>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Autocomplete Input
// ─────────────────────────────────────────────────────────────────────────────
const FRUITS = [
    "Apple", "Apricot", "Avocado", "Banana", "Blackberry", "Blueberry",
    "Cherry", "Coconut", "Cranberry", "Dragon Fruit", "Fig", "Grape",
    "Grapefruit", "Guava", "Kiwi", "Lemon", "Lime", "Lychee", "Mango",
    "Melon", "Nectarine", "Orange", "Papaya", "Passion Fruit", "Peach",
    "Pear", "Pineapple", "Plum", "Pomegranate", "Raspberry", "Strawberry",
    "Tangerine", "Watermelon",
];

function AutocompleteInput({ log }: { log: (msg: string) => void }) {
    const [value, setValue] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [highlightIndex, setHighlightIndex] = useState(-1);
    const ref = useRef<HTMLDivElement>(null);

    const reset = () => { setValue(""); setShowSuggestions(false); setHighlightIndex(-1); log('Autocomplete: Reset'); };

    const filtered = value.length > 0 ? FRUITS.filter(f => f.toLowerCase().includes(value.toLowerCase())) : [];

    useClickOutside(ref, () => setShowSuggestions(false));

    const select = (val: string) => {
        setValue(val);
        setShowSuggestions(false);
        setHighlightIndex(-1);
        log(`Autocomplete: Selected "${val}"`);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showSuggestions || filtered.length === 0) return;
        if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightIndex(i => Math.min(filtered.length - 1, i + 1)); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightIndex(i => Math.max(0, i - 1)); }
        else if (e.key === 'Enter' && highlightIndex >= 0) { e.preventDefault(); select(filtered[highlightIndex]); }
        else if (e.key === 'Escape') { setShowSuggestions(false); }
    };

    return (
        <section style={sectionStyle} data-testid="autocomplete-section">
            <div style={sectionHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h2 className="h2">5. Autocomplete</h2>
                    <div style={badge('#22c55e')}>Keyboard + Mouse</div>
                </div>
                <button data-testid="autocomplete-reset" onClick={reset} style={resetBtnStyle}>Reset</button>
            </div>
            <p className="body-sm" style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
                Type to see suggestions. Navigate with arrow keys, select with Enter. Tests keyboard-driven selection.
            </p>
            <div style={{ maxWidth: '400px' }}>
                <label style={fieldLabel}>Search Fruits</label>
                <div ref={ref} style={{ position: 'relative' }}>
                    <input
                        data-testid="autocomplete-input"
                        value={value}
                        onChange={(e) => { setValue(e.target.value); setShowSuggestions(true); setHighlightIndex(-1); log(`Autocomplete: Typed "${e.target.value}"`); }}
                        onFocus={() => value.length > 0 && setShowSuggestions(true)}
                        onKeyDown={handleKeyDown}
                        placeholder="Start typing a fruit..."
                        style={{ ...customDropdownBtn, cursor: 'text' }}
                        autoComplete="off"
                    />
                    {showSuggestions && filtered.length > 0 && (
                        <div style={dropdownPanel} data-testid="autocomplete-panel">
                            {filtered.slice(0, 8).map((f, i) => (
                                <div
                                    key={f}
                                    data-testid={`autocomplete-option-${f.toLowerCase().replace(/\s+/g, '-')}`}
                                    onClick={() => select(f)}
                                    onMouseEnter={(e) => { setHighlightIndex(i); e.currentTarget.style.background = 'var(--bg-secondary)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = highlightIndex === i ? 'var(--bg-secondary)' : 'transparent'; }}
                                    style={{
                                        ...dropdownItem(false),
                                        background: highlightIndex === i ? 'var(--bg-secondary)' : 'transparent',
                                    }}
                                >
                                    {f}
                                </div>
                            ))}
                            {filtered.length > 8 && (
                                <div style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                                    +{filtered.length - 8} more results
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Tag Input
// ─────────────────────────────────────────────────────────────────────────────
function TagInput({ log }: { log: (msg: string) => void }) {
    const [tags, setTags] = useState<string[]>(["react", "nextjs"]);
    const [input, setInput] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const reset = () => { setTags(["react", "nextjs"]); setInput(""); log('Tags: Reset'); };

    const addTag = (val: string) => {
        const trimmed = val.trim().toLowerCase();
        if (!trimmed || tags.includes(trimmed)) return;
        const next = [...tags, trimmed];
        setTags(next);
        setInput("");
        log(`Tags: Added "${trimmed}" → [${next.join(', ')}]`);
    };

    const removeTag = (tag: string) => {
        const next = tags.filter(t => t !== tag);
        setTags(next);
        log(`Tags: Removed "${tag}" → [${next.join(', ')}]`);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') { e.preventDefault(); addTag(input); }
        else if (e.key === 'Backspace' && !input && tags.length > 0) {
            removeTag(tags[tags.length - 1]);
        }
    };

    return (
        <section style={sectionStyle} data-testid="tags-section">
            <div style={sectionHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h2 className="h2">6. Tag Input</h2>
                    <div style={badge('#ec4899')}>Type + Enter</div>
                </div>
                <button data-testid="tags-reset" onClick={reset} style={resetBtnStyle}>Reset</button>
            </div>
            <p className="body-sm" style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
                Type a tag and press Enter. Backspace removes the last tag. Tests free-text entry patterns.
            </p>
            <div style={{ maxWidth: '500px' }}>
                <label style={fieldLabel}>Add Tags</label>
                <div
                    onClick={() => inputRef.current?.focus()}
                    data-testid="tags-container"
                    style={{
                        display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center',
                        padding: '8px 12px', minHeight: '44px',
                        borderRadius: '10px', boxShadow: 'inset 0 0 0 1px var(--border-strong)',
                        background: 'var(--input-bg, var(--bg-secondary))', cursor: 'text',
                    }}
                >
                    {tags.map(tag => (
                        <span key={tag} data-testid={`tag-${tag}`} style={{
                            padding: '4px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 500,
                            background: 'var(--accent-surface, var(--bg-tertiary))', color: 'var(--accent-primary)',
                            display: 'flex', alignItems: 'center', gap: '6px',
                        }}>
                            {tag}
                            <button data-testid={`tag-remove-${tag}`} onClick={() => removeTag(tag)} style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: 'var(--accent-primary)', fontSize: '14px', padding: 0, lineHeight: 1,
                            }}>×</button>
                        </span>
                    ))}
                    <input
                        ref={inputRef}
                        data-testid="tag-input"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={tags.length === 0 ? "Type and press Enter..." : ""}
                        style={{
                            flex: 1, minWidth: '100px', border: 'none', outline: 'none',
                            background: 'transparent', fontSize: '14px',
                            color: 'var(--text-primary)', padding: '4px 0',
                        }}
                    />
                </div>
                <div data-testid="tags-value" style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                    Tags: [{tags.join(', ')}]
                </div>
            </div>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. ComboBox (editable select)
// ─────────────────────────────────────────────────────────────────────────────
const TIMEZONES = [
    "UTC-12:00", "UTC-11:00", "UTC-10:00 (Hawaii)", "UTC-09:00 (Alaska)",
    "UTC-08:00 (Pacific)", "UTC-07:00 (Mountain)", "UTC-06:00 (Central)",
    "UTC-05:00 (Eastern)", "UTC-04:00 (Atlantic)", "UTC-03:00 (Buenos Aires)",
    "UTC+00:00 (London)", "UTC+01:00 (Berlin)", "UTC+02:00 (Cairo)",
    "UTC+03:00 (Moscow)", "UTC+05:00 (Karachi)", "UTC+05:30 (Mumbai)",
    "UTC+08:00 (Singapore)", "UTC+09:00 (Tokyo)", "UTC+10:00 (Sydney)",
    "UTC+12:00 (Auckland)",
];

function ComboBox({ log }: { log: (msg: string) => void }) {
    const [value, setValue] = useState("");
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const reset = () => { setValue(""); setOpen(false); log('ComboBox: Reset'); };

    const filtered = TIMEZONES.filter(tz => tz.toLowerCase().includes(value.toLowerCase()));

    useClickOutside(ref, () => setOpen(false));

    return (
        <section style={sectionStyle} data-testid="combobox-section">
            <div style={sectionHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h2 className="h2">7. ComboBox</h2>
                    <div style={badge('#14b8a6')}>Editable Select</div>
                </div>
                <button data-testid="combobox-reset" onClick={reset} style={resetBtnStyle}>Reset</button>
            </div>
            <p className="body-sm" style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
                Type freely or select from suggestions. Allows custom values not in the list.
            </p>
            <div style={{ maxWidth: '400px' }}>
                <label style={fieldLabel}>Timezone</label>
                <div ref={ref} style={{ position: 'relative' }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            data-testid="combobox-input"
                            value={value}
                            onChange={(e) => { setValue(e.target.value); setOpen(true); log(`ComboBox: Typed "${e.target.value}"`); }}
                            onFocus={() => setOpen(true)}
                            placeholder="Type or select timezone..."
                            style={{ ...customDropdownBtn, cursor: 'text', paddingRight: '40px' }}
                            autoComplete="off"
                        />
                        <button
                            data-testid="combobox-toggle"
                            onClick={() => setOpen(o => !o)}
                            style={{
                                position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                                background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                            }}
                        >
                            {chevronSvg}
                        </button>
                    </div>
                    {open && (
                        <div style={dropdownPanel} data-testid="combobox-panel">
                            {filtered.length === 0 ? (
                                <div style={{ padding: '12px', fontSize: '13px', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                                    No matches — custom value &quot;{value}&quot; will be used
                                </div>
                            ) : filtered.map(tz => (
                                <div
                                    key={tz}
                                    data-testid={`combobox-option-${tz.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`}
                                    onClick={() => { setValue(tz); setOpen(false); log(`ComboBox: Selected "${tz}"`); }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-secondary)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = value === tz ? 'var(--accent-surface, var(--bg-secondary))' : 'transparent')}
                                    style={dropdownItem(value === tz)}
                                >
                                    {tz}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div data-testid="combobox-value" style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                    Value: {value || '(empty)'}
                </div>
            </div>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Grouped Custom Select
// ─────────────────────────────────────────────────────────────────────────────
const GROUPED_OPTIONS = [
    { group: "Frontend", items: ["React", "Vue", "Angular", "Svelte", "Next.js"] },
    { group: "Backend", items: ["Node.js", "Python", "Go", "Rust", "Java"] },
    { group: "Database", items: ["PostgreSQL", "MongoDB", "Redis", "MySQL"] },
    { group: "DevOps", items: ["Docker", "Kubernetes", "Terraform", "AWS"] },
];

function GroupedSelect({ log }: { log: (msg: string) => void }) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState("");
    const ref = useRef<HTMLDivElement>(null);

    const reset = () => { setOpen(false); setSelected(""); log('Grouped Select: Reset'); };

    useClickOutside(ref, () => setOpen(false));

    const select = (val: string) => {
        setSelected(val);
        setOpen(false);
        log(`Grouped Select: ${val}`);
    };

    return (
        <section style={sectionStyle} data-testid="grouped-section">
            <div style={sectionHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h2 className="h2">8. Grouped Custom Select</h2>
                    <div style={badge('#f97316')}>Category Groups</div>
                </div>
                <button data-testid="grouped-reset" onClick={reset} style={resetBtnStyle}>Reset</button>
            </div>
            <p className="body-sm" style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
                Custom dropdown with grouped options and group headers. Tests navigating grouped item lists.
            </p>
            <div style={{ maxWidth: '400px' }}>
                <label style={fieldLabel}>Select Technology</label>
                <div ref={ref} style={{ position: 'relative' }}>
                    <button data-testid="grouped-trigger" onClick={() => setOpen(o => !o)} style={customDropdownBtn}>
                        <span style={{ opacity: selected ? 1 : 0.5 }}>{selected || 'Select a technology...'}</span>
                        {chevronSvg}
                    </button>
                    {open && (
                        <div style={dropdownPanel} data-testid="grouped-panel">
                            {GROUPED_OPTIONS.map(group => (
                                <div key={group.group}>
                                    <div style={{
                                        padding: '8px 12px 4px', fontSize: '11px', fontWeight: 700,
                                        color: 'var(--text-tertiary)', textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                    }}>
                                        {group.group}
                                    </div>
                                    {group.items.map(item => (
                                        <div
                                            key={item}
                                            data-testid={`grouped-option-${item.toLowerCase().replace(/[.\s]+/g, '-')}`}
                                            onClick={() => select(item)}
                                            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-secondary)')}
                                            onMouseLeave={(e) => (e.currentTarget.style.background = selected === item ? 'var(--accent-surface, var(--bg-secondary))' : 'transparent')}
                                            style={dropdownItem(selected === item)}
                                        >
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {selected && <div data-testid="grouped-value" style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-tertiary)' }}>Selected: {selected}</div>}
            </div>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Click Outside Hook
// ─────────────────────────────────────────────────────────────────────────────
function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
    useEffect(() => {
        const listener = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) handler();
        };
        document.addEventListener('mousedown', listener);
        return () => document.removeEventListener('mousedown', listener);
    }, [ref, handler]);
}

// ─────────────────────────────────────────────────────────────────────────────
// Side Navigation
// ─────────────────────────────────────────────────────────────────────────────
function DropdownsSideNav() {
    const navRef = useRef<HTMLDivElement>(null);
    const sections = [
        { id: 'section-native', label: 'Native' },
        { id: 'section-searchable', label: 'Searchable' },
        { id: 'section-multi', label: 'Multi-Select' },
        { id: 'section-cascading', label: 'Cascading' },
        { id: 'section-autocomplete', label: 'Autocomplete' },
        { id: 'section-tags', label: 'Tags' },
        { id: 'section-combobox', label: 'ComboBox' },
        { id: 'section-grouped', label: 'Grouped' },
    ];

    const scrollTo = (id: string) => {
        const root = navRef.current?.getRootNode() as Document | ShadowRoot;
        let target = root?.getElementById?.(id);
        if (!target) target = document.getElementById(id);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    return (
        <div ref={navRef} className="fade-in side-nav-container" style={{
            position: 'fixed', left: '1.875rem', top: '8rem',
            display: 'flex', flexDirection: 'column', gap: '2rem', zIndex: 100,
        }}>
            <div style={{
                fontSize: '0.625rem', fontWeight: 800, color: 'var(--text-tertiary)',
                letterSpacing: '0.15em', textTransform: 'uppercase',
                marginBottom: '-0.5rem', marginLeft: '0.375rem',
            }}>
                Navigation
            </div>
            {sections.map(item => (
                <div
                    key={item.id}
                    className="nav-dot-wrapper"
                    onClick={() => scrollTo(item.id)}
                    style={{
                        position: 'relative', display: 'flex', alignItems: 'center',
                        cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}
                >
                    <div className="nav-label" style={{
                        position: 'absolute', left: '1.75rem',
                        background: 'var(--bg-card)', padding: '0.375rem 0.875rem',
                        borderRadius: '1.25rem', border: '1px solid var(--border-light)',
                        fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '0.05em', whiteSpace: 'nowrap', opacity: 0.8,
                        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        boxShadow: 'var(--shadow-sm)', color: 'var(--text-secondary)',
                    }}>
                        {item.label}
                    </div>
                    <div className="nav-dot" style={{
                        width: '0.75rem', height: '0.75rem', borderRadius: '50%',
                        background: 'var(--text-tertiary)',
                        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        opacity: 0.6, zIndex: 2, border: '2px solid transparent',
                    }} />
                    <div className="nav-halo" style={{
                        position: 'absolute', left: '0.375rem', top: '50%',
                        transform: 'translate(-50%, -50%) scale(0)',
                        width: '2rem', height: '2rem', borderRadius: '50%',
                        background: 'var(--accent-primary)', opacity: 0,
                        filter: 'blur(0.5rem)',
                        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', zIndex: 1,
                    }} />
                    <style jsx>{`
                        .nav-dot-wrapper:hover { transform: scale(1.05) !important; }
                        .nav-dot-wrapper:hover .nav-dot {
                            background: #fff; border-color: var(--accent-primary);
                            box-shadow: 0 0 15px var(--accent-primary), inset 0 0 5px var(--accent-primary);
                            opacity: 1;
                        }
                        .nav-dot-wrapper:hover .nav-halo { transform: translate(-50%, -50%) scale(1.2); opacity: 0.25; }
                        .nav-dot-wrapper:hover .nav-label { color: var(--text-primary); border-color: var(--accent-primary); opacity: 1; }
                    `}</style>
                </div>
            ))}
        </div>
    );
}
