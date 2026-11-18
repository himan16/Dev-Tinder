// Creates dummy users for local development.
// Run with: npm run seed
// Safe to re-run: users whose email already exists are not duplicated (only their avatar and password are refreshed).
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const connectToDatabase = require('../src/configs/database');
const User = require('../src/models/user');
const {getPasswordError} = require('../src/utils/validation');

// Every seeded user logs in with this password (it satisfies the signup password rules).
const DEV_PASSWORD = 'Tester@123';

const seedUsers = [
    {firstName: 'Aarav',  lastName: 'Sharma',  age: 24, gender: 'male',   bio: 'Backend dev who loves Node and coffee.',        skills: ['Node.js', 'Express', 'MongoDB']},
    {firstName: 'Priya',  lastName: 'Patel',   age: 27, gender: 'female', bio: 'Frontend engineer, React all day.',             skills: ['React', 'TypeScript', 'CSS']},
    {firstName: 'Rohan',  lastName: 'Gupta',   age: 29, gender: 'male',   bio: 'DevOps tinkerer. Containers everywhere.',       skills: ['Docker', 'Kubernetes', 'AWS']},
    {firstName: 'Ananya', lastName: 'Reddy',   age: 25, gender: 'female', bio: 'Full stack, always learning something new.',    skills: ['JavaScript', 'Python', 'PostgreSQL']},
    {firstName: 'Kabir',  lastName: 'Mehta',   age: 31, gender: 'male',   bio: 'Mobile developer building cross-platform apps.', skills: ['React Native', 'Flutter', 'Firebase']},
    {firstName: 'Ishita', lastName: 'Verma',   age: 23, gender: 'female', bio: 'Data nerd turning CSVs into insights.',         skills: ['Python', 'Pandas', 'SQL']},
    {firstName: 'Vikram', lastName: 'Singh',   age: 33, gender: 'male',   bio: 'Systems programmer. Rust fan.',                 skills: ['Rust', 'Go', 'Linux']},
    {firstName: 'Neha',   lastName: 'Joshi',   age: 26, gender: 'female', bio: 'Open source contributor and docs enthusiast.',  skills: ['Java', 'Spring Boot', 'Git']},
    {firstName: 'Arjun',  lastName: 'Nair',    age: 28, gender: 'male',   bio: 'Security minded. Break it, then fix it.',       skills: ['Security', 'Node.js', 'Networking']},
    {firstName: 'Sana',   lastName: 'Khan',    age: 22, gender: 'other',  bio: 'Student building side projects on weekends.',   skills: ['HTML', 'CSS', 'JavaScript']},
    {firstName: 'Dev',    lastName: 'Malhotra', age: 30, gender: 'male',   bio: 'Tech lead who still loves writing code.',       skills: ['Java', 'Microservices', 'Kafka']},
    {firstName: 'Meera',  lastName: 'Iyer',    age: 24, gender: 'female', bio: 'UI/UX minded developer, pixel perfectionist.',  skills: ['Figma', 'React', 'Tailwind']},
    {firstName: 'Karan',  lastName: 'Kapoor',  age: 27, gender: 'male',   bio: 'Game dev by night, backend dev by day.',        skills: ['C#', 'Unity', 'Node.js']},
    {firstName: 'Tanvi',  lastName: 'Desai',   age: 26, gender: 'female', bio: 'Machine learning engineer exploring LLMs.',     skills: ['Python', 'PyTorch', 'MLOps']},
    {firstName: 'Rahul',  lastName: 'Bansal',  age: 32, gender: 'male',   bio: 'Database nerd. Indexes are my love language.',  skills: ['PostgreSQL', 'Redis', 'MongoDB']},
    {firstName: 'Simran', lastName: 'Kaur',    age: 25, gender: 'female', bio: 'Cloud engineer who automates everything.',      skills: ['Terraform', 'AWS', 'Python']},
    {firstName: 'Yash',   lastName: 'Agarwal', age: 23, gender: 'male',   bio: 'Fresh grad shipping side projects fast.',       skills: ['Next.js', 'Prisma', 'TypeScript']},
    {firstName: 'Divya',  lastName: 'Menon',   age: 29, gender: 'female', bio: 'QA automation and testing advocate.',           skills: ['Cypress', 'Jest', 'Selenium']},
    {firstName: 'Harsh',  lastName: 'Vora',    age: 28, gender: 'male',   bio: 'Blockchain tinkerer and Solidity learner.',     skills: ['Solidity', 'Ethereum', 'Web3.js']},
    {firstName: 'Pooja',  lastName: 'Bhatt',   age: 31, gender: 'female', bio: 'Engineering manager who still reviews PRs.',    skills: ['Leadership', 'Go', 'System Design']},
    {firstName: 'Nikhil', lastName: 'Rao',     age: 34, gender: 'male',   bio: 'Embedded systems and IoT enthusiast.',          skills: ['C++', 'Arduino', 'MQTT']},
    {firstName: 'Kavya',  lastName: 'Pillai',  age: 22, gender: 'female', bio: 'Open to hackathons, pizza and good code.',      skills: ['Python', 'Flask', 'React']},
    {firstName: 'Sahil',  lastName: 'Chopra',  age: 27, gender: 'male',   bio: 'Site reliability engineer. I love dashboards.', skills: ['Prometheus', 'Grafana', 'Linux']},
    {firstName: 'Riya',   lastName: 'Saxena',  age: 24, gender: 'female', bio: 'Android developer, Kotlin all the way.',        skills: ['Kotlin', 'Jetpack Compose', 'Firebase']},
    {firstName: 'Aditya', lastName: 'Kulkarni', age: 30, gender: 'male',  bio: 'GraphQL evangelist and API designer.',          skills: ['GraphQL', 'Apollo', 'Node.js']},
    {firstName: 'Shreya', lastName: 'Ghosh',   age: 26, gender: 'female', bio: 'Technical writer who also codes a bit.',        skills: ['Markdown', 'Docs', 'JavaScript']},
    {firstName: 'Manav',  lastName: 'Thakur',  age: 35, gender: 'male',   bio: 'Architect of too many microservices.',          skills: ['Kubernetes', 'Java', 'AWS']},
    {firstName: 'Tara',   lastName: 'Bose',    age: 28, gender: 'female', bio: 'iOS developer with a love for clean UI.',       skills: ['Swift', 'SwiftUI', 'Core Data']},
    {firstName: 'Zoya',   lastName: 'Ansari',  age: 25, gender: 'other',  bio: 'Cybersecurity student and CTF player.',         skills: ['Python', 'Burp Suite', 'Linux']},
    {firstName: 'Ishaan', lastName: 'Trivedi', age: 33, gender: 'male',   bio: 'Performance tuning is my therapy.',             skills: ['Rust', 'WebAssembly', 'Profiling']},
].map((user) => ({
    ...user,
    email: `${user.firstName.toLowerCase()}@devtinder.dev`,
    // DiceBear generates a unique SVG avatar from the seed. Needs internet access when the frontend loads it.
    avtar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${user.firstName}`,
}));

async function seed() {
    const passwordError = getPasswordError(DEV_PASSWORD);
    if (passwordError) {
        throw new Error(`DEV_PASSWORD is invalid: ${passwordError}`);
    }
    const password = await bcrypt.hash(DEV_PASSWORD, 10);

    await connectToDatabase();
    console.log('Connected to database ...');

    let created = 0;
    let updated = 0;
    let skipped = 0;
    for (const data of seedUsers) {
        const existing = await User.findOne({email: data.email});
        if (existing) {
            // Only refresh the avatar and password on existing users; everything else is left untouched.
            // Hashes are salted, so check the password with bcrypt instead of comparing hashes.
            const changes = [];
            if (existing.avtar !== data.avtar) {
                existing.avtar = data.avtar;
                changes.push('avatar');
            }
            if (!(await existing.validatePassword(DEV_PASSWORD))) {
                existing.password = password;
                changes.push('password');
            }
            if (changes.length > 0) {
                await existing.save();
                console.log(`updated  ${data.email} (${changes.join(', ')})`);
                updated++;
            } else {
                console.log(`skip     ${data.email} (already exists)`);
                skipped++;
            }
            continue;
        }
        await new User({...data, password}).save();
        console.log(`created  ${data.email}`);
        created++;
    }

    console.log(`\nDone. Created ${created}, updated ${updated}, skipped ${skipped}.`);
    console.log(`Log in with any of these emails and the password: ${DEV_PASSWORD}`);
}

seed()
    .catch((err) => {
        console.error('Seeding failed:', err.message);
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
