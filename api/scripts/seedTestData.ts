import { testDataSeeder } from '../utils/testDataSeeder';
import { logger } from '../utils/logger';

async function main() {
  try {
    logger.info('Starting test data seeding...');
    
    await testDataSeeder.seedTestData();
    
    const credentials = await testDataSeeder.getTestCredentials();
    
    logger.info('\n=== TEST CREDENTIALS ===');
    logger.info('Admin Users:');
    credentials.admin.forEach(user => {
      logger.info(`  Email: ${user.email}, Password: ${user.password}`);
    });
    
    logger.info('Teacher Users:');
    credentials.teacher.forEach(user => {
      logger.info(`  Email: ${user.email}, Password: ${user.password}`);
    });
    
    logger.info('Student Users:');
    credentials.student.forEach(user => {
      logger.info(`  Email: ${user.email}, Password: ${user.password}`);
    });
    
    logger.info('\nTest data seeding completed successfully!');
    process.exit(0);
    
  } catch (error) {
    logger.error('Test data seeding failed:', error);
    process.exit(1);
  }
}

main();