import React, { useState } from 'react';
// FIX: The 'Page' type is exported from AppContext, not App.
import type { Page } from '../contexts/AppContext';
import { Check } from 'lucide-react';

interface PricingPageProps {
  onNavigate: (page: Page) => void;
}

type BillingCycle = 'monthly' | 'annual';

const PlanCard: React.FC<{
  plan: string;
  price: string;
  pricePer: string;
  monthlyBreakdown?: string;
  savings?: string;
  description: string;
  features: string[];
  cta: string;
  isPopular?: boolean;
  ribbonText?: string;
}> = ({ plan, price, pricePer, monthlyBreakdown, savings, description, features, cta, isPopular, ribbonText }) => {
  const cardClasses = isPopular
    ? 'border-orange-500 border-2 transform md:scale-105 shadow-2xl'
    : 'border-slate-200/80 border';

  const buttonClasses = isPopular
    ? 'bg-orange-500 hover:bg-orange-600 text-white'
    : 'bg-slate-800 hover:bg-slate-900 text-white';

  return (
    <div className={`relative bg-white rounded-2xl p-8 flex flex-col ${cardClasses} transition-transform duration-300`}>
      {isPopular && ribbonText && (
        <div className="absolute top-0 right-0 mr-4 -mt-3">
          <div className="bg-orange-500 text-white text-xs font-bold uppercase tracking-wider rounded-full px-3 py-1 shadow-md">
            {ribbonText}
          </div>
        </div>
      )}
      <h3 className="text-2xl font-bold text-slate-800">{plan}</h3>
      <p className="mt-2 text-slate-500">{description}</p>
      
      <div className="mt-4 min-h-[90px]">
        <div className="flex items-baseline">
          <span className="text-5xl font-extrabold tracking-tight text-slate-900">{price}</span>
          <span className="ml-1 text-xl font-semibold text-slate-500">{pricePer}</span>
        </div>
        {monthlyBreakdown && <p className="text-slate-500 mt-1">{monthlyBreakdown}</p>}
        {savings && <p className="mt-1 text-sm font-medium text-orange-500">{savings}</p>}
      </div>
      
      <ul className="my-8 space-y-3 text-slate-700 flex-grow">
        {features.map((feature, index) => (
            <li key={index} className="flex items-start">
                <Check className="h-5 w-5 text-orange-500 flex-shrink-0 mr-2 mt-0.5" />
                <span>{feature}</span>
            </li>
        ))}
      </ul>
      
      <a href="#" className={`w-full h-11 mt-8 flex items-center justify-center text-center font-semibold py-3 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg ${buttonClasses}`}>
        {cta}
      </a>
    </div>
  );
};


export const PricingPage: React.FC<PricingPageProps> = ({ onNavigate }) => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  
  const commonFeatures = [
    "All design styles",
    "Image editing tools",
    "Advanced customization",
  ];

  return (
    <div className="w-full">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-extrabold text-slate-900 sm:text-5xl">
          Choose the plan that's right for you
        </h2>
        <p className="mt-4 text-xl text-slate-600 max-w-2xl mx-auto">
          Start for free, then unlock more features and designs as you grow.
        </p>
      </div>

      <div className="flex justify-center items-center my-10">
        <span className={`px-4 py-2 font-medium transition ${billingCycle === 'monthly' ? 'text-slate-800' : 'text-slate-500'}`}>Monthly</span>
        <button
          onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
          className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400"
          aria-label={`Switch to ${billingCycle === 'monthly' ? 'annual' : 'monthly'} billing`}
        >
          <span
            className={`${
              billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-1'
            } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
          />
        </button>
        <span className={`px-4 py-2 font-medium transition ${billingCycle === 'annual' ? 'text-slate-800' : 'text-slate-500'}`}>
          Annual
          <span className="ml-2 text-xs font-bold text-orange-700 bg-orange-100 rounded-full px-2 py-0.5">Save up to 33%</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <PlanCard 
            plan="Personal"
            price={billingCycle === 'monthly' ? "$12" : "$120"}
            pricePer={billingCycle === 'monthly' ? "/ month" : "/ year"}
            monthlyBreakdown={billingCycle === 'annual' ? '($10/month)' : undefined}
            savings={billingCycle === 'annual' ? 'Save $24 (17%)' : undefined}
            description="For casual users or hobbyists."
            features={["50 redesigns per month", ...commonFeatures]}
            cta="Get Personal"
        />
        <PlanCard 
            plan="Creator"
            price={billingCycle === 'monthly' ? "$29" : "$240"}
            pricePer={billingCycle === 'monthly' ? "/ month" : "/ year"}
            monthlyBreakdown={billingCycle === 'annual' ? '($20/month)' : undefined}
            savings={billingCycle === 'annual' ? 'Save $108 (31%)' : undefined}
            description="For regular creators & freelancers."
            features={["200 redesigns per month", ...commonFeatures]}
            cta="Choose Creator"
            isPopular={true}
            ribbonText={billingCycle === 'annual' ? 'Best Value' : 'Most Popular'}
        />
        <PlanCard 
            plan="Business"
            price={billingCycle === 'monthly' ? "$60" : "$480"}
            pricePer={billingCycle === 'monthly' ? "/ month" : "/ year"}
            monthlyBreakdown={billingCycle === 'annual' ? '($40/month)' : undefined}
            savings={billingCycle === 'annual' ? 'Save $240 (33%)' : undefined}
            description="For teams, agencies & power users."
            features={["Unlimited redesigns*", ...commonFeatures, "Priority support"]}
            cta="Go Business"
        />
      </div>

      <div className="mt-12 pt-8 text-center border-t border-slate-200/80 max-w-3xl mx-auto">
        <p className="text-lg text-slate-700">
            Want to try it out first? Get 3 images free →
            <button
                onClick={() => onNavigate('main')}
                className="ml-2 font-semibold text-orange-500 hover:underline"
            >
                Start Free
            </button>
        </p>
      </div>

      <div className="mt-8 text-center">
          <p className="text-xs text-slate-400">
            * 'Unlimited' is subject to a fair use policy to prevent abuse.
          </p>
      </div>
    </div>
  );
};