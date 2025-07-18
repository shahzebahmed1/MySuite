// DOM Elements
const navbar = document.getElementById('modernNavbar');
const navPill = document.getElementById('navPill');
const ctaPill = document.getElementById('ctaPill');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

// Show navbar on load and apply scrolled class immediately
window.addEventListener('load', () => {
    navbar.classList.add('loaded');
    // Apply scrolled class immediately to keep navbar visible
    navPill.classList.add('scrolled');
    ctaPill.classList.add('scrolled');
});

// Navbar scroll effect - keep scrolled class always applied
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // Keep scrolled class always applied for consistent visibility
    navPill.classList.add('scrolled');
    ctaPill.classList.add('scrolled');
    
    lastScroll = currentScroll;
});

// Mobile menu toggle
mobileMenuBtn.addEventListener('click', () => {
    mobileMenuBtn.classList.toggle('active');
    mobileMenuOverlay.classList.toggle('active');
    document.body.style.overflow = mobileMenuOverlay.classList.contains('active') ? 'hidden' : '';
});

// Close mobile menu when clicking outside
mobileMenuOverlay.addEventListener('click', (e) => {
    if (e.target === mobileMenuOverlay) {
        mobileMenuBtn.classList.remove('active');
        mobileMenuOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Smooth scrolling for navigation links
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Close mobile menu if open
        mobileMenuBtn.classList.remove('active');
        mobileMenuOverlay.classList.remove('active');
        document.body.style.overflow = '';
        
        // Get target section
        const targetId = link.getAttribute('href');
        if (targetId && targetId !== '#') {
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 100; // Offset for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// Animate mobile menu links when menu opens
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
const mobileCTAButton = document.querySelector('.mobile-cta-button');

const animateMobileMenu = () => {
    if (mobileMenuOverlay.classList.contains('active')) {
        mobileNavLinks.forEach((link, index) => {
            setTimeout(() => {
                link.style.animation = 'slideInRight 0.3s ease forwards';
            }, index * 50);
        });
        
        setTimeout(() => {
            if (mobileCTAButton) {
                mobileCTAButton.style.opacity = '1';
                mobileCTAButton.style.transform = 'translateY(0)';
            }
        }, mobileNavLinks.length * 50 + 100);
    }
};

// Observe mobile menu state changes
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
            animateMobileMenu();
        }
    });
});

observer.observe(mobileMenuOverlay, { attributes: true });

// Handle contact form submission
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);
        
        // Here you would normally send the data to a server
        console.log('Form submitted:', data);
        
        // Show success message (you can customize this)
        alert('Thank you for your message! We will get back to you soon.');
        
        // Reset form
        contactForm.reset();
    });
}

// Add active state to current section's nav link
const sections = document.querySelectorAll('section[id]');
const navLinksDesktop = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinksDesktop.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Prevent video right-click context menu
const video = document.querySelector('.video-background video');
if (video) {
    video.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
}

// Initialize AOS (Animate On Scroll) if needed
// You can add scroll animations here

console.log('Point on the Bow - Scripts loaded successfully'); 