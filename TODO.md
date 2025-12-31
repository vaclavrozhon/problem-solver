# Questions
- [ ] Move darkmode from footer to settings page?
- [ ] Implement `estimated_usage` for given round when starting research? (It's already present in the DB but not implemented yet.)
  - [ ] It'd be lovely to see a preview of how much the usage could cost.
- [ ] Account:
  - [ ] Remove account -> what happens with all the content? Invites redeemed by????????
- [ ] How does job concurrency scale?
- [ ] Add DB Indexes?
- [ ] are `isAuth` and `isAdmin` big slowdows?
- [ ] When switching rounds in File Explorer is it better to keep the current file open or close it when switching rounds?


# Bugs
- [ ] Failed provers bug the UI in Conversations
- [ ] User sets his own OpenRouter key, its valid, working, then removes the OpenRouter key from OpenRouter (invalidates it), then starts reserach -> CRASH.
  - [ ] If user removes OpenRouter key, remove all his queued jobs? Or prevent him from removing the key if jobs are queued?
  - [ ] Right now, if jobs are queued, key is removed, job starts executing and it crashes cuz user has no key so nothing bad happens in the end.


# Research
- [ ] Add support for PDF upload.
- [ ] Implement Web Search
- [ ] Implement Temperature setting
  - [ ] Needs to be per model **config**
- [ ] Add the option to fill in custom SYSTEM prompt for each prover/verifier/summarizer with prefilled default.
- [ ] The LLM is currently prompted to return only valid KaTeX but still sometimes returns invalid KaTeX syntax. Since it doesn’t understand what KaTeX is, it might be better to prompt it like “Return Math in LaTeX syntax. Do not use any other LaTeX features.”
  - [ ] It’s possible to render all possible LaTeX math with MathJax which is slower than KaTeX… should we just stop using KaTex and use only MathJax and deal with the few hundred milliseconds slowness? Should probably just use MathJax?

# Backend
- [ ] Add rate-limiting to API
- [ ] WRITE TESTS!!!


## Account
- [ ] Add the option to remove account
  - [ ] what happens with all the content? Invites redeemed by????????
- [ ] Can Google OAuth not give us user's name?


## Invites
- [ ] When the user removes OpenRouter key or sets new one, we should check whether he isn't overriding the key he got from our invite, if so, remove that key from openrouter.
- [ ] If a user has set their own key and then uses Invite code – check what that does. Does it go through and override the key? If so, make is so that you first need to remove a key from your account before using Invite code. The UI already reflects this model but the backend doesn't.


# Frontend
- [ ] Migrate Tanstack Router `Link` to custom link based on `Link` from `react-aria-components` 
- [ ] Add low balance indicator
- [ ] Unite how we handle modal opening/closing. So far, each modal is using a different method.
  - [ ] Also, `isDismissable` should go to `AlertDialog.Backdrop` – how to close with `ESC`?
- [ ] Rethink the frontend API model
- [ ] aAd new page that contains some details for the project that will be both accessible during logged in and logged off stage
- [ ] RESPONSIVE DESIGN
- [ ] Add pagination to tables across the app!

## Auth
- [ ] On Sign out invalidate Tanstack Query Cache (e.g. sign in/sign up another/new account cache shows previous state for a while)
- [ ] Replace Supabase SDK session getter with custom getter (all other auth is still routed through Supabase but handled only via backend)

## `/$problem_id`
- [ ] If user doesn't own the problem, hide `Run research` tab. Though in the app, you can only find problems created by you, therefore this is no harm yet. But if users share the problems, we want to hide this tab. How to do it though? It depends on Auth that takes time so we probably have to hide even the navigation and everything and then display all of that when we know the auth state.
  - [ ] Generally would like to optimize this and how it looks while navigating the different parts of problem reserach.
- [ ] Share problem button & unique permalink.
  - [ ] After implementing this, make sure that only owner's can view their own problem and all details by default. Currently, anyone with the link (who isAuth) can see anything related to the problem – shouldn't really be be a problem for now, uuids are pretty much unguessable.
- [ ] Duplicate the problem?
- [ ] Add RENAME title button
- [ ] Add DELETE problem button

### Run Research
- [ ] Right now, prover general advice text area is 1-line only. I don't bother with implementing cleaner look for longer input because I'd like to remake the advice system.
- [ ] Right now, main files are reconstructed from history by what the verfier decided – append, replace etc. This seems suboptimal and in the further if we decide to change how this appending/replacing works, it will cause trouble. Therefore, its in our best interest to also store the main files per round and not just in round 0.

### Conversations
- [ ] If REASONING in conversations contains `proofs.md` inline code the font is too big.
- [ ] Show ADVICE given to prover in conversations more (similar to Reasoning) (I want to remake the advice system for the more custom text field that allows customizing even the task later in research etc)

## `/usage`
- [ ] Add estimate for Bolzano.app usage only.
- [ ] If user has own key, that isn't provisioned by us (`key_source` is `self` not `provisioned`), add this message: "The usage includes all API costs even those made outside of bolzano.app"


## ADMIN

### `/invites`
- [ ] When you create an invite, the user redeems it. If the user then removes the key from his account, lets remove that key from our OpenRouter.
  - [ ] Similarly, if we sent invite to someone, they use it once and dont come back or for some other reason we need to delete it in our OpenRouter, then return from the api "key not found" to render it in UI instad of [provision key] not found errors in logs.
- [ ] Split the Allocated number into three? Total allocated (sum of invites limit), total spent & remaining to be spent? (Now it's just the remaining to be spent)

### Job Manager
- [ ] Add current Concurrency setting
- [ ] Show how many jobs are running and whats the limit like 3/10
- [ ] Add pagination to job manager dashboard jobs in the table for more than 10
