import Footer from '@/components/layout/Footer';

export const metadata = {
    title: "Features — RealStyler",
    description:
        "AI-powered interior restyling, curated style presets, projects & collections, and shareable client galleries.",
};

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-white">

            <div className="py-24 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-serif text-neutral-900 mb-6">Features</h1>
                        <p className="text-neutral-500 max-w-2xl mx-auto text-lg leading-relaxed">
                            Discover the power of AI-driven interior design with RealStyler. We combine precision geometry with advanced style transfer.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="p-8 bg-neutral-50 border border-neutral-200 rounded-3xl hover:shadow-lg transition-all duration-300">
                            <h3 className="text-xl font-serif font-medium text-neutral-900 mb-3">Smart Style Transfer</h3>
                            <p className="text-neutral-600 leading-relaxed">
                                Upload your room and instantly see it transformed into any style you choose. Our AI maintains the structural integrity of your space while completely reimagining the aesthetics.
                            </p>
                        </div>

                        <div className="p-8 bg-neutral-50 border border-neutral-200 rounded-3xl hover:shadow-lg transition-all duration-300">
                            <h3 className="text-xl font-serif font-medium text-neutral-900 mb-3">Multi-Room Processing</h3>
                            <p className="text-neutral-600 leading-relaxed">
                                Efficiently process unlimited images. Perfect for restyling an entire home or managing multiple client projects simultaneously.
                            </p>
                        </div>

                        <div className="p-8 bg-neutral-50 border border-neutral-200 rounded-3xl hover:shadow-lg transition-all duration-300">
                            <h3 className="text-xl font-serif font-medium text-neutral-900 mb-3">High-Res Export</h3>
                            <p className="text-neutral-600 leading-relaxed">
                                Download crystal clear 4K images perfect for client presentations, marketing materials, or detailed contractor references.
                            </p>
                        </div>

                        <div className="p-8 bg-neutral-50 border border-neutral-200 rounded-3xl hover:shadow-lg transition-all duration-300">
                            <h3 className="text-xl font-serif font-medium text-neutral-900 mb-3">Style History</h3>
                            <p className="text-neutral-600 leading-relaxed">
                                Every generation is saved to your personal history. Compare iterations, revisit previous ideas, and keep track of your design evolution.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
