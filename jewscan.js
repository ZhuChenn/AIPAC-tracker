// JewScan Page JavaScript - With Real Face Detection

// Elements
const scanFileInput = document.getElementById('scanFileInput');
const uploadZone = document.getElementById('uploadZone');
const scanUploadArea = document.getElementById('scanUploadArea');
const scanPreviewArea = document.getElementById('scanPreviewArea');
const scanResultsArea = document.getElementById('scanResultsArea');
const scanLoading = document.getElementById('scanLoading');
const previewImage = document.getElementById('previewImage');
const scanLine = document.getElementById('scanLine');
const faceCanvas = document.getElementById('faceCanvas');
const resultsImage = document.getElementById('resultsImage');
const resultsCanvas = document.getElementById('resultsCanvas');
const ethnicityResults = document.getElementById('ethnicityResults');
const resultsConfidence = document.getElementById('resultsConfidence');
const loadingText = document.getElementById('loadingText');

let currentImageData = null;
let currentDetections = null;
let modelsLoaded = false;

// Load face-api models
async function loadModels() {
    if (modelsLoaded) return;
    
    try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        modelsLoaded = true;
        console.log('Face detection models loaded');
    } catch (error) {
        console.error('Error loading models:', error);
    }
}

// Initialize models on page load
loadModels();

// Reset all states
function resetScanStates() {
    scanUploadArea.style.display = 'block';
    scanPreviewArea.style.display = 'none';
    scanResultsArea.style.display = 'none';
    scanLoading.style.display = 'none';
    scanLine.classList.remove('active');
    currentImageData = null;
    currentDetections = null;
    
    // Clear canvases
    const ctx1 = faceCanvas.getContext('2d');
    const ctx2 = resultsCanvas.getContext('2d');
    ctx1.clearRect(0, 0, faceCanvas.width, faceCanvas.height);
    ctx2.clearRect(0, 0, resultsCanvas.width, resultsCanvas.height);
    
    // Reset analyze button
    const analyzeBtn = document.getElementById('analyzeScanBtn');
    analyzeBtn.innerHTML = `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
        Begin Analysis
    `;
    analyzeBtn.disabled = false;
    analyzeBtn.style.opacity = '1';
}

// Show preview
function showPreview(imageUrl) {
    currentImageData = imageUrl;
    previewImage.src = imageUrl;
    scanUploadArea.style.display = 'none';
    scanPreviewArea.style.display = 'flex';
    
    // Set up canvas size when image loads
    previewImage.onload = () => {
        const container = previewImage.parentElement;
        faceCanvas.width = container.offsetWidth;
        faceCanvas.height = container.offsetHeight;
    };
}

// Handle file selection
function handleFileSelect(file) {
    if (!file || !file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        showPreview(e.target.result);
    };
    reader.readAsDataURL(file);
}

// File input
uploadZone.addEventListener('click', () => scanFileInput.click());
scanFileInput.addEventListener('change', (e) => {
    if (e.target.files.length) {
        handleFileSelect(e.target.files[0]);
    }
});

// Drag and drop
uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('dragover');
});

uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('dragover');
});

uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    if (e.dataTransfer.files.length) {
        handleFileSelect(e.dataTransfer.files[0]);
    }
});

// New scan buttons
document.getElementById('scanNewBtn').addEventListener('click', resetScanStates);
document.getElementById('resultsNewBtn').addEventListener('click', resetScanStates);

// Draw face landmarks with animation - Premium Blue Theme
function drawLandmarks(canvas, detections, progress = 1) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (!detections || detections.length === 0) return;
    
    const detection = detections[0];
    const landmarks = detection.landmarks;
    const positions = landmarks.positions;
    
    // Scale factors
    const scaleX = canvas.width / previewImage.naturalWidth;
    const scaleY = canvas.height / previewImage.naturalHeight;
    
    // Draw landmark points
    const pointsToDraw = Math.floor(positions.length * progress);
    
    // Clean blue colors - no glow
    ctx.fillStyle = 'rgba(100, 140, 200, 0.8)';
    ctx.strokeStyle = 'rgba(100, 140, 200, 0.5)';
    ctx.lineWidth = 1;
    
    // Draw points
    for (let i = 0; i < pointsToDraw; i++) {
        const point = positions[i];
        const x = point.x * scaleX;
        const y = point.y * scaleY;
        
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Draw connecting lines for face outline
    if (progress > 0.3) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(100, 140, 200, 0.4)';
        
        // Jaw line (0-16)
        for (let i = 0; i < Math.min(17, pointsToDraw); i++) {
            const point = positions[i];
            const x = point.x * scaleX;
            const y = point.y * scaleY;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        // Left eyebrow (17-21)
        ctx.beginPath();
        for (let i = 17; i < Math.min(22, pointsToDraw); i++) {
            const point = positions[i];
            const x = point.x * scaleX;
            const y = point.y * scaleY;
            if (i === 17) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        // Right eyebrow (22-26)
        ctx.beginPath();
        for (let i = 22; i < Math.min(27, pointsToDraw); i++) {
            const point = positions[i];
            const x = point.x * scaleX;
            const y = point.y * scaleY;
            if (i === 22) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        // Nose bridge (27-30)
        ctx.beginPath();
        for (let i = 27; i < Math.min(31, pointsToDraw); i++) {
            const point = positions[i];
            const x = point.x * scaleX;
            const y = point.y * scaleY;
            if (i === 27) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        // Nose bottom (31-35)
        ctx.beginPath();
        for (let i = 31; i < Math.min(36, pointsToDraw); i++) {
            const point = positions[i];
            const x = point.x * scaleX;
            const y = point.y * scaleY;
            if (i === 31) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        // Left eye (36-41)
        ctx.beginPath();
        for (let i = 36; i < Math.min(42, pointsToDraw); i++) {
            const point = positions[i];
            const x = point.x * scaleX;
            const y = point.y * scaleY;
            if (i === 36) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        if (pointsToDraw >= 42) {
            const point = positions[36];
            ctx.lineTo(point.x * scaleX, point.y * scaleY);
        }
        ctx.stroke();
        
        // Right eye (42-47)
        ctx.beginPath();
        for (let i = 42; i < Math.min(48, pointsToDraw); i++) {
            const point = positions[i];
            const x = point.x * scaleX;
            const y = point.y * scaleY;
            if (i === 42) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        if (pointsToDraw >= 48) {
            const point = positions[42];
            ctx.lineTo(point.x * scaleX, point.y * scaleY);
        }
        ctx.stroke();
        
        // Outer lips (48-59)
        ctx.beginPath();
        for (let i = 48; i < Math.min(60, pointsToDraw); i++) {
            const point = positions[i];
            const x = point.x * scaleX;
            const y = point.y * scaleY;
            if (i === 48) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        if (pointsToDraw >= 60) {
            const point = positions[48];
            ctx.lineTo(point.x * scaleX, point.y * scaleY);
        }
        ctx.stroke();
    }
}

// Animate face mapping
function animateFaceMapping(canvas, detections, duration = 2000) {
    return new Promise((resolve) => {
        const startTime = Date.now();
        
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            drawLandmarks(canvas, detections, progress);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                resolve();
            }
        }
        
        animate();
    });
}

// Analyze with backend proxy
async function analyzeImage(imageBase64) {
    const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image: imageBase64 })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
    }
    
    return data;
}

// Show error message
function showError(message) {
    scanPreviewArea.style.display = 'none';
    scanLoading.style.display = 'none';
    scanResultsArea.style.display = 'none';
    scanUploadArea.style.display = 'block';
    
    const originalContent = uploadZone.innerHTML;
    uploadZone.innerHTML = `
        <div class="upload-icon-ring" style="border-color: rgba(255, 100, 100, 0.3);">
            <svg class="upload-icon" style="color: #ff6b6b;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
        </div>
        <p class="upload-text" style="color: #ff6b6b;">${message}</p>
        <p class="upload-hint">Click to try again with a different image</p>
    `;
    
    const analyzeBtn = document.getElementById('analyzeScanBtn');
    analyzeBtn.innerHTML = `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
        Begin Analysis
    `;
    analyzeBtn.disabled = false;
    analyzeBtn.style.opacity = '1';
    
    setTimeout(() => {
        uploadZone.innerHTML = originalContent;
        resetScanStates();
    }, 3000);
}

// Analyze button
document.getElementById('analyzeScanBtn').addEventListener('click', async () => {
    if (!currentImageData) return;
    
    // Make sure models are loaded
    if (!modelsLoaded) {
        loadingText.textContent = 'Loading face detection...';
        scanPreviewArea.style.display = 'none';
        scanLoading.style.display = 'flex';
        await loadModels();
    }
    
    // Update button
    const analyzeBtn = document.getElementById('analyzeScanBtn');
    analyzeBtn.innerHTML = `
        <svg class="scanning-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
        Scanning...
    `;
    analyzeBtn.disabled = true;
    analyzeBtn.style.opacity = '0.7';
    
    // Start scan line
    scanLine.classList.add('active');
    
    try {
        // Detect face and landmarks
        loadingText.textContent = 'Detecting facial landmarks...';
        
        const detections = await faceapi
            .detectAllFaces(previewImage, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks();
        
        if (detections.length === 0) {
            scanLine.classList.remove('active');
            showError('No face detected. Please upload a clear photo of a face.');
            return;
        }
        
        currentDetections = detections;
        
        // Animate face mapping
        loadingText.textContent = 'Mapping 68 facial points...';
        await animateFaceMapping(faceCanvas, detections, 2500);
        
        // Stop scan line
        scanLine.classList.remove('active');
        
        // Show loading for API call
        scanPreviewArea.style.display = 'none';
        scanLoading.style.display = 'flex';
        loadingText.textContent = 'Analyzing ancestry markers...';
        
        // Call backend API
        const result = await analyzeImage(currentImageData);
        
        if (result.error === 'no_face') {
            showError(result.message || 'No face detected.');
            return;
        }
        
        // Show results
        showResults(result, detections);
        
    } catch (error) {
        console.error('Analysis error:', error);
        showError(error.message || 'Analysis failed. Please try again.');
    }
});

// Generate and show results
function showResults(data, detections) {
    // Set results image
    resultsImage.src = currentImageData;
    
    // Wait for image to load then draw landmarks
    resultsImage.onload = () => {
        const container = resultsImage.parentElement;
        resultsCanvas.width = container.offsetWidth;
        resultsCanvas.height = container.offsetHeight;
        
        if (detections && detections.length > 0) {
            // Draw final landmarks on results
            const ctx = resultsCanvas.getContext('2d');
            const detection = detections[0];
            const landmarks = detection.landmarks;
            const positions = landmarks.positions;
            
            const scaleX = resultsCanvas.width / resultsImage.naturalWidth;
            const scaleY = resultsCanvas.height / resultsImage.naturalHeight;
            
            // Draw all points and lines - Clean blue, no glow
            ctx.fillStyle = 'rgba(100, 140, 200, 0.7)';
            ctx.strokeStyle = 'rgba(100, 140, 200, 0.4)';
            ctx.lineWidth = 1;
            
            // Draw points
            positions.forEach(point => {
                const x = point.x * scaleX;
                const y = point.y * scaleY;
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, Math.PI * 2);
                ctx.fill();
            });
            
            // Draw face outline
            ctx.beginPath();
            for (let i = 0; i < 17; i++) {
                const point = positions[i];
                const x = point.x * scaleX;
                const y = point.y * scaleY;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
    };
    
    const jewishPercentage = data.jewish_likelihood || 0;
    const otherPercentage = 100 - jewishPercentage;
    const ashkenazi = data.ashkenazi_markers || 0;
    const sephardic = data.sephardic_markers || 0;
    const mizrahi = data.mizrahi_markers || 0;
    const confidence = data.confidence || 85;
    const analysis = data.analysis || '';
    
    let resultText = '';
    let resultColor = '';
    
    if (jewishPercentage >= 75) {
        resultText = 'Likely Jewish/Israeli';
        resultColor = '#6b8cff';
    } else if (jewishPercentage >= 50) {
        resultText = 'Possible Jewish/Israeli heritage';
        resultColor = '#8b9eff';
    } else if (jewishPercentage >= 25) {
        resultText = 'Some Jewish/Israeli markers detected';
        resultColor = '#60a5fa';
    } else {
        resultText = 'Unlikely Jewish/Israeli';
        resultColor = '#4ade80';
    }
    
    ethnicityResults.innerHTML = `
        <div class="primary-result">
            <div class="result-badge" style="background: ${resultColor}15; color: ${resultColor}; border-color: ${resultColor}30;">
                ${resultText}
            </div>
        </div>
        
        <div class="ethnicity-breakdown">
            <h4 class="breakdown-title">Genetic Markers Analysis</h4>
            <div class="ethnicity-item">
                <span class="ethnicity-label">Jewish/Israeli</span>
                <div class="ethnicity-bar-container">
                    <div class="ethnicity-bar jewish" style="width: 0%;" data-width="${jewishPercentage}%"></div>
                </div>
                <span class="ethnicity-percent">${jewishPercentage}%</span>
            </div>
            <div class="ethnicity-item">
                <span class="ethnicity-label">Ashkenazi markers</span>
                <div class="ethnicity-bar-container">
                    <div class="ethnicity-bar jewish" style="width: 0%; opacity: 0.7;" data-width="${ashkenazi}%"></div>
                </div>
                <span class="ethnicity-percent">${ashkenazi}%</span>
            </div>
            <div class="ethnicity-item">
                <span class="ethnicity-label">Sephardic markers</span>
                <div class="ethnicity-bar-container">
                    <div class="ethnicity-bar jewish" style="width: 0%; opacity: 0.7;" data-width="${sephardic}%"></div>
                </div>
                <span class="ethnicity-percent">${sephardic}%</span>
            </div>
            <div class="ethnicity-item">
                <span class="ethnicity-label">Mizrahi markers</span>
                <div class="ethnicity-bar-container">
                    <div class="ethnicity-bar jewish" style="width: 0%; opacity: 0.7;" data-width="${mizrahi}%"></div>
                </div>
                <span class="ethnicity-percent">${mizrahi}%</span>
            </div>
            <div class="ethnicity-item">
                <span class="ethnicity-label">Other ancestry</span>
                <div class="ethnicity-bar-container">
                    <div class="ethnicity-bar other" style="width: 0%;" data-width="${otherPercentage}%"></div>
                </div>
                <span class="ethnicity-percent">${otherPercentage}%</span>
            </div>
        </div>
        
        ${analysis ? `
        <div class="analysis-text">
            <h4 class="breakdown-title">Analysis Notes</h4>
            <p>${analysis}</p>
        </div>
        ` : ''}
    `;
    
    resultsConfidence.textContent = `${confidence}%`;
    
    scanLoading.style.display = 'none';
    scanResultsArea.style.display = 'flex';
    
    setTimeout(() => {
        document.querySelectorAll('.ethnicity-bar').forEach(bar => {
            bar.style.width = bar.dataset.width;
        });
    }, 100);
}
