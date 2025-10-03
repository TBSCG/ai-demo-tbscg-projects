import { db, closeDatabase } from './config.js';
import { projects, phases } from './schema.js';

/**
 * Seed data for projects
 */
const seedProjects = [
  {
    title: 'Website Redesign',
    client: 'Acme Corp',
    description:
      'Complete overhaul of the company website with modern design, improved UX, and mobile responsiveness. This project includes user research, wireframing, design system creation, and full development.',
    startDate: '2025-01-15',
    endDate: '2025-06-30',
    projectManager: 'Sarah Johnson',
    members: ['Mike Chen', 'Emily Rodriguez', 'Tom Watson'],
  },
  {
    title: 'Mobile App Development',
    client: 'TechStart Inc',
    description:
      'Native iOS and Android application for customer engagement with real-time notifications, in-app purchases, and social features.',
    startDate: '2025-02-01',
    endDate: '2025-12-31',
    projectManager: 'David Kim',
    members: ['Lisa Wang', 'James Brown', 'Anna Martinez', 'Chris Lee'],
  },
  {
    title: 'E-commerce Platform',
    client: 'ShopHub LLC',
    description:
      'Full-featured online shopping platform with payment integration, inventory management, and customer analytics dashboard.',
    startDate: '2025-03-01',
    endDate: '2025-09-30',
    projectManager: 'Rachel Green',
    members: ['John Doe', 'Maria Garcia', 'Kevin Wu'],
  },
  {
    title: 'CRM System Integration',
    client: 'Enterprise Solutions',
    description:
      'Integration of Salesforce CRM with existing enterprise systems, including data migration and custom workflow automation.',
    startDate: '2025-01-20',
    endDate: '2025-05-15',
    projectManager: 'Michael Scott',
    members: ['Pam Beesly', 'Jim Halpert'],
  },
  {
    title: 'Data Analytics Dashboard',
    client: 'DataViz Co',
    description:
      'Interactive business intelligence dashboard with real-time data visualization, custom reports, and predictive analytics.',
    startDate: '2025-04-01',
    endDate: '2025-08-31',
    projectManager: 'Alex Turner',
    members: ['Sophie Chen', 'Robert Johnson', 'Emma Wilson', 'Lucas Brown', 'Olivia Davis'],
  },
  {
    title: 'Cloud Migration',
    client: 'Legacy Systems Corp',
    description:
      'Migration of on-premise infrastructure to AWS cloud with zero downtime, including containerization and CI/CD pipeline setup.',
    startDate: '2025-02-15',
    endDate: '2025-11-30',
    projectManager: 'Jennifer Lopez',
    members: ['Carlos Rodriguez', 'Amy Chen'],
  },
  {
    title: 'Marketing Automation',
    client: 'GrowthHack Inc',
    description:
      'Automated marketing platform with email campaigns, lead scoring, and multi-channel attribution tracking.',
    startDate: '2025-05-01',
    endDate: '2025-10-31',
    projectManager: 'Brian Taylor',
    members: ['Jessica White', 'Daniel Kim', 'Sarah Miller'],
  },
  {
    title: 'Security Audit & Compliance',
    client: 'SecureBank',
    description:
      'Comprehensive security audit, penetration testing, and implementation of compliance measures for financial regulations.',
    startDate: '2025-01-10',
    endDate: '2025-04-30',
    projectManager: 'Linda Martinez',
    members: ['Richard Lee', 'Patricia Anderson'],
  },
];

/**
 * Seed data for phases
 * Each array corresponds to the phases for each project in order
 */
const seedPhases: Array<Array<{ name: string; description: string; startDate: string; endDate: string; status: string; order: number }>> = [
  // Phases for Website Redesign
  [
    {
      name: 'Discovery & Research',
      description: 'User research, competitor analysis, and requirements gathering',
      startDate: '2025-01-15',
      endDate: '2025-02-15',
      status: 'completed',
      order: 1,
    },
    {
      name: 'Design Phase',
      description: 'Wireframes, mockups, and design system creation',
      startDate: '2025-02-16',
      endDate: '2025-03-31',
      status: 'in-progress',
      order: 2,
    },
    {
      name: 'Development',
      description: 'Frontend and backend development, integration',
      startDate: '2025-04-01',
      endDate: '2025-06-15',
      status: 'planned',
      order: 3,
    },
    {
      name: 'Testing & Launch',
      description: 'QA testing, bug fixes, and production deployment',
      startDate: '2025-06-16',
      endDate: '2025-06-30',
      status: 'planned',
      order: 4,
    },
  ],
  // Phases for Mobile App Development
  [
    {
      name: 'Planning & Architecture',
      description: 'Technical planning, architecture design, and technology selection',
      startDate: '2025-02-01',
      endDate: '2025-03-01',
      status: 'completed',
      order: 1,
    },
    {
      name: 'MVP Development',
      description: 'Core features development for minimum viable product',
      startDate: '2025-03-02',
      endDate: '2025-06-30',
      status: 'in-progress',
      order: 2,
    },
    {
      name: 'Beta Testing',
      description: 'Beta release and user feedback collection',
      startDate: '2025-07-01',
      endDate: '2025-09-30',
      status: 'planned',
      order: 3,
    },
    {
      name: 'Full Release',
      description: 'Final features, optimization, and official launch',
      startDate: '2025-10-01',
      endDate: '2025-12-31',
      status: 'planned',
      order: 4,
    },
  ],
  // Phases for E-commerce Platform
  [
    {
      name: 'Requirements Analysis',
      description: 'Detailed requirements gathering and feature specification',
      startDate: '2025-03-01',
      endDate: '2025-03-31',
      status: 'planned',
      order: 1,
    },
    {
      name: 'Platform Development',
      description: 'Core e-commerce functionality development',
      startDate: '2025-04-01',
      endDate: '2025-07-31',
      status: 'planned',
      order: 2,
    },
    {
      name: 'Payment Integration',
      description: 'Payment gateway integration and security implementation',
      startDate: '2025-08-01',
      endDate: '2025-09-15',
      status: 'planned',
      order: 3,
    },
    {
      name: 'Launch Preparation',
      description: 'Final testing, training, and go-live',
      startDate: '2025-09-16',
      endDate: '2025-09-30',
      status: 'planned',
      order: 4,
    },
  ],
  // Phases for CRM System Integration
  [
    {
      name: 'System Assessment',
      description: 'Current system analysis and integration planning',
      startDate: '2025-01-20',
      endDate: '2025-02-20',
      status: 'completed',
      order: 1,
    },
    {
      name: 'Data Migration',
      description: 'Data mapping, cleansing, and migration to Salesforce',
      startDate: '2025-02-21',
      endDate: '2025-04-15',
      status: 'in-progress',
      order: 2,
    },
    {
      name: 'Testing & Training',
      description: 'Integration testing and user training sessions',
      startDate: '2025-04-16',
      endDate: '2025-05-15',
      status: 'planned',
      order: 3,
    },
  ],
  // Phases for Data Analytics Dashboard
  [
    {
      name: 'Data Architecture',
      description: 'Data warehouse design and ETL pipeline setup',
      startDate: '2025-04-01',
      endDate: '2025-05-15',
      status: 'planned',
      order: 1,
    },
    {
      name: 'Dashboard Development',
      description: 'Interactive visualizations and report building',
      startDate: '2025-05-16',
      endDate: '2025-07-31',
      status: 'planned',
      order: 2,
    },
    {
      name: 'Analytics Features',
      description: 'Predictive models and advanced analytics',
      startDate: '2025-08-01',
      endDate: '2025-08-31',
      status: 'planned',
      order: 3,
    },
  ],
  // Phases for Cloud Migration
  [
    {
      name: 'Assessment & Planning',
      description: 'Infrastructure audit and migration strategy',
      startDate: '2025-02-15',
      endDate: '2025-03-31',
      status: 'in-progress',
      order: 1,
    },
    {
      name: 'Containerization',
      description: 'Application containerization with Docker',
      startDate: '2025-04-01',
      endDate: '2025-06-30',
      status: 'planned',
      order: 2,
    },
    {
      name: 'Cloud Setup',
      description: 'AWS infrastructure provisioning and configuration',
      startDate: '2025-07-01',
      endDate: '2025-09-30',
      status: 'planned',
      order: 3,
    },
    {
      name: 'Migration & Cutover',
      description: 'Data migration and production cutover',
      startDate: '2025-10-01',
      endDate: '2025-11-30',
      status: 'planned',
      order: 4,
    },
  ],
  // Phases for Marketing Automation
  [
    {
      name: 'Platform Setup',
      description: 'Marketing automation platform configuration',
      startDate: '2025-05-01',
      endDate: '2025-06-15',
      status: 'planned',
      order: 1,
    },
    {
      name: 'Campaign Development',
      description: 'Email templates and campaign workflows',
      startDate: '2025-06-16',
      endDate: '2025-08-31',
      status: 'planned',
      order: 2,
    },
    {
      name: 'Integration & Testing',
      description: 'CRM integration and campaign testing',
      startDate: '2025-09-01',
      endDate: '2025-10-31',
      status: 'planned',
      order: 3,
    },
  ],
  // Phases for Security Audit & Compliance
  [
    {
      name: 'Security Assessment',
      description: 'Vulnerability scanning and risk assessment',
      startDate: '2025-01-10',
      endDate: '2025-02-10',
      status: 'completed',
      order: 1,
    },
    {
      name: 'Penetration Testing',
      description: 'Ethical hacking and security testing',
      startDate: '2025-02-11',
      endDate: '2025-03-15',
      status: 'in-progress',
      order: 2,
    },
    {
      name: 'Compliance Implementation',
      description: 'Security controls and compliance measures',
      startDate: '2025-03-16',
      endDate: '2025-04-30',
      status: 'planned',
      order: 3,
    },
  ],
];

/**
 * Seed the database with sample data
 * This script is idempotent - it checks if data exists before inserting
 */
async function seedDatabase() {
  console.log('🌱 Starting database seed...');

  try {
    // Check if projects already exist
    const existingProjects = await db.select().from(projects).limit(1);

    if (existingProjects.length > 0) {
      console.log('⚠️  Database already contains data. Skipping seed.');
      console.log('   To re-seed, first clear the database or drop tables.');
      return;
    }

    // Insert projects with their phases
    console.log('📦 Inserting projects...');
    let totalPhases = 0;
    
    for (let i = 0; i < seedProjects.length; i++) {
      const project = seedProjects[i];
      
      // Insert project and get the generated ID
      const [insertedProject] = await db.insert(projects).values(project).returning();
      console.log(`   ✓ Created project: ${project.title}`);

      // Insert phases for this project
      const projectPhases = seedPhases[i];
      if (projectPhases && projectPhases.length > 0) {
        for (const phase of projectPhases) {
          await db.insert(phases).values({
            projectId: insertedProject.id,
            ...phase,
          });
        }
        totalPhases += projectPhases.length;
        console.log(`   ✓ Added ${projectPhases.length} phases`);
      }
    }

    console.log('\n✅ Database seeded successfully!');
    console.log(`   📊 ${seedProjects.length} projects created`);
    console.log(`   📈 ${totalPhases} phases created`);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await closeDatabase();
  }
}

seedDatabase();

