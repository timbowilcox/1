import Footer from '@/components/layout/Footer';

export const metadata = {
    title: "Careers — RealStyler",
    description: "Join the RealStyler team and help reshape how spaces are designed with AI.",
};

export default function CareersPage() {
    return (
        <div className="min-h-screen bg-white">

            <div className="py-24 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-serif text-neutral-900 mb-6">Join Our Team</h1>
                    <p className="text-xl text-neutral-500 mb-16 font-light">
                        Help us build the future of interior design.
                    </p>

                    <div className="p-12 border border-neutral-200 rounded-3xl bg-neutral-50">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white border border-neutral-100 flex items-center justify-center">
                            <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-serif text-neutral-900 mb-4">No Open Positions</h3>
                        <p className="text-neutral-600 leading-relaxed max-w-lg mx-auto">
                            We are not currently hiring, but we are always looking for talented individuals.
                            Feel free to check back later or send us a resume at <span className="text-black font-medium border-b border-black">careers@realstyler.com</span>.
                        </p>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
