import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import { User, sequelize } from './models/index.js';
import bcrypt from 'bcryptjs';

async function updateAdminPassword() {
  try {
    await sequelize.authenticate();
    console.log('Connection to DB has been established successfully.');

    const adminEmail = 'translatroyogendra@gmail.com';
    const newPasswordPlain = 'testpassword'; // Temporary plaintext password

    const user = await User.findOne({ where: { email: adminEmail } });

    if (user) {
      // Hash the new plaintext password before saving
      const hashedPassword = await bcrypt.hash(newPasswordPlain, 10);
      user.password = hashedPassword;
      await user.save();
      console.log(`Admin user ${adminEmail} password updated to hashed version of '${newPasswordPlain}'.`);
    } else {
      console.log(`Admin user ${adminEmail} not found.`);
    }
  } catch (error) {
    console.error('Error updating admin password:', error);
  } finally {
    await sequelize.close();
  }
}

updateAdminPassword();
