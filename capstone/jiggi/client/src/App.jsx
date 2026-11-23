import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import PlayerPortal from './pages/PlayerPortal';
import StaffFloor from './pages/StaffFloor';
import AdminManager from './pages/AdminManager';
import PassesHistory from './pages/PassesHistory';
import CafeMenuPage from './pages/CafeMenuPage';
import WalletModal from './components/WalletModal';
import CafeOrderDrawer from './components/CafeOrderDrawer';
import { MapPin, Phone, Clock, ShieldCheck, Sparkles } from 'lucide-react';

export default function App() {
  const { currentUser } = useAuth();
  const [currentTab, setCurrentTab] = useState('stations');
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isCafeOpen, setIsCafeOpen] = useState(false);
  const [cafePresetStation, setCafePresetStation] = useState(null);

  const role = currentUser?.role || 'PLAYER';

  const handleOpenCafe = (presetStation = null) => {
    setCafePresetStation(presetStation);
    setIsCafeOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0D0F12] text-[#F3F5F7] selection:bg-blue-600/30 selection:text-blue-100">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenWallet={() => setIsWalletOpen(true)}
        onOpenCafe={() => handleOpenCafe(null)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === 'stations' && (
          <PlayerPortal
            onOpenWallet={() => setIsWalletOpen(true)}
            onOpenCafe={handleOpenCafe}
          />
        )}

        {currentTab === 'cafe' && (
          <CafeMenuPage onOpenDrawer={() => handleOpenCafe(null)} />
        )}

        {currentTab === 'passes' && (
          <PassesHistory 
            onOpenWallet={() => setIsWalletOpen(true)}
            onNavigateStations={() => setCurrentTab('stations')}
          />
        )}

        {currentTab === 'floor-control' && (
          <StaffFloor />
        )}

        {currentTab === 'admin-hub' && (
          <AdminManager />
        )}
      </main>

      {/* Digital Lounge Wallet Modal */}
      <WalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
      />

      {/* Café & Snack Order Drawer */}
      <CafeOrderDrawer
        isOpen={isCafeOpen}
        onClose={() => setIsCafeOpen(false)}
        presetStation={cafePresetStation}
      />

      {/* Premium Lounge Footer */}
      <footer className="mt-auto border-t border-[#1F242C] bg-[#121519] py-10 text-[#94A3B8] text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Col 1: Brand & Philosophy */}
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="h-7 w-7 rounded bg-[#1A1E24] border border-[#272D37] flex items-center justify-center font-mono text-blue-400 text-xs font-bold">
                  VX
                </div>
                <span className="font-semibold text-sm text-white tracking-tight">
                  VORTEX <span className="text-blue-500">LOUNGE</span>
                </span>
              </div>
              <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                Premier esports battle arena, sim racing cockpits, and artisan espresso bar. Engineered for high-stakes competition and luxury lounge comfort.
              </p>
            </div>

            {/* Col 2: Operating Hours */}
            <div>
              <div className="text-xs font-semibold text-white mb-3 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-cyan-400" />
                Lounge Hours
              </div>
              <ul className="space-y-1.5 text-[11px] text-[#94A3B8]">
                <li className="flex justify-between">
                  <span>Mon – Thu:</span>
                  <span className="text-white font-mono">11:00 AM – 1:00 AM</span>
                </li>
                <li className="flex justify-between">
                  <span>Fri – Sat:</span>
                  <span className="text-cyan-400 font-mono font-medium">10:00 AM – 3:00 AM</span>
                </li>
                <li className="flex justify-between">
                  <span>Sunday:</span>
                  <span className="text-white font-mono">11:00 AM – 12:00 AM</span>
                </li>
              </ul>
            </div>

            {/* Col 3: Location & Reservation */}
            <div>
              <div className="text-xs font-semibold text-white mb-3 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                Lounge Concierge
              </div>
              <ul className="space-y-2 text-[11px] text-[#94A3B8]">
                <li className="flex items-start gap-1.5">
                  <span className="text-white">Level 2, Cyber Hub, Sector 24, Gurugram</span>
                </li>
                <li className="flex items-center gap-2 font-mono">
                  <Phone className="h-3 w-3 text-cyan-400 shrink-0" />
                  <span className="text-white">+91 98201 VORTEX</span>
                </li>
              </ul>
            </div>

            {/* Col 4: Hardware Specs Cert */}
            <div>
              <div className="text-xs font-semibold text-white mb-3 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                Certified Battle Stations
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['RTX 4090 OC', '240Hz OLED', '360Hz Liquid', 'Fanatec DD+', 'PS5 Pro', '1Gbps Low-Jitter'].map(b => (
                  <span key={b} className="px-2 py-0.5 rounded bg-[#16191E] border border-[#22262E] text-[10px] font-mono text-[#94A3B8]">
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#1F242C] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#64748B]">
            <div>
              &copy; {new Date().getFullYear()} Vortex Gaming Lounge Pvt. Ltd. All rights reserved.
            </div>
            <div className="flex items-center gap-3">
              <span className="hover:text-[#94A3B8] transition-colors cursor-pointer">Membership Terms</span>
              <span>•</span>
              <span className="hover:text-[#94A3B8] transition-colors cursor-pointer">Fair Play Code</span>
              <span>•</span>
              <span className="hover:text-[#94A3B8] transition-colors cursor-pointer">Desk Cash / UPI Billing</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
