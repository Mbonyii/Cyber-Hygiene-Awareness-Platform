import { storage } from "./storage";

async function seed() {
  console.log("🌱 Seeding database...");

  // Create badges
  console.log("Creating badges...");
  const badgesData = [
    {
      name: "First Steps",
      description: "Complete your first quiz",
      icon: "🎯",
      category: "beginner",
      requirement: "Complete 1 quiz",
      points: 50,
    },
    {
      name: "Password Pro",
      description: "Master password security fundamentals",
      icon: "🔐",
      category: "password",
      requirement: "Complete a password module",
      points: 100,
    },
    {
      name: "Phishing Master",
      description: "Identify phishing threats with 90%+ accuracy",
      icon: "🎣",
      category: "phishing",
      requirement: "Score 90%+ on 3 phishing simulations",
      points: 150,
    },
    {
      name: "Quiz Champion",
      description: "Complete 10 quizzes",
      icon: "🏆",
      category: "achievement",
      requirement: "Complete 10 quizzes",
      points: 200,
    },
    {
      name: "Perfect Score",
      description: "Get 100% on any quiz",
      icon: "⭐",
      category: "achievement",
      requirement: "Score 100% on a quiz",
      points: 150,
    },
    {
      name: "Dedicated Learner",
      description: "Complete 5 or more modules",
      icon: "📚",
      category: "achievement",
      requirement: "Complete 5 modules",
      points: 300,
    },
  ];

  for (const badge of badgesData) {
    await storage.createBadge(badge);
  }

  // Create learning modules
  console.log("Creating learning modules...");
  
  const passwordModule = await storage.createModule({
    title: "Password Security Fundamentals",
    description: "Learn how to create and manage strong, secure passwords that protect your accounts from unauthorized access.",
    category: "Password Security",
    difficulty: "Beginner",
    content: `# Password Security Fundamentals

## Why Strong Passwords Matter
Your password is the first line of defense protecting your digital identity. Weak passwords are like leaving your front door unlocked - they make you an easy target for cybercriminals.

## Characteristics of Strong Passwords
1. **Length**: Minimum 12 characters (longer is better)
2. **Complexity**: Mix of uppercase, lowercase, numbers, and symbols
3. **Unpredictability**: Avoid dictionary words, personal info, common patterns
4. **Uniqueness**: Different password for every account

## Common Password Mistakes
- Using personal information (birthdays, names, addresses)
- Dictionary words or common phrases
- Sequential characters (123456, abcdef)
- Reusing passwords across multiple accounts
- Storing passwords in plain text

## Password Best Practices
1. Use a password manager to generate and store complex passwords
2. Enable two-factor authentication (2FA) wherever possible
3. Change passwords immediately if a breach is suspected
4. Never share passwords via email or messaging
5. Use passphrases (long, memorable phrases) for important accounts

## Password Managers
Password managers are secure vaults that:
- Generate strong, unique passwords for every account
- Auto-fill login credentials
- Sync across devices
- Alert you about breached passwords

Popular options include: Bitwarden, 1Password, LastPass, Dashlane`,
    estimatedMinutes: 15,
    orderIndex: 1,
  });

  const phishingModule = await storage.createModule({
    title: "Identifying Phishing Attacks",
    description: "Recognize and avoid phishing emails, the most common method cybercriminals use to steal credentials and personal information.",
    category: "Phishing Prevention",
    difficulty: "Beginner",
    content: `# Identifying Phishing Attacks

## What is Phishing?
Phishing is a cyber attack where criminals impersonate legitimate organizations via email, text, or phone to trick you into revealing sensitive information or downloading malware.

## Red Flags to Watch For
1. **Suspicious Sender**: Check email address carefully - look for slight misspellings
2. **Urgency & Threats**: "Act now!" or "Account suspended" creates panic
3. **Generic Greetings**: "Dear Customer" instead of your name
4. **Spelling & Grammar Errors**: Professional companies proofread
5. **Suspicious Links**: Hover to reveal true destination before clicking
6. **Unexpected Attachments**: Never open attachments from unknown senders
7. **Requests for Personal Info**: Legitimate companies don't ask via email

## Common Phishing Tactics
- **CEO Fraud**: Impersonating executives to request urgent transfers
- **Tax Scams**: Fake IRS/government agencies demanding payment
- **Package Delivery**: Fake tracking notifications with malicious links
- **Account Verification**: Fake security alerts from banks or social media
- **Prize/Lottery Scams**: "You've won!" notifications

## How to Stay Safe
1. Verify sender identity independently (don't use contact info from suspicious email)
2. Type URLs directly instead of clicking email links
3. Enable email filtering and anti-phishing tools
4. Report phishing attempts to IT/security team
5. When in doubt, throw it out

## If You Click a Phishing Link
1. Disconnect from internet immediately
2. Run antivirus/malware scan
3. Change passwords for affected accounts
4. Enable 2FA on all accounts
5. Monitor accounts for suspicious activity
6. Report to IT security team`,
    estimatedMinutes: 20,
    orderIndex: 2,
  });

  const mfaModule = await storage.createModule({
    title: "Multi-Factor Authentication (MFA)",
    description: "Understand how MFA adds an extra layer of security beyond passwords, dramatically reducing the risk of account compromise.",
    category: "Authentication",
    difficulty: "Intermediate",
    content: `# Multi-Factor Authentication (MFA)

## What is MFA?
Multi-Factor Authentication requires two or more verification factors to access an account, making it exponentially harder for attackers to gain unauthorized access.

## The Three Factors
1. **Something You Know**: Password, PIN, security questions
2. **Something You Have**: Phone, security key, smart card
3. **Something You Are**: Fingerprint, face scan, voice recognition

## Types of MFA
- **SMS/Text Codes**: Receive one-time code via text (least secure)
- **Authenticator Apps**: TOTP codes from Google Authenticator, Authy
- **Push Notifications**: Approve login from mobile app
- **Hardware Security Keys**: Physical USB/NFC devices (most secure)
- **Biometrics**: Fingerprint, facial recognition

## Why MFA Matters
Even if your password is compromised, MFA prevents unauthorized access. Studies show MFA blocks 99.9% of automated attacks.

## MFA Best Practices
1. Enable MFA on all important accounts (email, banking, work)
2. Use authenticator apps over SMS when possible
3. Keep backup codes in a secure location
4. Register multiple devices as backup
5. Review and update MFA settings regularly

## Common MFA Mistakes
- Using SMS-based MFA (vulnerable to SIM swapping)
- Not setting up backup methods
- Approving push notifications without verifying the login attempt
- Sharing MFA codes with others`,
    estimatedMinutes: 18,
    orderIndex: 3,
  });

  const socialEngineeringModule = await storage.createModule({
    title: "Social Engineering Awareness",
    description: "Learn to recognize manipulation tactics used by attackers to exploit human psychology and bypass technical security controls.",
    category: "Social Engineering",
    difficulty: "Intermediate",
    content: `# Social Engineering Awareness

## What is Social Engineering?
Social engineering exploits human psychology rather than technical vulnerabilities. Attackers manipulate people into breaking security protocols or divulging confidential information.

## Common Social Engineering Techniques

### Pretexting
Creating a fabricated scenario to obtain information. Example: Caller pretends to be from IT support needing your password.

### Phishing
Fraudulent emails/messages appearing to be from trusted sources. Covered in detail in the Phishing module.

### Baiting
Offering something enticing to trick victims. Example: Infected USB drives labeled "Confidential - Employee Salaries" left in parking lot.

### Quid Pro Quo
Offering a service in exchange for information. Example: Fake tech support offering to fix a non-existent problem.

### Tailgating
Following authorized personnel into restricted areas without proper credentials.

### Vishing (Voice Phishing)
Phone-based social engineering. Example: Caller claims to be from your bank's fraud department.

## Warning Signs
1. Requests for sensitive information
2. Creating urgency or fear
3. Offering help you didn't request
4. Too good to be true offers
5. Requests to bypass normal procedures
6. Flattery or authority intimidation

## Protection Strategies
1. **Verify Identity**: Independently confirm who you're communicating with
2. **Follow Protocols**: Don't bypass security procedures
3. **Question Unusual Requests**: Trust your instincts
4. **Limit Information Sharing**: Share only what's necessary
5. **Report Suspicious Activity**: Alert security team immediately
6. **Stay Educated**: Attackers constantly evolve tactics`,
    estimatedMinutes: 22,
    orderIndex: 4,
  });

  const dataPrivacyModule = await storage.createModule({
    title: "Data Privacy & Protection",
    description: "Understand the importance of protecting personal and organizational data, and learn practical steps to safeguard sensitive information.",
    category: "Data Privacy",
    difficulty: "Beginner",
    content: `# Data Privacy & Protection

## What is Data Privacy?
Data privacy is the right to control how your personal information is collected, used, and shared. In today's digital world, protecting data is crucial for both individuals and organizations.

## Types of Sensitive Data
- **Personal Identifiable Information (PII)**: Name, address, SSN, DOB
- **Financial Data**: Credit cards, bank accounts, tax information
- **Health Information**: Medical records, insurance details
- **Credentials**: Usernames, passwords, API keys
- **Proprietary Information**: Trade secrets, business strategies

## Data Protection Principles
1. **Minimize Collection**: Only collect necessary data
2. **Secure Storage**: Encrypt sensitive data at rest
3. **Secure Transmission**: Use HTTPS/TLS for data in transit
4. **Access Control**: Limit access to authorized personnel only
5. **Regular Disposal**: Securely delete data when no longer needed

## Privacy Laws & Regulations
- **GDPR** (EU): General Data Protection Regulation
- **CCPA** (California): California Consumer Privacy Act
- **HIPAA** (US Healthcare): Health Insurance Portability and Accountability Act
- **PCI DSS**: Payment Card Industry Data Security Standard

## Best Practices
1. Use encryption for sensitive files and communications
2. Implement strong access controls and authentication
3. Regularly update privacy settings on apps and services
4. Be cautious about what you share on social media
5. Use secure deletion methods for sensitive files
6. Review app permissions and remove unnecessary access
7. Use VPNs on public WiFi networks

## Data Breach Response
If your data is compromised:
1. Change affected passwords immediately
2. Enable MFA on all accounts
3. Monitor financial accounts for fraud
4. Consider credit freeze or fraud alerts
5. Report to appropriate authorities
6. Document the incident`,
    estimatedMinutes: 20,
    orderIndex: 5,
  });

  // Create quiz questions for Password Security module
  console.log("Creating quiz questions...");
  
  await storage.createQuizQuestion({
    moduleId: passwordModule.id,
    question: "What is the recommended minimum length for a secure password?",
    options: ["6 characters", "8 characters", "12 characters", "20 characters"],
    correctAnswer: 2,
    explanation: "While 8 characters was once standard, modern security best practices recommend at least 12 characters to resist brute-force attacks. Longer is always better!",
    orderIndex: 1,
  });

  await storage.createQuizQuestion({
    moduleId: passwordModule.id,
    question: "Which of these is the WORST password practice?",
    options: [
      "Using a password manager",
      "Reusing the same password across multiple accounts",
      "Using a combination of letters, numbers, and symbols",
      "Enabling two-factor authentication"
    ],
    correctAnswer: 1,
    explanation: "Reusing passwords is extremely dangerous because if one account is compromised, all accounts using that password are at risk. Always use unique passwords for each account.",
    orderIndex: 2,
  });

  await storage.createQuizQuestion({
    moduleId: passwordModule.id,
    question: "What is a passphrase?",
    options: [
      "A short complex password",
      "A long, memorable phrase used as a password",
      "A temporary password that expires quickly",
      "A password hint stored in your browser"
    ],
    correctAnswer: 1,
    explanation: "A passphrase is a long sequence of words or a sentence that's both secure (due to length) and memorable. Example: 'Coffee-Sunrise-Mountain-Dance-42'",
    orderIndex: 3,
  });

  await storage.createQuizQuestion({
    moduleId: passwordModule.id,
    question: "True or False: It's safe to share passwords via email if you trust the recipient.",
    options: ["True", "False"],
    correctAnswer: 1,
    explanation: "False! Email is not secure and can be intercepted. Never share passwords via email, even with trusted individuals. Use secure password sharing features in password managers instead.",
    orderIndex: 4,
  });

  await storage.createQuizQuestion({
    moduleId: passwordModule.id,
    question: "What should you do if you suspect a password has been compromised?",
    options: [
      "Wait a few days to see if anything happens",
      "Change it immediately and enable MFA",
      "Just change the password at your next regular update",
      "Email the company to ask if they were breached"
    ],
    correctAnswer: 1,
    explanation: "Change compromised passwords immediately and enable multi-factor authentication. Acting quickly minimizes potential damage from unauthorized access.",
    orderIndex: 5,
  });

  // Create quiz questions for Phishing module
  await storage.createQuizQuestion({
    moduleId: phishingModule.id,
    question: "Which is a common red flag in phishing emails?",
    options: [
      "Professional formatting",
      "Personalized greeting using your name",
      "Urgent language like 'Act now or account will be suspended'",
      "Official company logo"
    ],
    correctAnswer: 2,
    explanation: "Phishing emails often create a sense of urgency to pressure you into acting without thinking. Legitimate companies rarely threaten immediate account suspension.",
    orderIndex: 1,
  });

  await storage.createQuizQuestion({
    moduleId: phishingModule.id,
    question: "Before clicking a link in an email, you should:",
    options: [
      "Click it immediately if it looks legitimate",
      "Hover over it to see the actual URL destination",
      "Forward the email to friends to verify",
      "Trust links from any email in your inbox"
    ],
    correctAnswer: 1,
    explanation: "Always hover over links to reveal their true destination. Attackers can make link text appear legitimate while the actual URL goes to a malicious site.",
    orderIndex: 2,
  });

  await storage.createQuizQuestion({
    moduleId: phishingModule.id,
    question: "What should you do if you accidentally click a phishing link?",
    options: [
      "Do nothing and hope for the best",
      "Disconnect from internet, run antivirus, change passwords, enable MFA",
      "Just change your password",
      "Wait to see if anything bad happens"
    ],
    correctAnswer: 1,
    explanation: "If you click a phishing link, immediately disconnect from the internet to prevent malware communication, run a security scan, change compromised passwords, and enable MFA on all accounts.",
    orderIndex: 3,
  });

  await storage.createQuizQuestion({
    moduleId: phishingModule.id,
    question: "What is 'CEO Fraud' or 'Business Email Compromise'?",
    options: [
      "When a CEO gets hacked",
      "Attackers impersonating executives to request urgent transfers",
      "When a business email server is compromised",
      "Fraud committed by actual CEOs"
    ],
    correctAnswer: 1,
    explanation: "CEO Fraud involves attackers impersonating company executives (often via email) to trick employees into making urgent wire transfers or sharing sensitive data.",
    orderIndex: 4,
  });

  await storage.createQuizQuestion({
    moduleId: phishingModule.id,
    question: "Legitimate companies will:",
    options: [
      "Ask you to verify account details via email",
      "Request your password to fix technical issues",
      "Never ask for sensitive information via email",
      "Send urgent threats about account closure"
    ],
    correctAnswer: 2,
    explanation: "Legitimate organizations never ask for sensitive information (passwords, SSN, credit cards) via email. If you receive such a request, it's a phishing attempt.",
    orderIndex: 5,
  });

  // Create quiz questions for MFA module
  await storage.createQuizQuestion({
    moduleId: mfaModule.id,
    question: "Which MFA method is considered MOST secure?",
    options: [
      "SMS text codes",
      "Email verification",
      "Hardware security keys (YubiKey, etc.)",
      "Security questions"
    ],
    correctAnswer: 2,
    explanation: "Hardware security keys are the most secure MFA method because they're physical devices immune to phishing, interception, and remote attacks. SMS is vulnerable to SIM swapping.",
    orderIndex: 1,
  });

  await storage.createQuizQuestion({
    moduleId: mfaModule.id,
    question: "What are the three factors in multi-factor authentication?",
    options: [
      "Password, username, and email",
      "Something you know, something you have, something you are",
      "Phone, computer, and tablet",
      "PIN, password, and passphrase"
    ],
    correctAnswer: 1,
    explanation: "The three factors are: something you know (password), something you have (phone/security key), and something you are (biometric like fingerprint).",
    orderIndex: 2,
  });

  await storage.createQuizQuestion({
    moduleId: mfaModule.id,
    question: "Why is SMS-based MFA considered less secure?",
    options: [
      "It's too convenient",
      "Vulnerable to SIM swapping attacks",
      "Messages arrive too slowly",
      "It costs money"
    ],
    correctAnswer: 1,
    explanation: "SMS MFA is vulnerable to SIM swapping, where attackers convince phone carriers to transfer your number to their device, allowing them to receive your codes.",
    orderIndex: 3,
  });

  await storage.createQuizQuestion({
    moduleId: mfaModule.id,
    question: "What should you do with MFA backup codes?",
    options: [
      "Delete them for security",
      "Email them to yourself",
      "Store them securely offline (safe, password manager)",
      "Share them with IT department"
    ],
    correctAnswer: 2,
    explanation: "Backup codes should be stored securely offline (in a safe or password manager's secure notes) so you can regain access if you lose your primary MFA device.",
    orderIndex: 4,
  });

  await storage.createQuizQuestion({
    moduleId: mfaModule.id,
    question: "MFA effectiveness: Studies show MFA can block approximately what percentage of automated attacks?",
    options: [
      "50%",
      "75%",
      "90%",
      "99.9%"
    ],
    correctAnswer: 3,
    explanation: "Microsoft research shows that MFA blocks approximately 99.9% of automated attacks, making it one of the most effective security measures you can implement.",
    orderIndex: 5,
  });

  // Create quiz questions for Social Engineering module
  await storage.createQuizQuestion({
    moduleId: socialEngineeringModule.id,
    question: "What is pretexting in social engineering?",
    options: [
      "Sending text messages to victims",
      "Creating a fabricated scenario to obtain information",
      "Predicting security vulnerabilities",
      "Testing security before implementing it"
    ],
    correctAnswer: 1,
    explanation: "Pretexting involves creating a convincing fabricated scenario (pretext) to trick victims into providing information. Example: impersonating IT support to get passwords.",
    orderIndex: 1,
  });

  await storage.createQuizQuestion({
    moduleId: socialEngineeringModule.id,
    question: "What is 'tailgating' in physical security?",
    options: [
      "Following someone's car too closely",
      "Following authorized personnel into restricted areas without credentials",
      "Monitoring someone's online activity",
      "Copying someone's work"
    ],
    correctAnswer: 1,
    explanation: "Tailgating is when an unauthorized person follows an authorized person into a restricted area without using their own credentials, exploiting courtesy and trust.",
    orderIndex: 2,
  });

  await storage.createQuizQuestion({
    moduleId: socialEngineeringModule.id,
    question: "Someone calls claiming to be from IT and asks for your password to 'fix a problem.' What should you do?",
    options: [
      "Give them the password since they're from IT",
      "Refuse and independently verify by calling IT through official channels",
      "Give them a fake password to test them",
      "Ask them to prove their identity by telling you your password"
    ],
    correctAnswer: 1,
    explanation: "Never give passwords over the phone. Legitimate IT never asks for passwords. Independently verify the caller's identity using official contact information, not numbers they provide.",
    orderIndex: 3,
  });

  await storage.createQuizQuestion({
    moduleId: socialEngineeringModule.id,
    question: "What is 'vishing'?",
    options: [
      "Visual phishing using fake websites",
      "Voice phishing conducted over the phone",
      "Phishing targeting VIPs",
      "Phishing using video calls"
    ],
    correctAnswer: 1,
    explanation: "Vishing (voice phishing) uses phone calls to trick victims into revealing sensitive information, often impersonating banks, government agencies, or tech support.",
    orderIndex: 4,
  });

  await storage.createQuizQuestion({
    moduleId: socialEngineeringModule.id,
    question: "An email offers you a $500 gift card for completing a short survey. This is likely:",
    options: [
      "A legitimate marketing promotion",
      "Baiting - a social engineering tactic",
      "A reward for being a loyal customer",
      "Safe if it comes from a known email address"
    ],
    correctAnswer: 1,
    explanation: "This is baiting - offering something enticing to lure victims. The 'survey' likely harvests personal information or installs malware. If it seems too good to be true, it probably is.",
    orderIndex: 5,
  });

  // Create quiz questions for Data Privacy module
  await storage.createQuizQuestion({
    moduleId: dataPrivacyModule.id,
    question: "What does PII stand for?",
    options: [
      "Personal Internet Information",
      "Private Identity Index",
      "Personally Identifiable Information",
      "Protected Individual Items"
    ],
    correctAnswer: 2,
    explanation: "PII stands for Personally Identifiable Information - any data that can be used to identify an individual, such as name, SSN, address, or email.",
    orderIndex: 1,
  });

  await storage.createQuizQuestion({
    moduleId: dataPrivacyModule.id,
    question: "Which is a data protection best practice?",
    options: [
      "Collect as much data as possible",
      "Only collect data that is necessary",
      "Share data freely within the organization",
      "Store all data indefinitely"
    ],
    correctAnswer: 1,
    explanation: "Data minimization is a key principle - only collect data that's necessary for your purpose. Less data collected means less data to protect and less risk if breached.",
    orderIndex: 2,
  });

  await storage.createQuizQuestion({
    moduleId: dataPrivacyModule.id,
    question: "What should you use to protect sensitive data during transmission over the internet?",
    options: [
      "Plain HTTP",
      "Email without encryption",
      "HTTPS/TLS encryption",
      "No protection needed"
    ],
    correctAnswer: 2,
    explanation: "Always use HTTPS/TLS encryption when transmitting sensitive data over the internet. This encrypts data in transit, preventing eavesdropping and interception.",
    orderIndex: 3,
  });

  await storage.createQuizQuestion({
    moduleId: dataPrivacyModule.id,
    question: "GDPR is a privacy regulation from:",
    options: [
      "United States",
      "European Union",
      "China",
      "United Nations"
    ],
    correctAnswer: 1,
    explanation: "GDPR (General Data Protection Regulation) is the European Union's comprehensive data privacy law that protects EU citizens' personal data and privacy rights.",
    orderIndex: 4,
  });

  await storage.createQuizQuestion({
    moduleId: dataPrivacyModule.id,
    question: "When using public WiFi, you should:",
    options: [
      "Avoid sensitive transactions entirely",
      "Use a VPN to encrypt your connection",
      "Only access HTTPS websites",
      "All of the above"
    ],
    correctAnswer: 3,
    explanation: "On public WiFi, use all precautions: avoid sensitive transactions when possible, always use a VPN to encrypt all traffic, and ensure websites use HTTPS. Public WiFi is inherently insecure.",
    orderIndex: 5,
  });

  console.log("✅ Database seeded successfully!");
  console.log(`
📊 Created:
   - ${badgesData.length} achievement badges
   - 5 learning modules
   - 25 quiz questions
  `);
}

seed()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  })
  .then(() => {
    console.log("🎉 Seeding complete!");
    process.exit(0);
  });
