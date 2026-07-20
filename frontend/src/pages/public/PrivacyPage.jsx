import React from 'react';

const PrivacyPage = () => {
  return (
    <div className='min-h-screen py-20'>
      <div className='container-custom max-w-4xl mx-auto'>
        <h1 className='text-4xl font-bold mb-6 dark:text-white'>
          Privacy Policy
        </h1>
        <p className='text-secondary mb-8'>Last updated: January 1, 2024</p>

        <div className='space-y-8'>
          <section>
            <h2 className='text-2xl font-semibold mb-4 dark:text-white'>
              Information We Collect
            </h2>
            <p className='text-secondary'>
              We collect information you provide directly to us, such as when
              you create an account, fill out a form, or communicate with us.
              This may include your name, email address, payment information,
              and content you create.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-4 dark:text-white'>
              How We Use Your Information
            </h2>
            <p className='text-secondary'>
              We use the information we collect to provide, maintain, and
              improve our services, to process transactions, to communicate with
              you, and to personalize your experience.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-4 dark:text-white'>
              Data Security
            </h2>
            <p className='text-secondary'>
              We implement appropriate technical and organizational measures to
              protect your personal information against unauthorized access,
              alteration, disclosure, or destruction.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-4 dark:text-white'>
              Cookies
            </h2>
            <p className='text-secondary'>
              We use cookies and similar tracking technologies to track activity
              on our platform and hold certain information to improve your
              experience.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-4 dark:text-white'>
              Third-Party Services
            </h2>
            <p className='text-secondary'>
              We may use third-party services such as payment processors and
              analytics providers. These services have their own privacy
              policies governing their use of your information.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-4 dark:text-white'>
              Your Rights
            </h2>
            <p className='text-secondary'>
              You have the right to access, correct, or delete your personal
              information. You may also opt out of marketing communications at
              any time.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-4 dark:text-white'>
              Children's Privacy
            </h2>
            <p className='text-secondary'>
              Our service is not directed to children under 13. We do not
              knowingly collect personal information from children under 13.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-4 dark:text-white'>
              Contact Us
            </h2>
            <p className='text-secondary'>
              If you have questions about this Privacy Policy, please contact us
              at privacy@readsphere.ai.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
