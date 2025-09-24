"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Mail, Phone, Linkedin, Twitter, Instagram, Youtube } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success("Message sent successfully! We'll get back to you within 24 hours.")
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" })
    } catch (error) {
      toast.error("Failed to send message. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Global Background Pattern - exactly matching homepage */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #1D91EB 1px, transparent 1px),
              linear-gradient(to bottom, #1D91EB 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
        
        {/* Dot pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, #1BAF69 1.5px, transparent 1.5px)`,
            backgroundSize: '30px 30px',
            backgroundPosition: '0 0, 15px 15px'
          }}
        />
        
        {/* Diagonal lines */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 35px,
              #1D91EB 35px,
              #1D91EB 36px
            )`
          }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h1 
              className="text-4xl md:text-6xl font-bold text-foreground mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Get in Touch With Us Today
            </motion.h1>
            <motion.p 
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              We're always here to chat! Reach out to us with any questions or concerns you may have, and we'll be happy to help.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative pb-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Input Your Name"
                        required
                        className="h-12"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Input Your email"
                        required
                        className="h-12"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Telephone"
                        required
                        className="h-12"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Subject
                      </label>
                      <Input
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="How can we help you?"
                        className="h-12"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <Textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Input Your Comments"
                        required
                        className="min-h-32 resize-none"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full h-12 bg-primary hover:bg-primary/90 font-semibold"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="border-0 shadow-2xl bg-gradient-to-br from-primary via-primary to-primary-600 text-white h-full">
                <CardContent className="p-8 h-full flex flex-col">
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold mb-4">Contact Information</h2>
                    <p className="text-primary-100 text-lg">
                      Fill up the form and our team will get back to you within 24 hours
                    </p>
                  </div>

                  <div className="space-y-8 flex-1">
                    {/* Location */}
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Our Location :</h3>
                        <p className="text-primary-100 mb-3">
                          No. 130, II Floor, Muneer Complex, Palani Road, Udumalpet.
                        </p>
                        <p className="text-primary-100">
                          No. 63, 2nd Floor, Sarojini Nagar, Ram Nagar, Coimbatore.
                        </p>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <Mail className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Email Us :</h3>
                        <p className="text-primary-100">contact@powerca.in</p>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <Phone className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Phone Number :</h3>
                        <p className="text-primary-100">+91 9629514635  |  +91 9842224635</p>
                      </div>
                    </div>
                  </div>

                  {/* Social Media */}
                  <div className="mt-8">
                    <h3 className="font-semibold text-lg mb-4">Follow our social media :</h3>
                    <div className="flex space-x-4">
                      <a 
                        href="#" 
                        className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                      >
                        <Linkedin className="w-5 h-5" />
                      </a>
                      <a 
                        href="#" 
                        className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                      >
                        <Twitter className="w-5 h-5" />
                      </a>
                      <a 
                        href="#" 
                        className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                      >
                        <Instagram className="w-5 h-5" />
                      </a>
                      <a 
                        href="#" 
                        className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                      >
                        <Youtube className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Google Maps Section */}
      <section className="relative pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-7xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Find Us Here</h2>
              <p className="text-lg text-muted-foreground">Visit our offices in Udumalpet and Coimbatore</p>
            </div>
            
            <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="grid lg:grid-cols-2 gap-0">
                  {/* Udumalpet Location */}
                  <div className="relative h-96 lg:h-[500px]">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3930.7636542847403!2d77.24726431533!3d10.587654992476154!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba7ee15d4b7f43b%3A0x8b4d5f5b7c8a9c6d!2sMuneer%20Complex%2C%20Palani%20Rd%2C%20Udumalpet%2C%20Tamil%20Nadu%20642126!5e0!3m2!1sen!2sin!4v1625845678123!5m2!1sen!2sin"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="w-full h-full"
                    />
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-sm text-foreground mb-1">Udumalpet Office</h3>
                          <p className="text-xs text-muted-foreground">
                            No. 130, II Floor, Muneer Complex,<br />
                            Palani Road, Udumalpet
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Coimbatore Location */}
                  <div className="relative h-96 lg:h-[500px]">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3917.2543876842756!2d76.93705331534!3d11.019344292148876!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba858c8b4b7f43b%3A0x8b4d5f5b7c8a9c6d!2sSarojini%20Nagar%2C%20Ram%20Nagar%2C%20Coimbatore%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1625845678123!5m2!1sen!2sin"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="w-full h-full"
                    />
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-sm text-foreground mb-1">Coimbatore Office</h3>
                          <p className="text-xs text-muted-foreground">
                            No. 63, 2nd Floor, Sarojini Nagar,<br />
                            Ram Nagar, Coimbatore
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  )
}