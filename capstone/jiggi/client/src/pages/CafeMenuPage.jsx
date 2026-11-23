import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { cafeService } from '../services/api';
import { Coffee, Plus, ShoppingBag, Sparkles, Flame } from 'lucide-react';

export default function CafeMenuPage({ onOpenDrawer }) {
  const { currentUser } = useAuth();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cafeService.getMenu()
      .then(res => {
        setCategories(res.data.categories || []);
        setItems(res.data.items || []);
      })
      .catch(err => console.warn('Could not load menu:', err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredItems = selectedCat === 'ALL'
    ? items
    : items.filter(i => i.cafe_cat_id === selectedCat);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Banner */}
      <div className="rounded-xl border border-[#22262E] bg-[#14171C] p-6 mb-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#101317] border border-[#262B35] text-[11px] font-mono text-amber-400 mb-2.5">
            <Flame className="h-3 w-3 text-amber-400" />
            Lounge Food & Beverage Kitchen
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F8FAFC]">
            Match Fuel, Artisan Brews & Gourmet Bites
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1 max-w-xl leading-relaxed">
            Nitro cold brews, imported energy cans, mess-free gaming finger foods, and warm snacks delivered hot right to your battle station.
          </p>
        </div>

        <button
          onClick={() => onOpenDrawer()}
          className="px-4 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 shrink-0 active:scale-[0.99]"
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          <span>Open Order Drawer</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-6 border-b border-[#1F242C]">
        <button
          onClick={() => setSelectedCat('ALL')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
            selectedCat === 'ALL'
              ? 'bg-[#20252D] text-white border border-[#2F3644] font-semibold'
              : 'bg-[#14171C] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#22262E]'
          }`}
        >
          All Items ({items.length})
        </button>
        {categories.map(cat => (
          <button
            key={cat.cafe_cat_id}
            onClick={() => setSelectedCat(cat.cafe_cat_id)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
              selectedCat === cat.cafe_cat_id
                ? 'bg-[#20252D] text-white border border-[#2F3644] font-semibold'
                : 'bg-[#14171C] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#22262E]'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Menu Grid with Uniform 16:10 Ratio & Clean Typography */}
      {loading ? (
        <div className="py-16 text-center text-[#64748B] text-xs font-mono">
          Loading lounge kitchen menu...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredItems.map(item => (
            <div
              key={item.item_id}
              className="rounded-xl bg-[#14171C] border border-[#22262E] hover:border-[#323946] overflow-hidden flex flex-col justify-between transition-colors group"
            >
              <div>
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0D0F12]">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#14171C] via-[#14171C]/20 to-transparent" />
                  <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-[#0D0F12]/90 border border-[#222730] text-[10px] font-mono text-emerald-400">
                    Fresh in Bar
                  </span>
                </div>

                <div className="p-4">
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <h3 className="text-xs font-bold text-[#F8FAFC] group-hover:text-blue-400 transition-colors truncate">
                      {item.name}
                    </h3>
                  </div>
                  <p className="text-[11px] text-[#94A3B8] line-clamp-2 leading-relaxed mb-3">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0">
                <div className="pt-2.5 border-t border-[#20252D] flex items-center justify-between">
                  <span className="font-mono tabular-nums text-sm font-bold text-amber-400">
                    ₹{parseFloat(item.price).toFixed(0)}
                  </span>
                  <button
                    onClick={() => onOpenDrawer()}
                    className="px-3 py-1.5 rounded-lg bg-[#1A1E24] hover:bg-[#2563EB] hover:border-[#2563EB] hover:text-white text-xs font-medium text-[#F8FAFC] border border-[#282E38] transition-colors flex items-center gap-1 active:scale-[0.99]"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add to Tray</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
