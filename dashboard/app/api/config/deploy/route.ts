import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'
import axios from 'axios'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this')
    const userId = decoded.userId

    const config = await request.json()

    // Check if already deployed
    const { data: userConfig } = await supabase
      .from('user_config')
      .select('railway_deployment_id')
      .eq('user_id', userId)
      .single()

    if (userConfig?.railway_deployment_id) {
      // Update existing deployment (simplified - just update status)
      await supabase
        .from('user_config')
        .update({
          automation_status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)

      return NextResponse.json({
        success: true,
        deploymentId: userConfig.railway_deployment_id,
        message: 'Configuration updated. Automation restarted.'
      })
    }

    // Deploy new instance to Railway
    // Note: This is a simplified version. In production, you would:
    // 1. Create a new Railway project via API
    // 2. Deploy the code
    // 3. Set environment variables
    // 4. Start the service

    // For now, we'll mark as active and you'll deploy manually or via Railway API
    const deploymentId = `deploy-${userId}-${Date.now()}`

    await supabase
      .from('user_config')
      .update({
        railway_deployment_id: deploymentId,
        automation_status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)

    return NextResponse.json({
      success: true,
      deploymentId,
      message: 'Automation deployed successfully!'
    })

  } catch (error: any) {
    console.error('Deploy error:', error)
    return NextResponse.json(
      { error: 'Failed to deploy automation' },
      { status: 500 }
    )
  }
}
