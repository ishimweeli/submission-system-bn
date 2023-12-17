/*eslint-disable*/

import prisma from '../client';
import initialVariables from '../config/initialVariables';
import { encryptPassword } from '../utils/passworUtils';
import { generateStuffId } from '../utils/generateUniqueIds';
import { seedDown } from './seedDown';

async function main() {
  console.log('Seeding database...');
  await seedDown();
  await prisma.user.createMany({
    data: [
      {
        email: 'asp.amalitech@gmail.com',
        firstName: 'Adminaaaaaaa',
        lastName: 'User',
        role: 'ADMIN',
        staff_id: await generateStuffId('ADMIN'),
        password: await encryptPassword(initialVariables.adminSeeder.pass),
        invited: true
      }
    ],
    skipDuplicates: true
  });
  console.log('Seeding Up completed!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.log(e);

    await prisma.$disconnect();
    process.exit(1);
  });
