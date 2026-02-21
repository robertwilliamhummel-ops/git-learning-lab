# Google Tag Manager Configuration Guide
## TechFlow Solutions - Complete Setup Instructions

### Prerequisites
- Google Analytics 4 Property created with Measurement ID (G-XXXXXXXXXX)
- Google Tag Manager Container created with Container ID (GTM-XXXXXXX)
- GTM Container ID replaced in all HTML files

---

## Step 1: Basic GA4 Configuration Tag

### Create GA4 Configuration Tag
1. **Go to GTM Dashboard** → Tags → New
2. **Tag Configuration**: Select **"Google Tag"** (under Featured section)
3. **Tag Name**: `GA4 - Configuration`
4. **Tag ID**: Enter your GA4 Measurement ID `G-4P6GE8ETQQ`
5. **Triggering**: All Pages
6. **Configuration Settings**: Enable Enhanced Measurement (recommended):
   - Page views ✓
   - Scrolls ✓
   - Outbound clicks ✓
   - Site search ✓
   - Video engagement ✓
   - File downloads ✓

---

## Step 2: Conversion Tracking Tags

### Phone Click Tracking
**Tag Name**: `GA4 - Phone Click`
- **Tag Type**: Google Analytics: GA4 Event
- **Configuration Tag**: Select your GA4 Configuration tag
- **Event Name**: `phone_click`
- **Event Parameters**:
  - `phone_number`: `6475728321`
  - `event_category`: `contact`
- **Trigger**: Create new trigger
  - **Trigger Type**: Click - All Elements
  - **Trigger Name**: `Phone Click Trigger`
  - **Click Element**: Some Clicks
  - **Condition**: Click URL contains `tel:`

### Contact Form Submission
**Tag Name**: `GA4 - Contact Form Submit`
- **Tag Type**: Google Analytics: GA4 Event
- **Configuration Tag**: Select your GA4 Configuration tag
- **Event Name**: `contact_form_submit`
- **Event Parameters**:
  - `form_type`: `contact`
  - `event_category`: `form`
- **Trigger**: Create new trigger
  - **Trigger Type**: Form Submission
  - **Trigger Name**: `Contact Form Submit`
  - **Wait for Tags**: 2000ms
  - **Check Validation**: True
  - **Fire On**: Some Forms
  - **Condition**: Page URL contains `contact.html`

### Booking Form Submission
**Tag Name**: `GA4 - Booking Form Submit`
- **Tag Type**: Google Analytics: GA4 Event
- **Configuration Tag**: Select your GA4 Configuration tag
- **Event Name**: `booking_form_submit`
- **Event Parameters**:
  - `form_type`: `booking`
  - `event_category`: `form`
- **Trigger**: Create new trigger
  - **Trigger Type**: Form Submission
  - **Trigger Name**: `Booking Form Submit`
  - **Wait for Tags**: 2000ms
  - **Check Validation**: True
  - **Fire On**: Some Forms
  - **Condition**: Page URL contains `booking.html`

### Remote Support Button Clicks
**Tag Name**: `GA4 - Remote Support Click`
- **Tag Type**: Google Analytics: GA4 Event
- **Configuration Tag**: Select your GA4 Configuration tag
- **Event Name**: `remote_support_click`
- **Event Parameters**:
  - `button_type`: `remote_support`
  - `event_category`: `conversion`
- **Trigger**: Create new trigger
  - **Trigger Type**: Click - All Elements
  - **Trigger Name**: `Remote Support Click`
  - **Click Element**: Some Clicks
  - **Condition**: Click URL contains `remote-support` OR Click Text contains `Remote Support`

---

## Step 3: Custom Event Tags

### CTA Button Tracking
**Tag Name**: `GA4 - CTA Click`
- **Tag Type**: Google Analytics: GA4 Event
- **Configuration Tag**: Select your GA4 Configuration tag
- **Event Name**: `cta_click`
- **Event Parameters**:
  - `button_text`: `{{Click Text}}`
  - `page_location`: `{{Page URL}}`
  - `event_category`: `engagement`
- **Trigger**: Create new trigger
  - **Trigger Type**: Click - All Elements
  - **Trigger Name**: `CTA Button Click`
  - **Click Element**: Some Clicks
  - **Condition**: Click Classes contains `btn` OR `cta-button`

### Service Page Views
**Tag Name**: `GA4 - Service Page View`
- **Tag Type**: Google Analytics: GA4 Event
- **Configuration Tag**: Select your GA4 Configuration tag
- **Event Name**: `service_page_view`
- **Event Parameters**:
  - `service_type`: Use Custom JavaScript variable to determine service type
  - `event_category`: `page_view`
- **Trigger**: Create new trigger
  - **Trigger Type**: Page View
  - **Trigger Name**: `Service Pages`
  - **Fire On**: Some Page Views
  - **Condition**: Page URL contains `services.html` OR `remote-support.html`

---

## Step 4: Variables Setup

### Custom JavaScript Variables

#### Service Type Variable
**Variable Name**: `Service Type`
**Variable Type**: Custom JavaScript
```javascript
function() {
  var url = {{Page URL}};
  if (url.indexOf('services.html') > -1) return 'services_overview';
  if (url.indexOf('remote-support.html') > -1) return 'remote_support';
  if (url.indexOf('about.html') > -1) return 'about';
  if (url.indexOf('contact.html') > -1) return 'contact';
  if (url.indexOf('booking.html') > -1) return 'booking';
  if (url.indexOf('portfolio.html') > -1) return 'portfolio';
  return 'home';
}
```

---

## Step 5: Testing & Validation

### Preview Mode Testing
1. **Enable Preview Mode** in GTM
2. **Visit your website** with preview active
3. **Test each conversion action**:
   - Click phone numbers
   - Submit contact form
   - Submit booking form
   - Click remote support buttons
   - Click CTA buttons

### GA4 Real-time Verification
1. **Go to GA4** → Reports → Realtime
2. **Perform test actions** on your website
3. **Verify events appear** in real-time report
4. **Check event parameters** are populated correctly

---

## Step 6: Conversion Setup in GA4

### Mark Events as Conversions
1. **Go to GA4** → Configure → Events
2. **Find these events** and toggle "Mark as conversion":
   - `phone_click` ✓
   - `contact_form_submit` ✓
   - `booking_form_submit` ✓
   - `remote_support_click` ✓

### Create Custom Audiences
1. **Go to GA4** → Configure → Audiences
2. **Create audiences for**:
   - Users who clicked phone numbers
   - Users who submitted forms
   - Users who visited service pages
   - Users who engaged with remote support

---

## Step 7: Goals & Funnels

### Conversion Funnel Setup
1. **Go to GA4** → Explore → Funnel Exploration
2. **Create funnel**:
   - Step 1: Page view (any page)
   - Step 2: Service page view
   - Step 3: Contact form view
   - Step 4: Form submission OR phone click

### Custom Reports
1. **Go to GA4** → Explore → Free Form
2. **Create reports for**:
   - Lead generation performance
   - Service page engagement
   - Conversion source analysis
   - Geographic performance

---

## Step 8: Publish & Monitor

### Publish GTM Container
1. **Review all tags** in GTM workspace
2. **Submit changes** with descriptive version name
3. **Publish container** to live environment

### Ongoing Monitoring
- **Weekly**: Check conversion rates and traffic sources
- **Monthly**: Review goal completions and user behavior
- **Quarterly**: Analyze trends and optimize based on data

---

## Troubleshooting

### Common Issues
- **Events not firing**: Check trigger conditions and preview mode
- **Missing parameters**: Verify variable configuration
- **Duplicate events**: Ensure GTM code is only loaded once per page
- **Form tracking issues**: Check form validation and wait times

### Debug Tools
- **GTM Preview Mode**: Real-time tag firing verification
- **GA4 DebugView**: Detailed event parameter inspection
- **Browser Console**: Check for JavaScript errors
- **GTM Assistant**: Chrome extension for debugging

---

## Business Impact

This setup will provide insights into:
- **Lead Quality**: Which traffic sources generate the most qualified leads
- **Service Demand**: Which services are most popular
- **User Journey**: How visitors navigate through your site
- **Conversion Optimization**: Where to focus improvement efforts
- **ROI Tracking**: Return on marketing investments
- **Geographic Performance**: Which areas generate the most business

The comprehensive tracking will help optimize your marketing spend and improve conversion rates for TechFlow Solutions.