
import { packageService } from "./packageService";
import { adPackages } from "@/types/adPackage";

export const seedDefaultPackages = async () => {
  try {
    console.log('Seeding default packages...');
    
    // Get existing packages to avoid duplicates
    const existing = await packageService.getPackages();
    const existingIds = existing.map(pkg => pkg.id);
    
    // Filter out packages that already exist
    const packagesToSeed = adPackages.filter(pkg => !existingIds.includes(pkg.id));
    
    if (packagesToSeed.length === 0) {
      console.log('All default packages already exist');
      return;
    }
    
    // Seed missing packages
    for (const pkg of packagesToSeed) {
      const iconName = pkg.icon.name || 'Star'; // Get icon name from component
      await packageService.createPackage({
        ...pkg,
        icon: iconName
      });
    }
    
    console.log(`Seeded ${packagesToSeed.length} default packages`);
    console.log('Package features have been automatically configured via database migration');
  } catch (error) {
    console.error('Error seeding packages:', error);
    throw error;
  }
};
