import { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, Edit, RefreshCw, AlertTriangle, Users } from 'lucide-react';
import { AiDoodle } from '../components/ui/NotionDoodles';
import API from '../api/client';

export default function Admin() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    location: '',
    latitude: 22.3072,
    longitude: 73.1812,
    severity: 'moderate',
    type: 'accident',
    trafficImpact: 60,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/admin/incidents');
      setIncidents(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/incidents', form);
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert('Failed to save incident');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this incident?')) return;
    try {
      await API.delete(`/admin/incidents/${id}`);
      fetchData();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  return (
    <div className="min-h-full bg-notion-bg text-notion-text pb-16 font-sans">
      {/* Minimal Cover */}
      <div className="notion-cover flex items-center justify-between px-8">
        <div>
          <p className="text-xs text-notion-dim font-mono uppercase tracking-wider">Management</p>
          <p className="text-sm font-semibold text-notion-heading font-serif">Admin Telemetry & Incident Registry</p>
        </div>
        <AiDoodle className="w-16 h-16 opacity-40" />
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 space-y-6">
        {/* Header Block */}
        <div className="relative mb-2">
          <div className="notion-page-icon">⚡️</div>
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-notion-heading font-serif tracking-tight">
                Admin Database
              </h1>
              <p className="text-xs text-notion-muted mt-0.5">
                Manage live roadblocks, trigger manual incident alerts, and view system registry.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={fetchData} className="btn-notion-secondary text-xs">
                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                <span>Sync</span>
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="btn-notion-primary text-xs"
              >
                <Plus size={12} />
                <span>Add Incident</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal for New Incident */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="notion-card p-5 w-full max-w-md space-y-4 bg-notion-card border-notion-border animate-fade-in text-xs shadow-2xl">
              <div className="flex items-center justify-between border-b border-notion-border pb-2">
                <span className="font-semibold text-notion-heading font-serif text-sm">
                  Register Road Incident
                </span>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-notion-dim hover:text-notion-heading"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-3">
                <div>
                  <label className="text-[11px] text-notion-dim block mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Broken Down Truck on NH48"
                    className="notion-input"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-notion-dim block mb-1">Location Address</label>
                  <input
                    type="text"
                    required
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="e.g. NH48, Jambuva Bypass"
                    className="notion-input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-notion-dim block mb-1">Type</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="notion-input"
                    >
                      <option value="accident">Accident</option>
                      <option value="construction">Construction</option>
                      <option value="flooding">Flooding</option>
                      <option value="congestion">Congestion</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-notion-dim block mb-1">Severity</label>
                    <select
                      value={form.severity}
                      onChange={(e) => setForm({ ...form, severity: e.target.value })}
                      className="notion-input"
                    >
                      <option value="low">Low</option>
                      <option value="moderate">Moderate</option>
                      <option value="high">High</option>
                      <option value="severe">Severe</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-notion-border">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-notion-ghost text-xs"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-notion-primary text-xs">
                    Save Incident
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Incident Database Table */}
        <div className="notion-card space-y-0">
          <div className="p-3 border-b border-notion-border flex items-center justify-between">
            <span className="text-xs font-semibold text-notion-dim uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle size={12} />
              Incident Registry Database ({incidents.length})
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-notion-border bg-notion-sidebar text-notion-dim text-[11px]">
                  <th className="p-2.5 font-medium">Title</th>
                  <th className="p-2.5 font-medium">Location</th>
                  <th className="p-2.5 font-medium">Type</th>
                  <th className="p-2.5 font-medium">Severity</th>
                  <th className="p-2.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-notion-border">
                {incidents.length > 0 ? (
                  incidents.map((inc) => (
                    <tr key={inc._id || inc.id} className="notion-table-row">
                      <td className="p-2.5 font-medium text-notion-heading">{inc.title}</td>
                      <td className="p-2.5 text-notion-dim">{inc.location}</td>
                      <td className="p-2.5 capitalize">{inc.type}</td>
                      <td className="p-2.5">
                        <span
                          className={`notion-pill text-[10px] capitalize ${
                            inc.severity === 'high' || inc.severity === 'severe'
                              ? 'notion-pill-red'
                              : 'notion-pill-yellow'
                          }`}
                        >
                          {inc.severity}
                        </span>
                      </td>
                      <td className="p-2.5 text-right">
                        <button
                          onClick={() => handleDelete(inc._id || inc.id)}
                          className="text-neutral-400 hover:text-red-500 p-1 transition-colors"
                          title="Delete incident"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-notion-dim text-xs">
                      No registered incidents.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
