import Footer from '@/components/layout/Footer';

export const metadata = {
    title: "FAQ — RealStyler",
    description:
        "Answers to common questions about RealStyler's AI interior restyling, plans, and billing.",
};

export default function FAQPage() {
    return (
        <div className="min-h-screen bg-white">

            <div className="py-24 px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl font-serif text-neutral-900 mb-6">Frequently Asked Questions</h1>
                        <p className="text-neutral-500 max-w-xl mx-auto text-lg leading-relaxed">
                            Everything you need to know about RealStyler.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="p-8 bg-neutral-50 border border-neutral-200 rounded-2xl">
                            <h3 className="text-lg font-serif font-medium text-neutral-900 mb-3">How does it work?</h3>
                            <p className="text-neutral-600 leading-relaxed">We use advanced AI models to analyze the structure of your room and apply new design styles while maintaining the original layout. Our tool understands geometry, lighting, and textures.</p>
                        </div>

                        <div className="p-8 bg-neutral-50 border border-neutral-200 rounded-2xl">
                            <h3 className="text-lg font-serif font-medium text-neutral-900 mb-3">Is it free to use?</h3>
                            <p className="text-neutral-600 leading-relaxed">Yes, we offer a free tier that allows you to generate a limited number of designs per day (Starter Plan). For unlimited access, higher resolution, and faster processing, you can upgrade to our Pro plan.</p>
                        </div>

                        <div className="p-8 bg-neutral-50 border border-neutral-200 rounded-2xl">
                            <h3 className="text-lg font-serif font-medium text-neutral-900 mb-3">Can I upload any image?</h3>
                            <p className="text-neutral-600 leading-relaxed">Yes, as long as it is a JPG, PNG, or WebP file. For best results, use well-lit photos of empty or furnished rooms. We support images up to 10MB.</p>
                        </div>

                        <div className="p-8 bg-neutral-50 border border-neutral-200 rounded-2xl">
                            <h3 className="text-lg font-serif font-medium text-neutral-900 mb-3">Do you offer refunds?</h3>
                            <p className="text-neutral-600 leading-relaxed">If you are not satisfied with our Pro plan, please contact our support team within 14 days of purchase for a full refund. No questions asked.</p>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
