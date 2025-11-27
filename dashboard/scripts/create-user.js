require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

function generatePassword(length = 12) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

async function createUser(email, topmatePaymentId = null) {
  try {
    // Generate random password
    const password = generatePassword()
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase(),
        password_hash: passwordHash,
        topmate_payment_id: topmatePaymentId,
        subscription_status: 'active',
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') { // Unique violation
        console.error('❌ Error: User with this email already exists')
        return
      }
      throw error
    }

    console.log('✅ User created successfully!')
    console.log('=' .repeat(60))
    console.log(`📧 Email: ${email}`)
    console.log(`🔑 Password: ${password}`)
    console.log('=' .repeat(60))
    console.log('\n📋 Email this to the customer:')
    console.log(`
Subject: AutoContent Studio - Your Login Details

Hi!

Welcome to AutoContent Studio! Here are your login credentials:

🔐 Login URL: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login
📧 Email: ${email}
🔑 Temporary Password: ${password}

Please log in and configure your platforms to get started!

Best,
AutoContent Studio Team
contact@grolytix.com
`)

  } catch (error) {
    console.error('❌ Error creating user:', error.message)
  }
}

// Get email from command line
const email = process.argv[2]
const topmateId = process.argv[3]

if (!email) {
  console.log('Usage: node scripts/create-user.js <email> [topmate_payment_id]')
  console.log('Example: node scripts/create-user.js customer@example.com PMT123')
  process.exit(1)
}

// Validate email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
if (!emailRegex.test(email)) {
  console.error('❌ Invalid email format')
  process.exit(1)
}

createUser(email, topmateId).then(() => {
  console.log('\n✅ Done!')
  process.exit(0)
})
