"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Invalid email address.",
  }),
  phone: z.string().optional(),
  sessionType: z.string().min(1, { message: "Please select a session type." }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
});

export default function ContactPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      sessionType: "",
      message: "",
    },
  });

  useEffect(() => {
    setIsLoaded(true);

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        toast.success(
          "Thank you for your message! I'll get back to you within 24 hours."
        );
        form.reset();
      } else {
        toast.error("Failed to send message. Please try again later.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An unexpected error occurred. Please try again later.");
    }
  }

  function onError(errors: any) {
    toast.error("Please correct the errors in the form.");
    console.error(errors);
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-32 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div
            className={`space-y-8 transition-all duration-1500 ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="space-y-6">
              <div className="w-12 h-px bg-gray-400 mx-auto"></div>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light text-gray-900 tracking-tight">
                Let's Create Something
                <br />
                <em className="font-medium">Beautiful</em>
              </h1>
              <div className="w-12 h-px bg-gray-400 mx-auto"></div>
            </div>
            <p className="text-lg sm:text-xl text-gray-600 font-light max-w-2xl mx-auto leading-relaxed">
              Ready to capture your special moments? Get in touch and let's
              discuss your photography needs.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Information */}
            <div
              className={`transition-all duration-1000 ${
                isLoaded
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-8"
              }`}
              style={{ transitionDelay: "200ms" }}
            >
              <div className="space-y-12">
                <div className="space-y-4">
                  <h2 className="font-serif text-2xl sm:text-3xl font-light text-gray-900">
                    Get in Touch
                  </h2>
                  <div className="w-8 h-px bg-gray-300"></div>
                </div>

                <div className="space-y-8">
                  {/* Contact Details */}
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-6 h-6 mt-1 flex-shrink-0">
                        <svg
                          className="w-6 h-6 text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Email
                        </p>
                        <p className="text-gray-900">hello@photography.com</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-6 h-6 mt-1 flex-shrink-0">
                        <svg
                          className="w-6 h-6 text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Phone
                        </p>
                        <p className="text-gray-900">(555) 123-4567</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-6 h-6 mt-1 flex-shrink-0">
                        <svg
                          className="w-6 h-6 text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Location
                        </p>
                        <p className="text-gray-900">
                          Available for sessions worldwide
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="space-y-4">
                    <h3 className="font-serif text-lg font-medium text-gray-900">
                      Follow My Work
                    </h3>
                    <div className="flex space-x-6">
                      <Link
                        href="#"
                        className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                        aria-label="Instagram"
                      >
                        <svg
                          className="h-6 w-6"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.057-1.644.069-4.85.069-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      </Link>
                      <Link
                        href="#"
                        className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                        aria-label="Facebook"
                      >
                        <svg
                          className="w-6 h-6"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Contact Form */}
            <div
              className={`transition-all duration-1000 ${
                isLoaded
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-8"
              }`}
            >
              <Card className="border-0 shadow-none py-0 pb-6">
                <CardContent className="p-0">
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h2 className="font-serif text-2xl sm:text-3xl font-light text-gray-900">
                        Book a Session
                      </h2>
                      <div className="w-8 h-px bg-gray-300"></div>
                    </div>

                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmit, onError)}
                        className="space-y-6"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel className="text-sm font-medium text-gray-700">
                                  Full Name *
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="text"
                                    placeholder="Your name"
                                    className="w-full p-3 focus:border-gray-900 focus:outline-none transition-colors text-gray-900 placeholder-gray-400"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel className="text-sm font-medium text-gray-700">
                                  Email Address *
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="email"
                                    placeholder="your@email.com"
                                    className="w-full p-3 focus:border-gray-900 focus:outline-none transition-colors text-gray-900 placeholder-gray-400"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="sessionType"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-sm font-medium text-gray-700">
                                Session Type *
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a session type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectItem value="portrait">
                                      Portrait Session
                                    </SelectItem>
                                    <SelectItem value="wedding">
                                      Wedding Photography
                                    </SelectItem>
                                    <SelectItem value="event">
                                      Event Photography
                                    </SelectItem>
                                    <SelectItem value="family">
                                      Family Session
                                    </SelectItem>
                                    <SelectItem value="corporate">
                                      Corporate Photography
                                    </SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-sm font-medium text-gray-700 pb-5">
                                Message *
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Tell me about your vision and what you're looking for..."
                                  rows={5}
                                  className="w-full p-3 border-0 focus:border-gray-900 focus:outline-none transition-colors text-gray-900 placeholder-gray-400 resize-none"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="pt-6">
                          <Button
                            type="submit"
                            size="lg"
                            className="w-full sm:w-auto px-12 py-4 text-base font-light bg-gray-900 hover:bg-gray-800 transition-all duration-500 rounded-md cursor-pointer"
                          >
                            Send Message
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-gray-900 hover:bg-gray-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center cursor-pointer"
          aria-label="Scroll to top"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      )}
      <Toaster position="bottom-right" />
    </div>
  );
}
