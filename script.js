// ============================================
// GLOBAL VARIABLES & CONFIGURATION
// ============================================
// Force "Desktop View" zoom out on mobile devices
(function() {
    if (window.innerWidth < 1024) {
        const viewport = document.querySelector("meta[name=viewport]");
        // This forces the virtual width to 1200px and zooms out automatically
        viewport.setAttribute('content', 'width=1200, initial-scale=' + (window.innerWidth / 1200));
    }
})();

const CONFIG = {
    platforms: ['ios', 'android', 'windows', 'macos'],
    defaultWallpaper: 'linear-gradient(135deg, #ff69b4 0%, #007aff 100%)',
    maxFileSize: {
        image: 10 * 1024 * 1024,
        video: 50 * 1024 * 1024
    },
    supportedFormats: {
        image: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        video: ['video/mp4', 'video/webm', 'video/quicktime']
    }
};

let currentState = {
    currentPlatform: 'home',
    currentWallpaper: {
        ios: CONFIG.defaultWallpaper,
        android: CONFIG.defaultWallpaper,
        windows: CONFIG.defaultWallpaper,
        macos: CONFIG.defaultWallpaper
    },
    currentScreen: {
        ios: 'lock',
        android: 'lock',
        windows: 'lock',
        macos: 'lock'
    },
    uploads: {
        ios: { image: null, video: null },
        android: { image: null, video: null },
        windows: { image: null, video: null },
        macos: { image: null, video: null }
    },
    filters: {
        ios: { brightness: 100, contrast: 100, blur: 0 },
        android: { brightness: 100, contrast: 100, blur: 0 },
        windows: { brightness: 100, contrast: 100, blur: 0 },
        macos: { brightness: 100, contrast: 100, blur: 0 }
    },
    darkMode: localStorage.getItem('darkMode') === 'true',
    apps: {
        ios: [],
        android: [],
        windows: [],
        macos: []
    },
    macosSettings: {
        showDock: true,
        showMenuBar: true,
        showDesktopIcons: true,
        showWidgets: true
    }
};

const APPS_DATA = {
    ios: [
        { icon: 'fas fa-phone', name: 'Phone', color: '#34C759' },
        { icon: 'fas fa-message', name: 'Messages', color: '#007AFF' },
        { icon: 'fab fa-safari', name: 'Safari', color: '#FF9500' },
        { icon: 'fas fa-music', name: 'Music', color: '#FF2D55' },
        { icon: 'fas fa-envelope', name: 'Mail', color: '#007AFF' },
        { icon: 'fas fa-camera', name: 'Camera', color: '#5856D6' },
        { icon: 'fas fa-map', name: 'Maps', color: '#FF9500' },
        { icon: 'fas fa-calendar', name: 'Calendar', color: '#FF2D55' }
    ],
    android: [
        { icon: 'fas fa-phone', name: 'Phone', color: '#34C759' },
        { icon: 'fas fa-message', name: 'Messages', color: '#4285F4' },
        { icon: 'fab fa-chrome', name: 'Chrome', color: '#EA4335' },
        { icon: 'fas fa-camera', name: 'Camera', color: '#FBBC05' },
        { icon: 'fas fa-envelope', name: 'Gmail', color: '#34A853' },
        { icon: 'fab fa-youtube', name: 'YouTube', color: '#FF0000' },
        { icon: 'fab fa-instagram', name: 'Instagram', color: '#E4405F' },
        { icon: 'fas fa-map', name: 'Maps', color: '#4285F4' }
    ],
    macos: [
        { icon: 'fab fa-safari', name: 'Safari', color: '#1B9CFC' },
        { icon: 'fas fa-envelope', name: 'Mail', color: '#FF9F43' },
        { icon: 'fas fa-message', name: 'Messages', color: '#32FF7E' },
        { icon: 'fas fa-music', name: 'Music', color: '#FF3838' }
    ]
};

// DOM Elements Cache
const DOM = {
    navItems: null,
    contentSections: null,
    themeToggle: null,
    navBackBtn: null,
    sectionBackBtns: null,
    platformCards: null,
    quickUploadBtn: null,
    previewAllBtn: null,
    exportConfigBtn: null,
    quickFileInput: null,
    loadingOverlay: null,
    toastContainer: null
};

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Theme Customizer Initializing...');
    
    // Cache DOM elements
    cacheDOMElements();
    
    // Initialize all modules
    initializeNavigation();
    initializeThemeToggle();
    initializeHomePage();
    initializePlatformPages();
    initializeUploads();
    initializeControls();
    initializeTime();
    initializeRecentWallpapers();
    
    // Set initial theme
    document.body.classList.toggle('dark-mode', currentState.darkMode);
    updateThemeIcon();
    
    // Initialize apps for all platforms
    CONFIG.platforms.forEach(platform => {
        initializeApps(platform);
    });
    
    // Hide loading overlay
    showLoading(false);
    
    // Initialize Windows and macOS sections
    initializeWindows();
    initializeMacOS();
    
    console.log('✅ Initialization Complete!');
});

function cacheDOMElements() {
    // Navigation
    DOM.navItems = document.querySelectorAll('.nav-item');
    DOM.contentSections = document.querySelectorAll('.content-section');
    DOM.themeToggle = document.getElementById('theme-toggle');
    DOM.navBackBtn = document.getElementById('nav-back');
    DOM.sectionBackBtns = document.querySelectorAll('.section-back-btn');
    
    // Home Page
    DOM.platformCards = document.querySelectorAll('.platform-card');
    DOM.quickUploadBtn = document.getElementById('quick-upload');
    DOM.previewAllBtn = document.getElementById('preview-all');
    DOM.exportConfigBtn = document.getElementById('export-config');
    DOM.quickFileInput = document.getElementById('quick-file');
    
    // System
    DOM.loadingOverlay = document.getElementById('loading-overlay');
    DOM.toastContainer = document.getElementById('toast-container') || createToastContainer();
}

// ============================================
// NAVIGATION SYSTEM
// ============================================
function initializeNavigation() {
    console.log('📍 Initializing Navigation...');
    
    DOM.navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetSection = item.dataset.section;
            
            // Update active navigation
            DOM.navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Show target section
            DOM.contentSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === `${targetSection}-section`) {
                    section.classList.add('active');
                    currentState.currentPlatform = targetSection;
                    
                    // Initialize platform-specific features
                    if (targetSection !== 'home') {
                        initializePlatform(targetSection);
                    }
                    
                    // Special handling for Windows
                    if (targetSection === 'windows') {
                        setTimeout(() => {
                            ensureWindowsScreenState();
                            updateWindowsTime();
                        }, 100);
                    }
                    
                    // Special handling for macOS
                    if (targetSection === 'macos') {
                        setTimeout(() => {
                            ensureMacOSScreenState();
                            updateMacOSTime();
                        }, 100);
                    }
                }
            });
            
            showToast(`Switched to ${targetSection.toUpperCase()}`, 'info');
        });
    });
    
    // Back Buttons
    DOM.navBackBtn?.addEventListener('click', () => {
        const homeNav = document.querySelector('.nav-item[data-section="home"]');
        if (homeNav) homeNav.click();
    });
    
    DOM.sectionBackBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const homeNav = document.querySelector('.nav-item[data-section="home"]');
            if (homeNav) homeNav.click();
        });
    });
}

// ============================================
// THEME TOGGLE
// ============================================
function initializeThemeToggle() {
    console.log('🌓 Initializing Theme Toggle...');
    
    if (!DOM.themeToggle) {
        console.error('❌ Theme toggle button not found!');
        return;
    }
    
    updateThemeIcon();
    
    DOM.themeToggle.addEventListener('click', () => {
        currentState.darkMode = !currentState.darkMode;
        document.body.classList.toggle('dark-mode', currentState.darkMode);
        localStorage.setItem('darkMode', currentState.darkMode);
        
        updateThemeIcon();
        showToast(`${currentState.darkMode ? 'Dark' : 'Light'} mode activated`, 'success');
    });
}

function updateThemeIcon() {
    if (!DOM.themeToggle) return;
    
    const icon = DOM.themeToggle.querySelector('i');
    if (icon) {
        icon.className = currentState.darkMode ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// ============================================
// HOME PAGE FUNCTIONALITY
// ============================================
function initializeHomePage() {
    console.log('🏠 Initializing Home Page...');
    
    // Platform Selection Cards
    DOM.platformCards.forEach(card => {
        card.addEventListener('click', () => {
            const platform = card.dataset.platform;
            const platformNav = document.querySelector(`.nav-item[data-section="${platform}"]`);
            
            if (platformNav) {
                card.style.transform = 'scale(0.95)';
                setTimeout(() => card.style.transform = '', 200);
                platformNav.click();
            }
        });
    });
    
    // Quick Upload Button
    DOM.quickUploadBtn?.addEventListener('click', () => {
        if (DOM.quickFileInput) {
            DOM.quickFileInput.click();
        }
    });
    
    DOM.quickFileInput?.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            handleQuickUpload(file);
        }
    });
    
    // Preview All Button
    DOM.previewAllBtn?.addEventListener('click', () => {
        createPreviewModal();
        showToast('Preview generated for all platforms!', 'success');
    });
    
    // Export Config Button
    DOM.exportConfigBtn?.addEventListener('click', () => {
        exportThemeConfig();
    });
}

function handleQuickUpload(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        CONFIG.platforms.forEach(platform => {
            const type = file.type.startsWith('image/') ? 'image' : 'video';
            currentState.uploads[platform][type] = {
                data: e.target.result,
                name: file.name,
                type: file.type
            };
            
            updateWallpaper(platform, e.target.result, type);
            addToRecentWallpapers(e.target.result, file.type, platform, file.name);
        });
        
        showToast(`"${file.name}" applied to all platforms!`, 'success');
    };
    
    reader.readAsDataURL(file);
}

// ============================================
// PLATFORM PAGES FUNCTIONALITY
// ============================================
function initializePlatformPages() {
    console.log('📱 Initializing Platform Pages...');
    
    // Screen Switching (Lock/Home/Desktop) - For iOS/Android
    document.addEventListener('click', (e) => {
        const screenBtn = e.target.closest('.screen-btn');
        if (screenBtn && !screenBtn.closest('#windows-section') && !screenBtn.closest('#macos-section')) {
            const screenType = screenBtn.dataset.screen;
            const platform = getPlatformFromElement(screenBtn);
            
            // Update active button
            screenBtn.parentElement.querySelectorAll('.screen-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            screenBtn.classList.add('active');
            
            // Update current screen state
            currentState.currentScreen[platform] = screenType;
            
            // Show correct screen
            const section = document.getElementById(`${platform}-section`);
            section.querySelectorAll('.ios-screen, .android-screen').forEach(screen => {
                screen.classList.remove('active');
            });
            
            const targetScreen = section.querySelector(`.${screenType}-screen`);
            if (targetScreen) {
                targetScreen.classList.add('active');
            }
        }
    });
    
    // Control Tab Switching (for all platforms)
    document.addEventListener('click', (e) => {
        const controlTab = e.target.closest('.control-tab');
        if (controlTab) {
            const tabName = controlTab.dataset.tab;
            const container = controlTab.closest('.controls-container');
            
            // Update active tab
            controlTab.parentElement.querySelectorAll('.control-tab').forEach(t => {
                t.classList.remove('active');
            });
            controlTab.classList.add('active');
            
            // Show correct content
            if (container) {
                container.querySelectorAll('.control-content').forEach(content => {
                    content.classList.remove('active');
                });
                
                const targetContent = container.querySelector(`[data-content="${tabName}"]`);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            }
        }
    });
}

function initializePlatform(platform) {
    console.log(`Initializing ${platform} platform...`);
    
    // Initialize apps for this platform
    if (!currentState.apps[platform].length && APPS_DATA[platform]) {
        currentState.apps[platform] = [...APPS_DATA[platform]];
    }
    
    // Load saved wallpaper for this platform
    const wallpaper = getWallpaperElement(platform);
    if (wallpaper) {
        const currentWallpaper = currentState.currentWallpaper[platform];
        if (currentWallpaper && currentWallpaper !== CONFIG.defaultWallpaper) {
            if (currentWallpaper.startsWith('data:image') || currentWallpaper.startsWith('data:video')) {
                const type = currentWallpaper.startsWith('data:image') ? 'image' : 'video';
                updateWallpaper(platform, currentWallpaper, type);
            }
        }
    }
    
    // Render apps (for iOS/Android/macOS only)
    if (platform !== 'windows') {
        renderApps(platform);
    }
    
    // Setup app customization controls (for iOS/Android/macOS only)
    if (platform !== 'windows') {
        setupAppControls(platform);
    }
}

// ============================================
// macOS SECTION
// ============================================
function initializeMacOS() {
    console.log('🍎 Initializing macOS section...');
    
    // Set up macOS screen switching
    const macosScreenBtns = document.querySelectorAll('#macos-section .screen-btn');
    const macosDesktop = document.querySelector('#macos-section .macos-desktop');
    const macosLockScreen = document.querySelector('#macos-section .macos-lockscreen');
    
    macosScreenBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const screenType = e.currentTarget.dataset.screen;
            
            macosScreenBtns.forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            
            switchMacOSScreen(screenType);
            currentState.currentScreen.macos = screenType;
            showToast(`Switched to ${screenType === 'lock' ? 'Lock Screen' : 'Desktop'}`, 'info');
        });
    });
    
    // Click anywhere on lock screen to unlock
    if (macosLockScreen) {
        macosLockScreen.addEventListener('click', (e) => {
            if (macosLockScreen.classList.contains('active') && 
                !e.target.closest('.macos-widget') && 
                !e.target.closest('.screen-switcher')) {
                const desktopBtn = document.querySelector('#macos-section .screen-btn[data-screen="desktop"]');
                if (desktopBtn) {
                    desktopBtn.click();
                }
            }
        });
    }
    
    // Desktop icon hover and click effects
    const desktopIcons = document.querySelectorAll('#macos-section .desktop-icon-macos');
    desktopIcons.forEach(icon => {
        icon.addEventListener('mouseenter', () => {
            icon.style.transform = 'scale(1.05)';
            icon.style.transition = 'transform 0.2s ease';
        });
        
        icon.addEventListener('mouseleave', () => {
            icon.style.transform = 'scale(1)';
        });
        
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            desktopIcons.forEach(i => i.classList.remove('selected'));
            icon.classList.add('selected');
            icon.style.animation = 'iconClick 0.3s ease';
            setTimeout(() => {
                icon.style.animation = '';
            }, 300);
        });
    });
    
    // Dock app hover and click effects
    const dockApps = document.querySelectorAll('#macos-section .dock-app');
    dockApps.forEach(app => {
        app.addEventListener('mouseenter', () => {
            app.style.transform = 'translateY(-8px) scale(1.1)';
            app.style.transition = 'transform 0.3s ease';
        });
        
        app.addEventListener('mouseleave', () => {
            app.style.transform = 'translateY(0) scale(1)';
        });
        
        app.addEventListener('click', (e) => {
            e.stopPropagation();
            dockApps.forEach(a => a.classList.remove('active'));
            app.classList.add('active');
            
            const appName = app.getAttribute('title') || app.querySelector('i').className;
            showToast(`Opening ${appName}`, 'info');
            
            app.style.animation = 'dockBounce 0.5s ease';
            setTimeout(() => {
                app.style.animation = '';
            }, 500);
        });
    });
    
    // Toggle controls
    const toggleDock = document.getElementById('toggle-dock');
    const toggleMenuBar = document.getElementById('toggle-menubar');
    const toggleDesktopIcons = document.getElementById('toggle-desktop-icons');
    const toggleWidgetsMacOS = document.getElementById('toggle-widgets-macos');
    
    if (toggleDock) {
        toggleDock.checked = currentState.macosSettings.showDock;
        toggleDock.addEventListener('change', () => {
            const dock = document.querySelector('#macos-section .macos-dock');
            if (dock) {
                dock.style.opacity = toggleDock.checked ? '1' : '0';
                dock.style.pointerEvents = toggleDock.checked ? 'auto' : 'none';
                currentState.macosSettings.showDock = toggleDock.checked;
                showToast(`Dock ${toggleDock.checked ? 'shown' : 'hidden'}`, 'info');
            }
        });
    }
    
    if (toggleMenuBar) {
        toggleMenuBar.checked = currentState.macosSettings.showMenuBar;
        toggleMenuBar.addEventListener('change', () => {
            const menuBar = document.querySelector('#macos-section .macos-menubar');
            if (menuBar) {
                menuBar.style.opacity = toggleMenuBar.checked ? '1' : '0';
                menuBar.style.pointerEvents = toggleMenuBar.checked ? 'auto' : 'none';
                currentState.macosSettings.showMenuBar = toggleMenuBar.checked;
                showToast(`Menu bar ${toggleMenuBar.checked ? 'shown' : 'hidden'}`, 'info');
            }
        });
    }
    
    if (toggleDesktopIcons) {
        toggleDesktopIcons.checked = currentState.macosSettings.showDesktopIcons;
        toggleDesktopIcons.addEventListener('change', () => {
            const desktopIcons = document.querySelector('#macos-section .desktop-icons-macos');
            if (desktopIcons) {
                desktopIcons.style.opacity = toggleDesktopIcons.checked ? '1' : '0';
                desktopIcons.style.pointerEvents = toggleDesktopIcons.checked ? 'auto' : 'none';
                currentState.macosSettings.showDesktopIcons = toggleDesktopIcons.checked;
                showToast(`Desktop icons ${toggleDesktopIcons.checked ? 'shown' : 'hidden'}`, 'info');
            }
        });
    }
    
    if (toggleWidgetsMacOS) {
        toggleWidgetsMacOS.checked = currentState.macosSettings.showWidgets;
        toggleWidgetsMacOS.addEventListener('change', () => {
            const widgets = document.querySelector('#macos-section .macos-widgets-container');
            if (widgets) {
                widgets.style.opacity = toggleWidgetsMacOS.checked ? '1' : '0';
                widgets.style.pointerEvents = toggleWidgetsMacOS.checked ? 'auto' : 'none';
                currentState.macosSettings.showWidgets = toggleWidgetsMacOS.checked;
                showToast(`Widgets ${toggleWidgetsMacOS.checked ? 'shown' : 'hidden'}`, 'info');
            }
        });
    }
    
    // Update macOS time in real-time
    updateMacOSTime();
    setInterval(updateMacOSTime, 60000);
    
    // Ensure initial screen state is correct
    ensureMacOSScreenState();
    applyMacOSSettings();
}

function switchMacOSScreen(screenType) {
    const macosDesktop = document.querySelector('#macos-section .macos-desktop');
    const macosLockScreen = document.querySelector('#macos-section .macos-lockscreen');
    
    if (!macosDesktop || !macosLockScreen) return;
    
    if (screenType === 'lock') {
        if (macosDesktop.classList.contains('active')) {
            macosDesktop.classList.remove('active');
            macosDesktop.classList.add('fade-out');
            
            setTimeout(() => {
                macosDesktop.classList.remove('fade-out');
                macosDesktop.style.display = 'none';
                macosLockScreen.style.display = 'flex';
                macosLockScreen.classList.add('fade-in');
                
                setTimeout(() => {
                    macosLockScreen.classList.remove('fade-in');
                    macosLockScreen.classList.add('active');
                }, 500);
            }, 500);
        }
    } else if (screenType === 'desktop') {
        if (macosLockScreen.classList.contains('active')) {
            macosLockScreen.classList.remove('active');
            macosLockScreen.classList.add('fade-out');
            
            setTimeout(() => {
                macosLockScreen.classList.remove('fade-out');
                macosLockScreen.style.display = 'none';
                macosDesktop.style.display = 'flex';
                macosDesktop.classList.add('fade-in');
                
                setTimeout(() => {
                    macosDesktop.classList.remove('fade-in');
                    macosDesktop.classList.add('active');
                }, 500);
            }, 500);
        }
    }
}

function ensureMacOSScreenState() {
    const macosDesktop = document.querySelector('#macos-section .macos-desktop');
    const macosLockScreen = document.querySelector('#macos-section .macos-lockscreen');
    const lockBtn = document.querySelector('#macos-section .screen-btn[data-screen="lock"]');
    const desktopBtn = document.querySelector('#macos-section .screen-btn[data-screen="desktop"]');
    
    if (!macosDesktop || !macosLockScreen || !lockBtn || !desktopBtn) return;
    
    if (currentState.currentScreen.macos === 'lock') {
        macosDesktop.style.display = 'none';
        macosDesktop.classList.remove('active');
        macosLockScreen.style.display = 'flex';
        macosLockScreen.classList.add('active');
        lockBtn.classList.add('active');
        desktopBtn.classList.remove('active');
    } else {
        macosLockScreen.style.display = 'none';
        macosLockScreen.classList.remove('active');
        macosDesktop.style.display = 'flex';
        macosDesktop.classList.add('active');
        desktopBtn.classList.add('active');
        lockBtn.classList.remove('active');
    }
}

function applyMacOSSettings() {
    const dock = document.querySelector('#macos-section .macos-dock');
    const menuBar = document.querySelector('#macos-section .macos-menubar');
    const desktopIcons = document.querySelector('#macos-section .desktop-icons-macos');
    const widgets = document.querySelector('#macos-section .macos-widgets-container');
    
    if (dock) {
        dock.style.opacity = currentState.macosSettings.showDock ? '1' : '0';
        dock.style.pointerEvents = currentState.macosSettings.showDock ? 'auto' : 'none';
    }
    
    if (menuBar) {
        menuBar.style.opacity = currentState.macosSettings.showMenuBar ? '1' : '0';
        menuBar.style.pointerEvents = currentState.macosSettings.showMenuBar ? 'auto' : 'none';
    }
    
    if (desktopIcons) {
        desktopIcons.style.opacity = currentState.macosSettings.showDesktopIcons ? '1' : '0';
        desktopIcons.style.pointerEvents = currentState.macosSettings.showDesktopIcons ? 'auto' : 'none';
    }
    
    if (widgets) {
        widgets.style.opacity = currentState.macosSettings.showWidgets ? '1' : '0';
        widgets.style.pointerEvents = currentState.macosSettings.showWidgets ? 'auto' : 'none';
    }
}

function updateMacOSTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
    });
    
    // Update menu bar time
    const menuTime = document.querySelector('#macos-section .menu-time');
    if (menuTime) menuTime.textContent = timeStr;
    
    // Update widget time
    const widgetTime = document.querySelector('#macos-section .macos-time-large');
    const widgetDate = document.querySelector('#macos-section .macos-date');
    if (widgetTime) widgetTime.textContent = timeStr;
    if (widgetDate) widgetDate.textContent = dateStr;
    
    // Update lock screen time
    const lockTime = document.querySelector('#macos-section .macos-time-lockscreen');
    const lockDate = document.querySelector('#macos-section .macos-date-lockscreen');
    if (lockTime) lockTime.textContent = timeStr;
    if (lockDate) lockDate.textContent = dateStr;
}

// ============================================
// WINDOWS SECTION
// ============================================
function initializeWindows() {
    console.log('🪟 Initializing Windows section...');
    
    // Set up Windows screen switching with animations
    const windowsScreenBtns = document.querySelectorAll('#windows-section .screen-btn');
    const windowsLockScreen = document.querySelector('#windows-section .windows-lockscreen');
    const windowsDesktop = document.querySelector('#windows-section .windows-desktop');
    
    windowsScreenBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const screenType = e.currentTarget.dataset.screen;
            
            windowsScreenBtns.forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            
            switchWindowsScreen(screenType);
            currentState.currentScreen.windows = screenType;
            showToast(`Switched to ${screenType === 'lock' ? 'Lock Screen' : 'Desktop'}`, 'info');
        });
    });
    
    // Click anywhere on lock screen to unlock
    if (windowsLockScreen) {
        windowsLockScreen.addEventListener('click', (e) => {
            if (windowsLockScreen.classList.contains('active') && 
                !e.target.closest('.windows-widget') && 
                !e.target.closest('.screen-switcher')) {
                const desktopBtn = document.querySelector('#windows-section .screen-btn[data-screen="desktop"]');
                if (desktopBtn) {
                    desktopBtn.click();
                }
            }
        });
    }
    
    // Desktop icon hover and click effects
    const desktopIcons = document.querySelectorAll('#windows-section .desktop-icon');
    desktopIcons.forEach(icon => {
        icon.addEventListener('mouseenter', () => {
            icon.style.transform = 'scale(1.05)';
            icon.style.transition = 'transform 0.2s ease';
            icon.style.zIndex = '10';
        });
        
        icon.addEventListener('mouseleave', () => {
            icon.style.transform = 'scale(1)';
            icon.style.zIndex = '5';
        });
        
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            desktopIcons.forEach(i => i.classList.remove('selected'));
            icon.classList.add('selected');
            
            icon.style.animation = 'iconClick 0.3s ease';
            setTimeout(() => {
                icon.style.animation = '';
            }, 300);
        });
    });
    
    // Taskbar app hover and click effects
    const taskbarApps = document.querySelectorAll('#windows-section .taskbar-app');
    taskbarApps.forEach(app => {
        app.addEventListener('mouseenter', () => {
            app.style.transform = 'translateY(-3px)';
            app.style.transition = 'transform 0.2s ease';
        });
        
        app.addEventListener('mouseleave', () => {
            app.style.transform = 'translateY(0)';
        });
        
        app.addEventListener('click', (e) => {
            e.stopPropagation();
            taskbarApps.forEach(a => a.classList.remove('active'));
            app.classList.add('active');
            
            const appName = app.getAttribute('title');
            showToast(`Opened ${appName}`, 'info');
            
            app.style.animation = 'taskbarClick 0.3s ease';
            setTimeout(() => {
                app.style.animation = '';
            }, 300);
        });
    });
    
    // Layout controls
    const layoutOptions = document.querySelectorAll('#windows-section .layout-option');
    layoutOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            layoutOptions.forEach(o => o.classList.remove('active'));
            option.classList.add('active');
            
            const layout = option.dataset.layout;
            applyWindowsLayout(layout);
            showToast(`Layout changed to ${layout}`, 'info');
        });
    });
    
    // Icon size control
    const iconSizeSlider = document.getElementById('icon-size');
    const iconSizeValue = document.getElementById('icon-size-value');
    
    if (iconSizeSlider && iconSizeValue) {
        iconSizeSlider.value = 2;
        iconSizeSlider.addEventListener('input', (e) => {
            const size = parseInt(e.target.value);
            let sizeText = 'Small';
            let scale = 0.9;
            
            if (size === 2) {
                sizeText = 'Medium';
                scale = 1;
            } else if (size === 3) {
                sizeText = 'Large';
                scale = 1.1;
            }
            
            iconSizeValue.textContent = sizeText;
            applyWindowsIconSize(scale);
        });
    }
    
    // Toggle controls
    const toggleIcons = document.getElementById('toggle-icons');
    const toggleWidgets = document.getElementById('toggle-widgets');
    const toggleTaskbar = document.getElementById('toggle-taskbar');
    
    if (toggleIcons) {
        toggleIcons.checked = true;
        toggleIcons.addEventListener('change', () => {
            const desktopIcons = document.querySelector('#windows-section .desktop-icons');
            if (desktopIcons) {
                desktopIcons.style.opacity = toggleIcons.checked ? '1' : '0';
                desktopIcons.style.pointerEvents = toggleIcons.checked ? 'auto' : 'none';
                showToast(`Desktop icons ${toggleIcons.checked ? 'shown' : 'hidden'}`, 'info');
            }
        });
    }
    
    if (toggleWidgets) {
        toggleWidgets.checked = true;
        toggleWidgets.addEventListener('change', () => {
            const desktopWidgets = document.querySelector('#windows-section .desktop-widgets');
            if (desktopWidgets) {
                desktopWidgets.style.opacity = toggleWidgets.checked ? '1' : '0';
                desktopWidgets.style.pointerEvents = toggleWidgets.checked ? 'auto' : 'none';
                showToast(`Widgets ${toggleWidgets.checked ? 'shown' : 'hidden'}`, 'info');
            }
        });
    }
    
    if (toggleTaskbar) {
        toggleTaskbar.checked = true;
        toggleTaskbar.addEventListener('change', () => {
            const taskbar = document.querySelector('#windows-section .windows-taskbar');
            if (taskbar) {
                taskbar.style.opacity = toggleTaskbar.checked ? '1' : '0';
                taskbar.style.pointerEvents = toggleTaskbar.checked ? 'auto' : 'none';
                showToast(`Taskbar ${toggleTaskbar.checked ? 'shown' : 'hidden'}`, 'info');
            }
        });
    }
    
    // Update Windows time in real-time
    updateWindowsTime();
    setInterval(updateWindowsTime, 60000);
    
    // Ensure initial screen state is correct
    ensureWindowsScreenState();
}

function switchWindowsScreen(screenType) {
    const windowsLockScreen = document.querySelector('#windows-section .windows-lockscreen');
    const windowsDesktop = document.querySelector('#windows-section .windows-desktop');
    
    if (!windowsLockScreen || !windowsDesktop) return;
    
    if (screenType === 'lock') {
        if (windowsDesktop.classList.contains('active')) {
            windowsDesktop.classList.remove('active');
            windowsDesktop.classList.add('slide-out');
            
            setTimeout(() => {
                windowsDesktop.classList.remove('slide-out');
                windowsDesktop.style.display = 'none';
                windowsLockScreen.style.display = 'flex';
                windowsLockScreen.classList.add('slide-in');
                
                setTimeout(() => {
                    windowsLockScreen.classList.remove('slide-in');
                    windowsLockScreen.classList.add('active');
                }, 500);
            }, 500);
        }
    } else if (screenType === 'desktop') {
        if (windowsLockScreen.classList.contains('active')) {
            windowsLockScreen.classList.remove('active');
            windowsLockScreen.classList.add('slide-out');
            
            setTimeout(() => {
                windowsLockScreen.classList.remove('slide-out');
                windowsLockScreen.style.display = 'none';
                windowsDesktop.style.display = 'block';
                windowsDesktop.classList.add('slide-in');
                
                setTimeout(() => {
                    windowsDesktop.classList.remove('slide-in');
                    windowsDesktop.classList.add('active');
                }, 500);
            }, 500);
        }
    }
}

function ensureWindowsScreenState() {
    const windowsLockScreen = document.querySelector('#windows-section .windows-lockscreen');
    const windowsDesktop = document.querySelector('#windows-section .windows-desktop');
    const lockBtn = document.querySelector('#windows-section .screen-btn[data-screen="lock"]');
    const desktopBtn = document.querySelector('#windows-section .screen-btn[data-screen="desktop"]');
    
    if (!windowsLockScreen || !windowsDesktop || !lockBtn || !desktopBtn) return;
    
    if (currentState.currentScreen.windows === 'desktop') {
        windowsLockScreen.style.display = 'none';
        windowsLockScreen.classList.remove('active');
        windowsDesktop.style.display = 'block';
        windowsDesktop.classList.add('active');
        lockBtn.classList.remove('active');
        desktopBtn.classList.add('active');
    } else {
        windowsLockScreen.style.display = 'flex';
        windowsLockScreen.classList.add('active');
        windowsDesktop.style.display = 'none';
        windowsDesktop.classList.remove('active');
        lockBtn.classList.add('active');
        desktopBtn.classList.remove('active');
    }
}

function applyWindowsLayout(layout) {
    const desktopIcons = document.querySelector('#windows-section .desktop-icons');
    if (!desktopIcons) return;
    
    desktopIcons.classList.remove('layout-grid', 'layout-auto', 'layout-align');
    
    switch(layout) {
        case 'grid':
            desktopIcons.classList.add('layout-grid');
            desktopIcons.style.display = 'flex';
            desktopIcons.style.flexWrap = 'wrap';
            desktopIcons.style.gap = '20px';
            desktopIcons.style.justifyContent = 'flex-start';
            break;
        case 'auto':
            desktopIcons.classList.add('layout-auto');
            desktopIcons.style.display = 'grid';
            desktopIcons.style.gridTemplateColumns = 'repeat(auto-fill, minmax(80px, 1fr))';
            desktopIcons.style.gap = '15px';
            break;
        case 'align':
            desktopIcons.classList.add('layout-align');
            desktopIcons.style.display = 'grid';
            desktopIcons.style.gridTemplateColumns = 'repeat(6, 1fr)';
            desktopIcons.style.gap = '15px';
            break;
    }
}

function applyWindowsIconSize(scale) {
    const desktopIcons = document.querySelectorAll('#windows-section .desktop-icon');
    const iconWrappers = document.querySelectorAll('#windows-section .icon-wrapper');
    
    desktopIcons.forEach(icon => {
        icon.style.transform = `scale(${scale})`;
        icon.style.transition = 'transform 0.3s ease';
    });
    
    iconWrappers.forEach(wrapper => {
        const baseSize = 48;
        const newSize = baseSize * scale;
        wrapper.style.width = `${newSize}px`;
        wrapper.style.height = `${newSize}px`;
        wrapper.style.fontSize = `${20 * scale}px`;
        wrapper.style.transition = 'all 0.3s ease';
    });
}

function updateWindowsTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
    });
    
    // Update lock screen time
    const windowsClock = document.querySelector('#windows-section .windows-clock');
    const windowsDate = document.querySelector('#windows-section .windows-date');
    
    if (windowsClock) windowsClock.textContent = timeStr;
    if (windowsDate) windowsDate.textContent = dateStr;
    
    // Update taskbar time
    const taskbarTime = document.querySelector('#windows-section .time-display .time');
    const taskbarDate = document.querySelector('#windows-section .time-display .date');
    
    const shortDateStr = now.toLocaleDateString('en-GB', { 
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).replace(/\//g, '/');
    
    if (taskbarTime) taskbarTime.textContent = timeStr;
    if (taskbarDate) taskbarDate.textContent = shortDateStr;
}

// ============================================
// UPLOAD SYSTEM
// ============================================
function initializeUploads() {
    console.log('📤 Initializing Upload System...');
    
    // Upload Type Switching (Image/Video) for all platforms
    document.addEventListener('click', (e) => {
        const uploadTypeBtn = e.target.closest('.upload-type');
        if (uploadTypeBtn) {
            const type = uploadTypeBtn.dataset.type;
            const container = uploadTypeBtn.closest('.control-content');
            
            uploadTypeBtn.parentElement.querySelectorAll('.upload-type').forEach(b => {
                b.classList.remove('active');
            });
            uploadTypeBtn.classList.add('active');
            
            if (container) {
                container.querySelectorAll('.upload-area').forEach(area => {
                    area.classList.add('hidden');
                });
                
                const targetArea = container.querySelector(`[id*="${type}"]`);
                if (targetArea) {
                    targetArea.classList.remove('hidden');
                }
            }
        }
    });
    
    // File Input Changes for all platforms
    document.querySelectorAll('input[type="file"]').forEach(input => {
        input.addEventListener('change', handleFileUpload);
    });
    
    // Drag & Drop for all upload areas
    document.querySelectorAll('.upload-area').forEach(area => {
        area.addEventListener('dragover', (e) => {
            e.preventDefault();
            area.style.borderColor = 'var(--primary-pink)';
            area.style.background = 'rgba(255, 105, 180, 0.1)';
        });
        
        area.addEventListener('dragleave', () => {
            area.style.borderColor = '';
            area.style.background = '';
        });
        
        area.addEventListener('drop', (e) => {
            e.preventDefault();
            area.style.borderColor = '';
            area.style.background = '';
            
            if (e.dataTransfer.files.length > 0) {
                const file = e.dataTransfer.files[0];
                const input = area.querySelector('input[type="file"]');
                
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                input.files = dataTransfer.files;
                
                const event = new Event('change', { bubbles: true });
                input.dispatchEvent(event);
            }
        });
        
        area.addEventListener('click', (e) => {
            if (!e.target.matches('input[type="file"]')) {
                const input = area.querySelector('input[type="file"]');
                if (input) input.click();
            }
        });
    });
}

function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const validation = validateFile(file);
    if (!validation.valid) {
        showToast(validation.message, 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
        const platform = getPlatformFromElement(e.target);
        const isImage = file.type.startsWith('image/');
        const type = isImage ? 'image' : 'video';
        
        console.log(`Uploading ${type} to ${platform}:`, file.name);
        
        currentState.uploads[platform][type] = {
            data: event.target.result,
            name: file.name,
            type: file.type
        };
        
        updateWallpaper(platform, event.target.result, type);
        updateUploadUI(e.target, file.name);
        addToRecentWallpapers(event.target.result, file.type, platform, file.name);
        
        showToast(`"${file.name}" uploaded to ${platform.toUpperCase()}`, 'success');
    };
    
    reader.readAsDataURL(file);
}

function validateFile(file) {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
        return { valid: false, message: 'Please upload only images or videos' };
    }
    
    const maxSize = isImage ? CONFIG.maxFileSize.image : CONFIG.maxFileSize.video;
    if (file.size > maxSize) {
        const sizeMB = (maxSize / (1024 * 1024)).toFixed(0);
        return { valid: false, message: `File too large. Max size: ${sizeMB}MB` };
    }
    
    return { valid: true, message: 'File is valid' };
}

function getPlatformFromElement(element) {
    const id = element.id.toLowerCase();
    if (id.includes('ios')) return 'ios';
    if (id.includes('android')) return 'android';
    if (id.includes('windows')) return 'windows';
    if (id.includes('macos')) return 'macos';
    return currentState.currentPlatform;
}

function getWallpaperElement(platform) {
    switch(platform) {
        case 'ios': return document.getElementById('ios-wallpaper');
        case 'android': return document.getElementById('android-wallpaper');
        case 'windows': return document.getElementById('windows-wallpaper');
        case 'macos': return document.getElementById('macos-wallpaper');
        default: return null;
    }
}

function updateUploadUI(inputElement, fileName) {
    const uploadArea = inputElement.closest('.upload-area');
    if (!uploadArea) return;
    
    const icon = uploadArea.querySelector('.upload-icon i');
    const text = uploadArea.querySelector('p');
    const span = uploadArea.querySelector('span');
    
    if (icon) {
        icon.className = 'fas fa-check-circle';
        icon.style.color = 'var(--primary-pink)';
    }
    
    if (text) {
        text.textContent = fileName.length > 20 ? fileName.substring(0, 20) + '...' : fileName;
        text.style.color = 'var(--primary-pink)';
        text.style.fontWeight = '600';
    }
    
    if (span) {
        span.textContent = 'Upload successful!';
        span.style.color = 'var(--primary-pink)';
    }
    
    setTimeout(() => {
        if (icon) {
            const isImage = inputElement.accept.includes('image');
            icon.className = isImage ? 'fas fa-image' : 'fas fa-video';
            icon.style.color = '';
        }
        if (text) {
            const isImage = inputElement.accept.includes('image');
            text.textContent = isImage 
                ? 'Drag & drop or click to upload image' 
                : 'Drag & drop or click to upload video';
            text.style.color = '';
            text.style.fontWeight = '';
        }
        if (span) {
            const isImage = inputElement.accept.includes('image');
            span.textContent = isImage ? 'JPG, PNG up to 10MB' : 'MP4, WebM up to 50MB';
            span.style.color = '';
        }
    }, 3000);
}

// ============================================
// WALLPAPER MANAGEMENT
// ============================================
function updateWallpaper(platform, data, type) {
    console.log(`Updating wallpaper for ${platform} (${type})`);
    
    const wallpaperElement = getWallpaperElement(platform);
    if (!wallpaperElement) {
        console.error(`Wallpaper element not found for ${platform}`);
        return;
    }
    
    currentState.currentWallpaper[platform] = data;
    wallpaperElement.style.opacity = '0.5';
    
    setTimeout(() => {
        if (type === 'image') {
            wallpaperElement.style.backgroundImage = `url(${data})`;
            wallpaperElement.style.backgroundSize = 'cover';
            wallpaperElement.style.backgroundPosition = 'center';
            wallpaperElement.style.backgroundRepeat = 'no-repeat';
            wallpaperElement.innerHTML = '';
            wallpaperElement.style.objectFit = '';
        } else if (type === 'video') {
            wallpaperElement.innerHTML = `
                <video autoplay muted loop playsinline 
                    style="width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0;">
                    <source src="${data}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            `;
            wallpaperElement.style.backgroundImage = '';
        }
        
        wallpaperElement.style.opacity = '1';
        applyFilters(platform);
        
        console.log(`✅ Wallpaper updated for ${platform}`);
    }, 300);
}

// ============================================
// CONTROLS & FILTERS
// ============================================
function initializeControls() {
    console.log('🎛️ Initializing Controls...');
    
    // Apply Buttons for all platforms
    document.querySelectorAll('#ios-apply, #android-apply, #windows-apply, #macos-apply').forEach(btn => {
        btn.addEventListener('click', () => {
            const platform = getPlatformFromButton(btn);
            
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Applied!';
            btn.style.background = '#34C759';
            btn.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.background = '';
                btn.style.transform = '';
            }, 2000);
            
            showToast(`Wallpaper applied to ${platform.toUpperCase()}!`, 'success');
        });
    });
    
    // Reset Buttons for all platforms
    document.querySelectorAll('#ios-reset, #android-reset, #windows-reset, #macos-reset').forEach(btn => {
        btn.addEventListener('click', () => {
            const platform = getPlatformFromButton(btn);
            resetWallpaper(platform);
        });
    });
    
    // Filter Sliders for all platforms
    document.querySelectorAll('input[type="range"]').forEach(slider => {
        if (slider.id === 'icon-size' || slider.id === 'dock-size') return;
        
        slider.addEventListener('input', (e) => {
            const platform = getPlatformFromElement(e.target);
            let filterType = 'brightness';
            if (e.target.id.includes('contrast')) filterType = 'contrast';
            if (e.target.id.includes('blur')) filterType = 'blur';
            
            const value = e.target.value;
            
            if (currentState.filters[platform]) {
                currentState.filters[platform][filterType] = parseInt(value);
            }
            
            const valueElement = document.getElementById(`${platform}-${filterType}-value`);
            if (valueElement) {
                valueElement.textContent = filterType === 'blur' ? `${value}px` : `${value}%`;
            }
            
            applyFilters(platform);
        });
    });
    
    // Color Presets
    document.querySelectorAll('.color-option').forEach(preset => {
        preset.addEventListener('click', () => {
            const color = preset.dataset.color || getComputedStyle(preset).background;
            const platform = currentState.currentPlatform;
            
            const wallpaper = getWallpaperElement(platform);
            if (wallpaper) {
                const currentBg = wallpaper.style.background;
                wallpaper.style.background = `linear-gradient(45deg, ${color}40, ${color}60), ${currentBg}`;
                
                preset.style.transform = 'scale(0.9)';
                setTimeout(() => preset.style.transform = '', 200);
                
                showToast('Color overlay applied', 'info');
            }
        });
    });
}

function getPlatformFromButton(button) {
    const id = button.id.toLowerCase();
    if (id.includes('ios')) return 'ios';
    if (id.includes('android')) return 'android';
    if (id.includes('windows')) return 'windows';
    if (id.includes('macos')) return 'macos';
    return currentState.currentPlatform;
}

function applyFilters(platform) {
    const wallpaper = getWallpaperElement(platform);
    if (!wallpaper || !currentState.filters[platform]) return;
    
    const filters = currentState.filters[platform];
    wallpaper.style.filter = `
        brightness(${filters.brightness}%)
        contrast(${filters.contrast}%)
        blur(${filters.blur}px)
    `;
    
    const video = wallpaper.querySelector('video');
    if (video) {
        video.style.filter = `
            brightness(${filters.brightness}%)
            contrast(${filters.contrast}%)
            blur(${filters.blur}px)
        `;
    }
}

function resetWallpaper(platform) {
    // Reset uploads
    currentState.uploads[platform] = { image: null, video: null };
    currentState.currentWallpaper[platform] = CONFIG.defaultWallpaper;
    
    // Reset filters
    currentState.filters[platform] = { brightness: 100, contrast: 100, blur: 0 };
    
    // Update UI
    const wallpaper = getWallpaperElement(platform);
    if (wallpaper) {
        wallpaper.style.background = CONFIG.defaultWallpaper;
        wallpaper.innerHTML = '';
        wallpaper.style.filter = 'none';
        wallpaper.style.backgroundSize = 'cover';
        wallpaper.style.backgroundPosition = 'center';
    }
    
    // Reset sliders
    document.querySelectorAll(`#${platform}-brightness, #${platform}-contrast, #${platform}-blur`).forEach(slider => {
        if (slider) {
            if (slider.id.includes('blur')) {
                slider.value = 0;
            } else {
                slider.value = 100;
            }
        }
    });
    
    // Reset value displays
    const brightnessValue = document.getElementById(`${platform}-brightness-value`);
    const contrastValue = document.getElementById(`${platform}-contrast-value`);
    const blurValue = document.getElementById(`${platform}-blur-value`);
    
    if (brightnessValue) brightnessValue.textContent = '100%';
    if (contrastValue) contrastValue.textContent = '100%';
    if (blurValue) blurValue.textContent = '0px';
    
    // Reset macOS specific settings
    if (platform === 'macos') {
        currentState.macosSettings = {
            showDock: true,
            showMenuBar: true,
            showDesktopIcons: true,
            showWidgets: true
        };
        
        const toggleDock = document.getElementById('toggle-dock');
        const toggleMenuBar = document.getElementById('toggle-menubar');
        const toggleDesktopIcons = document.getElementById('toggle-desktop-icons');
        const toggleWidgetsMacOS = document.getElementById('toggle-widgets-macos');
        
        if (toggleDock) toggleDock.checked = true;
        if (toggleMenuBar) toggleMenuBar.checked = true;
        if (toggleDesktopIcons) toggleDesktopIcons.checked = true;
        if (toggleWidgetsMacOS) toggleWidgetsMacOS.checked = true;
        
        applyMacOSSettings();
        currentState.currentScreen.macos = 'lock';
        ensureMacOSScreenState();
    }
    
    // Reset Windows layout controls
    if (platform === 'windows') {
        const layoutOptions = document.querySelectorAll('#windows-section .layout-option');
        layoutOptions.forEach((option, index) => {
            if (index === 0) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
        
        const iconSizeSlider = document.getElementById('icon-size');
        const iconSizeValue = document.getElementById('icon-size-value');
        if (iconSizeSlider) iconSizeSlider.value = 2;
        if (iconSizeValue) iconSizeValue.textContent = 'Medium';
        
        applyWindowsLayout('grid');
        applyWindowsIconSize(1);
        
        const toggleIcons = document.getElementById('toggle-icons');
        const toggleWidgets = document.getElementById('toggle-widgets');
        const toggleTaskbar = document.getElementById('toggle-taskbar');
        
        if (toggleIcons) toggleIcons.checked = true;
        if (toggleWidgets) toggleWidgets.checked = true;
        if (toggleTaskbar) toggleTaskbar.checked = true;
        
        const desktopIcons = document.querySelector('#windows-section .desktop-icons');
        const desktopWidgets = document.querySelector('#windows-section .desktop-widgets');
        const taskbar = document.querySelector('#windows-section .windows-taskbar');
        
        if (desktopIcons) {
            desktopIcons.style.opacity = '1';
            desktopIcons.style.pointerEvents = 'auto';
        }
        if (desktopWidgets) {
            desktopWidgets.style.opacity = '1';
            desktopWidgets.style.pointerEvents = 'auto';
        }
        if (taskbar) {
            taskbar.style.opacity = '1';
            taskbar.style.pointerEvents = 'auto';
        }
    }
    
    showToast(`${platform.toUpperCase()} wallpaper reset`, 'info');
}

// ============================================
// APPS SYSTEM
// ============================================
function initializeApps(platform) {
    if (platform === 'windows') return; // Only exclude Windows
    
    if (!currentState.apps[platform] || currentState.apps[platform].length === 0) {
        currentState.apps[platform] = [...APPS_DATA[platform]];
    }
    
    renderApps(platform);
}

function renderApps(platform) {
    if (platform === 'windows') return; // Only exclude Windows
    
    const appGrid = document.querySelector(`#${platform}-app-grid`) || 
                    document.querySelector(`.${platform}-app-grid`);
    
    if (!appGrid) {
        console.log(`No app grid found for ${platform}`);
        return;
    }
    
    appGrid.innerHTML = '';
    
    currentState.apps[platform].forEach((app, index) => {
        const appElement = document.createElement('div');
        appElement.className = 'app-icon';
        appElement.innerHTML = `<i class="${app.icon}"></i>`;
        appElement.style.background = app.color;
        appElement.title = app.name;
        appElement.dataset.index = index;
        
        if (!appGrid.classList.contains('remove-mode')) {
            appElement.addEventListener('click', () => {
                appElement.style.transform = 'scale(0.8)';
                setTimeout(() => appElement.style.transform = '', 200);
            });
        }
        
        appGrid.appendChild(appElement);
    });
}

function setupAppControls(platform) {
    if (platform === 'windows') return; // Only exclude Windows
    
    const appsControlContainer = document.querySelector(`#${platform}-apps-control`);
    if (!appsControlContainer) {
        console.log(`No apps control container found for ${platform}`);
        return;
    }
    
    appsControlContainer.innerHTML = '';
    
    const header = document.createElement('div');
    header.className = 'apps-control-header';
    header.innerHTML = `
        <h4><i class="fas fa-th"></i> Customize Apps</h4>
        <button class="add-app-btn" id="${platform}-add-app">
            <i class="fas fa-plus"></i> Add App
        </button>
        <button class="remove-app-btn" id="${platform}-remove-mode">
            <i class="fas fa-trash"></i> Remove Mode
        </button>
    `;
    appsControlContainer.appendChild(header);
    
    const appsList = document.createElement('div');
    appsList.className = 'apps-list';
    appsControlContainer.appendChild(appsList);
    
    currentState.apps[platform].forEach((app, index) => {
        const appItem = document.createElement('div');
        appItem.className = 'app-control-item';
        appItem.innerHTML = `
            <div class="app-control-info">
                <div class="app-control-icon" style="background: ${app.color}">
                    <i class="${app.icon}"></i>
                </div>
                <span>${app.name}</span>
            </div>
            <button class="app-remove-btn" data-index="${index}">
                <i class="fas fa-times"></i>
            </button>
        `;
        appsList.appendChild(appItem);
    });
    
    document.getElementById(`${platform}-add-app`)?.addEventListener('click', () => {
        addNewApp(platform);
    });
    
    document.getElementById(`${platform}-remove-mode`)?.addEventListener('click', () => {
        toggleRemoveMode(platform);
    });
    
    appsList.querySelectorAll('.app-remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.closest('.app-remove-btn').dataset.index);
            removeApp(platform, index);
        });
    });
}

function addNewApp(platform) {
    const defaultApps = APPS_DATA[platform];
    const availableApps = defaultApps.filter(defaultApp => 
        !currentState.apps[platform].some(existingApp => existingApp.name === defaultApp.name)
    );
    
    if (availableApps.length === 0) {
        showToast('No more apps available to add', 'warning');
        return;
    }
    
    const randomApp = availableApps[Math.floor(Math.random() * availableApps.length)];
    currentState.apps[platform].push(randomApp);
    
    renderApps(platform);
    setupAppControls(platform);
    
    showToast(`Added ${randomApp.name}`, 'success');
}

function toggleRemoveMode(platform) {
    const appGrid = document.querySelector(`#${platform}-app-grid`);
    const removeBtn = document.getElementById(`${platform}-remove-mode`);
    
    if (!appGrid || !removeBtn) return;
    
    const isRemoving = appGrid.classList.toggle('remove-mode');
    
    if (isRemoving) {
        removeBtn.innerHTML = '<i class="fas fa-times"></i> Cancel';
        removeBtn.style.background = 'var(--error-red)';
        
        appGrid.querySelectorAll('.app-icon').forEach(icon => {
            icon.classList.add('removing');
            icon.style.animation = 'pulse 1s infinite';
            icon.addEventListener('click', handleAppRemoval);
        });
        
        showToast('Click any app to remove it', 'info');
    } else {
        removeBtn.innerHTML = '<i class="fas fa-trash"></i> Remove Mode';
        removeBtn.style.background = '';
        
        appGrid.querySelectorAll('.app-icon').forEach(icon => {
            icon.classList.remove('removing');
            icon.style.animation = '';
            icon.removeEventListener('click', handleAppRemoval);
        });
    }
}

function handleAppRemoval(e) {
    const appIcon = e.currentTarget;
    const platform = getPlatformFromElement(appIcon);
    const index = parseInt(appIcon.dataset.index);
    
    if (!isNaN(index)) {
        removeApp(platform, index);
    }
}

function removeApp(platform, index) {
    if (index < 0 || index >= currentState.apps[platform].length) return;
    
    const removedApp = currentState.apps[platform][index];
    currentState.apps[platform].splice(index, 1);
    
    renderApps(platform);
    setupAppControls(platform);
    
    const appGrid = document.querySelector(`#${platform}-app-grid`);
    const removeBtn = document.getElementById(`${platform}-remove-mode`);
    if (appGrid) {
        appGrid.classList.remove('remove-mode');
        appGrid.querySelectorAll('.app-icon').forEach(icon => {
            icon.removeEventListener('click', handleAppRemoval);
        });
    }
    
    if (removeBtn) {
        removeBtn.innerHTML = '<i class="fas fa-trash"></i> Remove Mode';
        removeBtn.style.background = '';
    }
    
    showToast(`Removed ${removedApp.name}`, 'info');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function showLoading(show) {
    if (!DOM.loadingOverlay) return;
    
    if (show) {
        DOM.loadingOverlay.classList.add('active');
    } else {
        DOM.loadingOverlay.classList.remove('active');
    }
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
    return container;
}

function showToast(message, type = 'info') {
    const container = DOM.toastContainer;
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        info: 'info-circle',
        warning: 'exclamation-triangle'
    };
    
    toast.innerHTML = `
        <i class="fas fa-${icons[type] || 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function initializeTime() {
    function updateTime() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const dateStr = now.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
        });
        
        document.querySelectorAll('.ios-time, .ios-status span').forEach(el => {
            el.textContent = timeStr;
        });
        
        document.querySelectorAll('.ios-date').forEach(el => {
            el.textContent = dateStr;
        });
        
        document.querySelectorAll('.android-time, .android-status span').forEach(el => {
            el.textContent = timeStr;
        });
        
        document.querySelectorAll('.android-date').forEach(el => {
            el.textContent = dateStr;
        });
    }
    
    updateTime();
    setInterval(updateTime, 60000);
}

// ============================================
// RECENT WALLPAPERS SYSTEM
// ============================================
function addToRecentWallpapers(data, fileType, platform, fileName) {
    console.log(`Adding to recent: ${fileName} (${fileType}) for ${platform}`);
    
    const isImage = fileType.includes('image');
    const isVideo = fileType.includes('video');
    
    if (!isImage && !isVideo) {
        console.error('Invalid file type:', fileType);
        return;
    }
    
    const recentItem = {
        data: data,
        type: fileType,
        platform: platform,
        fileName: fileName || 'Unnamed',
        timestamp: Date.now(),
        mediaType: isImage ? 'image' : 'video'
    };
    
    let recent = JSON.parse(localStorage.getItem('recentWallpapers') || '[]');
    
    recent = recent.filter(item => 
        !(item.data === data && item.platform === platform && item.mediaType === recentItem.mediaType)
    );
    
    recent.unshift(recentItem);
    
    const platformRecent = recent.filter(item => item.platform === platform);
    if (platformRecent.length > 6) {
        const toRemove = platformRecent.slice(6);
        recent = recent.filter(item => !toRemove.includes(item));
    }
    
    recent = recent.slice(0, 12);
    
    try {
        localStorage.setItem('recentWallpapers', JSON.stringify(recent));
    } catch (e) {
        console.error('Error saving to localStorage:', e);
        if (e.name === 'QuotaExceededError') {
            const platformCounts = {};
            recent = recent.filter(item => {
                platformCounts[item.platform] = (platformCounts[item.platform] || 0) + 1;
                return platformCounts[item.platform] <= 4;
            });
            localStorage.setItem('recentWallpapers', JSON.stringify(recent));
        }
    }
    
    updateRecentWallpapersUI();
}

function initializeRecentWallpapers() {
    updateRecentWallpapersUI();
}

function updateRecentWallpapersUI() {
    const recent = JSON.parse(localStorage.getItem('recentWallpapers') || '[]');
    
    CONFIG.platforms.forEach(platform => {
        const grid = document.querySelector(`#${platform}-recent-grid`);
        if (!grid) return;
        
        grid.innerHTML = '';
        
        const platformRecent = recent.filter(item => item.platform === platform);
        
        if (platformRecent.length === 0) {
            grid.innerHTML = `
                <div class="recent-placeholder">
                    <i class="fas fa-image"></i>
                    <span>No recent uploads</span>
                </div>
            `;
            return;
        }
        
        platformRecent.slice(0, 6).forEach((item) => {
            const element = document.createElement('div');
            element.className = 'recent-wallpaper';
            element.title = `${item.fileName} - Click to apply`;
            
            if (item.mediaType === 'image') {
                element.style.backgroundImage = `url(${item.data})`;
                element.style.backgroundSize = 'cover';
                element.style.backgroundPosition = 'center';
                element.style.backgroundColor = 'transparent';
            } else if (item.mediaType === 'video') {
                element.innerHTML = `
                    <video muted playsinline preload="metadata" 
                        style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;">
                        <source src="${item.data}" type="${item.type || 'video/mp4'}">
                    </video>
                    <div class="video-overlay"><i class="fas fa-play"></i></div>
                `;
            }
            
            element.addEventListener('click', () => {
                updateWallpaper(platform, item.data, item.mediaType);
                showToast(`Applied recent ${item.mediaType} to ${platform}`, 'success');
            });
            
            grid.appendChild(element);
        });
    });
}

// Export Theme Config
function exportThemeConfig() {
    const config = {
        theme: currentState.darkMode ? 'dark' : 'light',
        wallpapers: currentState.currentWallpaper,
        filters: currentState.filters,
        apps: currentState.apps,
        macosSettings: currentState.macosSettings,
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    };
    
    const jsonStr = JSON.stringify(config, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `theme-config-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Theme configuration exported!', 'success');
}

// Preview Modal
// ============================================
// LIVE PREVIEW SYSTEM (FIXED)
// ============================================
// ============================================
// LIVE PREVIEW SYSTEM (FIXED)
// ============================================
function createPreviewModal() {
    console.log('Creating live DOM preview...');
    
    // 1. Create Modal Structure
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    
    const content = document.createElement('div');
    content.className = 'modal-content glass-card preview-modal-content';
    
    const header = document.createElement('div');
    header.className = 'modal-header';
    header.innerHTML = `
        <h3><i class="fas fa-eye"></i> Live All-Platform Preview</h3>
        <button class="modal-close"><i class="fas fa-times"></i></button>
    `;

    const body = document.createElement('div');
    body.className = 'modal-body preview-layout';

    // 2. CLONE iOS (Force Lock Screen)
    const iosSource = document.querySelector('.ios-device');
    const iosClone = iosSource.cloneNode(true);
    // Force Lock Screen State
    iosClone.querySelector('.lock-screen').classList.add('active');
    iosClone.querySelector('.home-screen').classList.remove('active');
    // Fix video playback in clone
    const iosVideo = iosClone.querySelector('video');
    if (iosVideo) iosVideo.play();

    // 3. CLONE Windows (Force Desktop)
    const winSource = document.querySelector('.windows-frame');
    const winClone = winSource.cloneNode(true);
    // Force Desktop State
    winClone.querySelector('.windows-desktop').classList.add('active');
    winClone.querySelector('.windows-desktop').style.display = 'block'; // Ensure display
    winClone.querySelector('.windows-lockscreen').classList.remove('active');
    winClone.querySelector('.windows-lockscreen').style.display = 'none';
    // Fix video playback
    const winVideo = winClone.querySelector('video');
    if (winVideo) winVideo.play();

    // 4. CLONE macOS (Force Desktop)
    const macSource = document.querySelector('.macos-frame');
    const macClone = macSource.cloneNode(true);
    // Force Desktop State
    macClone.querySelector('.macos-desktop').classList.add('active');
    macClone.querySelector('.macos-desktop').style.display = 'flex'; // Ensure flex
    macClone.querySelector('.macos-lockscreen').classList.remove('active');
    macClone.querySelector('.macos-lockscreen').style.display = 'none';
    // Fix video playback
    const macVideo = macClone.querySelector('video');
    if (macVideo) macVideo.play();

    // 5. BUILD LAYOUT
    
    // Row 1: iOS (Only)
    const iosRow = document.createElement('div');
    iosRow.className = 'preview-row phones-row';
    
    const iosWrapper = document.createElement('div');
    iosWrapper.innerHTML = '<h4 class="preview-label"><i class="fab fa-apple"></i> iOS Lock Screen</h4>';
    iosWrapper.appendChild(iosClone);
    
    iosRow.appendChild(iosWrapper);

    // Row 2: Windows (Stacked)
    const winRow = document.createElement('div');
    winRow.className = 'preview-row desktop-row';
    winRow.innerHTML = '<h4 class="preview-label"><i class="fab fa-windows"></i> Windows Desktop</h4>';
    winRow.appendChild(winClone);

    // Row 3: macOS (Stacked)
    const macRow = document.createElement('div');
    macRow.className = 'preview-row desktop-row';
    macRow.innerHTML = '<h4 class="preview-label"><i class="fab fa-apple"></i> macOS Desktop</h4>';
    macRow.appendChild(macClone);

    // Append all to body
    body.appendChild(iosRow);
    body.appendChild(winRow);
    body.appendChild(macRow);

    // Footer
    const footer = document.createElement('div');
    footer.className = 'modal-footer';
    footer.innerHTML = `<button class="modal-btn secondary" id="close-preview-btn">Close Preview</button>`;

    // Assemble Modal
    content.appendChild(header);
    content.appendChild(body);
    content.appendChild(footer);
    modal.appendChild(content);
    document.body.appendChild(modal);

    // Event Listeners for Closing
    const closeFunc = () => {
        modal.classList.add('fade-out');
        setTimeout(() => modal.remove(), 300);
    };
    
    modal.querySelector('.modal-close').addEventListener('click', closeFunc);
    modal.querySelector('#close-preview-btn').addEventListener('click', closeFunc);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeFunc();
    });

    showToast('Generated Live Preview', 'success');
}

// ============================================
// EXPORT FOR DEBUGGING
// ============================================
window.appDebug = {
    state: currentState,
    config: CONFIG,
    showToast,
    resetAll: () => {
        CONFIG.platforms.forEach(platform => resetWallpaper(platform));
        showToast('All platforms reset', 'info');
    },
    exportState: () => JSON.stringify(currentState, null, 2),
    testWallpaper: (platform = 'ios') => {
        const testImage = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=1600&fit=crop';
        updateWallpaper(platform, testImage, 'image');
        showToast(`Test wallpaper applied to ${platform.toUpperCase()}!`, 'success');
    },
    clearRecent: () => {
        localStorage.removeItem('recentWallpapers');
        updateRecentWallpapersUI();
        showToast('Recent wallpapers cleared', 'info');
    }
};

console.log('🎉 Theme Customizer is now fully functional!');
console.log('Type "appDebug.testWallpaper(\'ios\')" in console to test wallpaper on iOS');
// ============================================
// WORKING DOWNLOAD SOLUTION
// ============================================

// Load html2canvas if not already loaded
if (typeof html2canvas === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    document.head.appendChild(script);
}

// Setup download button when ready
function setupDownload() {
    const downloadBtn = document.getElementById('export-theme');
    if (!downloadBtn) {
        setTimeout(setupDownload, 500);
        return;
    }
    
    // Replace button to clear old listeners
    const newBtn = downloadBtn.cloneNode(true);
    downloadBtn.parentNode.replaceChild(newBtn, downloadBtn);
    
    newBtn.onclick = async function(e) {
        e.preventDefault();
        
        // Get current platform
        const activeNav = document.querySelector('.nav-item.active');
        if (!activeNav || activeNav.dataset.section === 'home') {
            showToast('Select a platform first', 'info');
            return;
        }
        
        const platform = activeNav.dataset.section;
        
        // Get the right element to capture
        let element;
        if (platform === 'ios') element = document.querySelector('.ios-device');
        else if (platform === 'android') element = document.querySelector('.android-device');
        else if (platform === 'windows') element = document.querySelector('.windows-frame');
        else if (platform === 'macos') element = document.querySelector('.macos-frame');
        
        if (!element) {
            showToast('Preview not found', 'error');
            return;
        }
        
        // Show downloading message
        showToast('Capturing preview...', 'info');
        
        try {
            // Capture the ACTUAL element
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: null,
                logging: false,
                onclone: function(clonedDoc, originalElement) {
                    // Make sure videos are visible in the clone
                    const videos = clonedDoc.querySelectorAll('video');
                    videos.forEach(video => {
                        video.muted = true;
                        video.play();
                    });
                }
            });
            
            // Download the image
            const link = document.createElement('a');
            link.download = `theme-${platform}-preview.png`;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showToast('Preview downloaded!', 'success');
            
        } catch (error) {
            console.error('Capture failed:', error);
            showToast('Capture failed. Try again.', 'error');
        }
    };
}

// Start setup
setTimeout(setupDownload, 1000);
// ============================================
// DRAGON ANIMATION BUTTON
// ============================================

// FORCE LOGIC FOR DRAGON REDIRECT
document.addEventListener('DOMContentLoaded', function() {
    const dragonBtn = document.getElementById('dragon-animation');
    const overlay = document.getElementById('loading-overlay');
    const tipText = document.getElementById('loading-tip');
    
    if (dragonBtn && overlay) {
        dragonBtn.onclick = function(e) {
            e.preventDefault();
            
            // 1. Force add the active class
            overlay.classList.add('active-force');
            
            // 2. Fading Text Sequence
            const tips = [
                "You can click back anytime to go back",
                "Move your cursor to play"
            ];
            
            // Initial Text
            tipText.textContent = "Loading Dragon World...";
            
            // At 3 seconds
            setTimeout(() => {
                tipText.style.opacity = '0';
                setTimeout(() => {
                    tipText.textContent = tips[0];
                    tipText.style.opacity = '1';
                }, 500);
            }, 3000);

            // At 6 seconds
            setTimeout(() => {
                tipText.style.opacity = '0';
                setTimeout(() => {
                    tipText.textContent = tips[1];
                    tipText.style.opacity = '1';
                }, 500);
            }, 6000);

            // 3. Force redirect at 8 seconds
            setTimeout(() => {
                window.location.href = 'dragon.html';
            }, 8000);
        };
    }
});

window.addEventListener('load', function() {
    const startup = document.getElementById('startup-loader');
    setTimeout(() => {
        startup.style.opacity = '0';
        setTimeout(() => {
            startup.style.visibility = 'hidden';
        }, 800);
    }, 5000); // Stays for 2 seconds so people can see the animation
});
const TOUR_STEPS = [
    {
        title: "Welcome to ThemeGlass",
        description: "This is your main dashboard where you can select platforms.",
        image: "guide/guide1.jpeg" 
    },
    {
        title: "Customize Wallpapers",
        description: "Upload images or videos to see them live on any device.",
        image: "guide/guide2.jpeg"
    },
    {
        title: "Customize Platform Style",
        description: "Adjust according to your own prefered preview style",
        image: "guide/guide3.jpeg"
    },
    {
        title: "Quick Download Preview",
        description: "Download live preview with low opacity for better view",
        image: "guide/guide4.jpeg"
    }
];

let currentTourIndex = 0;

function initTourGuide() {
    const overlay = document.getElementById('tour-overlay');
    if (!overlay) return;

    if (!localStorage.getItem('hasSeenTour')) {
        overlay.classList.remove('hidden');
        renderTourStep();
    }

    document.getElementById('tour-next').addEventListener('click', () => {
        if (currentTourIndex < TOUR_STEPS.length - 1) {
            currentTourIndex++;
            renderTourStep();
        } else {
            closeTourGuide();
        }
    });

    document.getElementById('tour-prev').addEventListener('click', () => {
        if (currentTourIndex > 0) {
            currentTourIndex--;
            renderTourStep();
        }
    });

    document.getElementById('close-tour').addEventListener('click', closeTourGuide);
}

function renderTourStep() {
    const step = TOUR_STEPS[currentTourIndex];
    document.getElementById('tour-title').textContent = step.title;
    document.getElementById('tour-description').textContent = step.description;
    document.getElementById('tour-image').src = step.image;
    document.getElementById('tour-progress').textContent = `${currentTourIndex + 1} / ${TOUR_STEPS.length}`;

    const prevBtn = document.getElementById('tour-prev');
    prevBtn.style.display = currentTourIndex === 0 ? 'none' : 'inline-block';

    const nextBtn = document.getElementById('tour-next');
    nextBtn.textContent = currentTourIndex === TOUR_STEPS.length - 1 ? 'Done' : 'Next';
}

function closeTourGuide() {
    document.getElementById('tour-overlay').classList.add('hidden');
    localStorage.setItem('hasSeenTour', 'true');
}

window.addEventListener('load', () => {
    setTimeout(initTourGuide, 2500); 
});
// Add this inside your window load or DOMContentLoaded function
document.getElementById('reopen-tour-btn').addEventListener('click', function() {
    currentTourIndex = 0; // Reset to start
    const overlay = document.getElementById('tour-overlay');
    
    if (overlay) {
        overlay.classList.remove('hidden');
        renderTourStep(); // Refresh the content to Step 1
    }
});
document.addEventListener('DOMContentLoaded', function() {
    const toggleCard = document.getElementById('toggle-view-card');
    const toggleText = document.getElementById('toggle-text');
    const toggleIcon = document.getElementById('toggle-icon');
    const viewport = document.querySelector("meta[name=viewport]");
    
    // Detection: Only show for Android users
    const isAndroid = /Android/i.test(navigator.userAgent);

    if (isAndroid && toggleCard) {
        toggleCard.style.display = 'flex'; // Make it visible
        
        let isWindowsMode = false;

        toggleCard.addEventListener('click', function() {
            // Start the 'Stacking' transition animation
            document.body.classList.add('transitioning');

            // Wait a moment for the animation to cover the screen before swapping
            setTimeout(() => {
                if (!isWindowsMode) {
                    // ACTION: ZOOM OUT TO WINDOWS VIEW
                    const zoomScale = window.screen.width / 1200;
                    viewport.setAttribute('content', `width=1200, initial-scale=${zoomScale}, maximum-scale=1.0`);
                    
                    toggleText.textContent = "Change to Android View";
                    toggleIcon.className = "fas fa-mobile-alt";
                    document.body.classList.add('forced-desktop');
                    isWindowsMode = true;
                } else {
                    // ACTION: RESET TO DEFAULT ANDROID VIEW
                    viewport.setAttribute('content', "width=device-width, initial-scale=1.0");
                    
                    toggleText.textContent = "Change to Windows View";
                    toggleIcon.className = "fas fa-layer-group";
                    document.body.classList.remove('forced-desktop');
                    isWindowsMode = false;
                }
                
                // Clean up animation class
                setTimeout(() => {
                    document.body.classList.remove('transitioning');
                }, 500);
            }, 300); 
        });
    }
});
