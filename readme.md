# Listing out UI features

- [ ] Base URL (/home) Website UI
- [ ] Logout button, confirmation popover needed
- [ ] welcoming Toast message, on logout
- [ ] Toast message content need refactor
- [ ] Toast UI color fix
- [ ] users able to see other user typing indicator (live)
- [ ] persistent text formatting
- [ ] support of text formatting : bold, italics _etc_

# Product features

- [ ] End to end encryption with RSA/AES (to be implemented at last)
- [ ] media support
- [ ] error handling of all cases
- [ ] API optimisations
- [ ] Login, refresh tokens
- [ ] Form validations at login and register

# Features achived

- [ ] Color themes, UI accessible in 5 beatuiful color themes
- [ ] websockets working properly, with live messsage, sending and reciving
- [ ] Login and Register pages, beautified
- [ ] UI color related bugs fixed.

# Auth flow

- [ ] Store access token in memory (React state / context)
- [ ] Implement refresh token logic in backend
- [ ] Create POST /refresh API
- [ ] Backend sets refresh token as HttpOnly cookie on login
- [ ] On API 401 → call /refresh
- [ ] Retry original request if refresh succeeds
- [ ] Redirect to login if /refresh returns 401
- [ ] Call /refresh once on app startup
- [ ] Implement refresh token rotation
