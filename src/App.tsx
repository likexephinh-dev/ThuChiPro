import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { AddTransaction } from './pages/AddTransaction';
import { Reports } from './pages/Reports';
import { Transactions } from './pages/Transactions';
import { useStore } from './stores/useStore';

import type { Transaction } from './types';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const { fetchData } = useStore();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingTransaction(null);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard
          onAddTransaction={() => setShowAddModal(true)}
          onEditTransaction={handleEditTransaction}
        />;
      case 'transactions':
        return <Transactions onEditTransaction={handleEditTransaction} />;
      case 'reports':
        return <Reports />;
      default:
        return <Dashboard
          onAddTransaction={() => setShowAddModal(true)}
          onEditTransaction={handleEditTransaction}
        />;
    }
  };

  if (showAddModal) {
    return (
      <div className="fixed inset-0 z-[60] bg-black">
        <AddTransaction
          onClose={handleCloseModal}
          editTransaction={editingTransaction}
        />
      </div>
    )
  }

  return (
    <Layout activeTab={currentView} onTabChange={setCurrentView}>
      {renderContent()}
    </Layout>
  );
}

export default App;
