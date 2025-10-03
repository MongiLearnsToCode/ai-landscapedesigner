import React, { useEffect } from 'react';
import { Header } from './components/Header';
import { Modal } from './components/Modal';
import { DesignerPage } from './pages/DesignerPage';
import { HistoryPage } from './pages/HistoryPage';
import { PricingPage } from './pages/PricingPage';
import { ContactPage } from './pages/ContactPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { AppProvider, useApp } from './contexts/AppContext';
import { HistoryProvider, useHistory } from './contexts/HistoryContext';
import { ToastProvider } from './contexts/ToastContext';
import { ToastContainer } from './components/ToastContainer';
import { Footer } from './components/Footer';

const PageContent: React.FC = () => {
  const { page, isModalOpen, modalImage, closeModal, navigateTo } = useApp();
  const { history, pinItem, deleteItem, viewFromHistory } = useHistory();

  useEffect(() => {
    const baseTitle = 'AI Landscape Designer';
    switch (page) {
      case 'main':
        document.title = `${baseTitle} | Home`;
        break;
      case 'history':
        document.title = `${baseTitle} | Projects`;
        break;
      case 'pricing':
        document.title = `${baseTitle} | Pricing`;
        break;
      case 'contact':
        document.title = `${baseTitle} | Contact`;
        break;
      case 'terms':
        document.title = `${baseTitle} | Terms of Service`;
        break;
      case 'privacy':
        document.title = `${baseTitle} | Privacy Policy`;
        break;
      default:
        document.title = baseTitle;
    }
  }, [page]);
  
  const pages: { [key: string]: React.ReactNode } = {
    main: <DesignerPage />,
    history: <HistoryPage historyItems={history} onView={viewFromHistory} onPin={pinItem} onDelete={deleteItem} />,
    pricing: <PricingPage onNavigate={navigateTo} />,
    contact: <ContactPage />,
    terms: <TermsPage />,
    privacy: <PrivacyPage />,
  };


  return (
    <div className="min-h-screen text-slate-800 font-sans p-4 sm:p-6 lg:p-8">
      <div className="mx-auto bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg ring-1 ring-black/5">
        <Header />
        <main className="p-4 sm:p-6 lg:p-8">
          {pages[page] || <DesignerPage />}
        </main>
        <Footer />
      </div>
      {isModalOpen && modalImage && <Modal imageUrl={modalImage} onClose={closeModal} />}
      <ToastContainer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppProvider>
        <HistoryProvider>
          <PageContent />
        </HistoryProvider>
      </AppProvider>
    </ToastProvider>
  );
};

export default App;