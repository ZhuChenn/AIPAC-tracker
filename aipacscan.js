// AIPACscan - Image Generator

// Elements
const photoInput = document.getElementById('photoInput');
const photoUpload = document.getElementById('photoUpload');
const photoPreview = document.getElementById('photoPreview');
const nameInput = document.getElementById('nameInput');
const generateBtn = document.getElementById('generateBtn');
const uploadSection = document.getElementById('uploadSection');
const loadingSection = document.getElementById('loadingSection');
const resultSection = document.getElementById('resultSection');
const resultCanvas = document.getElementById('resultCanvas');
const downloadBtn = document.getElementById('downloadBtn');
const newBtn = document.getElementById('newBtn');
const loadingText = document.querySelector('.loading-text');

let currentPhoto = null;
let currentPhotoDataUrl = null;

// Load template image
const templateImg = new Image();
templateImg.crossOrigin = 'anonymous';
templateImg.src = 'aipac-template.png';

// Load custom font for canvas
const zenDotsFont = new FontFace('Zen Dots', 'url(ZenDots-Regular.ttf)');
zenDotsFont.load().then(font => {
    document.fonts.add(font);
    console.log('Zen Dots font loaded');
}).catch(err => console.error('Font load error:', err));

// Check if ready to generate
function checkReady() {
    const hasPhoto = currentPhoto !== null;
    const hasName = nameInput.value.trim().length > 0;
    generateBtn.disabled = !(hasPhoto && hasName);
}

// Handle photo upload click
photoUpload.addEventListener('click', () => {
    photoInput.click();
});

// Handle file selection
photoInput.addEventListener('change', (e) => {
    if (e.target.files.length) {
        const file = e.target.files[0];
        if (!file.type.startsWith('image/')) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            currentPhotoDataUrl = event.target.result;
            currentPhoto = new Image();
            currentPhoto.onload = () => {
                photoPreview.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
                checkReady();
            };
            currentPhoto.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Name input
nameInput.addEventListener('input', checkReady);

// Generate random money amount (fully typed out)
function generateMoney() {
    const ranges = [
        { min: 10000, max: 99999 },
        { min: 100000, max: 999999 },
        { min: 1000000, max: 3000000 },
    ];
    
    const weights = [40, 45, 15];
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    
    let selectedIndex = 0;
    for (let i = 0; i < weights.length; i++) {
        random -= weights[i];
        if (random <= 0) {
            selectedIndex = i;
            break;
        }
    }
    
    const selected = ranges[selectedIndex];
    const value = Math.floor(Math.random() * (selected.max - selected.min + 1)) + selected.min;
    
    return '$' + value.toLocaleString();
}

// Get current date formatted
function getCurrentDate() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const year = now.getFullYear().toString().slice(-2);
    return `${month}/${day}/${year}`;
}

// Process person image - grayscale with proper cropping
function processPersonImage(img) {
    const personWidth = 480;
    const personHeight = 650;
    
    const canvas = document.createElement('canvas');
    canvas.width = personWidth;
    canvas.height = personHeight;
    const ctx = canvas.getContext('2d');
    
    // Calculate crop to focus on upper body/face (center horizontally, top-aligned)
    const imgAspect = img.width / img.height;
    const targetAspect = personWidth / personHeight;
    
    let srcX = 0, srcY = 0, srcW = img.width, srcH = img.height;
    
    if (imgAspect > targetAspect) {
        // Image is wider - crop sides, keep center
        srcW = img.height * targetAspect;
        srcX = (img.width - srcW) / 2;
    } else {
        // Image is taller - crop from top (show face area)
        srcH = img.width / targetAspect;
        srcY = 0; // Start from top to show face
    }
    
    // Draw the cropped image
    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, personWidth, personHeight);
    
    // Convert to grayscale
    const imageData = ctx.getImageData(0, 0, personWidth, personHeight);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    // Apply smooth edge fades
    ctx.globalCompositeOperation = 'destination-out';
    
    // Right edge fade (smooth blend into background)
    const rightFade = ctx.createLinearGradient(personWidth - 180, 0, personWidth, 0);
    rightFade.addColorStop(0, 'rgba(0,0,0,0)');
    rightFade.addColorStop(0.5, 'rgba(0,0,0,0.3)');
    rightFade.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = rightFade;
    ctx.fillRect(personWidth - 180, 0, 180, personHeight);
    
    // Bottom edge fade
    const bottomFade = ctx.createLinearGradient(0, personHeight - 150, 0, personHeight);
    bottomFade.addColorStop(0, 'rgba(0,0,0,0)');
    bottomFade.addColorStop(0.5, 'rgba(0,0,0,0.4)');
    bottomFade.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = bottomFade;
    ctx.fillRect(0, personHeight - 150, personWidth, 150);
    
    ctx.globalCompositeOperation = 'source-over';
    
    return canvas;
}

// Generate the image
async function generateImage() {
    const name = nameInput.value.trim().toUpperCase();
    const money = generateMoney();
    const date = getCurrentDate();
    
    const canvas = resultCanvas;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background template first
    ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);
    
    // Process and draw person
    if (loadingText) loadingText.textContent = 'Processing image...';
    
    const personCanvas = processPersonImage(currentPhoto);
    
    // Position person on LEFT side
    const personX = 0;
    const personY = canvas.height - personCanvas.height - 145;
    
    ctx.drawImage(personCanvas, personX, personY);
    
    // === TEXT ON RIGHT SIDE ===
    const textX = 520; // Left edge of text area
    let textY = 240;
    
    // Name - bold, stacked
    ctx.font = 'bold 68px "Inter", "Arial Black", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    
    const nameParts = name.split(' ');
    for (let i = 0; i < nameParts.length; i++) {
        ctx.fillText(nameParts[i], textX, textY);
        textY += 75;
    }
    
    textY += 40;
    
    // Money with glow
    ctx.font = '70px "Zen Dots", sans-serif';
    ctx.textAlign = 'left';
    
    // Red glow layers
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 40;
    ctx.fillStyle = '#ff2222';
    ctx.fillText(money, textX, textY);
    
    ctx.shadowBlur = 80;
    ctx.fillText(money, textX, textY);
    
    // White text on top
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(money, textX, textY);
    
    textY += 55;
    
    // "RECEIVED FROM THE"
    ctx.font = 'bold 26px "Inter", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('RECEIVED FROM THE', textX, textY);
    textY += 35;
    
    // "PRO-ISRAEL LOBBY"
    ctx.font = 'bold 26px "Inter", sans-serif';
    ctx.fillText('PRO-ISRAEL LOBBY', textX, textY);
    textY += 30;
    
    // "[AIPAC, RJC, NORPAC, USI]"
    ctx.font = '20px "Inter", sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.fillText('[AIPAC, RJC, NORPAC, USI]', textX, textY);
}

// Generate button click
generateBtn.addEventListener('click', async () => {
    uploadSection.style.display = 'none';
    loadingSection.style.display = 'block';
    if (loadingText) loadingText.textContent = 'Starting...';
    
    // Wait for template
    if (!templateImg.complete) {
        await new Promise(resolve => templateImg.onload = resolve);
    }
    
    // Wait for font
    await document.fonts.ready;
    
    try {
        await generateImage();
    } catch (error) {
        console.error('Generation error:', error);
        if (loadingText) loadingText.textContent = 'Error: ' + error.message;
        await new Promise(r => setTimeout(r, 2000));
    }
    
    loadingSection.style.display = 'none';
    resultSection.style.display = 'block';
});

// Download button
downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `trackaipac-${nameInput.value.trim().replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = resultCanvas.toDataURL('image/png');
    link.click();
});

// New button
newBtn.addEventListener('click', () => {
    currentPhoto = null;
    currentPhotoDataUrl = null;
    photoPreview.innerHTML = `
        <svg class="photo-placeholder" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
        </svg>
    `;
    nameInput.value = '';
    generateBtn.disabled = true;
    resultSection.style.display = 'none';
    uploadSection.style.display = 'block';
});
