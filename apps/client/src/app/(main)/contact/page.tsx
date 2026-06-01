"use client";

import { useState } from "react";
import Footer from "@/components/layout/Footer";

export default function ContactPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const subject = encodeURIComponent(`Contact from ${name || "a RealStyler visitor"}`);
        const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
        window.location.href = `mailto:support@realstyler.com?subject=${subject}&body=${body}`;
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="py-24 px-4">
                <div className="max-w-xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-serif text-neutral-900 mb-4 text-center">Get in Touch</h1>
                    <p className="text-neutral-500 mb-12 text-center">
                        Have questions? We&apos;d love to hear from you.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">Name</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-lg bg-white border border-neutral-200 focus:border-neutral-900 focus:ring-0 outline-none transition-colors text-neutral-900 placeholder:text-neutral-400"
                                placeholder="Your name"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-lg bg-white border border-neutral-200 focus:border-neutral-900 focus:ring-0 outline-none transition-colors text-neutral-900 placeholder:text-neutral-400"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-neutral-700 mb-2">Message</label>
                            <textarea
                                id="message"
                                rows={5}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-lg bg-white border border-neutral-200 focus:border-neutral-900 focus:ring-0 outline-none transition-colors text-neutral-900 placeholder:text-neutral-400"
                                placeholder="How can we help?"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-4 bg-black hover:bg-neutral-800 text-white font-semibold rounded-full transition-colors"
                        >
                            Send Message
                        </button>
                    </form>

                    <p className="text-center text-sm text-neutral-400 mt-6">
                        Or email us directly at{" "}
                        <a href="mailto:support@realstyler.com" className="underline hover:text-neutral-700">
                            support@realstyler.com
                        </a>
                    </p>
                </div>
            </div>

            <Footer />
        </div>
    );
}
