import validator from 'validator';

// Blocklist of popular temporary / disposable email providers
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'temp-mail.org', 'tempmail.com', '10minutemail.com', 'guerrillamail.com',
  'mailinator.com', 'sharklasers.com', 'dispostable.com', 'getnada.com',
  'trashmail.com', 'yopmail.com', 'crazymailing.com', 'throwawaymail.com',
  'maildrop.cc', 'tempinbox.com', 'minutemail.com', 'fakemailgenerator.com',
  '0815.ru', '10minutemail.net', '20mail.it', 'dropmail.me'
]);

/**
 * Validates email format and checks against disposable domain list
 */
export const validateVoterEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, message: 'Email address is required.' };
  }

  const cleanEmail = email.trim().toLowerCase();

  if (!validator.isEmail(cleanEmail)) {
    return { valid: false, message: 'Invalid email address format.' };
  }

  const domain = cleanEmail.split('@')[1];
  if (!domain || DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return { 
      valid: false, 
      message: 'Temporary / disposable email domains are blocked to prevent spam.' 
    };
  }

  return { valid: true, cleanEmail };
};

/**
 * Express Middleware for Anti-Spam Email Validation
 */
export const antiSpamVoterCheck = async (req, res, next) => {
  const { voter_email } = req.body;

  const result = validateVoterEmail(voter_email);
  if (!result.valid) {
    return res.status(400).json({ error: result.message });
  }

  req.cleanVoterEmail = result.cleanEmail;
  next();
};
