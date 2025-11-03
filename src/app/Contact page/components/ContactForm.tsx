/* eslint-disable @next/next/no-img-element -- Figma-exported layout relies on raw <img> for precise positioning */
import React, { useState } from 'react';
import svgPaths from "../imports/svg-nk5ou0clae";
import { imgImage1 } from "../imports/svg-05ygn";

// Replace figma asset with placeholder
const imgImage2 = "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1920&h=500&fit=crop&crop=center";

function Frame() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Frame">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Frame">
          <path d="M16 2V4" id="Vector" stroke="var(--stroke-0, #244B9B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p20c7e700} id="Vector_2" stroke="var(--stroke-0, #244B9B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d="M8 2V4" id="Vector_3" stroke="var(--stroke-0, #244B9B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p8c73c00} id="Vector_4" stroke="var(--stroke-0, #244B9B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p32f12c00} id="Vector_5" stroke="var(--stroke-0, #244B9B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[rgba(48,107,234,0.1)] relative rounded-[100px] shrink-0" data-name="_Button">
      <div className="box-border content-stretch flex gap-[10px] items-center justify-center overflow-clip px-[12px] py-[8px] relative">
        <Frame />
        <p className="font-['Poppins:Medium',_sans-serif] leading-[28px] not-italic relative shrink-0 text-[#244b9b] text-[16px] text-nowrap whitespace-pre">Connect With Us Today</p>
      </div>
      <div aria-hidden="true" className="absolute border border-[#306bea] border-solid inset-0 pointer-events-none rounded-[100px]" />
    </div>
  );
}

function HeroSection() {
  return (
    <div className="content-stretch flex flex-col gap-[28px] items-center relative shrink-0">
      <Button />
      <div className="flex flex-col font-['Poppins:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#001525] text-[60px] text-center w-[1128px]">
        <p className="leading-[normal]">Get in Touch With Us</p>
      </div>
      <div className="flex flex-col font-['Poppins:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#666d80] text-[18px] text-center w-[1128px]">
        <p className="leading-[normal]">We're always here to chat! Reach out to us with any questions or concerns you may have, and we'll be happy to help.</p>
      </div>
    </div>
  );
}

function Frame2() {
  return (
    <div className="relative shrink-0 size-[44px]" data-name="Frame">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 44 44">
        <g id="Frame">
          <path d={svgPaths.p46f7900} id="Vector" stroke="var(--stroke-0, #306BEA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
          <path d={svgPaths.pac86800} id="Vector_2" stroke="var(--stroke-0, #306BEA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
        </g>
      </svg>
    </div>
  );
}

function ContactInfo() {
  return (
    <div className="content-stretch flex flex-col gap-[60px] items-start w-[690px]">
      {/* Location */}
      <div className="content-stretch flex gap-[24px] items-start relative shrink-0 w-full">
        <div className="bg-white box-border content-stretch flex gap-[10px] items-center p-[10px] relative rounded-[8px] shrink-0">
          <div aria-hidden="true" className="absolute border-2 border-[#b6c9f3] border-solid inset-0 pointer-events-none rounded-[8px]" />
          <Frame2 />
        </div>
        <div className="content-stretch flex flex-col gap-[24px] items-start not-italic relative shrink-0">
          <p className="font-['Inter:Medium',_sans-serif] font-medium leading-[42px] min-w-full relative shrink-0 text-[#001525] text-[28px]" style={{ width: "min-content" }}>
            Our Location :
          </p>
          <p className="font-['Poppins:Regular',_sans-serif] leading-[normal] relative shrink-0 text-[#666d80] text-[18px] w-[602px]">No. 130, II Floor, Muneer Complex, Palani Road, Udumalpet.</p>
        </div>
      </div>

      {/* Email */}
      <div className="content-stretch flex gap-[24px] items-start relative shrink-0 w-full">
        <div className="bg-white box-border content-stretch flex gap-[10px] items-center p-[10px] relative rounded-[8px] shrink-0">
          <div aria-hidden="true" className="absolute border-2 border-[#b6c9f3] border-solid inset-0 pointer-events-none rounded-[8px]" />
          <div className="overflow-clip relative shrink-0 size-[44px]" data-name="Icons">
            <div className="absolute inset-[20%_15%]" data-name="Group">
              <div className="absolute inset-[-5.68%_-4.87%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 35 30">
                  <g id="Group">
                    <path d={svgPaths.p1e9a4380} id="Vector" stroke="var(--stroke-0, #306BEA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                    <path d={svgPaths.p310b1980} id="Vector_2" stroke="var(--stroke-0, #306BEA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex flex-col gap-[24px] items-start not-italic relative shrink-0">
          <p className="font-['Inter:Medium',_sans-serif] font-medium leading-[42px] min-w-full relative shrink-0 text-[#001525] text-[28px]" style={{ width: "min-content" }}>
            Email Us :
          </p>
          <p className="font-['Poppins:Regular',_sans-serif] leading-[normal] relative shrink-0 text-[#666d80] text-[18px] w-[602px]">contact@powerca.in | support@powerca.in</p>
        </div>
      </div>

      {/* Phone */}
      <div className="content-stretch flex gap-[24px] items-start relative shrink-0 w-full">
        <div className="bg-white box-border content-stretch flex gap-[10px] items-center p-[10px] relative rounded-[8px] shrink-0">
          <div aria-hidden="true" className="absolute border-2 border-[#b6c9f3] border-solid inset-0 pointer-events-none rounded-[8px]" />
          <div className="box-border content-stretch flex gap-[10px] items-center justify-center overflow-clip p-[4px] relative shrink-0 size-[44px]" data-name="Icons 3">
            <div className="h-[30.001px] relative shrink-0 w-[30px]" data-name="Group">
              <div className="absolute inset-[-5%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 34 34">
                  <g id="Group">
                    <path d={svgPaths.p3c1b6000} id="Vector" stroke="var(--stroke-0, #306BEA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex flex-col gap-[24px] items-start not-italic relative shrink-0">
          <p className="font-['Inter:Medium',_sans-serif] font-medium leading-[42px] min-w-full relative shrink-0 text-[#001525] text-[28px]" style={{ width: "min-content" }}>
            Phone Number :
          </p>
          <p className="font-['Poppins:Regular',_sans-serif] leading-[normal] relative shrink-0 text-[#666d80] text-[18px] w-[602px]">+91 9842224635 | +91 9629514635</p>
        </div>
      </div>

      {/* Social Media */}
      <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0">
        <p className="font-['Inter:Medium',_sans-serif] font-medium leading-[42px] not-italic relative shrink-0 text-[#001525] text-[28px] text-nowrap whitespace-pre">Follow our social media :</p>
        <div className="content-stretch flex gap-[24px] items-center overflow-clip relative shrink-0" data-name="Social Links">
          <div className="relative shrink-0 size-[44px]" data-name="Social Icons">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 44 44">
              <g id="Social Icons">
                <path d={svgPaths.p18693300} fill="var(--fill-0, #306BEA)" id="BG" stroke="var(--stroke-0, #306BEA)" strokeWidth="1.5" />
                <path clipRule="evenodd" d={svgPaths.p1a40ca00} fill="var(--fill-0, white)" fillRule="evenodd" id="Path" />
              </g>
            </svg>
          </div>
          <div className="relative shrink-0 size-[44px]" data-name="Social Icons">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 44 44">
              <g id="Social Icons">
                <path d={svgPaths.p18693300} fill="var(--fill-0, #306BEA)" id="BG" stroke="var(--stroke-0, #306BEA)" strokeWidth="1.5" />
                <path clipRule="evenodd" d={svgPaths.p3dcb280} fill="var(--fill-0, white)" fillRule="evenodd" id="Path" />
              </g>
            </svg>
          </div>
          <div className="relative shrink-0 size-[44px]" data-name="Social Icons">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 44 44">
              <g id="Social Icons">
                <path d={svgPaths.p18693300} fill="var(--fill-0, #306BEA)" id="BG" stroke="var(--stroke-0, #306BEA)" strokeWidth="1.5" />
                <path clipRule="evenodd" d={svgPaths.p31398c00} fill="var(--fill-0, white)" fillRule="evenodd" id="Path" />
              </g>
            </svg>
          </div>
          <div className="relative shrink-0 size-[44px]" data-name="Social Icons">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 44 44">
              <g id="Social Icons">
                <path d={svgPaths.p18693300} fill="var(--fill-0, #306BEA)" id="BG" stroke="var(--stroke-0, #306BEA)" strokeWidth="1.5" />
                <path clipRule="evenodd" d={svgPaths.p33a52180} fill="var(--fill-0, white)" fillRule="evenodd" id="Path" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        setSubmitStatus('error');
        setErrorMessage(data.error || 'Failed to send message. Please try again.');
      }
    } catch {
      setSubmitStatus('error');
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="box-border content-stretch flex flex-col gap-[30px] items-start min-w-[320px] px-[44px] py-[50px] rounded-[16px] w-[804px]" data-name="Form Contact">
      {submitStatus === 'success' && (
        <div className="w-full p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">Thank you! Your message has been sent successfully. We'll get back to you within 24 hours.</p>
        </div>
      )}
      {submitStatus === 'error' && (
        <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium">{errorMessage}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-[30px]">
        {/* Name Field */}
        <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="Input Field">
          <p className="font-['Poppins:Medium',_sans-serif] leading-[normal] min-w-full not-italic relative shrink-0 text-[#001525] text-[18px]" style={{ width: "min-content" }}>
            Name
          </p>
          <div className="bg-white min-w-[240px] relative shrink-0 w-full" data-name="Input">
            <div className="flex flex-row items-center min-w-inherit overflow-clip relative size-full">
              <div className="box-border content-stretch flex items-center min-w-inherit p-[16px] relative w-full">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                  required
                  disabled={isSubmitting}
                  className="basis-0 font-['Poppins:Regular',_sans-serif] grow leading-[normal] min-h-px min-w-px not-italic relative shrink-0 text-[#666d80] text-[18px] bg-transparent border-none outline-none w-full disabled:opacity-50"
                />
              </div>
            </div>
            <div aria-hidden="true" className="absolute border-[#b6c9f3] border-[0px_0px_2px] border-solid bottom-[-1px] left-0 pointer-events-none right-0 top-0" />
          </div>
        </div>

        {/* Email Field */}
        <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="Input Field">
          <p className="font-['Poppins:Medium',_sans-serif] leading-[normal] min-w-full not-italic relative shrink-0 text-[#001525] text-[18px]" style={{ width: "min-content" }}>
            Email
          </p>
          <div className="bg-white min-w-[240px] relative shrink-0 w-full" data-name="Input">
            <div className="flex flex-row items-center min-w-inherit overflow-clip relative size-full">
              <div className="box-border content-stretch flex items-center min-w-inherit p-[16px] relative w-full">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                  disabled={isSubmitting}
                  className="basis-0 font-['Poppins:Regular',_sans-serif] grow leading-[normal] min-h-px min-w-px not-italic relative shrink-0 text-[#666d80] text-[18px] bg-transparent border-none outline-none w-full disabled:opacity-50"
                />
              </div>
            </div>
            <div aria-hidden="true" className="absolute border-[#b6c9f3] border-[0px_0px_2px] border-solid bottom-[-1px] left-0 pointer-events-none right-0 top-0" />
          </div>
        </div>

        {/* Phone Field */}
        <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="Input Field">
          <p className="font-['Poppins:Medium',_sans-serif] leading-[normal] min-w-full not-italic relative shrink-0 text-[#001525] text-[18px]" style={{ width: "min-content" }}>Phone</p>
          <div className="bg-white min-w-[240px] relative shrink-0 w-full" data-name="Input">
            <div className="flex flex-row items-center min-w-inherit overflow-clip relative size-full">
              <div className="box-border content-stretch flex items-center min-w-inherit p-[16px] relative w-full">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  required
                  disabled={isSubmitting}
                  className="basis-0 font-['Poppins:Regular',_sans-serif] grow leading-[normal] min-h-px min-w-px not-italic relative shrink-0 text-[#666d80] text-[18px] bg-transparent border-none outline-none w-full disabled:opacity-50"
                />
              </div>
            </div>
            <div aria-hidden="true" className="absolute border-[#b6c9f3] border-[0px_0px_2px] border-solid bottom-[-1px] left-0 pointer-events-none right-0 top-0" />
          </div>
        </div>

        {/* Message Field */}
        <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="Textarea Field">
          <p className="font-['Poppins:Medium',_sans-serif] leading-[normal] not-italic relative shrink-0 text-[#001525] text-[18px] w-full">Message</p>
          <div className="bg-white h-[110px] min-h-[80px] min-w-[240px] relative shrink-0 w-full" data-name="Textarea">
            <div className="min-h-inherit min-w-inherit overflow-clip relative size-full">
              <div className="box-border content-stretch flex h-[110px] items-start min-h-inherit min-w-inherit p-[16px] relative w-full">
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Place your comment"
                  required
                  disabled={isSubmitting}
                  className="basis-0 font-['Poppins:Regular',_sans-serif] grow leading-[normal] min-h-px min-w-px not-italic relative shrink-0 text-[#666d80] text-[18px] bg-transparent border-none outline-none resize-none w-full h-full disabled:opacity-50"
                />
                <div className="absolute bottom-[6.02px] right-[5.02px] size-[6.627px]" data-name="Drag">
                  <div className="absolute inset-[-5.33%]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
                      <path d={svgPaths.p508fbdc} id="Drag" stroke="var(--stroke-0, #666D80)" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div aria-hidden="true" className="absolute border-[#b6c9f3] border-[0px_0px_2px] border-solid bottom-[-1px] left-0 pointer-events-none right-0 top-0" />
          </div>
        </div>

        {/* Submit Button */}
        <div className="content-stretch flex gap-[16px] items-start relative shrink-0">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#306bea] box-border content-stretch flex gap-[10px] items-center justify-center px-[24px] py-[16px] relative rounded-[100px] shadow-[0px_0px_1px_0px_rgba(48,107,234,0.24),0px_4px_6px_1px_rgba(229,231,235,0.5)] shrink-0 w-[356px] hover:bg-[#2557d1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            data-name="_Button"
          >
            <p className="font-['Poppins:Medium',_sans-serif] leading-[normal] not-italic relative shrink-0 text-[18px] text-nowrap text-white whitespace-pre">
              {isSubmitting ? 'Sending...' : 'Submit'}
            </p>
          </button>
        </div>
      </form>
    </div>
  );
}

function MapSection() {
  return (
    <div className="contents" data-name="Mask group">
      <div className="h-[495.152px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[141.793px_7.076px] mask-size-[1632px_450px] rounded-[12px] w-[1917.59px]" data-name="image 1" style={{ maskImage: `url('${imgImage1}')` }}>
        <img alt="Map location" className="inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[12px] size-full" src={imgImage2} />
      </div>
    </div>
  );
}

export default function ContactPageContent() {
  return (
    <div className="bg-white relative w-full min-h-screen" data-name="contact page">

      {/* Hero Banner */}
      <div className="absolute bg-[#f4f7fd] h-[406px] left-1/2 rounded-[16px] top-[32px] translate-x-[-50%] w-[1824px]">
        <div className="h-[406px] overflow-clip relative w-[1824px]">
          <div className="absolute content-stretch flex flex-col gap-[50px] items-center justify-center left-1/2 translate-x-[-50%] translate-y-[-50%] w-[1632px]" style={{ top: "calc(50% + 0.5px)" }}>
            <HeroSection />
          </div>

          {/* Background Decorative Elements */}
          <div className="absolute flex h-[2035.408px] items-center justify-center left-[1296px] top-[-1068px] w-[1808.989px]">
            <div className="flex-none rotate-[182.799deg]">
              <div className="h-[1953.97px] relative w-[1715.62px]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1716 1954">
                  <ellipse cx="857.81" cy="976.984" fill="url(#paint0_radial_1_1386)" id="Ellipse 9" rx="857.81" ry="976.984" />
                  <defs>
                    <radialGradient cx="0" cy="0" gradientTransform="matrix(-24.6691 -595.225 786.967 -42.3078 861.704 1064.7)" gradientUnits="userSpaceOnUse" id="paint0_radial_1_1386" r="1">
                      <stop stopColor="#306BEA" stopOpacity="0.35" />
                      <stop offset="1" stopColor="#306BEA" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
          <div className="absolute flex h-[2035.408px] items-center justify-center left-[-1258px] top-[-247px] w-[1808.989px]">
            <div className="flex-none rotate-[182.799deg]">
              <div className="h-[1953.97px] relative w-[1715.62px]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1716 1954">
                  <ellipse cx="857.81" cy="976.984" fill="url(#paint0_radial_1_1386_2)" id="Ellipse 9" rx="857.81" ry="976.984" />
                  <defs>
                    <radialGradient cx="0" cy="0" gradientTransform="matrix(-24.6691 -595.225 786.967 -42.3078 861.704 1064.7)" gradientUnits="userSpaceOnUse" id="paint0_radial_1_1386_2" r="1">
                      <stop stopColor="#306BEA" stopOpacity="0.35" />
                      <stop offset="1" stopColor="#306BEA" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div aria-hidden="true" className="absolute border border-[#b6c9f3] border-solid inset-0 pointer-events-none rounded-[16px]" />
      </div>

      {/* Main Content Section */}
      <div className="absolute contents left-[198px] top-[500px]">
        <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[56px] left-[198px] not-italic text-[#001525] text-[48px] text-nowrap top-[500px] whitespace-pre">Contact Information</p>
        <p className="absolute font-['Poppins:Regular',_sans-serif] leading-[normal] left-[198px] not-italic text-[#666d80] text-[18px] text-nowrap top-[580px] whitespace-pre">Fill up the form and our team will get back to you within 24 hours</p>

        {/* Contact Form positioned on the right */}
        <div className="absolute top-[500px]" style={{ left: "calc(50% + 12px)" }}>
          <ContactForm />
        </div>

        {/* Contact Info positioned on the left */}
        <div className="absolute left-[198px] top-[648px] w-[690px]">
          <ContactInfo />
        </div>
      </div>

      {/* Map Section */}
      <div className="absolute left-1/2 top-[1350px] translate-x-[-50%]">
        <MapSection />
      </div>
    </div>
  );
}

