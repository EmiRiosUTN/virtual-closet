import { useState } from 'react';
import { Shirt, User, Sparkles, Heart, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClothingUpload } from './components/ClothingUpload';
import { UserPhotosUpload } from './components/UserPhotosUpload';
import { ClosetView } from './components/ClosetView';
import { VirtualTryOn } from './components/VirtualTryOn';
import { OutfitManager } from './components/OutfitManager';
import { ToastContainer } from './components/Toast';
import { useToast } from './hooks/useToast';

type Tab = 'closet' | 'photos' | 'tryOn' | 'outfits' | 'upload';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('closet');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toasts, removeToast, success } = useToast();

  const tabs = [
    { id: 'closet' as Tab, label: 'Mi Closet', icon: Shirt },
    { id: 'upload' as Tab, label: 'Agregar Prenda', icon: Shirt },
    { id: 'photos' as Tab, label: 'Mis Fotos', icon: User },
    { id: 'tryOn' as Tab, label: 'Prueba Virtual', icon: Sparkles },
    { id: 'outfits' as Tab, label: 'Mis Outfits', icon: Heart },
  ];

  const handleUploadComplete = () => {
    setRefreshKey((prev) => prev + 1);
    setActiveTab('closet');
    success('Prenda agregada exitosamente');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-50">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 lg:mb-12"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <motion.div
                className="w-12 h-12 bg-[#171936] rounded-2xl flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Shirt className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-semibold text-neutral-900 tracking-tight">
                  Closet Virtual
                </h1>
                <p className="text-neutral-500 text-sm sm:text-base mt-1">
                  Organiza tu ropa y prueba outfits con IA
                </p>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl hover:bg-white transition-all shadow-sm border border-neutral-200"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-neutral-700" />
              ) : (
                <Menu className="w-5 h-5 text-neutral-700" />
              )}
            </button>
          </div>

          <nav className="relative">
            <div className="hidden lg:flex gap-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-neutral-200 p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2.5 px-5 py-3 rounded-xl font-medium text-sm transition-all ${
                      isActive
                        ? 'text-white shadow-lg'
                        : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-[#171936] rounded-xl"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <Icon className={`w-5 h-5 relative z-10`} />
                    <span className="relative z-10">{tab.label}</span>
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="lg:hidden overflow-hidden"
                >
                  <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-2 mt-2">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setActiveTab(tab.id);
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all mb-1 last:mb-0 ${
                            isActive
                              ? 'bg-[#171936] text-white shadow-md'
                              : 'text-neutral-600 hover:bg-neutral-50'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </nav>
        </motion.header>

        <AnimatePresence mode="wait">
          <motion.main
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'closet' && <ClosetView key={refreshKey} onAddItemClick={() => setActiveTab('upload')} />}
            {activeTab === 'upload' && (
              <ClothingUpload onUploadComplete={handleUploadComplete} />
            )}
            {activeTab === 'photos' && <UserPhotosUpload />}
            {activeTab === 'tryOn' && <VirtualTryOn />}
            {activeTab === 'outfits' && <OutfitManager />}
          </motion.main>
        </AnimatePresence>

        <footer className="mt-16 text-center">
          <p className="text-sm text-neutral-400">
            Powered by Google Gemini AI
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
