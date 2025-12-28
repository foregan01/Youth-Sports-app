import { Link } from 'react-router-dom';
import {
  DollarSign,
  Camera,
  Bell,
  Shield,
  CheckCircle,
  ArrowRight,
  Users,
  Clock,
  BarChart3,
  Smartphone,
} from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="font-bold text-xl text-gray-900">TeamBudget</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary">
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            See Where Every Dollar Goes.
            <br />
            <span className="text-primary-600">In Real-Time.</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            Stop the texts. End the spreadsheet chaos. Give your youth sports team complete
            financial transparency that parents actually trust.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="btn-success text-lg px-8 py-4">
              Start Your Free Demo
              <ArrowRight size={20} className="ml-2" />
            </Link>
            <p className="text-sm text-gray-500">No credit card required</p>
          </div>

          {/* Social Proof */}
          <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-gray-500">
            <div className="flex items-center gap-2">
              <Users size={20} />
              <span>2,847 teams</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign size={20} />
              <span>$4.2M tracked</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={20} />
              <span>92% fewer questions</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Your Team's Financial Chaos Ends Today
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: 'The 11PM Text Storm',
                description:
                  'Parents demanding to know where their $500 registration went—while you\'re trying to sleep',
              },
              {
                title: 'The Excel Nightmare',
                description:
                  'Juggling receipts, spreadsheets, and Venmo screenshots that never quite add up',
              },
              {
                title: 'The Trust Crisis',
                description:
                  "Arguments erupting in Facebook groups because nobody can see where the money actually goes",
              },
              {
                title: 'The Time Drain',
                description:
                  'Spending Sunday afternoons creating budget reports that nobody reads anyway',
              },
            ].map((item, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Financial Clarity in 3 Taps</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-16">
            TeamBudget transforms your team's messy finances into a crystal-clear dashboard that
            updates instantly.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Connect Your Team',
                description: 'Import your roster or sync with TeamSnap/SportsEngine—takes 2 minutes',
              },
              {
                step: '2',
                title: 'Track Everything',
                description: 'Snap receipts, log expenses, collect fees—all in one place',
              },
              {
                step: '3',
                title: 'Parents Stay Informed',
                description: 'Automatic updates keep everyone in the loop, no manual reports needed',
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary-600 font-bold text-xl">{item.step}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Everything You Need, Nothing You Don't
          </h2>
          <p className="text-center text-gray-600 mb-16">
            Purpose-built for youth sports teams
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Smartphone,
                title: 'Real-Time Parent Portal',
                description: 'Parents see a live feed of team finances without bothering you',
              },
              {
                icon: Camera,
                title: 'Smart Receipt Scanner',
                description: 'Snap, categorize, forget—AI handles the data entry',
              },
              {
                icon: CheckCircle,
                title: 'Automatic Collections',
                description: "Know instantly who's paid and who hasn't—with gentle reminders",
              },
              {
                icon: BarChart3,
                title: 'One-Click Reports',
                description: 'Season summaries, tournament breakdowns—instantly generated',
              },
              {
                icon: Bell,
                title: 'Smart Notifications',
                description: 'Budget updates and expense alerts keep everyone informed',
              },
              {
                icon: Shield,
                title: 'Bank-Level Security',
                description: 'Your financial data protected with 256-bit encryption',
              },
            ].map((feature, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="text-primary-600" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Treasurers Love Their Weekends Again
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "I went from spending 5 hours every month on budget reports to 5 minutes. Parents actually thank me now instead of interrogating me at practice.",
                author: 'Mike Rodriguez',
                role: 'Baseball Team Treasurer, Austin TX',
              },
              {
                quote:
                  'The Facebook group drama stopped overnight. When parents can see exactly where their fees went, the questions just disappear.',
                author: 'Jennifer Park',
                role: 'Soccer League Administrator, Portland OR',
              },
              {
                quote:
                  "As a parent, I finally understand our team's finances. No more wondering if we're being overcharged or where the fundraising money went.",
                author: 'David Thompson',
                role: 'Hockey Parent, Minneapolis MN',
              },
            ].map((testimonial, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <p className="text-gray-600 mb-4">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.author}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Transparent Pricing for Transparent Budgets
          </h2>
          <p className="text-center text-gray-600 mb-12">Start free, upgrade when you're ready</p>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Starter',
                price: '$24',
                period: '/month',
                description: 'Perfect for single teams',
                features: [
                  '1 team',
                  'Unlimited parents',
                  'Real-time updates',
                  'Receipt scanning',
                  'Basic reports',
                ],
                cta: 'Start Free Trial',
                popular: false,
              },
              {
                name: 'Pro',
                price: '$49',
                period: '/month',
                description: 'For multi-team treasurers',
                features: [
                  'Up to 3 teams',
                  'Advanced analytics',
                  'Priority support',
                  'Custom categories',
                  'API integrations',
                ],
                cta: 'Start Free Trial',
                popular: true,
              },
              {
                name: 'League',
                price: 'Custom',
                period: '',
                description: 'For leagues and organizations',
                features: [
                  'Unlimited teams',
                  'White-label options',
                  'Dedicated onboarding',
                  'Admin dashboard',
                  'Custom features',
                ],
                cta: 'Contact Sales',
                popular: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`bg-white p-8 rounded-xl shadow-sm border-2 ${
                  plan.popular ? 'border-primary-500 relative' : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-sm font-medium px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-600">
                      <CheckCircle size={16} className="text-success-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={`block w-full text-center py-3 rounded-lg font-medium ${
                    plan.popular
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Stop the Drama. Start the Season.
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of teams who've eliminated budget chaos. Your parents will thank you.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
          >
            Start Your Free 14-Day Trial
            <ArrowRight size={20} className="ml-2" />
          </Link>
          <p className="text-primary-200 mt-4 text-sm">
            No credit card required • Cancel anytime • 30-day money-back guarantee
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">T</span>
                </div>
                <span className="font-bold text-xl text-white">TeamBudget</span>
              </div>
              <p className="text-sm">
                Financial transparency for youth sports teams. Making budget management simple.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} TeamBudget. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
