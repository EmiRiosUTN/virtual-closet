import { useState, useEffect } from 'react';
import { Shirt, User, Sparkles, Heart, Menu, X, LogOut, Image, User as UserIcon, Shield, Layout } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClothingUpload } from './components/ClothingUpload';
import { UserPhotosUpload } from './components/UserPhotosUpload';
import { ClosetView } from './components/ClosetView';
import { VirtualTryOn } from './components/VirtualTryOn';
import { OutfitManager } from './components/OutfitManager';
import { TryOnGallery } from './components/TryOnGallery';
import { Profile } from './components/Profile';
import { AdminPanel } from './components/AdminPanel';
import { Guide } from './components/Guide';
import { MoodBoard } from './components/MoodBoard';
import { OnboardingWizard } from './components/OnboardingWizard';
import { ToastContainer } from './components/Toast';
import { useToast } from './hooks/useToast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { storageService } from './services/storage';
import Login from './components/Login';
import Register from './components/Register';

type Tab = 'closet' | 'photos' | 'tryOn' | 'gallery' | 'outfits' | 'upload' | 'profile' | 'admin' | 'guide' | 'moodboard';

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>('closet');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [autoOpenTryOnUrl, setAutoOpenTryOnUrl] = useState<string | null>(null);
  const { toasts, removeToast, success } = useToast();
  const { user, profile, loading, signOut } = useAuth();

  const tabs = [
    { id: 'closet' as Tab, label: 'Mi Closet', icon: Shirt },
    { id: 'upload' as Tab, label: 'Agregar Prenda', icon: Shirt },
    { id: 'photos' as Tab, label: 'Mis Fotos', icon: User },
    { id: 'tryOn' as Tab, label: 'Prueba Virtual', icon: Sparkles },
    { id: 'gallery' as Tab, label: 'Probador', icon: Image },
    { id: 'outfits' as Tab, label: 'Mis Outfits', icon: Heart },
    { id: 'guide' as Tab, label: 'Guía de Uso', icon: Sparkles },
    { id: 'moodboard' as Tab, label: 'MoodBoard', icon: Layout },
    { id: 'profile' as Tab, label: 'Mi Perfil', icon: UserIcon },
    ...(profile?.role === 'admin' ? [{ id: 'admin' as Tab, label: 'Admin', icon: Shield }] : []),
  ];

  const handleUploadComplete = () => {
    setRefreshKey((prev) => prev + 1);
    setActiveTab('closet');
    success('Prenda agregada exitosamente');
  };

  const handleSignOut = async () => {
    await signOut();
    success('Sesión cerrada exitosamente');
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setCheckingOnboarding(false);
  };

  // Check onboarding status when user logs in
  useEffect(() => {
    const checkOnboarding = async () => {
      if (user) {
        const completed = await storageService.checkOnboardingStatus();
        setShowOnboarding(!completed);
        setCheckingOnboarding(false);
      } else {
        setCheckingOnboarding(false);
      }
    };

    checkOnboarding();
  }, [user]);

  if (loading || checkingOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <ToastContainer toasts={toasts} onClose={removeToast} />
        {authView === 'login' ? (
          <Login onSwitchToRegister={() => setAuthView('register')} />
        ) : (
          <Register onSwitchToLogin={() => setAuthView('login')} />
        )}
      </>
    );
  }

  // Show onboarding wizard if not completed
  if (showOnboarding) {
    return (
      <>
        <ToastContainer toasts={toasts} onClose={removeToast} />
        <OnboardingWizard onComplete={handleOnboardingComplete} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-50 lg:flex">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Mobile Header */}
      <div className="lg:hidden bg-white/80 backdrop-blur-md border-b border-neutral-200 px-4 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center shadow-md">
            <Shirt className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-neutral-900 tracking-tight leading-none">Chicas Guapas AI</h1>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl hover:bg-neutral-100 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6 text-neutral-700" /> : <Menu className="w-6 h-6 text-neutral-700" />}
        </button>
      </div>

      {/* Mobile Slide-over Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden fixed inset-x-0 top-[73px] z-40 bg-white border-b border-neutral-200 shadow-xl overflow-y-auto max-h-[calc(100vh-73px)]"
          >
            <div className="p-4 space-y-1">
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
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium text-sm transition-all ${isActive
                      ? 'bg-zinc-900 text-white shadow-md'
                      : 'text-neutral-600 hover:bg-neutral-50'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
              <div className="pt-4 mt-2 border-t border-neutral-100">
                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium text-sm transition-all text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-white/80 backdrop-blur-xl border-r border-neutral-200 h-screen sticky top-0 overflow-y-auto shadow-sm">
        <div className="p-8 pb-6">
          <div className="flex items-center gap-4">
            <motion.div
              className="shrink-0 w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Shirt className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight leading-tight">
                Chicas Guapas<br />AI
              </h1>
            </div>
          </div>
          <p className="text-neutral-500 text-sm mt-3 font-medium">
            {profile?.first_name ? `¡Hola, ${profile.first_name}!` : 'Tu clóset inteligente'}
          </p>
        </div>

        <nav className="flex-1 px-4 pb-4 space-y-1.5 mt-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full relative flex items-center gap-3.5 px-5 py-3.5 rounded-xl font-medium text-sm transition-all ${isActive
                  ? 'text-white shadow-md'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="desktopActiveTab"
                    className="absolute inset-0 bg-zinc-900 rounded-xl"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className={`w-5 h-5 relative z-10`} />
                <span className="relative z-10">{tab.label}</span>
              </motion.button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-neutral-200 bg-white/50">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-5 py-3 text-neutral-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all font-medium text-sm"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8 lg:py-10">

        {/* Desktop Header for Main Content */}
        {/* Removed in favor of individual component PageHeaders */}

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
            {activeTab === 'tryOn' && <VirtualTryOn onNavigateToGallery={(url) => {
              if (url) setAutoOpenTryOnUrl(url);
              setActiveTab('gallery');
            }} />}
            {activeTab === 'gallery' && <TryOnGallery autoOpenImageUrl={autoOpenTryOnUrl} onAutoOpenComplete={() => setAutoOpenTryOnUrl(null)} />}
            {activeTab === 'outfits' && <OutfitManager />}
            {activeTab === 'moodboard' && <MoodBoard />}
            {activeTab === 'profile' && <Profile />}
            {activeTab === 'guide' && <Guide />}
            {activeTab === 'admin' && profile?.role === 'admin' && <AdminPanel />}
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
