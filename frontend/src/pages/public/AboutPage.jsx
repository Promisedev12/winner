import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiUsers,
  FiBookOpen,
  FiCpu,
  FiGlobe,
  FiAward,
  FiHeart,
  FiTarget,
  FiZap,
} from 'react-icons/fi';

const team = [
  {
    name: 'Sarah Johnson',
    role: 'CEO & Founder',
    bio: 'Former tech journalist with 10+ years in content creation',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    social: { twitter: '#', linkedin: '#' },
  },
  {
    name: 'David Chen',
    role: 'CTO',
    bio: 'AI expert and full-stack architect',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    social: { twitter: '#', linkedin: '#' },
  },
  {
    name: 'Maria Garcia',
    role: 'Head of Product',
    bio: 'Passionate about building user-centric products',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
    social: { twitter: '#', linkedin: '#' },
  },
  {
    name: 'James Wilson',
    role: 'Community Manager',
    bio: 'Building and nurturing our creator community',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
    social: { twitter: '#', linkedin: '#' },
  },
];

const milestones = [
  {
    year: '2022',
    title: 'Founded',
    description:
      'BlogLib was founded with a vision to empower content creators',
  },
  {
    year: '2023',
    title: 'Launch',
    description: 'Public launch with blogging and e-library features',
  },
  {
    year: '2024',
    title: 'AI Integration',
    description: 'Launched AI Writing Assistant and smart recommendations',
  },
  {
    year: '2025',
    title: 'Global Growth',
    description: 'Reached 50K+ active users worldwide',
  },
];

const values = [
  {
    icon: <FiHeart className='w-8 h-8' />,
    title: 'Empowerment',
    description: 'We empower creators to share their knowledge and stories',
  },
  {
    icon: <FiTarget className='w-8 h-8' />,
    title: 'Innovation',
    description: 'We continuously innovate to provide the best tools',
  },
  {
    icon: <FiUsers className='w-8 h-8' />,
    title: 'Community First',
    description: 'Our community drives everything we do',
  },
  {
    icon: <FiZap className='w-8 h-8' />,
    title: 'Excellence',
    description: 'We strive for excellence in everything we create',
  },
];

export default function AboutPage() {
  return (
    <div className='font-sans antialiased'>
      {/* Hero Section */}
      <section className='relative py-20 bg-gradient-to-r from-deep-navy via-royal-blue to-indigo text-white overflow-hidden'>
        <div className='absolute inset-0 opacity-10'>
          <div className='absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl'></div>
          <div className='absolute bottom-20 right-10 w-96 h-96 bg-emerald rounded-full blur-3xl'></div>
        </div>
        <div className='container-custom relative text-center'>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className='text-4xl md:text-5xl font-bold mb-4'>
              About <span className='gradient-text'>BlogLib</span>
            </h1>
            <p className='text-xl max-w-3xl mx-auto text-gray-200'>
              We're on a mission to revolutionize how content is created,
              shared, and consumed
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className='section-padding bg-off-white dark:bg-gray-900'>
        <div className='container-custom'>
          <div className='grid lg:grid-cols-2 gap-12 items-center'>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className='text-3xl font-bold mb-4'>
                Our <span className='gradient-text'>Story</span>
              </h2>
              <p className='text-lg text-dark-text/70 dark:text-gray-400 mb-4'>
                BlogLib was born from a simple idea: content creators deserve a
                platform that truly understands their needs.
              </p>
              <p className='text-lg text-dark-text/70 dark:text-gray-400 mb-4'>
                What started as a small project has grown into a thriving
                community of over 50,000 creators and readers. We've helped
                publish thousands of blogs and books, all while leveraging
                cutting-edge AI technology.
              </p>
              <p className='text-lg text-dark-text/70 dark:text-gray-400'>
                Today, we're proud to be the go-to platform for modern content
                creation, combining professional tools with community engagement
                and intelligent assistance.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className='relative'
            >
              <img
                src='https://images.unsplash.com/photo-1522071820081-009f0129c71c'
                alt='Our team'
                className='rounded-2xl shadow-2xl'
              />
              <div className='absolute -bottom-6 -right-6 bg-royal-blue text-white p-4 rounded-xl shadow-xl'>
                <div className='text-2xl font-bold'>50K+</div>
                <div className='text-sm'>Active Users</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className='section-padding bg-gradient-to-r from-royal-blue/10 to-indigo/10'>
        <div className='container-custom'>
          <div className='grid md:grid-cols-2 gap-8'>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className='card p-8 text-center'
            >
              <div className='w-20 h-20 rounded-full bg-royal-blue/20 flex items-center justify-center mx-auto mb-4'>
                <FiTarget className='w-10 h-10 text-royal-blue' />
              </div>
              <h3 className='text-2xl font-bold mb-3'>Our Mission</h3>
              <p className='text-dark-text/70 dark:text-gray-400'>
                To democratize content creation by providing powerful, AI-driven
                tools that empower everyone to share their knowledge and stories
                with the world.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className='card p-8 text-center'
            >
              <div className='w-20 h-20 rounded-full bg-indigo/20 flex items-center justify-center mx-auto mb-4'>
                <FiGlobe className='w-10 h-10 text-indigo' />
              </div>
              <h3 className='text-2xl font-bold mb-3'>Our Vision</h3>
              <p className='text-dark-text/70 dark:text-gray-400'>
                To become the world's largest ecosystem for knowledge creators
                and consumers, fostering a global community of learning and
                inspiration.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className='section-padding bg-off-white dark:bg-gray-900'>
        <div className='container-custom'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className='text-center mb-12'
          >
            <h2 className='text-3xl font-bold mb-4'>
              Our Core <span className='gradient-text'>Values</span>
            </h2>
            <p className='text-xl text-dark-text/70 dark:text-gray-400'>
              The principles that guide everything we do
            </p>
          </motion.div>
          <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8'>
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className='text-center'
              >
                <div className='w-20 h-20 rounded-full gradient-bg-main flex items-center justify-center mx-auto mb-4 text-white'>
                  {value.icon}
                </div>
                <h3 className='text-xl font-bold mb-2'>{value.title}</h3>
                <p className='text-dark-text/70 dark:text-gray-400'>
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className='section-padding bg-gradient-to-r from-deep-navy to-royal-blue text-white'>
        <div className='container-custom'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className='text-center mb-12'
          >
            <h2 className='text-3xl font-bold mb-4'>
              Our <span className='gradient-text'>Journey</span>
            </h2>
            <p className='text-xl text-gray-200'>
              Key milestones in our growth
            </p>
          </motion.div>
          <div className='grid md:grid-cols-4 gap-6'>
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className='text-center'
              >
                <div className='text-4xl font-bold text-emerald mb-2'>
                  {milestone.year}
                </div>
                <div className='text-xl font-semibold mb-2'>
                  {milestone.title}
                </div>
                <p className='text-gray-300 text-sm'>{milestone.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className='section-padding bg-off-white dark:bg-gray-900'>
        <div className='container-custom'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className='text-center mb-12'
          >
            <h2 className='text-3xl font-bold mb-4'>
              Meet Our <span className='gradient-text'>Team</span>
            </h2>
            <p className='text-xl text-dark-text/70 dark:text-gray-400'>
              The passionate people behind BlogLib
            </p>
          </motion.div>
          <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8'>
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className='card p-6 text-center'
              >
                <img
                  src={member.avatar}
                  alt={member.name}
                  className='w-32 h-32 rounded-full object-cover mx-auto mb-4'
                />
                <h3 className='text-xl font-bold mb-1'>{member.name}</h3>
                <p className='text-royal-blue font-semibold mb-2'>
                  {member.role}
                </p>
                <p className='text-sm text-dark-text/60 dark:text-gray-500 mb-4'>
                  {member.bio}
                </p>
                <div className='flex justify-center space-x-3'>
                  <a
                    href={member.social.twitter}
                    className='text-gray-400 hover:text-royal-blue transition-colors'
                  >
                    Twitter
                  </a>
                  <a
                    href={member.social.linkedin}
                    className='text-gray-400 hover:text-royal-blue transition-colors'
                  >
                    LinkedIn
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className='section-padding bg-gradient-to-r from-royal-blue to-indigo text-white'>
        <div className='container-custom'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-8'>
            <div className='text-center'>
              <div className='text-4xl font-bold mb-2'>50K+</div>
              <div className='text-gray-200'>Active Users</div>
            </div>
            <div className='text-center'>
              <div className='text-4xl font-bold mb-2'>10K+</div>
              <div className='text-gray-200'>Blogs Published</div>
            </div>
            <div className='text-center'>
              <div className='text-4xl font-bold mb-2'>5K+</div>
              <div className='text-gray-200'>Books Available</div>
            </div>
            <div className='text-center'>
              <div className='text-4xl font-bold mb-2'>98%</div>
              <div className='text-gray-200'>Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='section-padding bg-off-white dark:bg-gray-900'>
        <div className='container-custom text-center'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className='text-3xl font-bold mb-4'>
              Join Our <span className='gradient-text'>Community</span>
            </h2>
            <p className='text-xl text-dark-text/70 dark:text-gray-400 mb-8 max-w-2xl mx-auto'>
              Be part of something amazing. Start your journey with BlogLib
              today.
            </p>
            <Link to='/register' className='btn-primary text-lg'>
              Get Started Now <FiZap className='inline ml-2' />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
