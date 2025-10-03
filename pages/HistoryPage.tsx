import React, { useState, useMemo, useRef, useEffect } from 'react';
import { HistoryCard } from '../components/HistoryCard';
import { ConfirmationModal } from '../components/ConfirmationModal';
import type { HistoryItem } from '../types';
import { SlidersHorizontal, Search, Trash2, List, LayoutGrid, ChevronsUpDown, ArrowDown, ArrowUp, ArrowDownAZ } from 'lucide-react';
import { LANDSCAPING_STYLES } from '../constants';
import { useHistory } from '../contexts/HistoryContext';

interface HistoryPageProps {
  historyItems: HistoryItem[];
  onView: (item: HistoryItem) => void;
  onPin: (id: string) => void;
  onDelete: (id: string) => void;
}

type SortOption = 'default' | 'date-desc' | 'date-asc' | 'name-asc';

const SORT_OPTIONS: { id: SortOption; label: string; icon: React.ReactNode }[] = [
  { id: 'default', label: 'Default', icon: <ChevronsUpDown className="h-4 w-4" /> },
  { id: 'date-desc', label: 'Date (Newest)', icon: <ArrowDown className="h-4 w-4" /> },
  { id: 'date-asc', label: 'Date (Oldest)', icon: <ArrowUp className="h-4 w-4" /> },
  { id: 'name-asc', label: 'Name (A-Z)', icon: <ArrowDownAZ className="h-4 w-4" /> },
];


export const HistoryPage: React.FC<HistoryPageProps> = ({ historyItems, onView, onPin, onDelete }) => {
  const { deleteMultipleItems } = useHistory();
  
  const [unpinModalState, setUnpinModalState] = useState({ isOpen: false, itemId: null as string | null });
  const [deleteModalState, setDeleteModalState] = useState({ isOpen: false });
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return historyItems;
    }

    const lowercasedQuery = searchQuery.toLowerCase();

    return historyItems.filter(item => {
      // Check styles by name
      const styleNames = item.styles
        .map(styleId => LANDSCAPING_STYLES.find(s => s.id === styleId)?.name || '')
        .join(' ')
        .toLowerCase();
      if (styleNames.includes(lowercasedQuery)) return true;

      // Check climate zone
      if (item.climateZone.toLowerCase().includes(lowercasedQuery)) return true;

      // Check plants
      if (item.designCatalog.plants.some(plant =>
        plant.name.toLowerCase().includes(lowercasedQuery) ||
        plant.species.toLowerCase().includes(lowercasedQuery)
      )) return true;

      // Check features
      if (item.designCatalog.features.some(feature =>
        feature.name.toLowerCase().includes(lowercasedQuery) ||
        feature.description.toLowerCase().includes(lowercasedQuery)
      )) return true;

      return false;
    });
  }, [historyItems, searchQuery]);
  
  const getStyleNames = (item: HistoryItem) => {
    return item.styles
        .map(styleId => LANDSCAPING_STYLES.find(s => s.id === styleId)?.name || styleId)
        .join(' & ');
  };
  
  const sortedItems = useMemo(() => {
    const items = [...filteredItems];
    switch (sortOption) {
      case 'date-desc':
        return items.sort((a, b) => b.timestamp - a.timestamp);
      case 'date-asc':
        return items.sort((a, b) => a.timestamp - b.timestamp);
      case 'name-asc':
        return items.sort((a, b) => getStyleNames(a).localeCompare(getStyleNames(b)));
      case 'default':
      default:
        // Default sorting is handled by pinned/unpinned logic
        return filteredItems;
    }
  }, [filteredItems, sortOption]);

  const pinnedItems = useMemo(() => 
    filteredItems.filter(item => item.isPinned).sort((a, b) => b.timestamp - a.timestamp),
    [filteredItems]
  );

  const unpinnedItems = useMemo(() => 
    filteredItems.filter(item => !item.isPinned).sort((a, b) => b.timestamp - a.timestamp),
    [filteredItems]
  );
  
  const handleAttemptUnpin = (id: string) => {
    setUnpinModalState({ isOpen: true, itemId: id });
  };

  const handleConfirmUnpin = () => {
    if (unpinModalState.itemId) {
      onPin(unpinModalState.itemId);
    }
    setUnpinModalState({ isOpen: false, itemId: null });
  };
  
  const handleToggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedItemIds([]);
  };

  const handleToggleItemSelection = (id: string) => {
    setSelectedItemIds(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const handleConfirmDeleteSelected = async () => {
    await deleteMultipleItems(selectedItemIds);
    setDeleteModalState({ isOpen: false });
    setIsSelectionMode(false);
    setSelectedItemIds([]);
  };

  const containerClasses = viewMode === 'list'
    ? 'space-y-3'
    : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';

  const renderItems = (items: HistoryItem[]) => (
    <div className={containerClasses}>
      {items.map(item => (
        <HistoryCard
          key={item.id}
          item={item}
          onView={onView}
          onPin={onPin}
          onAttemptUnpin={handleAttemptUnpin}
          onDelete={onDelete}
          isSelectionMode={isSelectionMode}
          isSelected={selectedItemIds.includes(item.id)}
          onToggleSelection={handleToggleItemSelection}
          viewMode={viewMode}
        />
      ))}
    </div>
  );
  
  const currentSortOption = SORT_OPTIONS.find(o => o.id === sortOption);

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Your Projects</h2>
          <p className="text-slate-500 mt-1">Search, view, and manage your past designs.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100/80 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 h-10"
              aria-label="Search projects"
            />
          </div>
          {/* Sort Dropdown */}
          <div className="relative" ref={sortDropdownRef}>
            <button
              onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
              className="h-10 px-3 text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors flex-shrink-0 flex items-center gap-2"
            >
              <span className="text-slate-500">{currentSortOption?.icon}</span>
              <span>{currentSortOption?.label}</span>
            </button>
            {isSortDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200/80 p-1 z-10">
                {SORT_OPTIONS.map(option => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setSortOption(option.id);
                      setIsSortDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-100 flex items-center gap-2 rounded-md ${
                      sortOption === option.id ? 'font-semibold text-slate-900 bg-slate-100' : 'text-slate-700'
                    }`}
                  >
                    <span className="text-slate-500">{option.icon}</span>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
           {/* View Switcher */}
          <div className="hidden sm:flex items-center gap-1 p-1 bg-slate-200/80 rounded-lg">
              <button 
                  onClick={() => setViewMode('list')} 
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-800'}`}
                  aria-label="List view"
                  title="List view"
              >
                  <List className="h-4 w-4" />
              </button>
              <button 
                  onClick={() => setViewMode('grid')} 
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-800'}`}
                  aria-label="Grid view"
                  title="Grid view"
              >
                  <LayoutGrid className="h-4 w-4" />
              </button>
          </div>
          {historyItems.length > 0 && (
            isSelectionMode ? (
              <button
                onClick={handleToggleSelectionMode}
                className="h-10 px-4 text-sm font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors flex-shrink-0"
              >
                Cancel
              </button>
            ) : (
               <button
                  onClick={handleToggleSelectionMode}
                  className="h-10 px-4 text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors flex-shrink-0"
                >
                  Select
                </button>
            )
          )}
        </div>
      </div>
      
      {isSelectionMode && (
          <div className="mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex justify-between items-center">
             <span className="text-sm font-semibold text-slate-800">
                {selectedItemIds.length} item{selectedItemIds.length !== 1 ? 's' : ''} selected
              </span>
            <button
              onClick={() => setDeleteModalState({ isOpen: true })}
              disabled={selectedItemIds.length === 0}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-4 w-4" />
              Delete Selected
            </button>
          </div>
        )}

      {historyItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-200/80">
          <SlidersHorizontal className="mx-auto h-16 w-16 text-slate-300" strokeWidth={1} />
          <h3 className="mt-4 text-xl font-medium text-slate-700">No Projects Yet</h3>
          <p className="mt-1 text-sm text-slate-500">
            Create a new design, and it will show up here!
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-200/80">
          <Search className="mx-auto h-16 w-16 text-slate-300" strokeWidth={1} />
          <h3 className="mt-4 text-xl font-medium text-slate-700">No Projects Found</h3>
          <p className="mt-1 text-sm text-slate-500">
            Your search for "{searchQuery}" did not match any projects.
          </p>
        </div>
      ) : (
        <>
          {sortOption === 'default' ? (
            <div className="space-y-8">
              {pinnedItems.length > 0 && (
                <section aria-labelledby="pinned-designs-heading">
                  <div className="flex justify-between items-center mb-4">
                    <h2 id="pinned-designs-heading" className="text-lg font-bold text-slate-800">
                      Pinned Projects
                    </h2>
                  </div>
                  {renderItems(pinnedItems)}
                </section>
              )}
              {unpinnedItems.length > 0 && (
                <section aria-labelledby="recent-designs-heading">
                  <div className="flex justify-between items-center mb-4">
                    <h2 id="recent-designs-heading" className="text-lg font-bold text-slate-800">
                      Recent Projects
                    </h2>
                  </div>
                  {renderItems(unpinnedItems)}
                </section>
              )}
            </div>
          ) : (
            <section aria-labelledby="sorted-designs-heading">
              <div className="flex justify-between items-center mb-4">
                <h2 id="sorted-designs-heading" className="text-lg font-bold text-slate-800">
                  All Projects
                </h2>
              </div>
              {renderItems(sortedItems)}
            </section>
          )}
        </>
      )}
      
      <ConfirmationModal
        isOpen={unpinModalState.isOpen}
        onClose={() => setUnpinModalState({ isOpen: false, itemId: null })}
        onConfirm={handleConfirmUnpin}
        title="Confirm Unpin"
        message="Are you sure you want to unpin this design? Unpinned items are automatically deleted after 7 days."
        confirmText="Unpin"
        cancelText="Cancel"
      />
      
       <ConfirmationModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false })}
        onConfirm={handleConfirmDeleteSelected}
        title={`Delete ${selectedItemIds.length} Project${selectedItemIds.length > 1 ? 's' : ''}`}
        message={`Are you sure you want to permanently delete the selected project${selectedItemIds.length > 1 ? 's' : ''}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};