# Implementation Plan - Fix Onboarding Responsiveness

## Problem
The user reports that the "Terms and Conditions" step in the onboarding flow is not visible correctly on mobile devices ("no se ve nada") and requires scrolling/dragging to interact. This is likely due to excessive padding or layout alignment handling on small screens.

## Proposed Changes

### 1. `src/components/OnboardingWizard.tsx`

I will modify the styling to be more mobile-friendly:

- **Reduce Padding**: Change the padding of the "Terms" container from fixed `p-8` to responsive `p-4 sm:p-8`. This recovers significant screen real estate on mobile.
- **Adjust Content Alignment**: The main content wrapper has `flex items-center`. On small screens (especially landscape), this can cause the top/bottom of tall content to be inaccessible or force scrolling. I will adjust this to `items-start md:items-center` or use `my-auto` with safe centering.
- **Ensure Footer Visibility**: Verify the footer stays accessible. Since it's a flex column layout, reducing padding should help keep everything "above the fold" on most phones.

## Verification Plan

### Manual Verification
1.  **Mobile View**: Use browser dev tools to emulate a mobile device (e.g., iPhone SE, Pixel 5).
2.  **Navigation**: Go through the onboarding steps.
3.  **Terms Step**: Verify that on Step 4 (Terms):
    - The content fits better on the screen.
    - Padding is reduced (16px/1rem).
    - The "Terms" checkbox and text are clearly visible without excessive scrolling.
    - The "Finalizar" button in the footer is easily accessible.

### Automated Tests
- None applicable for layout responsiveness visual check in this environment. I will rely on manual simulation via code review and user feedback (since I cannot see the rendered UI).
