import Footer from '@/components/layout/Footer';

export const metadata = {
    title: "About — RealStyler",
    description:
        "RealStyler helps agents and homeowners reimagine spaces with AI-powered interior design.",
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white">

            <div className="py-24 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-serif text-neutral-900 mb-8">About RealStyler</h1>
                    <p className="text-xl text-neutral-600 mb-12 font-light">
                        We are on a mission to democratize interior design.
                    </p>

                    <div className="space-y-8 text-lg text-neutral-600 leading-relaxed mb-16">
                        <p>
                            RealStyler was born from the idea that everyone deserves a beautiful home.
                            Traditional interior design is expensive and time-consuming.
                            We leverage the power of Artificial Intelligence to give you instant access to
                            professional-grade design concepts for a fraction of the cost.
                        </p>

                        <p>
                            Our team consists of architects, AI researchers, and designers working together
                            to build the next generation of creative tools.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="p-8 rounded-2xl bg-neutral-50 border border-neutral-100">
                            <div className="text-4xl font-serif text-neutral-900 mb-2">10k+</div>
                            <div className="text-sm font-medium text-neutral-500 uppercase tracking-wide">Designs Generated</div>
                        </div>
                        <div className="p-8 rounded-2xl bg-neutral-50 border border-neutral-100">
                            <div className="text-4xl font-serif text-neutral-900 mb-2">50+</div>
                            <div className="text-sm font-medium text-neutral-500 uppercase tracking-wide">Countries Served</div>
                        </div>
                        <div className="p-8 rounded-2xl bg-neutral-50 border border-neutral-100">
                            <div className="text-4xl font-serif text-neutral-900 mb-2">24/7</div>
                            <div className="text-sm font-medium text-neutral-500 uppercase tracking-wide">AI Availability</div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
