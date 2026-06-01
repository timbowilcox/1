import Link from 'next/link';
import Footer from '@/components/layout/Footer';
import PlanCheckoutButton from '@/components/billing/PlanCheckoutButton';

export const metadata = {
    title: "Pricing — RealStyler",
    description:
        "Simple plans for AI interior restyling. Start free, upgrade for higher monthly limits and white-label client galleries.",
};

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-white">

            <div className="py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-serif text-neutral-900 mb-6">Pricing Plans</h1>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
                        {/* Starter Feature */}
                        <div className="p-8 rounded-3xl bg-white border border-transparent">
                            <div className="text-center mb-8">
                                <h3 className="text-xl font-medium text-neutral-900 mb-2">Starter</h3>
                                <div className="text-4xl font-serif text-neutral-900 mb-4">Free</div>
                            </div>

                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 text-sm text-neutral-600">
                                    <span className="text-neutral-900">✓</span> 3 Designs per day
                                </li>
                                <li className="flex items-center gap-3 text-sm text-neutral-600">
                                    <span className="text-neutral-900">✓</span> Standard resolution
                                </li>
                                <li className="flex items-center gap-3 text-sm text-neutral-600">
                                    <span className="text-neutral-900">✓</span> Basic styles
                                </li>
                            </ul>

                            <div className="text-center">
                                <Link href="/upload" className="text-sm font-medium text-neutral-900 hover:text-neutral-700 transition">
                                    Get Started
                                </Link>
                            </div>
                        </div>

                        {/* Pro Feature - Highlighted */}
                        <div className="p-8 rounded-3xl bg-[#F3E8FF] relative transform scale-105 shadow-xl">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#D946EF] text-white px-4 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">
                                MOST POPULAR
                            </div>

                            <div className="text-center mb-8 pt-4">
                                <h3 className="text-xl font-medium text-[#9333EA] mb-2">Pro</h3>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-4xl font-serif text-neutral-900">$29</span>
                                    <span className="text-neutral-500">/mo</span>
                                </div>
                                <p className="text-xs text-neutral-500 mt-2">For home owners and enthusiasts.</p>
                            </div>

                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 text-sm text-neutral-700">
                                    <span className="text-[#9333EA]">✓</span> Hundreds of designs / month
                                </li>
                                <li className="flex items-center gap-3 text-sm text-neutral-700">
                                    <span className="text-[#9333EA]">✓</span> HD / 4K Export
                                </li>
                                <li className="flex items-center gap-3 text-sm text-neutral-700">
                                    <span className="text-[#9333EA]">✓</span> All premium styles
                                </li>
                                <li className="flex items-center gap-3 text-sm text-neutral-700">
                                    <span className="text-[#9333EA]">✓</span> Priority processing
                                </li>
                            </ul>

                            <PlanCheckoutButton
                                plan="PRO"
                                className="w-full py-3 bg-linear-to-r from-[#A855F7] to-[#D946EF] text-white rounded-full text-sm font-bold tracking-wide hover:shadow-lg transition-shadow disabled:opacity-60"
                            >
                                Go Pro
                            </PlanCheckoutButton>
                        </div>

                        {/* Business Feature */}
                        <div className="p-8 rounded-3xl bg-white border border-transparent">
                            <div className="text-center mb-8">
                                <h3 className="text-xl font-medium text-neutral-900 mb-2">Business</h3>
                                <div className="text-4xl font-serif text-neutral-900 mb-4">$99</div>
                            </div>

                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 text-sm text-neutral-600">
                                    <span className="text-neutral-900">✓</span> Everything in Pro
                                </li>
                                <li className="flex items-center gap-3 text-sm text-neutral-600">
                                    <span className="text-neutral-900">✓</span> Highest monthly limit
                                </li>
                                <li className="flex items-center gap-3 text-sm text-neutral-600">
                                    <span className="text-neutral-900">✓</span> White-label client galleries
                                </li>
                                <li className="flex items-center gap-3 text-sm text-neutral-600">
                                    <span className="text-neutral-900">✓</span> Dedicated support
                                </li>
                            </ul>

                            <div className="text-center">
                                <PlanCheckoutButton
                                    plan="PRO_PLUS"
                                    className="text-sm font-medium text-neutral-900 hover:text-neutral-700 transition disabled:opacity-60"
                                >
                                    Go Business
                                </PlanCheckoutButton>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
