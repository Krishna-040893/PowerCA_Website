export const featuresConfig = {
  mainFeatures: [
    {
      title: 'Client Management',
      description: 'Efficiently manage all your clients in one centralized platform with comprehensive profiles and history tracking.',
      icon: 'Users',
    },
    {
      title: 'Tax Compliance',
      description: 'Stay on top of all tax deadlines and compliance requirements with automated reminders and tracking.',
      icon: 'FileText',
    },
    {
      title: 'Document Management',
      description: 'Secure cloud storage for all client documents with easy sharing and collaboration features.',
      icon: 'Folder',
    },
    {
      title: 'Billing & Invoicing',
      description: 'Automated billing and invoicing system with payment tracking and financial reporting.',
      icon: 'Receipt',
    },
    {
      title: 'Task Management',
      description: 'Organize and track all tasks and assignments with team collaboration features.',
      icon: 'CheckSquare',
    },
    {
      title: 'Reports & Analytics',
      description: 'Comprehensive reporting and analytics to track firm performance and productivity.',
      icon: 'BarChart',
    },
  ],
  pricingPlans: [
    {
      name: 'PowerCA Launch Offer',
      price: '₹50,000',
      originalPrice: '₹1,00,000',
      period: 'first-year',
      description: 'Special 50% discount for CAs only – Till 31st Oct 2025',
      features: [
        'Installation and Demo',
        'Required training',
        'Ongoing Support & Update',
        'First year subscription included',
        'Unlimited clients',
        'All premium features included',
        'Complete data migration',
        '24/7 dedicated support',
      ],
      popular: true,
      productId: 'powerca_implementation',
      amount: 5000000, // Amount in paise (₹50,000 = 5,000,000 paise) for Razorpay
    },
  ],
}