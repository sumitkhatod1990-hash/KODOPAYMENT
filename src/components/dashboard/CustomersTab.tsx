import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search } from 'lucide-react';

export const CustomersTab: React.FC = () => {
  const { customers } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      
      <div>
        <h2 className="text-2xl font-bold text-[#1d1d1f] font-heading">
          Customer Management & CRM
        </h2>
        <p className="text-xs sm:text-sm text-[#86868b]">
          Track customer lifetime value, subscriptions, active AI credits, and geography.
        </p>
      </div>

      <div className="rounded-3xl bg-white border border-black/10 shadow-sm overflow-hidden">
        
        <div className="p-4 border-b border-black/5">
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 text-[#86868b] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-[#f5f5f7] border border-black/5 text-[#1d1d1f] focus:border-[#0071e3] outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-black/10 bg-[#fafafc] text-[#86868b] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Customer ID</th>
                <th className="p-4 font-semibold">Name & Email</th>
                <th className="p-4 font-semibold">Country</th>
                <th className="p-4 font-semibold">Active Subscriptions</th>
                <th className="p-4 font-semibold">Total Spent</th>
                <th className="p-4 font-semibold">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredCustomers.map((cus) => (
                <tr key={cus.id} className="hover:bg-[#f5f5f7] transition-colors">
                  <td className="p-4 font-mono font-semibold text-[#1d1d1f]">
                    {cus.id}
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-[#1d1d1f]">{cus.name}</div>
                    <div className="text-[11px] text-[#86868b] font-mono">{cus.email}</div>
                  </td>
                  <td className="p-4 font-mono uppercase text-[#1d1d1f]">
                    {cus.country}
                  </td>
                  <td className="p-4">
                    {cus.subscriptions > 0 ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0071e3] font-bold text-[10px] border border-blue-200">
                        {cus.subscriptions} Active Sub
                      </span>
                    ) : (
                      <span className="text-[#86868b]">One-Time Buyer</span>
                    )}
                  </td>
                  <td className="p-4 font-mono font-bold text-[#1d1d1f]">
                    ${cus.totalSpent.toFixed(2)}
                  </td>
                  <td className="p-4 text-[#86868b] font-mono">
                    {new Date(cus.lastActive).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
