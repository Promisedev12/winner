import React from 'react';

const TermsPage = () => {
  return (
    <div className='min-h-screen py-20'>
      <div className='container-custom max-w-4xl mx-auto'>
        <h1 className='text-4xl font-bold mb-6 dark:text-white'>
          Terms of Service
        </h1>
        <p className='text-secondary mb-8'>Last updated: January 1, 2024</p>

        <div className='space-y-8'>
          <section>
            <h2 className='text-2xl font-semibold mb-4 dark:text-white'>
              1. Acceptance of Terms
            </h2>
            <p className='text-secondary'>
              By accessing or using ReadSphere AI, you agree to be bound by
              these Terms of Service. If you disagree with any part of the
              terms, you may not access the platform.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-4 dark:text-white'>
              2. User Accounts
            </h2>
            <p className='text-secondary'>
              You must be at least 13 years old to use ReadSphere AI. You are
              responsible for maintaining the confidentiality of your account
              and password and for restricting access to your computer.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-4 dark:text-white'>
              3. Content Ownership
            </h2>
            <p className='text-secondary'>
              You retain all ownership rights to content you create and publish
              on ReadSphere AI. By publishing content, you grant us a license to
              host and distribute it on our platform.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-4 dark:text-white'>
              4. Prohibited Conduct
            </h2>
            <p className='text-secondary'>
              You may not post content that is illegal, harmful, threatening,
              abusive, harassing, defamatory, vulgar, obscene, or invasive of
              another's privacy.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-4 dark:text-white'>
              5. Termination
            </h2>
            <p className='text-secondary'>
              We reserve the right to terminate or suspend your account
              immediately, without prior notice, for conduct that violates these
              Terms or is harmful to other users.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-4 dark:text-white'>
              6. Limitation of Liability
            </h2>
            <p className='text-secondary'>
              ReadSphere AI shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages resulting from your
              use of or inability to use the platform.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-4 dark:text-white'>
              7. Changes to Terms
            </h2>
            <p className='text-secondary'>
              We reserve the right to modify these terms at any time. We will
              notify users of any material changes via email or platform
              notification.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-4 dark:text-white'>
              8. Contact Us
            </h2>
            <p className='text-secondary'>
              If you have any questions about these Terms, please contact us at
              legal@readsphere.ai.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
