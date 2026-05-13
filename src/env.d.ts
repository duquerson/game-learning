/// <reference types="astro/client" />
/* eslint-disable @typescript-eslint/no-unused-vars */

interface ImportMetaEnv {
  readonly PUBLIC_SUPABASE_URL: string
  readonly PUBLIC_SUPABASE_ANON_KEY: string
}

declare global {
  namespace Astro {
    interface Locals {
      user: { id: string } | null
    }
  }
}

export {}
