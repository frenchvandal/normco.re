---
title: "Understanding the CSS Architecture of normco.re Design System"
description: "A deep dive into the layered ITCSS-inspired structure used in the normco.re design system, exploring how design tokens, base styles, components, and utilities work together."
date: "2026-01-24"
author: phiphi
tags:
  - CSS
  - Design System
  - Architecture
  - Front-End
---

The normco.re design system implements a well-structured CSS architecture
inspired by ITCSS, organizing styles into clear layers for maintainability and
scalability. This architecture ensures consistency across the website while
maintaining clean, modular code.

<!--more-->

## The Layered ITCSS Structure

The design system divides CSS into five layers and a single entry point
(`styles.css`) that imports them in order. This approach promotes separation of
concerns and makes the codebase easier to navigate and maintain.

### 1. Design Tokens (`01-tokens`)

The foundation of the design system lies in the design tokens – CSS custom
properties that define the visual design language. These tokens include:

- **Color palette**: Both light and dark theme colors with semantic naming
- **Typography**: Font families, weights, scales, and line heights
- **Spacing scale**: Consistent spacing units for margins, padding, and gaps
- **Layout values**: Content widths, breakpoints, and z-index scales
- **Animation values**: Transition durations and easing functions

By centralizing these values, any design changes can be propagated throughout
the entire system by updating a single variable.

### 2. Base Styles (`02-base`)

Base styles reset browser defaults and establish foundational typography. This
layer includes:

- **Reset**: Normalizing styles across browsers
- **Typography**: Base styles for headings, paragraphs, links, lists, and other
  text elements
- **Global**: Common element styles that apply universally

These styles form the typographic and structural foundation of the entire site.

### 3. Utilities (`03-utilities`)

Utility classes provide single-purpose styling options that can be applied
directly in HTML. These include:

- **Display utilities**: Flexbox and grid helpers
- **Spacing utilities**: Margin and padding classes
- **Typography utilities**: Text alignment and appearance classes
- **Visibility utilities**: Screen reader only and responsive hiding classes
- **Layout utilities**: Width, height, and positioning helpers

Utilities enable rapid prototyping and provide consistent styling solutions
without creating new CSS rules.

### 4. Components (`04-components`)

Component styles define reusable UI elements with their variations. Examples
include:

- **Buttons**: With primary, ghost, and size variants
- **Cards**: For content containers
- **Alerts**: For notifications and messages
- **Badges**: For status indicators
- **Theme toggle**: For switching between light and dark modes
- **Search**: For search interface elements

Each component is self-contained and follows consistent naming conventions.

### 5. Layouts (`05-layouts`)

Layout styles handle page-level and section-specific arrangements:

- **Page layouts**: For organizing content sections
- **Navigation**: For header and footer navigation
- **Post layouts**: For blog post presentation
- **Table of contents**: For document structure
- **Archive layouts**: For content listings

These styles manage the arrangement of components within different page
contexts.

## Key Features of the Architecture

### Theming Support

The design system includes robust dark theme support through CSS custom
properties. A `[data-theme="dark"]` selector updates all color values, allowing
seamless theme switching without duplicating style rules.

### Responsive Design

Responsive utilities and media queries ensure consistent experiences across
devices. Breakpoints are documented in the design tokens for reference, though
they can't be used directly in media queries due to CSS limitations.

### Accessibility

The system prioritizes accessibility through:

- Proper focus styles with customizable outlines
- Sufficient color contrast ratios
- Semantic HTML support
- Screen reader-friendly utility classes
- Keyboard navigation considerations

### Maintainability

The architecture promotes maintainability through:

- Clear separation of concerns
- Consistent naming conventions
- Modular, reusable components
- Centralized design decisions in tokens
- Well-documented code structure

## Benefits of This Approach

This CSS architecture provides several advantages:

1. **Scalability**: New components and features can be added without disrupting
   existing styles
2. **Consistency**: Design tokens ensure visual consistency across the entire
   system
3. **Maintainability**: Clear organization makes it easy to locate and modify
   styles
4. **Performance**: Modular approach enables selective loading and caching
5. **Collaboration**: Clear structure makes it easier for multiple developers to
   work on the codebase

## Conclusion

The layered ITCSS-inspired architecture implemented in the normco.re design
system creates a robust, scalable foundation for building consistent user
interfaces. By separating concerns into logical layers and using design tokens
as the source of truth, the system enables efficient development while
maintaining visual coherence across all components and pages.

This architecture serves as a strong example of how thoughtful CSS organization
can improve both developer experience and end-user experience.
