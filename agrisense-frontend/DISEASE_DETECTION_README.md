# Plant Disease Detection Feature

## Overview
The Plant Disease Detection feature allows farmers to upload images of their plants and get AI-powered analysis to identify potential diseases and receive treatment recommendations.

## How It Works

### With API Key (Real Detection)
1. Get a free Hugging Face API token from [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Create a `.env.local` file in the `agrisense-frontend` directory:
   ```
   VITE_HF_API_KEY=your_token_here
   ```
3. The application will use the `neilsustain/plant-disease-identification` model for real plant disease detection

### Without API Key (Demo Mode)
The feature includes a fallback mode that displays sample disease predictions for demonstration purposes.

## Features

✅ **Image Upload**: Browse and upload plant photos in JPEG, PNG, or WebP format
🔬 **Disease Detection**: AI-powered analysis to identify plant diseases
📊 **Confidence Levels**: Shows the confidence percentage for each prediction
💡 **Smart Recommendations**: Provides actionable treatment recommendations for detected diseases
🌍 **Multi-language Support**: Available in English, Hindi, and Kannada
📱 **Mobile Responsive**: Works perfectly on desktop, tablet, and mobile devices

## Supported Disease Detections

The model can detect various plant diseases including:
- Powdery Mildew
- Leaf Spots
- Rust Disease
- Late Blight
- Early Blight
- Septoria Leaf Blotch
- And many more

## Best Practices for Image Upload

1. **Clear Photos**: Take close-up pictures of affected leaves or stems
2. **Good Lighting**: Ensure the photo has adequate lighting without harsh shadows
3. **Multiple Angles**: Try uploading photos from different angles for better accuracy
4. **Expert Consultation**: Always consult with a local agricultural expert for severe or unusual symptoms

## Recommendations Provided

For each detected disease, the system provides:
- Disease name and identification
- Confidence level (0-100%)
- Recommended treatment actions
- Prevention tips
- Expert consultation suggestions

## API Integration

### Hugging Face Inference API
- **Model**: `neilsustain/plant-disease-identification`
- **Endpoint**: `https://api-inference.huggingface.co/models/neilsustain/plant-disease-identification`
- **Authentication**: Optional (rate-limited without token)
- **Rate Limits**: 
  - Without token: ~30 requests per minute
  - With token: 1000+ requests per month (free tier)

### Environment Setup

Create `.env.local` file:
```
VITE_HF_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Features in Detail

### Image Upload Section
- Click to upload or drag-and-drop images
- Preview selected image before analysis
- Easy image replacement option

### Analysis Results
- **Primary Prediction**: Shows the most likely disease
- **Confidence Indicator**: Visual progress bar showing confidence level
- **Recommendations**: Specific actions to treat the identified disease
- **Additional Predictions**: List of other possible diseases with confidence levels

### Tips Section
- Guidance on taking better photos
- Best practices for disease detection accuracy
- Reminders to consult agricultural experts

## Supported Image Formats
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)
- Maximum file size: 5MB (adjustable)

## UI/UX Features

- **Dark Mode Support**: Fully compatible with dark/light theme toggle
- **Responsive Design**: Adapts to all screen sizes
- **Loading States**: Clear feedback during analysis
- **Error Handling**: User-friendly error messages
- **Accessible**: Semantic HTML and ARIA labels

## Troubleshooting

### "API Error" Message
- Check internet connection
- Verify VITE_HF_API_KEY is correctly set
- Wait a few moments and try again
- Use demo mode for testing

### Demo Mode Appearing
- This indicates no API key is configured
- Add `VITE_HF_API_KEY` to `.env.local` for real detection
- Demo mode shows realistic sample predictions for testing

### Slow Response Times
- First API call may be slower (model loading)
- Check internet connection
- Consider using an API token for faster responses

## Development Notes

### Component Structure
```
DiseaseDetection.jsx
├── Image Upload Section
├── Image Preview
├── Analyze Button
├── Results Display (conditional)
│   ├── Primary Disease Result
│   ├── Confidence Meter
│   ├── Recommendations
│   ├── All Predictions List
│   └── Tips Section
└── Error Handling
```

### Key Functions
- `handleImageSelect()`: Processes uploaded images
- `detectDisease()`: Calls the API for disease detection
- `showMockResult()`: Displays sample data when API unavailable
- `getRecommendation()`: Generates treatment recommendations

### Translations
All text is fully translated in:
- English (en)
- Hindi (hi)
- Kannada (kn)

## Future Enhancements

Potential features for future versions:
- [ ] Real-time camera feed detection
- [ ] Disease history tracking
- [ ] Treatment progress monitoring
- [ ] Integration with local agricultural experts
- [ ] Offline mode with downloaded models
- [ ] Batch image analysis
- [ ] Mobile app integration with device camera

## Support & Resources

- **Hugging Face Documentation**: https://huggingface.co/docs/inference-api
- **Plant Disease Models**: https://huggingface.co/models?pipeline_tag=image-classification&search=plant
- **Agricultural Support**: Contact local agricultural extension offices

## License
This feature is part of AgriSense AI and follows the same license as the main application.
