import React, { useState, useEffect, useRef } from 'react';
import { Product, AIStylistRecommendation, AITryOnResult } from '../types';
import { api } from '../services/api';
import {
  Sparkles,
  Camera,
  Upload,
  RefreshCw,
  ShoppingBag,
  CheckCircle2,
  Sliders,
  ChevronRight,
  ArrowRight,
  X,
  Send,
  Zap,
  Tag,
  Palette,
  Maximize2,
  Eye,
  UserCheck,
  Check,
  Image as ImageIcon,
  RotateCcw,
  Download,
  Flame,
  Star,
  Share2,
  Layers,
  Wand2,
  Maximize,
  CheckCheck,
  AlertCircle,
  MoveVertical,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

interface AIStylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  initialProduct?: Product | null;
  initialMode?: 'ask' | 'tryon';
  onAddToCart: (product: Product, color: string, size: string, quantity?: number) => void;
  onOpenProductDetail: (product: Product) => void;
}

export const AIStylistModal: React.FC<AIStylistModalProps> = ({
  isOpen,
  onClose,
  products,
  initialProduct,
  initialMode = 'ask',
  onAddToCart,
  onOpenProductDetail
}) => {
  const [activeTab, setActiveTab] = useState<'ask' | 'tryon'>(initialMode);

  // ASK AI STATES
  const [prompt, setPrompt] = useState('');
  const [selectedOccasion, setSelectedOccasion] = useState('Resort & Beachside');
  const [selectedGender, setSelectedGender] = useState<'All' | 'Men' | 'Women'>('All');
  const [bodyType, setBodyType] = useState('Athletic Fit');
  const [isAsking, setIsAsking] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<AIStylistRecommendation | null>(null);

  // Chat message history
  const [chatMessages, setChatMessages] = useState<Array<{
    sender: 'user' | 'ai';
    text: string;
    recommendation?: AIStylistRecommendation;
    time: string;
  }>>([]);

  // TRY-ON STATES
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(initialProduct || products[0] || null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('M');

  // User input image & synthesized image
  const [userImage, setUserImage] = useState<string>('/images/tryon_shirt_man.jpg');
  const [userImageName, setUserImageName] = useState<string>('Sartorial Model');
  const [isUserCustomPhoto, setIsUserCustomPhoto] = useState<boolean>(false);
  
  // Synthesized AI Generated Result Image
  const [generatedImage, setGeneratedImage] = useState<string>('/images/tryon_shirt_man.jpg');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [tryOnResult, setTryOnResult] = useState<AITryOnResult | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [userHeight, setUserHeight] = useState('178');
  const [userWeight, setUserWeight] = useState('74');
  const [isDownloaded, setIsDownloaded] = useState(false);

  // LIVE CAMERA STATES
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string>('');
  const [countdown, setCountdown] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // FACE ALIGNMENT ADJUSTMENT CONTROLS
  const [faceScale, setFaceScale] = useState<number>(100); // 70 to 140%
  const [faceOffsetY, setFaceOffsetY] = useState<number>(0); // -40px to +40px
  const [faceOffsetX, setFaceOffsetX] = useState<number>(0); // -30px to +30px

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Standing Model Presets
  const modelPresets = [
    {
      id: 'model-1',
      name: 'Athletic Male (6ft)',
      label: 'Men • Athletic',
      preview: '/images/tryon_shirt_man.jpg',
      gender: 'Men'
    },
    {
      id: 'model-2',
      name: 'Tailored Gentleman',
      label: 'Men • Classic',
      preview: '/images/tryon_vest_man.jpg',
      gender: 'Men'
    },
    {
      id: 'model-3',
      name: 'Riviera Chic Female',
      label: 'Women • Chic',
      preview: '/images/tryon_riviera_woman.jpg',
      gender: 'Women'
    },
    {
      id: 'model-4',
      name: 'Linen Trousers Fit',
      label: 'Men • Trousers',
      preview: '/images/tryon_trouser_man.jpg',
      gender: 'Men'
    }
  ];

  // Helper to determine base garment look
  const getGarmentBaseImage = (product: Product | null): string => {
    if (!product) return '/images/tryon_shirt_man.jpg';
    const title = (product.title || '').toLowerCase();
    const cat = (product.category || '').toLowerCase();

    if (product.gender === 'Women' || title.includes('dress') || title.includes('woman') || cat.includes('dress')) {
      return '/images/tryon_riviera_woman.jpg';
    }
    if (title.includes('trouser') || cat.includes('trouser') || title.includes('pant')) {
      return '/images/tryon_trouser_man.jpg';
    }
    if (title.includes('vest') || title.includes('waistcoat') || cat.includes('vest')) {
      return '/images/tryon_vest_man.jpg';
    }
    return '/images/tryon_shirt_man.jpg';
  };

  // Sync initialProduct if passed
  useEffect(() => {
    if (initialProduct) {
      setSelectedProduct(initialProduct);
      if (initialProduct.colors && initialProduct.colors.length > 0) {
        setSelectedColor(initialProduct.colors[0].name);
      }
      if (initialProduct.sizes && initialProduct.sizes.length > 0) {
        setSelectedSize(initialProduct.sizes[0]);
      }
    } else if (products.length > 0 && !selectedProduct) {
      setSelectedProduct(products[0]);
      if (products[0].colors && products[0].colors.length > 0) {
        setSelectedColor(products[0].colors[0].name);
      }
    }
    if (initialMode) {
      setActiveTab(initialMode);
    }
  }, [initialProduct, initialMode, products]);

  // Cleanup camera stream on close or unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleModalClose = () => {
    stopCamera();
    onClose();
  };

  // Occasions list
  const occasions = [
    'Resort & Beachside',
    'Summer Wedding Soirée',
    'Boardroom Quiet Luxury',
    'Cocktail & Gala Evening',
    'Weekend Riviera Brunch',
    'Art Gallery Opening'
  ];

  // Quick Prompt Pills
  const quickPrompts = [
    'What is the ideal luxury linen ensemble for a beach resort?',
    'What should I pair with a linen shirt for a summer wedding soirée?',
    'How do I style a quiet luxury look for an executive meeting?',
    'Suggest a breathable, sophisticated outfit for warm weather.',
    'Which tailored trousers best complement a crisp white linen shirt?'
  ];

  // =========================================================================
  // LIVE CAMERA CONTROLS (WEBCAM / SELFIE)
  // =========================================================================
  const startCamera = async () => {
    setIsCameraActive(true);
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Camera access denied or not available. Please allow camera permissions in your browser or upload a photo.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setCountdown(null);
  };

  const triggerCapture = () => {
    if (!videoRef.current) return;
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          snapPhotoFromVideo();
          return null;
        }
        return prev - 1;
      });
    }, 500);
  };

  const snapPhotoFromVideo = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 720;
    canvas.height = videoRef.current.videoHeight || 960;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Mirror flip for natural selfie
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const photoData = canvas.toDataURL('image/jpeg', 0.95);
      stopCamera();
      setUserImage(photoData);
      setUserImageName('Live Selfie Photo');
      setIsUserCustomPhoto(true);
      synthesizeTryOnLook(photoData, selectedProduct, selectedColor, selectedSize, true, faceScale, faceOffsetY, faceOffsetX);
    }
  };

  // Handle Photo Upload from user
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const userPhoto = reader.result;
          setUserImage(userPhoto);
          setUserImageName(file.name);
          setIsUserCustomPhoto(true);
          synthesizeTryOnLook(userPhoto, selectedProduct, selectedColor, selectedSize, true, faceScale, faceOffsetY, faceOffsetX);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // =========================================================================
  // CANVAS NEURAL FACE & GARMENT COMPOSITOR ("Mera Face Kapde Par Aa Jaye")
  // =========================================================================
  const compositeUserFaceWithGarment = async (
    userImgSrc: string,
    garmentBaseSrc: string,
    scalePercent: number = 100,
    offsetY: number = 0,
    offsetX: number = 0
  ): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 750;
      canvas.height = 1000;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(garmentBaseSrc);

      const garmentImg = new Image();
      garmentImg.crossOrigin = 'anonymous';
      garmentImg.onload = () => {
        // 1. Draw the high-resolution garment body wearing the chosen BRIVOO clothing
        ctx.drawImage(garmentImg, 0, 0, 750, 1000);

        // 2. Load the user's custom photo
        const userImg = new Image();
        userImg.crossOrigin = 'anonymous';
        userImg.onload = () => {
          ctx.save();
          
          // Head anchor point based on garment type
          let headCenterX = 375 + offsetX;
          let headCenterY = 190 + offsetY;
          let headRadiusX = 105 * (scalePercent / 100);
          let headRadiusY = 135 * (scalePercent / 100);

          // Oval feathered mask for user's face & hair
          ctx.beginPath();
          ctx.ellipse(headCenterX, headCenterY, headRadiusX, headRadiusY, 0, 0, Math.PI * 2);
          ctx.clip();

          // Calculate aspect ratio
          const uRatio = userImg.width / userImg.height;
          let drawW = headRadiusX * 2.7;
          let drawH = drawW / uRatio;
          
          // Draw user's face centered above the neckline
          ctx.drawImage(userImg, headCenterX - drawW / 2, headCenterY - drawH / 2.35, drawW, drawH);
          ctx.restore();

          // 3. Ambient lighting & collar integration gradient
          const grad = ctx.createRadialGradient(headCenterX, headCenterY + 90, 40, headCenterX, headCenterY + 90, 140);
          grad.addColorStop(0, 'rgba(0,0,0,0)');
          grad.addColorStop(1, 'rgba(0,0,0,0.06)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, 750, 1000);

          resolve(canvas.toDataURL('image/jpeg', 0.95));
        };
        userImg.onerror = () => resolve(garmentBaseSrc);
        userImg.src = userImgSrc;
      };
      garmentImg.onerror = () => resolve(garmentBaseSrc);
      garmentImg.src = garmentBaseSrc;
    });
  };

  // Master AI Try-On Synthesizer
  const synthesizeTryOnLook = async (
    photoToUse: string,
    productToTry: Product | null,
    color?: string,
    size?: string,
    isCustomUpload: boolean = isUserCustomPhoto,
    currentFaceScale: number = faceScale,
    currentFaceOffsetY: number = faceOffsetY,
    currentFaceOffsetX: number = faceOffsetX
  ) => {
    if (!productToTry) return;
    setIsGenerating(true);
    setGenerationProgress(20);
    setGenerationStep('Extracting facial structure & skin undertones...');

    try {
      // Step 1: Call Backend AI Endpoint
      const res = await api.tryOnAI({
        productId: productToTry.id,
        userImage: photoToUse,
        color: color || selectedColor,
        size: size || selectedSize,
        height: userHeight,
        weight: userWeight,
        bodyType
      });

      setGenerationProgress(55);
      setGenerationStep('Fitting 100% European Flax Linen silhouette & neckline...');

      if (res.success) {
        setTryOnResult(res.data);
        const garmentBase = res.data.generatedTryOnImage || getGarmentBaseImage(productToTry);

        if (isCustomUpload) {
          setGenerationProgress(80);
          setGenerationStep('Blending user face with tailored collar & luxury studio lighting...');
          const compositeImg = await compositeUserFaceWithGarment(
            photoToUse, 
            garmentBase, 
            currentFaceScale, 
            currentFaceOffsetY, 
            currentFaceOffsetX
          );
          setGeneratedImage(compositeImg);
        } else {
          setGeneratedImage(garmentBase);
        }
      }

      setGenerationProgress(100);
      setGenerationStep('AI Image Generation Complete!');
    } catch (err) {
      console.error('Try on error:', err);
      setGeneratedImage(getGarmentBaseImage(productToTry));
    } finally {
      setTimeout(() => {
        setIsGenerating(false);
      }, 350);
    }
  };

  // Trigger synthesis when modal opens in try-on tab
  useEffect(() => {
    if (isOpen && activeTab === 'tryon' && selectedProduct) {
      synthesizeTryOnLook(userImage, selectedProduct, selectedColor, selectedSize, isUserCustomPhoto, faceScale, faceOffsetY, faceOffsetX);
    }
  }, [isOpen, activeTab, selectedProduct]);

  // Handle Ask AI
  const handleAskAI = async (queryText?: string) => {
    const textToQuery = queryText || prompt;
    if (!textToQuery.trim()) return;

    setIsAsking(true);
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setChatMessages(prev => [
      ...prev,
      { sender: 'user', text: textToQuery, time: now }
    ]);
    setPrompt('');

    try {
      const res = await api.askAI({
        prompt: textToQuery,
        occasion: selectedOccasion,
        gender: selectedGender,
        bodyType,
        currentProductId: selectedProduct?.id
      });

      if (res.success) {
        setAiRecommendation(res.data);
        setChatMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: res.data.stylistAdvice,
            recommendation: res.data,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAsking(false);
      setTimeout(() => {
        if (chatScrollRef.current) {
          chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
      }, 100);
    }
  };

  // Download Generated Photo
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `brivoo-ai-tryon-${selectedProduct?.title.toLowerCase().replace(/\s+/g, '-') || 'look'}.jpg`;
    link.click();
    setIsDownloaded(true);
    setTimeout(() => setIsDownloaded(false), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden animate-in fade-in duration-200">
      
      {/* Modal Dialog Container */}
      <div className="bg-[#FAF8F5] w-full max-w-5xl h-[94vh] sm:h-[88vh] rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200/80 flex flex-col overflow-hidden text-[#1A1A1A]">
        
        {/* Top Luxury Atelier Header */}
        <div className="bg-[#111111] text-stone-200 px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-[#C5A059] to-[#E6DFC5] flex items-center justify-center text-stone-950 font-bold shadow-md">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif font-bold text-sm sm:text-base text-white tracking-wide">
                  BRIVOO AI Atelier & Virtual Try-On
                </span>
                <span className="hidden sm:inline-block text-[9px] px-2 py-0.5 rounded-full font-mono font-bold bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/40 uppercase">
                  Photorealistic Face-Swap
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-stone-400">
                Camera ya photo se apna face BRIVOO dresses par pehan kar dekhein
              </p>
            </div>
          </div>

          <button
            onClick={handleModalClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Master Navigation Tabs */}
        <div className="bg-white border-b border-stone-200 px-4 sm:px-6 py-2 flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                stopCamera();
                setActiveTab('ask');
              }}
              className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all flex items-center space-x-1.5 ${
                activeTab === 'ask'
                  ? 'bg-[#141414] text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${activeTab === 'ask' ? 'text-[#C5A059]' : ''}`} />
              <span>Ask AI Stylist</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('tryon');
                if (selectedProduct) {
                  synthesizeTryOnLook(userImage, selectedProduct, selectedColor, selectedSize, isUserCustomPhoto, faceScale, faceOffsetY, faceOffsetX);
                }
              }}
              className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all flex items-center space-x-1.5 ${
                activeTab === 'tryon'
                  ? 'bg-[#141414] text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Camera className={`w-3.5 h-3.5 ${activeTab === 'tryon' ? 'text-[#C5A059]' : ''}`} />
              <span>Virtual AI Try-On</span>
              <span className="hidden sm:inline-block px-1.5 py-0.2 text-[9px] rounded-full bg-[#C5A059] text-stone-950 font-black">
                LIVE CAMERA & FACE-SWAP
              </span>
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-2 text-xs text-stone-500 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Neural Face-Garment Engine</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: ASK AI STYLIST (DECISION COPILOT)                                   */}
        {/* ========================================================================= */}
        {activeTab === 'ask' && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Left Sidebar: Decision Parameters */}
            <div className="w-full md:w-80 bg-white border-b md:border-b-0 md:border-r border-stone-200 p-3.5 sm:p-4 max-h-48 md:max-h-none overflow-y-auto space-y-3 sm:space-y-4 shrink-0 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Occasion / Dress Code</span>
                </label>
                <select
                  value={selectedOccasion}
                  onChange={(e) => setSelectedOccasion(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-[#FAF8F5] text-stone-800 font-semibold focus:outline-none focus:border-[#C5A059]"
                >
                  {occasions.map(occ => (
                    <option key={occ} value={occ}>{occ}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <select
                    value={selectedGender}
                    onChange={(e) => setSelectedGender(e.target.value as any)}
                    className="w-full p-2 rounded-lg border border-stone-300 bg-[#FAF8F5] font-medium focus:outline-none focus:border-[#C5A059]"
                  >
                    <option value="All">All / Unisex</option>
                    <option value="Men">Men's Atelier</option>
                    <option value="Women">Women's Atelier</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                    Body Profile
                  </label>
                  <select
                    value={bodyType}
                    onChange={(e) => setBodyType(e.target.value)}
                    className="w-full p-2 rounded-lg border border-stone-300 bg-[#FAF8F5] font-medium focus:outline-none focus:border-[#C5A059]"
                  >
                    <option value="Athletic Fit">Athletic Build</option>
                    <option value="Slim European">Slim European</option>
                    <option value="Classic Relaxed">Classic Relaxed</option>
                    <option value="Broad Sartorial">Broad Sartorial</option>
                  </select>
                </div>
              </div>

              {/* Quick Prompts List */}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Popular Styling Decisions</span>
                </label>
                <div className="space-y-1.5">
                  {quickPrompts.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAskAI(q)}
                      className="w-full text-left p-2.5 rounded-xl bg-stone-50 hover:bg-[#C5A059]/10 hover:border-[#C5A059]/40 border border-stone-200/60 transition-all text-[11px] text-stone-700 hover:text-stone-900 leading-snug flex items-center justify-between group"
                    >
                      <span className="line-clamp-2">{q}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#C5A059] shrink-0 ml-1" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Try-On Switch Box */}
              <div className="p-3 bg-gradient-to-br from-stone-900 to-stone-800 text-stone-200 rounded-2xl shadow-sm space-y-2 border border-white/10">
                <div className="flex items-center space-x-2 text-[#C5A059] font-bold text-xs">
                  <Camera className="w-4 h-4" />
                  <span>See How It Looks On You</span>
                </div>
                <p className="text-[10.5px] text-stone-300 leading-relaxed">
                  Apne camera se selfie lein aur dekhein ki ye dress aapke face par kaisi lag rahi hai!
                </p>
                <button
                  onClick={() => {
                    setActiveTab('tryon');
                    if (selectedProduct) {
                      synthesizeTryOnLook(userImage, selectedProduct, selectedColor, selectedSize, isUserCustomPhoto, faceScale, faceOffsetY, faceOffsetX);
                    }
                  }}
                  className="w-full py-1.5 rounded-lg bg-[#C5A059] text-stone-950 font-bold text-[11px] hover:bg-[#d6af63] transition-colors"
                >
                  Open Camera & Try-On →
                </button>
              </div>

            </div>

            {/* Right Chat Stream */}
            <div className="flex-1 flex flex-col justify-between overflow-hidden bg-[#FAF8F5]">
              <div ref={chatScrollRef} className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5">
                {chatMessages.length === 0 ? (
                  <div className="max-w-md mx-auto text-center py-10 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-white shadow-md mx-auto flex items-center justify-center border border-[#E6DFC5]">
                      <Sparkles className="w-8 h-8 text-[#C5A059] animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-lg text-stone-900">
                        Ask Your Personal Atelier AI Stylist
                      </h3>
                      <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                        Occasions, color matching, wedding outfits, ya size selection me confusion hai? AI se poochhein aur decisions lein.
                      </p>
                    </div>
                  </div>
                ) : (
                  chatMessages.map((msg, mIdx) => (
                    <div
                      key={mIdx}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}
                    >
                      <div className="flex items-center space-x-2 text-[10px] text-stone-400 font-mono px-1">
                        <span>{msg.sender === 'user' ? 'You' : 'BRIVOO AI Stylist'}</span>
                        <span>•</span>
                        <span>{msg.time}</span>
                      </div>

                      {msg.sender === 'user' ? (
                        <div className="bg-[#141414] text-white p-3.5 sm:p-4 rounded-2xl rounded-tr-xs max-w-lg text-xs leading-relaxed shadow-sm">
                          {msg.text}
                        </div>
                      ) : (
                        <div className="bg-white border border-stone-200/90 text-stone-800 p-4 sm:p-5 rounded-2xl rounded-tl-xs max-w-2xl text-xs space-y-4 shadow-sm">
                          <div className="leading-relaxed font-sans text-stone-800 text-[12.5px]">
                            {msg.text}
                          </div>

                          {msg.recommendation && (
                            <div className="space-y-4 pt-3 border-t border-stone-100">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200/60">
                                <div>
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
                                    Occasion Compatibility
                                  </span>
                                  <div className="flex items-center space-x-2">
                                    <span className="font-mono font-bold text-base text-emerald-700">
                                      {msg.recommendation.dressCodeScore}% Match
                                    </span>
                                    <span className="text-[11px] text-stone-600">
                                      ({msg.recommendation.occasion})
                                    </span>
                                  </div>
                                </div>

                                <div>
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
                                    Color Palette
                                  </span>
                                  <div className="flex items-center space-x-2">
                                    {msg.recommendation.colorPalette.map((col, cIdx) => (
                                      <div key={cIdx} className="flex items-center space-x-1" title={col.name}>
                                        <span 
                                          className="w-4 h-4 rounded-full border border-stone-300 shadow-2xs" 
                                          style={{ backgroundColor: col.hex }} 
                                        />
                                        <span className="text-[10px] text-stone-600 font-medium">{col.name}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {msg.recommendation.recommendedProducts && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {msg.recommendation.recommendedProducts.map((prod) => (
                                    <div
                                      key={prod.id}
                                      className="bg-white rounded-xl border border-stone-200 p-2.5 flex space-x-3 hover:border-[#C5A059] transition-all shadow-2xs group"
                                    >
                                      <img
                                        src={prod.image}
                                        alt={prod.title}
                                        className="w-16 h-20 object-cover rounded-lg shrink-0 cursor-pointer"
                                        onClick={() => onOpenProductDetail(prod)}
                                      />
                                      <div className="flex-1 flex flex-col justify-between py-0.5">
                                        <div>
                                          <h4 
                                            onClick={() => onOpenProductDetail(prod)}
                                            className="font-bold text-[11.5px] text-stone-900 group-hover:text-[#C5A059] transition-colors cursor-pointer line-clamp-1"
                                          >
                                            {prod.title}
                                          </h4>
                                          <div className="font-mono font-bold text-xs text-stone-900 mt-0.5">
                                            ₹{prod.price.toLocaleString('en-IN')}
                                          </div>
                                        </div>

                                        <div className="flex items-center space-x-1.5 pt-1">
                                          <button
                                            onClick={() => {
                                              setSelectedProduct(prod);
                                              setActiveTab('tryon');
                                              synthesizeTryOnLook(userImage, prod, prod.colors?.[0]?.name, 'M', isUserCustomPhoto, faceScale, faceOffsetY, faceOffsetX);
                                            }}
                                            className="px-2 py-1 rounded-md bg-stone-900 text-white text-[10px] font-bold hover:bg-[#C5A059] transition-colors flex items-center space-x-1"
                                          >
                                            <Camera className="w-2.5 h-2.5" />
                                            <span>Try On</span>
                                          </button>
                                          <button
                                            onClick={() => onAddToCart(prod, prod.colors?.[0]?.name || 'Standard', 'M')}
                                            className="px-2 py-1 rounded-md bg-[#FAF8F5] hover:bg-[#E6DFC5] border border-stone-300 text-stone-800 text-[10px] font-bold transition-colors"
                                          >
                                            Add
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}

                {isAsking && (
                  <div className="flex items-center space-x-2 text-stone-400 text-xs font-medium p-3 bg-white rounded-xl border border-stone-200/60 w-fit animate-pulse">
                    <Sparkles className="w-4 h-4 text-[#C5A059] animate-spin" />
                    <span>Analyzing body proportion & occasion dress code...</span>
                  </div>
                )}
              </div>

              <div className="p-3 sm:p-4 bg-white border-t border-stone-200 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAskAI();
                  }}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ask AI Stylist (e.g. 'Wedding party ke liye linen shirt aur pants suggest karo')..."
                    className="flex-1 bg-[#FAF8F5] border border-stone-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#C5A059]"
                  />
                  <button
                    type="submit"
                    disabled={isAsking || !prompt.trim()}
                    className="p-2.5 sm:p-3 rounded-xl bg-[#141414] hover:bg-[#C5A059] disabled:bg-stone-300 text-white transition-colors shadow-sm shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: VIRTUAL AI TRY-ON (REAL IMAGE SYNTHESIS WITH LIVE CAMERA)           */}
        {/* ========================================================================= */}
        {activeTab === 'tryon' && (
          <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden bg-[#F7F4EE]">
            
            {/* Left Main Viewport: The Live Camera OR Synthesized Photo */}
            <div className="w-full lg:flex-1 p-3 sm:p-5 flex flex-col justify-between overflow-visible lg:overflow-y-auto shrink-0">
              
              {/* Image Frame Container */}
              <div className="relative mx-auto w-full max-w-[340px] sm:max-w-[400px] aspect-[3/4] bg-stone-950 rounded-2xl overflow-hidden shadow-2xl border-2 sm:border-4 border-white flex items-center justify-center group select-none">
                
                {/* 1. LIVE WEBCAM VIEWFINDER MODE */}
                {isCameraActive ? (
                  <div className="relative w-full h-full bg-black flex items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover -scale-x-100"
                    />

                    {/* Face Guide Oval Overlay */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-48 h-64 border-2 border-dashed border-[#C5A059]/80 rounded-[50%] flex items-center justify-center animate-pulse">
                        <span className="text-[10px] text-white/80 font-mono uppercase bg-black/60 px-2 py-0.5 rounded-full">
                          Align Face Here
                        </span>
                      </div>
                    </div>

                    {/* Countdown Overlay */}
                    {countdown !== null && (
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-30">
                        <span className="text-6xl font-black font-mono text-[#C5A059] animate-bounce">
                          {countdown}
                        </span>
                      </div>
                    )}

                    {/* Live Camera Bottom Action Controls */}
                    <div className="absolute bottom-4 inset-x-4 z-20 flex items-center justify-between">
                      <button
                        onClick={stopCamera}
                        className="px-3 py-1.5 rounded-xl bg-black/80 hover:bg-stone-900 text-white text-xs font-bold border border-white/20 transition-all cursor-pointer"
                      >
                        Cancel
                      </button>

                      <button
                        onClick={triggerCapture}
                        className="w-14 h-14 rounded-full bg-[#C5A059] hover:bg-[#d6af63] border-4 border-white shadow-xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                        title="Click to Snap Selfie"
                      >
                        <Camera className="w-6 h-6 text-stone-950" />
                      </button>

                      <button
                        onClick={snapPhotoFromVideo}
                        className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold border border-white/20 transition-all cursor-pointer"
                      >
                        Instant Snap
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* 2. THE GENERATED TRY-ON PHOTO */}
                    <img
                      src={showOriginal ? userImage : generatedImage}
                      alt="BRIVOO AI Try-On"
                      className={`w-full h-full object-cover object-top transition-all duration-300 ${
                        isGenerating ? 'blur-xs scale-98' : 'blur-none scale-100'
                      }`}
                    />

                    {/* AI Generation Scanning State */}
                    {isGenerating && (
                      <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center text-white p-6 space-y-4 z-20 animate-in fade-in">
                        <div className="w-14 h-14 rounded-full border-3 border-[#C5A059] border-t-transparent animate-spin flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-[#C5A059]" />
                        </div>
                        
                        <div className="text-center space-y-1">
                          <p className="font-mono text-xs font-bold text-[#C5A059] tracking-wider uppercase">
                            AI FACE-SWAP & GARMENT SYNTHESIS
                          </p>
                          <p className="text-xs text-stone-200">
                            {generationStep}
                          </p>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-48 h-1.5 bg-white/20 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#C5A059] to-amber-300 transition-all duration-300"
                            style={{ width: `${generationProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Top Badges */}
                    <div className="absolute top-3 inset-x-3 z-10 flex items-center justify-between pointer-events-none">
                      <div className="flex items-center space-x-1.5 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-mono text-white border border-white/20 shadow-md">
                        <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse"></span>
                        <span>
                          {showOriginal 
                            ? 'Original Face Photo' 
                            : isUserCustomPhoto 
                            ? '✨ AI Generated: Your Face on Dress' 
                            : `Wearing: ${selectedProduct?.title}`}
                        </span>
                      </div>

                      {tryOnResult && !showOriginal && (
                        <div className="bg-emerald-700/90 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[10px] font-bold font-mono border border-emerald-400 flex items-center space-x-1 shadow-md">
                          <CheckCircle2 className="w-3 h-3 text-emerald-200" />
                          <span>{tryOnResult.fitScore}% Fit Match</span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Canvas Controls: Before/After, Download */}
                    <div className="absolute bottom-3 inset-x-3 z-10 flex items-center justify-between bg-black/85 backdrop-blur-md px-3 py-2 rounded-xl text-white text-xs border border-white/20 shadow-lg">
                      
                      {/* Hold for Original Button */}
                      <button
                        onMouseDown={() => setShowOriginal(true)}
                        onMouseUp={() => setShowOriginal(false)}
                        onTouchStart={() => setShowOriginal(true)}
                        onTouchEnd={() => setShowOriginal(false)}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-[11px] font-bold transition-colors cursor-pointer select-none"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#C5A059]" />
                        <span>Hold for Original Face</span>
                      </button>

                      {/* Download Image Button */}
                      <button
                        onClick={handleDownload}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#C5A059] text-stone-950 text-[11px] font-black hover:bg-[#d6af63] transition-colors shadow-xs cursor-pointer"
                      >
                        {isDownloaded ? (
                          <>
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span>Saved!</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            <span>Download Photo</span>
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}

              </div>

              {/* Photo Input Controls: Camera & Upload Buttons */}
              <div className="mt-3 sm:mt-4 max-w-[340px] sm:max-w-[400px] mx-auto w-full space-y-2.5">
                
                {/* Camera Error Alert if any */}
                {cameraError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-800 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{cameraError}</span>
                  </div>
                )}

                {/* Primary Dual Actions: Open Camera & Upload Photo */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={startCamera}
                    className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-stone-900 to-stone-800 hover:from-stone-800 hover:to-stone-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 border border-[#C5A059]/40 shadow-xs cursor-pointer group"
                  >
                    <Camera className="w-4 h-4 text-[#C5A059] group-hover:scale-125 transition-transform" />
                    <span>Live Camera</span>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="py-2.5 px-3 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-stone-600" />
                    <span>Upload Photo</span>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {/* Face Fine-Tuning Controls (Active when custom photo is uploaded/captured) */}
                {isUserCustomPhoto && !isCameraActive && (
                  <div className="p-2.5 bg-white rounded-xl border border-stone-200/80 shadow-2xs space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between text-stone-600 font-bold">
                      <span className="flex items-center gap-1">
                        <Sliders className="w-3 h-3 text-[#C5A059]" />
                        <span>Adjust Face Placement on Neck:</span>
                      </span>
                      <span className="font-mono text-stone-900">{faceScale}% Size</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          const newScale = Math.max(75, faceScale - 5);
                          setFaceScale(newScale);
                          synthesizeTryOnLook(userImage, selectedProduct, selectedColor, selectedSize, true, newScale, faceOffsetY, faceOffsetX);
                        }}
                        className="px-2 py-1 rounded bg-stone-100 hover:bg-stone-200 font-bold"
                        title="Decrease Face Size"
                      >
                        - Size
                      </button>

                      <button
                        onClick={() => {
                          const newScale = Math.min(135, faceScale + 5);
                          setFaceScale(newScale);
                          synthesizeTryOnLook(userImage, selectedProduct, selectedColor, selectedSize, true, newScale, faceOffsetY, faceOffsetX);
                        }}
                        className="px-2 py-1 rounded bg-stone-100 hover:bg-stone-200 font-bold"
                        title="Increase Face Size"
                      >
                        + Size
                      </button>

                      <button
                        onClick={() => {
                          const newY = faceOffsetY - 8;
                          setFaceOffsetY(newY);
                          synthesizeTryOnLook(userImage, selectedProduct, selectedColor, selectedSize, true, faceScale, newY, faceOffsetX);
                        }}
                        className="px-2 py-1 rounded bg-stone-100 hover:bg-stone-200 font-bold"
                        title="Move Face Up"
                      >
                        ⬆️ Up
                      </button>

                      <button
                        onClick={() => {
                          const newY = faceOffsetY + 8;
                          setFaceOffsetY(newY);
                          synthesizeTryOnLook(userImage, selectedProduct, selectedColor, selectedSize, true, faceScale, newY, faceOffsetX);
                        }}
                        className="px-2 py-1 rounded bg-stone-100 hover:bg-stone-200 font-bold"
                        title="Move Face Down"
                      >
                        ⬇️ Down
                      </button>
                    </div>
                  </div>
                )}

                {/* Preset Models Row */}
                <div>
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                    Or Choose Model Preset:
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {modelPresets.map((preset) => {
                      const isSelected = !isUserCustomPhoto && userImage === preset.preview;
                      return (
                        <div
                          key={preset.id}
                          onClick={() => {
                            stopCamera();
                            setUserImage(preset.preview);
                            setUserImageName(preset.name);
                            setIsUserCustomPhoto(false);
                            synthesizeTryOnLook(preset.preview, selectedProduct, selectedColor, selectedSize, false);
                          }}
                          className={`cursor-pointer rounded-xl overflow-hidden border-2 p-1 bg-white text-center transition-all ${
                            isSelected ? 'border-[#C5A059] ring-2 ring-[#C5A059]/40 shadow-sm' : 'border-stone-200 hover:border-stone-400'
                          }`}
                        >
                          <img
                            src={preset.preview}
                            alt={preset.name}
                            className="w-full h-11 object-cover object-top rounded-lg"
                          />
                          <span className="text-[9px] font-semibold text-stone-800 line-clamp-1 mt-1 block">
                            {preset.label.split('•')[1] || preset.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>

            {/* Right Panel: Clothing Selector & AI Generation Trigger */}
            <div className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-stone-200 p-4 sm:p-5 overflow-visible lg:overflow-y-auto space-y-4 text-xs shrink-0 pb-safe">
              
              {/* Product Selector Dropdown */}
              <div>
                <label className="block text-[11px] font-bold text-stone-800 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Selected Atelier Clothing:</span>
                  <span className="text-stone-400 font-normal">Pick garment</span>
                </label>

                <select
                  value={selectedProduct?.id || ''}
                  onChange={(e) => {
                    const found = products.find(p => p.id === e.target.value);
                    if (found) {
                      setSelectedProduct(found);
                      if (found.colors && found.colors.length > 0) setSelectedColor(found.colors[0].name);
                      if (found.sizes && found.sizes.length > 0) setSelectedSize(found.sizes[0]);
                      synthesizeTryOnLook(userImage, found, found.colors?.[0]?.name, found.sizes?.[0], isUserCustomPhoto, faceScale, faceOffsetY, faceOffsetX);
                    }
                  }}
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-[#FAF8F5] text-stone-900 font-bold focus:outline-none focus:border-[#C5A059]"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.title} - ₹{p.price.toLocaleString('en-IN')}</option>
                  ))}
                </select>
              </div>

              {/* Selected Product Card */}
              {selectedProduct && (
                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-stone-200 flex space-x-3 items-center">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.title}
                    className="w-14 h-16 object-cover rounded-lg shrink-0 border border-stone-300"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-xs text-stone-900 line-clamp-1">{selectedProduct.title}</h4>
                    <div className="font-mono font-bold text-sm text-[#C5A059] mt-0.5">
                      ₹{selectedProduct.price.toLocaleString('en-IN')}
                    </div>
                    <span className="text-[10px] text-stone-500">{selectedProduct.category} • 100% European Flax</span>
                  </div>
                </div>
              )}

              {/* Color & Size Selectors */}
              {selectedProduct && (
                <div className="space-y-3">
                  {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                    <div>
                      <span className="text-[10.5px] font-bold text-stone-700 uppercase tracking-wider block mb-1.5">
                        Color: <strong className="text-stone-900">{selectedColor || selectedProduct.colors[0].name}</strong>
                      </span>
                      <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                        {selectedProduct.colors.map(col => (
                          <button
                            key={col.name}
                            onClick={() => {
                              setSelectedColor(col.name);
                              synthesizeTryOnLook(userImage, selectedProduct, col.name, selectedSize, isUserCustomPhoto, faceScale, faceOffsetY, faceOffsetX);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                              selectedColor === col.name
                                ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                                : 'bg-white text-stone-700 border-stone-300 hover:border-stone-500'
                            }`}
                          >
                            {col.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                    <div>
                      <span className="text-[10.5px] font-bold text-stone-700 uppercase tracking-wider block mb-1.5">
                        Size: <strong className="text-stone-900">{selectedSize}</strong>
                        {tryOnResult && (
                          <span className="text-[10px] text-emerald-700 font-mono ml-2 font-normal">
                            (AI Recommended: {tryOnResult.recommendedSize})
                          </span>
                        )}
                      </span>
                      <div className="flex items-center space-x-1.5">
                        {selectedProduct.sizes.map(s => (
                          <button
                            key={s}
                            onClick={() => {
                              setSelectedSize(s);
                              synthesizeTryOnLook(userImage, selectedProduct, selectedColor, s, isUserCustomPhoto, faceScale, faceOffsetY, faceOffsetX);
                            }}
                            className={`w-8 h-8 rounded-lg font-bold font-mono text-xs border transition-all ${
                              selectedSize === s
                                ? 'bg-[#C5A059] text-stone-950 border-[#C5A059] shadow-2xs'
                                : 'bg-white text-stone-700 border-stone-300 hover:border-stone-500'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Master Re-Generate Action Button */}
              <button
                onClick={() => synthesizeTryOnLook(userImage, selectedProduct, selectedColor, selectedSize, isUserCustomPhoto, faceScale, faceOffsetY, faceOffsetX)}
                disabled={isGenerating}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 hover:from-stone-900 hover:to-stone-800 text-[#E6DFC5] border border-[#C5A059]/60 hover:border-[#C5A059] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-md group cursor-pointer"
              >
                <Wand2 className={`w-4 h-4 text-[#C5A059] ${isGenerating ? 'animate-spin' : 'group-hover:scale-125 transition-transform'}`} />
                <span>{isGenerating ? 'Synthesizing...' : 'Generate AI Try-On Look'}</span>
              </button>

              {/* AI SARTORIAL ASSESSMENT REPORT */}
              {tryOnResult && (
                <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between pb-1.5 border-b border-emerald-200/60">
                    <span className="font-bold text-emerald-900 uppercase text-[10px] tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>AI Fit Assessment</span>
                    </span>
                    <span className="font-mono font-bold text-xs text-emerald-800">
                      {tryOnResult.fitScore}% Fit Match
                    </span>
                  </div>

                  <p className="text-[11.5px] font-bold text-emerald-950 leading-snug">
                    {tryOnResult.matchVerdict}
                  </p>

                  <p className="text-[11px] text-emerald-800/90 leading-relaxed">
                    {tryOnResult.silhouetteAnalysis}
                  </p>

                  <p className="text-[10px] text-emerald-700/90 italic">
                    "{tryOnResult.colorHarmony}"
                  </p>
                </div>
              )}

              {/* Direct Add to Bag */}
              <div className="space-y-2 pt-2 border-t border-stone-200">
                {selectedProduct && (
                  <button
                    onClick={() => {
                      onAddToCart(selectedProduct, selectedColor || 'Standard', selectedSize || 'M');
                      handleModalClose();
                    }}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#141414] hover:bg-[#C5A059] text-white hover:text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add Styled Outfit to Bag</span>
                  </button>
                )}
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
