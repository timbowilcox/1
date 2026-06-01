import Image from 'next/image';
import Footer from '@/components/layout/Footer';

export default function BlogPage() {
    return (
        <div className="min-h-screen bg-white">

            <div className="py-24 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-serif text-neutral-900 mb-6">Journal</h1>
                        <p className="text-xl text-neutral-500 font-light">
                            Thoughts on design, architecture, and technology.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Article 1 */}
                        <div className="group cursor-pointer">
                            <div className="aspect-video bg-neutral-100 rounded-2xl mb-6 overflow-hidden relative">
                                <Image
                                    src="/modern_living_room_1766406771698.png"
                                    alt="Feature Allocator"
                                    fill
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300"></div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="font-medium text-neutral-900 uppercase tracking-wider">Design Tips</span>
                                    <span className="text-neutral-400">•</span>
                                    <span className="text-neutral-500">Dec 19, 2024</span>
                                </div>
                                <h2 className="text-2xl font-serif text-neutral-900 group-hover:underline decoration-1 underline-offset-4 transition-all">
                                    Top 10 Interior Design Trends for 2025
                                </h2>
                                <p className="text-neutral-500 leading-relaxed">
                                    Discover what&apos;s hot in the world of interior design next year. From sustainable materials to bold colors, see how AI is predicting the next big shift.
                                </p>
                            </div>
                        </div>

                        {/* Article 2 */}
                        <div className="group cursor-pointer">
                            <div className="aspect-video bg-neutral-100 rounded-2xl mb-6 overflow-hidden relative">
                                <Image
                                    src="/yellow_chair_interior_1766406787652.png"
                                    alt="Virtual Staging"
                                    fill
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300"></div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="font-medium text-neutral-900 uppercase tracking-wider">AI Technology</span>
                                    <span className="text-neutral-400">•</span>
                                    <span className="text-neutral-500">Dec 15, 2024</span>
                                </div>
                                <h2 className="text-2xl font-serif text-neutral-900 group-hover:underline decoration-1 underline-offset-4 transition-all">
                                    How AI is changing Home Staging
                                </h2>
                                <p className="text-neutral-500 leading-relaxed">
                                    Virtual staging is becoming the standard for real estate agents. Learn how AI makes it faster, cheaper, and more realistic than ever before.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}