type SendSmsResult = {
  success: boolean
  preview: boolean
  sid?: string
  status?: string
  message: string
  providerCode?: number
}

function getEnv(name: string) {
  return process.env[name]?.trim()
}

export async function sendSmsWithTwilio(to: string, body: string): Promise<SendSmsResult> {
  const accountSid = getEnv('TWILIO_ACCOUNT_SID')
  const authToken = getEnv('TWILIO_AUTH_TOKEN')
  const fromNumber = getEnv('TWILIO_PHONE_NUMBER')

  if (!accountSid || !authToken || !fromNumber) {
    return {
      success: true,
      preview: true,
      message:
        'SMS provider not configured. Add Twilio environment variables to send from PropSniper.',
    }
  }

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: fromNumber,
        To: to,
        Body: body.trim(),
      }),
    }
  )

  const payload = (await response.json()) as {
    sid?: string
    status?: string
    message?: string
    code?: number
  }

  if (!response.ok) {
    return {
      success: false,
      preview: false,
      message: payload.message || 'Failed to send SMS',
      providerCode: payload.code,
    }
  }

  return {
    success: true,
    preview: false,
    sid: payload.sid,
    status: payload.status || 'sent',
    message: 'SMS sent successfully.',
  }
}
