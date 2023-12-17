import prisma from '../client';

export const seedDown = async () => {
  console.log('Seeding Down database...');
  await prisma.user.deleteMany({
    where: {
      email: {
        in: ['asp.amalitech@gmail.com']
      }
    }
  });
  console.log('Seeding Down completed!');
};
