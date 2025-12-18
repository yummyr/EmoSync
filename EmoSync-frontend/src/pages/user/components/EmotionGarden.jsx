import React, { useState, useEffect } from 'react';
import api from '@/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSeedling } from '@fortawesome/free-solid-svg-icons';

const EmotionGarden = ({
  sessionId,
  initialEmotionData,
  autoRefresh = false,
  refreshInterval = 30000
}) => {
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Default empty state data
  const emptyEmotionData = {
    primaryEmotion: 'Neutral',
    emotionScore: 50,
    isNegative: false,
    riskLevel: 0,
    keywords: ['Calm', 'Balanced'],
    suggestion: 'No emotion analysis available yet. Start chatting to see insights.',
    icon: '😐',
    label: 'Neutral',
    riskDescription: '',
    improvementSuggestions: ['Start a conversation to get personalized insights'],
    timestamp: Date.now()
  };

  // Use initial data if available
  useEffect(() => {
    if (initialEmotionData) {
      setCurrentEmotion(initialEmotionData);
      setLastUpdated(new Date(initialEmotionData.timestamp));
    } else if (sessionId) {
      fetchEmotionData();
    } else {
      setCurrentEmotion(emptyEmotionData);
    }
  }, [sessionId, initialEmotionData]);

  // Auto refresh logic
  useEffect(() => {
    if (!autoRefresh || !sessionId) return;

    const intervalId = setInterval(() => {
      fetchEmotionData();
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [autoRefresh, sessionId, refreshInterval]);

  // Fetch emotion data
  const fetchEmotionData = async () => {
    if (!sessionId) {
      setError('Session ID is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/psychological-chat/session/${sessionId}/emotion`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.code===200 && response.data.data) {
        setCurrentEmotion(response.data.data);
        setLastUpdated(new Date(response.data.data.timestamp));
      } else {
        setError(response.data.message || 'Failed to fetch emotion data');
        setCurrentEmotion(emptyEmotionData);
      }
    } catch (err) {
      console.error('Error fetching emotion data:', err);
      setError(err.response?.data?.message || err.message || 'Network error');
      setCurrentEmotion(emptyEmotionData);
    } finally {
      setLoading(false);
    }
  };

  // Manual refresh
  const handleRefresh = () => {
    fetchEmotionData();
  };

  // Get emotion flower center class name
  const getFlowerCenterClass = (isNegative) => {
    const baseClass = "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[50px] h-[50px] rounded-full flex flex-col items-center justify-center z-10 shadow-[0_4px_16px_rgba(0,0,0,0.1)] border-2 border-white/80";
    
    if (isNegative) {
      return `${baseClass} bg-gradient-to-br from-[#ffecd2] to-[#fcb69f] text-white`;
    } else {
      return `${baseClass} bg-gradient-to-br from-[#ff9a9e] via-[#fecfef] to-[#fecfef] text-white`;
    }
  };

  // Get petal class name - remove animation class, handle with inline styles
  const getPetalClass = (score, riskLevel) => {
    if (riskLevel >= 3) {
      return 'bg-gradient-to-br from-red-500 to-pink-500';
    } else if (riskLevel >= 2) {
      return 'bg-gradient-to-br from-orange-500 to-red-400';
    }

    if (score >= 70) return 'bg-gradient-to-br from-green-200 to-emerald-500';
    if (score >= 40) return 'bg-gradient-to-br from-blue-200 to-cyan-300';
    if (score >= 20) return 'bg-gradient-to-br from-yellow-400 to-amber-400';
    return 'bg-gradient-to-br from-gray-400 to-gray-500';
  };

  // Get emotion status class name
  const getEmotionStatusClass = (isNegative, riskLevel) => {
    if (riskLevel >= 3) {
      return 'bg-gradient-to-br from-red-200 to-red-600 text-white shadow-[0_4px_12px_rgba(239,68,68,0.3)]';
    } else if (riskLevel >= 2) {
      return 'bg-gradient-to-br from-orange-200 to-orange-600 text-white shadow-[0_4px_12px_rgba(249,115,22,0.3)]';
    } else if (riskLevel >= 1) {
      return 'bg-gradient-to-br from-yellow-200 to-yellow-600 text-white shadow-[0_4px_12px_rgba(234,179,8,0.3)]';
    } else if (isNegative) {
      return 'bg-gradient-to-br from-blue-200 to-indigo-500 text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)]';
    } else {
      return 'bg-gradient-to-br from-green-200 to-emerald-500 text-white shadow-[0_4px_12px_rgba(34,197,94,0.3)]';
    }
  };

  // Get emotion status text
  const getEmotionStatusText = (isNegative, riskLevel) => {
    if (riskLevel >= 3) return 'High Risk - Immediate Attention';
    if (riskLevel >= 2) return 'Medium Risk - Monitor Closely';
    if (riskLevel >= 1) return 'Low Risk - Keep Observing';
    return isNegative ? 'Needs Care' : 'Stable & Positive';
  };

  // Get risk description
  const getRiskDescription = (riskLevel) => {
    const descriptions = [
      'Normal emotional state',
      'Mild emotional fluctuations detected',
      'Moderate emotional distress observed',
      'Significant emotional distress detected'
    ];
    return descriptions[Math.min(riskLevel, 3)];
  };

  // Get risk indicator
  const getRiskIndicator = (riskLevel) => {
    const indicators = [
      { color: 'bg-green-500', icon: '✅', text: 'Low Risk' },
      { color: 'bg-yellow-500', icon: '⚠️', text: 'Low Risk' },
      { color: 'bg-orange-500', icon: '⚠️⚠️', text: 'Medium Risk' },
      { color: 'bg-red-500', icon: '🚨', text: 'High Risk' }
    ];
    return indicators[Math.min(riskLevel, 3)];
  };

  // Get petal animation class
  const getPetalAnimationClass = (score, riskLevel) => {
    if (riskLevel >= 3) return 'petal-wilt';
    if (riskLevel >= 2) return 'petal-wilt';
    if (score >= 70) return 'petal-bloom';
    if (score >= 40) return 'petal-grow';
    if (score >= 20) return 'petal-bud';
    return 'petal-wilt';
  };

  // Set rotation angle and animation for each petal - using Tailwind animation classes and CSS variables
  const getPetalStyle = (index) => {
    const baseRotation = index * 60;

    // Use CSS variables to pass base rotation angle for Tailwind animation to use
    return {
      '--base-rotation': `${baseRotation}deg`,
      transformOrigin: 'bottom right'
    };
  };

  // Format time
  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const emotionData = currentEmotion || emptyEmotionData;
  const riskIndicator = getRiskIndicator(emotionData.riskLevel || 0);

  
  return (
    <div className="relative overflow-hidden rounded-2xl p-4 mb-5 min-h-[320px]
                    bg-gradient-to-br from-[#fef9e7] via-[#fcf4e6] to-[#f6f0e8]
                    shadow-[0_8px_32px_rgba(252,244,230,0.8)]
                    border border-white/20">
  
      {/* Background glow effect */}
      <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%]
                      bg-[radial-gradient(circle,rgba(255,223,186,0.1)_0%,transparent_70%)]
                      animate-gentle-glow"></div>

      {/* Header - Title and controls */}
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="flex items-center gap-2 text-[#8b4513] font-semibold text-base">
          <i className="fas fa-seedling text-[#90ee90] text-lg animate-sway"></i>
         <FontAwesomeIcon icon={faSeedling} className="text-[#90ee90] text-lg animate-sway" />
          <span>Emotion Garden</span>
         
        </div>
        
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <div className="text-xs text-gray-500">
              Updated: {formatTime(lastUpdated)}
            </div>
          )}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="text-gray-500 hover:text-blue-600 transition-colors duration-200
                      disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh emotion analysis"
          >
            <i className={`fas fa-sync ${loading ? 'animate-spin' : ''}`}></i>
          </button>
          <div className="text-2xl animate-float">
            {emotionData.icon || '😐'}
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-20 rounded-2xl">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-t-4 border-gray-200 border-t-blue-500 
                          rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Analyzing emotions...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg relative z-10">
          <div className="flex items-center gap-2 text-red-600">
            <i className="fas fa-exclamation-triangle"></i>
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Risk indicator */}
      {emotionData.riskLevel > 0 && (
        <div className={`mb-4 p-3 rounded-lg relative z-10 
                        ${emotionData.riskLevel >= 3 ? 'bg-red-50 border border-red-200' :
                          emotionData.riskLevel >= 2 ? 'bg-orange-50 border border-orange-200' :
                          'bg-yellow-50 border border-yellow-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center 
                            ${emotionData.riskLevel >= 3 ? 'bg-red-100 text-red-600' :
                              emotionData.riskLevel >= 2 ? 'bg-orange-100 text-orange-600' :
                              'bg-yellow-100 text-yellow-600'}`}>
              {riskIndicator.icon}
            </div>
            <div>
              <div className="font-semibold text-sm">
                {riskIndicator.text} - Level {emotionData.riskLevel}
              </div>
              <div className="text-xs opacity-75">
                {emotionData.riskDescription || getRiskDescription(emotionData.riskLevel)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emotion flower and core information */}
      <div className="flex flex-col md:flex-row gap-6 mb-6 relative z-10">
        {/* Left side: Emotion flower */}
        <div className="flex-1">
          <div className="relative w-[150px] h-[150px] mx-auto mb-4">
            <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                            w-[70px] h-[70px] rounded-full flex flex-col items-center justify-center
                            z-10 shadow-lg border-2 border-white/80
                            ${getFlowerCenterClass(emotionData.isNegative)}`}>
              <div className="text-xs font-semibold leading-none mb-1">
                {emotionData.primaryEmotion || 'Neutral'}
              </div>
              <div className="text-sm font-bold">
                {emotionData.emotionScore || 50}
              </div>
           
            </div>
            
            <div className="relative w-full h-full">
              {[1, 2, 3, 4, 5, 6].map((index) => {
                let positionClass = '';
                switch(index) {
                  case 1: positionClass = 'top-[15px] left-[55px]'; break;
                  case 2: positionClass = 'top-[30px] right-[15px]'; break;
                  case 3: positionClass = 'bottom-[30px] right-[25px]'; break;
                  case 4: positionClass = 'bottom-[15px] left-[55px]'; break;
                  case 5: positionClass = 'bottom-[30px] left-[25px]'; break;
                  case 6: positionClass = 'top-[30px] left-[15px]'; break;
                }

                const animationType = getPetalAnimationClass(emotionData.emotionScore, emotionData.riskLevel);
                return (
                  <div
                    key={index}
                    className={`absolute w-[35px] h-[24px] rounded-[50%_50%_50%_0]
                              ${positionClass} ${getPetalClass(emotionData.emotionScore, emotionData.riskLevel)}
                              animate-petal-${animationType}`}
                    style={getPetalStyle(index)}
                  ></div>
                );
              })}
            </div>
          </div>

          {/* Emotion status indicator */}
          <div className="text-center">
            <div className={`inline-block px-4 py-2 rounded-2xl text-sm font-semibold
                            ${getEmotionStatusClass(emotionData.isNegative, emotionData.riskLevel)}`}>
          Current feeling: {getEmotionStatusText(emotionData.isNegative, emotionData.riskLevel)}
            </div>
          </div>
        </div>

       
      </div>

      {/* Emotion keywords */}
      {emotionData.keywords && emotionData.keywords.length > 0 && (
        <div className="mb-4 relative z-10">
          <div className="text-sm font-medium text-[#8b7355] mb-2 flex items-center gap-2">
            <span>💭 Emotion Keywords</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {emotionData.keywords.map((keyword, index) => (
              <span
                key={keyword}
                className="bg-white/90 text-[#8b7355] px-3 py-1.5 rounded-full text-xs font-medium
                          border border-white/50 shadow-sm hover:shadow-md transition-shadow duration-200
                          animate-bubble-float"
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Professional suggestions */}
      {emotionData.suggestion && (
        <div className="bg-white/90 rounded-xl p-4 mb-4 
                        border border-white/60 shadow-sm relative z-10">
          <div className="flex items-start gap-3">
            <div className="text-xl flex-shrink-0 mt-0.5">💡</div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-[#8b7355] mb-2">
                Professional Insight
              </div>
              <div className="text-sm text-[#6b5b47] leading-relaxed">
                {emotionData.suggestion}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Improvement suggestions */}
      {emotionData.improvementSuggestions && emotionData.improvementSuggestions.length > 0 && (
        <div className="relative z-10">
          <div className="text-sm font-medium text-[#8b7355] mb-3 flex items-center gap-2">
            <i className="fas fa-heart text-[#ff9a9e] animate-heartbeat"></i>
            <span>Recommended Actions</span>
          </div>
          <div className="space-y-2">
            {emotionData.improvementSuggestions.map((action, index) => (
              <div
                key={index}
                className="bg-white/90 rounded-lg p-3 flex items-start gap-3
                          border border-white/50 shadow-sm hover:shadow-md transition-shadow duration-200
                          animate-slide-in"
                style={{
                  animationDelay: `${index * 0.2}s`
                }}
              >
                <div className="text-sm text-blue-500 flex-shrink-0 mt-0.5">✓</div>
                <div className="text-xs text-[#6b5b47] leading-relaxed flex-1">
                  {action}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data source description */}
      <div className="mt-4 pt-3 border-t border-white/30 text-xs text-gray-500 relative z-10">
        <div className="flex justify-between items-center">
          <div>
            Emotion analysis based on AI-powered conversation analysis
          </div>
          {autoRefresh && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Auto-refresh enabled</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmotionGarden;