# 5aab Books

## Current State
App has admin login via Internet Identity. After login, the nav shows Manage Books only if isAdmin returns true. However, no admin has been registered in the access control system, so isAdmin always returns false for a newly logged-in user.

## Requested Changes (Diff)

### Add
- Backend: claimFirstAdmin function that promotes caller to admin only if zero admins exist
- Frontend: When logged in but not admin, show Set Up Admin Access button

### Modify
- Layout.tsx: Show admin setup CTA when logged in but not admin
- useQueries.ts: Add useClaimFirstAdmin mutation

### Remove
- Nothing

## Implementation Plan
1. Add claimFirstAdmin to backend
2. Add useClaimFirstAdmin hook
3. Update Layout.tsx to show Become Admin button when logged in but isAdmin is false
