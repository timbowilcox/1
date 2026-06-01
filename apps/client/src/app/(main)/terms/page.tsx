import Footer from '@/components/layout/Footer';

// NOTE: Product-accurate draft — have counsel review and fill the bracketed
// placeholders ([Company Legal Name], [Jurisdiction]) before launch.
export default function TermsPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="py-24 px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-16">
                        <h1 className="text-4xl md:text-5xl font-serif text-neutral-900 mb-6">Terms of Service</h1>
                        <p className="text-neutral-500">Last updated: June 1, 2026</p>
                    </div>

                    <div className="space-y-12 text-neutral-600 leading-relaxed font-light">
                        <section>
                            <h2 className="text-2xl font-serif text-neutral-900 mb-4">1. Acceptance of Terms</h2>
                            <p>
                                These Terms of Service (&ldquo;Terms&rdquo;) govern your use of RealStyler
                                (the &ldquo;Service&rdquo;), operated by [Company Legal Name]. By creating
                                an account or using the Service, you agree to these Terms and to our Privacy
                                Policy. If you do not agree, do not use the Service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-serif text-neutral-900 mb-4">2. The Service</h2>
                            <p>
                                RealStyler provides AI-powered restyling and visualization of interior and
                                property images. Outputs are generated automatically, may vary in quality,
                                and are provided for illustration only — they are not professional design,
                                architectural, surveying, or real-estate advice, and may not depict actual
                                or achievable spaces.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-serif text-neutral-900 mb-4">3. Accounts</h2>
                            <p>
                                You must provide accurate information, be at least 16 years old, and keep
                                your credentials secure. You are responsible for activity under your account.
                                Notify us promptly of any unauthorized use.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-serif text-neutral-900 mb-4">4. Subscriptions, Billing &amp; Refunds</h2>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Paid plans (Pro, Pro Plus) are billed in advance on a recurring basis through our payment processor, Stripe, and renew automatically until cancelled.</li>
                                <li>Each plan includes a usage quota of image generations per billing period; the free tier includes a limited allowance.</li>
                                <li>You can cancel at any time via the billing portal; cancellation takes effect at the end of the current period, and you retain access until then.</li>
                                <li>Except where required by law, payments are non-refundable. Quota does not roll over between periods.</li>
                                <li>We may change pricing with reasonable notice; changes apply to the next billing period.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-serif text-neutral-900 mb-4">5. Your Content &amp; Licence</h2>
                            <p>
                                You retain ownership of the images you upload. You grant us a limited licence
                                to host, process, and transmit your images to our AI sub-processors solely to
                                provide the Service to you, and to display restyled results, projects, and the
                                collections you choose to share. You represent that you have the rights to the
                                images you upload and that they do not infringe any third party&rsquo;s rights.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-serif text-neutral-900 mb-4">6. Acceptable Use</h2>
                            <p className="mb-4">You agree not to:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Upload content that is unlawful, infringing, harmful, or that you lack the rights to use.</li>
                                <li>Attempt to bypass quotas, rate limits, or access controls, or to access other users&rsquo; data.</li>
                                <li>Reverse engineer, scrape, overload, or disrupt the Service, or resell it without authorization.</li>
                                <li>Use the Service to generate misleading representations of real properties in violation of applicable advertising or real-estate disclosure laws.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-serif text-neutral-900 mb-4">7. Intellectual Property</h2>
                            <p>
                                The Service, including its software, design, and branding, is owned by
                                [Company Legal Name] and protected by intellectual-property laws. These Terms
                                grant you no rights to our trademarks or to the Service except the right to
                                use it in accordance with these Terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-serif text-neutral-900 mb-4">8. Disclaimers &amp; Limitation of Liability</h2>
                            <p>
                                The Service is provided &ldquo;as is&rdquo; without warranties of any kind,
                                to the maximum extent permitted by law. We do not warrant that outputs will
                                be accurate, error-free, or fit for any particular purpose. To the extent
                                permitted by law, our aggregate liability arising out of or relating to the
                                Service will not exceed the amount you paid us in the 12 months before the
                                claim. Nothing limits liability that cannot be limited under applicable law.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-serif text-neutral-900 mb-4">9. Termination</h2>
                            <p>
                                You may stop using the Service and delete your account at any time. We may
                                suspend or terminate access for breach of these Terms or to comply with law.
                                On termination, your right to use the Service ends and we may delete your data
                                as described in the Privacy Policy.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-serif text-neutral-900 mb-4">10. Governing Law &amp; Contact</h2>
                            <p>
                                These Terms are governed by the laws of [Jurisdiction], and disputes are
                                subject to the courts of [Jurisdiction]. We may update these Terms from time
                                to time; continued use after changes constitutes acceptance. Questions:
                                {' '}<a className="underline" href="mailto:legal@realstyler.com">legal@realstyler.com</a>.
                            </p>
                        </section>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
