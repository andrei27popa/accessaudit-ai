import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const plans = [
  {
    name: 'Free',
    price: '0',
    description: 'Quick accessibility check for any page.',
    features: [
      '1 URL scan per day',
      'Top 5 issues detected',
      '3 AI fix suggestions with code',
      'Accessibility score',
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
      'PDF reports (executive + technical)',
      'Verify scans after fixes',
      'Developer task export',
    ],
    cta: 'Start Pro Trial',
    href: '/signup',
    highlighted: true,
  },
  {
    name: 'Agency',
    price: '149',
    period: '/month',
    description: 'Manage accessibility for multiple clients.',
    features: [
      'Up to 1000 pages per scan',
      'Unlimited projects',
      'Everything in Pro',
      'Multi-project dashboard',
      'Export developer tasks',
      'API access (coming soon)',
      'White label reports (coming soon)',
    ],
    cta: 'Contact Sales',
    href: '/signup',
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h1>
          <p className="text-xl text-gray-600">
            Start free, upgrade when you need full audits.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={plan.highlighted ? 'border-brand-500 shadow-lg ring-1 ring-brand-500' : ''}
            >
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  {plan.period && <span className="text-gray-500">{plan.period}</span>}
                </div>
                <p className="text-sm text-gray-500 mt-2">{plan.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-green-500 mt-0.5">&#10003;</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href}>
                  <Button
                    className="w-full"
                    variant={plan.highlighted ? 'default' : 'outline'}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Human Testing Add-on */}
        <div className="max-w-3xl mx-auto mt-16">
          <Card className="bg-gradient-to-r from-purple-50 to-brand-50 border-purple-200">
            <CardContent className="py-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Human Testing Add-on</h2>
              <p className="text-gray-600 mb-4">
                Real users with disabilities test your site. Screen readers, keyboard navigation,
                low vision, cognitive - validated by humans, not just rules.
              </p>
              <p className="text-3xl font-bold text-gray-900 mb-4">
                From <span className="text-brand-600">$150</span> per test
              </p>
              <Link href="/signup">
                <Button size="lg">Learn More</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
