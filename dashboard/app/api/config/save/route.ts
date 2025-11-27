import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

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

    // Prepare platforms_enabled object
    const platformsEnabled = {
      devto: config.devtoEnabled || false,
      medium: config.mediumEnabled || false,
      twitter: config.twitterEnabled || false,
    }

    // Prepare content topics array
    const contentTopics = config.contentTopics.split(',').map((t: string) => t.trim())

    // Check if config exists
    const { data: existing } = await supabase
      .from('user_config')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (existing) {
      // Update existing config
      const { error } = await supabase
        .from('user_config')
        .update({
          openai_api_key: config.openaiApiKey,
          devto_api_key: config.devtoApiKey || null,
          medium_api_key: config.mediumApiKey || null,
          twitter_bearer_token: config.twitterBearerToken || null,
          platforms_enabled: platformsEnabled,
          content_topics: contentTopics,
          post_schedule: config.postSchedule,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)

      if (error) throw error
    } else {
      // Insert new config
      const { error } = await supabase
        .from('user_config')
        .insert({
          user_id: userId,
          openai_api_key: config.openaiApiKey,
          devto_api_key: config.devtoApiKey || null,
          medium_api_key: config.mediumApiKey || null,
          twitter_bearer_token: config.twitterBearerToken || null,
          platforms_enabled: platformsEnabled,
          content_topics: contentTopics,
          post_schedule: config.postSchedule,
        })

      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Save config error:', error)
    return NextResponse.json(
      { error: 'Failed to save configuration' },
      { status: 500 }
    )
  }
}
