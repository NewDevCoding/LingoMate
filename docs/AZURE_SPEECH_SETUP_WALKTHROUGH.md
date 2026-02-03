# Azure Speech Service Setup - Step-by-Step Walkthrough

## Step 1: Create an Azure Account and Subscription (if you don't have one)

### If you don't have an Azure account:

1. Go to [https://azure.microsoft.com/free/](https://azure.microsoft.com/free/)
2. Click **"Start free"** or **"Create your Azure free account today"**
3. Sign in with your Microsoft account (or create one)
4. Complete the sign-up process:
   - Enter your phone number for verification
   - Enter a credit card (won't be charged for free tier)
   - Accept the agreement
5. Wait for account activation (usually instant)

### If you see "No items found" in Subscription dropdown:

This means you need to activate your Azure subscription first. Here's how:

**Option A: Activate Free Account**
1. Go to [https://portal.azure.com](https://portal.azure.com)
2. If you see a message about activating your subscription, click on it
3. Or go to [https://azure.microsoft.com/free/](https://azure.microsoft.com/free/) and complete the sign-up
4. You'll need to:
   - Verify your identity (phone number)
   - Add a payment method (credit card - won't be charged for free tier)
   - Accept the terms

**Option B: Create a Subscription**
1. In Azure Portal, click the search bar at the top
2. Type "Subscriptions" and select it
3. Click **"+ Add"** or **"Create subscription"**
4. Choose **"Free Trial"** or **"Pay-As-You-Go"**
5. Fill in the required information
6. Complete the setup

**Option C: Check Your Account Status**
1. In Azure Portal, click on your profile icon (top right)
2. Select **"Switch directory"** - you might be in the wrong tenant
3. Or check if you need to verify your email/phone

**After activating:**
- Wait 1-2 minutes for the subscription to appear
- Refresh the page
- Try creating the Speech resource again

## Step 2: Access the Azure Portal

1. Go to [https://portal.azure.com](https://portal.azure.com)
2. Sign in with your Microsoft account
3. You'll see the Azure Portal dashboard

## Step 3: Create a Speech Resource

### Option A: Quick Create (Recommended)

1. In the Azure Portal, click the **"Create a resource"** button (green plus icon) in the top left
   - Or use the search bar at the top and type "Speech"
   
2. In the search results, click on **"Speech"** (by Microsoft)

3. Click the **"Create"** button

4. Fill in the **Basics** tab:
   
   **Subscription:**
   - Select your subscription (usually "Free Trial" or "Pay-As-You-Go")
   
   **Resource Group:**
   - Click **"Create new"**
   - Name it: `lingomate-resources` (or any name you prefer)
   - Click **"OK"**
   
   **Region:**
   - Choose a region close to you:
     - **US East** (`eastus`) - Good for US East Coast
     - **US West** (`westus`) - Good for US West Coast
     - **West Europe** (`westeurope`) - Good for Europe
     - **Southeast Asia** (`southeastasia`) - Good for Asia
   - **Important:** Note which region you choose - you'll need it later!
   
   **Name:**
   - Enter a unique name: `lingomate-speech` (or your preferred name)
   - Must be globally unique (Azure will tell you if it's taken)
   
   **Pricing Tier:**
   - For testing: Select **"Free (F0)"** - 5 hours/month free
   - For production: Select **"Standard (S0)"** - Pay-as-you-go
   
   **Review the terms** and check the box if you agree

5. Click **"Review + create"** at the bottom

6. Wait for validation (usually a few seconds)

7. Click **"Create"** button

8. Wait for deployment (usually 1-2 minutes)
   - You'll see "Your deployment is complete" when done

## Step 4: Get Your API Key and Region

1. Click **"Go to resource"** button (or find it in your resources)

2. In the left sidebar, click **"Keys and Endpoint"** (under "Resource Management")

3. You'll see:
   - **KEY 1** - Copy this value (click the copy icon)
   - **KEY 2** - Backup key (optional)
   - **Location/Region** - This is your region (e.g., "eastus")

4. **Important:** Save these values securely:
   - API Key: `your_key_here`
   - Region: `eastus` (or whatever region you chose)

## Step 5: Add to Your Project

1. Open your `.env.local` file in the LingoMate project root

2. Add these lines:
   ```env
   AZURE_SPEECH_KEY=paste_your_key_here
   AZURE_SPEECH_REGION=paste_your_region_here
   ```

3. Example:
   ```env
   AZURE_SPEECH_KEY=1234567890abcdef1234567890abcdef
   AZURE_SPEECH_REGION=eastus
   ```

4. **Save the file**

5. **Restart your development server** (if it's running):
   - Stop it (Ctrl+C)
   - Run `npm run dev` again

## Step 6: Test the Feature

1. Start your development server: `npm run dev`

2. Navigate to a roleplay session in your app

3. Click the microphone button to record

4. Speak something in the target language

5. After transcription, click **"Assess Pronunciation"**

6. You should see pronunciation scores and feedback!

## Troubleshooting

### "Azure Speech API key not configured"
- Make sure `.env.local` has the correct variable names
- Check for typos in `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION`
- Restart your dev server after adding the keys

### "Failed to assess pronunciation"
- Verify your API key is correct (no extra spaces)
- Check that the region matches your resource region
- Make sure your Speech resource is active (not deleted)

### "Resource not found" or "Invalid region"
- Double-check the region code (e.g., `eastus`, not `East US`)
- Make sure the region matches where you created the resource

### Free Tier Limits
- Free tier: 5 hours of audio per month
- If you hit the limit, wait until next month or upgrade to Standard tier

## Visual Guide

### Finding "Create a resource"
```
Azure Portal
└── Top left corner: Green "+" button
    └── Or search bar: Type "Speech"
```

### Resource Creation Form
```
Create Speech
├── Subscription: [Your subscription]
├── Resource Group: [Create new: lingomate-resources]
├── Region: [Choose: eastus, westus, etc.]
├── Name: [lingomate-speech]
├── Pricing Tier: [Free (F0) or Standard (S0)]
└── [Review + create] → [Create]
```

### Getting Keys
```
Speech Resource
└── Left sidebar: "Keys and Endpoint"
    ├── KEY 1: [Copy this]
    ├── KEY 2: [Backup]
    └── Location/Region: [Note this]
```

## Next Steps

Once set up:
1. ✅ Test pronunciation assessment
2. ✅ Try different languages
3. ✅ Check the feedback quality
4. ✅ Consider upgrading to Standard tier for production

## Cost Information

### Free Tier (F0)
- **5 hours** of audio processing per month
- Perfect for development and testing
- No credit card required (but may be asked for verification)

### Standard Tier (S0)
- **Pay-as-you-go** pricing
- Approximately **$1 per 1,000 audio minutes**
- No monthly limits
- Recommended for production apps

## Security Best Practices

1. **Never commit `.env.local` to git** (it should be in `.gitignore`)
2. **Rotate keys** if they're exposed
3. **Use KEY 2** as backup if KEY 1 is compromised
4. **Delete unused resources** to avoid charges

## Need Help?

- [Azure Speech Documentation](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/)
- [Azure Support](https://azure.microsoft.com/support/)
- Check server logs for detailed error messages
