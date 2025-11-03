'use client'

import React, { useState } from 'react'

// SVG paths for icons - imported from Contact page folder design
const svgPaths = {
  p20c7e700: "M7 22V20C7 19.4696 7.21071 18.9609 7.58579 18.5858C7.96086 18.2107 8.46957 18 9 18H15C15.5304 18 16.0391 18.2107 16.4142 18.5858C16.7893 18.9609 17 19.4696 17 20V22",
  p8c73c00: "M12 14C13.6569 14 15 12.6569 15 11C15 9.34315 13.6569 8 12 8C10.3431 8 9 9.34315 9 11C9 12.6569 10.3431 14 12 14Z",
  p32f12c00: "M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z",
  p46f7900: "M36.6667 18.3333C36.6667 27.4872 26.5118 37.0205 23.1018 39.9648C22.7842 40.2037 22.3975 40.3329 22 40.3329C21.6025 40.3329 21.2158 40.2037 20.8982 39.9648C17.4882 37.0205 7.33333 27.4872 7.33333 18.3333C7.33333 14.4435 8.87857 10.713 11.6291 7.96243C14.3796 5.2119 18.1102 3.66667 22 3.66667C25.8898 3.66667 29.6204 5.2119 32.3709 7.96243C35.1214 10.713 36.6667 14.4435 36.6667 18.3333Z",
  pac86800: "M22 23.8333C25.0376 23.8333 27.5 21.3709 27.5 18.3333C27.5 15.2958 25.0376 12.8333 22 12.8333C18.9624 12.8333 16.5 15.2958 16.5 18.3333C16.5 21.3709 18.9624 23.8333 22 23.8333Z",
  p1e9a4380: "M2 8.6L16.3088 16.7752C16.9842 17.1624 17.8158 17.1624 18.4912 16.7752L32.8 8.6",
  p310b1980: "M26.2 2H8.6C4.95492 2 2 4.95492 2 8.6V21.8C2 25.4451 4.95492 28.4 8.6 28.4H26.2C29.8451 28.4 32.8 25.4451 32.8 21.8V8.6C32.8 4.95492 29.8451 2 26.2 2Z",
  p3c1b6000: "M22.0282 20.5279L19.5831 23.5837C15.7967 21.3572 12.6402 18.2028 10.4158 14.4163L13.4716 11.9713C14.2088 11.382 14.4552 10.3684 14.0716 9.50697L11.2859 3.23472C10.8723 2.3047 9.84797 1.81183 8.86438 2.06684L3.56071 3.44258C2.53641 3.71044 1.87426 4.7026 2.01997 5.75048C3.93144 19.3664 14.6331 30.0681 28.2512 31.9817C29.299 32.1252 30.2912 31.4631 30.5569 30.4409L31.9327 25.1373C32.1877 24.1537 31.6948 23.1315 30.7669 22.7179L24.4947 19.9322C23.6332 19.5486 22.6218 19.795 22.0303 20.53L22.0282 20.5279Z",
  p18693300: "M22 0.75C33.7361 0.75 43.25 10.2639 43.25 22C43.25 33.7361 33.7361 43.25 22 43.25C10.2639 43.25 0.75 33.7361 0.75 22C0.75 10.2639 10.2639 0.75 22 0.75Z",
  p1a40ca00: "M22.0011 10.2667C18.8145 10.2667 18.4146 10.2806 17.163 10.3376C15.9139 10.3948 15.0613 10.5925 14.3152 10.8827C13.5435 11.1824 12.8888 11.5833 12.2367 12.2357C11.584 12.8879 11.1831 13.5425 10.8824 14.314C10.5915 15.0603 10.3935 15.9131 10.3373 17.1618C10.2813 18.4134 10.2667 18.8135 10.2667 22.0001C10.2667 25.1867 10.2808 25.5854 10.3376 26.837C10.395 28.0861 10.5928 28.9387 10.8827 29.6848C11.1826 30.4565 11.5835 31.1111 12.2359 31.7633C12.8879 32.416 13.5425 32.8179 14.3137 33.1176C15.0603 33.4077 15.9131 33.6055 17.162 33.6627C18.4136 33.7196 18.8133 33.7336 21.9996 33.7336C25.1865 33.7336 25.5852 33.7196 26.8368 33.6627C28.0859 33.6055 28.9395 33.4077 29.686 33.1176C30.4575 32.8179 31.1112 32.416 31.7631 31.7633C32.4158 31.1111 32.8167 30.4565 33.1173 29.685C33.4058 28.9387 33.6038 28.0859 33.6624 26.8372C33.7187 25.5857 33.7333 25.1867 33.7333 22.0001C33.7333 18.8135 33.7187 18.4136 33.6624 17.162C33.6038 15.9129 33.4058 15.0603 33.1173 14.3142C32.8167 13.5425 32.4158 12.8879 31.7631 12.2357C31.1104 11.583 30.4577 11.1821 29.6853 10.8827C28.9373 10.5925 28.0842 10.3948 26.835 10.3376C25.5835 10.2806 25.185 10.2667 21.9974 10.2667H22.0011ZM20.9485 12.3811C21.2609 12.3806 21.6094 12.3811 22.001 12.3811C25.1339 12.3811 25.5052 12.3923 26.7423 12.4486C27.8864 12.5009 28.5072 12.692 28.9209 12.8526C29.4684 13.0653 29.8588 13.3195 30.2692 13.7302C30.6799 14.1409 30.9341 14.532 31.1473 15.0796C31.3079 15.4927 31.4993 16.1136 31.5513 17.2576C31.6076 18.4945 31.6198 18.866 31.6198 21.9974C31.6198 25.1288 31.6076 25.5003 31.5513 26.7372C31.499 27.8812 31.3079 28.5021 31.1473 28.9153C30.9346 29.4628 30.6799 29.8527 30.2692 30.2631C29.8586 30.6738 29.4687 30.928 28.9209 31.1407C28.5077 31.302 27.8864 31.4927 26.7423 31.545C25.5054 31.6012 25.1339 31.6135 22.001 31.6135C18.868 31.6135 18.4967 31.6012 17.2598 31.545C16.1157 31.4922 15.4948 31.3011 15.081 31.1405C14.5334 30.9278 14.1423 30.6736 13.7317 30.2629C13.321 29.8522 13.0668 29.4621 12.8536 28.9143C12.693 28.5012 12.5016 27.8803 12.4495 26.7363C12.3933 25.4993 12.3821 25.1278 12.3821 21.9945C12.3821 18.8611 12.3933 18.4915 12.4495 17.2546C12.5018 16.1106 12.693 15.4897 12.8536 15.0761C13.0663 14.5286 13.321 14.1375 13.7317 13.7268C14.1423 13.3161 14.5334 13.0619 15.081 12.8487C15.4946 12.6874 16.1157 12.4967 17.2598 12.4442C18.3422 12.3953 18.7616 12.3806 20.9485 12.3782V12.3811ZM28.2643 14.3293C27.4869 14.3293 26.8563 14.9593 26.8563 15.7369C26.8563 16.5142 27.4869 17.1449 28.2643 17.1449C29.0416 17.1449 29.6723 16.5142 29.6723 15.7369C29.6723 14.9595 29.0416 14.3293 28.2643 14.3293ZM22.0011 15.9745C18.6735 15.9745 15.9755 18.6724 15.9755 22.0001C15.9755 25.3277 18.6735 28.0245 22.0011 28.0245C25.3288 28.0245 28.0258 25.3277 28.0258 22.0001C28.0258 18.6724 25.3288 15.9745 22.0011 15.9745ZM22.0011 18.0889C24.161 18.0889 25.9122 19.8399 25.9122 22.0001C25.9122 24.16 24.161 25.9112 22.0011 25.9112C19.8409 25.9112 18.0899 24.16 18.0899 22.0001C18.0899 19.8399 19.8409 18.0889 22.0011 18.0889Z",
  p3dcb280: "M33.7333 21.9837C33.7333 22.7772 33.6526 23.5696 33.4939 24.342C33.3392 25.0961 33.11 25.8364 32.8098 26.5441C32.5164 27.2393 32.1526 27.9092 31.7275 28.5339C31.3087 29.1547 30.8263 29.7371 30.2963 30.2681C29.7651 30.7967 29.1807 31.2778 28.5602 31.6984C27.9335 32.1205 27.2626 32.4838 26.567 32.7785C25.8583 33.0772 25.1162 33.306 24.3628 33.4604C23.5894 33.6195 22.7941 33.7008 21.9995 33.7008C21.2042 33.7008 20.409 33.6195 19.6367 33.4604C18.8821 33.306 18.1401 33.0772 17.432 32.7785C16.7364 32.4838 16.0649 32.1205 15.4381 31.6984C14.8176 31.2778 14.2332 30.7967 13.7032 30.2681C13.1727 29.7371 12.6902 29.1547 12.2709 28.5339C11.848 27.9092 11.4836 27.2392 11.1891 26.5441C10.8889 25.8364 10.6591 25.0961 10.5039 24.342C10.3469 23.5696 10.2667 22.7772 10.2667 21.9837C10.2667 21.1896 10.3469 20.3955 10.5039 19.6248C10.6592 18.8708 10.8889 18.1293 11.1892 17.4228C11.4836 16.7271 11.8481 16.0566 12.2709 15.4318C12.6903 14.8105 13.1727 14.2292 13.7033 13.6977C14.2332 13.169 14.8176 12.689 15.4381 12.2691C16.0649 11.8451 16.7365 11.4819 17.432 11.1866C18.1402 10.8874 18.8821 10.658 19.6367 10.5047C20.409 10.3468 21.2043 10.2667 21.9995 10.2667C22.7942 10.2667 23.5894 10.3468 24.3629 10.5047C25.1163 10.658 25.8583 10.8874 26.567 11.1866C27.2626 11.4818 27.9335 11.8451 28.5603 12.2691C29.1808 12.689 29.7652 13.169 30.2963 13.6977C30.8263 14.2292 31.3087 14.8105 31.7275 15.4318C32.1526 16.0566 32.5164 16.7271 32.8098 17.4228C33.11 18.1293 33.3392 18.8708 33.4939 19.6248C33.6526 20.3955 33.7333 21.1896 33.7333 21.9837ZM17.7241 12.9333C14.9298 14.2509 12.8443 16.822 12.194 19.9206C12.4581 19.9229 16.6338 19.9756 21.4448 18.6991C19.7105 15.6223 17.8576 13.1113 17.7241 12.9333ZM22.275 20.2399C17.1156 21.7823 12.1648 21.6713 11.9872 21.6645C11.9843 21.772 11.9791 21.8761 11.9791 21.9837C11.9791 24.5542 12.9503 26.8976 14.5465 28.6695C14.5431 28.6644 17.2852 23.8065 22.6927 22.0604C22.8233 22.0169 22.9562 21.978 23.088 21.9402C22.8365 21.3716 22.562 20.8017 22.275 20.2399ZM28.617 14.4741C26.8528 12.9207 24.5365 11.9785 21.9994 11.9785C21.1853 11.9785 20.3952 12.0769 19.6383 12.2588C19.7884 12.4602 21.6706 14.9535 23.3842 18.0956C27.1651 16.6802 28.5923 14.5107 28.617 14.4741ZM23.771 23.5982C23.7487 23.6056 23.7264 23.612 23.7046 23.62C17.7924 25.6781 15.8618 29.8257 15.8409 29.871C17.542 31.192 19.6756 31.989 21.9995 31.989C23.3871 31.989 24.7089 31.7068 25.9115 31.196C25.7631 30.3218 25.181 27.2575 23.771 23.5982ZM27.5988 30.2818C29.8488 28.7657 31.4467 26.3582 31.8925 23.5696C31.6862 23.5032 28.8828 22.617 25.6485 23.1348C26.9628 26.7415 27.4968 29.6788 27.5988 30.2818ZM24.1555 19.5865C24.3881 20.0637 24.6133 20.5493 24.8212 21.0374C24.8952 21.2125 24.9674 21.3842 25.0378 21.5558C28.4801 21.1232 31.8713 21.851 32.0163 21.8807C31.9934 19.5087 31.1437 17.3318 29.7377 15.6275C29.7188 15.6543 28.1117 17.9731 24.1555 19.5865Z",
  p31398c00: "M21.3411 17.8819L21.3873 18.6431L20.6178 18.5499C17.8171 18.1926 15.3703 16.9808 13.2929 14.9456L12.2772 13.9358L12.0156 14.6815C11.4617 16.3438 11.8156 18.0994 12.9697 19.2801C13.5853 19.9326 13.4468 20.0258 12.385 19.6374C12.0156 19.5131 11.6925 19.4199 11.6617 19.4665C11.554 19.5753 11.9233 20.989 12.2157 21.5483C12.6158 22.3251 13.4314 23.0863 14.3239 23.5369L15.078 23.8942L14.1854 23.9097C13.3237 23.9097 13.2929 23.9253 13.3852 24.2515C13.693 25.2613 14.9087 26.3333 16.2629 26.7994L17.217 27.1256L16.386 27.6228C15.1549 28.3374 13.7084 28.7413 12.2619 28.7724C11.5694 28.7879 11 28.8501 11 28.8967C11 29.052 12.8774 29.922 13.97 30.2638C17.2477 31.2737 21.1411 30.8387 24.0649 29.1142C26.1423 27.8869 28.2198 25.4478 29.1893 23.0863C29.7125 21.8279 30.2357 19.5287 30.2357 18.4256C30.2357 17.711 30.2818 17.6178 31.1436 16.7633C31.6514 16.2662 32.1285 15.7224 32.2208 15.5671C32.3747 15.2719 32.3593 15.2719 31.5745 15.536C30.2665 16.0021 30.0818 15.9399 30.7281 15.2408C31.2052 14.7437 31.7745 13.8426 31.7745 13.5785C31.7745 13.5319 31.5437 13.6096 31.2821 13.7494C31.0051 13.9047 30.3896 14.1378 29.9279 14.2776L29.0969 14.5417L28.3429 14.029C27.9274 13.7494 27.3426 13.4387 27.0349 13.3454C26.25 13.128 25.0497 13.159 24.3419 13.4076C22.4183 14.1067 21.2026 15.9088 21.3411 17.8819Z",
  p33a52180: "M31.1681 14.4369C32.1779 14.714 32.9731 15.5304 33.2429 16.5672C33.7333 18.4462 33.7333 22.3667 33.7333 22.3667C33.7333 22.3667 33.7333 26.2871 33.2429 28.1663C32.9731 29.203 32.1779 30.0194 31.1681 30.2966C29.3383 30.8 22 30.8 22 30.8C22 30.8 14.6617 30.8 12.8317 30.2966C11.822 30.0194 11.0268 29.203 10.7569 28.1663C10.2667 26.2871 10.2667 22.3667 10.2667 22.3667C10.2667 22.3667 10.2667 18.4462 10.7569 16.5672C11.0268 15.5304 11.822 14.714 12.8317 14.4369C14.6617 13.9334 22 13.9334 22 13.9334C22 13.9334 29.3383 13.9334 31.1681 14.4369ZM19.8 19.0666V26.4L25.6667 22.7334L19.8 19.0666Z"
}
function HeroSection() {
  return (
    <div className="max-w-6xl mx-auto text-center">
      {/* Badge - about page style */}
      <div className="mb-6 sm:mb-8">
        <span className="inline-flex items-center px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-blue-100 border border-blue-200 text-blue-700 rounded-full text-xs sm:text-sm font-medium">
          <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Connect With Us Today
        </span>
      </div>

      {/* Main Heading - about page style */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 leading-tight mb-6 sm:mb-8 px-2">
        Get in Touch
        <br />
              <span className="text-blue-600">With Us</span>
      </h1>

      {/* Description - about page style */}
      <div className="mb-8 sm:mb-10 md:mb-12 max-w-5xl mx-auto px-2">
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed">
          We're always here to chat! Reach out to us with any questions or concerns you may have, and we'll be happy to help.
        </p>
      </div>
    </div>
  )
}

function LocationIcon() {
  return (
    <div className="relative shrink-0 size-[32px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 44 44">
        <g>
          <path d={svgPaths.p46f7900} stroke="#306BEA" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
          <path d={svgPaths.pac86800} stroke="#306BEA" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
        </g>
      </svg>
    </div>
  )
}

function EmailIcon() {
  return (
    <div className="overflow-clip relative shrink-0 size-[32px]">
      <div className="absolute inset-[20%_15%]">
        <div className="absolute inset-[-5.68%_-4.87%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 35 30">
            <g>
              <path d={svgPaths.p1e9a4380} stroke="#306BEA" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
              <path d={svgPaths.p310b1980} stroke="#306BEA" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  )
}

function PhoneIcon() {
  return (
    <div className="box-border content-stretch flex gap-[10px] items-center justify-center overflow-clip p-[4px] relative shrink-0 size-[32px]">
      <div className="h-[22px] relative shrink-0 w-[22px]">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 34 34">
            <g>
              <path d={svgPaths.p3c1b6000} stroke="#306BEA" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  )
}

function ContactInfo() {
  return (
    <div className="content-stretch flex flex-col gap-8 sm:gap-10 md:gap-12 lg:gap-[60px] items-start w-full max-w-[690px]">
      {/* Location */}
      <div className="content-stretch flex gap-3 sm:gap-4 md:gap-[24px] items-start relative shrink-0 w-full">
        <div className="bg-white box-border content-stretch flex gap-[10px] items-center p-[6px] sm:p-[7px] md:p-[8px] relative rounded-[8px] shrink-0 border-2 border-[#b6c9f3]">
          <LocationIcon />
        </div>
        <div className="content-stretch flex flex-col gap-2 sm:gap-[12px] items-start relative flex-1">
          <p className="font-medium leading-tight sm:leading-[42px] w-full text-[#001525] text-lg sm:text-xl md:text-[24px]">
            Our Location :
          </p>
          <p className="font-normal leading-relaxed sm:leading-[normal] text-[#666d80] text-sm sm:text-base md:text-[18px] max-w-[602px] break-words">No. 130, II Floor, Muneer Complex, Palani Road, Udumalpet.</p>
        </div>
      </div>

      {/* Email */}
      <div className="content-stretch flex gap-3 sm:gap-4 md:gap-[24px] items-start relative shrink-0 w-full">
        <div className="bg-white box-border content-stretch flex gap-[10px] items-center p-[6px] sm:p-[7px] md:p-[8px] relative rounded-[8px] shrink-0 border-2 border-[#b6c9f3]">
          <EmailIcon />
        </div>
        <div className="content-stretch flex flex-col gap-2 sm:gap-[12px] items-start relative flex-1">
          <p className="font-medium leading-tight sm:leading-[42px] w-full text-[#001525] text-lg sm:text-xl md:text-[24px]">
            Email Us :
          </p>
          <p className="font-normal leading-relaxed sm:leading-[normal] text-[#666d80] text-sm sm:text-base md:text-[18px] max-w-[602px] break-words">contact@powerca.in | support@powerca.in</p>
        </div>
      </div>

      {/* Phone */}
      <div className="content-stretch flex gap-3 sm:gap-4 md:gap-[24px] items-start relative shrink-0 w-full">
        <div className="bg-white box-border content-stretch flex gap-[10px] items-center p-[6px] sm:p-[7px] md:p-[8px] relative rounded-[8px] shrink-0 border-2 border-[#b6c9f3]">
          <PhoneIcon />
        </div>
        <div className="content-stretch flex flex-col gap-2 sm:gap-[12px] items-start relative flex-1">
          <p className="font-medium leading-tight sm:leading-[42px] w-full text-[#001525] text-lg sm:text-xl md:text-[24px]">
            Phone Number :
          </p>
          <p className="font-normal leading-relaxed sm:leading-[normal] text-[#666d80] text-sm sm:text-base md:text-[18px] max-w-[602px] break-words">+91 9842224635 | +91 9629514635</p>
        </div>
      </div>

      {/* Social Media */}
      <div className="content-stretch flex flex-col gap-4 sm:gap-[24px] items-start relative shrink-0">
        <p className="font-medium leading-tight sm:leading-[42px] relative shrink-0 text-[#001525] text-lg sm:text-xl md:text-[24px]">Follow our social media :</p>
        <div className="flex space-x-3 sm:space-x-4 mt-2 sm:mt-6">
              <a href="https://www.instagram.com/powerca24/" className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors text-white">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="https://www.linkedin.com/in/power-ca-tbs25100" className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors text-white">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="https://x.com/Powerca_24" className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors text-white">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="https://www.youtube.com/@powerCA-24" className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors text-white">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
      </div>
    </div>
  )
}

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({ name: '', email: '', phone: '', message: '' })
      } else {
        setSubmitStatus('error')
        setErrorMessage(data.error || 'Failed to send message. Please try again.')
      }
    } catch {
      setSubmitStatus('error')
      setErrorMessage('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="box-border content-stretch flex flex-col gap-5 sm:gap-6 md:gap-[30px] items-start w-full px-4 sm:px-6 md:px-8 lg:px-[44px] py-6 sm:py-8 md:py-10 lg:py-[50px] rounded-[16px] max-w-[804px]">
      {submitStatus === 'success' && (
        <div className="w-full p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium text-sm sm:text-base">Thank you! Your message has been sent successfully. We'll get back to you within 24 hours.</p>
        </div>
      )}
      {submitStatus === 'error' && (
        <div className="w-full p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium text-sm sm:text-base">{errorMessage}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5 sm:gap-6 md:gap-[30px]">
        {/* Name Field */}
        <div className="content-stretch flex flex-col gap-3 sm:gap-4 md:gap-[24px] items-start relative shrink-0 w-full">
          <p className="font-medium leading-[normal] w-full text-[#001525] text-sm sm:text-base md:text-[18px]">
            Name
          </p>
          <div className="bg-white relative shrink-0 w-full">
            <div className="flex flex-row items-center overflow-clip relative size-full">
              <div className="box-border content-stretch flex items-center p-3 sm:p-4 md:p-[16px] relative w-full">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                  required
                  disabled={isSubmitting}
                  className="basis-0 font-normal grow leading-[normal] min-h-px min-w-px relative shrink-0 text-[#666d80] text-sm sm:text-base md:text-[18px] bg-transparent border-none outline-none w-full disabled:opacity-50"
                />
              </div>
            </div>
            <div className="absolute border-[#b6c9f3] border-2 border-solid inset-0 pointer-events-none rounded-[4px]" />
          </div>
        </div>

        {/* Email Field */}
        <div className="content-stretch flex flex-col gap-3 sm:gap-4 md:gap-[24px] items-start relative shrink-0 w-full">
          <p className="font-medium leading-[normal] w-full text-[#001525] text-sm sm:text-base md:text-[18px]">
            Email
          </p>
          <div className="bg-white relative shrink-0 w-full">
            <div className="flex flex-row items-center overflow-clip relative size-full">
              <div className="box-border content-stretch flex items-center p-3 sm:p-4 md:p-[16px] relative w-full">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                  disabled={isSubmitting}
                  className="basis-0 font-normal grow leading-[normal] min-h-px min-w-px relative shrink-0 text-[#666d80] text-sm sm:text-base md:text-[18px] bg-transparent border-none outline-none w-full disabled:opacity-50"
                />
              </div>
            </div>
            <div className="absolute border-[#b6c9f3] border-2 border-solid inset-0 pointer-events-none rounded-[4px]" />
          </div>
        </div>

        {/* Phone Field */}
        <div className="content-stretch flex flex-col gap-3 sm:gap-4 md:gap-[24px] items-start relative shrink-0 w-full">
          <p className="font-medium leading-[normal] w-full text-[#001525] text-sm sm:text-base md:text-[18px]">Phone</p>
          <div className="bg-white relative shrink-0 w-full">
            <div className="flex flex-row items-center overflow-clip relative size-full">
              <div className="box-border content-stretch flex items-center p-3 sm:p-4 md:p-[16px] relative w-full">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  required
                  disabled={isSubmitting}
                  className="basis-0 font-normal grow leading-[normal] min-h-px min-w-px relative shrink-0 text-[#666d80] text-sm sm:text-base md:text-[18px] bg-transparent border-none outline-none w-full disabled:opacity-50"
                />
              </div>
            </div>
            <div className="absolute border-[#b6c9f3] border-2 border-solid inset-0 pointer-events-none rounded-[4px]" />
          </div>
        </div>

        {/* Message Field */}
        <div className="content-stretch flex flex-col gap-3 sm:gap-4 md:gap-[24px] items-start relative shrink-0 w-full">
          <p className="font-medium leading-[normal] relative shrink-0 text-[#001525] text-sm sm:text-base md:text-[18px] w-full">Message</p>
          <div className="bg-white h-[110px] min-h-[80px] min-w-[240px] relative shrink-0 w-full">
            <div className="min-h-inherit min-w-inherit overflow-clip relative size-full">
              <div className="box-border content-stretch flex h-[110px] items-start min-h-inherit min-w-inherit p-3 sm:p-4 md:p-[16px] relative w-full">
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Place your comment"
                  required
                  disabled={isSubmitting}
                  className="basis-0 font-normal grow leading-[normal] min-h-px min-w-px relative shrink-0 text-[#666d80] text-sm sm:text-base md:text-[18px] bg-transparent border-none outline-none resize-none w-full h-full disabled:opacity-50"
                />
              </div>
            </div>
            <div className="absolute border-[#b6c9f3] border-2 border-solid inset-0 pointer-events-none rounded-[4px]" />
          </div>
        </div>

        {/* Submit Button */}
        <div className="content-stretch flex gap-3 sm:gap-4 items-start relative shrink-0 w-full">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#306bea] box-border content-stretch flex gap-[10px] items-center justify-center px-5 sm:px-6 md:px-[24px] py-3 sm:py-4 md:py-[16px] relative rounded-[100px] shadow-[0px_0px_1px_0px_rgba(48,107,234,0.24),0px_4px_6px_1px_rgba(229,231,235,0.5)] shrink-0 w-full sm:max-w-[356px] hover:bg-[#2557d1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <p className="font-medium leading-[normal] relative shrink-0 text-sm sm:text-base md:text-[18px] text-nowrap text-white whitespace-pre">
              {isSubmitting ? 'Sending...' : 'Submit'}
            </p>
          </button>
        </div>
      </form>
    </div>
  )
}

function MapSection() {
  return (
    <div className="w-full">
      <div className="h-[495px] rounded-[12px] w-full max-w-[1917px] mx-auto overflow-hidden relative bg-slate-100 border-2 border-gray-200">
        {/* Embedded Google Map - TBS Technologies / Muneer Complex Location */}
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d608.3352149153551!2d77.2527547!3d10.5836394!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba9cdb2ca3bf08f%3A0x5f8035bea3394e46!2sTBS%20Technologies%20Private%20Limited!5e1!3m2!1sen!2sin!4v1761385887270!5m2!1sen!2sin"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="rounded-[12px]"
          title="PowerCA Office Location - Muneer Complex, Udumalpet"
        ></iframe>

        {/* Overlay Information Card */}
        <div className="absolute top-6 right-6 bg-white rounded-lg shadow-lg p-4 max-w-xs z-10 pointer-events-auto">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">PowerCA Office</h3>
              <p className="text-gray-600 text-xs mt-1">
                No. 130, II Floor, Muneer Complex<br />
                Palani Road, Udumalpet
              </p>
              <a
                href="https://maps.app.goo.gl/m8Wxi2UVVdsHyXhh7"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 text-xs mt-2 font-medium hover:text-blue-800 transition-colors inline-block"
              >
                Open in Google Maps →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ContactPage() {
  return (
    <div className="bg-white relative w-full min-h-screen">
      {/* Hero Section */}
      <section className="relative py-12 sm:py-14 md:py-16 lg:py-[60px] flex items-center justify-center overflow-hidden bg-white">
        {/* Background image with responsive padding */}
        <div className="absolute inset-0 px-3 sm:px-4 md:px-6 lg:px-12">
          <div
            className="w-full h-full rounded-2xl"
            style={{
              backgroundImage: `url('/images/contact-hero-bg.jpg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          ></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <HeroSection />
        </div>
      </section>

      {/* Main Content Section */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-10 sm:py-12 md:py-16 lg:py-20 mb-8 sm:mb-12 md:mb-16">
        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-16 items-start">
          {/* Contact Info - Left Column */}
          <div>
            {/* Section Header */}
            <div className="mb-8 sm:mb-10 md:mb-12 lg:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-semibold text-gray-900 mb-4 sm:mb-6 leading-normal">Contact Information</h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed">Fill up the form and our team will get back to you within 24 hours</p>
            </div>

            <ContactInfo />
          </div>

          {/* Contact Form - Right Column */}
          <div className="bg-[#F4F7FD] rounded-2xl py-4 sm:p-6 md:p-8 shadow-lg">
            <ContactForm />
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="max-w-[1920px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 mb-8 sm:mb-12 md:mb-16">
        <div className="text-center mb-8">
        </div>
        <MapSection />
      </div>
    </div>
  )
}
