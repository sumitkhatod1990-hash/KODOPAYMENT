import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Cpu, Play, Activity, CheckCircle2, Zap } from 'lucide-react';

export const UsageMetersTab: React.FC = () => {
  const { meters, trackMeterEvent } = useApp();
  const [selectedMeter, setSelectedMeter] = useState('llm_tokens_consumed');
  const [eventUnits, setEventUnits] = useState(5000);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedSuccess, setSimulatedSuccess] = useState(false);

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);
    await trackMeterEvent(selectedMeter, eventUnits, 'cus_qivropay_simulated');
    setIsSimulating(false);
    setSimulatedSuccess(true);
    setTimeout(() => setSimulatedSuccess(false), 2500);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl">
      
      <div>
        <h2 className="text-2xl font-bold text-[#1d1d1f] font-heading">
          AI & GPU Usage Meters
        </h2>
        <p className="text-xs sm:text-sm text-[#86868b]">
          Real-time consumption aggregation for LLM tokens, GPU compute seconds, and API inference calls.
        </p>
      </div>

      {/* Meter Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {meters.map((meter) => (
          <div key={meter.id} className="p-7 rounded-3xl bg-white border border-black/10 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100">
                <Cpu className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-mono text-[10px] font-bold">
                SUM AGGREGATION
              </span>
            </div>

            <div>
              <h3 className="font-bold text-[#1d1d1f] text-lg font-sans">
                {meter.name}
              </h3>
              <div className="text-xs font-mono text-[#86868b] mt-0.5">
                Event: <code>{meter.eventName}</code>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#f5f5f7] border border-black/5 space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#86868b]">Aggregated Volume:</span>
                <span className="font-bold text-[#1d1d1f] text-sm">
                  {meter.currentUsage.toLocaleString()} {meter.unit}
                </span>
              </div>
              <div className="w-full bg-black/10 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-600 h-full w-3/4 rounded-full"></div>
              </div>
            </div>

            <div className="text-[11px] text-[#86868b] font-mono flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>Last Event: {new Date(meter.updatedAt).toLocaleTimeString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Event Ingestion Simulator */}
      <div className="p-8 rounded-3xl bg-white border border-black/10 shadow-sm space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-black/5">
          <Zap className="w-5 h-5 text-[#0071e3]" />
          <div>
            <h3 className="font-bold text-[#1d1d1f] text-base font-sans">
              Live Ingestion Stream Simulator
            </h3>
            <p className="text-xs text-[#86868b]">
              Test sending real-time consumption events to QIVROPAY usage meter aggregator.
            </p>
          </div>
        </div>

        <form onSubmit={handleSimulate} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-[#1d1d1f]">Select Target Meter</label>
            <select
              value={selectedMeter}
              onChange={(e) => setSelectedMeter(e.target.value)}
              className="w-full p-3 rounded-xl border border-black/10 bg-[#f5f5f7] text-[#1d1d1f]"
            >
              <option value="llm_tokens_consumed">llm_tokens_consumed</option>
              <option value="gpu_compute_ms">gpu_compute_ms</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-[#1d1d1f]">Units to Stream</label>
            <input
              type="number"
              min="100"
              step="500"
              value={eventUnits}
              onChange={(e) => setEventUnits(Number(e.target.value))}
              className="w-full p-3 rounded-xl border border-black/10 bg-[#f5f5f7] font-mono text-[#1d1d1f] outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isSimulating}
              className="apple-btn-black w-full py-3 text-xs flex items-center justify-center gap-2 shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              {isSimulating ? 'Streaming...' : 'Stream Event'}
            </button>
          </div>
        </form>

        {simulatedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-mono flex items-center gap-2 animate-fade-in border border-emerald-200">
            <CheckCircle2 className="w-4 h-4" />
            <span>Successfully tracked event: {eventUnits} units added to meter</span>
          </div>
        )}
      </div>

    </div>
  );
};
