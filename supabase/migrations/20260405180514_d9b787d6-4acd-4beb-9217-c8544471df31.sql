UPDATE auth.identities 
SET identity_data = jsonb_set(identity_data, '{email}', '"0116458724@egark.app"')
WHERE user_id = 'ae37098f-0407-4c59-8063-88cac94bffa5' AND provider = 'email';