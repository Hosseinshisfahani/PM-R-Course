import React from 'react';
import { redirect } from 'next/navigation';
import { referralApi } from '@/lib/api';

interface ReferralLandingPageProps {
  params: {
    code: string;
  };
}

async function trackReferral(code: string) {
  try {
    const result = await referralApi.trackCode(code);
    return result.valid;
  } catch (error) {
    console.error('Failed to track referral:', error);
    return false;
  }
}

export default async function ReferralLandingPage({ params }: ReferralLandingPageProps) {
  const { code } = params;
  
  // Track the referral code
  const isValid = await trackReferral(code);
  
  if (isValid) {
    // Redirect to home page with success message
    redirect('/?referral=success');
  } else {
    // Redirect to home page with error message
    redirect('/?referral=invalid');
  }
}
