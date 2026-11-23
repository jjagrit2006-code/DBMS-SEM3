import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { cafeService } from '../services/api';
import { X, Coffee, Plus, Minus, Send, Sparkles } from 'lucide-react';

export default function CafeOrderDrawer({
  isOpen,
  onClose,
  presetStation = null
}) {
  const { currentUser, wallet, deductWallet, showToast } = useAuth();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [cart, setCart] = useState({});
  const [stationId, setStationId] = useState(presetStation?.station_id || '');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      cafeService.getMenu()
        .then(res => {
          setCategories(res.data.categories || []);
          setItems(res.data.items || []);
          if (res.data.categories?.length > 0 && !activeCategory) {
            setActiveCategory(res.data.categories[0].cafe_cat_id);
          }
        })
        .catch(err => showToast(err.message, 'error'));
    }
  }, [isOpen]);

  useEffect(() => {
    if (presetStation) {
      setStationId(presetStation.station_id);
      setDeliveryNote(`Deliver to Station ${presetStation.station_code}`);
    }
  }, [presetStation]);

  const updateQuantity = (item, delta) => {
    setCart(prev => {
      const currentQty = prev[item.item_id]?.quantity || 0;
      const newQty = currentQty + delta;
      if (newQty <= 0) {
        const next = { ...prev };
        delete next[item.item_id];
        return next;
      }
      return {
        ...prev,
        [item.item_id]: {
          item_id: item.item_id,
          name: item.name,
          price: parseFloat(item.price),
          quantity: newQty
        }
      };
    });
  };

  const cartList = Object.values(cart);
  const totalAmount = cartList.reduce((acc, i) => acc + (i.price * i.quantity), 0);

  const handlePlaceOrder = async () => {
    if (cartList.length === 0) {
      showToast('Select items before placing order', 'error');
      return;
    }

    const currentBal = parseFloat(wallet?.balance || 0);
    if (totalAmount > currentBal) {
      showToast(`Insufficient balance (₹${currentBal.toLocaleString('en-IN')}). Please top up first.`, 'error');
      return;
    }

    setLoading(true);
    try {
      const orderPayload = {
        items: cartList.map(i => ({ item_id: i.item_id, quantity: i.quantity })),
        station_id: stationId ? parseInt(stationId, 10) : null,
        session_id: presetStation?.active_session_id || null,
        delivery_note: deliveryNote || `Station delivery`,
        payment_method: 'WALLET'
      };

      const res = await cafeService.placeOrder(orderPayload);
      await deductWallet(totalAmount, `Café order: ${cartList.map(i => i.name).join(', ')}`);
      showToast(`Order #${res.data?.order_id || ''} placed! Sent to kitchen queue.`, 'success');
      setCart({});
      onClose();
    } catch (err) {
      showToast(err.response?.data?.error || err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredItems = activeCategory
    ? items.filter(i => i.cafe_cat_id === activeCategory)
    : items;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-[#14171C] border-l border-[#22262E] flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-4 border-b border-[#1F242C] flex items-center justify-between bg-[#101317]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[#0D0F12] border border-[#272D37] text-amber-400">
                <Coffee className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#F8FAFC]">Café & Bar Room Service</h2>
                <p className="text-[11px] text-[#94A3B8]">Delivered directly to your gaming station desk</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1A1E24] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1.5 p-2.5 border-b border-[#1F242C] overflow-x-auto bg-[#0D0F12]">
            {categories.map(cat => (
              <button
                key={cat.cafe_cat_id}
                onClick={() => setActiveCategory(cat.cafe_cat_id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeCategory === cat.cafe_cat_id
                    ? 'bg-[#20252D] text-white border border-[#2F3644] font-semibold'
                    : 'bg-[#16191E] text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#101317]">
            {filteredItems.map(item => {
              const inCartQty = cart[item.item_id]?.quantity || 0;
              return (
                <div
                  key={item.item_id}
                  className="rounded-xl bg-[#16191E] border border-[#22262E] p-3 flex items-center justify-between gap-3 hover:border-[#2F3543] transition-colors"
                >
                  <div className="flex items-center gap-3 truncate">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      className="h-14 w-14 rounded-lg object-cover border border-[#262B35] shrink-0"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500';
                      }}
                    />
                    <div className="truncate">
                      <div className="text-xs font-semibold text-[#F8FAFC] truncate">{item.name}</div>
                      <div className="text-[10px] text-[#94A3B8] truncate mt-0.5">{item.description}</div>
                      <div className="text-xs font-mono tabular-nums font-bold text-amber-400 mt-1">
                        ₹{parseFloat(item.price).toFixed(0)}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5">
                    {inCartQty === 0 ? (
                      <button
                        onClick={() => updateQuantity(item, 1)}
                        className="px-3 py-1.5 rounded-lg bg-[#1A1E24] hover:bg-[#2563EB] hover:border-[#2563EB] hover:text-white text-xs font-medium text-[#F8FAFC] border border-[#282E38] transition-colors"
                      >
                        + Add
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 bg-[#101317] border border-[#22262E] rounded-lg px-1.5 py-1">
                        <button
                          onClick={() => updateQuantity(item, -1)}
                          className="p-1 text-[#94A3B8] hover:text-[#F8FAFC]"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-mono tabular-nums font-semibold text-[#F8FAFC] px-1.5">
                          {inCartQty}
                        </span>
                        <button
                          onClick={() => updateQuantity(item, 1)}
                          className="p-1 text-[#94A3B8] hover:text-[#F8FAFC]"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Checkout */}
          <div className="p-4 border-t border-[#1F242C] bg-[#101317]">
            {cartList.length > 0 && (
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Delivery note (e.g. extra ice, deliver to Rig PC-01)..."
                  value={deliveryNote}
                  onChange={e => setDeliveryNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0D0F12] border border-[#22262E] text-xs text-[#F8FAFC] focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            )}

            <div className="flex items-center justify-between mb-3 text-xs">
              <div>
                <span className="text-[#94A3B8]">Wallet Balance: </span>
                <span className="font-mono tabular-nums font-semibold text-[#F8FAFC]">
                  ₹{parseFloat(wallet?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-[#94A3B8]">Total: </span>
                <span className="font-mono tabular-nums text-base font-bold text-amber-400">
                  ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading || cartList.length === 0}
              className={`w-full py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors active:scale-[0.99] ${
                cartList.length > 0
                  ? 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm'
                  : 'bg-[#16191E] text-[#64748B] cursor-not-allowed border border-[#22262E]'
              }`}
            >
              <Send className="h-3.5 w-3.5" />
              {loading ? 'Sending to Kitchen Queue...' : `Confirm Order (₹${totalAmount.toFixed(0)})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
