# Accessibility Implementation Guide

## Overview

The Séance frontend application has been built with accessibility as a core principle, following WCAG 2.1 Level AA standards. This document outlines the accessibility features implemented throughout the application.

## Keyboard Navigation

### Global Keyboard Support

All interactive elements are keyboard accessible using standard navigation patterns:

- **Tab**: Move forward through focusable elements
- **Shift + Tab**: Move backward through focusable elements
- **Enter**: Activate buttons and submit forms
- **Space**: Activate buttons
- **Escape**: Close modals/dialogs and return to previous screen

### Component-Specific Keyboard Support

#### Ouija Board Letters
- Each letter is keyboard focusable with `tabIndex={0}`
- Enter or Space key activates letter selection
- Focus indicators clearly show which letter is selected

#### Forms
- All form inputs are keyboard accessible
- Enter key submits forms
- Tab navigation follows logical order

#### User List (Mobile)
- Collapsible header is keyboard accessible
- Enter or Space toggles expansion

#### Modals
- Escape key closes the name prompt modal
- Focus is trapped within modal when open

## ARIA Labels and Roles

### Semantic HTML

The application uses semantic HTML5 elements throughout:

- `<header>` for page headers
- `<main>` for main content areas
- `<nav>` for navigation (where applicable)
- `<article>` for message items
- `<aside>` for sidebars (user list, message feed)
- `<section>` for content sections
- `<button>` for all clickable actions
- `<time>` for timestamps

### ARIA Attributes

#### Live Regions

**Spirit Response Status** (`role="status"`, `aria-live="polite"`)
- Announces when the spirit is revealing a message
- Screen readers are notified of spirit responses without interrupting

**Message Feed** (`role="log"`, `aria-live="polite"`)
- New messages are announced to screen readers
- Message count updates are announced

**Connection Status** (`role="status"`, `aria-live="polite"`)
- Connection state changes are announced
- Users are notified when disconnected

#### Interactive Elements

**Buttons**
- All buttons have descriptive `aria-label` attributes
- Loading states use `aria-busy="true"`
- Disabled states use `aria-disabled="true"`

**Forms**
- Form inputs have associated `<label>` elements
- Error messages use `aria-invalid` and `aria-describedby`
- Required fields use `aria-required="true"`

**Collapsible Sections**
- Use `aria-expanded` to indicate state
- Use `aria-controls` to link to controlled content

#### Regions and Landmarks

- **Ouija Board**: `role="region"`, `aria-label="Ouija board interface"`
- **Message Feed**: `role="region"`, `aria-label="Message history"`
- **User List**: `role="complementary"`, `aria-label="Session participants"`
- **Name Prompt**: `role="dialog"`, `aria-labelledby`, `aria-describedby`

### Screen Reader Only Content

The `.sr-only` utility class provides content visible only to screen readers:

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

Used for:
- Descriptive text for icons
- Additional context for screen readers
- Hidden labels for visual-only elements

## Color Contrast

### WCAG AA Compliance

All text colors meet or exceed WCAG AA standards (4.5:1 contrast ratio):

| Text Color | Background | Contrast Ratio | Status |
|------------|------------|----------------|--------|
| slate-100 | slate-950 | 17.8:1 | ✅ AAA |
| slate-200 | slate-950 | 15.5:1 | ✅ AAA |
| purple-400 | slate-950 | 8.2:1 | ✅ AAA |
| emerald-400 | slate-950 | 7.8:1 | ✅ AAA |
| slate-400 | slate-950 | 6.8:1 | ✅ AAA |
| red-400 | slate-950 | 7.5:1 | ✅ AAA |

See [ACCESSIBILITY_AUDIT.md](./ACCESSIBILITY_AUDIT.md) for complete color contrast analysis.

### High Contrast Mode

The application's dark theme with high-contrast text ensures readability in various lighting conditions and for users with visual impairments.

## Focus Indicators

### Global Focus Styles

All focusable elements have visible focus indicators:

```css
*:focus-visible {
  outline: 2px solid #a855f7; /* purple-500 */
  outline-offset: 2px;
}
```

### Component-Specific Focus Styles

#### Buttons
- Purple ring with 2px offset
- Visible on all button variants
- Maintained in disabled state

#### Form Inputs
- Purple ring with 2px offset
- Consistent across all input types
- Error states maintain focus visibility

#### Interactive Letters
- Purple ring with 2px offset
- Clearly distinguishes focused letter from active letter
- Visible against dark background

#### Links and Navigation
- Purple outline with offset
- Consistent with overall theme

### Focus Management

- Focus is managed appropriately in modals
- Focus returns to trigger element when modal closes
- Tab order follows logical reading order
- No keyboard traps

## Screen Reader Support

### Announcements

The application provides appropriate announcements for:

1. **Spirit Responses**
   - "The spirit is revealing its message..."
   - "Spirit message complete: [message text]"

2. **User Actions**
   - "User [name] joined the session"
   - "User [name] left the session"
   - "[X] messages" (updates dynamically)

3. **Connection Status**
   - "Connection status: Connected"
   - "Connection status: Disconnected"

4. **Form Validation**
   - Error messages are announced
   - Success states are announced

### Navigation

- Landmark regions allow quick navigation
- Headings provide document structure
- Lists are properly marked up

## Testing

### Manual Testing Checklist

- [x] All interactive elements keyboard accessible
- [x] Tab order is logical
- [x] Focus indicators visible on all elements
- [x] Screen reader announces all dynamic content
- [x] Color contrast meets WCAG AA standards
- [x] Forms are fully accessible
- [x] Modals trap focus appropriately
- [x] Error messages are announced

### Automated Testing

Recommended tools for ongoing testing:

1. **axe DevTools** - Browser extension for accessibility testing
2. **WAVE** - Web accessibility evaluation tool
3. **Lighthouse** - Chrome DevTools accessibility audit
4. **NVDA/JAWS** - Screen reader testing (Windows)
5. **VoiceOver** - Screen reader testing (macOS/iOS)

### Browser Testing

Tested and verified in:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Known Limitations

1. **Planchette Animation**: The visual animation of the planchette moving between letters is decorative and not essential for understanding spirit responses. Screen reader users receive the complete message text.

2. **Real-time Updates**: While aria-live regions announce updates, very rapid updates may be throttled by screen readers.

## Future Enhancements

Potential accessibility improvements for future versions:

1. **Reduced Motion**: Respect `prefers-reduced-motion` media query
2. **High Contrast Mode**: Detect and adapt to Windows High Contrast Mode
3. **Font Size**: Allow user-controlled font size adjustments
4. **Voice Input**: Support for voice-based question input
5. **Haptic Feedback**: Vibration feedback for mobile users

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

## Contact

For accessibility issues or suggestions, please open an issue on the project repository.

---

**Last Updated**: December 2024
**WCAG Level**: AA Compliant
**Testing Status**: Manual and automated testing completed
