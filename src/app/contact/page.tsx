"use client";

import { useState } from "react";
import { Mail, MapPin, Clock, Send } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { track, EVENTS } from "@/lib/analytics";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SuccessCheckmark } from "@/components/ui/success-checkmark";

const contactInfo = [
  {
    icon: Mail,
    title: "Email",
    detail: "omardakelbab.dev@gmail.com",
    description: "We typically respond within 24 hours",
  },
  {
    icon: MapPin,
    title: "Office",
    detail: "Remote-first company",
    description: "Team members across 12+ countries",
  },
  {
    icon: Clock,
    title: "Support Hours",
    detail: "Monday – Friday",
    description: "9:00 AM – 6:00 PM (UTC)",
  },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error?.message || "Failed to send message");
        return;
      }

      setSubmitted(true);
      track(EVENTS.CONTACT_FORM_SUBMITTED, { subject: data.subject });
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 py-16 sm:py-20">
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-accent-600/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Contact Us
          </h1>
          <p className="mt-4 text-white/60">
            Have a question or need help? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-5">
            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-6">
              <ScrollReveal direction="left">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Get in touch</h2>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                    Reach out and we&apos;ll get back to you as soon as possible.
                  </p>
                </div>
                <div className="space-y-5 mt-6">
                  {contactInfo.map((item) => (
                    <div key={item.title} className="flex gap-4 transition-transform duration-300 hover:scale-105">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50">
                        <item.icon className="h-5 w-5 text-brand-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                        <p className="text-sm text-gray-900">{item.detail}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              <ScrollReveal direction="right">
                {submitted ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-cream p-12 text-center">
                    <SuccessCheckmark show={true} size="lg" className="mb-4" />
                    <h3 className="text-xl font-bold text-gray-900">Message sent!</h3>
                    <p className="mt-2 text-sm text-gray-500 max-w-sm">
                      Thanks for reaching out. We&apos;ll get back to you within 24 hours.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="mt-6 text-sm font-medium text-accent-600 hover:text-accent-700 transition-colors"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                          Name
                        </label>
                        <Input id="name" name="name" required placeholder="Your full name" />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                          Email
                        </label>
                        <Input id="email" name="email" type="email" required placeholder="you@example.com" />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Subject
                      </label>
                      <Input id="subject" name="subject" required placeholder="What is this about?" />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={5}
                        placeholder="Tell us how we can help..."
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-accent-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-accent-100 transition-colors resize-none"
                      />
                    </div>
                    <Button type="submit" size="lg" className="w-full" loading={loading}>
                      Send Message
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                )}
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
