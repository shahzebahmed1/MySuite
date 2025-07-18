# Modern Navigation Bar

A beautiful, responsive navigation bar with glass-morphism effect and smooth animations, built with vanilla HTML, CSS, and JavaScript.

## ✨ Features

### 🎨 Visual Design
- **Glass Morphism Effect**: Semi-transparent background with blur effect when scrolled
- **Pill-Shaped Design**: Rounded full edges for a modern look
- **Smooth Animations**: 0.3s cubic-bezier transitions for all state changes
- **Subtle Drop Shadow**: Elegant shadow effects that enhance depth
- **Responsive Design**: Works perfectly on all device sizes

### 🎯 Functionality
- **Scroll Detection**: Transforms at 50px scroll threshold
- **Sticky Navigation**: Becomes fixed at top when scrolled
- **Active Link Highlighting**: Shows current section with color and underline
- **Smooth Scrolling**: Animated scroll to sections when clicking links
- **Mobile Menu**: Hamburger menu with glass-morphism for mobile devices
- **Keyboard Navigation**: Supports Escape key to close mobile menu
- **Performance Optimized**: Uses requestAnimationFrame and Intersection Observer

### 📱 Responsive Behavior
- **Desktop**: Full horizontal layout with proper spacing
- **Tablet**: Adjusted spacing and sizing
- **Mobile**: Collapsible hamburger menu with centered glass panel

## 🚀 Usage

1. **Include the files in your project:**
   ```html
   <link rel="stylesheet" href="modern-navbar.css">
   <script src="modern-navbar.js"></script>
   ```

2. **Add the navigation HTML:**
   ```html
   <nav class="navbar" id="navbar">
       <div class="nav-container">
           <div class="nav-logo">
               <span class="logo-text">YOUR LOGO</span>
           </div>
           <ul class="nav-menu" id="nav-menu">
               <li class="nav-item">
                   <a href="#section1" class="nav-link">Home</a>
               </li>
               <!-- Add more nav items -->
               <li class="nav-item">
                   <a href="#cta" class="nav-cta">Call to Action</a>
               </li>
           </ul>
           <div class="hamburger" id="hamburger">
               <span class="bar"></span>
               <span class="bar"></span>
               <span class="bar"></span>
           </div>
       </div>
   </nav>
   ```

3. **Add sections with matching IDs:**
   ```html
   <section id="section1" class="content-section">
       <!-- Your content -->
   </section>
   ```

## 🎛️ Customization

### CSS Variables
You can easily customize the design by modifying the CSS variables:

```css
:root {
    --primary-color: #1a1a1a;
    --secondary-color: #6366f1;
    --text-dark: #1f2937;
    --text-light: #6b7280;
    --white: #ffffff;
    --glass-bg: rgba(255, 255, 255, 0.95);
    --glass-border: rgba(255, 255, 255, 0.2);
    --shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    --border-radius: 50px;
}
```

### Scroll Threshold
Modify the scroll threshold in JavaScript:
```javascript
const scrollThreshold = 50; // Change this value
```

## 🎨 States

### Initial State (Top of Page)
- Transparent background
- White text color
- Full width
- No shadow or blur

### Scrolled State (After 50px)
- Glass-morphism background
- Dark text color
- Pill-shaped with rounded edges
- Drop shadow and blur effect
- Slightly smaller padding
- Horizontally centered

## 🔧 Browser Support

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## 📦 Files Structure

```
modern-navbar/
├── modern-navbar.html    # Demo HTML file
├── modern-navbar.css     # Stylesheet with glass-morphism
├── modern-navbar.js      # JavaScript functionality
└── README.md            # This file
```

## 🎯 Performance Features

- **Throttled Scroll Events**: Uses requestAnimationFrame for smooth performance
- **Intersection Observer**: Efficient section detection for active links
- **Passive Event Listeners**: Non-blocking event handling
- **Optimized Animations**: Hardware-accelerated CSS transforms
- **Minimal DOM Queries**: Cached element references

## 🚀 Getting Started

1. Open `modern-navbar.html` in your browser
2. Scroll down to see the glass-morphism effect
3. Test the mobile menu by resizing the window
4. Customize the colors and branding to match your project

## 💡 Tips

- Use high-contrast colors for better accessibility
- Test on various devices and screen sizes
- Consider adding ARIA labels for screen readers
- The glass effect works best over colorful backgrounds

## 🎉 Demo

The included HTML file provides a complete demo with:
- Hero section with gradient background
- Multiple content sections
- Smooth scrolling between sections
- Active link highlighting
- Mobile-responsive design

---

**Built with ❤️ using vanilla JavaScript - no dependencies required!** 