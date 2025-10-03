import React, { useState, useEffect } from 'react';
import type { HistoryItem } from '../types';
import { Pin, Trash2, Eye } from 'lucide-react';
import { ImageWithLoader } from './ImageWithLoader';
import * as imageDB from '../services/imageDB';
import { LANDSCAPING_STYLES } from '../constants';

interface HistoryCardProps {
  item: HistoryItem;
  onView: (item: HistoryItem) => void;
  onPin: (id: string) => void;
  onAttemptUnpin: (id: string) => void;
  onDelete: (id: string) => void;
  isSelectionMode: boolean;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  viewMode: 'list' | 'grid';
}

export const HistoryCard: React.FC<HistoryCardProps> = ({ 
  item, 
  onView, 
  onPin, 
  onAttemptUnpin, 
  onDelete, 
  isSelectionMode, 
  isSelected, 
  onToggleSelection,
  viewMode,
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchImage = async () => {
      const imageData = await imageDB.getImage(item.redesignedImageInfo.id);
      if (isMounted && imageData) {
        setImageUrl(`data:${imageData.type};base64,${imageData.base64}`);
      }
    };

    fetchImage();

    return () => { isMounted = false; };
  }, [item.redesignedImageInfo.id]);

  const styleNames = item.styles
    .map(styleId => LANDSCAPING_STYLES.find(s => s.id === styleId)?.name || styleId)
    .join(' & ');
    
  const handlePinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.isPinned) {
      onAttemptUnpin(item.id);
    } else {
      onPin(item.id);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(item.id);
  }

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onView(item);
  }

  const handleCardClick = () => {
    if (isSelectionMode) {
      onToggleSelection(item.id);
    } else {
      onView(item);
    }
  };

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  };

  // Common classes for both views
  const cardStateClasses = isSelectionMode
    ? `cursor-pointer ${isSelected ? 'border-orange-500 bg-orange-50 shadow-md' : 'border-slate-200/80 hover:bg-slate-50'}`
    : "cursor-pointer border-slate-200/80 hover:shadow-md hover:border-slate-300";

  if (viewMode === 'grid') {
    return (
      <div 
        className={`bg-white rounded-2xl border transition-all duration-300 flex flex-col group overflow-hidden ${cardStateClasses}`}
        onClick={handleCardClick}
        onKeyDown={handleCardKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`${styleNames} design from ${new Date(item.timestamp).toLocaleDateString()}`}
      >
        <div className="relative w-full aspect-video bg-slate-100">
          {isSelectionMode && (
            <div className="absolute top-3 left-3 z-10 bg-white/50 rounded-md">
              <input
                type="checkbox"
                checked={isSelected}
                readOnly
                className="h-5 w-5 rounded border-slate-400 text-orange-600 focus:ring-orange-500 pointer-events-none"
              />
            </div>
          )}
          {imageUrl ? <ImageWithLoader src={imageUrl} alt={styleNames} /> : <div className="w-full h-full bg-slate-100 animate-pulse"></div>}
          
          {item.isPinned && !isSelectionMode && (
            <div className="absolute top-2 right-2 z-10 p-1.5 bg-orange-500/80 rounded-full shadow-md" title="Pinned">
                <Pin className="h-4 w-4 text-white fill-white" />
            </div>
          )}

          {/* Hover Actions */}
          {!isSelectionMode && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity p-2">
              <button onClick={handleViewClick} className="bg-white/90 hover:bg-white text-slate-800 font-semibold px-3 py-2 rounded-lg text-sm shadow-md transition-all duration-200 flex items-center">
                <Eye className="h-4 w-4 mr-1.5" /> View
              </button>
              <button
                  onClick={handlePinClick}
                  title={item.isPinned ? 'Unpin' : 'Pin'}
                  aria-label={item.isPinned ? 'Unpin design' : 'Pin design'}
                  className={`font-semibold p-2 rounded-lg text-sm shadow-md transition-all duration-200 flex items-center ${
                      item.isPinned 
                      ? 'bg-orange-100 hover:bg-orange-200 text-orange-600' 
                      : 'bg-white/90 hover:bg-white text-slate-800'
                  }`}
              >
                  <Pin className={`h-4 w-4 ${item.isPinned ? 'fill-current' : ''}`} />
              </button>
              <button onClick={handleDeleteClick} className="bg-white/90 hover:bg-white text-red-600 font-semibold p-2 rounded-lg text-sm shadow-md transition-all duration-200 flex items-center" title="Delete">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
        <div className="p-4 flex-grow flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-800 text-sm capitalize truncate">{styleNames}</h4>
            <p className="text-sm text-slate-500 truncate">{item.climateZone || 'General Climate'}</p>
          </div>
          <span className="text-xs text-slate-400 mt-2 self-start">
            {new Date(item.timestamp).toLocaleDateString()}
          </span>
        </div>
      </div>
    );
  }
    
  return (
    <div 
        className={`bg-white p-4 rounded-2xl border transition-all duration-300 ${cardStateClasses}`}
        onClick={handleCardClick}
        onKeyDown={handleCardKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`${styleNames} design from ${new Date(item.timestamp).toLocaleDateString()}`}
    >
      <div className="flex items-center space-x-4">
        {isSelectionMode && (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={isSelected}
              readOnly
              className="h-5 w-5 rounded border-slate-400 text-orange-600 focus:ring-orange-500 pointer-events-none"
            />
          </div>
        )}
        {/* Image / Icon */}
        <div className="relative w-12 h-12 flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden">
          {imageUrl ? <ImageWithLoader src={imageUrl} alt={styleNames} /> : <div className="w-full h-full bg-slate-100 animate-pulse"></div>}
        </div>

        {/* Main Content */}
        <div className="flex-grow">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-slate-800 text-sm capitalize">{styleNames}</h4>
            {!isSelectionMode && (
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                item.isPinned ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {new Date(item.timestamp).toLocaleDateString()}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500">{item.climateZone || 'General Climate'}</p>
        </div>

        {/* Actions */}
        {!isSelectionMode && (
          <div className="flex items-center space-x-1">
              <button
                  onClick={handleViewClick}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                  title="View"
                  aria-label="View design"
              >
                  <Eye className="h-4 w-4" />
              </button>
              <button
                  onClick={handlePinClick}
                  title={item.isPinned ? 'Unpin' : 'Pin'}
                  className={`p-2 rounded-lg transition-colors ${
                      item.isPinned 
                      ? 'text-orange-500 hover:bg-orange-100' 
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                  aria-label={item.isPinned ? 'Unpin design' : 'Pin design'}
              >
                  <Pin className={`h-4 w-4 ${item.isPinned ? 'fill-current' : ''}`} />
              </button>
              <button
                  onClick={handleDeleteClick}
                  title="Delete"
                  className="p-2 rounded-lg text-slate-500 hover:bg-red-100 hover:text-red-600 transition-colors"
                  aria-label="Delete design"
              >
                  <Trash2 className="h-4 w-4" />
              </button>
          </div>
        )}
      </div>
    </div>
  );
};