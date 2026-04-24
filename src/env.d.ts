/// <reference types="astro/client" />

declare global {
  namespace Astro {
    interface Locals {
      user: any
    }
  }
}

export {}