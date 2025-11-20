# `Automatic Researcher Frontend`

## Important
- The package `@vitejs/plugin-react` shall not be updated to version `> 5.0.1` or else both `@linaria/core` & `@linaria/react` will throw errors. These packages are used for easier CSS styling inside `.tsx` files (React components).
- This frontend is not responsive, i.e. might not display correctly on smaller devices.
- For the simplicity of this project, all routes require you to be logged in. If you're not logged it, the only page you can visit is `/login` where you need to log in.

## Notes
- Quote style is double (").
- If required, it's easily possible to show the time it took for each prover to complete the research.

## TODO
- [x] Problems Archive
  - [x] List all problems in chronological order (from latest to oldest).
  - [x] Highlight problems created by the current user.
  - [x] Link to selected problem in view-only mode.
- [ ] Show number of credits and show much it's gonna cost
  - Instead of showing credits, we could just show the remaining overall balance and try to estimate how much each prompt is going to cost.
  - The overall balance needs to be calculated by `initial_balance - usage` where `initial_balance` needs to be hardcoded because OpenAI doesn't support this.
  - Also, you can't really get exact values for prices. It's all just estimates. To estimate the price, throw the final prompt into tokenizer `tiktoken` which will closely give us the number of tokens and then multiply that by fixed pricing per tokens for given model.
  - [ ] In the future, have a look if e.g. Claude or Google Gemini allow these credits to be shown directly. (After we start using other models)
- [ ] Debug research part
- [x] Markdown support for research
- [ ] Have a look at the auth (seems weird)
  - [x] Make protected routes work again after migrating to `@tanstack/react-router`
  - [x] Rewrite login page
  - [x] Make sign out work
    - [ ] nope it's broken, doesn't properly redirect to `/login` page (after reload the app continues to work as expected)
  - [ ] is it necessary to store `authSession`?
  - [ ] should i make signOut only local and global? it creates a BUG if you log out on local machine, it bugs out the production & vice versa
  - [ ] Actually `AuthCallback.tsx` implementation was not *that* terrible and if auth will get buggy, consult this file from git history.
- [ ] Create Problem page
  - [ ] Create various checkboxes for what should be included in the prompt.
  - [ ] Maybe even have different prompt templates.
- [ ] How to serve static files?
  - [ ] robots.txt
- [ ] is it possible to optimize markdown rendering?
- [ ] add that option to create tags for problems like "combinatorics", "topology" for easier filtering in the problem's archive
  - [ ] maybe also add the option to search when we have a lot of them
  - [ ] the ability to filter by own
- [ ] Conversations
  - [ ] Could probably add the feature to view the prompt used to generate given conversation column
- [ ] add time out option 20 minutes per prover, also add option to configure to this time
- [ ]  button to resume the run aka rerun it from the point where it failed
	- [ ]  so probably make the whole run more segmeneted and describe each steap in more detail
- [ ] mathjax option for broken rendering (e. g. problem_id=220)
  - [ ] fix mathjax hook mounting/unmounting script
- [ ] in the future, add the paper upload/attach to problem option
- [ ] investigate verified feedback if gets fed into next provers and also display it
- [ ] add file explorer current round, current prover to url
- [ ] either start using trpc or start using tanstack-query everywhere... these two can't be combined, right?
- [ ] Render advice used in generating given Conversation column above the response.
- [ ] Add the ability to see thinking process of the llm. It should be in the metadata.
- [ ] I added ESLint and somehow configured but i don't even know if it's being used somehow. should investigate, possibly remove it, idk its weird
- [ ] Add Thinking process details for prover.