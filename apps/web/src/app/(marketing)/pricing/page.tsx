import Link from 'next/link';
import { Button } from '@/components/ui/button';

const plans = [
  {
    name: 'Free',
    price: '0',
    period: '',
    description: 'Quick accessibility check for any page.',
    features: [
      '1 page scan per day',
      'Full WCAG 2.2 analysis',
      'AI-generated code fixes',
      'Accessibility score',
      'Compliance status report',
    ],
    cta: 'Start Free Scan',
    href: '/',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '49',
    period: '/month',
    description: 'Full audits for your entire website.',
    features: [
      'Up to 200 pages per scan',
      'Full issue board with filters',
      'AI remediation for all issues',
      'Before/after code fixes',
      'PDF & CSV reports',
      'Verify scans after fixes',
      'Developer task export',
      'Priority support',
    ],
    cta: 'Start Pro Trial',
    href: '/signup',
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    name: 'Agency',
    price: '149',
    period: '/month',
    description: 'Manage accessibility for multiple clients.',
    features: [
      'Up to 1,000 pages per scan',
      'Unlimited projects',
      'Everything in Pro',
      'Multi-project dashboard',
      'White label reports',
      'API access',
      'Dedicated account manager',
    ],
    cta: 'Contact Sales',
    href: '/signup',
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div>
      {/* Header */}
      <section className="py-16 sm:py-20 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-sm font-semibold text-brand-600 uppercase tracking-wider">Pricing</span>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mt-3 mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Start free, upgrade when you need full-site audits and team features.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="pb-20 sm:pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                  plan.highlighted
                    ? 'border-brand-500 bg-white shadow-xl ring-1 ring-brand-500/20'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {plan.highlighted && (plan as any).badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-brand-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      {(plan as any).badge}
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                </div>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-gray-900">${plan.price}</span>
                  {plan.period && <span className="text-gray-400 text-sm ml-1">{plan.period}</span>}
                </div>
                <Link href={plan.href} className="block mb-8">
                  <Button
                    className={`w-full rounded-xl h-11 font-semibold ${plan.highlighted ? '' : ''}`}
                    variant={plan.highlighted ? 'default' : 'outline'}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </Link>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Human Testing Add-on */}
          <div className="max-w-3xl mx-auto mt-16">
            <div className="relative rounded-2xl p-8 sm:p-10 bg-gradient-to-br from-purple-50 via-brand-50 to-blue-50 border border-purple-200/50 text-center">
              <span className="text-sm font-semibold text-purple-600 uppercase tracking-wider">Add-on</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2 mb-3">Human Testing</h2>
              <p className="text-gray-600 mb-6 max-w-lg mx-auto">
                Real users with disabilities test your site. Screen readers, keyboard navigation,
                low vision, cognitive — validated by humans, not just rules.
              </p>
              <p className="text-4xl font-bold text-gray-900 mb-6">
                From <span className="text-brand-600">$150</span>
                <span className="text-base text-gray-400 font-normal ml-1">per test</span>
              </p>
              <Link href="/signup">
                <Button size="lg" className="rounded-xl px-8">Learn More</Button>
              </Link>
            </div>
          </div>

          {/* FAQ-like note */}
          <div className="text-center mt-12">
            <p className="text-sm text-gray-400">
              All plans include WCAG 2.2 Level A &amp; AA testing, ADA / Section 508 / EAA compliance mapping, and AI-powered remediation.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
