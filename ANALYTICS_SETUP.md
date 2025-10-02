# 📊 Analytics Setup Guide

Plausible Analytics is now integrated! Privacy-friendly, lightweight (<1KB), and GDPR compliant.

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Plausible Account
1. Go to: https://plausible.io/register
2. Sign up (30-day free trial, then $9/month)
3. Add your domain: `kpopdemonz.com`

### Step 2: Deploy
Already done! The script is in `index.html`:
```html
<script defer data-domain="kpopdemonz.com" src="https://plausible.io/js/script.js"></script>
```

### Step 3: Verify Installation
1. Visit https://kpopdemonz.com
2. Go to your Plausible dashboard
3. You should see a live visitor!

---

## 📈 Events Being Tracked

### Automatic (Page Views):
- `/` - Homepage visits
- `/view/:shortId` - Transformation views

### Custom Events:

**1. Image Upload**
```typescript
plausible('Image Upload', { props: { count: 1 } })
```
- **When:** User uploads photo
- **Props:** Number of images uploaded
- **Use:** Measure upload funnel

**2. Transformation Success**
```typescript
plausible('Transformation Success', { props: { count: 1 } })
```
- **When:** AI transformation completes
- **Props:** Number of successful transformations
- **Use:** Calculate success rate

**3. Email Signup**
```typescript
plausible('Email Signup')
```
- **When:** User submits email
- **Use:** Track lead generation

**4. View Transformation**
```typescript
plausible('View Transformation')
```
- **When:** User clicks email link to view result
- **Use:** Measure email engagement

**5. Download Image**
```typescript
plausible('Download Image')
```
- **When:** User downloads transformation
- **Use:** Track final conversion

---

## 📊 Key Metrics to Monitor

### Conversion Funnel:
```
Homepage Visits
  ↓
Image Upload (% of visitors)
  ↓
Transformation Success (% of uploads)
  ↓
Email Signup (% of transformations)
  ↓
View Transformation (% of emails sent)
  ↓
Download Image (% of views)
```

### Goal Conversions:
- **Primary:** Email Signup
- **Secondary:** Download Image
- **Micro:** Transformation Success

---

## 🎯 Using the Dashboard

### Daily Checks:
1. **Total visitors** - Traffic trends
2. **Email Signup** event count - Lead generation
3. **Bounce rate** - User engagement

### Weekly Analysis:
1. **Upload → Success rate** - Model performance
2. **Success → Email rate** - Email form effectiveness
3. **Email → View rate** - Email deliverability
4. **View → Download rate** - Final satisfaction

### Traffic Sources:
- Direct (organic/returning users)
- Social (Twitter, Instagram, TikTok)
- Referral (other websites linking to you)

---

## 🔧 Advanced Setup (Optional)

### Enable Custom Properties:
In Plausible dashboard:
1. Settings → Goals
2. Add custom events:
   - `Image Upload`
   - `Transformation Success`
   - `Email Signup`
   - `View Transformation`
   - `Download Image`

### Set Up Goals:
1. Settings → Goals → Add Goal
2. Goal: "Email Signup"
3. Type: Custom Event
4. Name: `Email Signup`

Repeat for other conversion events.

---

## 💡 Optimization Tips

### If Upload Rate is Low:
- Improve hero section CTA
- Add more examples
- Better mobile UX

### If Success Rate is Low (<90%):
- Model quality issues
- Check error logs
- Face detection failing

### If Email Rate is Low:
- Email form too hidden?
- Value proposition unclear?
- Try incentive (priority processing, gallery feature)

### If View Rate is Low:
- Email going to spam?
- Subject line not compelling?
- Check Resend deliverability

### If Download Rate is Low:
- Image quality issues?
- Add more download options (formats)?
- Better share functionality?

---

## 🆓 Free Alternative: Self-Hosted

Don't want to pay? Self-host Plausible:

```bash
# Docker setup
git clone https://github.com/plausible/hosting
cd hosting
docker-compose up -d
```

Update script in `index.html`:
```html
<script defer data-domain="kpopdemonz.com" src="https://your-domain.com/js/script.js"></script>
```

---

## 📱 Mobile App Tracking (Future)

If you build a mobile app:

```javascript
// React Native example
import { trackEvent } from './analytics';

trackEvent('Image Upload', { platform: 'ios' });
```

---

## 🔒 Privacy Features

✅ **No cookies** - 100% cookie-free  
✅ **No personal data** - IP anonymization  
✅ **GDPR compliant** - No banner needed  
✅ **Lightweight** - <1KB script  
✅ **Open source** - Full transparency  

---

## 📊 Export Data

### API Access:
```bash
# Get stats via API
curl https://plausible.io/api/v1/stats/aggregate \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d 'site_id=kpopdemonz.com&period=30d&metrics=visitors,pageviews'
```

### CSV Export:
Dashboard → Export → Download CSV

---

## 🎉 You're All Set!

Push your code and visit https://kpopdemonz.com - you'll start seeing analytics immediately!

Check dashboard: https://plausible.io/kpopdemonz.com
