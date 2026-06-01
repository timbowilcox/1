import Footer from '@/components/layout/Footer';

// NOTE: This is a product-accurate draft. Before launch, have it reviewed by
// counsel and fill the bracketed placeholders ([Company Legal Name], address,
// [Jurisdiction]). Keep in sync with the actual sub-processors in use.
export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="py-24 px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-16">
                        <h1 className="text-4xl md:text-5xl font-serif text-neutral-900 mb-6">Privacy Policy</h1>
                        <p className="text-neutral-500">Last updated: June 1, 2026</p>
                    </div>

                    <div className="space-y-12 text-neutral-600 leading-relaxed font-light">
                        <section>
                            <p>
                                This Privacy Policy explains how RealStyler (&ldquo;RealStyler&rdquo;,
                                &ldquo;we&rdquo;, &ldquo;us&rdquo;), operated by [Company Legal Name],
                                collects, uses, and protects your information when you use our website
                                and AI image-restyling service (the &ldquo;Service&rdquo;). The data
                                controller is [Company Legal Name], [registered address].
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-serif text-neutral-900 mb-4">1. Information We Collect</h2>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Account data:</strong> your name, email address, and a securely hashed password. We never store your password in plain text.</li>
                                <li><strong>Images you upload</strong> (and any URLs you provide for image scraping), together with the restyled images we generate for you.</li>
                                <li><strong>Usage data:</strong> generation counts and quota usage, projects and collections you create, and basic technical logs (IP address, timestamps) used for security and rate limiting.</li>
                                <li><strong>Billing data:</strong> your subscription tier and status. Card details are entered directly with our payment processor (Stripe) — <strong>we do not receive or store your full card number.</strong></li>
                                <li><strong>Cookies:</strong> a single essential, HTTP-only session cookie to keep you signed in. We do not use third-party advertising cookies.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-serif text-neutral-900 mb-4">2. How We Use Your Information</h2>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>To provide the Service — store your images, run AI restyling, and display your results, projects, and shared collections.</li>
                                <li>To manage your account, subscription, and quota, and to process payments through Stripe.</li>
                                <li>To send essential transactional emails (email verification, password reset, billing notices).</li>
                                <li>To secure the Service (authentication, rate limiting, abuse and fraud prevention) and to comply with legal obligations.</li>
                            </ul>
                            <p className="mt-4">
                                Our legal bases (where GDPR applies) are performance of our contract with
                                you, your consent, our legitimate interests in operating and securing the
                                Service, and compliance with legal obligations.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-serif text-neutral-900 mb-4">3. AI Processing of Your Images</h2>
                            <p>
                                To restyle your images, we send them to third-party AI providers (such as
                                Google Gemini, OpenAI, and Stability AI) via their APIs. These providers
                                process the images to return a restyled result. We use their API offerings,
                                under which, per their published terms, submitted content is not used to
                                train their models. Restyled outputs are generated automatically and may
                                not be accurate; they are not professional design, architectural, or real-
                                estate advice.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-serif text-neutral-900 mb-4">4. Sub-processors &amp; Third Parties</h2>
                            <p className="mb-4">We share data only with service providers that help us run the Service, under appropriate data-processing terms. We do not sell your personal information. Our key sub-processors are:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Supabase</strong> — database and image storage.</li>
                                <li><strong>Stripe</strong> — payment processing and subscription management.</li>
                                <li><strong>Google, OpenAI, Stability AI</strong> — AI image generation.</li>
                                <li><strong>Resend</strong> — transactional email delivery.</li>
                                <li>Our cloud hosting and content-delivery providers.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-serif text-neutral-900 mb-4">5. Data Retention &amp; Deletion</h2>
                            <p>
                                We retain your account data and images for as long as your account is
                                active. You can delete individual images, projects, and collections at any
                                time. When you delete your account, we delete your personal data and stored
                                images within 30 days, except where we must retain limited records (e.g.,
                                billing records) to meet legal obligations. To request deletion, use the
                                account settings or contact us.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-serif text-neutral-900 mb-4">6. Your Rights</h2>
                            <p>
                                Depending on your location (including under the GDPR and CCPA/CPRA), you may
                                have the right to access, correct, delete, or export your personal data, to
                                object to or restrict certain processing, and to withdraw consent. You may
                                also lodge a complaint with your local data-protection authority. To
                                exercise these rights, contact <a className="underline" href="mailto:privacy@realstyler.com">privacy@realstyler.com</a>.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-serif text-neutral-900 mb-4">7. Data Security</h2>
                            <p>
                                We protect your data with encryption in transit (HTTPS), hashed passwords,
                                access controls, signed time-limited URLs for private images, and
                                infrastructure hardening. No method of transmission or storage is completely
                                secure, but we work to protect your information and review our practices
                                regularly.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-serif text-neutral-900 mb-4">8. International Transfers</h2>
                            <p>
                                Your data may be processed in countries other than your own (including by
                                the sub-processors above). Where required, we rely on appropriate safeguards
                                such as Standard Contractual Clauses for such transfers.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-serif text-neutral-900 mb-4">9. Children</h2>
                            <p>
                                The Service is not directed to children under 16, and we do not knowingly
                                collect personal data from them. If you believe a child has provided us data,
                                contact us and we will delete it.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-serif text-neutral-900 mb-4">10. Changes &amp; Contact</h2>
                            <p>
                                We may update this policy from time to time; material changes will be posted
                                here with a new &ldquo;Last updated&rdquo; date. Questions or requests:
                                {' '}<a className="underline" href="mailto:privacy@realstyler.com">privacy@realstyler.com</a>.
                            </p>
                        </section>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
