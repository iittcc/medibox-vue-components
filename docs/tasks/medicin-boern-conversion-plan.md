# Medicin Børn (Pediatric Medicine Dosage) Calculator Conversion Plan

## Overview
This document outlines the conversion of the jQuery-based pediatric medicine dosage calculator to a modern Vue 3 application with TypeScript.

## Original Calculator Analysis
- **Location**: `app/templates/medibox/functions/medicin_boern/`
- **Technology**: jQuery, vanilla JavaScript, HTML tables
- **Purpose**: Calculate pediatric medicine dosages based on weight and medication type

## Conversion Details

### Files Created
1. **`src/assets/medicinBoern.ts`**
   - TypeScript interfaces for all data structures
   - Converted medicine data arrays (mainarray, dispenseringsarray, praeparatarray, detaljerarray)
   - Utility functions (roundToOne, isValidNumber)
   - Calculation logic (calculateDosage)

2. **`src/medicinBoern.ts`**
   - Entry point with PrimeVue configuration
   - Danish locale setup
   - Teal theme (symptom score category)

3. **`src/MedicinBoern.vue`**
   - Main wrapper component

4. **`src/components/MedicinBoernScore.vue`**
   - Full calculator implementation
   - Modern UI with PrimeVue Volt components
   - Responsive design with Tailwind CSS
   - Real-time calculations
   - Copy to clipboard functionality

5. **`medicinBoern.html`**
   - HTML entry file for standalone use

6. **`vite.config.ts`**
   - Added medicinBoern entry point

## Key Improvements
1. **Type Safety**: Full TypeScript implementation with proper interfaces
2. **Modern UI**: Replaced table layout with responsive grid/flex design
3. **Component Architecture**: Reusable Vue components following project patterns
4. **Real-time Updates**: Automatic recalculation on input changes
5. **Better UX**: 
   - Smooth sliders with visual feedback
   - Clear warning messages
   - Copy functionality for results
   - Responsive design for mobile

## Functionality Preserved
- All 12 medicine types (Amoxicillin, Penicillin, etc.)
- Dynamic dispensing form selection (tablets/mixture/suppositories)
- Preparation filtering based on selections
- Dosage calculation with recommended ranges
- Weight-based calculations
- Daily and total amount calculations
- Warning messages for dosage limits
- Reset functionality

## Testing Checklist
- [ ] All medications load correctly
- [ ] Dispensing forms update based on medication
- [ ] Preparations filter correctly
- [ ] Sliders work within defined ranges
- [ ] Calculations match original logic
- [ ] Warning messages appear appropriately
- [ ] Copy to clipboard works
- [ ] Reset clears all fields
- [ ] Responsive design works on mobile
- [ ] Data sends to server correctly