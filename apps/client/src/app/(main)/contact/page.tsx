export default function ContactPage() {
    return (
        <div className="min-h-screen py-20 px-4">
            <div className="max-w-xl mx-auto">
                <h1 className="text-4xl font-bold mb-6 text-center">Get in Touch</h1>
                <p className="text-white/60 mb-12 text-center">
                    Have questions? We&apos;d love to hear from you.
                </p>

                <form className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-2">Name</label>
                        <input
                            type="text"
                            id="name"
                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all text-white"
                            placeholder="Your name"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">Email</label>
                        <input
                            type="email"
                            id="email"
                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all text-white"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-white/80 mb-2">Message</label>
                        <textarea
                            id="message"
                            rows={5}
                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all text-white"
                            placeholder="How can we help?"
                        />
                    </div>
                    <button type="button" className="w-full py-4 bg-white hover:bg-white/90 text-black font-semibold rounded-lg transition-colors">
                        Send Message
                    </button>
                </form>
            </div>
        </div>
    );
}
