import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://koxsxowvaoqaotaosolu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtveHN4b3d2YW9xYW90YW9zb2x1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NTg4NTQsImV4cCI6MjA5NDIzNDg1NH0.RGtEClOegPdNaoPf67Iq0GJQMYmDu24LvySpxA7as5g'
)