"use client";

import { useState } from 'react';
import './globals.css';

export default function Home() {
    const [input, setInput] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Formatter
    const formatTree = (treeObj, indent = '') => {
        if (Object.keys(treeObj).length === 0) return '';
        let res = '';
        const keys = Object.keys(treeObj).sort();
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const isLast = i === keys.length - 1;
            const prefix = isLast ? ' └── ' : ' ├── ';
            res += indent + prefix + key + '\n';
            const nextIndent = indent + (isLast ? '     ' : ' │   ');
            res += formatTree(treeObj[key], nextIndent);
        }
        return res;
    };

    const handleProcess = async () => {
        setError('');
        setResult(null);
        setLoading(true);

        let parsedData = [];
        try {
            const trimmed = input.trim();
            if (trimmed.length === 0) throw { type: 'empty' };

            if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
                let parsed;
                try {
                    parsed = JSON.parse(trimmed);
                } catch {
                    throw { type: 'malformed_json' };
                }
                if (!Array.isArray(parsed)) throw { type: 'not_array' };
                for (let i = 0; i < parsed.length; i++) {
                    if (typeof parsed[i] !== 'string') throw { type: 'non_string_item', index: i, value: parsed[i] };
                }
                parsedData = parsed;
            } else {
                parsedData = input.split(/,|\n/).map(s => s.trim()).filter(s => s.length > 0);
            }
            if (parsedData.length === 0) throw { type: 'empty_array' };
        } catch (e) {
            let msg;
            switch (e.type) {
                case 'empty': msg = 'Input is empty. Please enter your array of nodes.'; break;
                case 'malformed_json': msg = 'Malformed JSON format. Please check your syntax.'; break;
                case 'not_array': msg = 'Data must be an array[...] format.'; break;
                case 'non_string_item': msg = `Item at index ${e.index} is not a valid string.`; break;
                case 'empty_array': msg = 'The array is empty. Specify at least one node.'; break;
                default: msg = 'Invalid input format. Ensure you provide valid data.';
            }
            setError(msg);
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/bfhl', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: parsedData })
            });

            if (res.status === 400) throw { type: 'bad_request' };
            if (res.status === 404) throw { type: 'not_found' };
            if (res.status >= 500) throw { type: 'server_error', status: res.status };
            if (!res.ok) throw { type: 'http_error', status: res.status };

            const data = await res.json();
            setResult(data);
        } catch (e) {
            let msg;
            switch (e.type) {
                case 'bad_request': msg = 'Bad Request format (400). Please verify payload.'; break;
                case 'not_found': msg = 'API Endpoint not found (404).'; break;
                case 'server_error': msg = `Internal Server Error (${e.status}).`; break;
                case 'http_error': msg = `Unexpected Response (${e.status}).`; break;
                default: 
                    if (e.message && e.message.includes('fetch')) msg = 'Network Error. Could not resolve API.'; 
                    else msg = 'Unknown API execution failure.';
            }
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-container">
            {/* Main Area — full width, no sidebar */}
            <main className="main-area">
                <header className="topbar">
                    <div className="topbar-left">
                        <div className="brand">
                            <img src="/images/logo_bf.png" alt="Logo" className="brand-logo" />
                            <div className="brand-name">Hierarchy Visualizer</div>
                        </div>
                    </div>
                    <div className="topbar-right">
                        {result && (
                            <div className="user-chips">
                                <span className="chip">
                                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                    {result.user_id}
                                </span>
                                <span className="chip">
                                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                    {result.email_id}
                                </span>
                                <span className="chip">
                                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path></svg>
                                    {result.college_roll_number}
                                </span>
                            </div>
                        )}
                        <button className="btn-primary" onClick={handleProcess} disabled={loading || !input.trim()}>
                            {loading ? <span className="spinner"></span> : "Process Graph"}
                        </button>
                    </div>
                </header>
                
                <div className="dashboard-grid">
                    
                    {/* LEFT COLUMN: Input & Errors */}
                    <div className="left-col">
                        {error && (
                            <div className="alert alert-error">
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <div>{error}</div>
                            </div>
                        )}
                        
                        <div className="card">
                            <div className="card-header">
                                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                                Raw Edge Input
                            </div>
                            <div className="editor-wrap">
                                <textarea 
                                    className="editor-textarea" 
                                    placeholder='["A->B", "A->C", "B->D"]'
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    spellCheck="false"
                                ></textarea>
                            </div>
                        </div>

                        {result && (result.invalid_entries?.length > 0 || result.duplicate_edges?.length > 0) && (
                            <div className="card" style={{ marginTop: '1.25rem' }}>
                                <div className="card-header">Filter Logs</div>
                                <div className="card-body">
                                    {result.invalid_entries?.length > 0 && (
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>INVALID FORMATS</div>
                                            <div className="badge-group">
                                                {result.invalid_entries.map((e, idx) => <span key={idx} className="badge badge-danger">{e}</span>)}
                                            </div>
                                        </div>
                                    )}
                                    {result.duplicate_edges?.length > 0 && (
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>DUPLICATE EDGES</div>
                                            <div className="badge-group">
                                                {result.duplicate_edges.map((e, idx) => <span key={idx} className="badge badge-warning">{e}</span>)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* RIGHT COLUMN: Output */}
                    <div className="right-col">
                        {result ? (
                            <>
                                <div className="metrics-row">
                                    <div className="metric-card">
                                        <div className="metric-label">Valid Trees</div>
                                        <div className="metric-value">{result.summary.total_trees}</div>
                                    </div>
                                    <div className="metric-card">
                                        <div className="metric-label">Cyclic Groups</div>
                                        <div className="metric-value" style={{ color: result.summary.total_cycles > 0 ? "var(--red-solid)" : "var(--text-main)" }}>
                                            {result.summary.total_cycles}
                                        </div>
                                    </div>
                                    <div className="metric-card">
                                        <div className="metric-label">Largest Root</div>
                                        <div className="metric-value" style={{ color: "var(--brand-solid)" }}>
                                            {result.summary.largest_tree_root || "—"}
                                        </div>
                                    </div>
                                </div>

                                <div className="card">
                                    <div className="card-header">Parsed Hierarchies</div>
                                    <div className="card-body">
                                        {result.hierarchies?.length > 0 ? (
                                            <div className="trees-grid">
                                                {result.hierarchies.map((h, i) => (
                                                    <div key={i} className={`tree-panel ${h.has_cycle ? 'has-cycle' : ''}`}>
                                                        <div className="tree-header">
                                                            <div className="tree-root-id">{h.root}</div>
                                                            {h.has_cycle ? (
                                                                <span className="tree-meta error">Cycle Detected</span>
                                                            ) : (
                                                                <span className="tree-meta">Depth {h.depth}</span>
                                                            )}
                                                        </div>
                                                        <div className="tree-code">
                                                            {!h.has_cycle ? formatTree(h.tree) : "Visualization omitted due to circular references."}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No valid hierarchies parsed.</div>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-faint)' }}>
                                <svg width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24" style={{ marginBottom: '1rem', opacity: 0.5 }}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                                <p style={{ fontSize: '0.875rem' }}>Enter edges in the input panel and click Process Graph to begin.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
