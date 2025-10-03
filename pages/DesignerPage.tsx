import React, { useState, useCallback, useEffect } from 'react';
import { ImageUploader } from '../components/ImageUploader';
import { StyleSelector } from '../components/StyleSelector';
import { ClimateSelector } from '../components/ClimateSelector';
import { ResultDisplay } from '../components/ResultDisplay';
import { redesignOutdoorSpace, refineRedesign } from '../services/geminiService';
import { LANDSCAPING_STYLES } from '../constants';
import type { LandscapingStyle, ImageFile, DesignCatalog, RefinementModifications, RedesignDensity } from '../types';
import { useApp } from '../contexts/AppContext';
import { useHistory } from '../contexts/HistoryContext';
import { useToast } from '../contexts/ToastContext';
import { EditingModal } from '../components/EditingModal';
import { CustomizationModal } from '../components/CustomizationModal';
import { DensitySelector } from '../components/DensitySelector';

// Define the shape of the state we want to persist
interface DesignerState {
  originalImage: ImageFile | null;
  selectedStyles: LandscapingStyle[];
  allowStructuralChanges: boolean;
  climateZone: string;
  lockAspectRatio: boolean;
  redesignDensity: RedesignDensity;
}

const getInitialState = (): DesignerState => {
  try {
    const savedState = localStorage.getItem('designerSession');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      // Backwards compatibility for old state with `selectedStyle`
      if (parsed.selectedStyle && !parsed.selectedStyles) {
        parsed.selectedStyles = [parsed.selectedStyle];
        delete parsed.selectedStyle;
      }
      return {
        lockAspectRatio: true,
        redesignDensity: 'default',
        ...parsed,
        // Ensure selectedStyles exists and is not an empty array after parsing
        selectedStyles: (parsed.selectedStyles && parsed.selectedStyles.length > 0) ? parsed.selectedStyles : [LANDSCAPING_STYLES[0].id],
      };
    }
    // FIX: Added curly braces to the catch block to fix a syntax error.
  } catch (error) {
    console.error("Could not parse designer session state from localStorage", error);
  }
  return {
    originalImage: null,
    selectedStyles: [LANDSCAPING_STYLES[0].id],
    allowStructuralChanges: false,
    climateZone: '',
    lockAspectRatio: true,
    redesignDensity: 'default',
  };
};

export const DesignerPage: React.FC = () => {
  const { itemToLoad, onItemLoaded } = useApp();
  const { saveNewRedesign } = useHistory();
  const { addToast } = useToast();

  const [designerState, setDesignerState] = useState<DesignerState>(getInitialState);
  const { originalImage, selectedStyles, allowStructuralChanges, climateZone, lockAspectRatio, redesignDensity } = designerState;

  const [redesignedImage, setRedesignedImage] = useState<string | null>(null);
  const [designCatalog, setDesignCatalog] = useState<DesignCatalog | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('designerSession', JSON.stringify(designerState));
  }, [designerState]);
  
  // Load item from history
  useEffect(() => {
    if (itemToLoad) {
      const newState: DesignerState = {
        originalImage: itemToLoad.originalImage,
        selectedStyles: itemToLoad.styles,
        allowStructuralChanges: false, // This is not saved in history, default to false
        climateZone: itemToLoad.climateZone,
        lockAspectRatio: true, // Not saved in history, default to true for quality
        redesignDensity: 'default', // Not saved, default
      };
      setDesignerState(newState);
      setRedesignedImage(itemToLoad.redesignedImage);
      setDesignCatalog(itemToLoad.designCatalog);
      setError(null);
      onItemLoaded();
    }
  }, [itemToLoad, onItemLoaded]);

  const updateState = (updates: Partial<DesignerState>) => {
    setDesignerState(prevState => ({ ...prevState, ...updates }));
  };

  const handleImageUpload = (file: ImageFile | null) => {
    updateState({ originalImage: file });
    setRedesignedImage(null);
    setDesignCatalog(null);
    setError(null);
  };

  const handleGenerateRedesign = useCallback(async () => {
    if (!originalImage) {
      setError("Please upload an image first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setRedesignedImage(null);
    setDesignCatalog(null);

    try {
      const result = await redesignOutdoorSpace(
        originalImage.base64,
        originalImage.type,
        selectedStyles,
        allowStructuralChanges,
        climateZone,
        lockAspectRatio,
        redesignDensity,
      );
      
      await saveNewRedesign({
        originalImage: originalImage,
        redesignedImage: { base64: result.base64ImageBytes, type: result.mimeType },
        catalog: result.catalog,
        styles: selectedStyles,
        climateZone: climateZone,
      });

      setRedesignedImage(`data:${result.mimeType};base64,${result.base64ImageBytes}`);
      setDesignCatalog(result.catalog);
      
      // Clear session so a refresh doesn't show the old inputs
      localStorage.removeItem('designerSession');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      console.error("Redesign failed:", errorMessage);
      setError(`Failed to generate redesign. ${errorMessage}.`);
      addToast(`Redesign failed: ${errorMessage}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, selectedStyles, allowStructuralChanges, climateZone, lockAspectRatio, redesignDensity, saveNewRedesign, addToast]);

  const handleSaveEdit = (newImageUrl: string) => {
    setRedesignedImage(newImageUrl);
  };
  
  const handleSaveCustomization = useCallback(async (modifications: RefinementModifications) => {
    setIsCustomizing(false);
    if (!redesignedImage || !designCatalog) {
        addToast("Cannot refine without an existing design and catalog.", "error");
        return;
    }

    // Do nothing if no actual changes were requested
    if (modifications.deletions.length === 0 && modifications.replacements.length === 0 && modifications.additions.length === 0) {
        addToast("No customizations were applied.", "info");
        return;
    }

    setIsLoading(true);
    setError(null);
    addToast("Refining your design...", "info");

    try {
        const [header, base64Data] = redesignedImage.split(',');
        const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';

        const result = await refineRedesign(base64Data, mimeType, modifications);
        
        if (!originalImage) throw new Error("Original image not found for saving history.");

        // Save the refined version as a new history item.
        // We reuse the existing catalog because the simplified refinement prompt does not generate a new one.
        await saveNewRedesign({
            originalImage: originalImage,
            redesignedImage: { base64: result.base64ImageBytes, type: result.mimeType },
            catalog: designCatalog,
            styles: selectedStyles,
            climateZone: climateZone,
        });

        setRedesignedImage(`data:${result.mimeType};base64,${result.base64ImageBytes}`);
        // The design catalog in the state remains unchanged.
        addToast('Design refined successfully!', 'success');

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        console.error("Refinement failed:", errorMessage);
        setError(`Failed to refine design. ${errorMessage}.`);
        addToast(`Refinement failed: ${errorMessage}`, 'error');
    } finally {
        setIsLoading(false);
    }
  }, [redesignedImage, originalImage, designCatalog, saveNewRedesign, addToast, selectedStyles, climateZone]);


  const Section: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
    <div>
        <h2 className="text-base font-semibold text-slate-800 mb-4">{title}</h2>
        {children}
    </div>
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <div className="xl:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 space-y-6 h-fit">
        <Section title="Upload Your Space">
            <ImageUploader onImageUpload={handleImageUpload} initialImage={originalImage} />
        </Section>
        
        <Section title="Choose Your Style">
            <StyleSelector
                selectedStyles={selectedStyles}
                onStylesChange={(styles) => updateState({ selectedStyles: styles })}
                allowStructuralChanges={allowStructuralChanges}
                onAllowStructuralChanges={(allow) => updateState({ allowStructuralChanges: allow })}
                lockAspectRatio={lockAspectRatio}
                onLockAspectRatioChange={(lock) => updateState({ lockAspectRatio: lock })}
            />
        </Section>

        <Section title="Specify Details">
            <ClimateSelector value={climateZone} onChange={(val) => updateState({ climateZone: val })} />
        </Section>

        <Section title="Set Redesign Density">
            <DensitySelector value={redesignDensity} onChange={(val) => updateState({ redesignDensity: val })} />
        </Section>
        
        <div>
            <button
              onClick={handleGenerateRedesign}
              disabled={!originalImage || isLoading}
              className="w-full h-11 bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:shadow-lg disabled:shadow-none"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {redesignedImage ? 'Refining...' : 'Redesigning...'}
                </>
              ) : (
                'Generate Redesign'
              )}
            </button>
        </div>
         {error && <p className="text-red-600 text-sm mt-2 text-center">{error}</p>}
      </div>
      
      <div className="xl:col-span-2">
        <ResultDisplay
          originalImageFile={originalImage}
          redesignedImage={redesignedImage}
          designCatalog={designCatalog}
          isLoading={isLoading}
          onEdit={() => setIsEditing(true)}
          onCustomize={() => setIsCustomizing(true)}
        />
      </div>
      {isEditing && redesignedImage && (
        <EditingModal
            isOpen={isEditing}
            onClose={() => setIsEditing(false)}
            imageUrl={redesignedImage}
            onSave={handleSaveEdit}
        />
      )}
      {isCustomizing && redesignedImage && designCatalog &&(
        <CustomizationModal
          isOpen={isCustomizing}
          onClose={() => setIsCustomizing(false)}
          imageUrl={redesignedImage}
          onSave={handleSaveCustomization}
          designCatalog={designCatalog}
          styles={selectedStyles}
          climateZone={climateZone}
        />
      )}
    </div>
  );
};
