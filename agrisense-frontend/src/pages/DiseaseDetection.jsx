import { useState, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import translations from '../i18n';

export default function DiseaseDetection({ lang }) {
    const t = translations[lang];
    const { theme } = useTheme();
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setSelectedImage(event.target.result);
                setResult(null);
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const convertToBase64 = (dataUrl) => {
        return dataUrl.split(',')[1];
    };

    const detectDisease = async () => {
        if (!selectedImage) {
            setError(t.pleaseSelectImage);
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const base64Image = convertToBase64(selectedImage);

            // Using Hugging Face Inference API with a plant disease detection model
            const response = await fetch(
                'https://api-inference.huggingface.co/models/neilsustain/plant-disease-identification',
                {
                    headers: { Authorization: `Bearer ${import.meta.env.VITE_HF_API_KEY || ''}` },
                    method: 'POST',
                    body: JSON.stringify({ inputs: selectedImage.split(',')[1] }),
                }
            );

            if (!response.ok) {
                throw new Error(t.apiErrorMessage);
            }

            const output = await response.json();

            // Process the results
            if (Array.isArray(output) && output.length > 0) {
                // Sort by score to get the top prediction
                const predictions = output.sort((a, b) => (b.score || 0) - (a.score || 0));
                const topPrediction = predictions[0];

                setResult({
                    disease: topPrediction.label || t.unknownDisease,
                    confidence: ((topPrediction.score || 0) * 100).toFixed(1),
                    predictions: predictions.slice(0, 5),
                    recommendedAction: getRecommendation(topPrediction.label || '')
                });
            } else {
                setError(t.noDiseasesDetected);
            }
        } catch (err) {
            console.error('Error:', err);
            // If API fails, show mock result for demo purposes
            showMockResult();
        } finally {
            setLoading(false);
        }
    };

    const showMockResult = () => {
        // Mock data for demonstration when API key is not available
        const mockDiseases = [
            {
                disease: t.powderMildew,
                confidence: 87.5,
                recommendation: t.powderMildewRec,
                symptoms: t.powderMildewSymptoms
            },
            {
                disease: t.leafSpot,
                confidence: 72.3,
                recommendation: t.leafSpotRec,
                symptoms: t.leafSpotSymptoms
            },
            {
                disease: t.rustDisease,
                confidence: 65.8,
                recommendation: t.rustDiseaseRec,
                symptoms: t.rustDiseaseSymptoms
            }
        ];

        const random = Math.floor(Math.random() * mockDiseases.length);
        const mockResult = mockDiseases[random];

        setResult({
            disease: mockResult.disease,
            confidence: mockResult.confidence,
            recommendation: mockResult.recommendation,
            symptoms: mockResult.symptoms,
            isMock: true
        });
    };

    const getRecommendation = (diseaseLabel) => {
        const recommendations = {
            'powdery mildew': t.powderMildewRec,
            'leaf spot': t.leafSpotRec,
            'rust': t.rustDiseaseRec,
            'late blight': t.lateBlightRec,
            'early blight': t.earlyBlightRec,
            'septoria': t.septoriaRec
        };

        for (const [key, value] of Object.entries(recommendations)) {
            if (diseaseLabel.toLowerCase().includes(key)) {
                return value;
            }
        }
        return t.noteSeeExpert;
    };

    return (
        <div className="min-h-screen bg-green-50 dark:bg-dark-900 p-6 transition-colors duration-300">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-emerald-950 dark:text-white mb-2">
                        🔍 {t.diseaseDetection}
                    </h1>
                    <p className="text-emerald-700 dark:text-slate-400">
                        {t.diseaseDetectionDesc}
                    </p>
                </div>

                {/* Upload Section */}
                <div className="glass rounded-2xl border border-green-300 dark:border-white/10 p-8">
                    <div className="space-y-6">
                        {/* Upload Area */}
                        <div
                            className="border-2 border-dashed border-emerald-400 dark:border-emerald-600 rounded-xl p-8 text-center cursor-pointer hover:bg-emerald-50 dark:hover:bg-dark-700 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                                className="hidden"
                            />
                            <div className="text-4xl mb-3">📸</div>
                            <p className="text-lg font-semibold text-emerald-950 dark:text-white mb-2">
                                {t.clickToUpload}
                            </p>
                            <p className="text-sm text-emerald-700 dark:text-slate-400">
                                {t.supportedFormats}
                            </p>
                        </div>

                        {/* Selected Image Preview */}
                        {selectedImage && (
                            <div className="space-y-4">
                                <div className="relative rounded-lg overflow-hidden border border-emerald-200 dark:border-white/20 max-h-96 flex items-center justify-center bg-black/10">
                                    <img
                                        src={selectedImage}
                                        alt="Selected plant"
                                        className="max-w-full max-h-96 object-contain"
                                    />
                                </div>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full py-2 text-sm text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-600 rounded-lg hover:bg-emerald-50 dark:hover:bg-dark-700 transition-colors"
                                >
                                    {t.changeImage}
                                </button>
                            </div>
                        )}

                        {/* Detect Button */}
                        <button
                            onClick={detectDisease}
                            disabled={!selectedImage || loading}
                            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <span className="animate-spin">⏳</span>
                                    {t.analyzing}
                                </>
                            ) : (
                                <>
                                    🔬 {t.analyzeImage}
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="glass rounded-2xl border border-red-300 dark:border-red-600/30 bg-red-50 dark:bg-red-900/20 p-6">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">⚠️</span>
                            <div>
                                <h3 className="font-semibold text-red-900 dark:text-red-300">{t.error}</h3>
                                <p className="text-red-800 dark:text-red-400 text-sm">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Results Section */}
                {result && (
                    <div className="space-y-6">
                        {result.isMock && (
                            <div className="glass rounded-2xl border border-blue-300 dark:border-blue-600/30 bg-blue-50 dark:bg-blue-900/20 p-4">
                                <div className="flex items-start gap-3">
                                    <span className="text-lg">ℹ️</span>
                                    <p className="text-sm text-blue-900 dark:text-blue-300">{t.mockDataNote}</p>
                                </div>
                            </div>
                        )}

                        {/* Main Result Card */}
                        <div className="glass rounded-2xl border border-green-300 dark:border-white/10 p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
                                            {t.detectedDisease}
                                        </p>
                                        <p className="text-3xl font-bold text-emerald-950 dark:text-white">
                                            {result.disease}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
                                            {t.confidence}
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 bg-emerald-200 dark:bg-dark-600 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full transition-all duration-500"
                                                    style={{ width: `${result.confidence}%` }}
                                                />
                                            </div>
                                            <span className="font-bold text-emerald-950 dark:text-white w-12">
                                                {result.confidence}%
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Recommendation */}
                                <div className="space-y-3">
                                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                                        {t.recommendedAction}
                                    </p>
                                    <div className="bg-emerald-50 dark:bg-dark-700 rounded-lg p-4 border-l-4 border-emerald-500">
                                        <p className="text-emerald-950 dark:text-slate-100 text-sm">
                                            {result.recommendedAction || result.recommendation}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* All Predictions */}
                        {result.predictions && result.predictions.length > 0 && (
                            <div className="glass rounded-2xl border border-green-300 dark:border-white/10 p-6">
                                <h3 className="text-lg font-semibold text-emerald-950 dark:text-white mb-4">
                                    📊 {t.allPredictions}
                                </h3>
                                <div className="space-y-3">
                                    {result.predictions.map((pred, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-dark-700">
                                            <span className="font-semibold text-emerald-950 dark:text-white w-10">
                                                #{idx + 1}
                                            </span>
                                            <div className="flex-1">
                                                <p className="text-emerald-950 dark:text-white text-sm font-medium">
                                                    {pred.label || pred}
                                                </p>
                                            </div>
                                            <span className="text-xs font-bold bg-emerald-500 text-white px-3 py-1 rounded-full">
                                                {((pred.score || 0) * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tips Section */}
                        <div className="glass rounded-2xl border border-green-300 dark:border-white/10 p-6">
                            <h3 className="text-lg font-semibold text-emerald-950 dark:text-white mb-4">
                                💡 {t.tips}
                            </h3>
                            <ul className="space-y-2 text-sm text-emerald-900 dark:text-slate-300">
                                <li className="flex gap-2">
                                    <span>✓</span>
                                    <span>{t.tipClearPhoto}</span>
                                </li>
                                <li className="flex gap-2">
                                    <span>✓</span>
                                    <span>{t.tipGoodLight}</span>
                                </li>
                                <li className="flex gap-2">
                                    <span>✓</span>
                                    <span>{t.tipMultipleAngles}</span>
                                </li>
                                <li className="flex gap-2">
                                    <span>✓</span>
                                    <span>{t.tipConsultExpert}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
