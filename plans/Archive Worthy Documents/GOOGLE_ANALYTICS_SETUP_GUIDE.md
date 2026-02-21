# Google Analytics 4 + Google Tag Manager Setup Guide

## Step 1: Set up Google Analytics 4 Property

1. Go to [Google Analytics](https://analytics.google.com)
2. Click "Start measuring" or "Create Property"
3. Enter property details:
   - Property name: "TechFlow Solutions"
   - Reporting time zone: "Canada/Eastern"
   - Currency: "Canadian Dollar (CAD)"
4. Select "Web" as platform
5. Enter website URL: `https://techflowsolutions.ca`
6. **Copy your Measurement ID** (format: `G-XXXXXXXXXX`) - you'll need this for GTM

## Step 2: Set up Google Tag Manager Container

1. Go to [Google Tag Manager](https://tagmanager.google.com)
2. Click "Create Account"
3. Account setup:
   - Account Name: "TechFlow Solutions"
   - Country: "Canada"
4. Container setup:
   - Container Name: "techflowsolutions.ca"
   - Target Platform: "Web"
5. **Confirm your GTM Container ID is GTM-M2VPMC5V** (already implemented in your HTML files)

---

## Next Steps

**Once you have your GA4 Measurement ID, continue with the detailed configuration:**

👉 **Follow [GTM_CONFIGURATION_GUIDE.md](GTM_CONFIGURATION_GUIDE.md) for complete setup**

The GTM Configuration Guide contains:
- Detailed tag setup instructions
- Conversion tracking configuration
- Custom event implementation
- Testing and validation steps
- Advanced features and troubleshooting

---

## Important Notes

- ✅ GTM Container ID `GTM-M2VPMC5V` is already implemented in all HTML files
- ✅ Website is ready for analytics tracking
- ✅ All tracking respects user privacy and GDPR compliance

**Total setup time: ~30 minutes** (5 minutes for accounts + 25 minutes for configuration)